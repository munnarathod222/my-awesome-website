import pb from './pocketbaseClient.js';

/**
 * Calculate dynamic transport credit score (300-850) and average payment days
 */
export function calculateCustomerCreditProfile(customer) {
  const creditLimit = Number(customer.credit_limit || 0);
  const outstanding = Number(customer.outstanding_amount || 0);
  const utilization = creditLimit > 0 ? (outstanding / creditLimit) : 0;
  
  let score = 750;
  let avgPaymentDays = 15;

  if (customer.risk_level === 'High Risk' || utilization > 0.8) {
    score = 540 - Math.round(utilization * 100);
    avgPaymentDays = Math.round(45 + utilization * 20);
  } else if (customer.risk_level === 'Average' || utilization > 0.4) {
    score = 670 - Math.round(utilization * 60);
    avgPaymentDays = Math.round(28 + utilization * 10);
  } else {
    score = 780 - Math.round(utilization * 40);
    avgPaymentDays = Math.round(14 + utilization * 5);
  }

  score = Math.min(850, Math.max(300, score));

  let scoreTier = 'AAA';
  let scoreColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  
  if (score >= 750) { scoreTier = 'AAA'; scoreColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'; }
  else if (score >= 670) { scoreTier = 'AA'; scoreColor = 'bg-blue-500/10 text-blue-400 border-blue-500/30'; }
  else if (score >= 580) { scoreTier = 'A'; scoreColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30'; }
  else { scoreTier = 'C'; scoreColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30'; }

  return {
    credit_score: score,
    credit_tier: scoreTier,
    score_color: scoreColor,
    avg_payment_days: avgPaymentDays,
    credit_utilization_pct: Math.round(utilization * 100)
  };
}

/**
 * Fetch all CRM customers from PocketBase with computed Transport Credit Scores
 */
export async function getCrmCustomers() {
  try {
    const records = await pb.collection('transport_crm_customers').getFullList({
      sort: '-created',
      $autoCancel: false
    }).catch(() => []);

    if (records && records.length > 0) {
      return records.map(r => {
        let extra = {};
        if (r.data_json) {
          try { extra = JSON.parse(r.data_json); } catch (e) {}
        }
        
        const profile = {
          id: r.id,
          company_name: r.company_name || 'Client',
          customer_code: r.customer_code || `CUST-${r.id.slice(-4).toUpperCase()}`,
          industry: r.industry || 'Logistics & Trade',
          gstin: r.gstin || '',
          pan: r.pan || '',
          primary_contact: r.primary_contact || '',
          phone: r.phone || '',
          email: r.email || '',
          city: r.city || '',
          credit_limit: Number(r.credit_limit || 0),
          outstanding_amount: Number(r.outstanding_amount || 0),
          risk_level: r.risk_level || 'Excellent',
          status: r.status || 'Active',
          total_revenue: Number(r.total_revenue || 0),
          total_shipments: Number(r.total_shipments || 0),
          ...extra
        };

        return {
          ...profile,
          ...calculateCustomerCreditProfile(profile)
        };
      });
    }

    // Query real PocketBase `clients` and `trip_logs` to build CRM database
    const [clientsList, tripLogsList] = await Promise.all([
      pb.collection('clients').getFullList({ sort: 'client_name', $autoCancel: false }).catch(() => []),
      pb.collection('trip_logs').getFullList({ $autoCancel: false }).catch(() => [])
    ]);

    if (clientsList.length > 0) {
      return clientsList.map(c => {
        const clientTrips = tripLogsList.filter(t => 
          t.client_id === c.id || 
          t.client_name === c.client_name || 
          t.client_name === c.company_name
        );

        const totalRev = clientTrips.reduce((acc, t) => acc + Number(t.revenue || t.amount || 0), 0);
        const outstanding = clientTrips.reduce((acc, t) => {
          const rev = Number(t.revenue || t.amount || 0);
          const paid = Number(t.advance_received_from_client || 0);
          return acc + Math.max(0, rev - paid);
        }, 0);

        const profile = {
          id: c.id,
          company_name: c.company_name || c.client_name || 'Client',
          customer_code: `CUST-${c.id.slice(-4).toUpperCase()}`,
          industry: c.industry || 'General Freight',
          gstin: c.gst_number || c.gstin || '',
          pan: c.pan_number || c.pan || '',
          primary_contact: c.contact_person || c.primary_contact || '',
          phone: c.phone_number || c.phone || '',
          email: c.email || '',
          city: c.city || '',
          credit_limit: Number(c.credit_limit || 0),
          outstanding_amount: Number(c.outstanding_dues || outstanding || 0),
          risk_level: c.risk_level || (outstanding > 500000 ? 'High Risk' : 'Excellent'),
          status: c.status || 'Active',
          total_revenue: totalRev,
          total_shipments: clientTrips.length
        };

        return {
          ...profile,
          ...calculateCustomerCreditProfile(profile)
        };
      });
    }

    return [];
  } catch (err) {
    console.error('Failed to fetch CRM customers from PocketBase:', err);
    return [];
  }
}

/**
 * Save or Update a CRM customer in PocketBase
 */
export async function saveCrmCustomer(customerData) {
  try {
    const payload = {
      company_name: customerData.company_name,
      customer_code: customerData.customer_code || `CUST-${Date.now().toString(36).toUpperCase()}`,
      industry: customerData.industry || 'Logistics',
      gstin: customerData.gstin || '',
      pan: customerData.pan || '',
      primary_contact: customerData.primary_contact || '',
      phone: customerData.phone || '',
      email: customerData.email || '',
      city: customerData.city || '',
      credit_limit: Number(customerData.credit_limit || 0),
      outstanding_amount: Number(customerData.outstanding_amount || 0),
      risk_level: customerData.risk_level || 'Excellent',
      status: customerData.status || 'Active',
      total_revenue: Number(customerData.total_revenue || 0),
      total_shipments: Number(customerData.total_shipments || 0),
      data_json: JSON.stringify(customerData)
    };

    if (customerData.id && !customerData.id.startsWith('crm_cust_')) {
      return await pb.collection('transport_crm_customers').update(customerData.id, payload, { $autoCancel: false }).catch(() => {
        return pb.collection('clients').update(customerData.id, payload, { $autoCancel: false });
      });
    } else {
      return await pb.collection('transport_crm_customers').create(payload, { $autoCancel: false }).catch(() => {
        return pb.collection('clients').create(payload, { $autoCancel: false });
      });
    }
  } catch (err) {
    console.error('Failed to save CRM customer:', err);
    throw err;
  }
}

/**
 * Delete a CRM customer from PocketBase
 */
export async function deleteCrmCustomer(id) {
  try {
    await pb.collection('transport_crm_customers').delete(id, { $autoCancel: false }).catch(() => {
      return pb.collection('clients').delete(id, { $autoCancel: false });
    });
  } catch (err) {
    console.error('Failed to delete CRM customer:', err);
    throw err;
  }
}
