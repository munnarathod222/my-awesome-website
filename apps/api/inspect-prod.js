import PocketBase from 'pocketbase';

async function inspectProd() {
  const pb = new PocketBase('https://www.jaibhavanicargo.com/hcgi/platform');
  
  try {
    await pb.collection('_superusers').authWithPassword('munnarathod222@gmail.com', 'cargo123456');
    console.log("Authenticated.");

    const requests = await pb.collection('payment_requests').getFullList({
      expand: 'trip_id,client_id',
      sort: '-request_date',
      $autoCancel: false
    });

    console.log(`Production requests count: ${requests.length}`);
    requests.slice(0, 15).forEach((r, idx) => {
      console.log(`[${idx}] Req ID: ${r.id}`);
      console.log(`    Request Date: ${r.request_date}`);
      console.log(`    Due Date: ${r.due_date}`);
      console.log(`    Client: ${r.expand?.client_id?.client_name}`);
      console.log(`    Trip ID: ${r.expand?.trip_id?.trip_id}`);
      console.log(`    Trip Log Date: ${r.expand?.trip_id?.date}`);
    });

  } catch (err) {
    console.error("Failed:", err.message);
  }
}

inspectProd();
