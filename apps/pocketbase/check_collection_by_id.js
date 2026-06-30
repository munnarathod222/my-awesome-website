import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const query = db.prepare("SELECT name FROM _collections WHERE id='pbc_5185472981'");
  console.log("Collection name:", query.get());
} catch (err) {
  console.error("Error:", err);
}
