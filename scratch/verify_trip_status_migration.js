import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  // 1. Print current allowed values in schema
  const row = db.prepare("SELECT fields FROM _collections WHERE name='trip_logs'").get();
  const fields = JSON.parse(row.fields);
  const statusField = fields.find(f => f.name === 'trip_status');
  console.log("SCHEMA ALLOWED VALUES:", statusField.values);

  // 2. Print counts group by status
  const counts = db.prepare("SELECT trip_status, COUNT(*) as cnt FROM trip_logs GROUP BY trip_status").all();
  console.log("RECORD COUNTS BY STATUS:", counts);
} catch (err) {
  console.error("Error:", err);
}
