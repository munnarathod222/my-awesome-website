
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

  const clientMap = new Map((clients || []).map(c => [c.id, c]));
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const todayStr = toYMD(new Date());

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
        const key = y + '_' + String(m).padStart(2, '0') + '_H' + half;
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
        const cycleLabel = grp.half === 1 ? mName + ' 01–15' : mName + ' 16–' + cycleEndDate.getDate();
        const netAmount = Math.round(grp.totalGross * (1 - tdsPct / 100));
        const isOverdue = dueYMD < todayStr;

        events.push({
          id: 'inv_due_' + cid + '_' + cycleKey,
          category: 'invoice_due',
          categoryLabel: 'Invoice Due',
          icon: '🧾',
          title: 'Invoice Due: ' + clientName + ' (' + cycleLabel + ') - ₹' + grp.totalGross.toLocaleString('en-IN'),
          date: dueYMD,
          amount: grp.totalGross,
          partyName: client.company_name || clientName,
          truckNumber: 'TG12U2637',
          status: isOverdue ? 'Overdue' : 'Upcoming',
          description: 'B2B freight invoice due for ' + grp.trips.length + ' delivered trips during ' + cycleLabel + '.',
          priority: isOverdue ? 'urgent' : 'high'
        });

        events.push({
          id: 'exp_pay_' + cid + '_' + cycleKey,
          category: 'expected_payment',
          categoryLabel: 'Expected Payment',
          icon: '💰',
          title: 'Expected Payment: ' + clientName + ' - ₹' + netAmount.toLocaleString('en-IN'),
          date: dueYMD,
          amount: netAmount,
          partyName: client.company_name || clientName,
          truckNumber: 'TG12U2637',
          status: isOverdue ? 'Overdue' : 'Expected',
          description: 'Consolidated B2B contract freight settlement for ' + grp.trips.length + ' delivered trips (' + cycleLabel + '). Gross: ₹' + grp.totalGross.toLocaleString('en-IN') + ', Net: ₹' + netAmount.toLocaleString('en-IN') + ' (after ' + tdsPct + '% TDS). Credit terms: ' + terms + ' days.',
          priority: isOverdue ? 'urgent' : 'high'
        });
      }
    } else {
      trips.forEach(t => {
        const baseDate = t.date ? new Date(t.date) : new Date();
        const spotDue = new Date(baseDate.getTime() + (terms || 7) * 24 * 60 * 60 * 1000);
        const dueYMD = toYMD(spotDue);
        const rev = Number(t.revenue || 0);
        const isOverdue = dueYMD < todayStr;

        events.push({
          id: 'exp_pay_spot_' + t.id,
          category: 'expected_payment',
          categoryLabel: 'Expected Payment',
          icon: '💰',
          title: 'Expected Payment: ' + clientName + ' - ₹' + rev.toLocaleString('en-IN'),
          date: dueYMD,
          amount: rev,
          partyName: client.company_name || clientName,
          truckNumber: t.truck_number || 'TG12U2637',
          status: isOverdue ? 'Overdue' : 'Expected',
          description: 'Spot shipment payment for route ' + (t.route || 'Transit') + ' (Trip #' + (t.trip_id || t.id.slice(0, 8)) + ').',
          priority: isOverdue ? 'urgent' : 'high'
        });
      });
    }
  }

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

// Stream 9 unified with consolidated cycles

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return events;
}

