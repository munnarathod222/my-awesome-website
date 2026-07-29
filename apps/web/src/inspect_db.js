import PocketBase from 'pocketbase';

// Let's connect directly to PocketHost backend
const pb = new PocketBase('https://jaibhavanicargo.pockethost.io');

async function inspect() {
  try {
    console.log('=== CHECKING ALL ROUTES IN POCKETBASE ===');
    const routes = await pb.collection('routes').getFullList({ $autoCancel: false }).catch(() => []);
    console.log('Routes count:', routes.length);
    routes.forEach(r => {
      console.log(`ROUTE ID: ${r.id} | CODE: "${r.route_code}" | NAME: "${r.route_name}" | ORIGIN: "${r.origin}" | DEST: "${r.destination}" | START: "${r.start_location}" | END: "${r.end_location}"`);
    });

    console.log('\n=== CHECKING TRIP_LOGS RECORD FOR TRIP-228 & TRIP-226 ===');
    const logs = await pb.collection('trip_logs').getFullList({ $autoCancel: false }).catch(() => []);
    console.log('Trip logs count:', logs.length);
    logs.filter(l => l.trip_id === 'TRIP-228' || l.trip_id === 'TRIP-226' || (l.route && l.route.includes('MHYD'))).forEach(l => {
      console.log(`LOG ID: ${l.id} | TRIP_ID: "${l.trip_id}" | ROUTE: "${l.route}" | ROUTE_ID: "${l.route_id}" | ORIGIN: "${l.origin}" | DEST: "${l.destination}"`);
    });
  } catch (e) {
    console.error('Error:', e);
  }
}

inspect();
