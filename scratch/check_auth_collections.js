import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const rows = db.prepare("SELECT name, type FROM _collections WHERE type='auth'").all();
  console.log("Auth collections:", rows);
} catch (err) {
  console.error("Error:", err);
}
