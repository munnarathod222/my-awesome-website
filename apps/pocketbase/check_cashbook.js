import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  // Get table info for cashbook
  const pragma = db.prepare("PRAGMA table_info(cashbook)");
  const columns = pragma.all();
  console.log("Cashbook Columns:");
  console.log(columns.map(c => `${c.name} (${c.type})`));
  
  // Get sample cashbook records
  const selectQuery = db.prepare("SELECT * FROM cashbook LIMIT 3");
  const cashbooks = selectQuery.all();
  console.log("\nSample Cashbook Records:");
  console.log(JSON.stringify(cashbooks, null, 2));
  
} catch (err) {
  console.error("Error:", err);
}
