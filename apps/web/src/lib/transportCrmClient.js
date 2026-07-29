import pb from './pocketbaseClient.js';

/**
 * Calculate dynamic transport credit score (300-850) and average payment days
 */
export function calculateCustomerCreditProfile(customer) {
  const creditLimit = Number(customer.credit_limit || 2500000);
  const outstanding = Number(customer.outstanding_amount || 0);
  const utilization = creditLimit > 0 ? (outstanding / creditLimit) : 0;
  
  let score = 720;
  let avgPaymentDays = 24;

  if (customer.risk_level === 'Excellent') {
    score = 780 - Math.round(utilization * 60);
    avgPaymentDays = Math.round(14 + utilization * 10);
  } else if (customer.risk_level === 'Average') {
    score = 660 - Math.round(utilization * 80);
    avgPaymentDays = Math.round(28 + utilization * 15);
  } else {
    score = 520 - Math.round(utilization * 100);
    avgPaymentDays = Math.round(48 + utilization * 20);
  }

  score = Math.min(850, Math.max(300, score));

  let scoreTier = 'AAA';
  let scoreColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
  
  if (score >= 750) { scoreTier = 'AAA'; scoreColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'; }
  else if (score >= 670) { scoreTier = 'AA'; scoreColor = 'bg-blue-500/10 text-blue-500 border-blue-500/30'; }
  else if (score >= 580) { scoreTier = 'A'; scoreColor = 'bg-amber-500/10 text-amber-500 border-amber-500/30'; }
  else { scoreTier = 'C'; scoreColor = 'bg-rose-500/10 text-rose-500 border-rose-500/30'; }

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

    return (records || []).map(r => {
      let extra = {};
      if (r.data_json) {
        try { extra = JSON.parse(r.data_json); } catch (e) {}
      }
      
      const profile = {
        id: r.id,
        company_name: r.company_name,
        customer_code: r.customer_code || `CUST-${r.id.slice(-4).toUpperCase()}`,
        industry: r.industry || 'Logistics & Trade',
        gstin: r.gstin || '',
        pan: r.pan || '',
        primary_contact: r.primary_contact || '',
        phone: r.phone || '',
        email: r.email || '',
        city: r.city || '',
        credit_limit: r.credit_limit || 0,
        outstanding_amount: r.outstanding_amount || 0,
        risk_level: r.risk_level || 'Excellent',
        status: r.status || 'Active',
        total_revenue: r.total_revenue || 0,
        total_shipments: r.total_shipments || 0,
        ...extra
      };

      const creditInfo = calculateCustomerCreditProfile(profile);

      return {
        ...profile,
        ...creditInfo
      };
    });
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
      return await pb.collection('transport_crm_customers').update(customerData.id, payload);
    } else {
      return await pb.collection('transport_crm_customers').create(payload);
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
    await pb.collection('transport_crm_customers').delete(id);
  } catch (err) {
    console.error('Failed to delete CRM customer:', err);
    throw err;
  }
}
