import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  const selectQuery = db.prepare("SELECT name, listRule, viewRule, createRule, updateRule, deleteRule FROM _collections WHERE name IN ('cashbook', 'cashbooks', 'cashbook_transactions')");
  const collections = selectQuery.all();
  
  for (const coll of collections) {
    console.log(`=== Collection: ${coll.name} ===`);
    console.log(`List Rule:   ${coll.listRule}`);
    console.log(`View Rule:   ${coll.viewRule}`);
    console.log(`Create Rule: ${coll.createRule}`);
    console.log(`Update Rule: ${coll.updateRule}`);
    console.log(`Delete Rule: ${coll.deleteRule}`);
    console.log();
  }
} catch (err) {
  console.error("Error:", err);
}
