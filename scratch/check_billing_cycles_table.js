import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  const bCycleTable = db.prepare("PRAGMA table_info(billing_cycles)").all();
  console.log("billing_cycles table info:");
  console.log(bCycleTable.map(c => `${c.name} (${c.type})`));
  
  const sample = db.prepare("SELECT * FROM billing_cycles LIMIT 3").all();
  console.log("billing_cycles sample:", sample);
} catch (err) {
  console.error("Error:", err);
}
