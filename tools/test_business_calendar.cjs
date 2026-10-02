const https = require('https');

async function fetchPb(collection, query = '') {
  return new Promise((resolve) => {
    https.get(`https://www.jaibhavanicargo.com/hcgi/platform/api/collections/${collection}/records${query ? '?' + query : ''}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data).items || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function generateBusinessCalendarEvents(year, month) {
  // Fetch real records
  const [
    trucks,
    truckDocs,
    jobCards,
    employees,
    clients,
    loanProfiles,
    emiExpenses,
    tripLogs,
    dueDates
  ] = await Promise.all([
    fetchPb('trucks', 'perPage=50'),
    fetchPb('truck_documents', 'perPage=100'),
    fetchPb('workshop_job_cards', 'perPage=50'),
    fetchPb('employees', 'perPage=50'),
    fetchPb('clients', 'perPage=50'),
    fetchPb('loan_profiles', 'perPage=50'),
    fetchPb('expenses', 'filter=category="EMI"||subcategory="EMI"&perPage=100'),
    fetchPb('trip_logs', 'perPage=100&sort=-date'),
    fetchPb('payment_due_dates', 'perPage=100')
  ]);

  const events = [];

  // Helper date format
  const toYMD = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d).substring(0, 10);
    return dt.toISOString().split('T')[0];
  };

  // 1. TRUCK SERVICE
  (jobCards || []).forEach(jc => {
    if (jc.entry_date) {
      events.push({
        id: `srv_${jc.id}`,
        category: 'truck_service',
        categoryLabel: 'Truck Service',
        title: `🔧 Service: ${jc.truck_number || 'TG12U2637'} - ${jc.service_type || 'Workshop Maintenance'}`,
        date: toYMD(jc.entry_date),
        amount: jc.total_cost || 0,
        truckNumber: jc.truck_number || 'TG12U2637',
        status: jc.status === 'Closed' ? 'Completed' : 'Scheduled',
        description: `Job Card #${jc.job_card_number}: ${jc.complaints_list || jc.service_type}. Labour: ₹${jc.labour_cost}, Parts: ₹${jc.parts_cost}. Odo: ${jc.odometer_reading} km`,
        priority: 'high'
      });
    }
  });

  // Add projected next service milestone (67,000 km ~ Nov 12, 2026)
  events.push({
    id: 'srv_projected_tg12u2637_next',
    category: 'truck_service',
    categoryLabel: 'Truck Service',
    title: '🔧 67,000 km Scheduled Preventive Service (TG12U2637)',
    date: '2026-11-12',
    amount: 18500,
    truckNumber: 'TG12U2637',
    status: 'Upcoming',
    description: '10,000 km routine preventive maintenance: Engine oil change, fuel/oil filters, brake inspection, greasing.',
    priority: 'high'
  });

  // 2. INSURANCE RENEWAL
  (truckDocs || []).forEach(doc => {
    const type = (doc.document_type || doc.type || '').toLowerCase();
    if (type.includes('insurance') && doc.expiry_date) {
      const expDate = toYMD(doc.expiry_date);
      events.push({
        id: `ins_${doc.id}`,
        category: 'insurance_renewal',
        categoryLabel: 'Insurance Renewal',
        title: `🛡️ Comprehensive Policy Expiry: TG12U2637`,
        date: expDate,
        truckNumber: 'TG12U2637',
        status: new Date(expDate) < new Date() ? 'Overdue' : 'Upcoming',
        description: `Commercial Vehicle Comprehensive Policy Renewal due. Ensure cashless garage network & zero depreciation add-on.`,
        priority: 'urgent'
      });
    }
  });

  // 3. PERMIT EXPIRY
  (truckDocs || []).forEach(doc => {
    const type = (doc.document_type || doc.type || '').toLowerCase();
    const expiry = doc.expiry_date || doc.valid_till;
    if (!expiry || doc.truck_id === 'COMPANY_VAULT' || doc.truck_id === 'FLEET_RC_BUNDLE') return;

    if (type.includes('pollution') || type.includes('puc')) {
      events.push({
        id: `puc_${doc.id}`,
        category: 'permit_expiry',
        categoryLabel: 'Permit Expiry',
        title: `📜 PUC Pollution Certificate Expiry: TG12U2637`,
        date: toYMD(expiry),
        truckNumber: 'TG12U2637',
        status: 'Upcoming',
        description: `Emission test renewal required under Central Motor Vehicle Rules (CMVR).`,
        priority: 'normal'
      });
    } else if (type.includes('fitness')) {
      events.push({
        id: `fit_${doc.id}`,
        category: 'permit_expiry',
        categoryLabel: 'Permit Expiry',
        title: `📜 Annual Vehicle Fitness Certificate Expiry: TG12U2637`,
        date: toYMD(expiry),
        truckNumber: 'TG12U2637',
        status: 'Upcoming',
        description: `RTO commercial vehicle fitness inspection renewal.`,
        priority: 'high'
      });
    } else if (type.includes('permit')) {
      events.push({
        id: `pmt_${doc.id}`,
        category: 'permit_expiry',
        categoryLabel: 'Permit Expiry',
        title: `📜 National Goods Carrier Permit Expiry: TG12U2637`,
        date: toYMD(expiry),
        truckNumber: 'TG12U2637',
        status: 'Upcoming',
        description: `All India Tourist / Goods carriage national permit renewal.`,
        priority: 'high'
      });
    } else if (type.includes('rc')) {
      events.push({
        id: `rc_${doc.id}`,
        category: 'permit_expiry',
        categoryLabel: 'Permit Expiry',
        title: `📜 Registration Certificate (RC) Expiry: TG12U2637`,
        date: toYMD(expiry),
        truckNumber: 'TG12U2637',
        status: 'Upcoming',
        description: `Vehicle Registration Certificate (RC) renewal.`,
        priority: 'normal'
      });
    }
  });

  // 4. DRIVER JOINING
  (employees || []).forEach(emp => {
    const isDriver = (emp.employee_type || '').toLowerCase() === 'driver' || (emp.position || '').toLowerCase().includes('driver');
    const jDate = emp.joining_date || emp.hire_date;
    if (isDriver && jDate) {
      const formattedDate = toYMD(jDate);
      events.push({
        id: `drv_join_${emp.id}`,
        category: 'driver_joining',
        categoryLabel: 'Driver Joining',
        title: `👤 Driver Onboarding: ${emp.name}`,
        date: formattedDate,
        driverName: emp.name,
        status: 'Completed',
        description: `Official joining date for commercial pilot ${emp.name} (Assigned to fleet operations).`,
        priority: 'normal'
      });

      // Also compute annual anniversary
      const joinYear = new Date(formattedDate).getFullYear();
      [2026, 2027].forEach(y => {
        if (y > joinYear) {
          const annivDate = `${y}-${formattedDate.substring(5, 10)}`;
          events.push({
            id: `drv_anniv_${emp.id}_${y}`,
            category: 'driver_joining',
            categoryLabel: 'Driver Joining',
            title: `👤 ${y - joinYear} Year Work Anniversary: ${emp.name}`,
            date: annivDate,
            driverName: emp.name,
            status: 'Upcoming',
            description: `Celebration & tenure bonus evaluation for ${emp.name}.`,
            priority: 'normal'
          });
        }
      });
    }
  });

  // 5. CONTRACT RENEWAL
  (clients || []).forEach(cl => {
    const cDate = cl.contract_expiry || (cl.created ? toYMD(cl.created) : '');
    if (cDate) {
      // Annual contract cycle
      const createdYear = new Date(cl.created).getFullYear();
      [2026, 2027].forEach(y => {
        const renewalDate = cl.contract_expiry ? toYMD(cl.contract_expiry) : `${y}-${toYMD(cl.created).substring(5, 10)}`;
        events.push({
          id: `ctr_${cl.id}_${y}`,
          category: 'contract_renewal',
          categoryLabel: 'Contract Renewal',
          title: `📑 Logistics Contract Renewal: ${cl.company_name || cl.client_name}`,
          date: renewalDate,
          partyName: cl.company_name || cl.client_name,
          status: new Date(renewalDate) < new Date() ? 'Completed' : 'Upcoming',
          description: `Annual master transport contract agreement & freight rate revision renewal for ${cl.company_name || cl.client_name}. Payment terms: ${cl.payment_terms || 30} days.`,
          priority: 'high'
        });
      });
    }
  });

  // 6. INVOICE DUE
  // Match trip logs that have client billing
  const unpaidTrips = (tripLogs || []).filter(t => t.client_payment_status !== 'received' && Number(t.revenue || 0) > 0);
  unpaidTrips.slice(0, 15).forEach(t => {
    // Due date is delivery date + 30 days or client payment terms
    const baseDate = t.date ? new Date(t.date) : new Date();
    const dueDate = new Date(baseDate.getTime() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    events.push({
      id: `inv_due_${t.id}`,
      category: 'invoice_due',
      categoryLabel: 'Invoice Due',
      title: `🧾 Invoice Due: ${t.route || 'Freight Invoice'} - ₹${Number(t.revenue || 0).toLocaleString('en-IN')}`,
      date: dueDate,
      amount: Number(t.revenue || 0),
      partyName: 'Amazon Transportation Services',
      truckNumber: t.truck_number || 'TG12U2637',
      status: 'Upcoming',
      description: `Freight invoice payment due for Trip #${t.trip_id || t.id.slice(0, 8)} (${t.route}).`,
      priority: 'high'
    });
  });

  // Also include payment_due_dates
  (dueDates || []).forEach(dd => {
    if (dd.due_date) {
      events.push({
        id: `pdd_${dd.id}`,
        category: 'invoice_due',
        categoryLabel: 'Invoice Due',
        title: `🧾 Payment Due: ${dd.title || 'Corporate Statement'}`,
        date: toYMD(dd.due_date),
        amount: dd.full_payment_amount || dd.amount || 0,
        status: dd.status || 'Unpaid',
        description: dd.notes || 'Statement invoice payment due.',
        priority: 'high'
      });
    }
  });

  // 7. EMI
  // 5th of every month for TG12U2637 (IFFCO Kisan Finance ₹33,410)
  const paidEmiDates = new Set((emiExpenses || []).map(e => toYMD(e.date)));
  for (let y = 2026; y <= 2027; y++) {
    for (let m = 1; m <= 12; m++) {
      const emiDate = `${y}-${String(m).padStart(2, '0')}-05`;
      const isPaid = paidEmiDates.has(emiDate) || new Date(emiDate) < new Date('2026-10-01');
      events.push({
        id: `emi_iffco_${emiDate}`,
        category: 'emi',
        categoryLabel: 'EMI',
        title: `🏦 Vehicle Loan EMI: TG12U2637 - ₹33,410`,
        date: emiDate,
        amount: 33410,
        truckNumber: 'TG12U2637',
        partyName: 'IFFCO Kisan Finance',
        status: isPaid ? 'Paid' : 'Upcoming',
        description: `Monthly vehicle auto loan installment of ₹33,410 debited via ECS / NACH mandate on 5th of every month. Financier: IFFCO KISAAN.`,
        priority: 'urgent'
      });
    }
  }

  // 8. TAX
  // Statutory tax calendar
  for (let y = 2026; y <= 2027; y++) {
    for (let m = 1; m <= 12; m++) {
      const monthStr = String(m).padStart(2, '0');
      // TDS payment: 7th of every month
      events.push({
        id: `tax_tds_${y}_${monthStr}`,
        category: 'tax',
        categoryLabel: 'Tax',
        title: `🏛️ Monthly TDS Payment (Sec 194C Transport)`,
        date: `${y}-${monthStr}-07`,
        amount: 0,
        status: new Date(`${y}-${monthStr}-07`) < new Date() ? 'Completed' : 'Upcoming',
        description: `Deposit of TDS deducted on transport contracts & contractor payments for preceding month (Challan ITNS 281).`,
        priority: 'high'
      });

      // GSTR-1: 11th of every month
      events.push({
        id: `tax_gstr1_${y}_${monthStr}`,
        category: 'tax',
        categoryLabel: 'Tax',
        title: `🏛️ Monthly GST GSTR-1 Filing`,
        date: `${y}-${monthStr}-11`,
        status: new Date(`${y}-${monthStr}-11`) < new Date() ? 'Completed' : 'Upcoming',
        description: `Filing of outward supplies of transport services and e-way bill reconciliation.`,
        priority: 'normal'
      });

      // GSTR-3B: 20th of every month
      events.push({
        id: `tax_gstr3b_${y}_${monthStr}`,
        category: 'tax',
        categoryLabel: 'Tax',
        title: `🏛️ Monthly GST GSTR-3B Summary Return`,
        date: `${y}-${monthStr}-20`,
        status: new Date(`${y}-${monthStr}-20`) < new Date() ? 'Completed' : 'Upcoming',
        description: `Monthly summary return of inward/outward supplies, ITC claim, and GST liability discharge.`,
        priority: 'urgent'
      });
    }

    // Quarterly Advance Tax (15th of Jun, Sep, Dec, Mar)
    const advMonths = ['06', '09', '12', '03'];
    const advLabels = ['Q1 (15%)', 'Q2 (45%)', 'Q3 (75%)', 'Q4 (100%)'];
    advMonths.forEach((am, idx) => {
      const advYear = am === '03' ? y + 1 : y;
      events.push({
        id: `tax_adv_${advYear}_${am}`,
        category: 'tax',
        categoryLabel: 'Tax',
        title: `🏛️ Advance Tax Installment ${advLabels[idx]}`,
        date: `${advYear}-${am}-15`,
        status: new Date(`${advYear}-${am}-15`) < new Date() ? 'Completed' : 'Upcoming',
        description: `Statutory quarterly income tax advance payment for FY ${y}-${y+1}.`,
        priority: 'high'
      });
    });

    // Quarterly Road Tax for fleet (TG12U2637 ~₹5,150)
    ['03-31', '06-30', '09-30', '12-31'].forEach((rtDate, idx) => {
      events.push({
        id: `tax_road_${y}_${idx}`,
        category: 'tax',
        categoryLabel: 'Tax',
        title: `🏛️ Quarterly Commercial MV Road Tax: TG12U2637 - ₹5,150`,
        date: `${y}-${rtDate}`,
        amount: 5150,
        truckNumber: 'TG12U2637',
        status: new Date(`${y}-${rtDate}`) < new Date() ? 'Paid' : 'Upcoming',
        description: `Telangana Motor Vehicle quarterly road tax payment token renewal for heavy commercial goods vehicle TG12U2637.`,
        priority: 'urgent'
      });
    });
  }

  // 9. EXPECTED CUSTOMER PAYMENT
  // Calculate expected remittances from recent delivered trips
  const deliveredTrips = (tripLogs || []).filter(t => t.trip_status === 'Delivered' && Number(t.revenue || 0) > 0);
  deliveredTrips.slice(0, 20).forEach(t => {
    const tripDate = t.date ? new Date(t.date) : new Date();
    // Payment due at 32 days
    const payDate = new Date(tripDate.getTime() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    events.push({
      id: `exp_pay_${t.id}`,
      category: 'expected_payment',
      categoryLabel: 'Expected Payment',
      title: `💰 Expected Payment: Amazon - ₹${Number(t.revenue || 0).toLocaleString('en-IN')}`,
      date: payDate,
      amount: Number(t.revenue || 0),
      partyName: 'AMAZON TRANSPORTATION SERVICES',
      truckNumber: t.truck_number || 'TG12U2637',
      status: t.client_payment_status === 'received' ? 'Received' : 'Expected',
      description: `Expected B2B contract freight remittance for route ${t.route} (${t.kms} km). 32 days net credit cycle.`,
      priority: 'high'
    });
  });

  // Sort events chronologically
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return events;
}

(async () => {
  const events = await generateBusinessCalendarEvents(2026, 10);
  console.log(`Generated ${events.length} total business events!`);

  // Count by category
  const counts = {};
  events.forEach(e => {
    counts[e.category] = (counts[e.category] || 0) + 1;
  });
  console.log('Category distribution:', counts);

  // Show sample events from each category
  const categories = Object.keys(counts);
  categories.forEach(cat => {
    const sample = events.find(e => e.category === cat);
    console.log(`\nSample [${cat}]:`, {
      title: sample.title,
      date: sample.date,
      amount: sample.amount,
      status: sample.status
    });
  });
})();
