import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  const selectQuery = db.prepare("SELECT * FROM _collections WHERE name='cashbook_transactions'");
  const coll = selectQuery.get();
  
  const fields = JSON.parse(coll.fields);
  const cashbookIdField = fields.find(f => f.name === 'cashbook_id');
  console.log(JSON.stringify(cashbookIdField, null, 2));
} catch (err) {
  console.error("Error:", err);
}
