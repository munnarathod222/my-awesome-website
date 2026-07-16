import fs from 'node:fs';

const schemaPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_schema.json";

try {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const cashbook = schema.find(c => c.name === 'cashbook');
  const cashbooks = schema.find(c => c.name === 'cashbooks');
  console.log("=== cashbook (singular) ===");
  console.log(JSON.stringify(cashbook, null, 2));
  console.log("\n=== cashbooks (plural) ===");
  console.log(JSON.stringify(cashbooks, null, 2));
} catch (err) {
  console.error("Error:", err);
}
