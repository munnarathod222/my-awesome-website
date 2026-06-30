import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  const selectQuery = db.prepare("SELECT * FROM _collections WHERE name='cashbook'");
  const coll = selectQuery.get();
  
  console.log(`=== Collection: ${coll.name} ===`);
  const fields = JSON.parse(coll.fields);
  for (const field of fields) {
    if (field.type === 'select') {
      console.log(`Field: ${field.name}, Type: ${field.type}, Values:`, field.values);
    }
  }
} catch (err) {
  console.error("Error:", err);
}
