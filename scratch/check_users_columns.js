import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const pragma = db.prepare("PRAGMA table_info(users)");
  console.log("Users columns:", pragma.all().map(c => `${c.name} (${c.type})`));

  const users = db.prepare("SELECT * FROM users").all();
  console.log("Users:", JSON.stringify(users, null, 2));
} catch (err) {
  console.error("Error:", err);
}
