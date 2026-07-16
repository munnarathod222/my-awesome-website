import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const dbPath = 'C:/Users/Munna\'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db';
const db = new DatabaseSync(dbPath);

console.log('Reading database collections...');
const query = db.prepare("SELECT id, name, type, system, fields, listRule, viewRule, createRule, updateRule, deleteRule, indexes, options FROM _collections");
const rows = query.all();

const collections = rows.map(row => {
    let fields = [];
    try {
        fields = JSON.parse(row.fields || '[]');
    } catch (e) {
        fields = [];
    }
    
    // Parse options and indexes
    let options = {};
    try { options = JSON.parse(row.options || '{}'); } catch(e) {}
    
    let indexes = [];
    try { indexes = JSON.parse(row.indexes || '[]'); } catch(e) {}

    return {
        id: row.id,
        name: row.name,
        type: row.type,
        system: Boolean(row.system),
        schema: fields,
        indexes: indexes,
        listRule: row.listRule,
        viewRule: row.viewRule,
        createRule: row.createRule,
        updateRule: row.updateRule,
        deleteRule: row.deleteRule,
        options: options
    };
});

const outputPath = 'C:/Users/Munna\'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_schema.json';
fs.writeFileSync(outputPath, JSON.stringify(collections, null, 2));
console.log(`Successfully exported schema to: ${outputPath}`);
