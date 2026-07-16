import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  // Find a trip that does not have client_payment_status = 'received'
  const trip = db.prepare("SELECT id, trip_id FROM trip_logs WHERE client_payment_status != 'received' LIMIT 1").get();
  console.log("Found trip to update:", trip);

  if (!trip) {
    console.error("No suitable trip found in DB.");
    process.exit(1);
  }

  // Construct payload to update
  console.log(`Updating trip ${trip.id} client_payment_status to 'received'...`);

  const response = await fetch(`http://localhost:3001/api/trips/${trip.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ client_payment_status: 'received' })
  });

  console.log("Response Status:", response.status);
  const data = await response.json();
  console.log("Response Data:", JSON.stringify(data, null, 2));

} catch (err) {
  console.error("Error:", err);
}
