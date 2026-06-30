import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/logs.db";

try {
  const db = new DatabaseSync(dbPath);
  
  // List recent error logs
  const selectQuery = db.prepare("SELECT * FROM requests WHERE status >= 400 ORDER BY created DESC LIMIT 5");
  const logs = selectQuery.all();
  
  console.log("Recent Failed API Requests:");
  console.log(JSON.stringify(logs, null, 2));
} catch (err) {
  console.error("Error reading logs.db:", err);
}
