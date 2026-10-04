const fs = require('fs');
const path = require('path');
const babel = require('@babel/parser');

console.log('🚀 Building Calendar Expected Payments Fix...');

// ============================================================================
// PART 1: UPDATE apps/api/src/services/businessCalendarService.js
// ============================================================================
const apiServicePath = path.resolve(__dirname, '../apps/api/src/services/businessCalendarService.js');
let apiSrc = fs.readFileSync(apiServicePath, 'utf8');

// 1a. Increase trip_logs fetch limit from 50 to 500
apiSrc = apiSrc.replace(
  "safeFetch('trip_logs', '', '-date', 50),",
  "safeFetch('trip_logs', '', '-date', 500),"
);

// 1b. Replace stream 6 (unpaidTrips) and stream 9 (deliveredTrips)
const oldApiStream6And9 = `  // 6. INVOICE DUE
  const unpaidTrips = (tripLogs || []).filter(t => t.client_payment_status !== 'received' && Number(t.revenue || 0) > 0);
  unpaidTrips.slice(0, 15).forEach(t => {
    const baseDate = t.date ? new Date(t.date) : new Date();
    const dueDate = new Date(baseDate.getTime() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    events.push({
      id: \`inv_due_\${t.id}\`,
      category: 'invoice_due',
      categoryLabel: 'Invoice Due',
      title: \`🧾 Invoice Due: \${t.route || 'Freight Invoice'} - ₹\${Number(t.revenue || 0).toLocaleString('en-IN')}\`,
      date: dueDate,
      amount: Number(t.revenue || 0),
      partyName: 'AMAZON TRANSPORTATION SERVICES',
      truckNumber: t.truck_number || 'TG12U2637',
      status: 'Upcoming',
      description: \`Freight invoice settlement due for Trip #\${t.trip_id || t.id.slice(0, 8)} (\${t.route}).\`,
      priority: 'high',
      icon: 'receipt',
      color: 'rose'
    });
  });

  (dueDates || []).forEach(dd => {
    if (dd.due_date) {
      events.push({
        id: \`pdd_\${dd.id}\`,
        category: 'invoice_due',
        categoryLabel: 'Invoice Due',
        title: \`🧾 Payment Due: \${dd.title || 'Corporate Statement'}\`,
        date: toYMD(dd.due_date),
        amount: dd.full_payment_amount || dd.amount || 0,
        status: dd.status || 'Unpaid',
        description: dd.notes || 'Statement invoice payment due.',
        priority: 'high',
        icon: 'receipt',
        color: 'rose'
      });
    }
  });`;

