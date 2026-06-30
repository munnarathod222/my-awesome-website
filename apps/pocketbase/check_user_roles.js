import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  const selectQuery = db.prepare("SELECT * FROM _collections WHERE name='users'");
  const coll = selectQuery.get();
  
  const fields = JSON.parse(coll.fields);
  const roleField = fields.find(f => f.name === 'role');
  console.log(JSON.stringify(roleField, null, 2));
} catch (err) {
  console.error("Error:", err);
}
