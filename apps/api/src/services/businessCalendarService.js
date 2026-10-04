import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../../../data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

const CUSTOM_EVENTS_FILE = path.join(DATA_DIR, 'custom_business_calendar_events.json');

function readCustomEvents() {
  try {
    if (fs.existsSync(CUSTOM_EVENTS_FILE)) {
      const raw = fs.readFileSync(CUSTOM_EVENTS_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[BusinessCalendarService] Read custom events error:', err.message);
  }
  return [];
}

function saveCustomEvents(events) {
  try {
    fs.writeFileSync(CUSTOM_EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
  } catch (err) {
    console.error('[BusinessCalendarService] Save custom events error:', err.message);
  }
}

const toYMD = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d).substring(0, 10);
  return dt.toISOString().split('T')[0];
};

/**
 * Aggregates all 9 streams:
 * 1. Truck service
 * 2. Insurance renewal
 * 3. Permit expiry
 * 4. Driver joining
 * 5. Contract renewal
 * 6. Invoice due
 * 7. EMI
 * 8. Tax
 * 9. Expected customer payment
 */
export async function getBusinessCalendarEvents(pbInstance, options = {}) {
  const events = [];

  // Resilient fetcher
  const safeFetch = async (collection, filter = '', sort = '-created', limit = 100) => {
    const urls = [
      `http://127.0.0.1:8090/api/collections/${collection}/records?perPage=${limit}${filter ? '&filter=' + encodeURIComponent(filter) : ''}${sort ? '&sort=' + encodeURIComponent(sort) : ''}`,
      `https://www.jaibhavanicargo.com/hcgi/platform/api/collections/${collection}/records?perPage=${limit}${filter ? '&filter=' + encodeURIComponent(filter) : ''}${sort ? '&sort=' + encodeURIComponent(sort) : ''}`
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.items)) {
            return data.items;
          }
        }
      } catch (err) {
        // try next url
      }
    }
    return [];
  };


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
    safeFetch('trucks'),
    safeFetch('truck_documents'),
    safeFetch('workshop_job_cards'),
    safeFetch('employees'),
    safeFetch('clients'),
    safeFetch('loan_profiles'),
    safeFetch('expenses', 'category="EMI" || subcategory="EMI"'),
    safeFetch('trip_logs', '', '-date', 500),
    safeFetch('payment_due_dates')
  ]);

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
        description: `Job Card #${jc.job_card_number}: ${jc.complaints_list || jc.service_type}. Labour: ₹${(jc.labour_cost || 0).toLocaleString('en-IN')}, Parts: ₹${(jc.parts_cost || 0).toLocaleString('en-IN')}. Odo: ${jc.odometer_reading || 0} km.`,
        priority: 'high',
        icon: 'wrench',
        color: 'blue'
      });
    }
  });

  // Scheduled preventive service milestone
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
    priority: 'high',
    icon: 'wrench',
    color: 'blue'
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
        title: `🛡️ Comprehensive Insurance Renewal: TG12U2637`,
        date: expDate,
        truckNumber: 'TG12U2637',
        status: new Date(expDate) < new Date() ? 'Overdue' : 'Upcoming',
        description: 'Commercial Vehicle Comprehensive Policy Renewal due. Ensure cashless garage network & zero depreciation coverage.',
        priority: 'urgent',
        icon: 'shield',
        color: 'emerald'
      });
    }
  });

  // Baseline fallback for insurance if empty
  if (!events.some(e => e.category === 'insurance_renewal')) {
    events.push({
      id: 'ins_tg12u2637_baseline',
      category: 'insurance_renewal',
      categoryLabel: 'Insurance Renewal',
      title: '🛡️ Comprehensive Insurance Renewal: TG12U2637',
      date: '2026-12-09',
      truckNumber: 'TG12U2637',
      status: 'Upcoming',
      description: 'Commercial Vehicle Comprehensive Policy Renewal due (IFFCO Tokio / National Insurance).',
      priority: 'urgent',
      icon: 'shield',
      color: 'emerald'
    });
  }

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
        title: '📜 PUC Pollution Certificate Expiry: TG12U2637',
        date: toYMD(expiry),
        truckNumber: 'TG12U2637',
        status: 'Upcoming',
        description: 'Mandatory emission test renewal required under Central Motor Vehicle Rules (CMVR).',
        priority: 'normal',
        icon: 'scroll',
        color: 'amber'
      });
    } else if (type.includes('fitness')) {
      events.push({
        id: `fit_${doc.id}`,
        category: 'permit_expiry',
        categoryLabel: 'Permit Expiry',
        title: '📜 Vehicle Fitness Certificate Expiry: TG12U2637',
        date: toYMD(expiry),
        truckNumber: 'TG12U2637',
        status: 'Upcoming',
        description: 'RTO commercial vehicle fitness inspection renewal.',
        priority: 'high',
        icon: 'scroll',
        color: 'amber'
      });
    } else if (type.includes('permit')) {
      events.push({
        id: `pmt_${doc.id}`,
        category: 'permit_expiry',
        categoryLabel: 'Permit Expiry',
        title: '📜 National Goods Carrier Permit Expiry: TG12U2637',
        date: toYMD(expiry),
        truckNumber: 'TG12U2637',
        status: 'Upcoming',
        description: 'All India Tourist / Goods carriage national authorization permit renewal.',
        priority: 'high',
        icon: 'scroll',
        color: 'amber'
      });
    } else if (type.includes('rc')) {
      events.push({
        id: `rc_${doc.id}`,
        category: 'permit_expiry',
        categoryLabel: 'Permit Expiry',
        title: '📜 Registration Certificate (RC) Expiry: TG12U2637',
        date: toYMD(expiry),
        truckNumber: 'TG12U2637',
        status: 'Upcoming',
        description: 'Heavy Commercial Goods Vehicle Registration Certificate renewal.',
        priority: 'normal',
        icon: 'scroll',
        color: 'amber'
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
        description: `Official joining date for commercial driver ${emp.name} (Assigned to fleet operations).`,
        priority: 'normal',
        icon: 'user-plus',
        color: 'purple'
      });

      // Annual anniversary milestones
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
            description: `Work anniversary recognition & tenure performance review for pilot ${emp.name}.`,
            priority: 'normal',
            icon: 'user-plus',
            color: 'purple'
          });
        }
      });
    }
  });

  // 5. CONTRACT RENEWAL
  (clients || []).forEach(cl => {
    const cDate = cl.contract_expiry || (cl.created ? toYMD(cl.created) : '');
    if (cDate) {
      const createdYear = new Date(cl.created || '2026-06-10').getFullYear();
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
          description: `Annual transport rate agreement renewal for ${cl.company_name || cl.client_name}. Net credit period: ${cl.payment_terms || 30} days.`,
          priority: 'high',
          icon: 'briefcase',
          color: 'cyan'
        });
      });
    }
  });

  // 6. INVOICE DUE & 9. EXPECTED CUSTOMER PAYMENT (Consolidated B2B Settlement Cycles)
  const clientMap = new Map((clients || []).map(c => [c.id, c]));
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const todayStr = toYMD(new Date());

  // Only include delivered trips whose payment is NOT yet received/paid
  const pendingDeliveredTrips = (tripLogs || []).filter(t => {
    const isDelivered = t.trip_status === 'Delivered' || t.trip_status === 'Completed';
    const payStatus = (t.client_payment_status || t.payment_status || '').toLowerCase().trim();
    const isPaid = payStatus === 'received' || payStatus === 'paid';
    const rev = Number(t.revenue || t.amount || 0);
    return isDelivered && !isPaid && rev > 0;
  });

  const byClient = {};
  pendingDeliveredTrips.forEach(t => {
    const cid = t.client_id || 'default_amazon';
    if (!byClient[cid]) byClient[cid] = [];
    byClient[cid].push(t);
  });

  for (const [cid, trips] of Object.entries(byClient)) {
    const client = clientMap.get(cid) || (clients || []).find(c => (c.client_name || c.company_name || '').toLowerCase().includes('amazon')) || {
      company_name: 'AMAZON TRANSPORTATION SERVICES',
      client_name: 'Amazon',
      billing_type: 'Contract',
      payment_terms: '32',
      isTdsApplicable: 1,
      tdsRate: 1
    };

    const clientName = client.client_name || client.company_name || 'Amazon';
    const isContract = (client.billing_type || 'Contract').toLowerCase() === 'contract';
    const terms = parseInt(client.payment_terms || '30', 10) || 30;
    const tdsPct = client.isTdsApplicable ? (client.tdsRate || 1) : 0;

    if (isContract) {
      const cycleGroups = {};
      trips.forEach(t => {
        const d = new Date(t.date || t.created);
        if (isNaN(d.getTime())) return;
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const day = d.getDate();
        const half = day <= 15 ? 1 : 2;
        const key = `${y}_${String(m).padStart(2, '0')}_H${half}`;
        if (!cycleGroups[key]) {
          cycleGroups[key] = { year: y, month: m, half, trips: [], totalGross: 0 };
        }
        cycleGroups[key].trips.push(t);
        cycleGroups[key].totalGross += Number(t.revenue || 0);
      });

      for (const [cycleKey, grp] of Object.entries(cycleGroups)) {
        const cycleEndDate = grp.half === 1
          ? new Date(grp.year, grp.month - 1, 15)
          : new Date(grp.year, grp.month, 0);

        const dueDate = new Date(cycleEndDate.getTime() + terms * 24 * 60 * 60 * 1000);
        const dueYMD = toYMD(dueDate);
        const mName = monthNames[grp.month - 1];
        const cycleLabel = grp.half === 1 ? `${mName} 01–15` : `${mName} 16–${cycleEndDate.getDate()}`;
        const netAmount = Math.round(grp.totalGross * (1 - tdsPct / 100));
        const isOverdue = dueYMD < todayStr;

        // Stream 6: Tax Invoice Due for this completed cycle
        events.push({
          id: `inv_due_${cid}_${cycleKey}`,
          category: 'invoice_due',
          categoryLabel: 'Invoice Due',
          icon: '🧾',
          title: `🧾 Invoice Due: ${clientName} (${cycleLabel}) - ₹${grp.totalGross.toLocaleString('en-IN')}`,
          date: dueYMD,
          amount: grp.totalGross,
          partyName: client.company_name || clientName,
          truckNumber: 'TG12U2637',
          status: isOverdue ? 'Overdue' : 'Upcoming',
          description: `B2B freight invoice due for ${grp.trips.length} delivered trips during ${cycleLabel}.`,
          priority: isOverdue ? 'urgent' : 'high',
          color: 'rose'
        });

        // Stream 9: Consolidated Expected Payment for this cycle
        events.push({
          id: `exp_pay_${cid}_${cycleKey}`,
          category: 'expected_payment',
          categoryLabel: 'Expected Payment',
          icon: '💰',
          title: `💰 Expected Payment: ${clientName} - ₹${netAmount.toLocaleString('en-IN')}`,
          date: dueYMD,
          amount: netAmount,
          partyName: client.company_name || clientName,
          truckNumber: 'TG12U2637',
          status: isOverdue ? 'Overdue' : 'Expected',
          description: `Consolidated B2B contract freight settlement for ${grp.trips.length} delivered trips (${cycleLabel}). Gross: ₹${grp.totalGross.toLocaleString('en-IN')}, Net: ₹${netAmount.toLocaleString('en-IN')} (after ${tdsPct}% TDS). Credit terms: ${terms} days.`,
          priority: isOverdue ? 'urgent' : 'high',
          color: 'lime'
        });
      }
    } else {
      // Spot clients: individual trip payments
      trips.forEach(t => {
        const baseDate = t.date ? new Date(t.date) : new Date();
        const spotDue = new Date(baseDate.getTime() + (terms || 7) * 24 * 60 * 60 * 1000);
        const dueYMD = toYMD(spotDue);
        const rev = Number(t.revenue || 0);
        const isOverdue = dueYMD < todayStr;

        events.push({
          id: `exp_pay_spot_${t.id}`,
          category: 'expected_payment',
          categoryLabel: 'Expected Payment',
          icon: '💰',
          title: `💰 Expected Payment: ${clientName} - ₹${rev.toLocaleString('en-IN')}`,
          date: dueYMD,
          amount: rev,
          partyName: client.company_name || clientName,
          truckNumber: t.truck_number || 'TG12U2637',
          status: isOverdue ? 'Overdue' : 'Expected',
          description: `Spot shipment payment for route ${t.route || 'Transit'} (Trip #${t.trip_id || t.id.slice(0, 8)}).`,
          priority: isOverdue ? 'urgent' : 'high',
          color: 'lime'
        });
      });
    }
  }

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
        priority: 'high',
        icon: 'receipt',
        color: 'rose'
      });
    }
  });

  // 7. EMI
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
        priority: 'urgent',
        icon: 'landmark',
        color: 'yellow'
      });
    }
  }

  // 8. TAX
  for (let y = 2026; y <= 2027; y++) {
    for (let m = 1; m <= 12; m++) {
      const monthStr = String(m).padStart(2, '0');
      // TDS 7th
      events.push({
        id: `tax_tds_${y}_${monthStr}`,
        category: 'tax',
        categoryLabel: 'Tax',
        title: '🏛️ Monthly TDS Payment (Sec 194C Transport)',
        date: `${y}-${monthStr}-07`,
        amount: 0,
        status: new Date(`${y}-${monthStr}-07`) < new Date() ? 'Completed' : 'Upcoming',
        description: 'Deposit of TDS deducted on transport contracts & contractor payments for preceding month (Challan ITNS 281).',
        priority: 'high',
        icon: 'building',
        color: 'teal'
      });

      // GSTR-1 11th
      events.push({
        id: `tax_gstr1_${y}_${monthStr}`,
        category: 'tax',
        categoryLabel: 'Tax',
        title: '🏛️ Monthly GST GSTR-1 Filing',
        date: `${y}-${monthStr}-11`,
        status: new Date(`${y}-${monthStr}-11`) < new Date() ? 'Completed' : 'Upcoming',
        description: 'Filing of outward supplies of transport services and e-way bill reconciliation.',
        priority: 'normal',
        icon: 'building',
        color: 'teal'
      });

      // GSTR-3B 20th
      events.push({
        id: `tax_gstr3b_${y}_${monthStr}`,
        category: 'tax',
        categoryLabel: 'Tax',
        title: '🏛️ Monthly GST GSTR-3B Summary Return',
        date: `${y}-${monthStr}-20`,
        status: new Date(`${y}-${monthStr}-20`) < new Date() ? 'Completed' : 'Upcoming',
        description: 'Monthly summary return of inward/outward supplies, ITC claim, and GST liability discharge.',
        priority: 'urgent',
        icon: 'building',
        color: 'teal'
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
        priority: 'high',
        icon: 'building',
        color: 'teal'
      });
    });

    // Quarterly Road Tax for fleet (TG12U2637 ~₹5,150)
    ['03-31', '06-30', '09-30', '12-31'].forEach((rtDate, idx) => {
      events.push({
        id: `tax_road_${y}_${idx}`,
        category: 'tax',
        categoryLabel: 'Tax',
        title: '🏛️ Quarterly Commercial MV Road Tax: TG12U2637 - ₹5,150',
        date: `${y}-${rtDate}`,
        amount: 5150,
        truckNumber: 'TG12U2637',
        status: new Date(`${y}-${rtDate}`) < new Date() ? 'Paid' : 'Upcoming',
        description: 'Telangana Motor Vehicle quarterly road tax payment token renewal for heavy commercial goods vehicle TG12U2637.',
        priority: 'urgent',
        icon: 'building',
        color: 'teal'
      });
    });
  }

  // 9. EXPECTED CUSTOMER PAYMENT handled above in consolidated cycles

  // Custom user events
  const customEvents = readCustomEvents();
  events.push(...customEvents);

  // Filter by category if requested
  let filtered = events;
  if (options.category && options.category !== 'all') {
    filtered = filtered.filter(e => e.category === options.category);
  }

  // Filter by month (YYYY-MM) if requested
  if (options.month) {
    filtered = filtered.filter(e => e.date && e.date.startsWith(options.month));
  }

  // Chronological sort
  filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return filtered;
}

export function addCustomBusinessEvent(eventData) {
  const events = readCustomEvents();
  const newEvent = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    ...eventData,
    isCustom: true,
    created_at: new Date().toISOString()
  };
  events.push(newEvent);
  saveCustomEvents(events);
  return newEvent;
}

export function deleteCustomBusinessEvent(eventId) {
  const events = readCustomEvents();
  const filtered = events.filter(e => e.id !== eventId);
  saveCustomEvents(filtered);
  return true;
}
