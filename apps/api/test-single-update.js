import PocketBase from 'pocketbase';

async function testUpdate() {
  const pb = new PocketBase('https://www.jaibhavanicargo.com/hcgi/platform');
  
  try {
    console.log("Authenticating...");
    await pb.collection('_superusers').authWithPassword('munnarathod222@gmail.com', 'cargo123456');
    console.log("Authenticated.");

    const reqId = 'hfswwmzhpdf7ir7';
    console.log(`Fetching request ${reqId}...`);
    const req = await pb.collection('payment_requests').getOne(reqId, { $autoCancel: false });
    console.log("Current record:", {
      id: req.id,
      request_date: req.request_date,
      due_date: req.due_date
    });

    console.log("Attempting update...");
    const updated = await pb.collection('payment_requests').update(reqId, {
      request_date: '2026-07-31 00:00:00.000Z',
      due_date: '2026-08-07 00:00:00.000Z'
    }, { $autoCancel: false });

    console.log("Updated response from server:", {
      id: updated.id,
      request_date: updated.request_date,
      due_date: updated.due_date
    });

    console.log("Refetching record...");
    const refetched = await pb.collection('payment_requests').getOne(reqId, { $autoCancel: false });
    console.log("Refetched record:", {
      id: refetched.id,
      request_date: refetched.request_date,
      due_date: refetched.due_date
    });

  } catch (err) {
    console.error("Error:", err.message);
  }
}

testUpdate();
