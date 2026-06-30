import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const col = db.prepare("SELECT name, fields FROM _collections WHERE name = 'loan_profiles'").all()[0];
  if (col) {
    console.log(`=== COLLECTION ${col.name} ===`);
    console.log(JSON.stringify(JSON.parse(col.fields), null, 2));
  } else {
    console.log("Collection loan_profiles not found.");
  }
} catch (err) {
  console.error("Error reading database:", err);
}
