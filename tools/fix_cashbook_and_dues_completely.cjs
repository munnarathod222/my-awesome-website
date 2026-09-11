const https = require('https');
const fs = require('fs');
const path = require('path');

function pbGet(endpoint) {
  return new Promise((resolve, reject) => {
    https.get('https://www.jaibhavanicargo.com/hcgi/platform/api/' + endpoint, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { resolve(body); }
      });
    }).on('error', reject);
  });
}

function pbPost(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = https.request({
      hostname: 'www.jaibhavanicargo.com',
      path: '/hcgi/platform/api/' + endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { resolve(body); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('=== Step 1: Syncing all Paid Payment Requests into Cashbook Collection ===');
  
  const [reqsRes, cashbookRes, clientsRes, tripsRes] = await Promise.all([
    pbGet('collections/payment_requests/records?perPage=500&expand=trip_id,client_id'),
    pbGet('collections/cashbook/records?perPage=1000'),
    pbGet('collections/clients/records?perPage=200'),
    pbGet('collections/trip_logs/records?perPage=500')
  ]);

  const requests = reqsRes.items || [];
  const cashbookItems = cashbookRes.items || [];
  const clients = clientsRes.items || [];
  const trips = tripsRes.items || [];

  console.log(`Total payment requests in DB: ${requests.length}`);
  console.log(`Total cashbook items in DB: ${cashbookItems.length}`);

  const paidRequests = requests.filter(r => (r.status || '').toLowerCase() === 'paid');
  console.log(`Found ${paidRequests.length} Paid payment requests.`);

  // Build lookup of existing cashbook reference IDs and descriptions
  const existingRefIds = new Set();
  cashbookItems.forEach(cb => {
    if (cb.reference_id) {
      cb.reference_id.split(',').forEach(id => existingRefIds.add(id.trim()));
    }
    if (cb.description) {
      existingRefIds.add(cb.description);
    }
  });

  let addedCount = 0;
  let totalIncomeAdded = 0;

  for (const req of paidRequests) {
    const tripObj = req.expand?.trip_id || trips.find(t => t.id === req.trip_id || t.trip_id === req.trip_id);
    const clientObj = req.expand?.client_id || clients.find(c => c.id === req.client_id);
    const clientName = clientObj?.client_name || req.client_name || 'Client';
    const tripId = tripObj?.trip_id || req.trip_id || 'TRIP';
    const amount = Number(req.amount) || Number(tripObj?.revenue) || 7100;

    const desc = `Payment received for ${tripId} - ${clientName}`;

    const isSynced = existingRefIds.has(req.id) || 
                     (req.trip_id && existingRefIds.has(req.trip_id)) ||
                     existingRefIds.has(desc);

    if (!isSynced) {
      const dateStr = req.payment_date || req.request_date || tripObj?.date || new Date().toISOString();

      const newCashbookEntry = {
        added_by: 'usr_munna_superadmin',
        amount: amount,
        category: 'Trip Revenue',
        date: dateStr,
        description: desc,
        notes: `Auto-synced from Paid Payment Request ${req.id}`,
        reference_id: req.id,
        reference_type: '',
        status: 'Completed',
        transaction_type: 'Income'
      };

      try {
        const created = await pbPost('collections/cashbook/records', newCashbookEntry);
        if (created && created.id) {
          addedCount++;
          totalIncomeAdded += amount;
          existingRefIds.add(req.id);
          existingRefIds.add(desc);
          console.log(`✅ Added Cashbook Income [${created.id}]: ${tripId} (${clientName}) - Rs. ${amount}`);
        } else {
          console.warn(`⚠️ Failed to create Cashbook entry for req ${req.id}:`, created);
        }
      } catch (err) {
        console.error(`❌ Error creating Cashbook entry for req ${req.id}:`, err);
      }
    }
  }

  console.log(`\n🎉 Cashbook Sync Finished! Created ${addedCount} missing Income transactions (Total: Rs. ${totalIncomeAdded.toLocaleString('en-IN')}).`);
}

run().catch(console.error);
