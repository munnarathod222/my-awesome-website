import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  // Get table info for trucks
  const pragma = db.prepare("PRAGMA table_info(trucks)");
  const columns = pragma.all();
  console.log("Trucks Columns:");
  console.log(columns.map(c => `${c.name} (${c.type})`));
  
  // Get sample trucks records
  const selectQuery = db.prepare("SELECT * FROM trucks LIMIT 5");
  const records = selectQuery.all();
  console.log("\nSample Trucks Records:");
  console.log(JSON.stringify(records, null, 2));
  
} catch (err) {
  console.error("Error:", err);
}
