import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  // Get table info for invoices
  const pragma = db.prepare("PRAGMA table_info(invoices)");
  const columns = pragma.all();
  console.log("Invoices Columns:");
  console.log(columns.map(c => `${c.name} (${c.type})`));
  
  // Get sample records
  const selectQuery = db.prepare("SELECT * FROM invoices LIMIT 5");
  const records = selectQuery.all();
  console.log("\nSample Invoices Records:");
  console.log(JSON.stringify(records, null, 2));
  
} catch (err) {
  console.error("Error:", err);
}