const newApiStream6 = `  // 6. INVOICE DUE & 9. EXPECTED CUSTOMER PAYMENT (Consolidated B2B Settlement Cycles)
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
        const key = \`\${y}_\${String(m).padStart(2, '0')}_H\${half}\`;
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
        const cycleLabel = grp.half === 1 ? \`\${mName} 01–15\` : \`\${mName} 16–\${cycleEndDate.getDate()}\`;
        const netAmount = Math.round(grp.totalGross * (1 - tdsPct / 100));
        const isOverdue = dueYMD < todayStr;

        // Stream 6: Tax Invoice Due for this completed cycle
        events.push({
          id: \`inv_due_\${cid}_\${cycleKey}\`,
          category: 'invoice_due',
          categoryLabel: 'Invoice Due',
          icon: '🧾',
          title: \`🧾 Invoice Due: \${clientName} (\${cycleLabel}) - ₹\${grp.totalGross.toLocaleString('en-IN')}\`,
          date: dueYMD,
          amount: grp.totalGross,
          partyName: client.company_name || clientName,
          truckNumber: 'TG12U2637',
          status: isOverdue ? 'Overdue' : 'Upcoming',
          description: \`B2B freight invoice due for \${grp.trips.length} delivered trips during \${cycleLabel}.\`,
          priority: isOverdue ? 'urgent' : 'high',
          color: 'rose'
        });

        // Stream 9: Consolidated Expected Payment for this cycle
        events.push({
          id: \`exp_pay_\${cid}_\${cycleKey}\`,
          category: 'expected_payment',
          categoryLabel: 'Expected Payment',
          icon: '💰',
          title: \`💰 Expected Payment: \${clientName} - ₹\${netAmount.toLocaleString('en-IN')}\`,
          date: dueYMD,
          amount: netAmount,
          partyName: client.company_name || clientName,
          truckNumber: 'TG12U2637',
          status: isOverdue ? 'Overdue' : 'Expected',
          description: \`Consolidated B2B contract freight settlement for \${grp.trips.length} delivered trips (\${cycleLabel}). Gross: ₹\${grp.totalGross.toLocaleString('en-IN')}, Net: ₹\${netAmount.toLocaleString('en-IN')} (after \${tdsPct}% TDS). Credit terms: \${terms} days.\`,
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
          id: \`exp_pay_spot_\${t.id}\`,
          category: 'expected_payment',
          categoryLabel: 'Expected Payment',
          icon: '💰',
          title: \`💰 Expected Payment: \${clientName} - ₹\${rev.toLocaleString('en-IN')}\`,
          date: dueYMD,
          amount: rev,
          partyName: client.company_name || clientName,
          truckNumber: t.truck_number || 'TG12U2637',
          status: isOverdue ? 'Overdue' : 'Expected',
          description: \`Spot shipment payment for route \${t.route || 'Transit'} (Trip #\${t.trip_id || t.id.slice(0, 8)}).\`,
          priority: isOverdue ? 'urgent' : 'high',
          color: 'lime'
        });
      });
    }
  }

  (dueDates || []).forEach(dd => {
    if (dd.due_date) {
      events.push({
        id: \`pdd_\${dd.id}\`,
        category: 'invoice_due',
        categoryLabel: 'Invoice Due',
        title: \`🧾 Payment Due: \${dd.title || 'Corporate Statement'}\`,
        date: toYMD(dd.due_date),
        amount: dd.full_payment_amount || dd.amount || 0,
        status: dd.status || 'Unpaid',
        description: dd.notes || 'Statement invoice payment due.',
        priority: 'high',
        icon: 'receipt',
        color: 'rose'
      });
    }
  });`;

if (!apiSrc.includes(oldApiStream6And9)) {
  throw new Error('Could not find oldApiStream6And9 in businessCalendarService.js');
}
apiSrc = apiSrc.replace(oldApiStream6And9, newApiStream6);

// Remove the old stream 9 block (deliveredTrips) since it is now unified in newApiStream6
const oldApiStream9 = `  // 9. EXPECTED CUSTOMER PAYMENT
  const deliveredTrips = (tripLogs || []).filter(t => t.trip_status === 'Delivered' && Number(t.revenue || 0) > 0);
  deliveredTrips.slice(0, 20).forEach(t => {
    const tripDate = t.date ? new Date(t.date) : new Date();
    const payDate = new Date(tripDate.getTime() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    events.push({
      id: \`exp_pay_\${t.id}\`,
      category: 'expected_payment',
      categoryLabel: 'Expected Payment',
      title: \`💰 Expected Payment: Amazon - ₹\${Number(t.revenue || 0).toLocaleString('en-IN')}\`,
      date: payDate,
      amount: Number(t.revenue || 0),
      partyName: 'AMAZON TRANSPORTATION SERVICES',
      truckNumber: t.truck_number || 'TG12U2637',
      status: t.client_payment_status === 'received' ? 'Received' : 'Expected',
      description: \`Expected B2B contract freight remittance for route \${t.route} (\${t.kms} km). 32 days net credit cycle.\`,
      priority: 'high',
      icon: 'indian-rupee',
      color: 'lime'
    });
  });`;

if (!apiSrc.includes(oldApiStream9)) {
  throw new Error('Could not find oldApiStream9 in businessCalendarService.js');
}
apiSrc = apiSrc.replace(oldApiStream9, '  // 9. EXPECTED CUSTOMER PAYMENT handled above in consolidated cycles');