import{r as n,j as e,bs as Fs,ap as Os,ag as ee,a4 as se,a6 as w,a$ as te,aw as re,ba as ss,g as ts,at as rs,cy as as,dw as Is,cv as ns,aV as ke,aA as $s,b2 as ls,bl as Es,n as Bs,aU as zs,bG as qs,be as Qs,az as Vs,af as Us}from"./vendor-react-Bs5V2qFE.js";import{ar as ge,b2 as Ps,aR as Se,u as Ys,b3 as Hs,p as S,aq as Ws,ax as Gs,t as Y,k as f,B as c,X as p,C as _,S as H,e as W,g as G,h as J,i as X,I,O as we,w as ae,D as xe,a as me,b as ue,c as pe,d as he,j as be,L as $,b1 as Js,au as Xs}from"./index-DLxf9dwO.js";import{A as Ks,R as Zs}from"./ReminderDetailsModal-pkSDYcqN.js";import{s as et,e as st}from"./startOfMonth-CPqsb2_s.js";import{e as ds}from"./eachDayOfInterval-B703Z6PC.js";import{i as D}from"./isToday-CDNUloTc.js";import{i as os}from"./isSameMonth-BI6tq28A.js";import{i as Ce}from"./isSameDay-tDnVa-xb.js";import"./vendor-radix-BQCqNqg0.js";import"./vendor-pdf-DtmgLs_2.js";import"./PaymentRecordModal-D0eRHf14.js";import"./alert-DkiyHHbs.js";function tt(y,i){const h=Ps(),u=h.weekStartsOn??h.locale?.options?.weekStartsOn??0,N=ge(y,i?.in),b=N.getDay(),A=(b<u?-7:0)+6-(b-u);return N.setDate(N.getDate()+A),N.setHours(23,59,59,999),N}function rt(y,i){const h=ge(y,i?.in),u=h.getFullYear(),N=h.getMonth(),b=Se(h,0);return b.setFullYear(u,N+1,0),b.setHours(0,0,0,0),b.getDate()}function at(y,i,h){const u=ge(y,h?.in),N=u.getFullYear(),b=u.getDate(),A=Se(y,0);A.setFullYear(N,i,15),A.setHours(0,0,0,0);const T=rt(A);return u.setMonth(i,Math.min(b,T)),u}function nt(y,i,h){const u=ge(y,h?.in);return isNaN(+u)?Se(y,NaN):(u.setFullYear(i),u)}function ft(){const{currentUser:y}=Ys(),[bizEvents,setBizEvents]=n.useState([]),[activeCategory,setActiveCategory]=n.useState("all"),[i,h]=n.useState(new Date),[u,N]=n.useState("events"),[b,A]=n.useState([]),[T,is]=n.useState([]),[E,cs]=n.useState([]),[B,xs]=n.useState([]),[_e,ms]=n.useState([]),[De,us]=n.useState([]),[Te,ps]=n.useState([]),[Me,Le]=n.useState(!0),[fe,Re]=n.useState("grid"),[ne,hs]=n.useState(""),[z,bs]=n.useState(!0),[q,gs]=n.useState(!0),[Q,fs]=n.useState(!0),[je,Ae]=n.useState("matrix"),[Ne,js]=n.useState(""),[K,Fe]=n.useState("all"),[x,Ns]=n.useState(null),[vs,le]=n.useState(!1),[o,ys]=n.useState(null),[ks,de]=n.useState(!1),[ws,oe]=n.useState(!1),[Oe,Ie]=n.useState(null),[$e,Cs]=n.useState(new Date),[Ss,Z]=n.useState(!1),[_s,ie]=n.useState(!1),[ve,Ee]=n.useState(!1),[g,M]=n.useState({date:"",truck_number:"",driver_name:"",route:"",cycle:"",revenue:"",trip_status:"Upcoming"}),L=n.useMemo(()=>et(i),[i]),V=n.useMemo(()=>st(L),[L]),Be=n.useMemo(()=>Hs(L),[L]),ze=n.useMemo(()=>tt(V),[V]),qe=n.useMemo(()=>ds({start:Be,end:ze}),[Be,ze]),ce=n.useMemo(()=>ds({start:L,end:V}),[L,V]),U=n.useCallback(async()=>{Le(!0);try{const s=f(L,"yyyy-MM-dd"),t=f(V,"yyyy-MM-dd"),r=await S.collection("trip_logs").getFullList({filter:`date >= "${s} 00:00:00" && date <= "${t} 23:59:59"`,sort:"date",$autoCancel:!1}).catch(()=>[]),a=await S.collection("reminders").getFullList({filter:`reminder_date >= "${s} 00:00:00" && reminder_date <= "${t} 23:59:59"`,expand:"truck_id",$autoCancel:!1}).catch(()=>[]);let m=[];try{m=(await S.collection("payment_due_dates").getFullList({filter:`due_date >= "${s}" && due_date <= "${t}"`,expand:"card_id",$autoCancel:!1})).filter(k=>(k.full_payment_amount||0)>0).map(k=>({id:k.id,title:`CC Statement Due: ${k.expand?.card_id?.card_name||"Credit Card"}`,amount:k.full_payment_amount||k.minimum_amount_due||0,date:Ws(k.due_date),type:"Credit Card Dues",status:k.status||"Unpaid",cardId:k.card_id}))}catch(R){console.warn("Could not load card due dates:",R.message)}const d=await S.collection("trucks").getFullList({sort:"truck_number",$autoCancel:!1}).catch(()=>[]),C=Gs(d),l=await S.collection("maintenance_problems").getFullList({$autoCancel:!1}).catch(()=>[]),O=await S.collection("maintenance_schedules").getFullList({$autoCancel:!1}).catch(()=>[]),j=await S.collection("maintenance_logs").getFullList({$autoCancel:!1}).catch(()=>[]);A(r),is(a),cs(m),xs(C),ms(l),us(O),ps(j);
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
}catch(e){console.warn("Local calendar build warning:",e)}}catch(s){console.error("Failed to fetch calendar data:",s),Y.error("Could not load calendar events")}finally{Le(!1)}},[L,V]);n.useEffect(()=>{U()},[U]);const Qe=s=>{
    const t=ne.toLowerCase().trim(),r=z?b.filter(d=>!d.date||!Ce(new Date(d.date.replace(" ","T")),s)?!1:t?(d.route||"").toLowerCase().includes(t)||(d.truck_number||"").toLowerCase().includes(t)||(d.driver_name||"").toLowerCase().includes(t):!0):[],a=q?T.filter(d=>!d.reminder_date||!Ce(new Date(d.reminder_date),s)?!1:t?(d.title||"").toLowerCase().includes(t)||(d.description||"").toLowerCase().includes(t):!0):[],m=Q?E.filter(d=>!d.date||!Ce(d.date,s)?!1:t?(d.title||"").toLowerCase().includes(t):!0):[];
    const dayStr=(s instanceof Date?f(s,"yyyy-MM-dd"):String(s).substring(0,10));
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
  },P=s=>{if(!s)return"";if(s instanceof Date)return f(s,"yyyy-MM-dd");try{const t=typeof s=="string"?s.replace(" ","T"):String(s),r=new Date(t);return isNaN(r.getTime())?String(s).substring(0,10):f(r,"yyyy-MM-dd")}catch{return String(s).substring(0,10)}},F=n.useCallback((s,t)=>{const r=f(t,"yyyy-MM-dd"),a=(s.truck_number||"").trim().toLowerCase(),m=_e.find(l=>{if(!(l.truck_id===s.id||l.truck_id===s.truck_number||l.expand?.truck_id&&(l.expand.truck_id.truck_number||"").toLowerCase()===a))return!1;const j=P(l.date_reported);if(!j||j>r)return!1;const R=P(l.date_solved);return l.status!=="Solved"&&l.status!=="Resolved"||R&&R>r});if(m)return{status:"breakdown",color:"#ef4444",badgeColor:"bg-rose-500/15 text-rose-400 border-rose-500/30",label:"Breakdown",details:`Breakdown reported: ${m.description||m.problem_type||"Active vehicle repair issue"}`,raw:m,type:"breakdown"};const d=De.find(l=>l.vehicle_id===s.id||l.vehicle_id===s.truck_number||l.expand?.vehicle_id&&(l.expand.vehicle_id.truck_number||"").toLowerCase()===a?P(l.next_maintenance_date||l.scheduled_date)===r&&l.status!=="Completed":!1)||Te.find(l=>l.truck_id===s.id||l.truck_id===s.truck_number||l.expand?.truck_id&&(l.expand.truck_id.truck_number||"").toLowerCase()===a?P(l.date)===r:!1);if(d)return{status:"maintenance",color:"#f59e0b",badgeColor:"bg-amber-500/15 text-amber-400 border-amber-500/30",label:"Maintenance",details:`Maintenance: ${d.notes||d.maintenance_type||d.service_type||"Scheduled Fleet Service"}`,raw:d,type:"maintenance"};const C=b.find(l=>{if((l.truck_number||"").trim().toLowerCase()!==a)return!1;const j=P(l.date);if(j===r)return!0;if(l.end_date){const R=P(l.end_date);if(j&&R&&r>=j&&r<=R)return!0}return!1});if(C){const l=C.trip_status||"Dispatched",O=l.toLowerCase()==="delivered"||l.toLowerCase()==="completed",j=l.toLowerCase()==="in transit";return{status:"booked",color:j?"#4f46e5":"#2563eb",badgeColor:"bg-blue-500/15 text-blue-400 border-blue-500/30",label:O?"Trip Delivered":j?"In Transit":"Trip Booked",details:`Route: ${C.route||"Shipment"} · Driver: ${C.driver_name||"Assigned"} · Status: ${l}`,trip:C,type:"trip"}}return(s.status||"").toLowerCase()==="inactive"||(s.status||"").toLowerCase()==="suspended"?{status:"idle",color:"#64748b",badgeColor:"bg-slate-500/15 text-slate-400 border-slate-500/30",label:"Off-Duty / Inactive",details:"Truck marked inactive in fleet register",type:"inactive"}:{status:"available",color:"#10b981",badgeColor:"bg-emerald-500/15 text-emerald-400 border-emerald-500/30",label:"Available / Standby",details:"Operational vehicle ready for dispatches & bookings",type:"available"}},[b,_e,De,Te]),Ds=n.useCallback(s=>{let t=0,r=0,a=0,m=0,d=0;return B.forEach(C=>{const l=F(C,s);l.status==="available"?t++:l.status==="booked"?r++:l.status==="maintenance"?a++:l.status==="breakdown"?m++:l.status==="idle"&&d++}),{availableCount:t,bookedCount:r,maintenanceCount:a,breakdownCount:m,idleCount:d}},[B,F]),Ve=s=>{const t=B.map(r=>{const a=F(r,s);return{...r,solvedStatus:a.status,solvedDetails:a.details,solvedBadge:a.badgeColor,solvedLabel:a.label,solvedTrip:a.trip}});Ns({day:s,trucks:t}),le(!0)},Ts=(s,t)=>{const r=F(s,t);ys({truck:s,day:t,statusInfo:r,trip:r.trip}),de(!0)},Ue=(s,t="")=>{M({date:f(s,"yyyy-MM-dd"),truck_number:t,driver_name:"",route:"",cycle:"",revenue:"",trip_status:"Upcoming"}),le(!1),de(!1),ie(!0)},Ms=async s=>{if(s.preventDefault(),!g.truck_number||!g.date){Y.error("Truck number and date are required");return}Ee(!0);try{await S.collection("trip_logs").create({date:new Date(g.date).toISOString(),truck_number:g.truck_number,driver_name:g.driver_name,route:g.route,cycle:g.cycle,revenue:parseFloat(g.revenue)||0,trip_status:g.trip_status,client_payment_status:"pending"},{$autoCancel:!1}),Y.success("Trip log created successfully!"),ie(!1),U()}catch(t){console.error("Quick add trip error:",t),Y.error(t.message||"Failed to create trip log")}finally{Ee(!1)}},Pe=n.useMemo(()=>B.filter(s=>{const t=Ne.toLowerCase().trim();if(t){const r=`#${s.sequential_number}`.toLowerCase(),a=`${s.sequential_number}`;if(!((s.truck_number||"").toLowerCase().includes(t)||(s.truck_name||"").toLowerCase().includes(t)||r.includes(t)||a===t))return!1}return!(K!=="all"&&!ce.some(a=>F(s,a).status===K))}),[B,Ne,K,ce,F]),ye=n.useMemo(()=>{const s=[],t=ne.toLowerCase().trim();return z&&b.forEach(r=>{if(!r.date)return;const a=new Date(r.date.replace(" ","T"));t&&!(r.route||"").toLowerCase().includes(t)&&!(r.truck_number||"").toLowerCase().includes(t)&&!(r.driver_name||"").toLowerCase().includes(t)||s.push({id:r.id,date:a,type:"trip",title:r.route||"Dispatched Shipment",sub:`Truck: ${r.truck_number||"N/A"} · Driver: ${r.driver_name||"N/A"}`,status:r.trip_status||"Dispatched",raw:r})}),q&&T.forEach(r=>{if(!r.reminder_date)return;const a=new Date(r.reminder_date);t&&!(r.title||"").toLowerCase().includes(t)&&!(r.description||"").toLowerCase().includes(t)||s.push({id:r.id,date:a,type:"reminder",title:r.title,sub:r.description,status:r.status||"Pending",raw:r})}),Q&&E.forEach(r=>{r.date&&(t&&!(r.title||"").toLowerCase().includes(t)||s.push({id:r.id,date:r.date,type:"bill",title:r.title,sub:`Amount Due: ₹${r.amount?.toLocaleString()}`,status:r.status||"Unpaid",raw:r}))}),s.sort((r,a)=>r.date-a.date)},[b,T,E,z,q,Q,ne]),Ye=()=>h(Js(i,1)),He=()=>h(Xs(i,1)),We=()=>h(new Date),Ge=s=>{h(at(i,parseInt(s,10)))},Je=s=>{h(nt(i,parseInt(s,10)))},Xe=s=>{Cs(s),Z(!0)},Ls=async s=>{try{await S.collection("reminders").update(s,{status:"Completed",is_completed:!0},{$autoCancel:!1}),Y.success("Reminder marked as completed"),U()}catch{Y.error("Failed to complete reminder")}},v=Qe($e),Ke=v.trips.length+v.reminders.length+v.bills.length+(v.bizEvents||[]).length,Rs=n.useMemo(()=>E.reduce((s,t)=>s+(t.amount||0),0),[E]),As=n.useMemo(()=>T.filter(s=>s.status!=="Completed").length,[T]),Ze=["January","February","March","April","May","June","July","August","September","October","November","December"],es=[2025,2026,2027,2028];return e.jsxs("div",{className:"min-h-screen w-full bg-background/50 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5",children:[e.jsx(Fs,{children:e.jsx("title",{children:"Compliance & Operations Calendar | Jai Bhavani Cargo"})}),e.jsxs("div",{className:"flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/[0.04]",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[e.jsx(Os,{className:"w-4 h-4 text-primary"}),e.jsx("span",{className:"text-[10px] font-extrabold tracking-widest uppercase text-primary",children:"Enterprise Business Calendar"})]}),e.jsx("h1",{className:"text-2xl sm:text-3xl font-black tracking-tight text-foreground font-heading",children:"Unified Business Calendar"}),e.jsx("p",{className:"text-xs sm:text-sm text-muted-foreground mt-0.5",children:"One calendar containing: Truck service, Insurance renewal, Permit expiry, Driver joining, Contract renewal, Invoice due, EMI, Tax & Expected customer payment."})]}),e.jsx("div",{className:"flex items-center gap-2 self-stretch sm:self-auto flex-wrap",children:u==="events"&&e.jsxs(c,{onClick:()=>oe(!0),className:"rounded-xl text-xs gap-1.5 shadow-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none h-10",children:[e.jsx(ee,{className:"w-4 h-4"})," Add Reminder"]})})]}),e.jsxs("div",{className:"flex border-b border-border/40 p-1 bg-secondary/15 rounded-2xl max-w-md gap-1",children:[e.jsxs("button",{onClick:()=>N("events"),className:p("flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",u==="events"?"bg-primary text-primary-foreground shadow":"text-muted-foreground hover:text-foreground"),children:[e.jsx(se,{className:"w-4 h-4"})," Compliance Calendar"]}),e.jsxs("button",{onClick:()=>N("trucks"),className:p("flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",u==="trucks"?"bg-primary text-primary-foreground shadow":"text-muted-foreground hover:text-foreground"),children:[e.jsx(w,{className:"w-4 h-4"})," Truck Availability"]})]}),u==="events"?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none",children:BIZ_CATEGORIES.map(cat=>{
    const isAct=activeCategory===cat.id;
    const catCount=cat.id==="all"?(bizEvents||[]).length:(bizEvents||[]).filter(ev=>ev.category===cat.id).length;
    return e.jsxs("button",{key:cat.id,onClick:()=>setActiveCategory(cat.id),className:p("px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5",isAct?"bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/50":"bg-muted/30 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/60"),children:[e.jsx("span",{children:cat.icon}),e.jsx("span",{children:cat.label}),e.jsx("span",{className:"px-1.5 py-0.2 rounded-md bg-white/10 text-[10px] font-mono",children:catCount})]});
  })}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3",children:[e.jsx(_,{className:"bg-card border-emerald-500/25 bg-emerald-500/5 p-4 rounded-2xl shadow-soft",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider",children:"Scheduled Dispatches"}),e.jsxs("div",{className:"text-2xl font-black text-foreground mt-0.5",children:[b.length," Trips"]})]}),e.jsx("div",{className:"p-3 bg-emerald-500/10 rounded-xl text-emerald-400",children:e.jsx(w,{className:"w-6 h-6"})})]})}),e.jsx(_,{className:"bg-card border-amber-500/25 bg-amber-500/5 p-4 rounded-2xl shadow-soft",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] font-extrabold uppercase text-amber-400 tracking-wider",children:"Compliance Reminders"}),e.jsxs("div",{className:"text-2xl font-black text-foreground mt-0.5",children:[As," Pending"]})]}),e.jsx("div",{className:"p-3 bg-amber-500/10 rounded-xl text-amber-400",children:e.jsx(te,{className:"w-6 h-6"})})]})}),e.jsx(_,{className:"bg-card border-indigo-500/25 bg-indigo-500/5 p-4 rounded-2xl shadow-soft",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider",children:"Financial Due Dates"}),e.jsxs("div",{className:"text-2xl font-black text-foreground mt-0.5",children:["₹",Rs.toLocaleString()]})]}),e.jsx("div",{className:"p-3 bg-indigo-500/10 rounded-xl text-indigo-400",children:e.jsx(re,{className:"w-6 h-6"})})]})})]}),e.jsxs("div",{className:"bg-card border border-border/40 rounded-2xl p-4 space-y-3 shadow-sm",children:[e.jsxs("div",{className:"flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3",children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsxs("div",{className:"flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40",children:[e.jsx(c,{variant:"ghost",size:"icon",onClick:He,className:"h-8 w-8 rounded-lg",children:e.jsx(ss,{className:"w-4 h-4"})}),e.jsx(c,{variant:"ghost",size:"icon",onClick:Ye,className:"h-8 w-8 rounded-lg",children:e.jsx(ts,{className:"w-4 h-4"})})]}),e.jsxs(H,{value:i.getMonth().toString(),onValueChange:Ge,children:[e.jsx(W,{className:"w-36 h-9 rounded-xl text-xs font-bold bg-background",children:e.jsx(G,{})}),e.jsx(J,{children:Ze.map((s,t)=>e.jsx(X,{value:t.toString(),children:s},t))})]}),e.jsxs(H,{value:i.getFullYear().toString(),onValueChange:Je,children:[e.jsx(W,{className:"w-24 h-9 rounded-xl text-xs font-bold bg-background",children:e.jsx(G,{})}),e.jsx(J,{children:es.map(s=>e.jsx(X,{value:s.toString(),children:s},s))})]}),e.jsx(c,{variant:"outline",size:"sm",onClick:We,className:`rounded-xl text-xs h-9 px-3 font-bold ${D(i)?"border-primary text-primary":""}`,children:"Today"})]}),e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsxs("div",{className:"relative flex-1 md:w-52",children:[e.jsx(rs,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"}),e.jsx(I,{placeholder:"Search events, route...",value:ne,onChange:s=>hs(s.target.value),className:"pl-9 h-9 text-xs rounded-xl bg-background border-border/40"})]}),e.jsxs("div",{className:"flex items-center bg-muted/40 p-1 rounded-xl border border-border/40",children:[e.jsxs("button",{onClick:()=>Re("grid"),className:`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${fe==="grid"?"bg-primary text-primary-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`,children:[e.jsx(as,{className:"w-3.5 h-3.5"})," Grid"]}),e.jsxs("button",{onClick:()=>Re("agenda"),className:`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${fe==="agenda"?"bg-primary text-primary-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`,children:[e.jsx(Is,{className:"w-3.5 h-3.5"})," Agenda List"]})]})]})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2 pt-2 border-t border-border/30",children:[e.jsxs("span",{className:"text-[11px] text-muted-foreground font-bold uppercase tracking-wider mr-1 flex items-center gap-1",children:[e.jsx(ns,{className:"w-3 h-3"})," Show:"]}),e.jsxs(c,{size:"sm",variant:z?"default":"outline",onClick:()=>bs(!z),className:`rounded-xl text-xs h-7 px-3 gap-1.5 font-bold ${z?"bg-emerald-600 hover:bg-emerald-700 text-white":""}`,children:[e.jsx(w,{className:"w-3 h-3"})," Trips (",b.length,")"]}),e.jsxs(c,{size:"sm",variant:q?"default":"outline",onClick:()=>gs(!q),className:`rounded-xl text-xs h-7 px-3 gap-1.5 font-bold ${q?"bg-amber-600 hover:bg-amber-700 text-white":""}`,children:[e.jsx(te,{className:"w-3 h-3"})," Reminders (",T.length,")"]}),e.jsxs(c,{size:"sm",variant:Q?"default":"outline",onClick:()=>fs(!Q),className:`rounded-xl text-xs h-7 px-3 gap-1.5 font-bold ${Q?"bg-indigo-600 hover:bg-indigo-700 text-white":""}`,children:[e.jsx(re,{className:"w-3 h-3"})," CC Dues (",E.length,")"]})]})]}),fe==="grid"?e.jsx(_,{className:"border-border/40 bg-card overflow-hidden rounded-3xl shadow-lg",children:e.jsxs(we,{className:"p-0",children:[e.jsxs("div",{className:"grid grid-cols-7 border-b border-border/30 bg-muted/30 text-center font-extrabold text-[11px] py-2.5 text-muted-foreground uppercase tracking-widest",children:[e.jsx("div",{children:"Sun"}),e.jsx("div",{children:"Mon"}),e.jsx("div",{children:"Tue"}),e.jsx("div",{children:"Wed"}),e.jsx("div",{children:"Thu"}),e.jsx("div",{children:"Fri"}),e.jsx("div",{children:"Sat"})]}),e.jsx("div",{className:"grid grid-cols-7 bg-border/20 gap-[1px]",children:Me?Array.from({length:35}).map((s,t)=>e.jsxs("div",{className:"min-h-[90px] sm:min-h-[110px] bg-card p-2 flex flex-col justify-between",children:[e.jsx("div",{className:"w-6 h-6 rounded-md bg-muted/40 animate-pulse"}),e.jsx("div",{className:"space-y-1",children:e.jsx("div",{className:"h-4 w-full bg-muted/20 rounded animate-pulse"})})]},t)):qe.map((s,t)=>{const r=os(s,i),a=Qe(s),m=a.trips.length+a.reminders.length+a.bills.length+(a.bizEvents?a.bizEvents.length:0);return e.jsxs("div",{onClick:()=>Xe(s),className:p("min-h-[85px] sm:min-h-[115px] bg-card p-1.5 sm:p-2 flex flex-col justify-between transition-all duration-200 cursor-pointer relative hover:bg-primary/5 group",!r&&"opacity-35 bg-muted/5",D(s)&&"bg-primary/10 ring-2 ring-primary/40 z-10"),children:[e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsx("span",{className:p("text-xs font-black font-mono px-2 py-0.5 rounded-lg",D(s)?"bg-primary text-primary-foreground shadow-sm":"text-foreground/80"),children:f(s,"d")}),m>0&&e.jsx(ae,{variant:"secondary",className:"text-[10px] h-5 px-1.5 font-bold min-w-5 justify-center bg-primary/20 text-primary border-primary/30",children:m})]}),e.jsxs("div",{className:"hidden md:block space-y-1 mt-1.5 flex-grow overflow-y-hidden max-h-[75px]",children:[
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
  ,m>4&&e.jsxs("div",{className:"text-[9px] text-center text-muted-foreground font-extrabold",children:["+",m-4," more"]})]}),e.jsxs("div",{className:"flex md:hidden flex-wrap gap-1 justify-center mt-1",children:[a.trips.length>0&&e.jsxs("span",{className:"text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-black flex items-center gap-0.5",children:[e.jsx(w,{className:"w-2.5 h-2.5"})," ",a.trips.length]}),a.reminders.length>0&&e.jsxs("span",{className:"text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-black flex items-center gap-0.5",children:[e.jsx(te,{className:"w-2.5 h-2.5"})," ",a.reminders.length]}),a.bills.length>0&&e.jsxs("span",{className:"text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-black flex items-center gap-0.5",children:[e.jsx(re,{className:"w-2.5 h-2.5"})," ",a.bills.length]})]})]},t)})})]})}):e.jsx(_,{className:"border-border/40 bg-card rounded-3xl p-4 sm:p-6 shadow-lg",children:e.jsxs("div",{className:"space-y-3",children:[e.jsxs("h3",{className:"text-base font-extrabold text-foreground flex items-center gap-2",children:[e.jsx(ke,{className:"w-4 h-4 text-primary"})," Month Schedule Agenda (",ye.length," Events)"]}),ye.length===0?e.jsxs("div",{className:"py-12 text-center text-muted-foreground",children:[e.jsx(se,{className:"w-12 h-12 mx-auto opacity-20 mb-3"}),e.jsx("p",{className:"text-base font-bold text-foreground",children:"No matching events found in agenda."}),e.jsx("p",{className:"text-xs mt-1",children:"Try adjusting your filters or search keywords."})]}):e.jsx("div",{className:"space-y-2.5",children:ye.map(s=>e.jsxs("div",{onClick:()=>Xe(s.date),className:"p-3 sm:p-4 rounded-2xl border border-border/40 bg-background/80 hover:bg-muted/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3",children:[e.jsxs("div",{className:"flex items-start sm:items-center gap-3",children:[e.jsxs("div",{className:"min-w-16 text-center py-1 px-2.5 rounded-xl bg-card border border-border/50 shrink-0",children:[e.jsx("div",{className:"text-[10px] uppercase font-bold text-muted-foreground",children:f(s.date,"MMM")}),e.jsx("div",{className:"text-lg font-black text-foreground",children:f(s.date,"dd")})]}),e.jsxs("div",{className:"space-y-0.5",children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsx("span",{className:p("text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border",s.type==="trip"?"bg-emerald-500/10 text-emerald-400 border-emerald-500/20":s.type==="reminder"?"bg-amber-500/10 text-amber-400 border-amber-500/20":"bg-indigo-500/10 text-indigo-400 border-indigo-500/20"),children:s.type==="trip"?"Trip Dispatch":s.type==="reminder"?"Compliance Alert":"Credit Card Due"}),e.jsx("h4",{className:"text-sm font-bold text-foreground",children:s.title})]}),e.jsx("p",{className:"text-xs text-muted-foreground font-medium",children:s.sub})]})]}),e.jsxs("div",{className:"flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30",children:[e.jsx(ae,{variant:"outline",className:"text-[10px] font-bold uppercase",children:s.status}),e.jsxs(c,{variant:"ghost",size:"sm",className:"h-8 px-2.5 text-xs rounded-xl gap-1 text-primary",children:["View ",e.jsx($s,{className:"w-3.5 h-3.5"})]})]})]},`${s.type}-${s.id}`))})]})})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"bg-card border border-border/40 rounded-2xl p-4 space-y-3 shadow-sm",children:[e.jsxs("div",{className:"flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3",children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsxs("span",{className:"text-[11px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1 shrink-0",children:[e.jsx(ns,{className:"w-3 h-3"})," Status:"]}),[{id:"all",label:"All Fleet",dot:"bg-primary"},{id:"available",label:"Available",dot:"bg-emerald-500 border-emerald-600"},{id:"booked",label:"Trip Booked",dot:"bg-blue-600 border-blue-700"},{id:"maintenance",label:"Maintenance",dot:"bg-amber-500 border-amber-600"},{id:"breakdown",label:"Breakdown",dot:"bg-rose-500 border-rose-600"},{id:"idle",label:"Off-Duty",dot:"bg-slate-500 border-slate-600"}].map(s=>e.jsxs("button",{onClick:()=>Fe(s.id),className:p("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",K===s.id?"bg-primary text-primary-foreground border-primary font-bold shadow-sm scale-[1.02]":"bg-muted/30 text-foreground border-border/40 hover:bg-muted/70"),children:[e.jsx("span",{className:p("w-2.5 h-2.5 rounded-full shrink-0 border",s.dot)}),e.jsx("span",{children:s.label})]},s.id))]}),e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsxs("div",{className:"relative flex-1 md:w-52",children:[e.jsx(rs,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"}),e.jsx(I,{placeholder:"Search truck number...",value:Ne,onChange:s=>js(s.target.value),className:"pl-9 h-9 text-xs rounded-xl bg-background border-border/40"})]}),e.jsxs("div",{className:"flex items-center bg-muted/40 p-1 rounded-xl border border-border/40",children:[e.jsxs("button",{onClick:()=>Ae("matrix"),className:p("flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all",je==="matrix"?"bg-primary text-primary-foreground shadow-sm":"text-muted-foreground hover:text-foreground"),children:[e.jsx(as,{className:"w-3.5 h-3.5"})," Roster Grid"]}),e.jsxs("button",{onClick:()=>Ae("calendar"),className:p("flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all",je==="calendar"?"bg-primary text-primary-foreground shadow-sm":"text-muted-foreground hover:text-foreground"),children:[e.jsx(ke,{className:"w-3.5 h-3.5"})," Monthly Calendar"]})]})]})]}),e.jsxs("div",{className:"flex items-center gap-2 pt-2 border-t border-border/30 flex-wrap",children:[e.jsxs("div",{className:"flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40",children:[e.jsx(c,{variant:"ghost",size:"icon",onClick:He,className:"h-7 w-7 rounded-lg",children:e.jsx(ss,{className:"w-3.5 h-3.5"})}),e.jsx(c,{variant:"ghost",size:"icon",onClick:Ye,className:"h-7 w-7 rounded-lg",children:e.jsx(ts,{className:"w-3.5 h-3.5"})})]}),e.jsxs(H,{value:i.getMonth().toString(),onValueChange:Ge,children:[e.jsx(W,{className:"w-32 h-8 rounded-xl text-xs font-bold bg-background",children:e.jsx(G,{})}),e.jsx(J,{children:Ze.map((s,t)=>e.jsx(X,{value:t.toString(),children:s},t))})]}),e.jsxs(H,{value:i.getFullYear().toString(),onValueChange:Je,children:[e.jsx(W,{className:"w-20 h-8 rounded-xl text-xs font-bold bg-background",children:e.jsx(G,{})}),e.jsx(J,{children:es.map(s=>e.jsx(X,{value:s.toString(),children:s},s))})]}),e.jsx(c,{variant:"outline",size:"sm",onClick:We,className:p("rounded-xl text-xs h-8 px-3 font-bold",D(i)&&"border-primary text-primary"),children:"Today"})]})]}),Me?e.jsxs(_,{className:"border-border/40 bg-card rounded-3xl p-20 flex flex-col items-center justify-center gap-3",children:[e.jsx(ls,{className:"w-8 h-8 animate-spin text-primary"}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"Calculating fleet availability..."})]}):Pe.length===0?e.jsxs(_,{className:"border-border/40 bg-card rounded-3xl p-12 text-center text-muted-foreground",children:[e.jsx(w,{className:"w-12 h-12 opacity-20 mx-auto mb-3"}),e.jsx("p",{className:"text-lg font-bold text-foreground",children:"No matching trucks"}),e.jsx("p",{className:"text-sm mt-1",children:"Try changing your search term or status filter."}),K!=="all"&&e.jsx(c,{variant:"outline",size:"sm",onClick:()=>Fe("all"),className:"mt-3 text-xs",children:"Reset Filter"})]}):je==="matrix"?e.jsx(_,{className:"border-border/40 bg-card overflow-hidden rounded-3xl shadow-lg",children:e.jsx(we,{className:"p-0 overflow-x-auto",children:e.jsxs("table",{className:"w-full text-left border-collapse table-fixed min-w-[950px]",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-muted/40 border-b border-border/30",children:[e.jsx("th",{className:"w-[180px] p-3 text-[11px] font-black uppercase text-muted-foreground tracking-wider sticky left-0 bg-card z-10 border-r border-border/20",children:"Truck number"}),ce.map(s=>e.jsx("th",{onClick:()=>Ve(s),title:`Click to audit all trucks on ${f(s,"dd MMMM yyyy")}`,className:p("p-2 text-center text-[10px] font-mono border-r border-white/5 w-[32px] shrink-0 cursor-pointer hover:bg-primary/15 transition-colors",D(s)&&"bg-primary/10 text-primary font-black"),children:e.jsxs("div",{className:"flex flex-col items-center leading-none",children:[e.jsx("span",{className:"font-extrabold text-[12px]",children:f(s,"d")}),e.jsx("span",{className:"text-[8px] opacity-70 uppercase mt-0.5",children:f(s,"eeeeee")})]})},s.toISOString()))]})}),e.jsx("tbody",{children:Pe.map(s=>e.jsxs("tr",{className:"hover:bg-muted/10 border-b border-border/20 group",children:[e.jsxs("td",{className:"p-3 sticky left-0 bg-card font-mono font-bold text-xs text-foreground z-10 border-r border-border/20 flex flex-col justify-center min-h-[48px]",children:[e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsxs("span",{className:"px-1.5 py-0.5 rounded text-[10px] font-black bg-primary/10 text-primary border border-primary/20 shrink-0",children:["#",s.sequential_number]}),e.jsx("span",{className:"truncate",children:s.truck_number})]}),e.jsx("span",{className:"text-[9px] text-muted-foreground font-sans font-semibold mt-0.5",children:s.truck_name||"Fleet Asset"})]}),ce.map(t=>{const r=F(s,t);return e.jsx("td",{className:p("p-1 text-center border-r border-white/5 w-[32px] shrink-0 relative",D(t)&&"bg-primary/5"),children:e.jsx("button",{type:"button",onClick:()=>Ts(s,t),className:p("w-5 h-5 mx-auto rounded-full cursor-pointer transition-all border border-black/20 shadow-sm hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary block",D(t)&&"ring-1 ring-primary"),style:{backgroundColor:r.color},title:`${s.truck_number} (${f(t,"dd MMM")}): ${r.label}
${r.details}
Click to view details or book trip`})},t.toISOString())})]},s.id))})]})})}):e.jsx(_,{className:"border-border/40 bg-card overflow-hidden rounded-3xl shadow-lg",children:e.jsxs(we,{className:"p-0",children:[e.jsxs("div",{className:"grid grid-cols-7 border-b border-border/30 bg-muted/30 text-center font-extrabold text-[11px] py-2.5 text-muted-foreground uppercase tracking-widest",children:[e.jsx("div",{children:"Sun"}),e.jsx("div",{children:"Mon"}),e.jsx("div",{children:"Tue"}),e.jsx("div",{children:"Wed"}),e.jsx("div",{children:"Thu"}),e.jsx("div",{children:"Fri"}),e.jsx("div",{children:"Sat"})]}),e.jsx("div",{className:"grid grid-cols-7 bg-border/20 gap-[1px]",children:qe.map((s,t)=>{const r=os(s,i),a=Ds(s);return e.jsxs("div",{onClick:()=>Ve(s),className:p("min-h-[85px] sm:min-h-[110px] bg-card p-1.5 sm:p-2 flex flex-col justify-between transition-all duration-200 cursor-pointer relative hover:bg-primary/5 group",!r&&"opacity-35 bg-muted/5",D(s)&&"bg-primary/10 ring-2 ring-primary/40 z-10"),children:[e.jsx("div",{className:"flex justify-between items-start",children:e.jsx("span",{className:p("text-xs font-black font-mono px-2 py-0.5 rounded-lg",D(s)?"bg-primary text-primary-foreground shadow-sm":"text-foreground/80"),children:f(s,"d")})}),e.jsxs("div",{className:"flex flex-col gap-0.5 mt-2",children:[e.jsxs("div",{className:"flex items-center gap-1 text-[9px] font-bold text-emerald-500",children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"}),e.jsxs("span",{children:[a.availableCount," Available"]})]}),a.bookedCount>0&&e.jsxs("div",{className:"flex items-center gap-1 text-[9px] font-bold text-blue-400",children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"}),e.jsxs("span",{children:[a.bookedCount," Booked"]})]}),a.maintenanceCount>0&&e.jsxs("div",{className:"flex items-center gap-1 text-[9px] font-bold text-amber-400",children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"}),e.jsxs("span",{children:[a.maintenanceCount," Maint"]})]}),a.breakdownCount>0&&e.jsxs("div",{className:"flex items-center gap-1 text-[9px] font-bold text-rose-400",children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"}),e.jsxs("span",{children:[a.breakdownCount," Break"]})]}),a.idleCount>0&&e.jsxs("div",{className:"flex items-center gap-1 text-[9px] font-bold text-slate-400",children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0"}),e.jsxs("span",{children:[a.idleCount," Off-Duty"]})]})]})]},t)})})]})})]}),e.jsx(xe,{open:Ss,onOpenChange:Z,children:e.jsxs(me,{className:"rounded-3xl max-w-lg bg-card border border-border p-6 shadow-2xl",children:[e.jsx(ue,{className:"pb-3 border-b border-border/30",children:e.jsx("div",{className:"flex items-center justify-between",children:e.jsxs("div",{children:[e.jsxs(pe,{className:"font-heading text-xl font-extrabold text-foreground flex items-center gap-2",children:[e.jsx(ke,{className:"w-5 h-5 text-primary"}),f($e,"EEEE, MMMM dd, yyyy")]}),e.jsxs(he,{className:"text-xs mt-0.5",children:[Ke," total operations & compliance events logged for this date."]})]})})}),e.jsx("div",{className:"py-3 space-y-4 max-h-[420px] overflow-y-auto",children:Ke===0?e.jsxs("div",{className:"py-12 text-center text-muted-foreground",children:[e.jsx(se,{className:"w-12 h-12 mx-auto opacity-20 mb-3"}),e.jsx("p",{className:"text-sm font-bold text-foreground",children:"No events scheduled on this day."}),e.jsx("p",{className:"text-xs mt-1",children:'Click "Add Reminder" to log an alert for this date.'})]}):e.jsxs("div",{className:"space-y-4",children:[
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
    v.trips.length>0&&e.jsxs("div",{className:"space-y-2",children:[e.jsxs("h4",{className:"text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5",children:[e.jsx(w,{className:"w-4 h-4"})," Dispatched Shipments (",v.trips.length,")"]}),v.trips.map(s=>e.jsxs("div",{className:"p-3.5 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-black text-foreground",children:s.route}),e.jsxs("p",{className:"text-xs text-muted-foreground mt-0.5 font-medium",children:["Vehicle: ",e.jsx("strong",{className:"text-foreground",children:s.truck_number})," · Driver: ",e.jsx("strong",{className:"text-foreground",children:s.driver_name||"N/A"})]})]}),e.jsx("span",{className:"text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black uppercase self-start sm:self-center",children:s.trip_status||"Dispatched"})]},s.id))]}),v.reminders.length>0&&e.jsxs("div",{className:"space-y-2",children:[e.jsxs("h4",{className:"text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5",children:[e.jsx(te,{className:"w-4 h-4"})," Compliance & Renewal Alerts (",v.reminders.length,")"]}),v.reminders.map(s=>e.jsxs("div",{className:"p-3.5 bg-amber-500/5 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row sm:items-start justify-between gap-3",children:[e.jsxs("div",{className:"space-y-1 flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsx("p",{className:"text-sm font-black text-foreground",children:s.title}),s.status==="Completed"&&e.jsx(ae,{className:"bg-emerald-500/10 text-emerald-400 border-0 h-4 text-[9px] font-extrabold",children:"Completed"})]}),e.jsx("p",{className:"text-xs text-muted-foreground font-medium leading-normal",children:s.description})]}),s.status!=="Completed"?e.jsxs("div",{className:"flex items-center gap-1.5 shrink-0 self-end sm:self-center",children:[e.jsxs(c,{variant:"ghost",size:"sm",onClick:()=>{Z(!1),Ie(s)},className:"h-8 px-2.5 text-xs rounded-xl",children:[e.jsx(Es,{className:"w-3.5 h-3.5"})," Details"]}),e.jsxs(c,{size:"sm",onClick:()=>Ls(s.id),className:"h-8 px-3 text-xs rounded-xl gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold",children:[e.jsx(Bs,{className:"w-3.5 h-3.5"})," Resolve"]})]}):e.jsx("div",{className:"p-1.5 bg-emerald-500/15 text-emerald-400 rounded-xl shrink-0",children:e.jsx(zs,{className:"w-5 h-5"})})]},s.id))]}),v.bills.length>0&&e.jsxs("div",{className:"space-y-2",children:[e.jsxs("h4",{className:"text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5",children:[e.jsx(re,{className:"w-4 h-4"})," Credit Card Due Dates (",v.bills.length,")"]}),v.bills.map(s=>e.jsxs("div",{className:"p-3.5 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 flex items-center justify-between gap-3",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-black text-foreground",children:s.title}),e.jsxs("p",{className:"text-xs text-muted-foreground mt-0.5 font-medium",children:["Amount Due: ",e.jsxs("strong",{className:"text-rose-400 font-mono",children:["₹",s.amount.toLocaleString()]})]})]}),e.jsx("span",{className:p("text-[10px] font-black px-2.5 py-1 rounded-lg uppercase border",s.status==="Paid"?"bg-emerald-500/10 text-emerald-400 border-emerald-500/20":"bg-rose-500/10 text-rose-400 border-rose-500/20"),children:s.status})]},s.id))]})]})}),e.jsxs(be,{className:"pt-3 border-t border-border/30 flex justify-between items-center flex-wrap gap-2",children:[e.jsxs(c,{size:"sm",onClick:()=>{Z(!1),oe(!0)},className:"rounded-xl text-xs gap-1 font-bold bg-primary text-primary-foreground",children:[e.jsx(ee,{className:"w-3.5 h-3.5"})," Add Reminder"]}),e.jsx(c,{variant:"ghost",className:"rounded-xl text-xs font-bold",onClick:()=>Z(!1),children:"Close"})]})]})}),e.jsx(xe,{open:ks,onOpenChange:de,children:e.jsxs(me,{className:"rounded-3xl max-w-lg bg-card border border-border p-6 shadow-2xl overflow-y-auto max-h-[85vh]",children:[e.jsxs(ue,{className:"pb-3 border-b border-border/30",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("span",{className:"px-2 py-0.5 rounded-lg text-xs font-black bg-primary/10 text-primary border border-primary/20",children:["#",o?.truck?.sequential_number||"1"]}),e.jsx(pe,{className:"font-heading text-lg font-black text-foreground",children:o?.truck?.truck_number})]}),e.jsx("span",{className:"text-xs text-muted-foreground font-semibold",children:o?.truck?.truck_name||"Fleet Truck"})]}),e.jsxs(he,{className:"text-xs flex items-center gap-1 mt-1 text-muted-foreground font-medium",children:[e.jsx(se,{className:"w-3.5 h-3.5 text-primary"}),o?.day&&f(o.day,"EEEE, dd MMMM yyyy")]})]}),e.jsxs("div",{className:"py-4 space-y-4",children:[e.jsxs("div",{className:p("p-4 rounded-2xl border flex items-start gap-3",o?.statusInfo?.status==="available"?"bg-emerald-500/10 border-emerald-500/30":o?.statusInfo?.status==="booked"?"bg-blue-500/10 border-blue-500/30":o?.statusInfo?.status==="maintenance"?"bg-amber-500/10 border-amber-500/30":o?.statusInfo?.status==="breakdown"?"bg-rose-500/10 border-rose-500/30":"bg-slate-500/10 border-slate-500/30"),children:[e.jsx("div",{className:"w-4 h-4 rounded-full mt-0.5 shrink-0",style:{backgroundColor:o?.statusInfo?.color||"#10b981"}}),e.jsxs("div",{className:"space-y-1 flex-1",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("h4",{className:"font-extrabold text-sm text-foreground",children:o?.statusInfo?.label||"Available"}),e.jsx(ae,{variant:"outline",className:p("text-[10px] font-bold uppercase",o?.statusInfo?.badgeColor),children:o?.statusInfo?.status})]}),e.jsx("p",{className:"text-xs text-muted-foreground font-medium",children:o?.statusInfo?.details})]})]}),o?.trip&&e.jsxs("div",{className:"p-4 rounded-2xl bg-muted/40 border border-border/40 space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-border/20 pb-2",children:[e.jsxs("span",{className:"text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5",children:[e.jsx(w,{className:"w-3.5 h-3.5 text-primary"})," Trip Dispatch Details"]}),e.jsx(ae,{className:"bg-primary text-primary-foreground text-[10px] font-bold uppercase",children:o.trip.trip_status||"Delivered"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3 text-xs",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] uppercase font-bold text-muted-foreground block",children:"Route"}),e.jsx("span",{className:"font-bold text-foreground font-mono",children:o.trip.route||"Local Route"})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] uppercase font-bold text-muted-foreground block",children:"Assigned Driver"}),e.jsx("span",{className:"font-bold text-foreground",children:o.trip.driver_name||"Driver Assigned"})]}),o.trip.revenue>0&&e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] uppercase font-bold text-muted-foreground block",children:"Freight Revenue"}),e.jsxs("span",{className:"font-bold text-emerald-500 font-mono",children:["₹",o.trip.revenue.toLocaleString()]})]}),o.trip.cycle&&e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] uppercase font-bold text-muted-foreground block",children:"Trip Cycle"}),e.jsx("span",{className:"font-bold text-foreground",children:o.trip.cycle})]})]})]})]}),e.jsxs(be,{className:"flex gap-2 flex-wrap",children:[e.jsxs(c,{variant:"outline",className:"rounded-xl flex-1 font-bold gap-1.5 border-primary text-primary hover:bg-primary/10 text-xs",onClick:()=>{o?.day&&o?.truck?.truck_number&&Ue(o.day,o.truck.truck_number)},children:[e.jsx(ee,{className:"w-3.5 h-3.5"})," Book / Log Trip for This Truck"]}),e.jsx(c,{className:"rounded-xl flex-1 font-bold shadow-sm text-xs",onClick:()=>de(!1),children:"Done"})]})]})}),e.jsx(xe,{open:vs,onOpenChange:le,children:e.jsxs(me,{className:"rounded-3xl max-w-xl bg-card border border-border p-6 shadow-2xl overflow-y-auto max-h-[85vh]",children:[e.jsxs(ue,{className:"pb-3 border-b border-border/30",children:[e.jsxs(pe,{className:"font-heading text-lg font-black text-foreground flex items-center gap-2",children:[e.jsx(se,{className:"w-5 h-5 text-primary"}),"Fleet Availability: ",x?.day&&f(x.day,"eeee, dd MMMM yyyy")]}),e.jsx(he,{className:"text-xs",children:"Audit operational dispatches and maintenance allocations for every vehicle in the fleet."})]}),e.jsxs("div",{className:"py-4 space-y-5",children:[x?.trucks.filter(s=>s.solvedStatus==="breakdown").length>0&&e.jsxs("div",{className:"space-y-2",children:[e.jsxs("h4",{className:"text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5",children:[e.jsx(qs,{className:"w-4 h-4"})," Breakdown / Repair Required (",x.trucks.filter(s=>s.solvedStatus==="breakdown").length,")"]}),e.jsx("div",{className:"grid gap-2",children:x.trucks.filter(s=>s.solvedStatus==="breakdown").map(s=>e.jsxs("div",{className:"p-3 bg-rose-500/5 rounded-xl border border-rose-500/20 text-xs",children:[e.jsxs("div",{className:"flex justify-between items-center font-bold",children:[e.jsx("span",{className:"font-mono text-sm text-rose-400",children:s.truck_number}),e.jsx("span",{className:"text-muted-foreground",children:s.truck_name||"Fleet Truck"})]}),e.jsx("p",{className:"text-muted-foreground mt-1.5 font-medium",children:s.solvedDetails})]},s.id))})]}),x?.trucks.filter(s=>s.solvedStatus==="maintenance").length>0&&e.jsxs("div",{className:"space-y-2",children:[e.jsxs("h4",{className:"text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5",children:[e.jsx(Qs,{className:"w-4 h-4"})," Under Scheduled Maintenance (",x.trucks.filter(s=>s.solvedStatus==="maintenance").length,")"]}),e.jsx("div",{className:"grid gap-2",children:x.trucks.filter(s=>s.solvedStatus==="maintenance").map(s=>e.jsxs("div",{className:"p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 text-xs",children:[e.jsxs("div",{className:"flex justify-between items-center font-bold",children:[e.jsx("span",{className:"font-mono text-sm text-amber-400",children:s.truck_number}),e.jsx("span",{className:"text-muted-foreground",children:s.truck_name||"Fleet Truck"})]}),e.jsx("p",{className:"text-muted-foreground mt-1.5 font-medium",children:s.solvedDetails})]},s.id))})]}),x?.trucks.filter(s=>s.solvedStatus==="booked").length>0&&e.jsxs("div",{className:"space-y-2",children:[e.jsxs("h4",{className:"text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5",children:[e.jsx(w,{className:"w-4 h-4"})," Dispatched / Booked Trips (",x.trucks.filter(s=>s.solvedStatus==="booked").length,")"]}),e.jsx("div",{className:"grid gap-2",children:x.trucks.filter(s=>s.solvedStatus==="booked").map(s=>e.jsxs("div",{className:"p-3 bg-blue-500/5 rounded-xl border border-blue-500/20 text-xs",children:[e.jsxs("div",{className:"flex justify-between items-center font-bold",children:[e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("span",{className:"font-mono text-sm text-blue-400",children:s.truck_number}),e.jsx("span",{className:"text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20",children:s.solvedLabel})]}),e.jsx("span",{className:"text-muted-foreground",children:s.truck_name||"Fleet Truck"})]}),e.jsx("p",{className:"text-muted-foreground mt-1.5 font-medium",children:s.solvedDetails})]},s.id))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("h4",{className:"text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5",children:[e.jsx(Vs,{className:"w-4 h-4"})," Available / Ready for Dispatch (",x?.trucks.filter(s=>s.solvedStatus==="available").length||0,")"]}),x?.trucks.filter(s=>s.solvedStatus==="available").length===0?e.jsx("p",{className:"text-xs text-rose-400 font-medium italic pl-1",children:"No operational trucks are available on this day."}):e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-2",children:x?.trucks.filter(s=>s.solvedStatus==="available").map(s=>e.jsxs("div",{className:"p-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-xs flex justify-between items-center",children:[e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("span",{className:"font-mono font-bold text-foreground",children:s.truck_number}),e.jsx("span",{className:"text-[10px] text-muted-foreground",children:s.truck_name})]}),e.jsx("span",{className:"text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase",children:"Ready"})]},s.id))})]}),x?.trucks.filter(s=>s.solvedStatus==="idle").length>0&&e.jsxs("div",{className:"space-y-2",children:[e.jsxs("h4",{className:"text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5",children:[e.jsx(Us,{className:"w-4 h-4"})," Off-Duty / Inactive (",x.trucks.filter(s=>s.solvedStatus==="idle").length,")"]}),e.jsx("div",{className:"grid grid-cols-2 gap-2",children:x.trucks.filter(s=>s.solvedStatus==="idle").map(s=>e.jsxs("div",{className:"p-2.5 bg-slate-500/5 rounded-xl border border-slate-500/10 text-xs flex justify-between items-center",children:[e.jsx("span",{className:"font-mono font-bold text-foreground",children:s.truck_number}),e.jsx("span",{className:"text-[10px] text-slate-400 font-bold bg-slate-500/10 px-1.5 py-0.5 rounded uppercase",children:"Off-Duty"})]},s.id))})]})]}),e.jsxs(be,{className:"flex gap-2",children:[e.jsxs(c,{variant:"outline",className:"rounded-xl flex-1 font-bold gap-1.5 border-primary text-primary hover:bg-primary/10",onClick:()=>x?.day&&Ue(x.day),children:[e.jsx(ee,{className:"w-4 h-4"})," Add Trip on This Day"]}),e.jsx(c,{className:"rounded-xl flex-1 font-bold shadow-sm",onClick:()=>le(!1),children:"Close Audit"})]})]})}),e.jsx(Ks,{isOpen:ws,onClose:()=>oe(!1),onSuccess:()=>{oe(!1),U()}}),e.jsx(Zs,{isOpen:!!Oe,onClose:()=>Ie(null),reminder:Oe,onRefresh:U}),e.jsx(xe,{open:_s,onOpenChange:ie,children:e.jsxs(me,{className:"rounded-3xl max-w-lg bg-card border border-border p-6 shadow-2xl",children:[e.jsxs(ue,{className:"pb-3 border-b border-border/30",children:[e.jsxs(pe,{className:"font-heading text-lg font-black text-foreground flex items-center gap-2",children:[e.jsx(ee,{className:"w-5 h-5 text-primary"})," Add New Trip Log"]}),e.jsx(he,{className:"text-xs",children:"Quickly log a trip dispatch. Date and truck are pre-filled from the selected day."})]}),e.jsxs("form",{onSubmit:Ms,className:"py-4 space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsx($,{className:"text-xs font-bold uppercase text-muted-foreground tracking-wider",children:"Date *"}),e.jsx(I,{type:"date",value:g.date,onChange:s=>M(t=>({...t,date:s.target.value})),className:"h-9 text-xs rounded-xl bg-background border-border/40 font-mono",required:!0})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx($,{className:"text-xs font-bold uppercase text-muted-foreground tracking-wider",children:"Truck *"}),e.jsxs(H,{value:g.truck_number,onValueChange:s=>M(t=>({...t,truck_number:s})),children:[e.jsx(W,{className:"h-9 text-xs rounded-xl bg-background border-border/40",children:e.jsx(G,{placeholder:"Select truck"})}),e.jsx(J,{children:B.map(s=>e.jsxs(X,{value:s.truck_number,children:["#",s.sequential_number," • ",s.truck_number," ",s.truck_name?`(${s.truck_name})`:""]},s.id))})]})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsx($,{className:"text-xs font-bold uppercase text-muted-foreground tracking-wider",children:"Driver Name"}),e.jsx(I,{placeholder:"e.g. Raju",value:g.driver_name,onChange:s=>M(t=>({...t,driver_name:s.target.value})),className:"h-9 text-xs rounded-xl bg-background border-border/40"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx($,{className:"text-xs font-bold uppercase text-muted-foreground tracking-wider",children:"Route"}),e.jsx(I,{placeholder:"e.g. Hyd → Mumbai",value:g.route,onChange:s=>M(t=>({...t,route:s.target.value})),className:"h-9 text-xs rounded-xl bg-background border-border/40"})]})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-3",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsx($,{className:"text-xs font-bold uppercase text-muted-foreground tracking-wider",children:"Cycle"}),e.jsx(I,{placeholder:"e.g. Full",value:g.cycle,onChange:s=>M(t=>({...t,cycle:s.target.value})),className:"h-9 text-xs rounded-xl bg-background border-border/40"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx($,{className:"text-xs font-bold uppercase text-muted-foreground tracking-wider",children:"Revenue (₹)"}),e.jsx(I,{type:"number",min:"0",placeholder:"0",value:g.revenue,onChange:s=>M(t=>({...t,revenue:s.target.value})),className:"h-9 text-xs rounded-xl bg-background border-border/40 font-mono"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx($,{className:"text-xs font-bold uppercase text-muted-foreground tracking-wider",children:"Status"}),e.jsxs(H,{value:g.trip_status,onValueChange:s=>M(t=>({...t,trip_status:s})),children:[e.jsx(W,{className:"h-9 text-xs rounded-xl bg-background border-border/40",children:e.jsx(G,{})}),e.jsx(J,{children:["Upcoming","In Transit","Delivered","Cancelled"].map(s=>e.jsx(X,{value:s,children:s},s))})]})]})]}),e.jsxs(be,{className:"pt-2 border-t border-border/30 flex gap-2",children:[e.jsx(c,{type:"button",variant:"ghost",className:"rounded-xl flex-1 font-bold",onClick:()=>ie(!1),disabled:ve,children:"Cancel"}),e.jsx(c,{type:"submit",disabled:ve,className:"rounded-xl flex-1 font-bold bg-primary text-primary-foreground gap-1.5",children:ve?e.jsxs(e.Fragment,{children:[e.jsx(ls,{className:"w-3.5 h-3.5 animate-spin"})," Saving..."]}):e.jsxs(e.Fragment,{children:[e.jsx(w,{className:"w-3.5 h-3.5"})," Log Trip"]})})]})]})]})})]})}export{ft as default};
