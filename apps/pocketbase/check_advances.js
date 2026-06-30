import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  // Get table info for advances
  const pragma = db.prepare("PRAGMA table_info(advances)");
  const columns = pragma.all();
  console.log("Advances Columns:");
  console.log(columns.map(c => `${c.name} (${c.type})`));
  
  // Get sample advances records
  const selectQuery = db.prepare("SELECT * FROM advances LIMIT 5");
  const advances = selectQuery.all();
  console.log("\nSample Advances Records:");
  console.log(JSON.stringify(advances, null, 2));
  
} catch (err) {
  console.error("Error:", err);
}
