import PocketBase from 'pocketbase';

const pb = new PocketBase('https://jaibhavanicargo.pockethost.io');

async function inspectAll() {
  try {
    console.log('=== FETCHING ROUTES ===');
    const routes = await pb.collection('routes').getFullList({ $autoCancel: false });
    routes.forEach(r => {
      console.log({
        id: r.id,
        route_code: r.route_code,
        route_name: r.route_name,
        origin: r.origin,
        destination: r.destination,
        start_location: r.start_location,
        end_location: r.end_location,
        stops: r.stops
      });
    });

    console.log('\n=== FETCHING TRIP-228 LOG ===');
    const logs = await pb.collection('trip_logs').getFullList({ filter: 'trip_id = "TRIP-228" || trip_id = "TRIP-226"', $autoCancel: false });
    logs.forEach(l => {
      console.log({
        id: l.id,
        trip_id: l.trip_id,
        route: l.route,
        route_id: l.route_id,
        origin: l.origin,
        destination: l.destination
      });
    });
  } catch (e) {
    console.error('Error:', e);
  }
}

inspectAll();
