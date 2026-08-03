import Database from 'better-sqlite3';
import path from 'node:path';

const dbPath = path.resolve('../pocketbase/pb_data/data.db');
const db = new Database(dbPath, { readonly: true });

console.log('=== ALL TABLES IN POCKETBASE DATA.DB ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables.map(t => t.name).join(', '));

console.log('\n=== USERS IN DATABASE ===');
try {
  const users = db.prepare("SELECT id, email, role, status, name FROM users").all();
  console.log(users);
} catch (e) {
  console.log('Error reading users:', e.message);
}

console.log('\n=== TRUCKS COUNT ===');
try {
  const trucks = db.prepare("SELECT COUNT(*) as count FROM trucks").get();
  console.log('Trucks count:', trucks.count);
} catch (e) {
  console.log('Error reading trucks:', e.message);
}

console.log('\n=== TRIP LOGS COUNT ===');
try {
  const trips = db.prepare("SELECT COUNT(*) as count FROM trip_logs").get();
  console.log('Trips count:', trips.count);
} catch (e) {
  console.log('Error reading trips:', e.message);
}

console.log('\n=== EXPENSES COUNT ===');
try {
  const expenses = db.prepare("SELECT COUNT(*) as count FROM expenses").get();
  console.log('Expenses count:', expenses.count);
} catch (e) {
  console.log('Error reading expenses:', e.message);
}
