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

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('trust proxy', true);

// ----------------------------------------------------
// Supabase Sync Persistence Configurations
// ----------------------------------------------------
const supabaseUrl = 'https://bwyashgnriarmuhosqov.supabase.co';
const supabaseKey = 'sb_secret_Oay759_VoPC2O_ifxAfcSA_09LkApAM';

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

const watchAndSyncDatabase = (dbFilePath) => {
  let uploadTimeout = null;

  fs.watch(dbFilePath, (eventType, filename) => {
    if (eventType === 'change') {
      if (uploadTimeout) clearTimeout(uploadTimeout);
      
      uploadTimeout = setTimeout(async () => {
        try {
          logger.info(`🔄 Local database file changed. Syncing backup to Supabase...`);
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
          } else {
            logger.error(`❌ Failed to sync database backup to Supabase: ${uploadRes.statusText}`);
          }
        } catch (err) {
          logger.error(`❌ Error uploading database backup to Supabase: ${err.message}`);
        }
      }, 5000);
    }
  });
};

// ----------------------------------------------------
// 1. Spawning PocketBase in the Background Automatically
// ----------------------------------------------------
const runPocketBase = async () => {
  const isWin = process.platform === 'win32';
  const pbBinary = isWin ? 'pocketbase.exe' : 'pocketbase';
  
  // Find binary path (handle local development vs production layouts)
  const possiblePbDirs = [
    path.resolve(__dirname, '../../../pocketbase'),
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

  // Sync latest database from Supabase Storage before boot
  await downloadDatabaseFromSupabase(dbFilePath);

  logger.info(`🚀 Spawning PocketBase: ${pbPath} --dir=${dataDir}`);

  if (!isWin) {
    try {
      fs.chmodSync(pbPath, '755');
    } catch (e) {
      logger.error('Failed to set execute permissions on PocketBase binary:', e.message);
    }
  }

  const pbProcess = spawn(pbPath, [
    'serve',
    '--http=127.0.0.1:8090',
    `--dir=${dataDir}`,
    '--hooksWatch=false'
  ], { stdio: 'pipe' });

  // Watch and sync changes
  watchAndSyncDatabase(dbFilePath);

  pbProcess.stdout.on('data', (data) => {
    logger.info(`[PocketBase] ${data.toString().trim()}`);
  });

  pbProcess.stderr.on('data', (data) => {
    logger.error(`[PocketBase Error] ${data.toString().trim()}`);
  });

  pbProcess.on('close', (code) => {
    logger.warn(`PocketBase process closed with code ${code}. Restarting in 5s...`);
    setTimeout(runPocketBase, 5000);
  });
};

runPocketBase();

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

process.on('SIGINT', async () => {
  logger.info('Interrupted');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received');
  await new Promise(resolve => setTimeout(resolve, 3000));
  logger.info('Exiting');
  process.exit();
});

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allow local iframe embedding/scripts
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(globalRateLimit);
app.use(express.json({ limit: BodyLimit }));
app.use(express.urlencoded({ extended: true, limit: BodyLimit }));

// API Router
app.use('/', routes());

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

export default app;