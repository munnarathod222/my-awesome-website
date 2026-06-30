import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const row = db.prepare("SELECT fields FROM _collections WHERE name='monthly_inspections'").get();
  console.log("MONTHLY INSPECTIONS FIELDS:");
  console.log(JSON.parse(row.fields));
} catch (err) {
  console.error("Error:", err);
}
