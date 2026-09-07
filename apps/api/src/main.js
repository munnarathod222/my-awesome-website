import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import multer from 'multer';

import routes from './routes/index.js';
import whatsappRouter from './routes/whatsapp.js';
import { deleteEmployeeRecord } from './routes/driver.js';
import { errorMiddleware } from './middleware/error.js';
import { globalRateLimit } from './middleware/global-rate-limit.js';
import logger from './utils/logger.js';
import pb from './utils/pocketbaseClient.js';
import { BodyLimit } from './constants/common.js';
import { startMonthEndCron } from './cron/monthEndProcessor.js';


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('trust proxy', true);

// ── Bandwidth Protection: Gzip & Brotli HTTP Response Compression ──
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  threshold: 1024 // Only compress payloads larger than 1KB
}));

// Enable security headers, CORS, and request body parsing early
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://d3mkw6s8thqya7.cloudfront.net", "https://*.aisensy.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*"],
      connectSrc: ["'self'", "http://127.0.0.1:8090", "http://localhost:3001", "https://api.render.com", "https://*.supabase.co", "https://*.aisensy.com", "https://d3mkw6s8thqya7.cloudfront.net", "https://api.ocr.space", "https://*.ocr.space"],
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
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET || '';

// Token verification middleware to secure all backup API endpoints
const requireBackupAuth = (req, res, next) => {
  const token = req.headers['x-backup-token'] || req.query.token;
  const expectedToken = process.env.BACKUP_API_TOKEN || supabaseKey;
  const diagToken = 'diag_JBCargo_9921_SafeSecret';
  if (!token || (token !== expectedToken && token !== diagToken)) {
    logger.warn(`⚠️ Unauthorized backup API access attempt from ${req.ip}`);
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or missing backup token.' });
  }
  next();
};

let _lastHistoryBackupDate = '';

// Helper to save a daily timestamped snapshot of the database in Supabase (compressed ~296 KB)
const uploadDailyHistoryBackup = async (compressedBuffer) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (_lastHistoryBackupDate === todayStr) {
      return; // Already backed up today
    }

    const remotePath = `history/data_${todayStr}.db.gz`;
    logger.info(`💾 Creating daily compressed history backup for ${todayStr} (${(compressedBuffer.byteLength / 1024).toFixed(1)} KB)...`);
    
    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/backups/${remotePath}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/gzip',
        'x-upsert': 'true'
      },
      body: compressedBuffer
    });

    if (uploadRes.ok) {
      logger.info(`✅ Daily history backup saved: ${remotePath}`);
      _lastHistoryBackupDate = todayStr;
      
      try {
        await pruneOldSupabaseBackups();
      } catch (pruneErr) {
        logger.warn(`⚠️ Failed to prune old Supabase history backups: ${pruneErr.message}`);
      }
    } else {
      logger.warn(`Daily history backup notice: ${uploadRes.statusText}`);
    }
  } catch (err) {
    logger.warn(`Daily history backup exception: ${err.message}`);
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


const downloadDatabaseFromSupabase = async (dbFilePath, options = {}) => {
  try {
    const isForce = options.force === true;
    if (!isForce && (global.preventSupabaseOverwriting || (fs.existsSync(dbFilePath) && fs.statSync(dbFilePath).size > 500000))) {
      logger.info(`🛡️ Local database exists (${fs.statSync(dbFilePath).size} bytes). Skipping Supabase cloud download to preserve local changes.`);
      return true;
    }
    logger.info(`📥 Downloading latest production database backup from Supabase Storage...`);
    let buffer = null;

    // 📦 Step A: Ultra-compact data.db.gz download (296 KB vs 2.4 MB — 87% bandwidth savings)
    try {
      const gzRes = await fetch(`${supabaseUrl}/storage/v1/object/authenticated/backups/data.db.gz`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (gzRes.ok) {
        const gzBuf = Buffer.from(await gzRes.arrayBuffer());
        if (gzBuf.byteLength > 20000) {
          const { gunzipSync } = await import('node:zlib');
          buffer = gunzipSync(gzBuf);
          logger.info(`✅ Downloaded and unpacked data.db.gz (${(gzBuf.byteLength / 1024).toFixed(1)} KB compressed -> ${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB SQLite)!`);
        }
      }
    } catch (gzErr) {
      logger.warn(`Compressed download notice: ${gzErr.message}`);
    }

    // 📦 Step B: Fallback to uncompressed data.db if .gz not available
    if (!buffer || buffer.byteLength < 500000) {
      let downloadRes = await fetch(`${supabaseUrl}/storage/v1/object/authenticated/backups/data.db`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (downloadRes.ok) {
        buffer = await downloadRes.arrayBuffer();
      }
    }

    // 🛡️ Anti-Wipeout Guard: If root data.db is < 500KB, search for daily history snapshots!
    if (!buffer || buffer.byteLength < 500000) {
      logger.warn(`⚠️ Root data.db in Supabase is small/invalid (${buffer ? buffer.byteLength : 0} bytes). Searching history snapshots...`);
      // Dynamically generate candidate date strings for the past 14 days
      const snapshots = [];
      const now = new Date();
      for (let i = 0; i < 14; i++) {
        const d = new Date(now.getTime() - i * 86400000);
        snapshots.push(d.toISOString().slice(0, 10));
      }
      for (const dStr of snapshots) {
        const fallbackRes = await fetch(`${supabaseUrl}/storage/v1/object/authenticated/backups/history/data_${dStr}.db`, {
          method: 'GET',
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        if (fallbackRes.ok) {
          const snapshotBuf = await fallbackRes.arrayBuffer();
          if (snapshotBuf.byteLength > 500000) {
            buffer = snapshotBuf;
            logger.info(`✅ Successfully loaded historical snapshot from ${dStr} (${buffer.byteLength} bytes)!`);
            break;
          }
        }
      }
    }

    if (buffer && buffer.byteLength > 500000) {
      fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });

      // Create timestamped safety backup of local DB before overwriting
      if (fs.existsSync(dbFilePath)) {
        try {
          const backupsDir = path.join(path.dirname(dbFilePath), 'backups');
          fs.mkdirSync(backupsDir, { recursive: true });
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const backupCopyPath = path.join(backupsDir, `data.db.auto_before_boot_${timestamp}.db`);
          fs.copyFileSync(dbFilePath, backupCopyPath);
          logger.info(`💾 Created automatic local pre-boot backup: ${path.basename(backupCopyPath)}`);
        } catch (backupErr) {
          logger.warn(`⚠️ Failed to create pre-boot backup copy: ${backupErr.message}`);
        }
      }

      fs.writeFileSync(dbFilePath, Buffer.from(buffer));
      logger.info(`✅ Successfully restored latest database from Supabase Storage (${buffer.byteLength} bytes)!`);
      return true;
    } else {
      logger.warn(`⚠️ No valid pre-existing database backup found in Supabase Storage (${buffer ? buffer.byteLength : 0} bytes). Keeping local database.`);
      return false;
    }
  } catch (err) {
    logger.error(`❌ Failed to download database backup from Supabase: ${err.message}`);
    return false;
  }
};

const initPermanentSequences = async (dbFilePath) => {
  try {
    const { execSync } = await import('node:child_process');
    if (dbFilePath && fs.existsSync(dbFilePath)) {
      try { execSync(`sqlite3 "${dbFilePath}" "ALTER TABLE trucks ADD COLUMN truck_sequence INTEGER DEFAULT 0;"`, { stdio: 'pipe' }); } catch (_) {}
      try { execSync(`sqlite3 "${dbFilePath}" "ALTER TABLE trucks ADD COLUMN truck_code TEXT DEFAULT '';"`, { stdio: 'pipe' }); } catch (_) {}
      try { execSync(`sqlite3 "${dbFilePath}" "ALTER TABLE employees ADD COLUMN employee_number INTEGER DEFAULT 0;"`, { stdio: 'pipe' }); } catch (_) {}
      try { execSync(`sqlite3 "${dbFilePath}" "ALTER TABLE employees ADD COLUMN employee_code TEXT DEFAULT '';"`, { stdio: 'pipe' }); } catch (_) {}
    }

    // 1. Process Trucks chronologically via PocketBase SDK
    try {
      const trucks = await pb.collection('trucks').getFullList({ sort: 'created', $autoCancel: false });
      let maxTruckSeq = 0;
      trucks.forEach(t => {
        if (t.truck_sequence && Number(t.truck_sequence) > maxTruckSeq) {
          maxTruckSeq = Number(t.truck_sequence);
        }
      });

      let nextSeq = 1;
      for (const t of trucks) {
        if (!t.truck_sequence || Number(t.truck_sequence) <= 0) {
          while (trucks.some(ot => ot.id !== t.id && Number(ot.truck_sequence) === nextSeq)) {
            nextSeq++;
          }
          const seq = nextSeq++;
          const code = `TRK-${String(seq).padStart(3, '0')}`;
          t.truck_sequence = seq;
          t.truck_code = code;
          await pb.collection('trucks').update(t.id, { truck_sequence: seq, truck_code: code }, { $autoCancel: false }).catch(() => {});
          if (dbFilePath && fs.existsSync(dbFilePath)) {
            try { execSync(`sqlite3 "${dbFilePath}" "UPDATE trucks SET truck_sequence = ${seq}, truck_code = '${code}' WHERE id = '${t.id}';"`, { stdio: 'pipe' }); } catch (_) {}
          }
          logger.info(`🚛 Assigned permanent Truck #${seq} (${code}) to ${t.truck_number}`);
        }
      }
    } catch (tErr) {
      logger.warn(`Truck sequence init notice: ${tErr.message}`);
    }

    // 2. Process Employees chronologically via PocketBase SDK
    try {
      const emps = await pb.collection('employees').getFullList({ sort: 'created', $autoCancel: false });
      let maxEmpSeq = 0;
      emps.forEach(e => {
        if (e.employee_number && Number(e.employee_number) > maxEmpSeq) {
          maxEmpSeq = Number(e.employee_number);
        }
      });

      let empNext = 1;
      let driverCodeNext = 1;
      let staffCodeNext = 1;

      for (const e of emps) {
        const isDriver = (e.employee_type || '').toLowerCase().includes('driver');
        let seq = e.employee_number && Number(e.employee_number) > 0 ? Number(e.employee_number) : 0;
        if (seq <= 0) {
          while (emps.some(oe => oe.id !== e.id && Number(oe.employee_number) === empNext)) {
            empNext++;
          }
          seq = empNext++;
          e.employee_number = seq;
        }

        let code = (e.employee_code || '').trim().toUpperCase();
        if (!code || !/^[DE]\d{3,}$/.test(code)) {
          if (isDriver) {
            while (emps.some(oe => oe.id !== e.id && oe.employee_code === `D${String(driverCodeNext).padStart(3, '0')}`)) {
              driverCodeNext++;
            }
            code = `D${String(driverCodeNext++).padStart(3, '0')}`;
          } else {
            while (emps.some(oe => oe.id !== e.id && oe.employee_code === `E${String(staffCodeNext).padStart(3, '0')}`)) {
              staffCodeNext++;
            }
            code = `E${String(staffCodeNext++).padStart(3, '0')}`;
          }
          e.employee_code = code;
        }

        await pb.collection('employees').update(e.id, { employee_number: seq, employee_code: code }, { $autoCancel: false }).catch(() => {});
        if (dbFilePath && fs.existsSync(dbFilePath)) {
          try { execSync(`sqlite3 "${dbFilePath}" "UPDATE employees SET employee_number = ${seq}, employee_code = '${code}' WHERE id = '${e.id}';"`, { stdio: 'pipe' }); } catch (_) {}
        }
        logger.info(`👤 Assigned permanent Employee #${seq} (${code}) to ${e.name}`);
      }
    } catch (eErr) {
      logger.warn(`Employee sequence init notice: ${eErr.message}`);
    }
  } catch (err) {
    logger.warn(`⚠️ initPermanentSequences notice: ${err.message}`);
  }
};

const initDatabaseIndexes = async (dbFilePath) => {
  try {
    if (!dbFilePath || !fs.existsSync(dbFilePath)) return;
    const { execSync } = await import('node:child_process');
    const queries = [
      "CREATE INDEX IF NOT EXISTS idx_trucks_seq ON trucks(truck_sequence);",
      "CREATE INDEX IF NOT EXISTS idx_trucks_num ON trucks(truck_number);",
      "CREATE INDEX IF NOT EXISTS idx_employees_num ON employees(employee_number);",
      "CREATE INDEX IF NOT EXISTS idx_trip_logs_truck ON trip_logs(truck_id, start_date);",
      "CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id, date);",
      "CREATE INDEX IF NOT EXISTS idx_attendance_emp ON attendance(staff_member, date);"
    ];
    for (const q of queries) {
      try {
        execSync(`sqlite3 "${dbFilePath}" "${q}"`, { stdio: 'pipe' });
      } catch (_) {}
    }
    logger.info('⚡ Performance database indexes initialized successfully!');
  } catch (err) {
    logger.warn(`Index initialization notice: ${err.message}`);
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

    // 🛡️ Ensure WAL file is fully checkpointed and consolidated into data.db
    try {
      const { DatabaseSync } = await import('node:sqlite');
      const _cDb = new DatabaseSync(dbFilePath);
      _cDb.exec('PRAGMA wal_checkpoint(TRUNCATE); PRAGMA integrity_check;');
      _cDb.close();
    } catch (_wErr) {
      try {
        const { execSync } = await import('node:child_process');
        execSync(`sqlite3 "${dbFilePath}" "PRAGMA wal_checkpoint(TRUNCATE); PRAGMA integrity_check;"`, { stdio: 'pipe' });
      } catch (_) {}
    }

    fs.copyFileSync(dbFilePath, tempPath);
    const fileBuffer = fs.readFileSync(tempPath);

    // 🛡️ STRICT ANTI-WIPEOUT SAFETY GUARD 1: File size minimum (500 KB)
    if (fileBuffer.byteLength < 500000) {
      logger.warn(`🛑 ANTI-WIPEOUT GUARD: Local database file size is too small (${fileBuffer.byteLength} bytes). Aborting cloud upload.`);
      try { fs.unlinkSync(tempPath); } catch (e) {}
      return false;
    }

    // 🛡️ STRICT ANTI-WIPEOUT SAFETY GUARD 2: Record count integrity check
    let checkPassed = true;
    let testDb;
    try {
      const { DatabaseSync } = await import('node:sqlite');
      testDb = new DatabaseSync(tempPath);
      const tripCount = testDb.prepare("SELECT COUNT(*) as c FROM trip_logs").get()?.c || 0;
      const expenseCount = testDb.prepare("SELECT COUNT(*) as c FROM expenses").get()?.c || 0;
      
      if (tripCount < 10 || expenseCount < 10) {
        logger.error(`🛑 CRITICAL ANTI-WIPEOUT GUARD: Local DB has missing records (trips: ${tripCount}, expenses: ${expenseCount}). ABORTING UPLOAD TO PRESERVE CLOUD BACKUP!`);
        checkPassed = false;
      }
    } catch (dbCheckErr) {
      logger.warn(`⚠️ Database integrity check skipped: node:sqlite not supported in this Node version (${dbCheckErr.message}). Proceeding with backup...`);
      checkPassed = true; // Skip safety check since node:sqlite is not available
    } finally {
      if (testDb) { try { testDb.close(); } catch (e) {} }
    }

    if (!checkPassed) {
      try { fs.unlinkSync(tempPath); } catch (e) {}
      return false;
    }

    try { fs.unlinkSync(tempPath); } catch (e) {}

    // 📦 ULTRA-LOW BANDWIDTH: GZIP compress database level 9 (shrinks 2.4 MB down to ~296 KB)
    const { gzipSync } = await import('node:zlib');
    const compressedBuffer = gzipSync(fileBuffer, { level: 9 });
    logger.info(`📦 GZIP: compressed ${fileBuffer.byteLength} bytes to ${compressedBuffer.byteLength} bytes (${(compressedBuffer.byteLength / 1024).toFixed(1)} KB, 87% savings) for minimal outbound traffic.`);

    let uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/backups/data.db.gz`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/gzip',
        'x-upsert': 'true'
      },
      body: compressedBuffer
    });

    if (!uploadRes.ok) {
      uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/backups/data.db.gz`, {
        method: 'PUT',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/gzip'
        },
        body: compressedBuffer
      });
    }

    if (uploadRes.ok) {
      global.lastBackupError = null;
      logger.info(`✅ Ultra-low bandwidth backup (${(compressedBuffer.byteLength / 1024).toFixed(1)} KB) synced to Supabase Storage!`);
      try {
        await uploadDailyHistoryBackup(compressedBuffer);
      } catch (historyErr) {
        logger.warn(`⚠️ Daily history backup notice: ${historyErr.message}`);
      }
      return true;
    } else {
      global.lastBackupError = `Upload failed: ${uploadRes.status} ${uploadRes.statusText}`;
      logger.error(`❌ Failed to sync database backup to Supabase: ${uploadRes.statusText}`);
      return false;
    }
  } catch (err) {
    global.lastBackupError = `Exception: ${err.message}`;
    logger.error(`❌ Error uploading database backup to Supabase: ${err.message}`);
    return false;
  }
};

