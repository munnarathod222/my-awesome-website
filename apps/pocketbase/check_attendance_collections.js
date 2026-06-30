import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  const tables = ['attendance', 'attendance_records'];
  
  tables.forEach(tableName => {
    const data = db.prepare(`SELECT fields FROM _collections WHERE name = '${tableName}'`).all()[0];
    if (data) {
      const fields = JSON.parse(data.fields);
      console.log(`\nFields in ${tableName}:`);
      fields.forEach(f => {
        console.log(`- ${f.name} (${f.type})`);
      });
    } else {
      console.log(`Collection ${tableName} not found`);
    }
  });

} catch (err) {
  console.error("Error reading database:", err);
}
