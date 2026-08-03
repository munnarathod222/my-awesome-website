const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://www.jaibhavanicargo.com/hcgi/platform');

async function main() {
  console.log('Connecting to PocketBase at https://www.jaibhavanicargo.com/hcgi/platform ...');
  
  try {
    const records = await pb.collection('trip_logs').getFullList({ $autoCancel: false });
    console.log(`Found ${records.length} trip_logs in PocketBase.`);

    let updatedCount = 0;
    for (const record of records) {
      console.log(`Updating Trip ${record.trip_id || record.id}: current driver = "${record.driver_name || record.driver}" -> "Dayanand Surwase"`);
      await pb.collection('trip_logs').update(record.id, {
        driver_name: 'Dayanand Surwase',
        driver: 'Dayanand Surwase'
      }, { $autoCancel: false }).catch(err => {
        console.error(`Failed to update ${record.id}:`, err.message);
      });
      updatedCount++;
    }

    console.log(`\n✅ Successfully updated ${updatedCount} trip logs in PocketBase to driver "Dayanand Surwase"!`);
  } catch (err) {
    console.error('Error updating trip logs:', err);
  }
}

main();
