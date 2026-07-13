import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

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
const supabaseKey = process.env.SUPABASE_KEY || '';

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

// Core upload helper — reused by all sync strategies
const uploadDatabaseToSupabase = async (dbFilePath) => {
  try {
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

let _syncStarted = false;
const watchAndSyncDatabase = (dbFilePath) => {
  if (_syncStarted) return; // Only register once across PocketBase restarts
  _syncStarted = true;
  let uploadTimeout = null;
  let periodicSyncInterval = null;
  const PERIODIC_SYNC_MS = 2 * 60 * 60 * 1000; // 2 hours

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

  // ── Strategy 3: Graceful shutdown — save before process exits ──
  const gracefulShutdownSync = async (signal) => {
    logger.info(`🛑 ${signal} received — performing final database sync to Supabase before shutdown...`);
    await uploadDatabaseToSupabase(dbFilePath);
    logger.info('✅ Final sync complete. Exiting.');
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

const downloadFolderFromSupabase = async (prefix, localBaseDir) => {
  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/list/backups`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefix, limit: 1000 })
    });
    
    if (!res.ok) return;
    const items = await res.json();
    if (!Array.isArray(items)) {
      logger.warn(`⚠️ Supabase folder list returned non-array: ${JSON.stringify(items)}`);
      return;
    }
    for (const item of items) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        // Recursively download subdirectory
        await downloadFolderFromSupabase(itemPath, localBaseDir);
      } else {
        const relativePath = itemPath.substring('storage/'.length);
        const localFilePath = path.join(localBaseDir, relativePath);
        if (!fs.existsSync(localFilePath)) {
          await downloadFileFromSupabase(itemPath, localFilePath);
        }
      }
    }
  } catch (err) {
    logger.error(`❌ Error walking Supabase folder ${prefix}: ${err.message}`);
  }
};

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
  const storageDir = path.join(dataDir, 'storage');

  // Sync latest database from Supabase Storage before boot
  await downloadDatabaseFromSupabase(dbFilePath);

  // Sync latest storage files from Supabase Storage asynchronously before boot!
  logger.info(`📥 Restoring storage files from Supabase in the background...`);
  downloadFolderFromSupabase('storage', storageDir).catch(err => {
    logger.error(`❌ Error restoring storage files: ${err.message}`);
  });

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

  // Watch and sync DB + storage (guarded — only registers once across restarts)
  watchAndSyncDatabase(dbFilePath);
  startStorageBackgroundSync(storageDir);

  pbProcess.stdout.on('data', (data) => {
    logger.info(`[PocketBase] ${data.toString().trim()}`);
  });

  pbProcess.stderr.on('data', (data) => {
    logger.error(`[PocketBase Error] ${data.toString().trim()}`);
  });

  pbProcess.on('close', (code) => {
    logger.warn(`PocketBase process exited with code ${code}. Restarting in 5s...`);
    // Force a sync before restarting so we don't lose data
    uploadDatabaseToSupabase(dbFilePath).finally(() => {
      setTimeout(runPocketBase, 5000);
    });
  });
};

runPocketBase();

// Start end-of-month leaderboard + payroll cron job
startMonthEndCron();


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