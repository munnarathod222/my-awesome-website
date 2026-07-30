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

// Enable security headers, CORS, and request body parsing early
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

const defaultOrigins = [
  'https://www.jaibhavanicargo.com',
  'https://jaibhavanicargo.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];
const corsOrigin = process.env.CORS_ORIGIN 
  ? (process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN.split(',')) 
  : defaultOrigins;

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(globalRateLimit);
app.use(express.json({ limit: BodyLimit }));
app.use(express.urlencoded({ extended: true, limit: BodyLimit }));

// ----------------------------------------------------
// Supabase Sync Persistence Configurations
// ----------------------------------------------------
// ----------------------------------------------------
// Supabase Sync Persistence Configurations
// ----------------------------------------------------
const supabaseUrl = process.env.SUPABASE_URL || 'https://bwyashgnriarmuhosqov.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET || 'sb_secret_Oay759_VoPC2O_ifxAfcSA_09LkApAM';

// Token verification middleware to secure all backup API endpoints
const requireBackupAuth = (req, res, next) => {
  const token = req.headers['x-backup-token'] || req.query.token;
  const expectedToken = process.env.BACKUP_API_TOKEN || supabaseKey;
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
    let downloadRes = await fetch(`${supabaseUrl}/storage/v1/object/authenticated/backups/data.db`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    let buffer;
    if (downloadRes.ok) {
      buffer = await downloadRes.arrayBuffer();
    }

    // Check if the downloaded database is smaller than 100KB (indicating a blank/wiped database)
    // If so, attempt to load the latest history snapshot!
    if (!buffer || buffer.byteLength < 100000) {
      logger.warn(`⚠️ Root data.db in Supabase is small/blank (${buffer ? buffer.byteLength : 0} bytes). Searching for latest history snapshot...`);
      const todayStr = new Date().toISOString().split('T')[0];
      const fallbackRes = await fetch(`${supabaseUrl}/storage/v1/object/authenticated/backups/history/data_${todayStr}.db`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (fallbackRes.ok) {
        buffer = await fallbackRes.arrayBuffer();
        logger.info(`✅ Successfully loaded today's database snapshot (${buffer.byteLength} bytes)!`);
      }
    }

    if (buffer && buffer.byteLength > 100000) {
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
      logger.info(`✅ Successfully restored database from Supabase Storage (${buffer.byteLength} bytes)!`);
      return true;
    } else {
      logger.warn(`⚠️ No valid pre-existing database backup found in Supabase Storage. Keeping local database.`);
      return false;
    }
  } catch (err) {
    logger.error(`❌ Failed to download database backup from Supabase: ${err.message}`);
    return false;
  }
};

const uploadDatabaseToSupabase = async (dbFilePath) => {
  const isSyncEnabled = process.env.NODE_ENV === 'production' || process.env.ENABLE_SUPABASE_SYNC === 'true';
  if (!isSyncEnabled) {
    logger.info('⚠️ Non-production environment. Database upload to Supabase is disabled.');
    return false;
  }
  const tempPath = `${dbFilePath}.upload_temp`;
  try {
    if (!fs.existsSync(dbFilePath)) return false;

    // Copy database file to a temp path to avoid reading a locked file or one that is being actively written to
    fs.copyFileSync(dbFilePath, tempPath);
    const fileBuffer = fs.readFileSync(tempPath);

    // Clean up temp file immediately
    try {
      fs.unlinkSync(tempPath);
    } catch (e) {
      // Ignore cleanup error
    }

    // 🛡️ ANTI-WIPEOUT SAFETY GUARD: Never upload blank or small DB files (< 100 KB)
    if (fileBuffer.byteLength < 100000) {
      logger.warn(`🛑 ANTI-WIPEOUT GUARD: Local database file is too small (${fileBuffer.byteLength} bytes). Aborting upload to Supabase.`);
      return false;
    }

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
      logger.info(`✅ Database backup (${fileBuffer.byteLength} bytes) successfully synced to Supabase Storage!`);
      
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
  const PERIODIC_SYNC_MS = 5 * 60 * 1000; // 5 minutes

  // ── Strategy 1: Directory-watcher (more reliable for SQLite WAL mode than file-watcher) ──
  try {
    const dataDir = path.dirname(dbFilePath);
    fs.watch(dataDir, (eventType, filename) => {
      // Trigger sync if the database file or its WAL/journal files change
      if (filename && (filename === 'data.db' || filename.startsWith('data.db-'))) {
        if (uploadTimeout) clearTimeout(uploadTimeout);
        // Debounce 10s to let PocketBase finish batch writes
        uploadTimeout = setTimeout(async () => {
          logger.info(`🔄 Directory-watcher: database files changed (${filename}), syncing to Supabase...`);
          await uploadDatabaseToSupabase(dbFilePath);
        }, 10000);
      }
    });
    logger.info('👁️  Directory-watcher sync: active (watches database directory changes)');
  } catch (watchErr) {
    logger.warn(`⚠️  Directory-watcher could not be started: ${watchErr.message}. Falling back to periodic sync only.`);
  }

  // ── Strategy 2: Periodic forced sync every 5 minutes (safety net) ──
  periodicSyncInterval = setInterval(async () => {
    logger.info('⏰ Periodic sync: forcing database backup to Supabase (every 5 minutes)...');
    await uploadDatabaseToSupabase(dbFilePath);
  }, PERIODIC_SYNC_MS);

  if (periodicSyncInterval.unref) periodicSyncInterval.unref();

  logger.info(`⏰ Periodic sync: active (every 5 minutes)`);

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

  // ── Strategy 3: Graceful shutdown — stop pocketbase, let WAL flush, then save DB + storage ──
  const gracefulShutdownSync = async (signal) => {
    logger.info(`🛑 ${signal} received — initiating bulletproof graceful shutdown...`);
    global.isShuttingDown = true;

    // Clear intervals and timers first
    if (periodicSyncInterval) clearInterval(periodicSyncInterval);
    if (uploadTimeout) clearTimeout(uploadTimeout);

    // Terminate PocketBase cleanly and wait for it to flush WAL
    if (global.pbProcess) {
      logger.info('🛑 Closing PocketBase process to flush WAL to data.db...');
      global.pbProcess.kill('SIGTERM');
      
      // Wait up to 3 seconds for PocketBase process to exit and close locks
      await new Promise(resolve => {
        const killTimeout = setTimeout(() => {
          logger.warn('⚠️ PocketBase close timeout reached. Forcing shutdown...');
          resolve();
        }, 3000);
        
        global.pbProcess.on('close', () => {
          clearTimeout(killTimeout);
          logger.info('✅ PocketBase exited cleanly.');
          resolve();
        });
      });
    }

    const storageDir = path.join(path.dirname(dbFilePath), 'storage');
    
    // Sync final database and files to Supabase
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

// Download all storage files from Supabase to local directory (ALWAYS overwrites — disk is ephemeral on Render)
const downloadFolderFromSupabase = async (prefix, localBaseDir) => {
  try {
    logger.info(`📥 Listing all storage files from Supabase under prefix: ${prefix}...`);
    const allFiles = await listAllSupabaseFiles(prefix);
    logger.info(`📦 Found ${allFiles.length} storage files to restore from Supabase.`);
    
    let restored = 0, skipped = 0;
    const concurrency = 15; // Download 15 files in parallel
    const allFilesCopy = [...allFiles];
    
    const downloadWorker = async () => {
      while (allFilesCopy.length > 0) {
        const remotePath = allFilesCopy.shift();
        if (!remotePath) continue;
        const relativePath = remotePath.substring((prefix + '/').length);
        const localFilePath = path.join(localBaseDir, relativePath);
        
        const ok = await downloadFileFromSupabase(remotePath, localFilePath);
        if (ok) restored++; else skipped++;
      }
    };

    const workers = [];
    for (let i = 0; i < Math.min(concurrency, allFiles.length); i++) {
      workers.push(downloadWorker());
    }
    await Promise.all(workers);
    
    logger.info(`✅ Storage restore complete: ${restored} files restored, ${skipped} failed.`);
  } catch (err) {
    logger.error(`❌ Error restoring storage folder from Supabase: ${err.message}`);
  }
};

// Immediately upload a single file to Supabase (used by PocketBase hooks on record save)
const uploadSingleFileToSupabase = async (localFilePath, storageDir) => {
  try {
    if (!fs.existsSync(localFilePath)) return;
    const relPath = path.relative(storageDir, localFilePath).replace(/\\/g, '/');
    const remotePath = `storage/${relPath}`;
    const fileBuffer = fs.readFileSync(localFilePath);
    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/backups/${remotePath}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'x-upsert': 'true',
        'Content-Type': 'application/octet-stream'
      },
      body: fileBuffer
    });
    if (uploadRes.ok) {
      logger.info(`⚡ Immediate sync: uploaded ${relPath} to Supabase.`);
    } else {
      logger.error(`❌ Immediate sync failed for ${relPath}: ${uploadRes.statusText}`);
    }
  } catch (err) {
    logger.error(`❌ Error in immediate file upload: ${err.message}`);
  }
};
global.uploadSingleFileToSupabase = uploadSingleFileToSupabase;

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

const uploadAllStorageToSupabase = async (storageDir) => {
  const isSyncEnabled = process.env.NODE_ENV === 'production' || process.env.ENABLE_SUPABASE_SYNC === 'true';
  if (!isSyncEnabled) {
    logger.info('⚠️ Non-production environment. Storage upload to Supabase is disabled.');
    return;
  }
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
  }, 3000); // Check every 3 seconds — fast enough to catch uploads before any abrupt kill
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

  // Sync latest database from Supabase Storage before boot
  const isProd = process.env.NODE_ENV === 'production' || process.env.ENABLE_SUPABASE_SYNC === 'true';
  if (isProd || !fs.existsSync(dbFilePath)) {
    logger.info(`💾 Hydrating latest database from Supabase Storage to ${dbFilePath}...`);
    await downloadDatabaseFromSupabase(dbFilePath);
  } else {
    logger.info(`💾 Local database already exists at ${dbFilePath}. Skipping Supabase download in local dev.`);
  }

  // Run SQLite schema migration on boot
  try {
    const { DatabaseSync } = await import('node:sqlite');
    const db = new DatabaseSync(dbFilePath);
    
    // 1. Add toll_deduction column to trip_logs table if not exists
    const cols = db.prepare("PRAGMA table_info(trip_logs)").all().map(c => c.name);
    if (!cols.includes('toll_deduction')) {
      logger.info("Migrating: Adding column 'toll_deduction' to 'trip_logs' table...");
      db.prepare("ALTER TABLE trip_logs ADD COLUMN toll_deduction REAL DEFAULT 0").run();
    }

    // 2. Add toll_deduction field to trip_logs schema in _collections table if not exists
    const record = db.prepare("SELECT * FROM _collections WHERE name='trip_logs'").get();
    if (record) {
      const fields = JSON.parse(record.fields);
      const hasField = fields.some(f => f.name === 'toll_deduction');
      if (!hasField) {
        logger.info("Migrating: Appending 'toll_deduction' field to PocketBase 'trip_logs' schema...");
        fields.push({
          help: "Custom toll deduction for this specific trip",
          hidden: false,
          id: "num_toll_deduct",
          max: null,
          min: null,
          name: "toll_deduction",
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: "number"
        });
        db.prepare("UPDATE _collections SET fields = ? WHERE id = ?").run(JSON.stringify(fields), record.id);
      }
      if (record.listRule !== "@request.auth.id != ''") {
        logger.info("Migrating: Updating 'trip_logs' listRule to allow Client users to list trips...");
        db.prepare("UPDATE _collections SET listRule = ? WHERE id = ?").run("@request.auth.id != ''", record.id);
      }
    }

    // 3. Migrate users schema fields to support client credentials creation
    const usersRecord = db.prepare("SELECT * FROM _collections WHERE name='users'").get();
    if (usersRecord) {
      const uFields = JSON.parse(usersRecord.fields);
      let updatedUsers = false;

      const roleF = uFields.find(f => f.name === 'role');
      if (roleF) {
        if (!roleF.values.includes('client')) {
          logger.info("Migrating: Adding 'client' role option to users...");
          roleF.values.push('client');
          updatedUsers = true;
        }
        if (!roleF.values.includes('Client')) {
          logger.info("Migrating: Adding 'Client' role option to users...");
          roleF.values.push('Client');
          updatedUsers = true;
        }
      }

      const phoneF = uFields.find(f => f.name === 'phone_number');
      if (phoneF && phoneF.required) {
        logger.info("Migrating: Making phone_number optional on users...");
        phoneF.required = false;
        updatedUsers = true;
      }

      const nameF = uFields.find(f => f.name === 'full_name');
      if (nameF && nameF.required) {
        logger.info("Migrating: Making full_name optional on users...");
        nameF.required = false;
        updatedUsers = true;
      }

      if (updatedUsers) {
        db.prepare("UPDATE _collections SET fields = ? WHERE id = ?").run(JSON.stringify(uFields), usersRecord.id);
        logger.info("Migrating: Users collection schema updated successfully!");
      }
    }

    // 4. Clients table and schema changes for portal linkage
    const clientCols = db.prepare("PRAGMA table_info(clients)").all().map(c => c.name);
    if (!clientCols.includes('portal_user_id')) {
      logger.info("Migrating: Adding column 'portal_user_id' to 'clients' table...");
      db.prepare("ALTER TABLE clients ADD COLUMN portal_user_id TEXT DEFAULT ''").run();
    }
    if (!clientCols.includes('portal_enabled')) {
      logger.info("Migrating: Adding column 'portal_enabled' to 'clients' table...");
      db.prepare("ALTER TABLE clients ADD COLUMN portal_enabled INTEGER DEFAULT 0").run();
    }

    const uCols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
    if (!uCols.includes('client_id')) {
      logger.info("Migrating: Adding column 'client_id' to 'users' table...");
      db.prepare("ALTER TABLE users ADD COLUMN client_id TEXT DEFAULT ''").run();
    }

    const clientsRecord = db.prepare("SELECT * FROM _collections WHERE name='clients'").get();
    if (clientsRecord) {
      const cFields = JSON.parse(clientsRecord.fields);
      let updatedClients = false;

      if (!cFields.some(f => f.name === 'portal_user_id')) {
        logger.info("Migrating: Adding 'portal_user_id' field to clients schema...");
        cFields.push({
          cascadeDelete: false,
          collectionId: "_pb_users_auth_",
          help: "Linked portal user account ID",
          hidden: false,
          id: "rel_portal_user",
          maxSelect: 1,
          minSelect: 0,
          name: "portal_user_id",
          presentable: false,
          required: false,
          system: false,
          type: "relation"
        });
        updatedClients = true;
      }

      if (!cFields.some(f => f.name === 'portal_enabled')) {
        logger.info("Migrating: Adding 'portal_enabled' field to clients schema...");
        cFields.push({
          help: "Whether client portal access is enabled",
          hidden: false,
          id: "bool_portal_enabled",
          name: "portal_enabled",
          presentable: false,
          required: false,
          system: false,
          type: "bool"
        });
        updatedClients = true;
      }

      if (updatedClients) {
        db.prepare("UPDATE _collections SET fields = ? WHERE id = ?").run(JSON.stringify(cFields), clientsRecord.id);
        logger.info("Migrating: Clients collection schema updated successfully!");
      }
    }

    // Refresh usersRecord reference to check if client_id is present
    const usersRecordFresh = db.prepare("SELECT * FROM _collections WHERE name='users'").get();
    if (usersRecordFresh) {
      const uFieldsFresh = JSON.parse(usersRecordFresh.fields);
      if (!uFieldsFresh.some(f => f.name === 'client_id')) {
        logger.info("Migrating: Adding 'client_id' field to users schema...");
        uFieldsFresh.push({
          cascadeDelete: false,
          collectionId: "pbc_1114538649",
          help: "Linked client record ID",
          hidden: false,
          id: "rel_client_id",
          maxSelect: 1,
          minSelect: 0,
          name: "client_id",
          presentable: false,
          required: false,
          system: false,
          type: "relation"
        });
        db.prepare("UPDATE _collections SET fields = ? WHERE id = ?").run(JSON.stringify(uFieldsFresh), usersRecordFresh.id);
        logger.info("Migrating: Users collection linkage schema updated successfully!");
      }
    }

    // 5. Contacts collection schema migration for sub-categories and warehouse fields
    const contactCols = db.prepare("PRAGMA table_info(contacts)").all().map(c => c.name);
    if (!contactCols.includes('warehouse_name')) {
      logger.info("Migrating: Adding column 'warehouse_name' to 'contacts' table...");
      db.prepare("ALTER TABLE contacts ADD COLUMN warehouse_name TEXT DEFAULT ''").run();
    }
    if (!contactCols.includes('designation')) {
      logger.info("Migrating: Adding column 'designation' to 'contacts' table...");
      db.prepare("ALTER TABLE contacts ADD COLUMN designation TEXT DEFAULT ''").run();
    }
    if (!contactCols.includes('client_name')) {
      logger.info("Migrating: Adding column 'client_name' to 'contacts' table...");
      db.prepare("ALTER TABLE contacts ADD COLUMN client_name TEXT DEFAULT ''").run();
    }

    const contactsRecordBoot = db.prepare("SELECT * FROM _collections WHERE name='contacts'").get();
    if (contactsRecordBoot) {
      const cFieldsBoot = JSON.parse(contactsRecordBoot.fields);
      const ctField = cFieldsBoot.find(f => f.name === 'contact_type');
      if (ctField && ctField.type === 'select') {
        const newVals = [
          'Client', 'Driver', 'Employee', 'Mechanic', 'Showroom', 
          'Spare Parts', 'Vendor', 'Electrician', 'Puncture Shop',
          'Other', 'Bodywork / Welding', 'Crane / Tow Truck', 'Hydraulics', 'Plastics', 'Supervisor', 'Manager',
          'RTO Agent', 'Washing Centre', 'Warehouse', 'Corporate'
        ];
        let updatedContacts = false;
        for (const val of newVals) {
          if (!ctField.values.includes(val)) {
            ctField.values.push(val);
            updatedContacts = true;
          }
        }

        if (!cFieldsBoot.some(f => f.name === 'warehouse_name')) {
          cFieldsBoot.push({ name: 'warehouse_name', type: 'text', required: false, system: false, hidden: false, id: 'wh_name_field' });
          updatedContacts = true;
        }
        if (!cFieldsBoot.some(f => f.name === 'designation')) {
          cFieldsBoot.push({ name: 'designation', type: 'text', required: false, system: false, hidden: false, id: 'desig_field' });
          updatedContacts = true;
        }
        if (!cFieldsBoot.some(f => f.name === 'client_name')) {
          cFieldsBoot.push({ name: 'client_name', type: 'text', required: false, system: false, hidden: false, id: 'client_name_field' });
          updatedContacts = true;
        }

        if (updatedContacts) {
          db.prepare("UPDATE _collections SET fields = ? WHERE id = ?").run(JSON.stringify(cFieldsBoot), contactsRecordBoot.id);
          logger.info("Migrating: Contacts collection contact_type and warehouse fields updated successfully!");
        }
      }
    }

    // 6. Company settings schema migration for bank and vault details
    const csCols = db.prepare("PRAGMA table_info(company_settings)").all().map(c => c.name);
    const bankCols = ['bank_name', 'account_name', 'account_number', 'ifsc_code', 'branch_name', 'pan_number', 'tan_number', 'cin_number', 'msme_number', 'udyam_number', 'company_docs_json'];
    for (const col of bankCols) {
      if (!csCols.includes(col)) {
        logger.info(`Migrating: Adding column '${col}' to 'company_settings' table...`);
        db.prepare(`ALTER TABLE company_settings ADD COLUMN ${col} TEXT DEFAULT ''`).run();
      }
    }

    const csRecordBoot = db.prepare("SELECT * FROM _collections WHERE name='company_settings'").get();
    if (csRecordBoot) {
      const csFieldsBoot = JSON.parse(csRecordBoot.fields);
      let updatedCS = false;
      for (const col of bankCols) {
        if (!csFieldsBoot.some(f => f.name === col)) {
          csFieldsBoot.push({ name: col, type: 'text', required: false, system: false, hidden: false, id: `cs_${col}_field` });
          updatedCS = true;
        }
      }
      if (updatedCS) {
        db.prepare("UPDATE _collections SET fields = ? WHERE id = ?").run(JSON.stringify(csFieldsBoot), csRecordBoot.id);
        logger.info("Migrating: Company settings bank detail fields updated successfully!");
      }
    }

    // 7. Employees schema migration for payroll cycle fields
    const empCols = db.prepare("PRAGMA table_info(employees)").all().map(c => c.name);
    const empCycleCols = [
      { name: 'payroll_cycle_start_day', type: 'INTEGER DEFAULT 1' },
      { name: 'payroll_cycle_end_day', type: 'INTEGER DEFAULT 30' },
      { name: 'salary_disbursement_day', type: 'INTEGER DEFAULT 10' }
    ];
    for (const item of empCycleCols) {
      if (!empCols.includes(item.name)) {
        logger.info(`Migrating: Adding column '${item.name}' to 'employees' table...`);
        db.prepare(`ALTER TABLE employees ADD COLUMN ${item.name} ${item.type}`).run();
      }
    }

    const empRecordBoot = db.prepare("SELECT * FROM _collections WHERE name='employees'").get();
    if (empRecordBoot) {
      const empFieldsBoot = JSON.parse(empRecordBoot.fields);
      let updatedEmp = false;
      for (const item of empCycleCols) {
        if (!empFieldsBoot.some(f => f.name === item.name)) {
          empFieldsBoot.push({ name: item.name, type: 'number', required: false, system: false, hidden: false, id: `emp_${item.name}_field` });
          updatedEmp = true;
        }
      }
      const routesField = empFieldsBoot.find(f => f.name === 'assigned_routes');
      if (routesField && routesField.maxSelect !== 99) {
        routesField.maxSelect = 99;
        updatedEmp = true;
      }
      if (updatedEmp) {
        db.prepare("UPDATE _collections SET fields = ? WHERE id = ?").run(JSON.stringify(empFieldsBoot), empRecordBoot.id);
        logger.info("Migrating: Employee payroll cycle & multi-route assignment fields updated in PocketBase schema!");
      }
    }
  } catch (migrationErr) {
    logger.error(`❌ Migration failed during boot: ${migrationErr.message}`);
  }

  // Sync latest storage files from Supabase Storage — Skipped on boot for instant startup speed!
  // Files are instead downloaded on-demand (lazily) as they are requested by users.
  logger.info(`📥 Lazy-download system active. Skipping boot-time storage download for light speed startup.`);

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
  const isSyncEnabled = process.env.NODE_ENV === 'production' || process.env.ENABLE_SUPABASE_SYNC === 'true';
  if (isSyncEnabled) {
    watchAndSyncDatabase(dbFilePath);
    startStorageBackgroundSync(storageDir);
  } else {
    logger.info('⚠️ Non-production environment. Supabase automatic background sync is disabled.');
  }

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
    logger.warn(`PocketBase process exited with code ${code}.`);
    if (global.isShuttingDown) {
      logger.info('PocketBase closed during shutdown. Skipping restart.');
      return;
    }
    logger.warn('Restarting in 5s...');
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
  app.get('/api/pb-logs', requireBackupAuth, (req, res) => {
    res.json({ logs: global._pbLogs || [], count: (global._pbLogs || []).length });
  });

  // Diagnostic endpoint — inspects any file or directory on the server
  app.get('/api/inspect-file', requireBackupAuth, (req, res) => {
    const filePath = req.query.path || '/opt/render/project/src/apps/api/pb.js';
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `File not found: ${filePath}` });
    }
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        const files = fs.readdirSync(filePath);
        return res.json({ path: filePath, isDirectory: true, files });
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      res.json({ path: filePath, content });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
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

      const isAsync = req.query.async === 'true';
      if (isAsync) {
        res.json({ success: true, message: 'Database backup triggered in background.' });
        setTimeout(async () => {
          logger.info('🔄 Real-time sync: database backup triggered in background...');
          await uploadDatabaseToSupabase(global.dbFilePath);
        }, 100);
        return;
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
      if (process.env.ENABLE_DB_RESTORE !== 'true') {
        return res.status(403).json({ success: false, error: 'Database restore is disabled on this server to prevent accidental data loss.' });
      }
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
app.use('/hcgi/platform', async (req, res) => {
  const targetUrl = 'http://127.0.0.1:8090' + req.url;
  const parsedUrl = new URL(targetUrl);

  // ── Lazy File Downloader Interceptor ──────────────────────────────
  // Intercept PocketBase file requests: /api/files/:collection/:recordId/:filename
  const parts = parsedUrl.pathname.split('/');
  if (parts[1] === 'api' && parts[2] === 'files' && parts.length >= 6) {
    const collectionId = parts[3];
    const recordId = parts[4];
    const filename = parts[5];
    
    // Construct local path: pb_data/storage/:collectionId/:recordId/:filename
    const localFilePath = path.join(global.dbFilePath ? path.dirname(global.dbFilePath) : './pb_data', 'storage', collectionId, recordId, filename);
    
    if (!fs.existsSync(localFilePath)) {
      logger.info(`🔍 Lazy-downloading missing file on-demand: ${collectionId}/${recordId}/${filename}`);
      const remotePath = `storage/${collectionId}/${recordId}/${filename}`;
      // Await downloading file from Supabase before proxying so PocketBase can serve it from disk
      await downloadFileFromSupabase(remotePath, localFilePath);
    }
  }
  // ──────────────────────────────────────────────────────────────────

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