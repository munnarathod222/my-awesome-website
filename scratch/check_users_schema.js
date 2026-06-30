import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const row = db.prepare("SELECT fields FROM _collections WHERE name='users'").get();
  console.log(JSON.stringify(JSON.parse(row.fields), null, 2));
} catch (err) {
  console.error("Error:", err);
}
