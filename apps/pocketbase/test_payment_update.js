import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function testUpdate() {
  try {
    // 1. Authenticate
    await pb.collection('users').authWithPassword('admin@jbcargo.com', 'Munnarathod@25');
    console.log("Authenticated successfully as admin@jbcargo.com");

    // 2. Find a trip log with status != 'received'
    const trips = await pb.collection('trip_logs').getList(1, 1, {
      filter: 'client_payment_status != "received"'
    });

    if (trips.items.length === 0) {
      console.log("No trips found with status != 'received'");
      return;
    }

    const trip = trips.items[0];
    console.log(`Found trip: ID=${trip.id}, trip_id=${trip.trip_id}, current status=${trip.client_payment_status}`);

    // 3. Try to update client_payment_status to 'received'
    console.log("Attempting to update status to 'received'...");
    const updated = await pb.collection('trip_logs').update(trip.id, {
      client_payment_status: 'received'
    });
    console.log("Update succeeded! New status:", updated.client_payment_status);

    // 4. Restore original status so we don't pollute the DB
    await pb.collection('trip_logs').update(trip.id, {
      client_payment_status: trip.client_payment_status
    });
    console.log("Restored original status");

  } catch (err) {
    console.error("Update failed:", err.message);
    if (err.data) {
      console.error("Error data:", JSON.stringify(err.data));
    }
  }
}

testUpdate();
