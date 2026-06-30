import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  // Get table info for fuel_tracker
  const pragma = db.prepare("PRAGMA table_info(fuel_tracker)");
  const columns = pragma.all();
  console.log("Fuel Tracker Columns:");
  console.log(columns.map(c => `${c.name} (${c.type})`));
  
  // Get sample fuel_tracker records
  const selectQuery = db.prepare("SELECT * FROM fuel_tracker LIMIT 5");
  const records = selectQuery.all();
  console.log("\nSample Fuel Tracker Records:");
  console.log(JSON.stringify(records, null, 2));
  
} catch (err) {
  console.error("Error:", err);
}
