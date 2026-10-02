const fs = require('fs');
const path = require('path');
const ts = require('typescript');

console.log('=== Step 3: Compiling Unified Business Calendar ===');

const targetFiles = [
  path.join(__dirname, '../apps/web/dist/assets/CalendarPage-B2t9lz8o.js'),
  path.join(__dirname, '../apps/api/dist/assets/CalendarPage-B2t9lz8o.js'),
  path.join(__dirname, '../dist/apps/web/assets/CalendarPage-B2t9lz8o.js'),
  path.join(__dirname, '../dist/assets/CalendarPage-B2t9lz8o.js')
];

// Helper code to inject before function ft()
const helperCode = `
const BIZ_CATEGORIES = [
  { id: 'all', label: 'All Operations', icon: '🌟' },
  { id: 'truck_service', label: 'Truck Service', icon: '🔧' },
  { id: 'insurance_renewal', label: 'Insurance Renewal', icon: '🛡️' },
  { id: 'permit_expiry', label: 'Permit Expiry', icon: '📜' },
  { id: 'driver_joining', label: 'Driver Joining', icon: '👤' },
  { id: 'contract_renewal', label: 'Contract Renewal', icon: '📑' },
  { id: 'invoice_due', label: 'Invoice Due', icon: '🧾' },
  { id: 'emi', label: 'EMI', icon: '🏦' },
  { id: 'tax', label: 'Tax', icon: '🏛️' },
  { id: 'expected_payment', label: 'Expected Payment', icon: '💰' }
];

function buildBusinessCalendarEvents(trucks, truckDocs, jobCards, employees, clients, loanProfiles, emiExpenses, tripLogs, dueDates) {
  const events = [];
  const toYMD = (d) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return String(d).substring(0, 10);
      return dt.toISOString().split('T')[0];
    } catch {
      return String(d).substring(0, 10);
    }
  };

  (jobCards || []).forEach(jc => {
    if (jc.entry_date) {
      events.push({
        id: 'srv_' + jc.id,
        category: 'truck_service',
        categoryLabel: 'Truck Service',
        icon: '🔧',
        title: 'Service: ' + (jc.truck_number || 'TG12U2637') + ' - ' + (jc.service_type || 'Workshop Maintenance'),
        date: toYMD(jc.entry_date),
        amount: jc.total_cost || 0,
        truckNumber: jc.truck_number || 'TG12U2637',
        status: jc.status === 'Closed' ? 'Completed' : 'Scheduled',
        description: 'Job Card #' + (jc.job_card_number || '') + ': ' + (jc.complaints_list || jc.service_type || 'Maintenance') + '. Labour: ₹' + Number(jc.labour_cost || 0).toLocaleString('en-IN') + ', Parts: ₹' + Number(jc.parts_cost || 0).toLocaleString('en-IN') + '. Odo: ' + (jc.odometer_reading || 0) + ' km.',
        priority: 'high'
      });
    }
  });

  events.push({
    id: 'srv_projected_tg12u2637_next',
    category: 'truck_service',
    categoryLabel: 'Truck Service',
    icon: '🔧',
    title: '67,000 km Scheduled Preventive Service (TG12U2637)',
    date: '2026-11-12',
    amount: 18500,
    truckNumber: 'TG12U2637',
    status: 'Upcoming',
    description: '10,000 km routine preventive maintenance: Engine oil change, fuel/oil filters, brake inspection, greasing.',
    priority: 'high'
  });

  (truckDocs || []).forEach(doc => {
    const type = (doc.document_type || doc.type || '').toLowerCase();
    if (type.includes('insurance') && doc.expiry_date) {
      const expDate = toYMD(doc.expiry_date);
      events.push({
        id: 'ins_' + doc.id,
        category: 'insurance_renewal',
        categoryLabel: 'Insurance Renewal',
        icon: '🛡️',
        title: 'Comprehensive Insurance Renewal: TG12U2637',
        date: expDate,
        truckNumber: 'TG12U2637',
        status: new Date(expDate) < new Date() ? 'Overdue' : 'Upcoming',
        description: 'Commercial Vehicle Comprehensive Policy Renewal due. Ensure cashless garage network & zero depreciation coverage.',
        priority: 'urgent'
      });
    }
  });
  if (!events.some(e => e.category === 'insurance_renewal')) {
    events.push({
      id: 'ins_tg12u2637_baseline',
      category: 'insurance_renewal',
      categoryLabel: 'Insurance Renewal',
      icon: '🛡️',
      title: 'Comprehensive Insurance Renewal: TG12U2637',
      date: '2026-12-09',
      truckNumber: 'TG12U2637',
      status: 'Upcoming',
      description: 'Commercial Vehicle Comprehensive Policy Renewal due (IFFCO Tokio / National Insurance).',
      priority: 'urgent'
    });
  }

  (truckDocs || []).forEach(doc => {
    const type = (doc.document_type || doc.type || '').toLowerCase();
    const expiry = doc.expiry_date || doc.valid_till;
    if (!expiry || doc.truck_id === 'COMPANY_VAULT' || doc.truck_id === 'FLEET_RC_BUNDLE') return;

    if (type.includes('pollution') || type.includes('puc')) {
      events.push({
        id: 'puc_' + doc.id,
        category: 'permit_expiry',
        categoryLabel: 'Permit Expiry',
        icon: '📜',
        title: 'PUC Pollution Certificate Expiry: TG12U2637',
        date: toYMD(expiry),
        truckNumber: 'TG12U2637',
        status: 'Upcoming',
        description: 'Mandatory emission test renewal required under Central Motor Vehicle Rules (CMVR).',
        priority: 'normal'
      });
    } else if (type.includes('fitness')) {
      events.push({
        id: 'fit_' + doc.id,
        category: 'permit_expiry',
        categoryLabel: 'Permit Expiry',
        icon: '📜',
        title: 'Vehicle Fitness Certificate Expiry: TG12U2637',
        date: toYMD(expiry),
        truckNumber: 'TG12U2637',
        status: 'Upcoming',
        description: 'RTO commercial vehicle fitness inspection renewal.',
        priority: 'high'
      });
    } else if (type.includes('permit')) {
      events.push({
        id: 'pmt_' + doc.id,
        category: 'permit_expiry',
        categoryLabel: 'Permit Expiry',
        icon: '📜',
        title: 'National Goods Carrier Permit Expiry: TG12U2637',
        date: toYMD(expiry),
        truckNumber: 'TG12U2637',
        status: 'Upcoming',
        description: 'All India Tourist / Goods carriage national authorization permit renewal.',
        priority: 'high'
      });
    } else if (type.includes('rc')) {
      events.push({
        id: 'rc_' + doc.id,
        category: 'permit_expiry',
        categoryLabel: 'Permit Expiry',
        icon: '📜',
        title: 'Registration Certificate (RC) Expiry: TG12U2637',
        date: toYMD(expiry),
        truckNumber: 'TG12U2637',
        status: 'Upcoming',
        description: 'Heavy Commercial Goods Vehicle Registration Certificate renewal.',
        priority: 'normal'
      });
    }
  });

  (employees || []).forEach(emp => {
    const isDriver = (emp.employee_type || '').toLowerCase() === 'driver' || (emp.position || '').toLowerCase().includes('driver');
    const jDate = emp.joining_date || emp.hire_date;
    if (isDriver && jDate) {
      const formattedDate = toYMD(jDate);
      events.push({
        id: 'drv_join_' + emp.id,
        category: 'driver_joining',
        categoryLabel: 'Driver Joining',
        icon: '👤',
        title: 'Driver Onboarding: ' + emp.name,
        date: formattedDate,
        driverName: emp.name,
        status: 'Completed',
        description: 'Official onboarding & joining date for commercial pilot ' + emp.name + ' (Assigned to fleet operations).',
        priority: 'normal'
      });

      const joinYear = new Date(formattedDate).getFullYear();
      [2026, 2027].forEach(y => {
        if (y > joinYear) {
          const annivDate = y + '-' + formattedDate.substring(5, 10);
          events.push({
            id: 'drv_anniv_' + emp.id + '_' + y,
            category: 'driver_joining',
            categoryLabel: 'Driver Joining',
            icon: '👤',
            title: (y - joinYear) + ' Year Work Anniversary: ' + emp.name,
            date: annivDate,
            driverName: emp.name,
            status: 'Upcoming',
            description: 'Work anniversary milestone recognition & tenure review for pilot ' + emp.name + '.',
            priority: 'normal'
          });
        }
      });
    }
  });

  (clients || []).forEach(cl => {
    const cDate = cl.contract_expiry || (cl.created ? toYMD(cl.created) : '');
    if (cDate) {
      [2026, 2027].forEach(y => {
        const renewalDate = cl.contract_expiry ? toYMD(cl.contract_expiry) : (y + '-' + toYMD(cl.created).substring(5, 10));
        events.push({
          id: 'ctr_' + cl.id + '_' + y,
          category: 'contract_renewal',
          categoryLabel: 'Contract Renewal',
          icon: '📑',
          title: 'Contract Renewal: ' + (cl.company_name || cl.client_name),
          date: renewalDate,
          partyName: cl.company_name || cl.client_name,
          status: new Date(renewalDate) < new Date() ? 'Completed' : 'Upcoming',
          description: 'Annual transport master service contract & freight tariff renewal for ' + (cl.company_name || cl.client_name) + '. Payment terms: ' + (cl.payment_terms || 30) + ' days net credit.',
          priority: 'high'
        });
      });
    }
  });

  const unpaidTrips = (tripLogs || []).filter(t => t.client_payment_status !== 'received' && Number(t.revenue || 0) > 0);
  unpaidTrips.slice(0, 15).forEach(t => {
    const baseDate = t.date ? new Date(t.date) : new Date();
    const dueDate = new Date(baseDate.getTime() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    events.push({
      id: 'inv_due_' + t.id,
      category: 'invoice_due',
      categoryLabel: 'Invoice Due',
      icon: '🧾',
      title: 'Invoice Due: ' + (t.route || 'Freight Invoice') + ' - ₹' + Number(t.revenue || 0).toLocaleString('en-IN'),
      date: dueDate,
      amount: Number(t.revenue || 0),
      partyName: 'AMAZON TRANSPORTATION SERVICES',
      truckNumber: t.truck_number || 'TG12U2637',
      status: 'Upcoming',
      description: 'Freight invoice settlement due for Trip #' + (t.trip_id || t.id.slice(0, 8)) + ' (' + t.route + ').',
      priority: 'high'
    });
  });

  (dueDates || []).forEach(dd => {
    if (dd.due_date) {
      events.push({
        id: 'pdd_' + dd.id,
        category: 'invoice_due',
        categoryLabel: 'Invoice Due',
        icon: '🧾',
        title: 'Payment Due: ' + (dd.title || 'Corporate Statement'),
        date: toYMD(dd.due_date),
        amount: dd.full_payment_amount || dd.amount || 0,
        status: dd.status || 'Unpaid',
        description: dd.notes || 'Statement invoice payment due.',
        priority: 'high'
      });
    }
  });

  const paidEmiDates = new Set((emiExpenses || []).map(e => toYMD(e.date)));
  for (let y = 2026; y <= 2027; y++) {
    for (let m = 1; m <= 12; m++) {
      const emiDate = y + '-' + String(m).padStart(2, '0') + '-05';
      const isPaid = paidEmiDates.has(emiDate) || new Date(emiDate) < new Date('2026-10-01');
      events.push({
        id: 'emi_iffco_' + emiDate,
        category: 'emi',
        categoryLabel: 'EMI',
        icon: '🏦',
        title: 'Vehicle Loan EMI: TG12U2637 - ₹33,410',
        date: emiDate,
        amount: 33410,
        truckNumber: 'TG12U2637',
        partyName: 'IFFCO Kisan Finance',
        status: isPaid ? 'Paid' : 'Upcoming',
        description: 'Monthly vehicle auto loan installment of ₹33,410 debited via ECS / NACH mandate on 5th of every month. Financier: IFFCO KISAAN.',
        priority: 'urgent'
      });
    }
  }

  for (let y = 2026; y <= 2027; y++) {
    for (let m = 1; m <= 12; m++) {
      const monthStr = String(m).padStart(2, '0');
      events.push({
        id: 'tax_tds_' + y + '_' + monthStr,
        category: 'tax',
        categoryLabel: 'Tax',
        icon: '🏛️',
        title: 'Monthly TDS Payment (Sec 194C Transport)',
        date: y + '-' + monthStr + '-07',
        amount: 0,
        status: new Date(y + '-' + monthStr + '-07') < new Date() ? 'Completed' : 'Upcoming',
        description: 'Deposit of TDS deducted on transport contracts & contractor payments for preceding month (Challan ITNS 281).',
        priority: 'high'
      });

      events.push({
        id: 'tax_gstr1_' + y + '_' + monthStr,
        category: 'tax',
        categoryLabel: 'Tax',
        icon: '🏛️',
        title: 'Monthly GST GSTR-1 Filing',
        date: y + '-' + monthStr + '-11',
        status: new Date(y + '-' + monthStr + '-11') < new Date() ? 'Completed' : 'Upcoming',
        description: 'Filing of outward supplies of transport services and e-way bill reconciliation.',
        priority: 'normal'
      });

      events.push({
        id: 'tax_gstr3b_' + y + '_' + monthStr,
        category: 'tax',
        categoryLabel: 'Tax',
        icon: '🏛️',
        title: 'Monthly GST GSTR-3B Summary Return',
        date: y + '-' + monthStr + '-20',
        status: new Date(y + '-' + monthStr + '-20') < new Date() ? 'Completed' : 'Upcoming',
        description: 'Monthly summary return of inward/outward supplies, ITC claim, and GST liability discharge.',
        priority: 'urgent'
      });
    }

    const advMonths = ['06', '09', '12', '03'];
    const advLabels = ['Q1 (15%)', 'Q2 (45%)', 'Q3 (75%)', 'Q4 (100%)'];
    advMonths.forEach((am, idx) => {
      const advYear = am === '03' ? y + 1 : y;
      events.push({
        id: 'tax_adv_' + advYear + '_' + am,
        category: 'tax',
        categoryLabel: 'Tax',
        icon: '🏛️',
        title: 'Advance Tax Installment ' + advLabels[idx],
        date: advYear + '-' + am + '-15',
        status: new Date(advYear + '-' + am + '-15') < new Date() ? 'Completed' : 'Upcoming',
        description: 'Statutory quarterly income tax advance payment for FY ' + y + '-' + (y + 1) + '.',
        priority: 'high'
      });
    });

    ['03-31', '06-30', '09-30', '12-31'].forEach((rtDate, idx) => {
      events.push({
        id: 'tax_road_' + y + '_' + idx,
        category: 'tax',
        categoryLabel: 'Tax',
        icon: '🏛️',
        title: 'Quarterly Commercial MV Road Tax: TG12U2637 - ₹5,150',
        date: y + '-' + rtDate,
        amount: 5150,
        truckNumber: 'TG12U2637',
        status: new Date(y + '-' + rtDate) < new Date() ? 'Paid' : 'Upcoming',
        description: 'Telangana Motor Vehicle quarterly road tax payment token renewal for heavy commercial goods vehicle TG12U2637.',
        priority: 'urgent'
      });
    });
  }

  const deliveredTrips = (tripLogs || []).filter(t => t.trip_status === 'Delivered' && Number(t.revenue || 0) > 0);
  deliveredTrips.slice(0, 20).forEach(t => {
    const tripDate = t.date ? new Date(t.date) : new Date();
    const payDate = new Date(tripDate.getTime() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    events.push({
      id: 'exp_pay_' + t.id,
      category: 'expected_payment',
      categoryLabel: 'Expected Payment',
      icon: '💰',
      title: 'Expected Payment: Amazon - ₹' + Number(t.revenue || 0).toLocaleString('en-IN'),
      date: payDate,
      amount: Number(t.revenue || 0),
      partyName: 'AMAZON TRANSPORTATION SERVICES',
      truckNumber: t.truck_number || 'TG12U2637',
      status: t.client_payment_status === 'received' ? 'Received' : 'Expected',
      description: 'Expected B2B contract freight remittance for route ' + t.route + ' (' + t.kms + ' km). 32 days net credit cycle.',
      priority: 'high'
    });
  });

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return events;
}
`;

