import pb from './pocketbaseClient.js';

/**
 * Fetch all CRM customers from PocketBase (no fallback dummy data)
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
      return {
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
