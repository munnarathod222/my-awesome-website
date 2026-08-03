const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://www.jaibhavanicargo.com/hcgi/platform');

async function main() {
  console.log('Fetching all employees from PocketBase...');
  try {
    const records = await pb.collection('employees').getFullList({ $autoCancel: false });
    console.log(`Total employees in DB: ${records.length}`);
    records.forEach(e => {
      console.log(`ID: ${e.id} | Name: ${e.name} | Type: ${e.employee_type} | Status: "${e.status}" | ActiveStatus: "${e.active_status}" | Active: ${e.active}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
