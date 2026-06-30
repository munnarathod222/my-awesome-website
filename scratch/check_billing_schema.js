import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  const bCycle = db.prepare("SELECT name, fields FROM _collections WHERE name = 'billing_cycles'").all()[0];
  if (bCycle) {
    console.log("=== SCHEMA FOR billing_cycles ===");
    console.log(JSON.stringify(JSON.parse(bCycle.fields), null, 2));
  }
  
  const invoice = db.prepare("SELECT name, fields FROM _collections WHERE name = 'invoices'").all()[0];
  if (invoice) {
    console.log("\n=== SCHEMA FOR invoices ===");
    console.log(JSON.stringify(JSON.parse(invoice.fields), null, 2));
  }
} catch (err) {
  console.error("Error reading database:", err);
}