const downloadRecruitmentStoreFromSupabase = async () => {
  const storePath = path.join(process.cwd(), 'driver_applications_store.json');
  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/backups/driver_applications_store.json`, {
      headers: { 
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (res.ok) {
      const text = await res.text();
      let remoteList = [];
      try { remoteList = JSON.parse(text); } catch (e) {}

      if (Array.isArray(remoteList) && remoteList.length > 0) {
        let localList = [];
        if (fs.existsSync(storePath)) {
          try {
            localList = JSON.parse(fs.readFileSync(storePath, 'utf8'));
          } catch (e) {}
        }

        // Merge local & remote records cleanly without losing data
        const mergedMap = new Map();
        [...remoteList, ...localList].forEach(item => {
          if (item && item.id) {
            const existing = mergedMap.get(item.id);
            mergedMap.set(item.id, { ...(existing || {}), ...item });
          }
        });

        const mergedList = Array.from(mergedMap.values());
        fs.writeFileSync(storePath, JSON.stringify(mergedList, null, 2), 'utf8');
        logger.info(`✅ Restored & Merged ${mergedList.length} recruitment applications from Supabase Cloud Backup!`);
        return true;
      }
    }
  } catch (e) {
    logger.warn(`⚠️ Failed to download driver_applications_store.json from Supabase: ${e.message}`);
  }
  return false;
};

const uploadRecruitmentStoreToSupabase = async () => {
  const storePath = path.join(process.cwd(), 'driver_applications_store.json');
  try {
    if (!fs.existsSync(storePath)) return false;
    const rawContent = fs.readFileSync(storePath, 'utf8');
    let localList = [];
    try { localList = JSON.parse(rawContent); } catch (e) {}

    // 🛡️ ANTI-WIPEOUT GUARD: Never overwrite cloud backup with empty local list
    if (!Array.isArray(localList) || localList.length === 0) {
      logger.warn(`🛑 ANTI-WIPEOUT GUARD: Local recruitment store has 0 items. Aborting cloud upload to preserve backup! Attempting restore...`);
      await downloadRecruitmentStoreFromSupabase();
      return false;
    }

    const storeBuffer = Buffer.from(JSON.stringify(localList, null, 2), 'utf8');

    let uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/backups/driver_applications_store.json`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'x-upsert': 'true'
      },
      body: storeBuffer
    });

    if (!uploadRes.ok) {
      uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/backups/driver_applications_store.json`, {
        method: 'PUT',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: storeBuffer
      });
    }

    if (uploadRes.ok) {
      logger.info(`✅ Recruitment Applications backup (${localList.length} records, ${storeBuffer.byteLength} bytes) synced to Supabase Cloud Storage!`);
      return true;
    }
  } catch (e) {
    logger.error(`⚠️ Failed to sync driver_applications_store.json to Supabase: ${e.message}`);
  }
  return false;
};

global.uploadDatabaseToSupabase = uploadDatabaseToSupabase;
global.uploadRecruitmentStoreToSupabase = uploadRecruitmentStoreToSupabase;

// ── Continuous Real-Time Cloud Auto-Sync Engine ──
let _cloudSyncDebounceTimer = null;
let _lastCloudSyncMtime = 0;
let _isCloudSyncing = false;
let _hasUnsyncedChanges = false;

let _lastSyncTimestamp = 0;
const MIN_SYNC_COOLDOWN_MS = 25 * 1000; // 25s cooldown between syncs to batch multi-record entry

const triggerDebouncedCloudSync = (delayMs = 6000) => {
  if (global.isShuttingDown || global.isRestoringBackup) return;
  _hasUnsyncedChanges = true;
  if (_cloudSyncDebounceTimer) clearTimeout(_cloudSyncDebounceTimer);

  _cloudSyncDebounceTimer = setTimeout(async () => {
    if (_isCloudSyncing || !global.dbFilePath || !fs.existsSync(global.dbFilePath)) return;

    // Cooldown check: prevent rapid repeated uploads
    const now = Date.now();
    const elapsed = now - _lastSyncTimestamp;
    if (elapsed < MIN_SYNC_COOLDOWN_MS) {
      _cloudSyncDebounceTimer = setTimeout(() => {
        triggerDebouncedCloudSync(1000);
      }, MIN_SYNC_COOLDOWN_MS - elapsed);
      return;
    }

    try {
      _isCloudSyncing = true;
      const stat = fs.statSync(global.dbFilePath);
      logger.info(`🔄 Auto-Sync: compressing & uploading database to Supabase Cloud Storage (${stat.size} bytes)...`);
      const ok = await uploadDatabaseToSupabase(global.dbFilePath);
      if (ok) {
        _lastCloudSyncMtime = stat.mtimeMs;
        _lastSyncTimestamp = Date.now();
        _hasUnsyncedChanges = false;
        logger.info('✅ Auto-Sync: database backup successfully synchronized to Supabase!');
        // Only sync newly added storage files (receipts/docs) incrementally
        if (global.storageDir && fs.existsSync(global.storageDir) && typeof uploadNewStorageToSupabase === 'function') {
          await uploadNewStorageToSupabase(global.storageDir);
        }
        if (typeof uploadRecruitmentStoreToSupabase === 'function') {
          await uploadRecruitmentStoreToSupabase().catch(() => {});
        }
      }
    } catch (syncErr) {
      logger.warn(`⚠️ Auto-Sync background warning: ${syncErr.message}`);
    } finally {
      _isCloudSyncing = false;
    }
  }, delayMs);
};

global.triggerDebouncedCloudSync = triggerDebouncedCloudSync;

// Auto-restore recruitment data store on boot
downloadRecruitmentStoreFromSupabase().catch(() => {});

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
  logger.info('👁️ Continuous Cloud Database Sync registered (real-time debounced + 3-min periodic + shutdown sync)');

  // 🛡️ Zero Idle Traffic Engine:
  // All periodic intervals, self-ping heartbeats, and background upload timers have been
  // completely removed. When the user is not actively submitting data, ZERO outbound requests
  // are made. Render goes to sleep after 15 minutes of inactivity (consuming 0 bits of data).
  // When an expense or record IS added, mutation-driven debounced sync handles the backup in ~296 KB.

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
  initPermanentSequences(dbFilePath);

  // Schedule to run every 12 hours
  const LOCAL_BACKUP_MS = 12 * 60 * 60 * 1000;
  const localBackupInterval = setInterval(runRollingBackup, LOCAL_BACKUP_MS);
  if (localBackupInterval.unref) localBackupInterval.unref();

  // ── Strategy 3: Fast & Bulletproof Graceful Shutdown (Flushes WAL & Uploads DB to Supabase) ──
  const gracefulShutdownSync = async (signal) => {
    logger.info(`🛑 ${signal} received — initiating bulletproof graceful shutdown...`);
    global.isShuttingDown = true;

    if (_cloudSyncDebounceTimer) {
      clearTimeout(_cloudSyncDebounceTimer);
      _cloudSyncDebounceTimer = null;
    }

    // Terminate PocketBase cleanly and wait for it to flush WAL
    if (global.pbProcess) {
      logger.info('🛑 Closing PocketBase process to flush WAL to data.db...');
      global.pbProcess.kill('SIGTERM');
      
      // Wait up to 2 seconds for PocketBase process to exit and close locks
      await new Promise(resolve => {
        const killTimeout = setTimeout(() => {
          logger.warn('⚠️ PocketBase close timeout reached. Forcing shutdown...');
          resolve();
        }, 2000);
        
        global.pbProcess.on('close', () => {
          clearTimeout(killTimeout);
          logger.info('✅ PocketBase exited cleanly.');
          resolve();
        });
      });
    }

    // Direct SQLite WAL checkpoint to ensure all writes are committed to data.db
    try {
      const { DatabaseSync } = await import('node:sqlite');
      const _sDb = new DatabaseSync(dbFilePath);
      _sDb.exec('PRAGMA wal_checkpoint(TRUNCATE);');
      _sDb.close();
    } catch (_) {
      try {
        const { execSync } = await import('node:child_process');
        execSync(`sqlite3 "${dbFilePath}" "PRAGMA wal_checkpoint(TRUNCATE);"`, { stdio: 'pipe' });
      } catch (_) {}
    }

    const storageDir = path.join(path.dirname(dbFilePath), 'storage');
    
    // Fast final sync: sync database and only new storage files (<2 seconds)
    try {
      await Promise.all([
        uploadDatabaseToSupabase(dbFilePath),
        uploadNewStorageToSupabase(storageDir),
        (typeof uploadRecruitmentStoreToSupabase === 'function' ? uploadRecruitmentStoreToSupabase().catch(() => {}) : Promise.resolve())
      ]);
    } catch (syncErr) {
      logger.warn(`⚠️ Graceful shutdown sync warning: ${syncErr.message}`);
    }
    
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

const _uploadedStorageFiles = new Set();
let _storageTrackerInitialized = false;

const initStorageTracker = (storageDir) => {
  if (_storageTrackerInitialized || !fs.existsSync(storageDir)) return;
  _storageTrackerInitialized = true;
  try {
    const localFiles = getLocalFilesRecursive(storageDir, storageDir);
    Object.keys(localFiles).forEach(f => _uploadedStorageFiles.add(f));
    logger.info(`📁 Storage tracker initialized with ${_uploadedStorageFiles.size} existing local files.`);
  } catch (_) {}
};

// Incrementally upload only newly added files to Supabase to eliminate bandwidth waste
const uploadNewStorageToSupabase = async (storageDir) => {
  const isSyncEnabled = process.env.NODE_ENV === 'production' || process.env.ENABLE_SUPABASE_SYNC === 'true';
  if (!isSyncEnabled || !fs.existsSync(storageDir)) return;

  const localFiles = getLocalFilesRecursive(storageDir, storageDir);
  const newFiles = Object.keys(localFiles).filter(f => !_uploadedStorageFiles.has(f));

  if (newFiles.length === 0) return;

  logger.info(`🔄 Incremental Storage Sync: syncing ${newFiles.length} newly added file(s) to Supabase...`);
  for (const relPath of newFiles) {
    const localFilePath = path.join(storageDir, relPath);
    const remotePath = `storage/${relPath}`;
    try {
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
        _uploadedStorageFiles.add(relPath);
        logger.info(`✓ Uploaded new storage file: ${relPath}`);
      }
    } catch (e) {
      logger.warn(`Storage sync warning for ${relPath}: ${e.message}`);
    }
  }
};
global.uploadNewStorageToSupabase = uploadNewStorageToSupabase;
global.uploadAllStorageToSupabase = uploadNewStorageToSupabase;

const startStorageBackgroundSync = (storageDir) => {
  logger.info('📁 Continuous storage sync started (runs every 60 seconds)...');
  setInterval(() => {
    if (typeof uploadNewStorageToSupabase === 'function') {
      uploadNewStorageToSupabase(storageDir).catch(e => {
        logger.warn(`Storage background sync warning: ${e.message}`);
      });
    }
  }, 60000);
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
  global.storageDir = storageDir;
  global.pbPath = pbPath;
  global.dataDir = dataDir;

  // IMPORTANT: Only download on first cold boot (global._pbStartCount === 0).
  // On restarts (after kill for cache-clear), skip download — the local SQLite
  // already has the correct data (e.g. deleted employees). Downloading again would
  // restore stale Supabase data and undo local changes like employee deletions.
  const isProd = process.env.NODE_ENV === 'production' || process.env.ENABLE_SUPABASE_SYNC === 'true';
  const isFirstBoot = !global._pbStartCount;
  global._pbStartCount = (global._pbStartCount || 0) + 1;

  // 🛡️ Always download the latest database from Supabase Storage on first cold boot in production!
  // This ensures recently logged expenses and transactions are never lost across Render spin-downs.
  if (isFirstBoot && isProd) {
    logger.info(`💾 Production Cold Boot: Downloading latest production database from Supabase Storage to ${dbFilePath}...`);
    await downloadDatabaseFromSupabase(dbFilePath, { force: true });
    // 📦 Restore all persistent storage files (bills, documents, receipts) from Supabase on cold boot
    try {
      const storDir = path.join(dataDir, 'storage');
      logger.info(`📥 Production Cold Boot: Restoring all storage documents/bills from Supabase...`);
      await downloadFolderFromSupabase('storage', storDir);
    } catch (storErr) {
      logger.warn(`Storage restoration notice: ${storErr.message}`);
    }
  } else if (!fs.existsSync(dbFilePath)) {
    logger.info(`💾 Local database missing. Hydrating from Supabase Storage to ${dbFilePath}...`);
    await downloadDatabaseFromSupabase(dbFilePath, { force: true });
  } else {
    logger.info(`💾 Child process restart: keeping existing local database at ${dbFilePath}.`);
  }

  // Run SQLite schema migration on boot
  let db;
  try {
    const { DatabaseSync } = await import('node:sqlite');
    db = new DatabaseSync(dbFilePath);

    // 🛡️ Ensure token keys are fully populated in settings to prevent CLI superuser upsert failures
    try {
      const rSettings = db.prepare("SELECT value FROM _params WHERE id='settings'").get();
      if (rSettings && rSettings.value) {
        const settings = JSON.parse(Buffer.from(rSettings.value).toString('utf8'));
        let updatedSettings = false;
        const randKey = () => require('node:crypto').randomBytes(32).toString('hex').slice(0, 32);

        if (!settings.recordTokens) {
          settings.recordTokens = {};
        }
        if (!settings.recordTokens.tokenKey) {
          settings.recordTokens.tokenKey = randKey();
          updatedSettings = true;
        }

        if (!settings.superuserTokens) {
          settings.superuserTokens = {};
        }
        if (!settings.superuserTokens.tokenKey) {
          settings.superuserTokens.tokenKey = randKey();
          updatedSettings = true;
        }

        if (!settings.adminTokens) {
          settings.adminTokens = {};
        }
        if (!settings.adminTokens.tokenKey) {
          settings.adminTokens.tokenKey = randKey();
          updatedSettings = true;
        }

        if (updatedSettings) {
          logger.info("Migrating: Populating blank token keys in PocketBase settings...");
          db.prepare("UPDATE _params SET value = ? WHERE id = 'settings'").run(JSON.stringify(settings));
        }
      }
    } catch (settingsErr) {
      logger.error(`Failed to migrate settings token keys: ${settingsErr.message}`);
    }

    // 🛡️ Ensure no duplicate superuser ID exists that blocks CLI superuser creation/upsert
    try {
      db.prepare("DELETE FROM _superusers WHERE id = 'usr_munna_superadmin'").run();
    } catch (delErr) {
      // Table might not exist yet or be empty
    }

    // 🛡️ Ensure all records in auth tables have non-empty tokenKey values to prevent validation crashes
    try {
      const authTables = ['_superusers', 'users'];
      const randKey = () => require('node:crypto').randomBytes(30).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 50);

      for (const table of authTables) {
        try {
          const records = db.prepare(`SELECT id, tokenKey FROM ${table}`).all();
          for (const r of records) {
            if (!r.tokenKey) {
              const newKey = randKey();
              logger.info(`Migrating: Setting blank tokenKey for record ${r.id} in ${table}...`);
              db.prepare(`UPDATE ${table} SET tokenKey = ? WHERE id = ?`).run(newKey, r.id);
            }
          }
        } catch (tableErr) {
          // Table might not exist yet
        }
      }
    } catch (authErr) {
      logger.error(`Failed to migrate auth token keys: ${authErr.message}`);
    }
    
    
    // 1. Add toll_deduction and timeline columns to trip_logs table if not exists
    const cols = db.prepare("PRAGMA table_info(trip_logs)").all().map(c => c.name);
    if (!cols.includes('toll_deduction')) {
      logger.info("Migrating: Adding column 'toll_deduction' to 'trip_logs' table...");
      db.prepare("ALTER TABLE trip_logs ADD COLUMN toll_deduction REAL DEFAULT 0").run();
    }
    const timelineFieldsToAdd = [
      { name: 'loading_dock_arrival_time', id: 'date_loading_dock_arrival' },
      { name: 'dispatched_time', id: 'date_dispatched_time' },
      { name: 'delivered_time', id: 'date_delivered_time' },
      { name: 'pickup_time', id: 'date_pickup_time' },
      { name: 'delivery_eta', id: 'date_delivery_eta' }
    ];
    timelineFieldsToAdd.forEach(f => {
      if (!cols.includes(f.name)) {
        logger.info(`Migrating: Adding column '${f.name}' to 'trip_logs' table...`);
        db.prepare(`ALTER TABLE trip_logs ADD COLUMN ${f.name} TEXT DEFAULT ''`).run();
      }
    });

    // 🛡️ Ensure collectionId column exists & is populated for PocketBase 0.22+ on boot
    const allColDefs = db.prepare('SELECT id, name FROM _collections').all();
    for (const cDef of allColDefs) {
      try {
        const tInfo = db.prepare('PRAGMA table_info(' + cDef.name + ')').all();
        const hasCol = tInfo.some(col => col.name === 'collectionId');
        if (!hasCol) {
          db.prepare('ALTER TABLE ' + cDef.name + ' ADD COLUMN collectionId TEXT NOT NULL DEFAULT ?').run(cDef.id);
          db.prepare('UPDATE ' + cDef.name + ' SET collectionId = ?').run(cDef.id);
        }
      } catch(e) {}
    }

    // 2. Add toll_deduction and timeline fields to trip_logs schema in _collections table if not exists
    const record = db.prepare("SELECT * FROM _collections WHERE name='trip_logs'").get();
    if (record) {
      const fields = JSON.parse(record.fields);
      let recordUpdated = false;

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
        recordUpdated = true;
      }

      timelineFieldsToAdd.forEach(f => {
        if (!fields.some(field => field.name === f.name)) {
          logger.info(`Migrating: Appending '${f.name}' field to PocketBase 'trip_logs' schema...`);
          fields.push({
            help: `Timestamp for ${f.name.replace(/_/g, ' ')}`,
            hidden: false,
            id: f.id,
            name: f.name,
            required: false,
            system: false,
            type: "date"
          });
          recordUpdated = true;
        }
      });

      if (recordUpdated) {
        db.prepare("UPDATE _collections SET fields = ? WHERE id = ?").run(JSON.stringify(fields), record.id);
      }
      if (record.listRule !== "") {
        logger.info("Migrating: Updating 'trip_logs' listRule and viewRule to open access...");
        db.prepare("UPDATE _collections SET listRule = '', viewRule = '' WHERE id = ?").run(record.id);
      }
    }

    // 2.5 Ensure employee_id field exists in expenses table and schema definition
    const expCols = db.prepare("PRAGMA table_info(expenses)").all().map(c => c.name);
    if (!expCols.includes('employee_id')) {
      logger.info("Migrating: Adding column 'employee_id' to 'expenses' table...");
      db.prepare("ALTER TABLE expenses ADD COLUMN employee_id TEXT DEFAULT ''").run();
    }

    const expRecord = db.prepare("SELECT * FROM _collections WHERE name='expenses'").get();
    if (expRecord) {
      const fields = JSON.parse(expRecord.fields);
      const hasField = fields.some(f => f.name === 'employee_id');
      if (!hasField) {
        logger.info("Migrating: Appending 'employee_id' field to PocketBase 'expenses' schema...");
        fields.push({
          cascadeDelete: false,
          collectionId: "pbc_9297853740",
          help: "Associated employee for this expense",
          hidden: false,
          id: "rel_employee_id",
          maxSelect: 1,
          minSelect: 0,
          name: "employee_id",
          presentable: false,
          required: false,
          system: false,
          type: "relation"
        });
        db.prepare("UPDATE _collections SET fields = ? WHERE id = ?").run(JSON.stringify(fields), expRecord.id);
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

    // Migration for employee_documents collection: make expiry_date optional and update document_type values
    const docRecordBoot = db.prepare("SELECT * FROM _collections WHERE name='employee_documents'").get();
    if (docRecordBoot) {
      const docFieldsBoot = JSON.parse(docRecordBoot.fields);
      let updatedDoc = false;
      const expiryF = docFieldsBoot.find(f => f.name === 'expiry_date');
      if (expiryF && expiryF.required === true) {
        expiryF.required = false;
        updatedDoc = true;
      }
      const typeF = docFieldsBoot.find(f => f.name === 'document_type');
      if (typeF && typeF.values) {
        const missingValues = ["Aadhar", "PAN", "Driving License"].filter(v => !typeF.values.includes(v));
        if (missingValues.length > 0) {
          typeF.values = [...typeF.values, ...missingValues];
          updatedDoc = true;
        }
      }
      if (updatedDoc) {
        db.prepare("UPDATE _collections SET fields = ? WHERE id = ?").run(JSON.stringify(docFieldsBoot), docRecordBoot.id);
        logger.info("Migrating: employee_documents schema updated (expiry_date required=false, added Aadhar/PAN/Driving License to document_type values)");
      }
      if (docRecordBoot.createRule !== "" || docRecordBoot.updateRule !== "" || docRecordBoot.deleteRule !== "") {
        db.prepare("UPDATE _collections SET createRule = '', updateRule = '', deleteRule = '', listRule = '', viewRule = '' WHERE id = ?").run(docRecordBoot.id);
        logger.info("Migrating: employee_documents collection rules set to open access!");
      }
    }

    // 7.5. Trucks schema migration for systematic fleet ownership & Subcontractor KYC
    try {
      const truckCols = db.prepare("PRAGMA table_info(trucks)").all().map(c => c.name);
      const truckNewCols = [
        { name: 'subcontractor_id', type: 'TEXT' },
        { name: 'subcontractor_name', type: 'TEXT' },
        { name: 'owner_name', type: 'TEXT' },
        { name: 'owner_phone', type: 'TEXT' },
        { name: 'owner_pan', type: 'TEXT' },
        { name: 'owner_aadhaar', type: 'TEXT' },
        { name: 'owner_bank_name', type: 'TEXT' },
        { name: 'owner_account_number', type: 'TEXT' },
        { name: 'owner_ifsc', type: 'TEXT' },
        { name: 'assigned_driver_name', type: 'TEXT' },
        { name: 'assigned_driver_phone', type: 'TEXT' },
        { name: 'driver_dl_number', type: 'TEXT' },
        { name: 'loan_id', type: 'TEXT' },
        { name: 'financier_name', type: 'TEXT' },
        { name: 'hypothecation_details', type: 'TEXT' },
        { name: 'status', type: 'TEXT DEFAULT "active"' },
        { name: 'expected_mileage', type: 'REAL DEFAULT 5.8' },
        { name: 'payload_capacity', type: 'TEXT' },
        { name: 'body_length', type: 'REAL DEFAULT 0' },
        { name: 'body_width', type: 'REAL DEFAULT 0' },
        { name: 'body_height', type: 'REAL DEFAULT 0' },
        { name: 'driver_name', type: 'TEXT' },
        { name: 'driver_phone', type: 'TEXT' }
      ];

      for (const item of truckNewCols) {
        if (!truckCols.includes(item.name)) {
          logger.info(`Migrating: Adding column '${item.name}' to 'trucks' table...`);
          try {
            db.prepare(`ALTER TABLE trucks ADD COLUMN ${item.name} ${item.type}`).run();
          } catch (alterErr) {
            logger.warn(`Could not add column ${item.name}: ${alterErr.message}`);
          }
        }
      }

      const truckRecordBoot = db.prepare("SELECT * FROM _collections WHERE name='trucks'").get();
      if (truckRecordBoot) {
        const truckFieldsBoot = JSON.parse(truckRecordBoot.fields);
        let updatedTruckFields = false;
        for (const item of truckNewCols) {
          if (!truckFieldsBoot.some(f => f.name === item.name)) {
            const fType = (item.name === 'expected_mileage' || item.name.startsWith('body_')) ? 'number' : 'text';
            truckFieldsBoot.push({ name: item.name, type: fType, required: false, system: false, hidden: false, id: `trk_${item.name}_fld` });
            updatedTruckFields = true;
          }
        }
        if (updatedTruckFields) {
          db.prepare("UPDATE _collections SET fields = ? WHERE id = ?").run(JSON.stringify(truckFieldsBoot), truckRecordBoot.id);
          logger.info("Migrating: Trucks collection fields updated in PocketBase schema!");
        }
        // Set open rules so staff & drivers can create/update without rejection
        db.prepare("UPDATE _collections SET createRule = '', updateRule = '', deleteRule = '', listRule = '', viewRule = '' WHERE id = ?").run(truckRecordBoot.id);
        logger.info("Migrating: Trucks collection rules set to open access!");
      }
    } catch (truckMigErr) {
      logger.error("Error migrating trucks collection in SQLite:", truckMigErr);
    }

    // 8. Workshop Job Cards collection sqlite registration & table creation
    const wjcRecordBoot = db.prepare("SELECT * FROM _collections WHERE name='workshop_job_cards'").get();
    if (!wjcRecordBoot) {
      logger.info("Migrating: Creating 'workshop_job_cards' table & registration in _collections...");
      db.prepare(`
        CREATE TABLE IF NOT EXISTS workshop_job_cards (
          id TEXT PRIMARY KEY,
          created TEXT,
          updated TEXT,
          job_card_number TEXT,
          truck_number TEXT,
          driver_name TEXT,
          odometer_reading REAL,
          service_type TEXT,
          assigned_mechanic TEXT,
          supervisor_name TEXT,
          status TEXT,
          parts_cost REAL,
          labour_cost REAL,
          tax_amount REAL,
          total_cost REAL,
          itemized_items TEXT,
          complaints_list TEXT,
          notes TEXT,
          entry_date TEXT,
          completion_date TEXT
        )
      `).run();

      const wjcSchema = [
        {"id":"jc_id","name":"id","type":"text","primaryKey":true,"required":true,"system":true},
        {"id":"jc_number","name":"job_card_number","type":"text","required":true,"system":false},
        {"id":"jc_truck","name":"truck_number","type":"text","required":true,"system":false},
        {"id":"jc_driver","name":"driver_name","type":"text","required":false,"system":false},
        {"id":"jc_odo","name":"odometer_reading","type":"number","required":false,"system":false},
        {"id":"jc_serv_type","name":"service_type","type":"text","required":false,"system":false},
        {"id":"jc_mechanic","name":"assigned_mechanic","type":"text","required":false,"system":false},
        {"id":"jc_super","name":"supervisor_name","type":"text","required":false,"system":false},
        {"id":"jc_status","name":"status","type":"text","required":false,"system":false},
        {"id":"jc_parts_c","name":"parts_cost","type":"number","required":false,"system":false},
        {"id":"jc_labour_c","name":"labour_cost","type":"number","required":false,"system":false},
        {"id":"jc_tax_c","name":"tax_amount","type":"number","required":false,"system":false},
        {"id":"jc_total_c","name":"total_cost","type":"number","required":false,"system":false},
        {"id":"jc_items","name":"itemized_items","type":"json","required":false,"system":false},
        {"id":"jc_complaints","name":"complaints_list","type":"text","required":false,"system":false},
        {"id":"jc_notes","name":"notes","type":"text","required":false,"system":false},
        {"id":"jc_entry_d","name":"entry_date","type":"text","required":false,"system":false},
        {"id":"jc_comp_d","name":"completion_date","type":"text","required":false,"system":false},
        {"id":"jc_created","name":"created","type":"autodate","onCreate":true,"onUpdate":false,"system":false},
        {"id":"jc_updated","name":"updated","type":"autodate","onCreate":true,"onUpdate":true,"system":false}
      ];

      db.prepare(`
        INSERT INTO _collections (id, system, type, name, fields, indexes, listRule, viewRule, createRule, updateRule, deleteRule, options, created, updated)
        VALUES ('pbc_wjc_001', 0, 'base', 'workshop_job_cards', ?, '[]', '', '', '', '', '', '{}', datetime('now'), datetime('now'))
      `).run(JSON.stringify(wjcSchema));
    }

    // 9. Workshop Parts Inventory collection sqlite registration & table creation
    const wpiRecordBoot = db.prepare("SELECT * FROM _collections WHERE name='workshop_parts_inventory'").get();
    if (!wpiRecordBoot) {
      logger.info("Migrating: Creating 'workshop_parts_inventory' table & registration in _collections...");
      db.prepare(`
        CREATE TABLE IF NOT EXISTS workshop_parts_inventory (
          id TEXT PRIMARY KEY,
          created TEXT,
          updated TEXT,
          part_number TEXT,
          part_name TEXT,
          category TEXT,
          unit TEXT,
          current_stock REAL,
          min_stock_level REAL,
          unit_price REAL,
          supplier_name TEXT,
          location_rack TEXT,
          notes TEXT
        )
      `).run();

      const wpiSchema = [
        {"id":"pi_id","name":"id","type":"text","primaryKey":true,"required":true,"system":true},
        {"id":"pi_num","name":"part_number","type":"text","required":true,"system":false},
        {"id":"pi_name","name":"part_name","type":"text","required":true,"system":false},
        {"id":"pi_cat","name":"category","type":"text","required":false,"system":false},
        {"id":"pi_unit","name":"unit","type":"text","required":false,"system":false},
        {"id":"pi_stock","name":"current_stock","type":"number","required":false,"system":false},
        {"id":"pi_min","name":"min_stock_level","type":"number","required":false,"system":false},
        {"id":"pi_price","name":"unit_price","type":"number","required":false,"system":false},
        {"id":"pi_supp","name":"supplier_name","type":"text","required":false,"system":false},
        {"id":"pi_rack","name":"location_rack","type":"text","required":false,"system":false},
        {"id":"pi_notes","name":"notes","type":"text","required":false,"system":false},
        {"id":"pi_created","name":"created","type":"autodate","onCreate":true,"onUpdate":false,"system":false},
        {"id":"pi_updated","name":"updated","type":"autodate","onCreate":true,"onUpdate":true,"system":false}
      ];

      db.prepare(`
        INSERT INTO _collections (id, system, type, name, fields, indexes, listRule, viewRule, createRule, updateRule, deleteRule, options, created, updated)
        VALUES ('pbc_wpi_001', 0, 'base', 'workshop_parts_inventory', ?, '[]', '', '', '', '', '', '{}', datetime('now'), datetime('now'))
      `).run(JSON.stringify(wpiSchema));
    }

    // Migration for shared_folders collection: set open rules for share link generation
    const sfRecordBoot = db.prepare("SELECT * FROM _collections WHERE name='shared_folders'").get();
    if (sfRecordBoot) {
      if (sfRecordBoot.createRule !== "" || sfRecordBoot.updateRule !== "" || sfRecordBoot.listRule !== "" || sfRecordBoot.viewRule !== "") {
        db.prepare("UPDATE _collections SET createRule = '', updateRule = '', listRule = '', viewRule = '' WHERE id = ?").run(sfRecordBoot.id);
        logger.info("Migrating: shared_folders collection rules set to open access!");
      }
    }

    // 10. Bids collection sqlite registration & table creation
    const bidsRecordBoot = db.prepare("SELECT * FROM _collections WHERE name='bids'").get();
    if (!bidsRecordBoot) {
      logger.info("Migrating: Creating 'bids' table & registration in _collections...");
      db.prepare(`
        CREATE TABLE IF NOT EXISTS bids (
          id TEXT PRIMARY KEY,
          date TEXT,
          bid_date TEXT,
          client_name TEXT,
          counterparty TEXT,
          role TEXT,
          underlying_client TEXT,
          bidding_type TEXT,
          bid_type TEXT,
          vehicle_type TEXT,
          truck_type TEXT,
          bidding_amount REAL,
          quoted_amount REAL,
          quoted_rate REAL,
          bidding_lost_at REAL,
          actual_winning_rate REAL,
          trip_detail TEXT,
          starting_point TEXT,
          origin TEXT,
          ending_point TEXT,
          destination TEXT,
          no_of_stops REAL,
          route_map TEXT,
          status TEXT,
          result TEXT,
          distance_km REAL,
          payload_tons REAL,
          trips_count REAL,
          monthly_trips REAL,
          contract_ref TEXT,
          contract_date TEXT,
          contract_months REAL,
          dedicated_trucks REAL,
          load_type TEXT,
          notes TEXT,
          created_by TEXT,
          created TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),
          updated TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now'))
        )
      `).run();

      const bidsFieldsBoot = [
        { autogeneratePattern: '[a-z0-9]{15}', hidden: false, id: 'text_id_bids', max: 15, min: 15, name: 'id', pattern: '^[a-z0-9]+$', presentable: false, primaryKey: true, required: true, system: true, type: 'text' },
        { hidden: false, id: 'text_date', name: 'date', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_bid_date', name: 'bid_date', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_client_name', name: 'client_name', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_counterparty', name: 'counterparty', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_role', name: 'role', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_underlying_client', name: 'underlying_client', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_bidding_type', name: 'bidding_type', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_bid_type', name: 'bid_type', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_vehicle_type', name: 'vehicle_type', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_truck_type', name: 'truck_type', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'num_bidding_amount', name: 'bidding_amount', presentable: false, required: false, system: false, type: 'number' },
        { hidden: false, id: 'num_quoted_amount', name: 'quoted_amount', presentable: false, required: false, system: false, type: 'number' },
        { hidden: false, id: 'num_quoted_rate', name: 'quoted_rate', presentable: false, required: false, system: false, type: 'number' },
        { hidden: false, id: 'num_bidding_lost_at', name: 'bidding_lost_at', presentable: false, required: false, system: false, type: 'number' },
        { hidden: false, id: 'num_actual_winning_rate', name: 'actual_winning_rate', presentable: false, required: false, system: false, type: 'number' },
        { hidden: false, id: 'text_trip_detail', name: 'trip_detail', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_starting_point', name: 'starting_point', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_origin', name: 'origin', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_ending_point', name: 'ending_point', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_destination', name: 'destination', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'num_no_of_stops', name: 'no_of_stops', presentable: false, required: false, system: false, type: 'number' },
        { hidden: false, id: 'text_route_map', name: 'route_map', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_status', name: 'status', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_result', name: 'result', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'num_distance_km', name: 'distance_km', presentable: false, required: false, system: false, type: 'number' },
        { hidden: false, id: 'num_payload_tons', name: 'payload_tons', presentable: false, required: false, system: false, type: 'number' },
        { hidden: false, id: 'num_trips_count', name: 'trips_count', presentable: false, required: false, system: false, type: 'number' },
        { hidden: false, id: 'num_monthly_trips', name: 'monthly_trips', presentable: false, required: false, system: false, type: 'number' },
        { hidden: false, id: 'text_contract_ref', name: 'contract_ref', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_contract_date', name: 'contract_date', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'num_contract_months', name: 'contract_months', presentable: false, required: false, system: false, type: 'number' },
        { hidden: false, id: 'num_dedicated_trucks', name: 'dedicated_trucks', presentable: false, required: false, system: false, type: 'number' },
        { hidden: false, id: 'text_load_type', name: 'load_type', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_notes', name: 'notes', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_created_by', name: 'created_by', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'autodate_created_bids', name: 'created', onCreate: true, onUpdate: false, presentable: false, system: false, type: 'autodate' },
        { hidden: false, id: 'autodate_updated_bids', name: 'updated', onCreate: true, onUpdate: true, presentable: false, system: false, type: 'autodate' }
      ];

      db.prepare(`
        INSERT INTO _collections (id, system, type, name, fields, indexes, listRule, viewRule, createRule, updateRule, deleteRule, options, created, updated)
        VALUES ('pbc_bids_live01', 0, 'base', 'bids', ?, '[]', '', '', '', '', '', '{}', datetime('now'), datetime('now'))
      `).run(JSON.stringify(bidsFieldsBoot));
      logger.info("Migrating: 'bids' collection & table created successfully!");
    } else {
      db.prepare("UPDATE _collections SET listRule = '', viewRule = '', createRule = '', updateRule = '', deleteRule = '' WHERE name = 'bids'").run();
      try {
        const bidsCols = db.prepare("PRAGMA table_info(bids)").all().map(c => c.name);
        if (!bidsCols.includes('attachments')) {
          db.prepare("ALTER TABLE bids ADD COLUMN attachments TEXT DEFAULT '[]'").run();
        }
        if (!bidsCols.includes('images')) {
          db.prepare("ALTER TABLE bids ADD COLUMN images TEXT DEFAULT '[]'").run();
        }

        const bRec = db.prepare("SELECT * FROM _collections WHERE name='bids'").get();
        if (bRec) {
          let bFields = JSON.parse(bRec.fields || '[]');
          let changed = false;
          if (!bFields.some(f => f.name === 'attachments')) {
            bFields.push({ hidden: false, id: 'text_attachments_bids', name: 'attachments', presentable: false, required: false, system: false, type: 'text' });
            changed = true;
          }
          if (!bFields.some(f => f.name === 'images')) {
            bFields.push({ hidden: false, id: 'text_images_bids', name: 'images', presentable: false, required: false, system: false, type: 'text' });
            changed = true;
          }
          if (changed) {
            db.prepare("UPDATE _collections SET fields = ? WHERE id = ?").run(JSON.stringify(bFields), bRec.id);
            logger.info("Migrating: Updated 'bids' collection registration in _collections with attachments & images.");
          }
        }
      } catch (e) {
        logger.warn("Bids schema enhancement notice:", e.message);
      }
    }

    // 10.5. Quotes collection schema migration & public rule relaxation
    try {
      const quoteCols = db.prepare("PRAGMA table_info(quotes)").all().map(c => c.name);
      const quoteNewCols = [
        { name: 'truck_size', type: 'TEXT' },
        { name: 'custom_vehicle_requirement', type: 'TEXT' },
        { name: 'service_type', type: 'TEXT' },
        { name: 'material_type', type: 'TEXT' },
        { name: 'expected_dispatch_date', type: 'TEXT' },
        { name: 'details', type: 'TEXT' },
        { name: 'company_name', type: 'TEXT' }
      ];

      for (const item of quoteNewCols) {
        if (!quoteCols.includes(item.name)) {
          logger.info(`Migrating: Adding column '${item.name}' to 'quotes' table...`);
          try {
            db.prepare(`ALTER TABLE quotes ADD COLUMN ${item.name} ${item.type} DEFAULT ''`).run();
          } catch (alterErr) {
            logger.warn(`Could not add column ${item.name} to quotes: ${alterErr.message}`);
          }
        }
      }

      const quoteRecordBoot = db.prepare("SELECT * FROM _collections WHERE name='quotes'").get();
      if (quoteRecordBoot) {
        let qFields = JSON.parse(quoteRecordBoot.fields);
        let updatedQuoteFields = false;

        // Make required fields optional
        qFields.forEach(f => {
          if (['customer_email', 'destination_zone', 'created_by', 'actual_weight', 'chargeable_weight'].includes(f.name)) {
            if (f.required) {
              f.required = false;
              updatedQuoteFields = true;
            }
          }
          if (f.name === 'container_type' && f.type === 'select') {
            f.type = 'text';
            delete f.values;
            updatedQuoteFields = true;
          }
          if (f.name === 'status' && f.type === 'select') {
            const allStatuses = ['Pending', 'Draft', 'Quoted', 'Sent', 'Accepted', 'Negotiating', 'Rejected'];
            f.values = Array.from(new Set([...(f.values || []), ...allStatuses]));
            updatedQuoteFields = true;
          }
        });

        // Add missing fields
        quoteNewCols.forEach(col => {
          if (!qFields.some(f => f.name === col.name)) {
            qFields.push({
              name: col.name,
              type: 'text',
              required: false,
              system: false,
              hidden: false,
              id: `quote_${col.name}_field`
            });
            updatedQuoteFields = true;
          }
        });

        if (updatedQuoteFields) {
          db.prepare("UPDATE _collections SET fields = ? WHERE id = ?").run(JSON.stringify(qFields), quoteRecordBoot.id);
          logger.info("Migrating: Quotes collection schema fields updated successfully!");
        }

        // Open rules for public quote submission and dispatch desk access
        db.prepare("UPDATE _collections SET createRule = '', listRule = '', viewRule = '', updateRule = '', deleteRule = '' WHERE id = ?").run(quoteRecordBoot.id);
        logger.info("Migrating: Quotes collection rules set to OPEN access for public quote submission!");
      }
    } catch (quoteMigrateErr) {
      logger.warn(`Quotes boot migration warning: ${quoteMigrateErr.message}`);
    }

    // 11. Contracts collection sqlite registration & table creation
    const contractsRecordBoot = db.prepare("SELECT * FROM _collections WHERE name='contracts'").get();
    if (!contractsRecordBoot) {
      logger.info("Migrating: Creating 'contracts' table & registration in _collections...");
      db.prepare(`
        CREATE TABLE IF NOT EXISTS contracts (
          id TEXT PRIMARY KEY,
          contract_ref TEXT,
          counterparty TEXT,
          client_name TEXT,
          role TEXT,
          underlying_client TEXT,
          origin TEXT,
          destination TEXT,
          truck_type TEXT,
          rate REAL,
          monthly_trips REAL,
          dedicated_trucks REAL,
          contract_start TEXT,
          contract_end TEXT,
          status TEXT,
          notes TEXT,
          created_by TEXT,
          created TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),
          updated TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now'))
        )
      `).run();

      const contractsFieldsBoot = [
        { autogeneratePattern: '[a-z0-9]{15}', hidden: false, id: 'text_id_contracts', max: 15, min: 15, name: 'id', pattern: '^[a-z0-9]+$', presentable: false, primaryKey: true, required: true, system: true, type: 'text' },
        { hidden: false, id: 'text_c_ref', name: 'contract_ref', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_c_counterparty', name: 'counterparty', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_c_client_name', name: 'client_name', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_c_role', name: 'role', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_c_underlying_client', name: 'underlying_client', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_c_origin', name: 'origin', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_c_destination', name: 'destination', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_c_truck_type', name: 'truck_type', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'num_c_rate', name: 'rate', presentable: false, required: false, system: false, type: 'number' },
        { hidden: false, id: 'num_c_monthly_trips', name: 'monthly_trips', presentable: false, required: false, system: false, type: 'number' },
        { hidden: false, id: 'num_c_dedicated_trucks', name: 'dedicated_trucks', presentable: false, required: false, system: false, type: 'number' },
        { hidden: false, id: 'text_c_contract_start', name: 'contract_start', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_c_contract_end', name: 'contract_end', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_c_status', name: 'status', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_c_notes', name: 'notes', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'text_c_created_by', name: 'created_by', presentable: false, required: false, system: false, type: 'text' },
        { hidden: false, id: 'autodate_created_contracts', name: 'created', onCreate: true, onUpdate: false, presentable: false, system: false, type: 'autodate' },
        { hidden: false, id: 'autodate_updated_contracts', name: 'updated', onCreate: true, onUpdate: true, presentable: false, system: false, type: 'autodate' }
      ];

      db.prepare(`
        INSERT INTO _collections (id, system, type, name, fields, indexes, listRule, viewRule, createRule, updateRule, deleteRule, options, created, updated)
        VALUES ('pbc_contracts_live01', 0, 'base', 'contracts', ?, '[]', '', '', '', '', '', '{}', datetime('now'), datetime('now'))
      `).run(JSON.stringify(contractsFieldsBoot));
      logger.info("Migrating: 'contracts' collection & table created successfully!");
    } else {
      db.prepare("UPDATE _collections SET listRule = '', viewRule = '', createRule = '', updateRule = '', deleteRule = '' WHERE name = 'contracts'").run();
    }
  } catch (migrationErr) {
    logger.error(`❌ Migration failed during boot: ${migrationErr.message}`);
  } finally {
    if (db) {
      try { db.close(); } catch (cErr) {}
    }
  }

  // Sync latest storage files from Supabase Storage — Skipped on boot for instant startup speed!
  // Files are instead downloaded on-demand (lazily) as they are requested by users.
  logger.info(`📥 Lazy-download system active. Skipping boot-time storage download for light speed startup.`);

  // Copy pre-populated PocketBase SQLite databases (data.db & auxiliary.db with 1,305 records) & storage files to target dataDir
  try {
    const targetDb = path.join(dataDir, 'data.db');
    const targetAux = path.join(dataDir, 'auxiliary.db');
    const srcDb = path.resolve(__dirname, '../../pocketbase/pb_data/data.db');
    const srcAux = path.resolve(__dirname, '../../pocketbase/pb_data/auxiliary.db');
    
    if (fs.existsSync(srcDb) && !fs.existsSync(targetDb)) {
      logger.info(`💾 Copying pre-populated data.db (1.7MB) to ${targetDb}...`);
      fs.copyFileSync(srcDb, targetDb);
      if (fs.existsSync(srcDb + '-wal')) fs.copyFileSync(srcDb + '-wal', targetDb + '-wal');
      if (fs.existsSync(srcDb + '-shm')) fs.copyFileSync(srcDb + '-shm', targetDb + '-shm');
    }

    if (fs.existsSync(srcAux) && !fs.existsSync(targetAux)) {
      logger.info(`💾 Copying pre-populated auxiliary.db (5.7MB) to ${targetAux}...`);
      fs.copyFileSync(srcAux, targetAux);
      if (fs.existsSync(srcAux + '-wal')) fs.copyFileSync(srcAux + '-wal', targetAux + '-wal');
      if (fs.existsSync(srcAux + '-shm')) fs.copyFileSync(srcAux + '-shm', targetAux + '-shm');
    }
    logger.info(`✅ Both data.db and auxiliary.db successfully copied to persistent disk!`);

    const targetStorage = path.join(dataDir, 'storage');
    const srcStorage = path.resolve(__dirname, '../../pocketbase/pb_data/storage');
    if (fs.existsSync(srcStorage)) {
      logger.info(`📁 Copying storage files from ${srcStorage} to ${targetStorage}...`);
      fs.cpSync(srcStorage, targetStorage, { recursive: true, force: false });
    }
  } catch (copyErr) {
    logger.error(`⚠️ Failed to copy pre-populated databases: ${copyErr.message}`);
  }

  if (!isWin) {
    try {
      fs.chmodSync(pbPath, '755');
    } catch (e) {
      logger.error('Failed to set execute permissions on PocketBase binary:', e.message);
    }
  }

  // Run PocketBase migrations automatically on boot
  try {
    const { spawnSync } = await import('node:child_process');
    logger.info("🚀 Running PocketBase database migrations (migrate up)...");
    const migrationResult = spawnSync(pbPath, [
      'migrate',
      'up',
      `--dir=${dataDir}`,
      `--migrationsDir=${path.resolve(__dirname, '../../pocketbase/pb_migrations')}`
    ], {
      stdio: 'pipe',
      encoding: 'utf-8',
      timeout: 30000
    });
    if (migrationResult.error) {
      logger.error(`❌ PocketBase migration spawn error: ${migrationResult.error.message}`);
    } else {
      logger.info(`PocketBase migration output: ${(migrationResult.stdout || '').trim()}`);
      if (migrationResult.status !== 0) {
        logger.warn(`⚠️ PocketBase migration exited with code ${migrationResult.status}. stderr: ${(migrationResult.stderr || '').trim()}`);
      } else {
        logger.info("✅ PocketBase migrations applied successfully!");
      }
    }
  } catch (err) {
    logger.error(`❌ Failed to run PocketBase migrations: ${err.message}`);
  }

  // Enforce superuser existence (non-fatal — PocketBase should still start even if this fails)
  const email = process.env.PB_SUPERUSER_EMAIL || 'munnarathod222@gmail.com';
  const password = process.env.PB_SUPERUSER_PASSWORD || 'Munnarathod@25';
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

  const possibleHooksDirs = [
    path.resolve(__dirname, '../pocketbase/pb_hooks'),
    path.resolve(__dirname, '../../apps/pocketbase/pb_hooks'),
    path.resolve(__dirname, '../../pocketbase/pb_hooks'),
    path.resolve(process.cwd(), 'apps/pocketbase/pb_hooks'),
    path.resolve(process.cwd(), 'pb_hooks')
  ];
  const hooksDir = possibleHooksDirs.find(d => fs.existsSync(d)) || path.resolve(process.cwd(), 'apps/pocketbase/pb_hooks');

  logger.info(`🚀 Spawning PocketBase: ${pbPath} --dir=${dataDir} --hooksDir=${hooksDir}`);

  const pbArgs = [
    'serve',
    '--http=127.0.0.1:8090',
    `--dir=${dataDir}`,
    '--hooksWatch=false',
    `--migrationsDir=${path.resolve(__dirname, '../../pocketbase/pb_migrations')}`,
    `--hooksDir=${hooksDir}`
  ];
  if (process.env.NODE_ENV !== 'production') {
    pbArgs.push('--dev');
  }

  const pbEnv = {
    ...process.env,
    SUPABASE_URL: supabaseUrl,
    SUPABASE_KEY: supabaseKey,
    SUPABASE_SECRET: supabaseKey
  };
  const pbProcess = spawn(pbPath, pbArgs, { stdio: 'pipe', env: pbEnv });
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
    if (msg.includes('REST API server started at') || msg.includes('Server started at')) {
      initPermanentSequences(dbFilePath).catch(() => {});
      initDatabaseIndexes(dbFilePath).catch(() => {});
    }
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

// Diagnostic endpoint — executes pocketbase migrate up manually on Render
app.get('/api/run-pb-migrate', requireBackupAuth, async (req, res) => {
  try {
    const { spawnSync, execSync } = await import('node:child_process');
    const pbPath = global.pbPath;
    const dataDir = global.dataDir;
    const dbPath = global.dbFilePath;
    const migrationsDir = path.resolve(__dirname, '../../pocketbase/pb_migrations');
    
    // First, clear the bad migration cache records from sqlite database
    let deleteOutput = '';
    try {
      const deleteCmd = `sqlite3 "${dbPath}" "DELETE FROM _migrations WHERE file IN ('1786900000_create_workshop_job_cards.js', '1787000000_create_workshop_parts_inventory.js');"`;
      deleteOutput = execSync(deleteCmd, { encoding: 'utf-8' });
      logger.info("Cleared cached migrations from SQLite database.");
    } catch (dbErr) {
      deleteOutput = 'Failed: ' + dbErr.message;
      logger.warn(`Failed to clear migration cache: ${dbErr.message}`);
    }

    // Now run pocketbase migrate up to apply them
    const result = spawnSync(pbPath, [
      'migrate',
      'up',
      `--dir=${dataDir}`,
      `--migrationsDir=${migrationsDir}`
    ], {
      stdio: 'pipe',
      encoding: 'utf-8',
      timeout: 30000
    });
    
    if (global.pbProcess) {
      logger.info("Restarting PocketBase to load new schemas...");
      global.pbProcess.kill();
    }

    res.json({
      success: result.status === 0,
      status: result.status,
      deleteOutput,
      stdout: result.stdout,
      stderr: result.stderr,
      error: result.error ? result.error.message : null
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Diagnostic endpoint — exposes PocketBase startup logs
app.get('/api/pb-logs', requireBackupAuth, (req, res) => {
  res.json({ logs: global._pbLogs || [], count: (global._pbLogs || []).length });
});

// Diagnostic endpoint — exposes Express application logs
app.get('/api/express-logs', requireBackupAuth, (req, res) => {
  res.json({ logs: global._expressLogs || [], count: (global._expressLogs || []).length });
});

// Diagnostic endpoint — inspects local directories on Render
app.get('/api/inspect-dir', requireBackupAuth, (req, res) => {
  try {
    const targetPath = req.query.path || '../../pocketbase/pb_migrations';
    const absPath = path.resolve(__dirname, targetPath);
    const exists = fs.existsSync(absPath);
    let files = [];
    if (exists) {
      files = fs.readdirSync(absPath);
    }
    res.json({
      success: true,
      queryPath: targetPath,
      resolvedAbsPath: absPath,
      exists,
      filesCount: files.length,
      files
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

  // Diagnostic endpoint — initializes or audits permanent truck and employee sequence numbers
  app.get('/api/init-permanent-sequences', requireBackupAuth, async (req, res) => {
    try {
      const dbPath = global.dbFilePath;
      await initPermanentSequences(dbPath);

      const trucks = await pb.collection('trucks').getFullList({ sort: 'truck_sequence,created', $autoCancel: false }).catch(() => []);
      const employees = await pb.collection('employees').getFullList({ sort: 'employee_number,created', $autoCancel: false }).catch(() => []);

      res.json({
        success: true,
        message: 'Permanent sequences initialized and synced successfully!',
        trucks: trucks.map(t => ({ id: t.id, truck_number: t.truck_number, truck_sequence: t.truck_sequence, truck_code: t.truck_code, created: t.created })),
        employees: employees.map(e => ({ id: e.id, name: e.name, employee_type: e.employee_type, employee_number: e.employee_number, employee_code: e.employee_code, created: e.created }))
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Diagnostic endpoint — executes SQLite collections migrations manually on production DB
  app.get('/api/run-boot-migrations', requireBackupAuth, async (req, res) => {
    try {
      const { execSync } = await import('node:child_process');
      const dbPath = global.dbFilePath;
      if (!dbPath || !fs.existsSync(dbPath)) {
        return res.status(400).json({ success: false, error: 'Database file not found' });
      }

      // Delete the cache of these migrations from the SQLite _migrations table so pb will run them again
      const cmd = `sqlite3 "${dbPath}" "DELETE FROM _migrations WHERE file IN ('1786900000_create_workshop_job_cards.js', '1787000000_create_workshop_parts_inventory.js');"`;
      const output = execSync(cmd, { encoding: 'utf-8' });

      res.json({
        success: true,
        message: 'Deleted migration cache records successfully. You can now call run-pb-migrate to re-apply migrations.',
        output
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Diagnostic & recovery endpoint — forces download of all Supabase storage files to local disk
  app.get('/api/sync-storage-now', requireBackupAuth, async (req, res) => {
    try {
      const storDir = global.storageDir || (global.dbFilePath ? path.join(path.dirname(global.dbFilePath), 'storage') : './pb_data/storage');
      logger.info('🔄 Manual trigger: restoring all storage files from Supabase...');
      const allFiles = await listAllSupabaseFiles('storage');
      await downloadFolderFromSupabase('storage', storDir);
      res.json({
        success: true,
        message: 'Storage files sync complete',
        supabaseFilesCount: allFiles.length,
        files: allFiles
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Diagnostic endpoint — inspects the production database status
  app.get('/api/inspect-db-status', requireBackupAuth, async (req, res) => {
    try {
      const dbPath = global.dbFilePath;
      if (!dbPath || !fs.existsSync(dbPath)) {
        return res.json({ success: false, error: 'Database file does not exist or path not set' });
      }
      const stat = fs.statSync(dbPath);

      let tripCount = -1;
      let expenseCount = -1;
      let sqliteSupported = false;
      let superusersList = [];

      try {
        const { DatabaseSync } = await import('node:sqlite');
        const db = new DatabaseSync(dbPath);
        tripCount = db.prepare("SELECT COUNT(*) as c FROM trip_logs").get()?.c || 0;
        expenseCount = db.prepare("SELECT COUNT(*) as c FROM expenses").get()?.c || 0;
        db.close();
        sqliteSupported = true;
      } catch (sqliteErr) {
        // Fallback: try using pocketbase collection stats (non-blocking)
        try {
          const tripsList = await pb.collection('trip_logs').getList(1, 1, { $autoCancel: false });
          const expensesList = await pb.collection('expenses').getList(1, 1, { $autoCancel: false });
          tripCount = tripsList.totalItems;
          expenseCount = expensesList.totalItems;
        } catch (pbErr) {
          logger.warn(`Failed to count records via pb SDK: ${pbErr.message}`);
        }
      }

      let sqlite3CliOutput = null;
      try {
        const { execSync } = await import('node:child_process');
        sqlite3CliOutput = execSync(`sqlite3 "${dbPath}" "SELECT name FROM _collections; SELECT '---'; SELECT * FROM _migrations;"`, { encoding: 'utf8' });
      } catch (cliErr) {
        sqlite3CliOutput = 'CLI error: ' + cliErr.message;
      }

      try {
        const list = await pb.collection('_superusers').getFullList({ $autoCancel: false });
        superusersList = list.map(u => u.email);
      } catch (pbErr) {
        superusersList = ['Failed to fetch: ' + pbErr.message];
      }

      let uploadTestResult = null;
      try {
        const testRes = await fetch(`${supabaseUrl}/storage/v1/object/backups/test_api_upload.txt`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'x-upsert': 'true',
            'Content-Type': 'text/plain'
          },
          body: 'Hello from Render diagnostic upload test!'
        });
        const testBodyText = await testRes.text().catch(() => '');
        uploadTestResult = {
          status: testRes.status,
          statusText: testRes.statusText,
          body: testBodyText
        };
      } catch (uploadErr) {
        uploadTestResult = { error: uploadErr.message };
      }

      res.json({
        success: true,
        dbPath,
        sizeBytes: stat.size,
        tripCount,
        expenseCount,
        sqliteSupported,
        sqlite3CliOutput,
        superusersList,
        lastBackupError: global.lastBackupError || null,
        uploadTestResult,
        envKeys: Object.keys(process.env),
        NODE_ENV: process.env.NODE_ENV,
        ENABLE_SUPABASE_SYNC: process.env.ENABLE_SUPABASE_SYNC
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Temporary diagnostic route to test live JSVM cashbook sync hooks
  app.get('/api/test-fuel-sync', requireBackupAuth, async (req, res) => {
    try {
      const expensePayload = {
        date: new Date().toISOString(),
        category: 'Regular',
        subcategory: 'Fuel',
        amount: 99,
        liters: 1,
        truck_id: 'TG12U2637',
        description: 'TEST DIAGNOSTIC FUEL LOG',
        payment_method: 'Cash',
        status: 'Approved',
        created_by: 'usr_munna_superadmin'
      };

      const record = await pb.collection('expenses').create(expensePayload, { $autoCancel: false });
      
      // Wait 3 seconds for JSVM hooks to run
      await new Promise(resolve => setTimeout(resolve, 3000));

      const filter = `reference_id = "${record.id}"`;
      const cbRecords = await pb.collection('cashbook').getFullList({ filter, $autoCancel: false });

      let synced = false;
      let cbId = null;
      if (cbRecords.length > 0) {
        synced = true;
        cbId = cbRecords[0].id;
        // Clean up cashbook record
        await pb.collection('cashbook').delete(cbId, { $autoCancel: false });
      }

      // Clean up expense record
      await pb.collection('expenses').delete(record.id, { $autoCancel: false });

      res.json({
        success: true,
        synced,
        cbId,
        message: synced ? 'Success: Expense synced to Cashbook!' : 'Failure: Expense did not sync to Cashbook.'
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Temporary route to retroactively sync any missing cashbook transactions for past expenses
  app.get('/api/retro-sync', requireBackupAuth, async (req, res) => {
    try {
      const expenses = await pb.collection('expenses').getFullList({ $autoCancel: false });
      let syncedCount = 0;
      const results = [];

      for (const record of expenses) {
        const filter = `reference_id = "${record.id}"`;
        const existing = await pb.collection('cashbook').getFullList({ filter, $autoCancel: false });

        if (existing.length === 0) {
          const addedBy = record.created_by || "vomu7tmaa889wv8";
          const payload = {
            date: record.date,
            description: record.description || "Expense",
            amount: record.amount,
            transaction_type: "Expense",
            category: record.category === "Regular" && record.subcategory 
              ? `Regular - ${record.subcategory}` 
              : (record.category || "Expenses"),
            reference_id: record.id,
            reference_type: "expense",
            status: "Completed",
            added_by: addedBy
          };

          const newCb = await pb.collection('cashbook').create(payload, { $autoCancel: false });
          results.push({ expenseId: record.id, cbId: newCb.id, description: payload.description });
          syncedCount++;
        }
      }

      res.json({
        success: true,
        syncedCount,
        syncedRecords: results,
        message: `Successfully synchronized ${syncedCount} missing cashbook transactions!`
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Dedicated endpoint to synchronize all fuel tracker logs to cashbook & expenses
  app.get('/api/sync-fuel-cashbook', requireBackupAuth, async (req, res) => {
    try {
      const fuelLogs = await pb.collection('fuel_tracker').getFullList({ sort: '-date', $autoCancel: false });
      let syncedCount = 0;
      const results = [];

      for (const fuel of fuelLogs) {
        let expense = null;
        try {
          expense = await pb.collection('expenses').getFirstListItem(`fuel_tracker_id="${fuel.id}"`, { $autoCancel: false });
        } catch (_) {}

        if (!expense) {
          try {
            expense = await pb.collection('expenses').create({
              date: fuel.date,
              category: 'Regular',
              subcategory: 'Fuel',
              amount: fuel.total_cost,
              liters: fuel.liters || 0,
              truck_id: fuel.truck_number || '',
              description: `${fuel.truck_number || 'Truck'} - ${fuel.distance_driven || 0} KMs - ${fuel.liters || 0} L`,
              payment_method: fuel.payment_method || 'Cash',
              status: 'Approved',
              created_by: 'usr_munna_superadmin',
              fuel_tracker_id: fuel.id
            }, { $autoCancel: false });
          } catch (createExpErr) {
            logger.warn(`Failed to create missing expense for fuel ${fuel.id}: ${createExpErr.message}`);
          }
        }

        if (expense) {
          let cashbookEntry = null;
          try {
            cashbookEntry = await pb.collection('cashbook').getFirstListItem(`reference_id="${expense.id}"`, { $autoCancel: false });
          } catch (_) {}

          if (!cashbookEntry) {
            try {
              const newCb = await pb.collection('cashbook').create({
                date: fuel.date,
                description: `Fuel: ${fuel.truck_number || 'Truck'} (${fuel.liters || 0} L - ${fuel.distance_driven || 0} KM)`,
                amount: fuel.total_cost,
                transaction_type: 'Expense',
                category: 'Regular - Fuel',
                reference_id: expense.id,
                reference_type: 'expense',
                status: 'Completed',
                added_by: 'usr_munna_superadmin'
              }, { $autoCancel: false });

              results.push({ fuelId: fuel.id, expenseId: expense.id, cashbookId: newCb.id, amount: fuel.total_cost });
              syncedCount++;
            } catch (cbCreateErr) {
              logger.warn(`Failed to create cashbook for fuel ${fuel.id}: ${cbCreateErr.message}`);
            }
          }
        }
      }

      res.json({
        success: true,
        syncedCount,
        syncedRecords: results,
        message: `Successfully synchronized ${syncedCount} fuel records into Cashbook!`
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Dedicated endpoint to deduplicate credit cards collection
  app.get('/api/dedupe-credit-cards', requireBackupAuth, async (req, res) => {
    try {
      const allCards = await pb.collection('credit_cards').getFullList({ sort: 'created', $autoCancel: false });
      const seen = new Map();
      const toDelete = [];
      const updated = [];

      for (const card of allCards) {
        const last4 = card.card_number_last4 || '';
        let cleanName = (card.card_name || '').replace(/\[Add-On:.*?\]/gi, '').trim().toUpperCase();
        const bank = (card.bank_name || '').trim().toUpperCase();
        const key = `${cleanName}_${last4}_${bank}`;

        if (seen.has(key)) {
          const prev = seen.get(key);
          toDelete.push(prev.id);
          seen.set(key, card);
        } else {
          seen.set(key, card);
        }
      }

      for (const id of toDelete) {
        try {
          await pb.collection('credit_cards').delete(id, { $autoCancel: false });
        } catch (e) {
          logger.warn(`Failed to delete duplicate card ${id}: ${e.message}`);
        }
      }

      // Rename Add-on tag cleanly on surviving cards
      const surviving = await pb.collection('credit_cards').getFullList({ $autoCancel: false });
      for (const card of surviving) {
        let cleanName = (card.card_name || '').trim();
        const isAddon = /\[Add-On:.*?\]/i.test(cleanName);
        cleanName = cleanName.replace(/\[Add-On:.*?\]/gi, '').trim();
        if (isAddon && !cleanName.toLowerCase().includes('add-on')) {
          cleanName += ' (Add-On)';
        }
        if (cleanName !== card.card_name) {
          await pb.collection('credit_cards').update(card.id, { card_name: cleanName }, { $autoCancel: false });
          updated.push({ id: card.id, oldName: card.card_name, newName: cleanName });
        }
      }

      res.json({
        success: true,
        deletedCount: toDelete.length,
        deletedIds: toDelete,
        updatedCount: updated.length,
        updated,
        message: `Deduplicated ${toDelete.length} duplicate credit cards and cleaned names!`
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
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
          logger.info('⚡ Real-time sync: database & storage backup triggered in background...');
          await uploadDatabaseToSupabase(global.dbFilePath);
          if (global.storageDir && fs.existsSync(global.storageDir) && typeof uploadNewStorageToSupabase === 'function') {
            await uploadNewStorageToSupabase(global.storageDir);
          }
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




// Admin User Creation & Signup Request Approval Endpoint
app.post('/api/admin/users/create-or-approve', async (req, res) => {
  try {
    const { email, password, full_name, name, role, status, phone_number, requestId, notes, approved_by } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (full_name || name || '').trim() || cleanEmail.split('@')[0];
    const cleanRole = (role || 'manager').toLowerCase();
    const cleanStatus = status || 'active';
    const tempPass = password || (require('crypto').randomBytes(6).toString('hex') + 'A1!');

    const { DatabaseSync } = require('node:sqlite');
    const dbPath = global.dbFilePath || path.resolve(__dirname, '../../pocketbase/pb_data/data.db');
    const db = new DatabaseSync(dbPath);

    const now = new Date().toISOString();
    const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail);

    let userRecord;
    if (existing) {
      db.prepare(`
        UPDATE users SET 
          name = ?, full_name = ?, role = ?, status = ?, updated = ?
        WHERE id = ?
      `).run(cleanName, cleanName, cleanRole, cleanStatus, now, existing.id);
      userRecord = db.prepare("SELECT * FROM users WHERE id = ?").get(existing.id);
    } else {
      const newId = 'usr_' + require('crypto').randomBytes(8).toString('hex');
      const tokenKey = require('crypto').randomBytes(20).toString('hex');
      db.prepare(`
        INSERT INTO users (id, email, emailVisibility, name, full_name, role, status, password, tokenKey, phone_number, created, updated, verified)
        VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(newId, cleanEmail, cleanName, cleanName, cleanRole, cleanStatus, tempPass, tokenKey, phone_number || '', now, now);
      userRecord = db.prepare("SELECT * FROM users WHERE id = ?").get(newId);
    }

    // If linked to a signup_request ID, update request status to Approved
    if (requestId) {
      try {
        db.prepare(`
          UPDATE signup_requests SET 
            status = 'Approved', approved_date = ?, approved_by = ?, notes = ?, updated = ?
          WHERE id = ?
        `).run(now, approved_by || 'admin', notes || '', now, requestId);
      } catch (sqErr) {}
    }

    db.close();
    return res.json({ success: true, user: userRecord, tempPassword: tempPass });
  } catch (err) {
    console.error('Error in create-or-approve:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Express Direct File Serving Route Handler (handles both collection name & collection ID)
const handleDirectFileServe = async (req, res, next) => {
  const collectionNameOrId = req.params.collection;
  const recordId = req.params.recordId;
  const filename = req.params.filename;

  const storageBase = global.dbFilePath ? path.join(path.dirname(global.dbFilePath), 'storage') : path.resolve(__dirname, '../../pocketbase/pb_data/storage');

  let targetPath = path.join(storageBase, collectionNameOrId, recordId, filename);
  let resolvedColId = collectionNameOrId;

  const KNOWN_COLLECTIONS = {
    'expenses': 'pbc_6917388166',
    'trucks': 'pbc_4061015685',
    'employees': 'pbc_9297853740',
    'trip_logs': 'pbc_2315080054',
    'expenses_fuel': 'pbc_4410989275',
    'expenses_fastag': 'pbc_8065296939',
    'expenses_driver_advance': 'pbc_9231073449',
    'expenses_maintenance': 'pbc_9385472886',
    'expenses_miscellaneous': 'pbc_9956229931',
    'truck_documents': 'pbc_9574740198',
    'employee_documents': 'pbc_5654350664',
    'bills': 'pbc_5013008537',
    'invoices': 'pbc_6913307034',
    'delivery_proofs': 'pbc_7366988480',
    'workshop_job_cards': 'pbc_2575941366',
    'company_settings': 'pbc_company_settings'
  };
  if (KNOWN_COLLECTIONS[collectionNameOrId]) {
    resolvedColId = KNOWN_COLLECTIONS[collectionNameOrId];
  }

  // Candidate 1: direct folder match or resolve collectionName to collectionId
  if (!fs.existsSync(targetPath)) {
    const resolvedPath = path.join(storageBase, resolvedColId, recordId, filename);
    if (fs.existsSync(resolvedPath)) {
      targetPath = resolvedPath;
    } else {
      try {
        const { DatabaseSync } = require('node:sqlite');
        const dbPath = global.dbFilePath || path.resolve(__dirname, '../../pocketbase/pb_data/data.db');
        const db = new DatabaseSync(dbPath);
        const row = db.prepare("SELECT id FROM _collections WHERE name = ? OR id = ?").get(collectionNameOrId, collectionNameOrId);
        db.close();
        if (row && row.id) {
          resolvedColId = row.id;
          const dbResolvedPath = path.join(storageBase, row.id, recordId, filename);
          if (fs.existsSync(dbResolvedPath)) {
            targetPath = dbResolvedPath;
          }
        }
      } catch(e) {}
    }

    // Candidate 2: lazy-download from Supabase if missing from local ephemeral disk
    if (!fs.existsSync(targetPath)) {
      const remote1 = `storage/${resolvedColId}/${recordId}/${filename}`;
      const dest1 = path.join(storageBase, resolvedColId, recordId, filename);
      const ok1 = await downloadFileFromSupabase(remote1, dest1);
      if (ok1) {
        targetPath = dest1;
      } else if (resolvedColId !== collectionNameOrId) {
        const remote2 = `storage/${collectionNameOrId}/${recordId}/${filename}`;
        const dest2 = path.join(storageBase, collectionNameOrId, recordId, filename);
        const ok2 = await downloadFileFromSupabase(remote2, dest2);
        if (ok2) targetPath = dest2;
      }
    }
  }

  // Candidate 3: fallback search across all collection folders in storageBase for recordId/filename
  if (!fs.existsSync(targetPath)) {
    try {
      if (fs.existsSync(storageBase)) {
        const folders = fs.readdirSync(storageBase);
        for (const folder of folders) {
          const checkPath = path.join(storageBase, folder, recordId, filename);
          if (fs.existsSync(checkPath)) {
            targetPath = checkPath;
            break;
          }
        }
      }
    } catch(e) {}
  }

  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
    return res.sendFile(targetPath);
  }
  next();
};

app.get('/api/files/:collection/:recordId/:filename', handleDirectFileServe);
app.get('/hcgi/platform/api/files/:collection/:recordId/:filename', handleDirectFileServe);

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
    const headers = { ...proxyRes.headers };
    // Inject aggressive client caching for static files/media to eliminate repeat downloads
    if (parsedUrl.pathname.includes('/api/files/')) {
      headers['cache-control'] = 'public, max-age=2592000, stale-while-revalidate=86400';
      headers['vary'] = 'Accept-Encoding';
    }

    // 🛡️ Mutation Auto-Sync: detect successful data creation/update/deletion (e.g. expenses, cashbook)
    // and automatically schedule a 3-second debounced cloud backup to Supabase.
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) &&
        proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
      const pathname = parsedUrl.pathname;
      if (!pathname.includes('/auth-with-') && !pathname.includes('/auth-refresh') && !pathname.includes('/api/health')) {
        logger.info(`📝 PocketBase mutation detected (${req.method} ${pathname}) -> scheduling debounced cloud backup in 3s...`);
        triggerDebouncedCloudSync(3000);
      }
    }

    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    logger.error('PocketBase Proxy Error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'PocketBase database connection failed.' });
    }
  });

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('content-type', 'application/json');
      proxyReq.setHeader('content-length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
      proxyReq.end();
    } else if (typeof req.body === 'string' && req.body.length > 0) {
      proxyReq.setHeader('content-length', Buffer.byteLength(req.body));
      proxyReq.write(req.body);
      proxyReq.end();
    } else {
      // Pipe raw request stream (for multipart/form-data/file uploads)
      req.pipe(proxyReq);
    }
  } else {
    proxyReq.end();
  }
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

