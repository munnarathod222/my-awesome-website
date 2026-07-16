import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

async function test() {
  try {
    // 1. Get an admin user from the users collection
    const systemClient = new PocketBase('http://localhost:8090');
    await systemClient.collection('_superusers').authWithPassword('munnarathod222@gmail.com', 'admin123456');
    const users = await systemClient.collection('users').getFullList({
      filter: 'role = "admin"'
    });
    
    if (users.length === 0) {
      console.error("No users with role='admin' found in users collection!");
      return;
    }
    
    const userToUse = users[0];
    console.log(`Simulating user: ${userToUse.email} (ID: ${userToUse.id}, Role: ${userToUse.role})`);

    // Let's create a temporary test user in the users collection
    let testUser;
    try {
      testUser = await systemClient.collection('users').create({
        email: 'test_admin_temp@jaibhavanicargo.com',
        password: 'testpassword123',
        passwordConfirm: 'testpassword123',
        name: 'Test Admin',
        full_name: 'Test Admin User',
        phone_number: '1234567890',
        role: 'admin',
        status: 'active'
      });
      console.log("Created temporary test admin:", testUser.email);
    } catch (err) {
      // If already exists, retrieve it
      const existing = await systemClient.collection('users').getFullList({
        filter: 'email = "test_admin_temp@jaibhavanicargo.com"'
      });
      if (existing.length > 0) {
        testUser = existing[0];
        console.log("Using existing temporary test admin:", testUser.email);
      } else {
        console.error("Failed to create/get test user:", err.data || err);
        return;
      }
    }

    // Now authenticate our main pb client as this test admin!
    await pb.collection('users').authWithPassword('test_admin_temp@jaibhavanicargo.com', 'testpassword123');
    console.log("Logged in successfully as regular admin user.");

    // Retrieve a valid truck ID
    const trucks = await pb.collection('trucks').getList(1, 1);
    if (trucks.items.length === 0) {
      console.error("No trucks found in database to link relation!");
      return;
    }
    const truck = trucks.items[0];

    // Create fuel tracker record
    const trackerPayload = {
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      truck_id: truck.id,
      truck_number: truck.truck_number,
      distance_driven: 150,
      liters: 30,
      total_cost: 3000,
      payment_method: 'Cash',
      notes: 'Test regular user refill'
    };
    
    let tracker;
    try {
      tracker = await pb.collection('fuel_tracker').create(trackerPayload);
      console.log("Created fuel tracker:", tracker.id);
    } catch (err) {
      console.error("Failed to create fuel tracker:", err.data || err);
      return;
    }

    const expensePayload = {
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      category: 'Regular',
      subcategory: 'Fuel',
      amount: 3000,
      liters: 30,
      truck_id: truck.truck_number,
      description: `${truck.truck_number} - 150 KMs Driven - 30 L`,
      payment_method: 'Cash',
      status: 'Approved',
      created_by: pb.authStore.model.id,
      fuel_tracker_id: tracker.id
    };

    console.log("Attempting to create expense with payload:", expensePayload);
    const expense = await pb.collection('expenses').create(expensePayload);
    console.log("Expense created successfully:", expense.id);

    // Clean up temporary user and records
    await systemClient.collection('expenses').delete(expense.id);
    await systemClient.collection('fuel_tracker').delete(tracker.id);
    await systemClient.collection('users').delete(testUser.id);
    console.log("Cleaned up test data successfully.");
  } catch (error) {
    console.error("Error in simulation:", error.data || error);
  }
}

test();
