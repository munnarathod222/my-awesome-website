import pb from './pocketbaseClient.js';

export const INITIAL_CRM_CUSTOMERS = [
  {
    id: 'crm_cust_rel_01',
    company_name: 'Reliance Industries Logistics',
    customer_code: 'CUST-REL-01',
    industry: 'Chemicals & Polymers',
    gstin: '27AABCR6158R1Z2',
    pan: 'AABCR6158R',
    primary_contact: 'Vikram Mehta',
    designation: 'VP Supply Chain & Freight',
    phone: '+91 98200 12345',
    email: 'vikram.mehta@ril.com',
    city: 'Mumbai',
    assigned_manager: 'Rajesh Sharma (Key Account Head)',
    customer_since: '2021-04-15',
    credit_limit: 50000000,
    outstanding_amount: 4250000,
    risk_level: 'Excellent', // 'Excellent' | 'Average' | 'High Risk'
    avg_payment_days: 22,
    status: 'Active',
    total_revenue: 148500000,
    total_shipments: 420,
    satisfaction_score: 98,
    on_time_delivery_rate: 98.6,
    profit_margin_pct: 18.5,

    overview: {
      billing_address: 'Maker Chambers IV, Nariman Point, Mumbai, Maharashtra 400021',
      pickup_locations: ['Hazira Petrochemical Complex, Gujarat', 'Nagothane Manufacturing Division, Raigad'],
      delivery_locations: ['Bhiwandi Central Hub', 'Chennai Inland Container Depot', 'Kolkata Dock Yard'],
      credit_period_days: 30,
    },

    rate_history: [
      { date: '2026-07-20', route: 'Hazira → Bhiwandi', truck_type: '32 FT MX', freight: 42000, fuel_surcharge: 3500, extra: 1500, discount: 2000, final_amount: 45000 },
      { date: '2026-07-10', route: 'Nagothane → Chennai', truck_type: '40 FT Trailer', freight: 85000, fuel_surcharge: 6000, extra: 2000, discount: 3000, final_amount: 90000 },
      { date: '2026-06-28', route: 'Hazira → Hyderabad', truck_type: '32 FT SXL', freight: 58000, fuel_surcharge: 4200, extra: 1000, discount: 1500, final_amount: 61700 },
    ],

    preferred_vehicles: [
      { type: '32 FT Multi-Axle Container', pct: 45, count: 189 },
      { type: '40 FT Heavy Flatbed Trailer', pct: 30, count: 126 },
      { type: '20 FT Single Axle Truck', pct: 15, count: 63 },
      { type: 'Reefer Temperature Controlled', pct: 10, count: 42 },
    ],

    shipment_history: [
      { lr_number: 'LR-2026-8841', booking_date: '2026-07-25', route: 'Hazira → Bhiwandi', driver: 'Dayanand Surwase', vehicle: 'TG12U2637', status: 'In Transit', pod_status: 'Pending', invoice_amount: 45000 },
      { lr_number: 'LR-2026-8712', booking_date: '2026-07-20', route: 'Nagothane → Chennai', driver: 'Ramesh Kumar', vehicle: 'MH04JK4821', status: 'Delivered', pod_status: 'Verified', invoice_amount: 90000 },
      { lr_number: 'LR-2026-8590', booking_date: '2026-07-14', route: 'Hazira → Hyderabad', driver: 'Suresh Patel', vehicle: 'GJ06TR9912', status: 'Delivered', pod_status: 'Verified', invoice_amount: 61700 },
    ],

    contacts: [
      { name: 'Vikram Mehta', department: 'Supply Chain', designation: 'VP Supply Chain', phone: '+91 98200 12345', email: 'vikram.mehta@ril.com', whatsapp: '+91 98200 12345', preferred_time: '10:00 AM - 1:00 PM' },
      { name: 'Sanjay Joshi', department: 'Accounts & Billing', designation: 'General Manager Finance', phone: '+91 98200 54321', email: 'sanjay.joshi@ril.com', whatsapp: '+91 98200 54321', preferred_time: '2:00 PM - 5:00 PM' },
      { name: 'Anil Deshmukh', department: 'Dispatch Operations', designation: 'Hazira Dispatch Manager', phone: '+91 98200 99887', email: 'anil.deshmukh@ril.com', whatsapp: '+91 98200 99887', preferred_time: '24x7 Operations' },
    ],

    complaints: [
      { id: 'CMP-2026-041', date: '2026-07-18', category: 'Delivery Delay', priority: 'Medium', description: 'Truck delayed by 3 hours due to toll plaza congestion near Vapi.', assigned_to: 'Operations Desk', status: 'Resolved', sla_remaining: 'Resolved in 2h', rating: 4 },
    ],

    favourite_routes: [
      { from: 'Hazira, Gujarat', to: 'Bhiwandi, Maharashtra', avg_freight: 45000, vehicle: '32 FT MX', monthly_trips: 28 },
      { from: 'Nagothane, Raigad', to: 'Chennai, Tamil Nadu', avg_freight: 90000, vehicle: '40 FT Trailer', monthly_trips: 14 },
      { from: 'Hazira, Gujarat', to: 'Hyderabad, Telangana', avg_freight: 61700, vehicle: '32 FT SXL', monthly_trips: 18 },
    ],

    documents: [
      { name: 'GST Certificate', type: 'Registration', file_name: 'reliance_gst_cert.pdf', upload_date: '2021-04-15', status: 'Valid', expiry: '2030-12-31' },
      { name: 'Annual Freight Rate Contract 2026-27', type: 'Contract', file_name: 'rate_contract_ril_2026.pdf', upload_date: '2026-03-30', status: 'Valid', expiry: '2027-03-31' },
      { name: 'Mutual Non-Disclosure Agreement (NDA)', type: 'Legal', file_name: 'nda_signed_ril.pdf', upload_date: '2021-04-16', status: 'Valid', expiry: '2031-04-15' },
    ],

    timeline: [
      { id: 1, type: 'Booking', title: 'New Trip LR-2026-8841 Dispatched', date: '2026-07-25 09:30 AM', details: 'Vehicle TG12U2637 dispatched from Hazira to Bhiwandi with 18.5 Tons Polymer Resin.' },
      { id: 2, type: 'Payment', title: 'Payment Received ₹ 1,450,000', date: '2026-07-21 03:15 PM', details: 'HDFC Bank RTGS transaction ref #HDFCN262029410.' },
      { id: 3, type: 'Call', title: 'Monthly Rate Renewal Discussion', date: '2026-07-15 11:00 AM', details: 'Meeting with Vikram Mehta regarding monsoon diesel surcharge adjustments.' },
    ],

    ai_insights: [
      '💡 Customer books 8 Multi-Axle trailers every Monday from Hazira.',
      '✅ Payment performance is Excellent (Avg 22 days against 30-day credit period).',
      '📈 Route Hazira → Bhiwandi yield increased by +8.4% this quarter.',
    ]
  },
  {
    id: 'crm_cust_amu_03',
    company_name: 'Amul Dairy Cold Chain',
    customer_code: 'CUST-AMU-03',
    industry: 'FMCG & Cold Chain Storage',
    gstin: '24AAAAA0000A1Z5',
    pan: 'AAAAA0000A',
    primary_contact: 'Dr. K. Patel',
    designation: 'General Manager Logistics',
    phone: '+91 98980 67890',
    email: 'kpatel@amul.coop',
    city: 'Anand',
    assigned_manager: 'Suresh Menon (Cold Chain Manager)',
    customer_since: '2022-08-10',
    credit_limit: 20000000,
    outstanding_amount: 14500000,
    risk_level: 'High Risk',
    avg_payment_days: 48,
    status: 'Hold',
    total_revenue: 68000000,
    total_shipments: 195,
    satisfaction_score: 84,
    on_time_delivery_rate: 96.2,
    profit_margin_pct: 22.0,

    overview: {
      billing_address: 'Amul Dairy Road, Anand, Gujarat 388001',
      pickup_locations: ['Anand Main Dairy Federation', 'Khatraj Processing Plant'],
      delivery_locations: ['Mumbai Cold Storage Hub', 'Pune Distribution Depot', 'Bangalore Dairy Depot'],
      credit_period_days: 30,
    },

    rate_history: [
      { date: '2026-07-15', route: 'Anand → Mumbai', truck_type: 'Reefer 32 FT', freight: 65000, fuel_surcharge: 5000, extra: 2000, discount: 0, final_amount: 72000 },
      { date: '2026-07-02', route: 'Anand → Bangalore', truck_type: 'Reefer 32 FT', freight: 120000, fuel_surcharge: 8000, extra: 3000, discount: 2000, final_amount: 129000 },
    ],

    preferred_vehicles: [
      { type: 'Reefer Temperature Controlled (-20°C)', pct: 85, count: 165 },
      { type: '32 FT Multi-Axle Container', pct: 15, count: 30 },
    ],

    shipment_history: [
      { lr_number: 'LR-2026-8109', booking_date: '2026-07-15', route: 'Anand → Mumbai', driver: 'Mahesh Solanki', vehicle: 'GJ01CZ8842', status: 'Delivered', pod_status: 'Verified', invoice_amount: 72000 },
    ],

    contacts: [
      { name: 'Dr. K. Patel', department: 'Supply Chain', designation: 'GM Logistics', phone: '+91 98980 67890', email: 'kpatel@amul.coop', whatsapp: '+91 98980 67890', preferred_time: '11:00 AM - 1:00 PM' },
    ],

    complaints: [
      { id: 'CMP-2026-089', date: '2026-07-10', category: 'Temperature Deviation', priority: 'High', description: 'Reefer unit temp dropped to -12°C during transit.', assigned_to: 'Cold Chain Specialist', status: 'In Progress', sla_remaining: '1h 45m SLA', rating: 2 },
    ],

    favourite_routes: [
      { from: 'Anand, Gujarat', to: 'Mumbai, Maharashtra', avg_freight: 72000, vehicle: 'Reefer 32 FT', monthly_trips: 22 },
    ],

    documents: [
      { name: 'GST Registration', type: 'Registration', file_name: 'amul_gst.pdf', upload_date: '2022-08-10', status: 'Valid', expiry: '2030-12-31' },
    ],

    timeline: [
      { id: 1, type: 'Payment Alert', title: 'Payment Overdue Alert (18 Days Overdue)', date: '2026-07-28 10:00 AM', details: 'Outstanding balance ₹ 14.5 Lakhs has crossed 30-day credit period. Account placed on temporary booking hold.' },
    ],

    ai_insights: [
      '🚨 CRITICAL: Payment overdue by 18 days beyond credit terms. Hold account status active.',
      '💡 High demand for Reefer units on Anand → Mumbai route (22 trips/month).',
      '⚠️ Offer single 40 FT Reefer trailer to reduce transport cost by 14%.',
    ]
  },
  {
    id: 'crm_cust_tat_02',
    company_name: 'Tata Steel Supply Chain',
    customer_code: 'CUST-TAT-02',
    industry: 'Metals & Mining',
    gstin: '20AAACT2727Q1Z3',
    pan: 'AAACT2727Q',
    primary_contact: 'Subhash Roy',
    designation: 'Head Logistics & Freight Ops',
    phone: '+91 94330 45678',
    email: 'subhash.roy@tatasteel.com',
    city: 'Jamshedpur',
    assigned_manager: 'Anil Varma (Industrial Logistics Manager)',
    customer_since: '2020-01-15',
    credit_limit: 35000000,
    outstanding_amount: 8900000,
    risk_level: 'Average',
    avg_payment_days: 34,
    status: 'Active',
    total_revenue: 112000000,
    total_shipments: 340,
    satisfaction_score: 94,
    on_time_delivery_rate: 97.4,
    profit_margin_pct: 16.8,

    overview: {
      billing_address: 'Tata Steel Plant Works, Jamshedpur, Jharkhand 831001',
      pickup_locations: ['Jamshedpur Steel Plant', 'Kalinganagar Plant Odisha'],
      delivery_locations: ['Hyderabad Metal Hub', 'Pune Auto Cluster Depot'],
      credit_period_days: 30,
    },

    rate_history: [
      { date: '2026-07-22', route: 'Jamshedpur → Hyderabad', truck_type: '40 FT Heavy Flatbed', freight: 105000, fuel_surcharge: 8000, extra: 2500, discount: 3000, final_amount: 112500 },
    ],

    preferred_vehicles: [
      { type: '40 FT Heavy Flatbed Trailer', pct: 70, count: 238 },
      { type: '32 FT Multi-Axle Container', pct: 30, count: 102 },
    ],

    shipment_history: [
      { lr_number: 'LR-2026-9012', booking_date: '2026-07-22', route: 'Jamshedpur → Hyderabad', driver: 'Gurpreet Singh', vehicle: 'JH05AB7781', status: 'In Transit', pod_status: 'Pending', invoice_amount: 112500 },
    ],

    contacts: [
      { name: 'Subhash Roy', department: 'Logistics', designation: 'Head Freight Ops', phone: '+91 94330 45678', email: 'subhash.roy@tatasteel.com', whatsapp: '+91 94330 45678', preferred_time: '9:00 AM - 12:00 PM' },
    ],

    complaints: [],

    favourite_routes: [
      { from: 'Jamshedpur, Jharkhand', to: 'Hyderabad, Telangana', avg_freight: 112500, vehicle: '40 FT Trailer', monthly_trips: 16 },
    ],

    documents: [
      { name: 'GST Certificate', type: 'Registration', file_name: 'tata_steel_gst.pdf', upload_date: '2020-01-15', status: 'Valid', expiry: '2030-12-31' },
    ],

    timeline: [
      { id: 1, type: 'Quotation', title: 'Annual Freight Tariff Revised', date: '2026-07-01 02:00 PM', details: 'Revised flatbed trailer rate contract approved for FY2026-27.' },
    ],

    ai_insights: [
      '💡 Steady booking volume of 16 heavy trailers per month to Hyderabad.',
      '✅ Payment average is 34 days (Slightly above 30-day terms, low credit risk).',
    ]
  }
];

/**
 * Fetch all CRM customers from PocketBase with fallback to INITIAL_CRM_CUSTOMERS
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
        return {
          id: r.id,
          company_name: r.company_name,
          customer_code: r.customer_code || `CUST-${r.id.slice(-4).toUpperCase()}`,
          industry: r.industry || 'Logistics & Trade',
          gstin: r.gstin || '36AABCT1234A1Z1',
          pan: r.pan || 'AABCT1234A',
          primary_contact: r.primary_contact || 'Operations Manager',
          phone: r.phone || '+91 98490 12345',
          email: r.email || 'info@customer.com',
          city: r.city || 'Hyderabad',
          credit_limit: r.credit_limit || 25000000,
          outstanding_amount: r.outstanding_amount || 3200000,
          risk_level: r.risk_level || 'Excellent',
          status: r.status || 'Active',
          total_revenue: r.total_revenue || 45000000,
          total_shipments: r.total_shipments || 120,
          ...extra
        };
      });
    }
  } catch (err) {
    console.error('Failed to fetch CRM customers from PocketBase:', err);
  }

  return INITIAL_CRM_CUSTOMERS;
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
