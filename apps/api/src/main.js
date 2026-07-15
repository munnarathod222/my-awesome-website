import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

import routes from './routes/index.js';
import { errorMiddleware } from './middleware/error.js';
import { globalRateLimit } from './middleware/global-rate-limit.js';
import logger from './utils/logger.js';
import { BodyLimit } from './constants/common.js';
import { startMonthEndCron } from './cron/monthEndProcessor.js';


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('trust proxy', true);

// ----------------------------------------------------
// Supabase Sync Persistence Configurations
// ----------------------------------------------------
const supabaseUrl = process.env.SUPABASE_URL || 'https://bwyashgnriarmuhosqov.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_secret_Oay759_VoPC2O_ifxAfcSA_09LkApAM';

// Token verification middleware to secure all backup API endpoints
const requireBackupAuth = (req, res, next) => {
  const token = req.headers['x-backup-token'] || req.query.token;
  const expectedToken = process.env.BACKUP_API_TOKEN || 'sb_secret_Oay759_VoPC2O_ifxAfcSA_09LkApAM';
  if (!token || token !== expectedToken) {
    logger.warn(`⚠️ Unauthorized backup API access attempt from ${req.ip}`);
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or missing backup token.' });
  }
  next();
};

let _lastHistoryBackupDate = '';

// Helper to save a daily timestamped snapshot of the database in Supabase
const uploadDailyHistoryBackup = async (fileBuffer) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (_lastHistoryBackupDate === todayStr) {
      return; // Already backed up today
    }

    logger.info(`💾 Creating daily history backup for ${todayStr} in Supabase Storage...`);
    const remotePath = `history/data_${todayStr}.db`;
    
    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/backups/${remotePath}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/octet-stream',
        'x-upsert': 'true'
      },
      body: fileBuffer
    });

    if (uploadRes.ok) {
      logger.info(`✅ Daily history backup saved: ${remotePath}`);
      _lastHistoryBackupDate = todayStr;
      
      // Prune backups older than 14 days
      try {
        await pruneOldSupabaseBackups();
      } catch (pruneErr) {
        logger.warn(`⚠️ Failed to prune old Supabase history backups: ${pruneErr.message}`);
      }
    } else {
      logger.error(`❌ Failed to save daily history backup: ${uploadRes.statusText}`);
    }
  } catch (err) {
    logger.error(`❌ Error uploading daily history backup: ${err.message}`);
  }
};

// Prunes history backups older than 14 days from Supabase storage
const pruneOldSupabaseBackups = async () => {
  try {
    const prefix = 'history';
    const allFiles = await listAllSupabaseFiles(prefix);
    const now = Date.now();
    const maxAgeMs = 14 * 24 * 60 * 60 * 1000; // 14 days
    
    for (const remotePath of allFiles) {
      const basename = path.basename(remotePath);
      const dateMatch = basename.match(/data_(\d{4}-\d{2}-\d{2})\.db/);
      if (dateMatch) {
        const fileDate = new Date(dateMatch[1]);
        if (now - fileDate.getTime() > maxAgeMs) {
          logger.info(`🗑️ Pruning old Supabase history backup: ${basename}`);
          const delRes = await fetch(`${supabaseUrl}/storage/v1/object/backups/${remotePath}`, {
            method: 'DELETE',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });
          if (!delRes.ok) {
            logger.warn(`⚠️ Failed to delete old history backup ${basename}: ${delRes.statusText}`);
          }
        }
      }
    }
  } catch (err) {
    logger.error(`❌ Error pruning old Supabase history backups: ${err.message}`);
  }
};


