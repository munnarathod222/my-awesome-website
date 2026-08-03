const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://pocketbase-production-c2ec.up.railway.app');

async function check() {
  try {
    const records = await pb.collection('employees').getFullList({ sort: '-created' });
    console.log(`Found ${records.length} records in PocketBase 'employees' collection:`);
    records.forEach((r, idx) => {
      console.log(`[${idx+1}] ID: ${r.id} | Name: "${r.name}" | employee_number: "${r.employee_number}" | type: "${r.employee_type}"`);
    });
  } catch (err) {
    console.error('Error fetching employees:', err.message);
  }
}

check();
