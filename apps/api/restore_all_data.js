import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = path.resolve('../pocketbase/pb_data/data.db');
const backupPath = path.resolve('../../backups/full_system_backup_2026-07-25T12-10-06-796Z/ALL_DATA_MASTER.json');

console.log('======================================================');
console.log('🔄 RESTORING ALL RECORDS INTO POCKETBASE DB (STRICT TYPE SANITIZATION)');
console.log('======================================================\n');

if (!fs.existsSync(backupPath)) {
  console.error('❌ Backup file not found at:', backupPath);
  process.exit(1);
}

const masterData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const db = new Database(dbPath);

let totalRestored = 0;
let collectionsRestored = 0;

for (const [colName, records] of Object.entries(masterData)) {
  if (!Array.isArray(records) || records.length === 0) continue;

  // Check if table exists in SQLite
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(colName);
  if (!tableCheck) continue;

  // Get table column info
  const columns = db.prepare(`PRAGMA table_info("${colName}")`).all().map(c => c.name);
  if (columns.length === 0) continue;

  let colRestored = 0;

  db.transaction(() => {
    for (const record of records) {
      const rowData = {};
      columns.forEach(col => {
        if (record[col] !== undefined) {
          let val = record[col];
          if (typeof val === 'boolean') {
            val = val ? 1 : 0;
          } else if (typeof val === 'object' && val !== null) {
            val = JSON.stringify(val);
          } else if (val === undefined) {
            val = null;
          }
          rowData[col] = val;
        }
      });

      const keys = Object.keys(rowData);
      if (keys.length === 0) return;

      const colNamesStr = keys.map(k => `"${k}"`).join(', ');
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(k => rowData[k]);

      const sql = `INSERT OR REPLACE INTO "${colName}" (${colNamesStr}) VALUES (${placeholders})`;
      try {
        db.prepare(sql).run(...values);
        colRestored++;
      } catch (err) {
        console.error(`  ❌ Error in '${colName}':`, err.message);
      }
    }
  })();

  console.log(`  ✅ Restored ${colRestored}/${records.length} records into table '${colName}'`);
  totalRestored += colRestored;
  collectionsRestored++;
}

console.log('\n======================================================');
console.log(`🎉 ALL DATA RESTORATION COMPLETE!`);
console.log(`📊 Restored ${totalRestored} total records across ${collectionsRestored} collections!`);
console.log('======================================================\n');
