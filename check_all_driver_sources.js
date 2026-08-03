const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://www.jaibhavanicargo.com/hcgi/platform');

async function main() {
  console.log('--- 1. EMPLOYEES COLLECTION ---');
  try {
    const emps = await pb.collection('employees').getFullList({ $autoCancel: false });
    console.log(`Employees count: ${emps.length}`);
    emps.forEach(e => {
      console.log(`- [${e.id}] ${e.name} | Role: ${e.employee_type} | Status: "${e.status}" | ActiveStatus: "${e.active_status}" | Active: ${e.active}`);
    });
  } catch (e) {
    console.log('Error reading employees:', e.message);
  }

  console.log('\n--- 2. DRIVER APPLICATIONS COLLECTION ---');
  try {
    const apps = await pb.collection('driver_applications').getFullList({ $autoCancel: false });
    console.log(`Driver Applications count: ${apps.length}`);
    apps.forEach(a => {
      console.log(`- [${a.id}] ${a.full_name || a.applicant_name} | Role: ${a.applicant_role} | Status: "${a.status}" | ActiveStatus: "${a.active_status}"`);
    });
  } catch (e) {
    console.log('Error reading driver_applications:', e.message);
  }

  console.log('\n--- 3. TRIPS UNIQUE DRIVERS ---');
  try {
    const trips = await pb.collection('trip_logs').getFullList({ fields: 'driver_name,driver', $autoCancel: false });
    const driverSet = new Set();
    trips.forEach(t => {
      if (t.driver_name) driverSet.add(t.driver_name);
      if (t.driver) driverSet.add(t.driver);
    });
    console.log(`Unique drivers in trip_logs (${driverSet.size}):`, Array.from(driverSet));
  } catch (e) {
    console.log('Error reading trips:', e.message);
  }
}

main();
