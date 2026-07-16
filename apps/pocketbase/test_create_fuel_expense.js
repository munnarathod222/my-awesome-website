import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

async function test() {
  try {
    // Authenticate as the default superuser/admin using password from .env
    await pb.collection('_superusers').authWithPassword('munnarathod222@gmail.com', 'admin123456');
    console.log("Logged in successfully as admin.");

    // Retrieve a valid user ID
    const users = await pb.collection('users').getList(1, 1);
    const userId = users.items[0]?.id || 'vomu7tmaa889wv8';
    
    // Retrieve a valid truck ID
    const trucks = await pb.collection('trucks').getList(1, 1);
    if (trucks.items.length === 0) {
      console.error("No trucks found in database to link relation!");
      return;
    }
    const truck = trucks.items[0];
    console.log(`Using valid truck: ${truck.truck_number} (ID: ${truck.id})`);

    // Create a dummy fuel tracker record to link
    const trackerPayload = {
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      truck_id: truck.id,
      truck_number: truck.truck_number,
      distance_driven: 100,
      liters: 20,
      total_cost: 2000,
      payment_method: 'Cash',
      notes: 'Test refill'
    };
    
    let tracker;
    try {
      tracker = await pb.collection('fuel_tracker').create(trackerPayload);
      console.log("Created dummy fuel tracker:", tracker.id);
    } catch (err) {
      console.error("Failed to create fuel tracker:", err.data || err);
      return;
    }

    const expensePayload = {
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      category: 'Regular',
      subcategory: 'Fuel',
      amount: 2000,
      liters: 20,
      truck_id: truck.truck_number,
      description: `${truck.truck_number} - 100 KMs Driven - 20 L`,
      payment_method: 'Cash',
      status: 'Approved',
      created_by: userId,
      fuel_tracker_id: tracker.id
    };

    console.log("Attempting to create expense with payload:", expensePayload);
    const expense = await pb.collection('expenses').create(expensePayload);
    console.log("Expense created successfully:", expense.id);
  } catch (error) {
    console.error("Error creating expense:", error.data || error);
  }
}

test();
