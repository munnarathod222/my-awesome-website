import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const trip = db.prepare("SELECT * FROM trip_logs LIMIT 1").all()[0];
  console.log("Sample Trip Log Record:");
  console.log(JSON.stringify(trip, null, 2));
} catch (err) {
  console.error("Error:", err);
}
