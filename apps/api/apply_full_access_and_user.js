import Database from 'better-sqlite3';
import path from 'node:path';

const dbPath = path.resolve('../pocketbase/pb_data/data.db');
const db = new Database(dbPath);

console.log('======================================================');
console.log('🔓 ENSURING 100% FULL ACCESS & SUPER ADMIN USER IN DB');
console.log('======================================================\n');

// 1. Upsert Super Admin user 'munnarathod222@gmail.com' into users table
const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
const userCols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);

const userRecord = {
  id: 'usr_munna_superadmin',
  email: 'munnarathod222@gmail.com',
  name: 'Munna Rathod',
  full_name: 'Munna Rathod',
  role: 'super_admin',
  status: 'active',
  verified: 1,
  emailVisibility: 1,
  created: now,
  updated: now
};

const keys = Object.keys(userRecord).filter(k => userCols.includes(k));
const colsStr = keys.map(k => `"${k}"`).join(', ');
const placeholders = keys.map(() => '?').join(', ');
const values = keys.map(k => userRecord[k]);

db.prepare(`INSERT OR REPLACE INTO users (${colsStr}) VALUES (${placeholders})`).run(...values);
console.log('✅ Super Admin user munnarathod222@gmail.com upserted into SQLite users table!');

// 2. Also upsert into _superusers table if present
const supertableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='_superusers'").get();
if (supertableCheck) {
  const superCols = db.prepare("PRAGMA table_info(_superusers)").all().map(c => c.name);
  const superRecord = {
    id: 'usr_munna_superadmin',
    email: 'munnarathod222@gmail.com',
    created: now,
    updated: now
  };
  const sKeys = Object.keys(superRecord).filter(k => superCols.includes(k));
  const sColsStr = sKeys.map(k => `"${k}"`).join(', ');
  const sPlaceholders = sKeys.map(() => '?').join(', ');
  const sValues = sKeys.map(k => superRecord[k]);
  db.prepare(`INSERT OR REPLACE INTO _superusers (${sColsStr}) VALUES (${sPlaceholders})`).run(...sValues);
  console.log('✅ Super Admin user munnarathod222@gmail.com upserted into _superusers table!');
}

// 3. Relax API rules in _collections table so super_admin or authenticated users can view all records
const collections = db.prepare("SELECT id, name, listRule, viewRule FROM _collections").all();
let updatedRulesCount = 0;

db.transaction(() => {
  collections.forEach(col => {
    if (col.name.startsWith('_')) return;

    let listRule = col.listRule;
    let viewRule = col.viewRule;

    // Expand rules to allow super_admin or any authenticated user if restricted
    if (listRule && listRule.includes('user_id = @request.auth.id')) {
      listRule = `user_id = @request.auth.id || @request.auth.role = 'super_admin' || @request.auth.role = 'admin'`;
    } else if (listRule && listRule.includes('created_by = @request.auth.id')) {
      listRule = `created_by = @request.auth.id || @request.auth.role = 'super_admin' || @request.auth.role = 'admin'`;
    } else if (listRule && listRule.includes('userId = @request.auth.id')) {
      listRule = `userId = @request.auth.id || @request.auth.role = 'super_admin' || @request.auth.role = 'admin'`;
    } else if (!listRule || listRule === 'null') {
      listRule = `@request.auth.id != ''`;
    }

    if (viewRule && viewRule.includes('user_id = @request.auth.id')) {
      viewRule = `user_id = @request.auth.id || @request.auth.role = 'super_admin' || @request.auth.role = 'admin'`;
    } else if (viewRule && viewRule.includes('created_by = @request.auth.id')) {
      viewRule = `created_by = @request.auth.id || @request.auth.role = 'super_admin' || @request.auth.role = 'admin'`;
    } else if (viewRule && viewRule.includes('userId = @request.auth.id')) {
      viewRule = `userId = @request.auth.id || @request.auth.role = 'super_admin' || @request.auth.role = 'admin'`;
    } else if (!viewRule || viewRule === 'null') {
      viewRule = `@request.auth.id != ''`;
    }

    if (listRule !== col.listRule || viewRule !== col.viewRule) {
      db.prepare("UPDATE _collections SET listRule = ?, viewRule = ? WHERE id = ?").run(listRule, viewRule, col.id);
      updatedRulesCount++;
    }
  });
})();

console.log(`✅ Collection API access rules updated for ${updatedRulesCount} collections!`);

// 4. Update user_id / created_by / added_by in user-specific tables to 'usr_munna_superadmin' if empty or mismatch
const userTiedTables = [
  { table: 'reminders', col: 'created_by' },
  { table: 'todos', col: 'user_id' },
  { table: 'payment_due_dates', col: 'user_id' },
  { table: 'cashbook', col: 'added_by' },
  { table: 'fuel_payments', col: 'user_id' },
  { table: 'loan_profiles', col: 'userId' },
];

userTiedTables.forEach(({ table, col }) => {
  try {
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table);
    if (!tableCheck) return;
    const cols = db.prepare(`PRAGMA table_info("${table}")`).all().map(c => c.name);
    if (cols.includes(col)) {
      const res = db.prepare(`UPDATE "${table}" SET "${col}" = 'usr_munna_superadmin' WHERE "${col}" IS NULL OR "${col}" = ''`).run();
      if (res.changes > 0) {
        console.log(`  Updated ${res.changes} records in '${table}' setting ${col} to 'usr_munna_superadmin'`);
      }
    }
  } catch (err) {
    console.error(`Error updating user-tied table ${table}:`, err.message);
  }
});

console.log('\n======================================================');
console.log('🎉 DB PREPARATION COMPLETE! ALL DATA IS FULLY ACCESSIBLE!');
console.log('======================================================\n');
