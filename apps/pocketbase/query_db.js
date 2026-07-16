import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  const pragma = db.prepare("PRAGMA table_info(driver_ledger)");
  console.log("=== driver_ledger columns in data.db ===");
  console.log(pragma.all().map(c => `${c.name} (${c.type})`));

} catch (err) {
  console.error("Error:", err);
}
