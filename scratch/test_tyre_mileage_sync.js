import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

async function test() {
  try {
    // 1. Authenticate as superuser
    console.log("Authenticating as superuser...");
    await pb.collection('_superusers').authWithPassword('munnarathod222@gmail.com', 'admin123456');

    const truckId = "6xgyihriatqq45w";
    const truck = await pb.collection('trucks').getOne(truckId);
    const truckNumber = truck.truck_number;
    console.log(`Truck found: ID=${truckId}, Number=${truckNumber}`);

    // Get current KMS for both tyres
    const frontRightBefore = await pb.collection('tyres').getOne('mb5bnibt0g2phna');
    const stepneyBefore = await pb.collection('tyres').getOne('qu6u6f6ukazzjje');

    console.log(`\nBefore trip creation:`);
    console.log(`Front Right Tyre (${frontRightBefore.id}) KMS: ${frontRightBefore.current_lifecycle_kms}`);
    console.log(`Stepney Tyre (${stepneyBefore.id}) KMS: ${stepneyBefore.current_lifecycle_kms}`);

    // 2. Create a Completed trip log
    console.log("\nCreating a Completed trip log with 100 KMS...");
    const testTrip = await pb.collection('trip_logs').create({
      truck_number: truckNumber,
      kms: 100,
      trip_status: "Completed",
      date: new Date().toISOString(),
      revenue: 10000,
      advance_paid_to_driver: 500,
      driver_name: "Dayanand surwase",
      route: "hyderabad - warangal",
      trip_id: "TRIP-test-123",
      user_id: "vomu7tmaa889wv8"
    });

    console.log(`Created trip log: ID=${testTrip.id}`);

    // Wait a brief moment for the async pocketbase event hook to run and save changes
    await new Promise(r => setTimeout(r, 1000));

    // Get updated KMS for both tyres
    const frontRightAfter = await pb.collection('tyres').getOne('mb5bnibt0g2phna');
    const stepneyAfter = await pb.collection('tyres').getOne('qu6u6f6ukazzjje');

    console.log(`\nAfter trip creation:`);
    console.log(`Front Right Tyre (${frontRightAfter.id}) KMS: ${frontRightAfter.current_lifecycle_kms}`);
    console.log(`Stepney Tyre (${stepneyAfter.id}) KMS: ${stepneyAfter.current_lifecycle_kms}`);

    // Validate
    const frontRightDiff = frontRightAfter.current_lifecycle_kms - frontRightBefore.current_lifecycle_kms;
    const stepneyDiff = stepneyAfter.current_lifecycle_kms - stepneyBefore.current_lifecycle_kms;

    console.log(`\nDiff calculation:`);
    console.log(`Front Right diff: +${frontRightDiff} KMS (Expected: +100)`);
    console.log(`Stepney diff: +${stepneyDiff} KMS (Expected: +0)`);

    // Clean up
    console.log("\nCleaning up test trip log...");
    await pb.collection('trip_logs').delete(testTrip.id);
    console.log("Cleanup complete.");

    if (frontRightDiff === 100 && stepneyDiff === 0) {
      console.log("\nSUCCESS: Stepney tyre was correctly excluded from trip mileage calculations, while active running tyres were synced successfully!");
    } else {
      console.log("\nFAILURE: Sync logic did not match expected behavior.");
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