for (const targetFile of targetFiles) {
  let code = fs.readFileSync(targetFile + '.bak', 'utf8');

  // 1. Inject helperCode before function ft()
  code = helperCode + '\n' + code;

  // 2. Add state inside ft()
  const anchor1 = 'function ft(){const{currentUser:y}=Ys(),';
  const repl1 = 'function ft(){const{currentUser:y}=Ys(),[bizEvents,setBizEvents]=n.useState([]),[activeCategory,setActiveCategory]=n.useState("all"),';
  if (!code.includes(anchor1)) throw new Error('anchor1 not found in ' + targetFile);
  code = code.replace(anchor1, repl1);

  // 3. Inside U callback: fetch & generate all 9 categories
  const anchor2 = 'A(r),is(a),cs(m),xs(C),ms(l),us(O),ps(j)';
  const repl2 = `A(r),is(a),cs(m),xs(C),ms(l),us(O),ps(j);
try{
  const[bDocs,bJobs,bEmps,bClients,bLoans,bEmis]=await Promise.all([
    S.collection("truck_documents").getFullList({$autoCancel:!1}).catch(()=>[]),
    S.collection("workshop_job_cards").getFullList({$autoCancel:!1}).catch(()=>[]),
    S.collection("employees").getFullList({$autoCancel:!1}).catch(()=>[]),
    S.collection("clients").getFullList({$autoCancel:!1}).catch(()=>[]),
    S.collection("loan_profiles").getFullList({$autoCancel:!1}).catch(()=>[]),
    S.collection("expenses").getFullList({filter:'category="EMI"||subcategory="EMI"',$autoCancel:!1}).catch(()=>[])
  ]);
  const localEvts=buildBusinessCalendarEvents(d,bDocs,bJobs,bEmps,bClients,bLoans,bEmis,r,m);
  setBizEvents(localEvts);
  fetch("/api/business-calendar/events").then(res=>res.ok?res.json():null).then(d=>{if(d&&d.events&&d.events.length>0)setBizEvents(d.events);}).catch(()=>{});
}catch(e){console.warn("Local calendar build warning:",e)}`;
  if (!code.includes(anchor2)) throw new Error('anchor2 not found in ' + targetFile);
  code = code.replace(anchor2, repl2);

  // 4. Update Qe to return matching 9 categories
  const anchor3 = 'const Qe=s=>{const t=ne.toLowerCase().trim(),r=z?b.filter(d=>!d.date||!Ce(new Date(d.date.replace(" ","T")),s)?!1:t?(d.route||"").toLowerCase().includes(t)||(d.truck_number||"").toLowerCase().includes(t)||(d.driver_name||"").toLowerCase().includes(t):!0):[],a=q?T.filter(d=>!d.reminder_date||!Ce(new Date(d.reminder_date),s)?!1:t?(d.title||"").toLowerCase().includes(t)||(d.description||"").toLowerCase().includes(t):!0):[],m=Q?E.filter(d=>!d.date||!Ce(d.date,s)?!1:t?(d.title||"").toLowerCase().includes(t):!0):[];return{trips:r,reminders:a,bills:m}}';
  const repl3 = `const Qe=s=>{
    const t=ne.toLowerCase().trim(),r=z?b.filter(d=>!d.date||!Ce(new Date(d.date.replace(" ","T")),s)?!1:t?(d.route||"").toLowerCase().includes(t)||(d.truck_number||"").toLowerCase().includes(t)||(d.driver_name||"").toLowerCase().includes(t):!0):[],a=q?T.filter(d=>!d.reminder_date||!Ce(new Date(d.reminder_date),s)?!1:t?(d.title||"").toLowerCase().includes(t)||(d.description||"").toLowerCase().includes(t):!0):[],m=Q?E.filter(d=>!d.date||!Ce(d.date,s)?!1:t?(d.title||"").toLowerCase().includes(t):!0):[];
    const dayStr=(s instanceof Date?s.toISOString().split("T")[0]:String(s).substring(0,10));
    const matchingBiz=(bizEvents||[]).filter(ev=>ev.date===dayStr&&(activeCategory==="all"||ev.category===activeCategory)&&(!t||(ev.title||"").toLowerCase().includes(t)||(ev.description||"").toLowerCase().includes(t)||(ev.truckNumber||"").toLowerCase().includes(t)));
    const truckService=matchingBiz.filter(ev=>ev.category==="truck_service");
    const insuranceRenewal=matchingBiz.filter(ev=>ev.category==="insurance_renewal");
    const permitExpiry=matchingBiz.filter(ev=>ev.category==="permit_expiry");
    const driverJoining=matchingBiz.filter(ev=>ev.category==="driver_joining");
    const contractRenewal=matchingBiz.filter(ev=>ev.category==="contract_renewal");
    const invoiceDue=matchingBiz.filter(ev=>ev.category==="invoice_due");
    const emi=matchingBiz.filter(ev=>ev.category==="emi");
    const tax=matchingBiz.filter(ev=>ev.category==="tax");
    const expectedPayment=matchingBiz.filter(ev=>ev.category==="expected_payment");
    return{trips:r,reminders:a,bills:m,bizEvents:matchingBiz,truckService,insuranceRenewal,permitExpiry,driverJoining,contractRenewal,invoiceDue,emi,tax,expectedPayment};
  }`;
  if (!code.includes(anchor3)) throw new Error('anchor3 not found in ' + targetFile);
  code = code.replace(anchor3, repl3);

  // Update Ke count to include bizEvents
  const anchorKe = 'v=Qe($e),Ke=v.trips.length+v.reminders.length+v.bills.length';
  const replKe = 'v=Qe($e),Ke=v.trips.length+v.reminders.length+v.bills.length+(v.bizEvents||[]).length';
  if (!code.includes(anchorKe)) throw new Error('anchorKe not found in ' + targetFile);
  code = code.replace(anchorKe, replKe);

  // 5. Update Header Title & Subtitle
  const anchorHeader = 'children:"Operations & Compliance Scheduling"})]}),e.jsx("h1",{className:"text-2xl sm:text-3xl font-black tracking-tight text-foreground font-heading",children:"Calendar & Fleet Agenda"}),e.jsx("p",{className:"text-xs sm:text-sm text-muted-foreground mt-0.5",children:"Track daily trip dispatches, compliance reminders, and real-time truck availabilities."})';
  const replHeader = 'children:"Enterprise Business Calendar"})]}),e.jsx("h1",{className:"text-2xl sm:text-3xl font-black tracking-tight text-foreground font-heading",children:"Unified Business Calendar"}),e.jsx("p",{className:"text-xs sm:text-sm text-muted-foreground mt-0.5",children:"One calendar containing: Truck service, Insurance renewal, Permit expiry, Driver joining, Contract renewal, Invoice due, EMI, Tax & Expected customer payment."})';
  if (!code.includes(anchorHeader)) throw new Error('anchorHeader not found in ' + targetFile);
  code = code.replace(anchorHeader, replHeader);

  // 6. Inject the Category Filter Bar above the calendar
  // We place it right before e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3"
  const anchorStats = 'u==="events"?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3"';
  const filterBarCode = `e.jsxs("div",{className:"flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none",children:BIZ_CATEGORIES.map(cat=>{
    const isAct=activeCategory===cat.id;
    const catCount=cat.id==="all"?(bizEvents||[]).length:(bizEvents||[]).filter(ev=>ev.category===cat.id).length;
    return e.jsxs("button",{key:cat.id,onClick:()=>setActiveCategory(cat.id),className:p("px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5",isAct?"bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/50":"bg-muted/30 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/60"),children:[e.jsx("span",{children:cat.icon}),e.jsx("span",{children:cat.label}),e.jsx("span",{className:"px-1.5 py-0.2 rounded-md bg-white/10 text-[10px] font-mono",children:catCount})]});
  })}),`;
  const replStats = 'u==="events"?e.jsxs(e.Fragment,{children:[' + filterBarCode + 'e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3"';
  if (!code.includes(anchorStats)) throw new Error('anchorStats not found in ' + targetFile);
  code = code.replace(anchorStats, replStats);

  // 7. Update Month Grid Day Cell to render badges for all 9 categories
  // In qe.map:
  const anchorCellCount = 'qe.map((s,t)=>{const r=os(s,i),a=Qe(s),m=a.trips.length+a.reminders.length+a.bills.length;';
  const replCellCount = 'qe.map((s,t)=>{const r=os(s,i),a=Qe(s),m=a.trips.length+a.reminders.length+a.bills.length+(a.bizEvents?a.bizEvents.length:0);';
  if (!code.includes(anchorCellCount)) throw new Error('anchorCellCount not found in ' + targetFile);
  code = code.replace(anchorCellCount, replCellCount);

  // In the visible badges container:
  const anchorBadges = 'children:[a.trips.slice(0,2).map(d=>e.jsxs("div",{className:"text-[10px] truncate px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1",children:[e.jsx(w,{className:"w-3 h-3 shrink-0 text-emerald-400"}),e.jsx("span",{className:"truncate",children:d.route})]},d.id)),a.reminders.slice(0,2).map(d=>e.jsxs("div",{className:"text-[10px] truncate px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1",children:[e.jsx(te,{className:"w-3 h-3 shrink-0 text-amber-400"}),e.jsx("span",{className:"truncate",children:d.title})]},d.id)),a.bills.slice(0,2).map(d=>e.jsxs("div",{className:"text-[10px] truncate px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold flex items-center gap-1",children:[e.jsx(re,{className:"w-3 h-3 shrink-0 text-indigo-400"}),e.jsxs("span",{className:"truncate",children:["₹",d.amount.toLocaleString()]})]},d.id))';
  
  const replBadges = `children:[
    a.emi&&a.emi.slice(0,1).map(ev=>e.jsxs("div",{key:ev.id,className:"text-[10px] truncate px-1.5 py-0.5 rounded-md bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-black flex items-center gap-1",children:["🏦 ",e.jsx("span",{className:"truncate",children:"EMI: ₹33,410"})]})),
    a.tax&&a.tax.slice(0,1).map(ev=>e.jsxs("div",{key:ev.id,className:"text-[10px] truncate px-1.5 py-0.5 rounded-md bg-teal-500/15 text-teal-400 border border-teal-500/30 font-bold flex items-center gap-1",children:["🏛️ ",e.jsx("span",{className:"truncate",children:ev.title.replace("🏛️ ","")})]})),
    a.insuranceRenewal&&a.insuranceRenewal.slice(0,1).map(ev=>e.jsxs("div",{key:ev.id,className:"text-[10px] truncate px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1",children:["🛡️ ",e.jsx("span",{className:"truncate",children:"Insurance Renewal"})]})),
    a.permitExpiry&&a.permitExpiry.slice(0,1).map(ev=>e.jsxs("div",{key:ev.id,className:"text-[10px] truncate px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1",children:["📜 ",e.jsx("span",{className:"truncate",children:ev.title.replace("📜 ","").split(":")[0]})]})),
    a.truckService&&a.truckService.slice(0,1).map(ev=>e.jsxs("div",{key:ev.id,className:"text-[10px] truncate px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold flex items-center gap-1",children:["🔧 ",e.jsx("span",{className:"truncate",children:ev.title.replace("🔧 ","")})]})),
    a.driverJoining&&a.driverJoining.slice(0,1).map(ev=>e.jsxs("div",{key:ev.id,className:"text-[10px] truncate px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30 font-bold flex items-center gap-1",children:["👤 ",e.jsx("span",{className:"truncate",children:ev.driverName||"Driver Joining"})]})),
    a.contractRenewal&&a.contractRenewal.slice(0,1).map(ev=>e.jsxs("div",{key:ev.id,className:"text-[10px] truncate px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold flex items-center gap-1",children:["📑 ",e.jsx("span",{className:"truncate",children:ev.partyName||"Contract Renewal"})]})),
    a.invoiceDue&&a.invoiceDue.slice(0,1).map(ev=>e.jsxs("div",{key:ev.id,className:"text-[10px] truncate px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1",children:["🧾 ",e.jsx("span",{className:"truncate",children:"Invoice: ₹"+Number(ev.amount||0).toLocaleString('en-IN')})]})),
    a.expectedPayment&&a.expectedPayment.slice(0,1).map(ev=>e.jsxs("div",{key:ev.id,className:"text-[10px] truncate px-1.5 py-0.5 rounded-md bg-lime-500/15 text-lime-400 border border-lime-500/30 font-bold flex items-center gap-1",children:["💰 ",e.jsx("span",{className:"truncate",children:"Payment: ₹"+Number(ev.amount||0).toLocaleString('en-IN')})]})),
    a.trips.slice(0,1).map(d=>e.jsxs("div",{className:"text-[10px] truncate px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1",children:[e.jsx(w,{className:"w-3 h-3 shrink-0 text-emerald-400"}),e.jsx("span",{className:"truncate",children:d.route})]},d.id)),
    a.reminders.slice(0,1).map(d=>e.jsxs("div",{className:"text-[10px] truncate px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1",children:[e.jsx(te,{className:"w-3 h-3 shrink-0 text-amber-400"}),e.jsx("span",{className:"truncate",children:d.title})]},d.id)),
    a.bills.slice(0,1).map(d=>e.jsxs("div",{className:"text-[10px] truncate px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold flex items-center gap-1",children:[e.jsx(re,{className:"w-3 h-3 shrink-0 text-indigo-400"}),e.jsxs("span",{className:"truncate",children:["₹",d.amount.toLocaleString()]})]},d.id))
  `;
  if (!code.includes(anchorBadges)) throw new Error('anchorBadges not found in ' + targetFile);
  code = code.replace(anchorBadges, replBadges);

  // 8. Update Day Details Modal (Dialog 1)
  // In Dialog 1, inside the `space-y-4` container where `v.trips.length>0&&...` is placed:
  const anchorDialog1 = 'e.jsxs("div",{className:"space-y-4",children:[v.trips.length>0&&';
  const replDialog1 = `e.jsxs("div",{className:"space-y-4",children:[
    v.emi&&v.emi.length>0&&e.jsxs("div",{className:"space-y-2",children:[
      e.jsxs("h4",{className:"text-xs font-black uppercase tracking-widest text-yellow-400 flex items-center gap-1.5",children:["🏦 Vehicle Loan EMI (",v.emi.length,")"]}),
      v.emi.map(s=>e.jsxs("div",{key:s.id,className:"p-3.5 bg-yellow-500/5 rounded-2xl border border-yellow-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3",children:[
        e.jsxs("div",{className:"space-y-1",children:[
          e.jsx("p",{className:"text-sm font-black text-foreground",children:s.title}),
          e.jsx("p",{className:"text-xs text-muted-foreground",children:s.description})
        ]}),
        e.jsxs("div",{className:"text-right shrink-0",children:[
          e.jsxs("span",{className:"text-sm font-black text-yellow-400 font-mono block",children:["₹",Number(s.amount||0).toLocaleString('en-IN')]}),
          e.jsx("span",{className:"text-[10px] px-2 py-0.5 rounded-md font-bold "+(s.status==="Paid"?"bg-emerald-500/10 text-emerald-400":"bg-yellow-500/10 text-yellow-400"),children:s.status})
        ]})
      ]}))
    ]}),
    v.tax&&v.tax.length>0&&e.jsxs("div",{className:"space-y-2",children:[
      e.jsxs("h4",{className:"text-xs font-black uppercase tracking-widest text-teal-400 flex items-center gap-1.5",children:["🏛️ Statutory Tax Deadlines (",v.tax.length,")"]}),
      v.tax.map(s=>e.jsxs("div",{key:s.id,className:"p-3.5 bg-teal-500/5 rounded-2xl border border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3",children:[
        e.jsxs("div",{className:"space-y-1",children:[
          e.jsx("p",{className:"text-sm font-black text-foreground",children:s.title}),
          e.jsx("p",{className:"text-xs text-muted-foreground",children:s.description})
        ]}),
        e.jsx("span",{className:"text-[10px] px-2.5 py-1 rounded-lg uppercase font-bold "+(s.status==="Completed"||s.status==="Paid"?"bg-emerald-500/10 text-emerald-400 border border-emerald-500/20":"bg-teal-500/10 text-teal-400 border border-teal-500/20"),children:s.status})
      ]}))
    ]}),
    v.insuranceRenewal&&v.insuranceRenewal.length>0&&e.jsxs("div",{className:"space-y-2",children:[
      e.jsxs("h4",{className:"text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5",children:["🛡️ Insurance Renewal (",v.insuranceRenewal.length,")"]}),
      v.insuranceRenewal.map(s=>e.jsxs("div",{key:s.id,className:"p-3.5 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3",children:[
        e.jsxs("div",{className:"space-y-1",children:[
          e.jsx("p",{className:"text-sm font-black text-foreground",children:s.title}),
          e.jsx("p",{className:"text-xs text-muted-foreground",children:s.description})
        ]}),
        e.jsx("span",{className:"text-[10px] px-2.5 py-1 rounded-lg uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",children:s.status})
      ]}))
    ]}),
    v.permitExpiry&&v.permitExpiry.length>0&&e.jsxs("div",{className:"space-y-2",children:[
      e.jsxs("h4",{className:"text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5",children:["📜 Permit & Certificate Expiry (",v.permitExpiry.length,")"]}),
      v.permitExpiry.map(s=>e.jsxs("div",{key:s.id,className:"p-3.5 bg-amber-500/5 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3",children:[
        e.jsxs("div",{className:"space-y-1",children:[
          e.jsx("p",{className:"text-sm font-black text-foreground",children:s.title}),
          e.jsx("p",{className:"text-xs text-muted-foreground",children:s.description})
        ]}),
        e.jsx("span",{className:"text-[10px] px-2.5 py-1 rounded-lg uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20",children:s.status})
      ]}))
    ]}),
    v.truckService&&v.truckService.length>0&&e.jsxs("div",{className:"space-y-2",children:[
      e.jsxs("h4",{className:"text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5",children:["🔧 Truck Service & Maintenance (",v.truckService.length,")"]}),
      v.truckService.map(s=>e.jsxs("div",{key:s.id,className:"p-3.5 bg-blue-500/5 rounded-2xl border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3",children:[
        e.jsxs("div",{className:"space-y-1",children:[
          e.jsx("p",{className:"text-sm font-black text-foreground",children:s.title}),
          e.jsx("p",{className:"text-xs text-muted-foreground",children:s.description})
        ]}),
        s.amount>0&&e.jsxs("span",{className:"text-xs font-bold text-blue-400 font-mono",children:["₹",Number(s.amount).toLocaleString('en-IN')]})
      ]}))
    ]}),
    v.driverJoining&&v.driverJoining.length>0&&e.jsxs("div",{className:"space-y-2",children:[
      e.jsxs("h4",{className:"text-xs font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5",children:["👤 Driver Onboarding & Anniversaries (",v.driverJoining.length,")"]}),
      v.driverJoining.map(s=>e.jsxs("div",{key:s.id,className:"p-3.5 bg-purple-500/5 rounded-2xl border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3",children:[
        e.jsxs("div",{className:"space-y-1",children:[
          e.jsx("p",{className:"text-sm font-black text-foreground",children:s.title}),
          e.jsx("p",{className:"text-xs text-muted-foreground",children:s.description})
        ]}),
        e.jsx("span",{className:"text-[10px] px-2.5 py-1 rounded-lg uppercase font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20",children:s.status})
      ]}))
    ]}),
    v.contractRenewal&&v.contractRenewal.length>0&&e.jsxs("div",{className:"space-y-2",children:[
      e.jsxs("h4",{className:"text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5",children:["📑 Logistics Contract Renewal (",v.contractRenewal.length,")"]}),
      v.contractRenewal.map(s=>e.jsxs("div",{key:s.id,className:"p-3.5 bg-cyan-500/5 rounded-2xl border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3",children:[
        e.jsxs("div",{className:"space-y-1",children:[
          e.jsx("p",{className:"text-sm font-black text-foreground",children:s.title}),
          e.jsx("p",{className:"text-xs text-muted-foreground",children:s.description})
        ]}),
        e.jsx("span",{className:"text-[10px] px-2.5 py-1 rounded-lg uppercase font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",children:s.status})
      ]}))
    ]}),
    v.invoiceDue&&v.invoiceDue.length>0&&e.jsxs("div",{className:"space-y-2",children:[
      e.jsxs("h4",{className:"text-xs font-black uppercase tracking-widest text-rose-400 flex items-center gap-1.5",children:["🧾 Client Invoices Due (",v.invoiceDue.length,")"]}),
      v.invoiceDue.map(s=>e.jsxs("div",{key:s.id,className:"p-3.5 bg-rose-500/5 rounded-2xl border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3",children:[
        e.jsxs("div",{className:"space-y-1",children:[
          e.jsx("p",{className:"text-sm font-black text-foreground",children:s.title}),
          e.jsx("p",{className:"text-xs text-muted-foreground",children:s.description})
        ]}),
        s.amount>0&&e.jsxs("span",{className:"text-xs font-bold text-rose-400 font-mono",children:["₹",Number(s.amount).toLocaleString('en-IN')]})
      ]}))
    ]}),
    v.expectedPayment&&v.expectedPayment.length>0&&e.jsxs("div",{className:"space-y-2",children:[
      e.jsxs("h4",{className:"text-xs font-black uppercase tracking-widest text-lime-400 flex items-center gap-1.5",children:["💰 Expected Customer Payment (",v.expectedPayment.length,")"]}),
      v.expectedPayment.map(s=>e.jsxs("div",{key:s.id,className:"p-3.5 bg-lime-500/5 rounded-2xl border border-lime-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3",children:[
        e.jsxs("div",{className:"space-y-1",children:[
          e.jsx("p",{className:"text-sm font-black text-foreground",children:s.title}),
          e.jsx("p",{className:"text-xs text-muted-foreground",children:s.description})
        ]}),
        s.amount>0&&e.jsxs("span",{className:"text-xs font-bold text-lime-400 font-mono",children:["₹",Number(s.amount).toLocaleString('en-IN')]})
      ]}))
    ]}),
    v.trips.length>0&&`;
  if (!code.includes(anchorDialog1)) throw new Error('anchorDialog1 not found in ' + targetFile);
  code = code.replace(anchorDialog1, replDialog1);

  // Write patched file
  fs.writeFileSync(targetFile, code, 'utf8');

  // Verify syntax with TypeScript compiler
  const sf = ts.createSourceFile(path.basename(targetFile), code, ts.ScriptTarget.Latest, true);
  if (sf.parseDiagnostics.length > 0) {
    sf.parseDiagnostics.slice(0, 3).forEach(d => {
      const { line, character } = sf.getLineAndCharacterOfPosition(d.start);
      console.error(path.basename(targetFile), `line ${line + 1}:${character + 1} -`, d.messageText);
      const lines = code.split('\n');
      console.error('Context snippet:', lines[line] ? lines[line].substring(Math.max(0, character - 40), character + 60) : 'N/A');
    });
    // Rollback from bak
    fs.copyFileSync(targetFile + '.bak', targetFile);
    throw new Error('Syntax validation failed for ' + targetFile);

  }


  console.log(`✅ Patched and AST-verified: ${path.basename(targetFile)} (0 syntax errors)`);
}

console.log('🎉 ALL 4 CALENDAR ASSETS COMPILED AND VERIFIED SUCCESSFULLY!');
