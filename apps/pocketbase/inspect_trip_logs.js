import fs from 'node:fs';

const schemaPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_schema.json";

try {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const employees = schema.find(c => c.name === 'employees');
  const tripLogs = schema.find(c => c.name === 'trip_logs');
  console.log("employees collection ID:", employees?.id);
  console.log("trip_logs collection ID:", tripLogs?.id);
} catch (err) {
  console.error("Error:", err);
}
