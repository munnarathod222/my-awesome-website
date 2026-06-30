import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const cols = db.prepare("SELECT name, listRule, viewRule, createRule, updateRule, deleteRule FROM _collections WHERE name IN ('employees', 'advances')").all();
  for (const col of cols) {
    console.log(`=== RULES FOR COLLECTION: ${col.name} ===`);
    console.log(`  List:   ${col.listRule}`);
    console.log(`  View:   ${col.viewRule}`);
    console.log(`  Create: ${col.createRule}`);
    console.log(`  Update: ${col.updateRule}`);
    console.log(`  Delete: ${col.deleteRule}`);
  }
} catch (err) {
  console.error("Error reading collection rules:", err);
}
