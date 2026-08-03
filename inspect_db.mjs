import Database from './apps/api/node_modules/better-sqlite3/lib/index.js';
import path from 'node:path';

const dbPath = path.resolve('./apps/pocketbase/pb_data/data.db');
const db = new Database(dbPath, { readonly: true });

console.log('--- USERS IN DATABASE ---');
const users = db.prepare("SELECT id, email, role, status FROM users").all();
console.log(users);

console.log('--- SUPERUSERS IN DATABASE ---');
try {
  const superusers = db.prepare("SELECT id, email FROM _superusers").all();
  console.log(superusers);
} catch (e) {
  console.log('No _superusers table:', e.message);
}