const downloadDatabaseFromSupabase = async (dbFilePath) => {
  try {
    logger.info(`📥 Downloading database backup from Supabase Storage...`);
    const downloadRes = await fetch(`${supabaseUrl}/storage/v1/object/authenticated/backups/data.db`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (downloadRes.ok) {
      const buffer = await downloadRes.arrayBuffer();
      // Ensure target directory exists
      fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });

      // Create an automatic backup of the existing database before overwriting it
      if (fs.existsSync(dbFilePath)) {
        try {
          const backupsDir = path.join(path.dirname(dbFilePath), 'backups');
          fs.mkdirSync(backupsDir, { recursive: true });
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const backupCopyPath = path.join(backupsDir, `data.db.auto_before_boot_${timestamp}.db`);
          fs.copyFileSync(dbFilePath, backupCopyPath);
          logger.info(`💾 Created automatic database backup copy before boot overwrite: ${path.basename(backupCopyPath)}`);
        } catch (backupErr) {
          logger.warn(`⚠️ Failed to create automatic backup copy: ${backupErr.message}`);
        }
      }

      fs.writeFileSync(dbFilePath, Buffer.from(buffer));
      logger.info(`✅ Successfully restored database from Supabase Storage!`);
      return true;
    } else {
      logger.warn(`⚠️ No pre-existing database backup found in Supabase Storage (${downloadRes.status}). Starting fresh.`);
      return false;
    }
  } catch (err) {
    logger.error(`❌ Failed to download database backup from Supabase: ${err.message}`);
    return false;
  }
};

const checkpointDatabase = (dbFilePath) => {
  try {
    if (!fs.existsSync(dbFilePath)) return;
    const { DatabaseSync } = require('node:sqlite');
    const conn = new DatabaseSync(dbFilePath);
    conn.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    conn.close();
    logger.info('✅ Successfully executed WAL checkpoint (TRUNCATE) on database.');
  } catch (err) {
    logger.warn(`⚠️ WAL checkpoint warning: ${err.message}`);
  }
};

// Core upload helper — reused by all sync strategies
const uploadDatabaseToSupabase = async (dbFilePath) => {
  try {
    checkpointDatabase(dbFilePath);
    const fileBuffer = fs.readFileSync(dbFilePath);
    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/backups/data.db`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/octet-stream',
        'x-upsert': 'true'
      },
      body: fileBuffer
    });

    if (uploadRes.ok) {
      logger.info('✅ Database backup successfully synced to Supabase Storage!');
      
      // Attempt to save a daily timestamped backup
      try {
        await uploadDailyHistoryBackup(fileBuffer);
      } catch (historyErr) {
        logger.error(`⚠️ Failed to sync daily history backup: ${historyErr.message}`);
      }
      
      return true;
    } else {
      logger.error(`❌ Failed to sync database backup to Supabase: ${uploadRes.statusText}`);
      return false;
    }
  } catch (err) {
    logger.error(`❌ Error uploading database backup to Supabase: ${err.message}`);
    return false;
  }
};

const pruneOldLocalBackups = (dbFilePath) => {
  try {
    const backupsDir = path.join(path.dirname(dbFilePath), 'backups');
    if (!fs.existsSync(backupsDir)) return;
    
    const files = fs.readdirSync(backupsDir);
    const now = Date.now();
    const maxAgeMs = 14 * 24 * 60 * 60 * 1000; // 14 days
    
    files.forEach(f => {
      const filePath = path.join(backupsDir, f);
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath);
        logger.info(`🗑️ Pruned old local backup file: ${f}`);
      }
    });
  } catch (err) {
    logger.error('Failed to prune old local backups:', err.message);
  }
};

let _syncStarted = false;
const watchAndSyncDatabase = (dbFilePath) => {
  if (_syncStarted) return; // Only register once across PocketBase restarts
  _syncStarted = true;
  let uploadTimeout = null;
  let periodicSyncInterval = null;
  const PERIODIC_SYNC_MS = 15 * 60 * 1000; // 15 minutes

  // ── Strategy 1: File-watcher (fires immediately on any DB write) ──
  try {
    fs.watch(dbFilePath, (eventType) => {
      if (eventType === 'change') {
        if (uploadTimeout) clearTimeout(uploadTimeout);
        // Debounce 10s to let PocketBase finish writing (WAL checkpoint)
        uploadTimeout = setTimeout(async () => {
          logger.info('🔄 File-watcher: database changed, syncing to Supabase...');
          await uploadDatabaseToSupabase(dbFilePath);
        }, 10000);
      }
    });
    logger.info('👁️  File-watcher sync: active (triggers within 10s of any DB write)');
  } catch (watchErr) {
    logger.warn(`⚠️  File-watcher could not be started: ${watchErr.message}. Falling back to periodic sync only.`);
  }

  // ── Strategy 2: Periodic forced sync every 2 hours (safety net) ──
  periodicSyncInterval = setInterval(async () => {
    logger.info('⏰ Periodic sync: forcing database backup to Supabase (every 2 hours)...');
    await uploadDatabaseToSupabase(dbFilePath);
  }, PERIODIC_SYNC_MS);

  // Prevent the interval from blocking Node.js exit
  if (periodicSyncInterval.unref) periodicSyncInterval.unref();

  logger.info(`⏰ Periodic sync: active (every 2 hours — next sync in ~2h)`);

  // ── Strategy 2.5: Local Rolling Auto-Backups every 12 hours ──
  const runRollingBackup = () => {
    try {
      const backupsDir = path.join(path.dirname(dbFilePath), 'backups');
      fs.mkdirSync(backupsDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupCopyPath = path.join(backupsDir, `data.db.auto_${timestamp}.db`);
      fs.copyFileSync(dbFilePath, backupCopyPath);
      logger.info(`💾 Rolling backup: saved auto local backup ${path.basename(backupCopyPath)}`);
      pruneOldLocalBackups(dbFilePath);
    } catch (err) {
      logger.error('Failed to create rolling local backup:', err.message);
    }
  };

  // Run once immediately on boot
  runRollingBackup();

  // Schedule to run every 12 hours
  const LOCAL_BACKUP_MS = 12 * 60 * 60 * 1000;
  const localBackupInterval = setInterval(runRollingBackup, LOCAL_BACKUP_MS);
  if (localBackupInterval.unref) localBackupInterval.unref();

  // ── Strategy 3: Graceful shutdown — save DB + all storage files before process exits ──
  const gracefulShutdownSync = async (signal) => {
    logger.info(`🛑 ${signal} received — performing final DB + storage sync to Supabase before shutdown...`);
    const storageDir = path.join(path.dirname(dbFilePath), 'storage');
    // Run DB and storage sync in parallel for speed
    await Promise.all([
      uploadDatabaseToSupabase(dbFilePath),
      uploadAllStorageToSupabase(storageDir)
    ]);
    logger.info('✅ Final DB + storage sync complete. Exiting.');
    process.exit(0);
  };

  // Remove any previously registered shutdown listeners to avoid duplicates
  process.removeAllListeners('SIGTERM');
  process.removeAllListeners('SIGINT');

  process.on('SIGTERM', () => gracefulShutdownSync('SIGTERM'));
  process.on('SIGINT',  () => gracefulShutdownSync('SIGINT'));
};

// ----------------------------------------------------
// Supabase File Storage Sync Engine
// ----------------------------------------------------
const downloadFileFromSupabase = async (remotePath, localFilePath) => {
  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/authenticated/backups/${remotePath}`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
      fs.writeFileSync(localFilePath, Buffer.from(buffer));
      logger.info(`✓ Restored storage file: ${path.basename(localFilePath)}`);
      return true;
    }
  } catch (err) {
    logger.error(`❌ Failed to download file ${remotePath} from Supabase: ${err.message}`);
  }
  return false;
};

