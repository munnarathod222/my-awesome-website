import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  const selectQuery = db.prepare("SELECT * FROM _collections WHERE name='fuel_tracker'");
  const coll = selectQuery.get();
  
  console.log(`=== Collection: ${coll.name} ===`);
  const fields = JSON.parse(coll.fields);
  for (const field of fields) {
    console.log(JSON.stringify(field, null, 2));
  }
} catch (err) {
  console.error("Error:", err);
}
