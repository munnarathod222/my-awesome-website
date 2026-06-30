import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const collections = db.prepare("SELECT id, name FROM _collections").all();
  console.log("PocketBase Collections:");
  console.log(JSON.stringify(collections, null, 2));
} catch (err) {
  console.error("Error reading database:", err);
}
