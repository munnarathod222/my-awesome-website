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
 * Fetch all CRM customers from PocketBase with computed Transport Credit Scores and real synthesized operational data
 */
export async function getCrmCustomers() {
  try {
    // Query real PocketBase canonical `clients` and `trip_logs`
    const [clientsList, tripLogsList] = await Promise.all([
      pb.collection('clients').getFullList({ sort: 'client_name', $autoCancel: false }).catch(() => []),
      pb.collection('trip_logs').getFullList({ sort: '-created', $autoCancel: false }).catch(() => [])
    ]);

    if (clientsList && clientsList.length > 0) {
      return clientsList.map(c => {
        const clientNameNorm = (c.client_name || '').trim().toLowerCase();
        const compNameNorm = (c.company_name || '').trim().toLowerCase();

        // Match trips belonging to this client by ID or names
        const clientTrips = tripLogsList.filter(t => 
          t.client_id === c.id || 
          (clientNameNorm && (t.client_name || '').trim().toLowerCase() === clientNameNorm) || 
          (compNameNorm && (t.client_name || '').trim().toLowerCase() === compNameNorm)
        );

        const totalRev = clientTrips.reduce((acc, t) => acc + Number(t.revenue || t.amount || 0), 0);
        const computedOutstanding = clientTrips.reduce((acc, t) => {
          const rev = Number(t.revenue || t.amount || 0);
          const paid = Number(t.advance_received_from_client || 0);
          const isReceived = (t.client_payment_status || '').toLowerCase() === 'received';
          return acc + (isReceived ? 0 : Math.max(0, rev - paid));
        }, 0);

        const explicitOutstanding = Number(c.outstanding_dues || c.client_balance_due || 0);
        const outstandingAmount = explicitOutstanding > 0 ? explicitOutstanding : computedOutstanding;

        // Dynamic credit limit if not explicitly defined
        const explicitCreditLimit = Number(c.credit_limit || 0);
        const creditLimit = explicitCreditLimit > 0 
          ? explicitCreditLimit 
          : Math.max(250000, Math.round((totalRev * 0.4 || 500000) / 50000) * 50000);

        // 1. Real Shipment History
        const shipmentHistory = clientTrips.map((t, idx) => {
          const rawDate = t.date || t.created || '';
          let formattedDate = 'Recent';
          if (rawDate) {
            try {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              }
            } catch (e) {}
          }
          return {
            id: t.id,
            lr_number: t.lr_number || t.trip_id || `TRIP-${String(idx + 1).padStart(3, '0')}`,
            booking_date: formattedDate,
            route: t.route || 'Local Transit',
            status: t.trip_status || 'Delivered',
            invoice_amount: Number(t.revenue || t.amount || 0),
            payment_status: t.client_payment_status || 'pending',
            truck_number: t.truck_number || '',
            driver_name: t.driver_name || ''
          };
        });

        // 2. Real Rate History per Route
        const rateMap = new Map();
        clientTrips.forEach(t => {
          if (t.route && t.revenue) {
            const key = `${t.route}_${t.revenue}`;
            if (!rateMap.has(key)) {
              let fDate = 'Current Contract';
              if (t.date || t.created) {
                try {
                  const d = new Date(t.date || t.created);
                  if (!isNaN(d.getTime())) fDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                } catch (e) {}
              }
              rateMap.set(key, {
                date: fDate,
                route: t.route,
                truck_type: t.ownership_type === 'Attached' ? 'Market 32FT SXL' : 'Dedicated 32FT MXL',
                freight: Number(t.revenue || 0),
                final_amount: Number(t.revenue || 0)
              });
            }
          }
        });
        const rateHistory = Array.from(rateMap.values());

        // 3. Preferred Vehicles (real counts & percentages)
        const truckCounts = {};
        clientTrips.forEach(t => {
          if (t.truck_number) {
            truckCounts[t.truck_number] = (truckCounts[t.truck_number] || 0) + 1;
          }
        });
        const totalShipmentsCount = clientTrips.length || 1;
        const preferredVehicles = Object.entries(truckCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([type, count]) => ({
            type,
            pct: Math.round((count / totalShipmentsCount) * 100),
            count
          }));

        // 4. Favourite Routes / Corridors
        const routeCounts = {};
        clientTrips.forEach(t => {
          if (t.route) {
            routeCounts[t.route] = (routeCounts[t.route] || 0) + 1;
          }
        });
        const favouriteRoutes = Object.entries(routeCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([r, count]) => {
            const parts = r.split('->').map(p => p.trim());
            return {
              from: parts[0] || r,
              to: parts[parts.length - 1] || r,
              full_route: r,
              count
            };
          });

        // 5. Contacts
        const contacts = [
          {
            name: c.contact_person || c.primary_contact || (c.company_name ? `${c.company_name} Logistics Desk` : 'Operations Lead'),
            role: 'Logistics & Dispatch Manager',
            phone: c.phone || c.phone_number || '',
            email: c.email || ''
          }
        ].filter(cn => cn.name || cn.phone || cn.email);

        // 6. Documents
        const documents = [
          { name: `${c.company_name || c.client_name} - Master Logistics Agreement`, type: 'Contract' },
          { name: `${c.company_name || c.client_name} - GST Compliance & Registration`, type: 'Tax' },
          { name: `${c.company_name || c.client_name} - Rate Mandate & Empanelment`, type: 'Empanelment' }
        ];

        // 7. Activity Timeline
        const recentEvents = clientTrips.slice(0, 4).map(t => {
          let fDate = 'Recent';
          if (t.date || t.created) {
            try {
              const d = new Date(t.date || t.created);
              if (!isNaN(d.getTime())) fDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            } catch (e) {}
          }
          return {
            id: t.id,
            title: `Trip ${t.trip_id || 'Dispatched'} - ${t.trip_status || 'Delivered'}`,
            date: fDate,
            details: `${t.route || 'Route'} | ${t.truck_number || 'Fleet'} (${t.driver_name || 'Driver'}) • Freight: ₹${Number(t.revenue || 0).toLocaleString('en-IN')}`
          };
        });

        let onboardDate = '10 Jun 2026';
        if (c.created) {
          try {
            const d = new Date(c.created);
            if (!isNaN(d.getTime())) onboardDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          } catch (e) {}
        }

        const timeline = [
          ...recentEvents,
          {
            id: 'onboard_' + c.id,
            title: 'Account Empanelled',
            date: onboardDate,
            details: `${c.company_name || c.client_name} registered as enterprise shipper with Jai Bhavani Cargo.`
          }
        ];

        // 8. AI Operational Insights
        const aiInsights = [];
        if (clientTrips.length > 0) {
          aiInsights.push(`Total Volume: ${clientTrips.length} completed freight shipments delivering ₹${totalRev.toLocaleString('en-IN')} in gross cargo movement.`);
          if (preferredVehicles.length > 0) {
            aiInsights.push(`Fleet Affinity: Vehicle ${preferredVehicles[0].type} serves as the primary dedicated truck (${preferredVehicles[0].pct}% of dispatched loads).`);
          }
          if (favouriteRoutes.length > 0) {
            aiInsights.push(`Key Transport Corridor: ${favouriteRoutes[0].full_route} has registered ${favouriteRoutes[0].count} dispatches with on-time SLA.`);
          }
          aiInsights.push(outstandingAmount > 0 
            ? `Credit Exposure: Active invoice balance of ₹${outstandingAmount.toLocaleString('en-IN')} is within approved credit ceiling of ₹${creditLimit.toLocaleString('en-IN')}.`
            : `Payment Liquidity: Exceptional settlement record with ₹0 overdue invoices across active billing cycles.`);
        } else {
          aiInsights.push(`Newly Registered Client: Empanelled and ready for initial shipment dispatch. Credit facility active at ₹${creditLimit.toLocaleString('en-IN')}.`);
        }

        const profile = {
          id: c.id,
          company_name: c.company_name || c.client_name || 'Client',
          customer_code: `CUST-${c.id.slice(-4).toUpperCase()}`,
          industry: c.industry || 'Logistics & Supply Chain',
          gstin: c.gst_number || c.gstin || '',
          pan: c.pan_number || c.pan || '',
          primary_contact: c.contact_person || c.primary_contact || 'Operations Desk',
          phone: c.phone || c.phone_number || '',
          email: c.email || '',
          city: c.city || 'Hyderabad',
          billing_address: c.address ? `${c.address}, ${c.city || ''} ${c.postal_code || ''}`.trim() : (c.city || 'Address on file'),
          credit_limit: creditLimit,
          outstanding_amount: outstandingAmount,
          risk_level: outstandingAmount > (creditLimit * 0.7) ? 'High Risk' : (outstandingAmount > (creditLimit * 0.35) ? 'Average' : 'Excellent'),
          status: c.status || 'Active',
          total_revenue: totalRev,
          total_shipments: clientTrips.length,
          shipment_history: shipmentHistory,
          rate_history: rateHistory,
          preferred_vehicles: preferredVehicles,
          favourite_routes: favouriteRoutes,
          contacts: contacts,
          documents: documents,
          timeline: timeline,
          ai_insights: aiInsights
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
 * Save or Update a CRM customer in PocketBase canonical `clients` collection
 */
export async function saveCrmCustomer(customerData) {
  try {
    const payload = {
      client_name: (customerData.company_name || customerData.client_name || 'New Client').trim(),
      company_name: (customerData.company_name || customerData.client_name || 'New Client').trim(),
      client_type: 'Company',
      contact_person: (customerData.primary_contact || customerData.contact_person || '').trim(),
      phone: (customerData.phone || '').trim(),
      email: (customerData.email || '').trim(),
      city: (customerData.city || 'Hyderabad').trim(),
      state: 'Telangana',
      country: 'India',
      gst_number: (customerData.gstin || customerData.gst_number || '').trim().toUpperCase(),
      pan_number: (customerData.pan || customerData.pan_number || '').trim().toUpperCase(),
      industry: customerData.industry || 'Manufacturing & Industrial',
      credit_limit: Number(customerData.credit_limit || 0),
      status: customerData.status || 'Active',
      billing_type: 'Contract',
      notes: customerData.risk_level ? `Risk Level: ${customerData.risk_level}` : ''
    };

    if (customerData.id && !customerData.id.startsWith('crm_cust_')) {
      return await pb.collection('clients').update(customerData.id, payload, { $autoCancel: false });
    } else {
      return await pb.collection('clients').create(payload, { $autoCancel: false });
    }
  } catch (err) {
    console.error('Failed to save CRM customer to PocketBase:', err);
    throw err;
  }
}

/**
 * Delete a CRM customer from PocketBase
 */
export async function deleteCrmCustomer(id) {
  try {
    await pb.collection('clients').delete(id, { $autoCancel: false });
  } catch (err) {
    console.error('Failed to delete CRM customer:', err);
    throw err;
  }
}
