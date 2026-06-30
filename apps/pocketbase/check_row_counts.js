import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  // List all tables
  const tablesQuery = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  const tables = tablesQuery.all();
  
  console.log("Table Row Counts:");
  for (const table of tables) {
    const countQuery = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`);
    const res = countQuery.get();
    if (res.count > 0) {
      console.log(`- ${table.name}: ${res.count} rows`);
    }
  }
} catch (err) {
  console.error("Error:", err);
}
