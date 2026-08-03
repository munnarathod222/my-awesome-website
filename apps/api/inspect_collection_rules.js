import Database from 'better-sqlite3';
import path from 'node:path';

const dbPath = path.resolve('../pocketbase/pb_data/data.db');
const db = new Database(dbPath, { readonly: true });

console.log('=== COLLECTION API RULES ===');
const collections = db.prepare("SELECT name, listRule, viewRule, createRule, updateRule, deleteRule FROM _collections").all();
collections.forEach(c => {
  if (!c.name.startsWith('_')) {
    console.log(`${c.name.padEnd(25)} | listRule: ${c.listRule} | viewRule: ${c.viewRule}`);
  }
});
