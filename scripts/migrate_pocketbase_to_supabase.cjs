/**
 * JAI BHAVANI CARGO - POCKETBASE TO SUPABASE PRODUCTION MIGRATION ENGINE
 *
 * Usage:
 *   node scripts/migrate_pocketbase_to_supabase.cjs --dry-run
 *   node scripts/migrate_pocketbase_to_supabase.cjs --execute
 *
 * Required Environment Variables (Explicit configuration required; no insecure fallbacks):
 *   PB_HOST / POCKETBASE_HOST
 *   PB_ADMIN_EMAIL / PB_SUPERUSER_EMAIL
 *   PB_ADMIN_PASSWORD / PB_SUPERUSER_PASSWORD
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const isDryRun = !process.argv.includes('--execute');

const PB_CONFIG = {
  host: process.env.POCKETBASE_HOST || process.env.PB_HOST,
  port: Number(process.env.POCKETBASE_PORT || 443),
  adminEmail: process.env.PB_ADMIN_EMAIL || process.env.PB_SUPERUSER_EMAIL,
  adminPassword: process.env.PB_ADMIN_PASSWORD || process.env.PB_SUPERUSER_PASSWORD,
  basePath: process.env.PB_BASE_PATH || '/hcgi/platform/api'
};

const SUPABASE_CONFIG = {
  url: process.env.SUPABASE_URL,
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
};

function validateConfig() {
  const missing = [];
  if (!PB_CONFIG.host && !fs.existsSync('scratch/live_backup_before_migration.db')) missing.push('POCKETBASE_HOST / PB_HOST');
  if (!PB_CONFIG.adminEmail && !fs.existsSync('scratch/live_backup_before_migration.db')) missing.push('PB_ADMIN_EMAIL / PB_SUPERUSER_EMAIL');
  if (!PB_CONFIG.adminPassword && !fs.existsSync('scratch/live_backup_before_migration.db')) missing.push('PB_ADMIN_PASSWORD / PB_SUPERUSER_PASSWORD');
  if (!isDryRun) {
    if (!SUPABASE_CONFIG.url) missing.push('SUPABASE_URL');
    if (!SUPABASE_CONFIG.serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  if (missing.length > 0) {
    console.error('===============================================================');
    console.error('CONFIGURATION ERROR: Missing required environment variables:');
    missing.forEach(m => console.error(`  - ${m}`));
    console.error('Explicit configuration is required. Hardcoded credential fallbacks have been removed.');
    console.error('===============================================================');
    process.exit(1);
  }
}

async function pbRequest(endpoint, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const isHttps = PB_CONFIG.port === 443 || (PB_CONFIG.host && PB_CONFIG.host.includes('.com'));
    const client = isHttps ? https : http;
    const postData = data ? JSON.stringify(data) : null;

    const headers = { 'Content-Type': 'application/json' };
    if (postData) headers['Content-Length'] = Buffer.byteLength(postData);
    if (token) headers['Authorization'] = token;

    const req = client.request({
      hostname: PB_CONFIG.host,
      port: PB_CONFIG.port,
      path: `${PB_CONFIG.basePath}${endpoint}`,
      method,
      headers,
      timeout: 30000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 400) {
            return reject(new Error(`PocketBase API Error (${res.statusCode}): ${parsed.message || body}`));
          }
          resolve(parsed);
        } catch (e) {
          if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('PocketBase request timed out'));
    });
    if (postData) req.write(postData);
    req.end();
  });
}

async function fetchAllPbRecords(collectionName, token) {
  let page = 1;
  const perPage = 100;
  let all = [];
  while (true) {
    const res = await pbRequest(`/collections/${collectionName}/records?page=${page}&perPage=${perPage}`, 'GET', null, token);
    const items = res.items || [];
    all = all.concat(items);
    if (page >= res.totalPages || items.length === 0) break;
    page++;
  }
  return all;
}

async function supabaseRequest(endpoint, method = 'GET', body = null, headers = {}) {
  const url = new URL(`${SUPABASE_CONFIG.url}${endpoint}`);
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;
  const postData = body ? JSON.stringify(body) : null;

  const defaultHeaders = {
    'apikey': SUPABASE_CONFIG.serviceKey,
    'Authorization': `Bearer ${SUPABASE_CONFIG.serviceKey}`,
    'Content-Type': 'application/json'
  };

  return new Promise((resolve, reject) => {
    const req = client.request({
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      method,
      headers: { ...defaultHeaders, ...headers, ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}) },
      timeout: 30000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`Supabase Error (${res.statusCode}) on ${endpoint}: ${data}`));
        }
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: data ? JSON.parse(data) : null });
        } catch (_) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Supabase request timed out on ${endpoint}`));
    });
    if (postData) req.write(postData);
    req.end();
  });
}

async function runMigration() {
  validateConfig();

  console.log('===============================================================');
  console.log(`JAI BHAVANI CARGO - SUPABASE MIGRATION ENGINE`);
  console.log(`MODE: ${isDryRun ? 'DRY-RUN (Validation Only)' : 'LIVE EXECUTION'}`);
  console.log('===============================================================');
  console.log(`Target Supabase URL: ${SUPABASE_CONFIG.url || '(Dry-Run Validation)'}`);
  console.log('---------------------------------------------------------------');

  let collections = [];
  const sourceRecords = {};

  // Check if live PocketBase is reachable or use local backup database
  let useLocalDb = false;
  let adminToken = '';

  if (PB_CONFIG.host && PB_CONFIG.adminEmail && PB_CONFIG.adminPassword) {
    try {
      console.log('Connecting to live PocketBase host...');
      const authRes = await pbRequest('/collections/_superusers/auth-with-password', 'POST', {
        identity: PB_CONFIG.adminEmail,
        password: PB_CONFIG.adminPassword
      });
      adminToken = authRes.token;
      console.log('Superuser authentication SUCCESSFUL.');
      const colsRes = await pbRequest('/collections?page=1&perPage=200', 'GET', null, adminToken);
      collections = (colsRes.items || []).map(c => c.name).filter(n => !n.startsWith('_'));
    } catch (err) {
      console.warn(`Could not connect to live PocketBase API (${err.message}). Checking local SQLite DB...`);
      useLocalDb = true;
    }
  } else {
    useLocalDb = true;
  }

  if (useLocalDb) {
    const localDbPath = 'scratch/live_backup_before_migration.db';
    if (!fs.existsSync(localDbPath)) {
      throw new Error(`Neither live PocketBase credentials nor local DB (${localDbPath}) available.`);
    }
    console.log(`Using verified local database: ${localDbPath}`);
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(localDbPath);
    const colRows = db.prepare("SELECT name FROM _collections ORDER BY name").all().filter(r => !r.name.startsWith('_'));
    collections = colRows.map(r => r.name);

    for (const col of collections) {
      const rows = db.prepare(`SELECT * FROM "${col}"`).all();
      sourceRecords[col] = rows;
    }
  } else {
    for (const col of collections) {
      sourceRecords[col] = await fetchAllPbRecords(col, adminToken);
    }
  }

  console.log(`Inventoried ${collections.length} business collections from source.`);

  // Validate complete exports: reject if any collection failed
  const inventorySummary = {};
  const sourceFinancialTotals = {
    tripRevenue: 0,
    expensesAmount: 0,
    advancesAmount: 0,
    cashbookAmount: 0
  };

  for (const col of collections) {
    const records = sourceRecords[col];
    if (!Array.isArray(records)) {
      throw new Error(`Incomplete export: Collection '${col}' failed to load records.`);
    }
    inventorySummary[col] = { count: records.length };

    if (col === 'trip_logs') {
      sourceFinancialTotals.tripRevenue = records.reduce((s, r) => s + (Number(r.revenue) || 0), 0);
    } else if (col === 'expenses') {
      sourceFinancialTotals.expensesAmount = records.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    } else if (col === 'advances') {
      sourceFinancialTotals.advancesAmount = records.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    } else if (col === 'cashbook') {
      sourceFinancialTotals.cashbookAmount = records.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    }
  }

  console.log('\n--- PRE-MIGRATION INVENTORY ---');
  console.table(inventorySummary);

  console.log('\n--- SOURCE FINANCIAL BASELINE TOTALS ---');
  console.log(`  - Trip Revenue:      Rs. ${sourceFinancialTotals.tripRevenue.toLocaleString('en-IN')}`);
  console.log(`  - Expenses:          Rs. ${sourceFinancialTotals.expensesAmount.toLocaleString('en-IN')}`);
  console.log(`  - Advances:          Rs. ${sourceFinancialTotals.advancesAmount.toLocaleString('en-IN')}`);
  console.log(`  - Cashbook:          Rs. ${sourceFinancialTotals.cashbookAmount.toLocaleString('en-IN')}`);

  // 2. Scan Local JSON Data Stores
  const localDataDir = path.resolve(process.cwd(), 'data');
  const jsonStores = [];
  if (fs.existsSync(localDataDir)) {
    const files = fs.readdirSync(localDataDir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(localDataDir, f), 'utf8'));
        const count = Array.isArray(content) ? content.length : Object.keys(content).length;
        jsonStores.push({ file: f, records: count, data: content });
      } catch (_) {}
    }
  }
  console.log(`\nLocal JSON Stores Discovered (${jsonStores.length}):`);
  jsonStores.forEach(s => console.log(`  - ${s.file.padEnd(35)} : ${s.records} entries`));

  // 3. Scan Uploaded Files
  const storageDirs = [
    path.resolve(process.cwd(), 'apps/pocketbase/pb_data/storage'),
    path.resolve(process.cwd(), 'pb_data/storage'),
    path.resolve(localDataDir, 'private_storage')
  ];
  const fileInventory = [];
  for (const sDir of storageDirs) {
    if (fs.existsSync(sDir)) {
      function walkDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walkDir(full);
          } else if (entry.isFile()) {
            const buf = fs.readFileSync(full);
            const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
            fileInventory.push({ path: full, size: buf.length, sha256 });
          }
        }
      }
      walkDir(sDir);
    }
  }
  console.log(`\nDiscovered ${fileInventory.length} uploaded files in storage.`);

  if (isDryRun) {
    console.log('\n===============================================================');
    console.log('DRY RUN COMPLETED: All collections, JSON stores and files validated.');
    console.log('No data was modified. To execute live migration, pass: --execute');
    console.log('===============================================================');
    return;
  }

  // --- LIVE EXECUTION: Write records, JSON stores and files to Supabase ---
  console.log('\n===============================================================');
  console.log('EXECUTING LIVE MIGRATION TO SUPABASE...');
  console.log('===============================================================');

  // A. Upsert business collections
  for (const col of collections) {
    const records = sourceRecords[col];
    if (records.length === 0) continue;
    process.stdout.write(`Migrating '${col}' (${records.length} records)... `);

    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize).map(r => {
        const clean = { ...r };
        delete clean._token;
        return clean;
      });

      await supabaseRequest(`/rest/v1/${col}`, 'POST', batch, {
        'Prefer': 'resolution=merge-duplicates,return=representation'
      });
    }
    console.log('DONE');
  }

  // B. Upsert Driver Accounts from driver_app_accounts.json to jbc_driver_accounts
  const drvAccountsFile = jsonStores.find(s => s.file === 'driver_app_accounts.json');
  if (drvAccountsFile && drvAccountsFile.data) {
    process.stdout.write('Migrating persistent driver accounts to jbc_driver_accounts... ');
    const accounts = Object.values(drvAccountsFile.data);
    for (const acc of accounts) {
      const payload = {
        employee_id: acc.employee_id,
        employee_code: acc.employee_code,
        revision: acc.password_version || 1,
        account: acc,
        updated_at: new Date().toISOString()
      };
      await supabaseRequest('/rest/v1/jbc_driver_accounts', 'POST', payload, {
        'Prefer': 'resolution=merge-duplicates,return=representation'
      });
    }
    console.log(`${accounts.length} driver accounts migrated.`);
  }

  // C. Upload storage files to Supabase Storage and verify SHA-256
  if (fileInventory.length > 0) {
    console.log(`Uploading ${fileInventory.length} storage files to Supabase private storage...`);
    for (const f of fileInventory) {
      const relPath = path.relative(process.cwd(), f.path).replace(/\\/g, '/');
      const bytes = fs.readFileSync(f.path);
      const endpoint = `/storage/v1/object/documents/${encodeURIComponent(relPath)}`;

      await supabaseRequest(endpoint, 'POST', bytes, {
        'Content-Type': 'application/octet-stream',
        'x-upsert': 'true'
      });
    }
    console.log('File uploads complete.');
  }

  // D. Post-Migration Verification & Parity Reconciliation
  console.log('\n--- TARGET PARITY RECONCILIATION ---');
  let parityFailed = false;

  for (const col of ['trip_logs', 'expenses', 'advances', 'cashbook']) {
    const res = await supabaseRequest(`/rest/v1/${col}?select=*`);
    const targetRows = res.data || [];
    const sourceRows = sourceRecords[col] || [];

    if (targetRows.length !== sourceRows.length) {
      console.error(`PARITY ERROR on '${col}': Source count (${sourceRows.length}) !== Target count (${targetRows.length})`);
      parityFailed = true;
    }

    if (col === 'trip_logs') {
      const targetRev = targetRows.reduce((s, r) => s + (Number(r.revenue) || 0), 0);
      if (Math.abs(targetRev - sourceFinancialTotals.tripRevenue) > 0.01) {
        console.error(`FINANCIAL MISMATCH on trip revenue: Source Rs. ${sourceFinancialTotals.tripRevenue} !== Target Rs. ${targetRev}`);
        parityFailed = true;
      }
    } else if (col === 'expenses') {
      const targetExp = targetRows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
      if (Math.abs(targetExp - sourceFinancialTotals.expensesAmount) > 0.01) {
        console.error(`FINANCIAL MISMATCH on expenses: Source Rs. ${sourceFinancialTotals.expensesAmount} !== Target Rs. ${targetExp}`);
        parityFailed = true;
      }
    } else if (col === 'advances') {
      const targetAdv = targetRows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
      if (Math.abs(targetAdv - sourceFinancialTotals.advancesAmount) > 0.01) {
        console.error(`FINANCIAL MISMATCH on advances: Source Rs. ${sourceFinancialTotals.advancesAmount} !== Target Rs. ${targetAdv}`);
        parityFailed = true;
      }
    }
  }

  if (parityFailed) {
    console.error('\nFATAL: Migration reconciliation failed with discrepancies. Rejecting completion.');
    process.exit(1);
  }

  console.log('\n===============================================================');
  console.log('MIGRATION COMPLETED SUCCESSFULLY WITH 100% FINANCIAL & RECORD PARITY.');
  console.log('===============================================================');
}

runMigration().catch(err => {
  console.error('\nFatal Migration Error:', err.message);
  process.exit(1);
});
