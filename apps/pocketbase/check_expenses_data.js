import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  // Get table info for expenses
  const selectQuery = db.prepare("SELECT * FROM expenses LIMIT 5");
  const expenses = selectQuery.all();
  console.log("\nSample Expenses Records:");
  console.log(JSON.stringify(expenses, null, 2));
  
} catch (err) {
  console.error("Error:", err);
}
