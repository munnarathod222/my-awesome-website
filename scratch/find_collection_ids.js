import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const rows = db.prepare("SELECT id, name FROM _collections").all();
  console.log("COLLECTION IDS:");
  console.log(rows);
} catch (err) {
  console.error("Error:", err);
}
