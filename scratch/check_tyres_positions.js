import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const pragma = db.prepare("PRAGMA table_info(tyres)");
  console.log("Tyres columns:", pragma.all().map(c => `${c.name} (${c.type})`));

  const tyres = db.prepare("SELECT id, tyre_position, status, current_lifecycle_kms, truck_id FROM tyres").all();
  console.log("\nTyre records:");
  console.log(JSON.stringify(tyres, null, 2));
} catch (err) {
  console.error("Error:", err);
}
