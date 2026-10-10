// Run ONLY against a privately preserved copy from the current live server.
// It never updates an existing durable account or prints password material.
import fs from 'node:fs';
import { configuredDriverAccountStore } from '../apps/api/src/services/driverAccountStore.js';
const source = process.argv[2];
if (!source || !process.argv.includes('--apply')) throw Error('Usage: node ops/import-driver-accounts.mjs /private/live-driver-accounts.json --apply');
const records = JSON.parse(fs.readFileSync(source, 'utf8'));
if (!records || Array.isArray(records) || typeof records !== 'object') throw Error('Invalid account backup');
const store = configuredDriverAccountStore();
let imported = 0, existing = 0;
for (const account of Object.values(records)) {
  if (await store.findById(account.employee_id)) { existing++; continue; }
  await store.save(account); imported++;
}
console.log(`Imported ${imported} accounts; preserved ${existing} existing durable accounts. No credentials printed.`);
