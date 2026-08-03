async function checkExpenses() {
  try {
    const authRes = await fetch('https://www.jaibhavanicargo.com/hcgi/platform/api/collections/users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'munnarathod222@gmail.com', password: 'Munnarathod@25' })
    });
    const authData = await authRes.json();
    const token = authData.token;
    console.log('User auth token acquired:', !!token);

    const expRes = await fetch('https://www.jaibhavanicargo.com/hcgi/platform/api/collections/expenses/records?perPage=50', {
      headers: { 'Authorization': token }
    });
    const expData = await expRes.json();
    console.log('--- EXPENSES ---');
    console.log('Total expenses count:', expData.totalItems);
    (expData.items || []).forEach(item => {
      console.log(`ID: ${item.id} | date: ${item.date} | category: ${item.category} | subcategory: ${item.subcategory} | amount: ${item.amount}`);
    });

    const advRes = await fetch('https://www.jaibhavanicargo.com/hcgi/platform/api/collections/advances/records?perPage=50', {
      headers: { 'Authorization': token }
    });
    const advData = await advRes.json();
    console.log('\n--- ADVANCES ---');
    console.log('Total advances count:', advData.totalItems);
    (advData.items || []).forEach(item => {
      console.log(`ID: ${item.id} | date: ${item.date} | amount: ${item.amount} | status: ${item.status}`);
    });
  } catch(e) {
    console.error(e);
  }
}

checkExpenses();
