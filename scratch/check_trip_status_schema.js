import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const row = db.prepare("SELECT fields FROM _collections WHERE name='trip_logs'").get();
  const fields = JSON.parse(row.fields);
  const statusField = fields.find(f => f.name === 'trip_status');
  console.log("TRIP STATUS FIELD SCHEMA:");
  console.log(statusField);
} catch (err) {
  console.error("Error:", err);
}
