import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

async function main() {
  try {
    const routes = await pb.collection('routes').getFullList({ $autoCancel: false });
    console.log('\n--- ALL ROUTES IN LOCAL POCKETBASE (' + routes.length + ') ---');
    routes.forEach(r => {
      console.log({
        id: r.id,
        route_code: r.route_code,
        route_name: r.route_name,
        origin: r.origin,
        destination: r.destination,
        start_location: r.start_location,
        end_location: r.end_location
      });
    });

    console.log('\n--- TRIP LOG RECORD TRIP-228 ---');
    const logs228 = await pb.collection('trip_logs').getFullList({ filter: 'trip_id = "TRIP-228"', $autoCancel: false });
    console.log(logs228[0]);

  } catch (e) {
    console.error('Error:', e);
  }
}

main();