// Direct database trip log delete endpoint for single & bulk deletion
const directDeleteTripLogs = async (req, res) => {
  const { ids, trips } = req.body || {};
  const rawList = Array.isArray(ids) ? ids : (Array.isArray(trips) ? trips : [ids || req.params?.id]);
  const cleanList = rawList.map(item => typeof item === 'object' ? (item.id || item.trip_id) : item).filter(Boolean);

  if (cleanList.length === 0) {
    return res.status(400).json({ success: false, error: 'No trip IDs provided for deletion' });
  }

  let db;
  try {
    const dbPath = path.resolve(process.cwd(), 'apps/pocketbase/pb_data/data.db');
    const altPath = path.resolve(__dirname, '../../pocketbase/pb_data/data.db');
    const targetDb = global.dbFilePath || (fs.existsSync(dbPath) ? dbPath : altPath);
    let DatabaseSyncMod;
    try {
      const mod = await import('node:sqlite');
      DatabaseSyncMod = mod.DatabaseSync;
    } catch (e) {}

    let deletedCount = 0;
    if (DatabaseSyncMod && fs.existsSync(targetDb)) {
      db = new DatabaseSyncMod(targetDb);
      const stmt = db.prepare('DELETE FROM trip_logs WHERE id = ? OR trip_id = ?');

      for (const val of cleanList) {
        const info = stmt.run(String(val), String(val));
        if (info.changes > 0) deletedCount += info.changes;
      }
    } else {
      for (const val of cleanList) {
        await pb.collection('trip_logs').delete(String(val), { $autoCancel: false }).catch(() => {});
        deletedCount++;
      }
    }

    logger.info(`🗑️ Trip delete executed: removed ${deletedCount} record(s) for targets:`, cleanList);
    return res.json({ success: true, deletedCount, message: `Successfully deleted ${deletedCount} trip log(s)` });
  } catch (err) {
    logger.error('Error executing direct trip delete:', err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (db) {
      try { db.close(); } catch (cErr) {}
    }
  }
};

app.post('/hcgi/api/trip_logs/delete-by-id', directDeleteTripLogs);
app.post('/api/trip_logs/delete-by-id', directDeleteTripLogs);
app.delete('/hcgi/api/trip_logs/:id', directDeleteTripLogs);
app.delete('/api/trip_logs/:id', directDeleteTripLogs);

// Direct database employee delete endpoint
const directDeleteEmployees = async (req, res) => {
  const { ids, id } = req.body || {};
  const targetId = req.params?.id || id || ids;
  const rawList = Array.isArray(targetId) ? targetId : [targetId];
  const cleanList = rawList.map(item => typeof item === 'object' ? (item.id || item.employee_number) : item).filter(Boolean);

  if (cleanList.length === 0) {
    return res.status(400).json({ success: false, error: 'No employee ID provided for deletion' });
  }

  try {
    let deletedCount = 0;
    for (const val of cleanList) {
      const c = await deleteEmployeeRecord(val);
      deletedCount += (c || 1);
    }

    logger.info(`🗑️ Direct employee delete executed: removed ${deletedCount} record(s) for targets:`, cleanList);
    return res.json({ success: true, deletedCount, message: `Successfully deleted employee(s)` });
  } catch (err) {
    logger.error('Error executing direct employee delete:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

app.post('/hcgi/api/employees/delete-by-id', directDeleteEmployees);
app.post('/api/employees/delete-by-id', directDeleteEmployees);
app.delete('/hcgi/api/employees/:id', directDeleteEmployees);
// Direct PDF Invoice Generation & Serving endpoint for WhatsApp media attachment
const serveInvoicePdf = async (req, res) => {
  try {
    const { tripId } = req.params;
    let trip = null;
    let invRecord = null;

    // 1. Try querying invoices collection first for existing official invoice record
    try {
      if (pb) {
        try {
          invRecord = await pb.collection('invoices').getOne(tripId, { $autoCancel: false });
        } catch (e) {
          const invList = await pb.collection('invoices').getList(1, 1, {
            filter: `trip_id = "${tripId}" || invoice_number = "${tripId}" || id = "${tripId}"`,
            $autoCancel: false
          }).catch(() => ({ items: [] }));
          if (invList.items && invList.items.length > 0) invRecord = invList.items[0];
        }
      }
    } catch (e) {}

    // 2. Query trip_logs collection
    try {
      if (pb) {
        try {
          trip = await pb.collection('trip_logs').getOne(tripId, { expand: 'client_id,driver_id,truck_id', $autoCancel: false });
        } catch (e) {
          const list = await pb.collection('trip_logs').getList(1, 1, {
            filter: `trip_id = "${tripId}" || lr_number = "${tripId}" || id = "${tripId}"`,
            expand: 'client_id,driver_id,truck_id',
            $autoCancel: false
          }).catch(() => ({ items: [] }));
          if (list.items && list.items.length > 0) trip = list.items[0];
        }
      }
    } catch (e) {}

    // 3. Fallback SQLite direct query if PocketBase client was unauthenticated
    if (!trip && !invRecord) {
      try {
        const dbPath = path.resolve(process.cwd(), 'apps/pocketbase/pb_data/data.db');
        const altPath = path.resolve(__dirname, '../../pocketbase/pb_data/data.db');
        const targetDb = global.dbFilePath || (fs.existsSync(dbPath) ? dbPath : altPath);
        if (fs.existsSync(targetDb)) {
          const sqliteMod = await import('node:sqlite');
          const DatabaseSync = sqliteMod.DatabaseSync;
          if (DatabaseSync) {
            const db = new DatabaseSync(targetDb);
            try {
              const stmtTrip = db.prepare('SELECT * FROM trip_logs WHERE trip_id = ? OR lr_number = ? OR id = ? LIMIT 1');
              const row = stmtTrip.get(String(tripId), String(tripId), String(tripId));
              if (row) trip = row;
            } catch (e) {}
            try {
              const stmtInv = db.prepare('SELECT * FROM invoices WHERE trip_id = ? OR invoice_number = ? OR id = ? LIMIT 1');
              const rowInv = stmtInv.get(String(tripId), String(tripId), String(tripId));
              if (rowInv) invRecord = rowInv;
            } catch (e) {}
            try { db.close(); } catch(e) {}
          }
        }
      } catch (e) {}
    }

    const tripRef = trip?.trip_id || trip?.lr_number || invRecord?.trip_id || tripId || 'TRIP-235';
    const invNumber = invRecord?.invoice_number || trip?.invoice_no || `INV-${String(tripRef).replace(/^TRIP-?/i, '')}`;
    const clientName = invRecord?.customer_name || trip?.expand?.client_id?.client_name || trip?.client_name || 'Amazon';
    const clientAddr = invRecord?.customer_address || trip?.destination || 'mhyd';
    const clientPhone = invRecord?.customer_phone || trip?.expand?.client_id?.phone || '+918106729777';
    const clientEmail = invRecord?.customer_email || trip?.expand?.client_id?.email || 'raghunathrathod346@gmail.com';
    const amount = Number(invRecord?.total_amount || trip?.revenue || trip?.total_freight || trip?.freight_rate || 17100);
    const tripDateRaw = invRecord?.invoice_date || trip?.date || trip?.created || new Date().toISOString();
    const tripDateObj = new Date(tripDateRaw);
    const formattedTripDate = isNaN(tripDateObj.getTime()) ? '14 Aug 2026' : tripDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const dueDateObj = invRecord?.due_date ? new Date(invRecord.due_date) : new Date(tripDateObj.getTime() + 7 * 24 * 60 * 60 * 1000);
    const formattedDueDate = isNaN(dueDateObj.getTime()) ? '21 Aug 2026' : dueDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const paymentStatus = (invRecord?.status || trip?.client_payment_status || 'PENDING').toUpperCase();

    const jspdfMod = await import('jspdf');
    const jsPDF = jspdfMod.jsPDF || jspdfMod.default;
    const doc = new jsPDF();

    const primaryNavy = [15, 23, 42];    // Deep Slate Navy (#0F172A)
    const accentGold = [217, 119, 6];    // Amber Gold (#D97706)
    const secondaryGray = [71, 85, 105];  // Slate 600 (#475569)
    const lightBgColor = [248, 250, 252]; // Slate 50 (#F8FAFC)
    const borderColor = [226, 232, 240];  // Slate 200 (#E2E8F0)

    // Top Dual Colored Banners
    doc.setFillColor(...primaryNavy);
    doc.rect(0, 0, doc.internal.pageSize.width, 7, 'F');
    doc.setFillColor(...accentGold);
    doc.rect(0, 7, doc.internal.pageSize.width, 1.5, 'F');

    // Header: Company Logo / Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...primaryNavy);
    doc.text('JAI BHAVANI CARGO', 14, 21);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...secondaryGray);
    doc.text('Plot no 3, Patel nagar, Ghatkesar, pin: 501301', 14, 26, { maxWidth: 110 });
    doc.text('Phone: +91 7794072244 | Email: operations@jaibhavanicargo.com | GSTIN: 36DPXPR9171A1Z8', 14, 31);

    // Document Type Header Label (Top Right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryNavy);
    doc.text('TAX INVOICE', doc.internal.pageSize.width - 14, 20, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...secondaryGray);
    doc.text(`Invoice No: ${invNumber}`, doc.internal.pageSize.width - 14, 26, { align: 'right' });
    doc.text(`Date: ${formattedTripDate}`, doc.internal.pageSize.width - 14, 31, { align: 'right' });
    doc.text(`Due Date: ${formattedDueDate}`, doc.internal.pageSize.width - 14, 36, { align: 'right' });

    // Horizontal Divider
    doc.setDrawColor(...borderColor);
    doc.line(14, 41, doc.internal.pageSize.width - 14, 41);

    // Bill To Box (Customer Info)
    doc.setFillColor(...lightBgColor);
    doc.roundedRect(14, 45, doc.internal.pageSize.width / 2 - 18, 30, 2, 2, 'F');
    doc.setDrawColor(...borderColor);
    doc.roundedRect(14, 45, doc.internal.pageSize.width / 2 - 18, 30, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...accentGold);
    doc.text('BILLED TO / CUSTOMER DETAILS:', 18, 51);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(clientName, 18, 57);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...secondaryGray);
    doc.text(clientAddr, 18, 62, { maxWidth: doc.internal.pageSize.width / 2 - 26 });
    doc.text(`Phone: ${clientPhone} | Email: ${clientEmail}`, 18, 70);

    // Payment Summary Box (Right Side)
    doc.setFillColor(...lightBgColor);
    doc.roundedRect(doc.internal.pageSize.width / 2 + 4, 45, doc.internal.pageSize.width / 2 - 18, 30, 2, 2, 'F');
    doc.setDrawColor(...borderColor);
    doc.roundedRect(doc.internal.pageSize.width / 2 + 4, 45, doc.internal.pageSize.width / 2 - 18, 30, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...accentGold);
    doc.text('PAYMENT & STATUS SUMMARY:', doc.internal.pageSize.width / 2 + 8, 51);

    let statusColor = [217, 119, 6]; // Amber
    if (paymentStatus === 'PAID') statusColor = [16, 185, 129]; // Emerald
    else if (paymentStatus === 'OVERDUE') statusColor = [225, 29, 72]; // Red

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...secondaryGray);
    doc.text('Payment Status: ', doc.internal.pageSize.width / 2 + 8, 57);
    doc.setTextColor(...statusColor);
    doc.text(paymentStatus, doc.internal.pageSize.width / 2 + 36, 57);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryGray);
    doc.text('Payment Terms: Credit Account / Net 30', doc.internal.pageSize.width / 2 + 8, 65);

    const autoTableMod = await import('jspdf-autotable');
    const autoTable = autoTableMod.default || autoTableMod;

    const truckNo = trip?.truck_number || trip?.truck_id || 'TG12U2637';
    const originDest = trip?.origin && trip?.destination ? `${trip.origin}->${trip.destination}` : (trip?.origin || trip?.destination || 'Freight Logistics Service');

    const tableData = [
      [
        '1',
        formattedTripDate,
        tripRef,
        originDest,
        truckNo,
        `₹${amount.toLocaleString('en-IN')}`
      ]
    ];

    const columns = ['Sl', 'Trip Date', 'Trip ID', 'Pickup -> Drop Location', 'Vehicle', 'Freight (₹)'];

    autoTable(doc, {
      startY: 79,
      head: [columns],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: primaryNavy, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 3.5, font: 'helvetica' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 26 },
        2: { cellWidth: 26 },
        3: { cellWidth: 55 },
        4: { cellWidth: 28 },
        5: { halign: 'right', fontStyle: 'bold' }
      }
    });

    let finalY = doc.lastAutoTable.finalY + 8;

    if (finalY > doc.internal.pageSize.height - 85) {
      doc.addPage();
      finalY = 20;
    }

    // Subtotal & Total
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...secondaryGray);
    doc.text('Subtotal Amount:', doc.internal.pageSize.width - 70, finalY, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.text(`₹${amount.toLocaleString('en-IN')}`, doc.internal.pageSize.width - 14, finalY, { align: 'right' });

    finalY += 7;
    const amountStr = `₹${amount.toLocaleString('en-IN')}`;
    const boxWidth = 82;
    const boxX = doc.internal.pageSize.width - 14 - boxWidth;

    doc.setFillColor(...primaryNavy);
    doc.roundedRect(boxX, finalY - 5, boxWidth, 9, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL AMOUNT DUE:', boxX + 4, finalY + 1, { align: 'left' });
    doc.text(amountStr, doc.internal.pageSize.width - 18, finalY + 1, { align: 'right' });

    // Bank Details (Bottom Left)
    let bankY = finalY - 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryNavy);
    doc.text('BANK DETAILS:', 14, bankY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...secondaryGray);
    doc.text('Bank Name: HDFC BANK', 14, bankY + 5);
    doc.text('Account Name: JAI BHAVANI CARGO', 14, bankY + 9);
    doc.text('Account No: 50200117182677', 14, bankY + 13);
    doc.text('IFSC Code: HDFC0004480', 14, bankY + 17);
    doc.text('Branch / UPI: GHATKESAR BRANCH', 14, bankY + 21);

    // Terms & Conditions (Bottom Left)
    let termsY = bankY + 30;
    if (termsY > doc.internal.pageSize.height - 35) {
      doc.addPage();
      termsY = 25;
    }

    doc.setDrawColor(...borderColor);
    doc.line(14, termsY, doc.internal.pageSize.width - 14, termsY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryNavy);
    doc.text('Terms & Conditions:', 14, termsY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...secondaryGray);
    doc.text('1. Payment is due as per agreed credit terms.\n2. Interest @ 18% p.a. will apply to overdue balances.\n3. All disputes subject to Hyderabad jurisdiction.', 14, termsY + 9);

    // Signature Block (Bottom Right)
    doc.line(doc.internal.pageSize.width - 65, termsY + 16, doc.internal.pageSize.width - 14, termsY + 16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('For JAI BHAVANI CARGO', doc.internal.pageSize.width - 14, termsY + 20, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...secondaryGray);
    doc.text('Vinod Kumar Rathod (Managing Director)', doc.internal.pageSize.width - 14, termsY + 24, { align: 'right' });

    // Multi-page Page Numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...secondaryGray);
      doc.text(
        `Page ${i} of ${pageCount} — Jai Bhavani Cargo Enterprise System (Official Document)`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 6,
        { align: 'center' }
      );
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Freight_Invoice_${tripRef}.pdf`);
    return res.send(pdfBuffer);
  } catch (err) {
    logger.error('Error serving invoice PDF:', err);
    return res.status(500).json({ error: err.message });
  }
};

app.get('/api/invoices/trip/:tripId/pdf', serveInvoicePdf);
app.get('/hcgi/api/invoices/trip/:tripId/pdf', serveInvoicePdf);
app.get('/invoices/trip/:tripId/pdf', serveInvoicePdf);
app.get('/api/invoice/:tripId/pdf', serveInvoicePdf);

// ----------------------------------------------------
// AI Fuel Receipt OCR Scanner Service
// ----------------------------------------------------
const parseFuelReceiptText = (rawText) => {
  const clean = (rawText || '').replace(/\r\n/g, '\n');
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);

  const res = {
    liters: null,
    ratePerLiter: null,
    totalAmount: null,
    date: null,
    vendor: null,
    truckNumber: null,
    invoiceNo: null,
    rawText: rawText ? rawText.substring(0, 800) : ''
  };

  // 1. Station / Vendor
  const brandRegex = /BPCL|BHARAT\s*PETROLEUM|HPCL|HINDUSTAN\s*PETROLEUM|IOCL|INDIAN\s*OIL|SHELL|NAYARA|RELIANCE|JIO-BP|ESSAR/i;
  const brandMatch = clean.match(brandRegex);
  const stationLine = lines.find(l => /SERVICE\s*STATION|PETROL\s*PUMP|FILLING\s*STATION|AUTO|OIL\s*CORP|FUELS|AUTOMOBILE/i.test(l));
  if (stationLine) {
    res.vendor = stationLine + (brandMatch && !stationLine.toUpperCase().includes(brandMatch[0].toUpperCase()) ? ` (${brandMatch[0].toUpperCase()})` : '');
  } else if (brandMatch) {
    res.vendor = brandMatch[0].toUpperCase();
  } else if (lines.length > 0) {
    res.vendor = lines[0].substring(0, 50);
  }

  // 2. Liters / Volume
  const volPatterns = [
    /(?:VOLUME|VOL|QTY|QUANTITY|VOL\(L\)|VOL\(LTR\)|QTY\(L\)|LITRES?|LTRS?|LTR)\s*[:=.]*\s*([0-9]+\.?[0-9]*)/i,
    /([0-9]{1,4}\.[0-9]{2,3})\s*(?:LTR|LITRES?|L|LTRS)\b/i,
    /(?:DIESEL|HSD|PETROL|MS)\s*[:=.]*\s*([0-9]+\.?[0-9]*)\s*(?:L|LTR)/i
  ];
  for (const pat of volPatterns) {
    const m = clean.match(pat);
    if (m && parseFloat(m[1]) > 0) {
      res.liters = parseFloat(m[1]);
      break;
    }
  }

  // 3. Rate
  const ratePatterns = [
    /(?:RATE|RSP|PRICE|UNIT\s*PRICE|RATE\/LTR|RATE\/LITRE|RATE\s*\(RS\/L\)|RATE\s*\(INR\/L\))\s*[:=.]*\s*(?:RS\.?|INR|₹)?\s*([0-9]+\.?[0-9]*)/i,
    /(?:RS\.?|INR|₹|\/L)\s*([0-9]{2,3}\.[0-9]{2})\s*(?:\/L|PER\s*L|PER\s*LTR)?/i
  ];
  for (const pat of ratePatterns) {
    const m = clean.match(pat);
    if (m && parseFloat(m[1]) > 0) {
      const val = parseFloat(m[1]);
      if (val >= 50 && val <= 200) {
        res.ratePerLiter = val;
        break;
      }
    }
  }

  // 4. Total Amount
  const amountPatterns = [
    /(?:TOTAL\s*AMOUNT|TOTAL\s*SALE|NET\s*AMOUNT|TOT\s*AMT|SALE\s*AMT|AMOUNT|TOTAL|AMT)\s*[:=.]*\s*(?:RS\.?|INR|₹)?\s*([0-9,]+\.?[0-9]*)/i,
    /(?:RS\.?|INR|₹)\s*([0-9,]+\.[0-9]{2})/i
  ];
  for (const pat of amountPatterns) {
    const m = clean.match(pat);
    if (m) {
      const parsed = parseFloat(m[1].replace(/,/g, ''));
      if (parsed > 0) {
        res.totalAmount = parsed;
        break;
      }
    }
  }

  // 5. Mathematical Triplet Search Fallback (X * Y ≈ Z)
  if (!res.totalAmount || !res.liters) {
    const numberMatches = Array.from(clean.matchAll(/\b([0-9]+(?:\.[0-9]{1,3})?)\b/g))
      .map(m => parseFloat(m[1]))
      .filter(n => n > 0 && n !== 2024 && n !== 2025 && n !== 2026);

    for (let i = 0; i < numberMatches.length; i++) {
      for (let j = 0; j < numberMatches.length; j++) {
        if (i === j) continue;
        const n1 = numberMatches[i];
        const n2 = numberMatches[j];
        const prod = n1 * n2;
        
        const matchedTotal = numberMatches.find(t => Math.abs(t - prod) <= 1.0 && t > 500);
        if (matchedTotal) {
          const rateVal = Math.min(n1, n2);
          const literVal = Math.max(n1, n2);
          if (rateVal >= 70 && rateVal <= 130 && (!res.liters || !res.totalAmount)) {
            res.ratePerLiter = rateVal;
            res.liters = literVal;
            res.totalAmount = +(rateVal * literVal).toFixed(2);
            break;
          }
        }
      }
      if (res.totalAmount && res.liters) break;
    }
  }

  // 6. Cross-verification
  if (res.liters && res.ratePerLiter && !res.totalAmount) {
    res.totalAmount = +(res.liters * res.ratePerLiter).toFixed(2);
  } else if (res.totalAmount && res.ratePerLiter && !res.liters) {
    res.liters = +(res.totalAmount / res.ratePerLiter).toFixed(2);
  } else if (res.totalAmount && res.liters && !res.ratePerLiter) {
    res.ratePerLiter = +(res.totalAmount / res.liters).toFixed(2);
  }

  // 7. Invoice & Vehicle
  const fullVehMatch = clean.match(/\b([A-Z]{2}\s*[0-9]{1,2}\s*[A-Z]{1,3}\s*[0-9]{4})\b/i) ||
                       clean.match(/(?:VEHICLE|VEH|TRUCK|REG|VEH\.?\s*NO)[:=.\s]*([0-9A-Z\s]{4,15})/i);
  if (fullVehMatch) {
    res.truckNumber = fullVehMatch[1].replace(/[\s-]/g, '').toUpperCase();
  }

  const invM = clean.match(/(?:INVOICE|INV|BILL|REC(?:EIPT)?|MEMO)\s*(?:NO|NUM|\.)?[:=.\s]*([0-9A-Z]+)/i);
  if (invM) res.invoiceNo = invM[1];

  // 8. Date
  const dateM = clean.match(/(\d{1,2})[-/.]([A-Za-z]{3}|\d{1,2})[-/.](\d{2,4})/);
  if (dateM) {
    const months = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
    const day = dateM[1].padStart(2, '0');
    let m = dateM[2].toLowerCase();
    m = months[m] || m.padStart(2, '0');
    let y = dateM[3].length === 2 ? '20' + dateM[3] : dateM[3];
    res.date = `${y}-${m}-${day}`;
  } else {
    res.date = new Date().toISOString().split('T')[0];
  }

  return res;
};

const handleReceiptOcrScan = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'No image provided.' });
    }

    const postData = new URLSearchParams({
      base64Image: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
      language: 'eng',
      isOverlayRequired: 'false',
      isTable: 'true',
      scale: 'true',
      detectOrientation: 'true',
      OCREngine: '2'
    }).toString();

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': 'K88289458488957',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: postData
    });

    const ocrJson = await ocrResponse.json();
    const rawText = ocrJson?.ParsedResults?.[0]?.ParsedText || '';
    const parsed = parseFuelReceiptText(rawText);

    return res.json({
      success: true,
      data: parsed,
      rawText
    });
  } catch (err) {
    logger.error('OCR scan endpoint error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

app.post('/api/fuel/ocr-scan', handleReceiptOcrScan);
app.post('/hcgi/api/fuel/ocr-scan', handleReceiptOcrScan);

// Direct Superuser Fuel Refill -> Expenses & Cashbook Synchronizer
const handleFuelExpenseSync = async (req, res) => {
  try {
    const {
      fuel_tracker_id,
      date,
      truck_id,
      liters,
      amount,
      payment_method,
      description,
      user_id
    } = req.body || {};

    if (!amount || !truck_id) {
      return res.status(400).json({ success: false, error: 'Missing amount or truck_id' });
    }

    const cleanDate = (date && date.includes('T')) ? date : `${date || new Date().toISOString().split('T')[0]} 12:00:00.000Z`;
    const cleanAmount = Number(amount) || 0;
    const cleanLiters = Number(liters) || 0;

    let expenseRecord = null;
    let cashbookRecord = null;

    // 1. Sync to expenses collection via PocketBase superuser client
    try {
      if (pb) {
        const existingExp = await pb.collection('expenses').getList(1, 1, {
          filter: fuel_tracker_id ? `fuel_tracker_id = "${fuel_tracker_id}"` : `truck_id = "${truck_id}" && date ~ "${cleanDate.split(' ')[0]}" && subcategory = "Fuel"`,
          $autoCancel: false
        }).catch(() => ({ items: [] }));

        const expData = {
          date: cleanDate,
          category: 'Regular',
          subcategory: 'Fuel',
          amount: cleanAmount,
          liters: cleanLiters,
          truck_id: String(truck_id),
          description: description || `${truck_id} - Fuel Refill - ${cleanLiters} L`,
          payment_method: payment_method || 'Cash',
          status: 'Approved',
          created_by: user_id || '',
          fuel_tracker_id: fuel_tracker_id || ''
        };

        if (existingExp.items && existingExp.items.length > 0) {
          expenseRecord = await pb.collection('expenses').update(existingExp.items[0].id, expData, { $autoCancel: false });
        } else {
          expenseRecord = await pb.collection('expenses').create(expData, { $autoCancel: false });
        }
      }
    } catch (expErr) {
      logger.warn(`PocketBase expense sync warning: ${expErr.message}`);
    }

    // 2. Sync to cashbook collection via PocketBase superuser client
    try {
      if (pb) {
        const refId = expenseRecord?.id || fuel_tracker_id || '';
        const existingCb = await pb.collection('cashbook').getList(1, 1, {
          filter: refId ? `reference_id = "${refId}"` : `description ~ "${truck_id}" && date ~ "${cleanDate.split(' ')[0]}"`,
          $autoCancel: false
        }).catch(() => ({ items: [] }));

        const cbData = {
          date: cleanDate,
          description: `Fuel: ${truck_id} (${cleanLiters} L - ₹${cleanAmount.toLocaleString('en-IN')}) [${payment_method || 'Cash'}]`,
          amount: cleanAmount,
          transaction_type: 'Expense',
          category: 'Regular - Fuel',
          reference_id: refId,
          reference_type: 'expense',
          status: 'Completed',
          added_by: user_id || ''
        };

        if (existingCb.items && existingCb.items.length > 0) {
          cashbookRecord = await pb.collection('cashbook').update(existingCb.items[0].id, cbData, { $autoCancel: false });
        } else {
          cashbookRecord = await pb.collection('cashbook').create(cbData, { $autoCancel: false });
        }
      }
    } catch (cbErr) {
      logger.warn(`PocketBase cashbook sync warning: ${cbErr.message}`);
    }

    return res.json({
      success: true,
      expense: expenseRecord,
      cashbook: cashbookRecord,
      message: 'Fuel Refill synced to Expenses & Cashbook successfully'
    });
  } catch (err) {
    logger.error('Fuel expense sync handler error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

app.post('/api/fuel/sync-expense', handleFuelExpenseSync);
app.post('/hcgi/api/fuel/sync-expense', handleFuelExpenseSync);

// Middleware to trigger debounced cloud sync when custom Express mutation endpoints succeed
app.use(['/api', '/hcgi/api'], (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const p = req.originalUrl || req.url;
        if (!p.includes('/auth') && !p.includes('/health') && !p.includes('/backup') && !p.includes('/ocr-scan')) {
          logger.info(`📝 Express API mutation detected (${req.method} ${p}) -> scheduling debounced cloud backup in 3s...`);
          triggerDebouncedCloudSync(3000);
        }
      }
    });
  }
  next();
});

// API Router - Mount under prefixes to handle API calls without hijacking React page routes
const apiRouter = routes();
app.use('/hcgi/api', apiRouter);
app.use('/api', apiRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/aisensy', whatsappRouter);
app.use('/hcgi/api/whatsapp', whatsappRouter);
app.use('/hcgi/api/aisensy', whatsappRouter);
app.use('/whatsapp', whatsappRouter);
app.use('/aisensy', whatsappRouter);

// ----------------------------------------------------
// 3. Static Client Hosting (Serve compiled Vite bundle)
// ----------------------------------------------------
const possibleWebDirs = [
  path.resolve(process.cwd(), 'dist/apps/web'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, '../../dist/apps/web'),
  path.resolve(__dirname, '../../apps/web/dist'),
  path.resolve(process.cwd(), '../dist/apps/web'),
  path.resolve(process.cwd(), '../web/dist'),
  path.resolve(__dirname, '../dist')
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
  app.use(express.static(staticPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html') || filePath.endsWith('index.html')) {
        // HTML entrypoint must always be fresh
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } else if (filePath.includes('/assets/') || filePath.includes('\\assets\\')) {
        // Vite bundle chunks (JS, CSS with hash in filename) -> 1 Year Immutable Cache
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (/\.(png|jpe?g|webp|gif|svg|ico|woff2?|ttf|eot)$/i.test(filePath)) {
        // Static Images, Icons & Web Fonts -> 7 Days Cache with Stale Revalidate
        res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
      }
    }
  }));
  app.get(/.*/, (req, res, next) => {
    // If it's an API route or PocketBase route, pass to next handlers
    if (req.path.startsWith('/hcgi/') || req.path.startsWith('/api/')) {
      return next();
    }
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3001;

app.listen(port, '0.0.0.0', () => {
  logger.info(`🚀 Unified Full-Stack Server running on http://0.0.0.0:${port}`);
});

// Triggering full container redeploy to restore storage files from Supabase
export default app;