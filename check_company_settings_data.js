const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://www.jaibhavanicargo.com/hcgi/platform');

async function main() {
  console.log('Fetching company_settings from PocketBase...');
  try {
    const records = await pb.collection('company_settings').getFullList({ $autoCancel: false });
    console.log(`Found ${records.length} company_settings records.`);
    records.forEach(r => {
      console.log('Company Settings record:', JSON.stringify(r, null, 2));
    });
  } catch (err) {
    console.error('Error fetching company_settings:', err.message);
  }
}

main();
