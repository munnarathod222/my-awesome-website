import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  const row = db.prepare("SELECT * FROM _collections WHERE name='contacts'").get();
  if (row) {
    console.log("Collection: contacts");
    const parsed = JSON.parse(row.rules || row.fields || '{}');
    // In newer pocketbase, the schema fields are stored in the row. Let's dump all column names and values:
    console.log("Columns:", Object.keys(row));
    console.log("Fields column:", row.fields);
  } else {
    console.log("contacts collection not found in _collections");
  }
} catch (err) {
  console.error("Error:", err);
}
