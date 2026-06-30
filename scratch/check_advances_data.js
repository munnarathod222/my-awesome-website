import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const advances = db.prepare("SELECT * FROM advances").all();
  console.log(`=== ADVANCES RECORDS (${advances.length}) ===`);
  console.log(JSON.stringify(advances, null, 2));

  const employees = db.prepare("SELECT id, name FROM employees").all();
  console.log(`=== EMPLOYEES RECORDS (${employees.length}) ===`);
  console.log(JSON.stringify(employees, null, 2));
} catch (err) {
  console.error("Error reading database:", err);
}
