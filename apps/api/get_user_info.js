import Database from 'better-sqlite3';
import path from 'node:path';

const dbPath = path.resolve('../pocketbase/pb_data/data.db');
const db = new Database(dbPath, { readonly: true });

console.log('=== USERS IN RESTORED DB ===');
const users = db.prepare("SELECT id, email, name, role, status FROM users").all();
console.log(users);
