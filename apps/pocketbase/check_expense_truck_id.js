import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const query = db.prepare("SELECT id, subcategory, amount, truck_id, created_by FROM expenses WHERE truck_id != '' LIMIT 5");
  console.log("Recent Expenses with truck_id:", query.all());
} catch (err) {
  console.error("Error:", err);
}
