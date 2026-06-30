import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  // Get table info for payroll
  const pragma = db.prepare("PRAGMA table_info(payroll)");
  const columns = pragma.all();
  console.log("Payroll Columns:");
  console.log(columns.map(c => `${c.name} (${c.type})`));
  
  // Get sample payroll records
  const selectQuery = db.prepare("SELECT * FROM payroll LIMIT 5");
  const payrolls = selectQuery.all();
  console.log("\nSample Payroll Records:");
  console.log(JSON.stringify(payrolls, null, 2));
  
} catch (err) {
  console.error("Error:", err);
}
