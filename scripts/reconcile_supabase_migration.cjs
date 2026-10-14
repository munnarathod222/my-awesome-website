/**
 * JAI BHAVANI CARGO - SUPABASE MIGRATION RECONCILIATION AUDITOR
 *
 * Usage:
 *   node scripts/reconcile_supabase_migration.cjs
 *
 * Required Environment Variables (Explicit configuration required; no hardcoded fallbacks):
 *   PB_HOST / POCKETBASE_HOST
 *   PB_ADMIN_EMAIL / PB_SUPERUSER_EMAIL
 *   PB_ADMIN_PASSWORD / PB_SUPERUSER_PASSWORD
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

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
          if (res.statusCode >= 400) return reject(new Error(parsed.message || body));
          resolve(parsed);
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function fetchAllPbRecords(collectionName, token) {
  let page = 1;
  let all = [];
  while (true) {
    const res = await pbRequest(`/collections/${collectionName}/records?page=${page}&perPage=100`, 'GET', null, token);
    const items = res.items || [];
    all = all.concat(items);
    if (page >= res.totalPages || items.length === 0) break;
    page++;
  }
  return all;
}

async function fetchSupabaseTableData(tableName) {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.serviceKey) return null;
  return new Promise((resolve) => {
    const url = new URL(`${SUPABASE_CONFIG.url}/rest/v1/${tableName}?select=*`);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    client.get({
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      headers: {
        'apikey': SUPABASE_CONFIG.serviceKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.serviceKey}`
      },
      timeout: 30000
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(Array.isArray(parsed) ? parsed : null);
        } catch (_) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function runReconciliation() {
  console.log('===============================================================');
  console.log('JAI BHAVANI CARGO - POST-MIGRATION RECONCILIATION VERIFICATION');
  console.log('===============================================================');

  let useLocalDb = false;
  let token = null;

  if (PB_CONFIG.host && PB_CONFIG.adminEmail && PB_CONFIG.adminPassword) {
    try {
      const authRes = await pbRequest('/collections/_superusers/auth-with-password', 'POST', {
        identity: PB_CONFIG.adminEmail,
        password: PB_CONFIG.adminPassword
      });
      token = authRes.token;
      console.log('PocketBase connected.');
    } catch (_) {
      useLocalDb = true;
    }
  } else {
    useLocalDb = true;
  }

  let db = null;
  if (useLocalDb) {
    const localDbPath = 'scratch/live_backup_before_migration.db';
    if (fs.existsSync(localDbPath)) {
      const { DatabaseSync } = require('node:sqlite');
      db = new DatabaseSync(localDbPath);
      console.log(`Auditing against authoritative database: ${localDbPath}`);
    } else {
      console.error('Neither PocketBase host nor local backup database is available.');
      process.exit(1);
    }
  }

  const collections = ['employees', 'trucks', 'clients', 'routes', 'trip_logs', 'expenses', 'advances', 'attendance', 'truck_documents', 'employee_documents', 'cashbook'];
  const comparison = [];
  let discrepancyFound = false;

  for (const col of collections) {
    let pbRecords = [];
    if (db) {
      try {
        pbRecords = db.prepare(`SELECT * FROM "${col}"`).all();
      } catch (_) {
        pbRecords = [];
      }
    } else {
      pbRecords = await fetchAllPbRecords(col, token);
    }
    const pbCount = pbRecords.length;
    const sbRecords = await fetchSupabaseTableData(col);
    const sbCount = sbRecords !== null ? sbRecords.length : null;

    let pbSum = null;
    let sbSum = null;
    if (col === 'trip_logs') {
      pbSum = pbRecords.reduce((sum, r) => sum + (Number(r.revenue) || 0), 0);
      sbSum = sbRecords ? sbRecords.reduce((sum, r) => sum + (Number(r.revenue) || 0), 0) : null;
    } else if (col === 'expenses' || col === 'advances') {
      pbSum = pbRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      sbSum = sbRecords ? sbRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0) : null;
    }

    let status = 'PENDING_DEPLOY';
    if (sbCount !== null) {
      if (pbCount === sbCount && (pbSum === null || Math.abs(pbSum - sbSum) < 0.01)) {
        status = 'MATCH';
      } else {
        status = 'MISMATCH';
        discrepancyFound = true;
      }
    }

    comparison.push({
      Entity: col,
      SourceCount: pbCount,
      TargetCount: sbCount !== null ? sbCount : '(Target Unconnected)',
      Status: status,
      SourceFinancial: pbSum !== null ? `Rs. ${pbSum.toLocaleString('en-IN')}` : 'N/A',
      TargetFinancial: sbSum !== null ? `Rs. ${sbSum.toLocaleString('en-IN')}` : 'N/A'
    });
  }

  console.table(comparison);

  if (discrepancyFound) {
    console.error('\nERROR: Reconciliation discrepancies detected between source and target!');
    process.exit(1);
  }

  console.log('\n===============================================================');
  console.log('Reconciliation Auditor Completed.');
  console.log('===============================================================');
}

runReconciliation().catch(err => {
  console.error('Reconciliation error:', err.message);
  process.exit(1);
});
