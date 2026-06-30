import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const payrolls = db.prepare("SELECT * FROM payroll").all();
  console.log(`=== PAYROLL RECORDS (${payrolls.length}) ===`);
  console.log(JSON.stringify(payrolls, null, 2));
} catch (err) {
  console.error("Error reading database:", err);
}
