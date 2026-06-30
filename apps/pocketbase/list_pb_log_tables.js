import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/logs.db";

try {
  const db = new DatabaseSync(dbPath);
  const tablesQuery = db.prepare("SELECT name FROM sqlite_master WHERE type='table'");
  console.log("Tables in logs.db:", tablesQuery.all());
} catch (err) {
  console.error("Error:", err);
}
