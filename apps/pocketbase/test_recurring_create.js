import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function runTest() {
  try {
    // 1. Authenticate
    await pb.collection('users').authWithPassword('admin@jbcargo.com', 'Munnarathod@25');
    console.log("Authenticated successfully as admin@jbcargo.com");

    // 2. Fetch required entities for creating a trip log
    const routes = await pb.collection('routes').getList(1, 1);
    const clients = await pb.collection('clients').getList(1, 1);
    const drivers = await pb.collection('employees').getList(1, 1, { filter: 'employee_type="driver"' });
    const trucks = await pb.collection('trucks').getList(1, 1);

    if (!routes.items.length || !clients.items.length || !drivers.items.length || !trucks.items.length) {
      console.error("Missing required seed data: routes, clients, drivers, or trucks.");
      return;
    }

    const route = routes.items[0];
    const client = clients.items[0];
    const driver = drivers.items[0];
    const truck = trucks.items[0];

    console.log(`Using templates:\n- Client: ${client.client_name} (${client.id})\n- Route: ${route.route_code} (${route.id})\n- Driver: ${driver.name} (${driver.id}, ${driver.employment_type})\n- Truck: ${truck.truck_number} (${truck.id})`);

    // 3. Perform Test A: Bulk Create with Permanent Driver
    console.log("\n=== Test A: Bulk Create with Permanent Driver ===");
    const permanentPayload = {
      client_id: client.id,
      route_id: route.id,
      date: '2026-07-20 12:00:00.000Z',
      route: route.route_code,
      revenue: 12000,
      kms: 250,
      advance_received_from_client: 3000,
      advance_paid_to_driver: 2000,
      client_payment_status: 'pending',
      trip_status: 'Upcoming',
      driver_name: driver.name,
      truck_number: truck.truck_number
    };

    const tokenPayload = JSON.stringify({
      token: pb.authStore.token,
      record: pb.authStore.model,
    });
    const encodedToken = btoa(unescape(encodeURIComponent(tokenPayload)));

    let response = await fetch('http://127.0.0.1:3001/api/trips/bulk-create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${encodedToken}`
      },
      body: JSON.stringify({ trips: [permanentPayload] })
    });

    let resData = await response.json();
    if (!response.ok || !resData.success) {
      throw new Error(`Test A Failed: ${resData.error} | ${JSON.stringify(resData.details || {})}`);
    }
    console.log("Test A Succeeded! Response:", resData);

    // 4. Perform Test B: Bulk Create with Market / Leased Driver
    console.log("\n=== Test B: Bulk Create with Market / Leased Driver ===");
    
    // Temporarily set driver employment_type to 'Market / Leased'
    const originalType = driver.employment_type;
    console.log(`Setting driver ${driver.name} employment type to 'Market / Leased'...`);
    await pb.collection('employees').update(driver.id, { employment_type: 'Market / Leased' });

    const marketPayload = {
      client_id: client.id,
      route_id: route.id,
      date: '2026-07-21 12:00:00.000Z',
      route: route.route_code,
      revenue: 15000,
      kms: 300,
      advance_received_from_client: 4000,
      advance_paid_to_driver: 3000,
      client_payment_status: 'pending',
      trip_status: 'Upcoming',
      driver_name: driver.name,
      truck_number: truck.truck_number
    };

    response = await fetch('http://127.0.0.1:3001/api/trips/bulk-create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${encodedToken}`
      },
      body: JSON.stringify({ trips: [marketPayload] })
    });

    resData = await response.json();
    
    // Clean up driver employment_type immediately
    console.log(`Restoring driver ${driver.name} employment type to '${originalType}'...`);
    await pb.collection('employees').update(driver.id, { employment_type: originalType });

    if (!response.ok || !resData.success) {
      throw new Error(`Test B Failed: ${resData.error} | ${JSON.stringify(resData.details || {})}`);
    }
    console.log("Test B Succeeded! Response:", resData);

    // 5. Cleanup generated trips and ledgers
    console.log("\nCleaning up test trips and associated ledger entries...");
    const createdTrips = await pb.collection('trip_logs').getList(1, 10, {
      filter: 'date = "2026-07-20 12:00:00.000Z" || date = "2026-07-21 12:00:00.000Z"',
      sort: '-created'
    });
    
    for (const t of createdTrips.items) {
      // Find and delete any driver ledger entry pointing to this trip log
      try {
        const ledgers = await pb.collection('driver_ledger').getList(1, 5, {
          filter: `trip_id = "${t.id}"`
        });
        for (const l of ledgers.items) {
          await pb.collection('driver_ledger').delete(l.id, { $autoCancel: false });
          console.log(`Deleted test driver ledger entry: ${l.id}`);
        }
      } catch (lErr) {
        console.log(`No ledger entry found or failed to delete ledger for trip ${t.id}: ${lErr.message}`);
      }

      // Find and delete any cashbook entry pointing to this trip log reference_id
      try {
        const cashbookItems = await pb.collection('cashbook').getList(1, 5, {
          filter: `reference_id = "${t.id}"`
        });
        for (const c of cashbookItems.items) {
          await pb.collection('cashbook').delete(c.id, { $autoCancel: false });
          console.log(`Deleted test cashbook entry: ${c.id}`);
        }
      } catch (cErr) {
        console.log(`No cashbook entry found or failed to delete cashbook for trip ${t.id}: ${cErr.message}`);
      }

      // Now delete the trip
      await pb.collection('trip_logs').delete(t.id, { $autoCancel: false });
      console.log(`Deleted test trip log: ${t.id} (${t.trip_id})`);
    }

    console.log("\n✅ Test Suite Finished Successfully!");

  } catch (err) {
    console.error("\n❌ Test Suite Failed:", err.message);
  }
}

runTest();