// List all files recursively from Supabase (handles nested folders at any depth)
const listAllSupabaseFiles = async (prefix, allFiles = []) => {
  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/list/backups`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefix, limit: 1000, offset: 0, sortBy: { column: 'name', order: 'asc' } })
    });
    if (!res.ok) return allFiles;
    const items = await res.json();
    if (!Array.isArray(items)) return allFiles;
    for (const item of items) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        // It's a folder — recurse into it
        await listAllSupabaseFiles(itemPath, allFiles);
      } else {
        allFiles.push(itemPath);
      }
    }
  } catch (err) {
    logger.error(`❌ Error listing Supabase folder ${prefix}: ${err.message}`);
  }
  return allFiles;
};

// Download all storage files from Supabase to local directory (always overwrites with remote version)
const downloadFolderFromSupabase = async (prefix, localBaseDir) => {
  try {
    logger.info(`📥 Listing all storage files from Supabase under prefix: ${prefix}...`);
    const allFiles = await listAllSupabaseFiles(prefix);
    logger.info(`📦 Found ${allFiles.length} storage files to restore from Supabase.`);
    
    let restored = 0, skipped = 0;
    for (const remotePath of allFiles) {
      // remotePath is like "storage/collectionId/recordId/filename.jpg"
      const relativePath = remotePath.substring((prefix + '/').length);
      const localFilePath = path.join(localBaseDir, relativePath);
      
      // Get remote file metadata to compare modification time
      // Always download if local file doesn't exist; skip if sizes match (avoids redundant downloads)
      if (!fs.existsSync(localFilePath)) {
        const ok = await downloadFileFromSupabase(remotePath, localFilePath);
        if (ok) restored++;
      } else {
        skipped++;
      }
    }
    logger.info(`✅ Storage restore complete: ${restored} files restored, ${skipped} already present.`);
  } catch (err) {
    logger.error(`❌ Error restoring storage folder from Supabase: ${err.message}`);
  }
};

// Walk local directory tree and return a map of relativePath -> mtimeMs
const getLocalFilesRecursive = (dir, storageDir, files = {}) => {
  if (!fs.existsSync(dir)) return files;
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          getLocalFilesRecursive(fullPath, storageDir, files);
        } else if (stat.isFile()) {
          const relativePath = path.relative(storageDir, fullPath).replace(/\\/g, '/');
          files[relativePath] = stat.mtimeMs;
        }
      } catch (statErr) {
        // Ignore files that are deleted or inaccessible during walk
      }
    }
  } catch (readErr) {
    // Ignore directory reading errors
  }
  return files;
};

// Upload ALL local storage files to Supabase (used during graceful shutdown)
const uploadAllStorageToSupabase = async (storageDir) => {
  if (!fs.existsSync(storageDir)) return;
  const localFiles = getLocalFilesRecursive(storageDir, storageDir);
  const filePaths = Object.keys(localFiles);
  logger.info(`🔄 Graceful shutdown: syncing ${filePaths.length} storage files to Supabase...`);
  let synced = 0;
  for (const relPath of filePaths) {
    const localFilePath = path.join(storageDir, relPath);
    const remotePath = `storage/${relPath}`;
    try {
      const fileBuffer = fs.readFileSync(localFilePath);
      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/backups/${remotePath}`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'x-upsert': 'true'
        },
        body: fileBuffer
      });
      if (uploadRes.ok) synced++;
    } catch (e) {
      // best-effort, ignore errors
    }
  }
  logger.info(`✅ Graceful shutdown: synced ${synced}/${filePaths.length} storage files to Supabase.`);
};

