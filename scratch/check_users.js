import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const users = db.prepare("SELECT id, username, email, name, role FROM users").all();
  console.log(`=== USERS RECORD (${users.length}) ===`);
  console.log(JSON.stringify(users, null, 2));
} catch (err) {
  console.error("Error reading database:", err);
}
