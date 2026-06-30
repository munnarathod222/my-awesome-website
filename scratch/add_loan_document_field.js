import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  // 1. Get the current loan_profiles collection
  const col = db.prepare("SELECT * FROM _collections WHERE name = 'loan_profiles'").all()[0];
  if (!col) {
    throw new Error("Collection loan_profiles not found!");
  }

  const fields = JSON.parse(col.fields);

  // Check if loan_document field already exists
  const hasField = fields.some(f => f.name === 'loan_document');
  if (!hasField) {
    console.log("Adding loan_document field to collections schema...");
    const newField = {
      "help": "Upload loan agreements, terms, or statement PDFs",
      "hidden": false,
      "id": "file_loan_document",
      "maxSelect": 1,
      "maxSize": 20971520,
      "mimeTypes": [
        "application/pdf"
      ],
      "name": "loan_document",
      "presentable": false,
      "protected": false,
      "required": false,
      "system": false,
      "thumbs": [],
      "type": "file"
    };
    fields.push(newField);

    // Update _collections table
    const updateStmt = db.prepare("UPDATE _collections SET fields = ? WHERE name = 'loan_profiles'");
    updateStmt.run(JSON.stringify(fields));
    console.log("Collection schema updated successfully.");
  } else {
    console.log("loan_document field already exists in collections schema.");
  }

  // 2. Physically add the column to the SQLite table if not exists
  try {
    const tableInfo = db.prepare("PRAGMA table_info(loan_profiles)").all();
    const hasColumn = tableInfo.some(c => c.name === 'loan_document');
    if (!hasColumn) {
      console.log("Adding loan_document column to table loan_profiles...");
      db.prepare("ALTER TABLE loan_profiles ADD COLUMN loan_document TEXT").run();
      console.log("Table altered successfully.");
    } else {
      console.log("loan_document column already exists in table loan_profiles.");
    }
  } catch (err) {
    console.error("Error altering table:", err);
  }

} catch (err) {
  console.error("Error executing schema update:", err);
}