const startStorageBackgroundSync = (storageDir) => {
  let knownFiles = {};
  
  // Initialize initial state of files
  if (fs.existsSync(storageDir)) {
    knownFiles = getLocalFilesRecursive(storageDir, storageDir);
  }
  
  setInterval(async () => {
    try {
      if (!fs.existsSync(storageDir)) return;
      const currentFiles = getLocalFilesRecursive(storageDir, storageDir);
      
      // 1. Detect new/modified files
      for (const relPath of Object.keys(currentFiles)) {
        const currentMtime = currentFiles[relPath];
        const knownMtime = knownFiles[relPath];
        
        if (knownMtime === undefined || currentMtime !== knownMtime) {
          const localFilePath = path.join(storageDir, relPath);
          const remotePath = `storage/${relPath}`;
          
          try {
            const fileBuffer = fs.readFileSync(localFilePath);
            const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/backups/${remotePath}`, {
              method: 'POST',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'x-upsert': 'true'
              },
              body: fileBuffer
            });
            if (uploadRes.ok) {
              logger.info(`🔄 Synced file upload to Supabase: ${relPath}`);
              knownFiles[relPath] = currentMtime;
            } else {
              logger.error(`❌ Failed to sync file upload to Supabase: ${relPath} (${uploadRes.statusText})`);
            }
          } catch (uploadErr) {
            logger.error(`❌ Error uploading file ${relPath} to Supabase: ${uploadErr.message}`);
          }
        }
      }
      
      // 2. Detect deleted files
      for (const relPath of Object.keys(knownFiles)) {
        if (currentFiles[relPath] === undefined) {
          const remotePath = `storage/${relPath}`;
          try {
            const delRes = await fetch(`${supabaseUrl}/storage/v1/object/backups/${remotePath}`, {
              method: 'DELETE',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
              }
            });
            if (delRes.ok) {
              logger.info(`🗑️ Synced file deletion to Supabase: ${relPath}`);
              delete knownFiles[relPath];
            } else {
              logger.error(`❌ Failed to sync file deletion to Supabase: ${relPath} (${delRes.statusText})`);
            }
          } catch (delErr) {
            logger.error(`❌ Error deleting file ${relPath} from Supabase: ${delErr.message}`);
          }
        }
      }
      
    } catch (err) {
      logger.error(`❌ Error in storage background sync: ${err.message}`);
    }
  }, 10000); // Check every 10 seconds
};

// ----------------------------------------------------
// 1. Spawning PocketBase in the Background Automatically
// ----------------------------------------------------
const runPocketBase = async () => {
  const isWin = process.platform === 'win32';
  const pbBinary = isWin ? 'pocketbase.exe' : 'pocketbase';
  
  // Find binary path (handle local development vs production layouts)
  const possiblePbDirs = [
    path.resolve(__dirname, '../../pocketbase'),
    path.resolve(__dirname, '../../../apps/pocketbase'),
    path.resolve(process.cwd(), '../pocketbase'),
    path.resolve(process.cwd(), '../../apps/pocketbase'),
    path.resolve(process.cwd(), 'apps/pocketbase'),
    path.resolve(process.cwd(), 'pocketbase')
  ];

  let pbDir = '';
  for (const dir of possiblePbDirs) {
    if (fs.existsSync(path.join(dir, pbBinary))) {
      pbDir = dir;
      break;
    }
  }

  if (!pbDir) {
    logger.error('❌ Could not locate PocketBase binary in workspace paths!');
    return;
  }

  const pbPath = path.join(pbDir, pbBinary);
  // Store SQLite database inside /data on Railway or local pb_data folder
  const dataDir = isWin ? path.join(pbDir, 'pb_data') : (fs.existsSync('/data') ? '/data' : path.join(pbDir, 'pb_data'));
  const dbFilePath = path.join(dataDir, 'data.db');
  global.dbFilePath = dbFilePath;
  const storageDir = path.join(dataDir, 'storage');

  // Sync latest database from Supabase Storage before boot (only if it doesn't exist locally)
  if (!fs.existsSync(dbFilePath)) {
    logger.info(`💾 Local database not found at ${dbFilePath}. Restoring from Supabase...`);
    await downloadDatabaseFromSupabase(dbFilePath);
  } else {
    logger.info(`💾 Local database already exists at ${dbFilePath}. Skipping Supabase download to prevent data loss.`);
  }

  // Sync latest storage files from Supabase Storage — AWAIT this before starting PocketBase
  // so files are present when the first requests arrive.
  logger.info(`📥 Restoring storage files from Supabase (waiting before PocketBase boot)...`);
  try {
    await downloadFolderFromSupabase('storage', storageDir);
  } catch (err) {
    logger.error(`❌ Error restoring storage files: ${err.message}`);
  }

  if (!isWin) {
    try {
      fs.chmodSync(pbPath, '755');
    } catch (e) {
      logger.error('Failed to set execute permissions on PocketBase binary:', e.message);
    }
  }

  // Enforce superuser existence (non-fatal — PocketBase should still start even if this fails)
  const email = process.env.PB_SUPERUSER_EMAIL || 'munnarathod222@gmail.com';
  const password = process.env.PB_SUPERUSER_PASSWORD || 'cargo123456';
  try {
    const { spawnSync } = await import('node:child_process');
    logger.info(`🔑 Upserting superuser: ${email}...`);
    const result = spawnSync(pbPath, ['superuser', 'upsert', email, password, `--dir=${dataDir}`], {
      stdio: 'pipe',
      encoding: 'utf-8',
      timeout: 15000
    });
    if (result.error) {
      logger.error(`❌ superuser upsert spawn error: ${result.error.message}`);
    } else if (result.status !== 0) {
      logger.warn(`⚠️ superuser upsert exited with code ${result.status}. stderr: ${(result.stderr || '').trim()}`);
    } else {
      logger.info(`✅ Superuser upsert successful: ${(result.stdout || '').trim()}`);
    }
  } catch (err) {
    logger.error(`❌ Failed to upsert superuser: ${err.message}`);
  }

  logger.info(`🚀 Spawning PocketBase: ${pbPath} --dir=${dataDir}`);

  const pbArgs = [
    'serve',
    '--http=127.0.0.1:8090',
    `--dir=${dataDir}`,
    '--hooksWatch=false'
  ];
  if (process.env.NODE_ENV !== 'production') {
    pbArgs.push('--dev');
  }

  const pbProcess = spawn(pbPath, pbArgs, { stdio: 'pipe' });
  global.pbProcess = pbProcess;

  // Watch and sync DB + storage (guarded — only registers once across restarts)
  watchAndSyncDatabase(dbFilePath);
  startStorageBackgroundSync(storageDir);

  pbProcess.stdout.on('data', (data) => {
    const msg = data.toString().trim();
    logger.info(`[PocketBase] ${msg}`);
    if (!global._pbLogs) global._pbLogs = [];
    global._pbLogs.push({ t: new Date().toISOString(), level: 'info', msg });
    if (global._pbLogs.length > 200) global._pbLogs.shift();
  });

  pbProcess.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    logger.error(`[PocketBase Error] ${msg}`);
    if (!global._pbLogs) global._pbLogs = [];
    global._pbLogs.push({ t: new Date().toISOString(), level: 'error', msg });
    if (global._pbLogs.length > 200) global._pbLogs.shift();
  });

  pbProcess.on('close', (code) => {
    logger.warn(`PocketBase process exited with code ${code}. Restarting in 5s...`);
    // Force a sync before restarting so we don't lose data
    const syncPromise = global.isRestoringBackup 
      ? Promise.resolve() 
      : uploadDatabaseToSupabase(dbFilePath);
      
    syncPromise.finally(() => {
      setTimeout(runPocketBase, 5000);
    });
  });
};

runPocketBase();

// Start end-of-month leaderboard + payroll cron job
startMonthEndCron();

  // Diagnostic endpoint — exposes PocketBase startup logs
  app.get('/api/pb-logs', (req, res) => {
    res.json({ logs: global._pbLogs || [], count: (global._pbLogs || []).length });
  });

  // GET /api/backup/status
  app.get('/api/backup/status', async (req, res) => {
    try {
      const resList = await fetch(`${supabaseUrl}/storage/v1/object/list/backups`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prefix: '',
          limit: 10
        })
      });
      if (!resList.ok) throw new Error('Failed to fetch from Supabase: ' + resList.statusText);
      const items = await resList.json();
      const dbFile = items.find(i => i.name === 'data.db');
      if (!dbFile) {
        return res.json({ success: false, message: 'No backup file found in storage.' });
      }
      res.json({
        success: true,
        filename: dbFile.name,
        sizeBytes: dbFile.metadata?.size || 0,
        lastModified: dbFile.updated_at || dbFile.created_at,
        id: dbFile.id
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/backup/trigger
  app.post('/api/backup/trigger', requireBackupAuth, async (req, res) => {
    try {
      if (!global.dbFilePath || !fs.existsSync(global.dbFilePath)) {
        return res.status(400).json({ success: false, error: 'Database file path not initialized or not found.' });
      }
      logger.info('Manual backup triggered by user...');

      // Save local backup copy
      try {
        const backupsDir = path.join(path.dirname(global.dbFilePath), 'backups');
        fs.mkdirSync(backupsDir, { recursive: true });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupCopyPath = path.join(backupsDir, `data.db.manual_${timestamp}.db`);
        fs.copyFileSync(global.dbFilePath, backupCopyPath);
        logger.info(`💾 Created local manual backup copy: ${path.basename(backupCopyPath)}`);
        pruneOldLocalBackups(global.dbFilePath);
      } catch (backupErr) {
        logger.warn(`⚠️ Failed to create local manual backup copy: ${backupErr.message}`);
      }

      const ok = await uploadDatabaseToSupabase(global.dbFilePath);
      if (ok) {
        res.json({ success: true, message: 'Manual database backup successfully synced to Supabase Storage!' });
      } else {
        res.status(500).json({ success: false, error: 'Failed to upload database to Supabase.' });
      }
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/backup/download
  app.get('/api/backup/download', requireBackupAuth, async (req, res) => {
    try {
      if (!global.dbFilePath || !fs.existsSync(global.dbFilePath)) {
        return res.status(404).send('Database file not found');
      }
      res.download(global.dbFilePath, 'jaibhavani_backup.db');
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  // POST /api/backup/upload
  app.post('/api/backup/upload', requireBackupAuth, multer({ storage: multer.memoryStorage() }).single('backupFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No backup file uploaded.' });
      }
      
      const fileBuffer = req.file.buffer;
      const headerString = fileBuffer.slice(0, 16).toString('utf-8');
      if (!headerString.startsWith('SQLite format 3')) {
        return res.status(400).json({ success: false, error: 'Invalid backup file format. Must be a valid SQLite database file.' });
      }
      
      if (!global.dbFilePath) {
        return res.status(500).json({ success: false, error: 'Database file path not initialized.' });
      }

      logger.info('Database restore initiated by user backup upload...');
      global.isRestoringBackup = true;

      // Overwrite local file
      fs.writeFileSync(global.dbFilePath, fileBuffer);
      logger.info('Restored database file overwritten locally.');

      // Kill the PocketBase process so it restarts with the new database
      if (global.pbProcess) {
        logger.info('Terminating running PocketBase process for restart...');
        global.pbProcess.kill();
      }

      // Sync the new database file to Supabase
      const ok = await uploadDatabaseToSupabase(global.dbFilePath);
      if (ok) {
        logger.info('Supabase storage updated with uploaded database backup.');
      } else {
        logger.warn('Failed to push restored database backup to Supabase storage.');
      }

      global.isRestoringBackup = false;
      res.json({ success: true, message: 'Database backup successfully restored and system restarted!' });
    } catch (err) {
      logger.error('Error during database restore:', err);
      global.isRestoringBackup = false;
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/backup/list-local
  app.get('/api/backup/list-local', requireBackupAuth, (req, res) => {
    try {
      if (!global.dbFilePath) {
        return res.status(400).json({ success: false, error: 'Database path not initialized' });
      }
      const dataDir = path.dirname(global.dbFilePath);
      const backupsDir = path.join(dataDir, 'backups');
      const files = [];
      
      const isAllowedFile = (name) => {
        const ext = path.extname(name).toLowerCase();
        return ['.db', '.bak', '.zip', '.sqlite', '.sqlite3', '.db3'].includes(ext) && !name.includes('-wal') && !name.includes('-shm');
      };

      if (fs.existsSync(backupsDir)) {
        fs.readdirSync(backupsDir).forEach(f => {
          if (isAllowedFile(f)) {
            const stat = fs.statSync(path.join(backupsDir, f));
            files.push({ name: f, size: stat.size, mtime: stat.mtime, type: 'pb_backup' });
          }
        });
      }
      
      if (fs.existsSync(dataDir)) {
        fs.readdirSync(dataDir).forEach(f => {
          if (isAllowedFile(f) && f !== 'data.db') {
            const stat = fs.statSync(path.join(dataDir, f));
            files.push({ name: f, size: stat.size, mtime: stat.mtime, type: 'temp_file' });
          }
        });
      }
      
      // Sort files by modification date descending (latest first)
      files.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
      
      res.json({ success: true, files });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/backup/restore-local
  app.post('/api/backup/restore-local', requireBackupAuth, express.json(), express.urlencoded({ extended: true }), async (req, res) => {
    try {
      const { filename } = req.body || req.query || {};
      if (!filename) {
        return res.status(400).json({ success: false, error: 'Filename is required' });
      }

      if (!global.dbFilePath) {
        return res.status(500).json({ success: false, error: 'Database path not initialized' });
      }

      const dataDir = path.dirname(global.dbFilePath);
      const backupsDir = path.join(dataDir, 'backups');
      let targetPath = '';

      if (fs.existsSync(path.join(backupsDir, filename))) {
        targetPath = path.join(backupsDir, filename);
      } else if (fs.existsSync(path.join(dataDir, filename))) {
        targetPath = path.join(dataDir, filename);
      } else {
        return res.status(404).json({ success: false, error: `Backup file ${filename} not found` });
      }

      logger.info(`Database restore from local file initiated: ${filename}...`);
      global.isRestoringBackup = true;

      // Kill the PocketBase process so it releases file locks
      if (global.pbProcess) {
        logger.info('Terminating running PocketBase process for restore...');
        global.pbProcess.kill();
      }

      // Check file type and restore
      if (filename.endsWith('.zip')) {
        const tempExtractDir = path.join(dataDir, 'temp_restore_extract');
        if (fs.existsSync(tempExtractDir)) {
          fs.rmSync(tempExtractDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tempExtractDir, { recursive: true });

        // Extract zip
        const isWin = process.platform === 'win32';
        const { execSync } = await import('node:child_process');
        if (isWin) {
          execSync(`powershell -Command "Expand-Archive -Path '${targetPath}' -DestinationPath '${tempExtractDir}' -Force"`);
        } else {
          execSync(`unzip -o "${targetPath}" -d "${tempExtractDir}"`);
        }

        // Find data.db in extracted files
        const possibleDbPaths = [
          path.join(tempExtractDir, 'data.db'),
          path.join(tempExtractDir, 'pb_data', 'data.db')
        ];
        let foundDbPath = '';
        for (const p of possibleDbPaths) {
          if (fs.existsSync(p)) {
            foundDbPath = p;
            break;
          }
        }

        if (!foundDbPath) {
          throw new Error('No data.db found inside backup archive');
        }

        // Copy database file
        fs.copyFileSync(foundDbPath, global.dbFilePath);
        logger.info('Restored database from zip archive.');

        // Copy storage folder if present
        const possibleStoragePaths = [
          path.join(tempExtractDir, 'storage'),
          path.join(tempExtractDir, 'pb_data', 'storage')
        ];
        let foundStoragePath = '';
        for (const p of possibleStoragePaths) {
          if (fs.existsSync(p)) {
            foundStoragePath = p;
            break;
          }
        }

        if (foundStoragePath) {
          const liveStorageDir = path.join(dataDir, 'storage');
          fs.cpSync(foundStoragePath, liveStorageDir, { recursive: true, force: true });
          logger.info('Restored storage files from zip archive.');
        }

        // Cleanup
        fs.rmSync(tempExtractDir, { recursive: true, force: true });
      } else {
        // Direct database file copy
        fs.copyFileSync(targetPath, global.dbFilePath);
        logger.info('Restored database file directly.');
      }

      // Sync the new database file to Supabase
      const ok = await uploadDatabaseToSupabase(global.dbFilePath);
      if (ok) {
        logger.info('Supabase storage updated with rolled-back database backup.');
      } else {
        logger.warn('Failed to push rolled-back database backup to Supabase storage.');
      }

      global.isRestoringBackup = false;
      res.json({ success: true, message: `System rolled back successfully to ${filename}!` });
    } catch (err) {
      logger.error('Error during local database rollback:', err);
      global.isRestoringBackup = false;
      res.status(500).json({ success: false, error: err.message });
    }
  });




// ----------------------------------------------------
// 2. HTTP Proxy Middleware for PocketBase (/hcgi/platform)
// ----------------------------------------------------
app.use('/hcgi/platform', (req, res) => {
  const targetUrl = 'http://127.0.0.1:8090' + req.url;
  const parsedUrl = new URL(targetUrl);

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname + parsedUrl.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: parsedUrl.host,
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });

  proxyReq.on('error', (err) => {
    logger.error('PocketBase Proxy Error:', err.message);
    res.status(500).json({ error: 'PocketBase database connection failed.' });
  });
});

// Process-wide handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});
  
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// Note: SIGINT and SIGTERM are handled inside watchAndSyncDatabase()
// to ensure a final database sync to Supabase before the process exits.

// Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*"],
      connectSrc: ["'self'", "http://127.0.0.1:8090", "http://localhost:3001", "https://api.render.com", "https://*.supabase.co"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(globalRateLimit);
app.use(express.json({ limit: BodyLimit }));
app.use(express.urlencoded({ extended: true, limit: BodyLimit }));

// API Router - Mount under root and prefixes to handle different environments cleanly
const apiRouter = routes();
app.use('/', apiRouter);
app.use('/hcgi/api', apiRouter);
app.use('/api', apiRouter);

// ----------------------------------------------------
// 3. Static Client Hosting (Serve compiled Vite bundle)
// ----------------------------------------------------
const possibleWebDirs = [
  path.resolve(__dirname, '../../../../dist/apps/web'),
  path.resolve(__dirname, '../../../dist/apps/web'),
  path.resolve(process.cwd(), 'dist/apps/web'),
  path.resolve(process.cwd(), 'apps/web/dist')
];

let staticPath = '';
for (const p of possibleWebDirs) {
  if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
    staticPath = p;
    break;
  }
}

if (staticPath) {
  logger.info(`📂 Serving static client assets from: ${staticPath}`);
  app.use(express.static(staticPath));
  app.get(/.*/, (req, res, next) => {
    // If it's an API route or PocketBase route, pass to next handlers
    if (req.path.startsWith('/hcgi/') || req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  logger.info(`🚀 Unified Full-Stack Server running on http://localhost:${port}`);
});

// Triggering full container redeploy to restore storage files from Supabase
export default app;