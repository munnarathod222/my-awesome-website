/**
 * JAI BHAVANI CARGO — Full Live Database Backup (User Auth)
 * Usage: node full_live_backup.cjs <email> <password>
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const BASE_URL = 'https://www.jaibhavanicargo.com/hcgi/platform';
const EMAIL    = process.argv[2];
const PASSWORD = process.argv[3];

if (!EMAIL || !PASSWORD) {
  console.error('Usage: node full_live_backup.cjs <email> <password>');
  process.exit(1);
}

// All known collections in the app
const KNOWN_COLLECTIONS = [
  'users',
  'contacts',
  'clients',
  'trucks',
  'trips',
  'expenses',
  'employees',
  'payroll',
  'fuel_tracker',
  'loans',
  'invoices',
  'invoice_items',
  'warehouses',
  'reminders',
  'signup_requests',
  'company_settings',
  'notifications',
  'documents',
  'maintenance_logs',
  'insurance',
  'tax_records',
  'audit_logs',
];

function request(method, url, body, token) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'JaiBhavaniBackup/1.0',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { 'Authorization': token } : {}),
      }
    };
    const req = https.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function backupCollection(name, token, dir) {
  process.stdout.write(`  📂 ${name.padEnd(22)}`);
  const all = [];
  let page = 1;
  const perPage = 200;
  let totalPages = 1;

  try {
    do {
      const url = `${BASE_URL}/api/collections/${name}/records?page=${page}&perPage=${perPage}&sort=-created`;
      const res = await request('GET', url, null, token);
      if (res.status === 404) { console.log(`⚠️  Not found — skipped`); return 0; }
      if (res.status === 403) { console.log(`🔒 No permission — skipped`); return 0; }
      if (res.status !== 200) { console.log(`⚠️  HTTP ${res.status} — skipped`); return 0; }
      if (res.body.items) all.push(...res.body.items);
      totalPages = res.body.totalPages || 1;
      page++;
    } while (page <= totalPages);

    fs.writeFileSync(
      path.join(dir, `${name}.json`),
      JSON.stringify({
        collection: name,
        count: all.length,
        exported_at: new Date().toISOString(),
        records: all
      }, null, 2)
    );
    console.log(`✅ ${all.length} records saved`);
    return all.length;
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
    return 0;
  }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║    JAI BHAVANI CARGO — FULL LIVE DATABASE BACKUP     ║');
  console.log(`╚══════════════════════════════════════════════════════╝`);
  console.log(`\n  🕐 Started: ${new Date().toLocaleString('en-IN')}`);

  // Authenticate
  console.log('\n🔐 Authenticating...');
  let token = null;

  for (const endpoint of ['users', '_superusers']) {
    const res = await request('POST',
      `${BASE_URL}/api/collections/${endpoint}/auth-with-password`,
      { identity: EMAIL, password: PASSWORD }
    );
    if (res.status === 200 && res.body.token) {
      token = res.body.token;
      const email = res.body.record?.email || res.body.admin?.email;
      console.log(`✅ Logged in as: ${email} (via ${endpoint})`);
      break;
    }
  }

  if (!token) {
    console.error('❌ Authentication failed. Check credentials.');
    process.exit(1);
  }

  // Create timestamped backup folder
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = path.join(process.cwd(), 'db_backups', `live_backup_${ts}`);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log(`\n💾 Backup folder: db_backups/live_backup_${ts}`);
  console.log(`📋 Backing up ${KNOWN_COLLECTIONS.length} collections...\n`);

  // Export each collection
  let totalRecords = 0;
  let successCount = 0;
  const summary = [];

  for (const col of KNOWN_COLLECTIONS) {
    const count = await backupCollection(col, token, backupDir);
    totalRecords += count;
    if (count > 0) successCount++;
    summary.push({ collection: col, records: count });
  }

  // Write manifest
  const manifest = {
    backup_date: new Date().toISOString(),
    backup_folder: `db_backups/live_backup_${ts}`,
    base_url: BASE_URL,
    authenticated_as: EMAIL,
    total_collections_attempted: KNOWN_COLLECTIONS.length,
    total_collections_backed_up: successCount,
    total_records: totalRecords,
    collections: summary
  };
  fs.writeFileSync(path.join(backupDir, '_BACKUP_MANIFEST.json'), JSON.stringify(manifest, null, 2));

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║  ✅ BACKUP COMPLETE                                   ║`);
  console.log(`║  📦 ${totalRecords} records across ${successCount} collections          `);
  console.log(`║  📁 db_backups/live_backup_${ts}`);
  console.log(`║  🕐 Finished: ${new Date().toLocaleString('en-IN')}`);
  console.log('╚══════════════════════════════════════════════════════╝\n');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
