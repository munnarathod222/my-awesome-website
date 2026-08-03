import PocketBase from 'pocketbase';

const PB_HOST = 'https://www.jaibhavanicargo.com/hcgi/platform';
const EMAIL = 'munnarathod222@gmail.com';
const PASSWORD = 'Munnarathod@25';

async function main() {
  const pb = new PocketBase(PB_HOST);
  pb.autoCancellation(false);

  console.log(`Logging in as ${EMAIL}...`);
  await pb.collection('users').authWithPassword(EMAIL, PASSWORD);
  console.log('✅ Logged in!\n');

  console.log('--- Testing Individual Dashboard Queries ---');

  // Query 1: users
  try {
    const q1 = await pb.collection('users').getList(1, 1, { $autoCancel: false });
    console.log('1. users:', q1.totalItems, 'items');
  } catch (e) {
    console.log('1. users FAILED:', e.message, e.response);
  }

  // Query 2: Delivered trips (with fields filter)
  try {
    const q2 = await pb.collection('trip_logs').getList(1, 500, {
      filter: 'trip_status = "Delivered"',
      sort: '-date',
      fields: 'id,revenue,ownership_type,brokerage_margin,tds_deducted_receivable',
      $autoCancel: false,
    });
    console.log('2. deliveredTrips (with fields):', q2.totalItems, 'items');
  } catch (e) {
    console.log('2. deliveredTrips (with fields) FAILED:', e.message, e.response);
  }

  // Query 3: Delivered trips (WITHOUT fields filter)
  try {
    const q3 = await pb.collection('trip_logs').getList(1, 500, {
      filter: 'trip_status = "Delivered"',
      sort: '-date',
      $autoCancel: false,
    });
    console.log('3. deliveredTrips (NO fields):', q3.totalItems, 'items');
  } catch (e) {
    console.log('3. deliveredTrips (NO fields) FAILED:', e.message, e.response);
  }

  // Query 4: All trips count
  try {
    const q4 = await pb.collection('trip_logs').getList(1, 1, { $autoCancel: false });
    console.log('4. allTripsCount:', q4.totalItems, 'items');
  } catch (e) {
    console.log('4. allTripsCount FAILED:', e.message, e.response);
  }

  // Query 5: Trucks full list
  try {
    const q5 = await pb.collection('trucks').getFullList({ fields: 'id,truck_number,current_fastag_balance', $autoCancel: false });
    console.log('5. trucks (with fields):', q5.length, 'items');
  } catch (e) {
    console.log('5. trucks (with fields) FAILED:', e.message, e.response);
  }

  // Query 6: Trucks full list NO fields
  try {
    const q6 = await pb.collection('trucks').getFullList({ $autoCancel: false });
    console.log('6. trucks (NO fields):', q6.length, 'items');
  } catch (e) {
    console.log('6. trucks (NO fields) FAILED:', e.message, e.response);
  }

  // Query 7: Expenses
  try {
    const q7 = await pb.collection('expenses').getList(1, 500, { fields: 'id,amount', $autoCancel: false });
    console.log('7. expenses (with fields):', q7.totalItems, 'items');
  } catch (e) {
    console.log('7. expenses (with fields) FAILED:', e.message, e.response);
  }

  // Query 8: Expenses NO fields
  try {
    const q8 = await pb.collection('expenses').getList(1, 500, { $autoCancel: false });
    console.log('8. expenses (NO fields):', q8.totalItems, 'items');
  } catch (e) {
    console.log('8. expenses (NO fields) FAILED:', e.message, e.response);
  }
}

main().catch(console.error);
