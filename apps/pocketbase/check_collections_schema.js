import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  const selectQuery = db.prepare("SELECT * FROM _collections WHERE name IN ('expenses', 'fuel_tracker')");
  const collections = selectQuery.all();
  
  for (const coll of collections) {
    console.log(`=== Collection: ${coll.name} ===`);
    const fields = JSON.parse(coll.fields);
    for (const field of fields) {
      if (field.name === 'payment_method') {
        console.log(`Field: ${field.name}`);
        console.log(`Type: ${field.type}`);
        console.log(`Values/Options:`, field.values);
      }
    }
  }
} catch (err) {
  console.error("Error:", err);
}
