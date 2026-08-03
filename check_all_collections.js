async function checkAllCollections() {
  try {
    let token = '';
    const adminRes = await fetch('https://www.jaibhavanicargo.com/hcgi/platform/api/admins/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'munnarathod222@gmail.com', password: 'admin123456' })
    });
    const adminData = await adminRes.json();
    token = adminData.token;

    if (!token) {
      // Try superuser
      const suRes = await fetch('https://www.jaibhavanicargo.com/hcgi/platform/api/collections/_superusers/auth-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: 'munnarathod222@gmail.com', password: 'admin123456' })
      });
      const suData = await suRes.json();
      token = suData.token;
    }

    console.log('Superuser token acquired:', !!token);

    const collections = [
      'expenses', 'advances', 'cashbook', 'fuel_logs', 'maintenance_logs',
      'fastag_deductions', 'trips', 'trucks', 'employees', 'drivers', 'loan_profiles',
      'salary_slips', 'payroll', 'payments', 'vendor_tracker', 'users'
    ];

    for (const name of collections) {
      const recRes = await fetch(`https://www.jaibhavanicargo.com/hcgi/platform/api/collections/${name}/records?perPage=5`, {
        headers: token ? { 'Authorization': token } : {}
      });
      const recData = await recRes.json();
      console.log(`Collection [${name}]: ${recData.totalItems || 0} items`);
      if (recData.items && recData.items.length > 0) {
        console.log(`  Sample [${name}]:`, JSON.stringify(recData.items[0], null, 2));
      }
    }
  } catch(e) {
    console.error(e);
  }
}

checkAllCollections();