fs.writeFileSync(apiServicePath, apiSrc, 'utf8');
console.log('✓ Successfully updated businessCalendarService.js');


// ============================================================================
// PART 2: UPDATE CalendarPage-B2t9lz8o.js IN ALL 4 LOCATIONS
// ============================================================================
const calChunkPath = path.resolve(__dirname, '../dist/assets/CalendarPage-B2t9lz8o.js');
let calSrc = fs.readFileSync(calChunkPath, 'utf8');

// 2a. Fix timezone shift in Qe(s)
const oldDayStr = 'const dayStr=(s instanceof Date?s.toISOString().split("T")[0]:String(s).substring(0,10));';
const newDayStr = 'const dayStr=(s instanceof Date?f(s,"yyyy-MM-dd"):String(s).substring(0,10));';
if (!calSrc.includes(oldDayStr)) {
  throw new Error('Could not find oldDayStr in CalendarPage');
}
calSrc = calSrc.replace(oldDayStr, newDayStr);
console.log('✓ Fixed timezone shift in dayStr (Qe)');

// 2b. Fix month range timezone shift in U()
const oldQueryRange = 'const s=L.toISOString().split("T")[0],t=V.toISOString().split("T")[0],r=await S.collection("trip_logs")';
const newQueryRange = 'const s=f(L,"yyyy-MM-dd"),t=f(V,"yyyy-MM-dd"),r=await S.collection("trip_logs")';
if (!calSrc.includes(oldQueryRange)) {
  throw new Error('Could not find oldQueryRange in CalendarPage');
}
calSrc = calSrc.replace(oldQueryRange, newQueryRange);
console.log('✓ Fixed month query range timezone shift in U()');

// 2c. Replace Stream 6 in buildBusinessCalendarEvents
const oldCalStream6 = `  const unpaidTrips = (tripLogs || []).filter(t => t.client_payment_status !== 'received' && Number(t.revenue || 0) > 0);
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
  });`;

const newCalStream6 = `  const clientMap = new Map((clients || []).map(c => [c.id, c]));
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
  });`;

if (!calSrc.includes(oldCalStream6)) {
  throw new Error('Could not find oldCalStream6 in CalendarPage');
}
calSrc = calSrc.replace(oldCalStream6, newCalStream6);
console.log('✓ Replaced old Stream 6 with consolidated billing cycle logic');

// 2d. Remove old Stream 9 from buildBusinessCalendarEvents
const oldCalStream9 = `  const deliveredTrips = (tripLogs || []).filter(t => t.trip_status === 'Delivered' && Number(t.revenue || 0) > 0);
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
  });`;

if (!calSrc.includes(oldCalStream9)) {
  throw new Error('Could not find oldCalStream9 in CalendarPage');
}
calSrc = calSrc.replace(oldCalStream9, '// Stream 9 unified with consolidated cycles');
console.log('✓ Removed old redundant Stream 9');

// 2e. Validate with Babel
console.log('Validating modified CalendarPage with Babel parser...');
try {
  babel.parse(calSrc, { sourceType: 'module', plugins: ['jsx'] });
  console.log('🎉 100% VALID SYNTAX! ZERO PARSER ERRORS!');
} catch (err) {
  console.error('Fatal parser error in CalendarPage:', err.message);
  process.exit(1);
}

// 2f. Write to all 4 destinations
const targets = [
  'dist/assets/CalendarPage-B2t9lz8o.js',
  'apps/web/dist/assets/CalendarPage-B2t9lz8o.js',
  'apps/api/dist/assets/CalendarPage-B2t9lz8o.js',
  'dist/apps/web/assets/CalendarPage-B2t9lz8o.js'
];

targets.forEach(t => {
  const full = path.resolve(__dirname, '..', t);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, calSrc, 'utf8');
  console.log('✓ Successfully wrote to', t);
});

console.log('✨ All CalendarPage chunks & backend service updated successfully!');
