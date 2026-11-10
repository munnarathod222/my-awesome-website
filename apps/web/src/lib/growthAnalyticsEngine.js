/**
 * Growth Analytics Engine for Jai Bhavani Cargo
 * Calculates financial velocity, MoM growth rates, target pacing, fleet asset yields, and corridor expansion.
 */

export const calculateGrowthMetrics = (allTrips = [], allExpenses = [], allTrucks = [], targetRevenue = null) => {
  const safeTrips = Array.isArray(allTrips) ? allTrips : [];
  const safeExpenses = Array.isArray(allExpenses) ? allExpenses : [];
  const safeTrucks = Array.isArray(allTrucks) ? allTrucks : [];

  const now = new Date();
  // IST Date String: UTC + 5:30
  const istDate = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000);
  const currentYear = istDate.getFullYear();
  const currentMonthIdx = istDate.getMonth(); // 0-indexed
  const currentDay = istDate.getDate();
  const daysInCurrentMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();

  // Helper for monthly key "YYYY-MM"
  const getMonthKey = (year, monthIdx) => {
    const m = (monthIdx + 1).toString().padStart(2, '0');
    return `${year}-${m}`;
  };

  const getMonthLabel = (year, monthIdx) => {
    const d = new Date(year, monthIdx, 1);
    return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  // Generate last 6 month keys
  const monthList = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonthIdx - i, 1);
    const y = d.getFullYear();
    const mIdx = d.getMonth();
    monthList.push({
      key: getMonthKey(y, mIdx),
      label: getMonthLabel(y, mIdx),
      year: y,
      monthIdx: mIdx,
      isCurrent: i === 0
    });
  }

  // Monthly buckets
  const monthlyBuckets = {};
  monthList.forEach(m => {
    monthlyBuckets[m.key] = {
      key: m.key,
      label: m.label,
      revenue: 0,
      expenses: 0,
      profit: 0,
      margin: 0,
      tripCount: 0,
      arpt: 0,
      clients: {},
      lanes: {}
    };
  });

  // Distribute trips
  safeTrips.forEach(t => {
    if (!t) return;
    const dStr = (t.date || t.created || t.start_date || '').slice(0, 7);
    if (!monthlyBuckets[dStr]) return;

    const rev = Number(t.revenue) || Number(t.freight_amount) || Number(t.rate) || 0;
    monthlyBuckets[dStr].revenue += rev;
    monthlyBuckets[dStr].tripCount += 1;

    // Client tracking
    const client = (t.client_name || t.customer_name || 'Market / Spot Load').trim();
    monthlyBuckets[dStr].clients[client] = (monthlyBuckets[dStr].clients[client] || 0) + rev;

    // Lane tracking
    const origin = (t.origin || t.from || 'Hub').trim();
    const destination = (t.destination || t.to || 'Dest').trim();
    const lane = `${origin} ➔ ${destination}`;
    monthlyBuckets[dStr].lanes[lane] = (monthlyBuckets[dStr].lanes[lane] || 0) + 1;
  });

  // Distribute expenses
  safeExpenses.forEach(e => {
    if (!e) return;
    const cat = (e.category || '').toLowerCase();
    const sub = (e.subcategory || '').toLowerCase();
    if (cat.includes('advance') || sub.includes('advance')) return; // advances are netted separately

    const dStr = (e.bill_date || e.date || e.created || '').slice(0, 7);
    if (!monthlyBuckets[dStr]) return;

    const amt = Number(e.amount) || 0;
    monthlyBuckets[dStr].expenses += amt;
  });

  // Compute profit, margins, and MoM growths
  const sortedMonths = monthList.map((m, idx) => {
    const data = monthlyBuckets[m.key];
    const profit = data.revenue - data.expenses;
    const margin = data.revenue > 0 ? (profit / data.revenue) * 100 : 0;
    const arpt = data.tripCount > 0 ? Math.round(data.revenue / data.tripCount) : 0;

    let momRevGrowth = 0;
    let momProfitGrowth = 0;
    let momTripsGrowth = 0;

    if (idx > 0) {
      const prev = monthlyBuckets[monthList[idx - 1].key];
      momRevGrowth = prev.revenue > 0 
        ? ((data.revenue - prev.revenue) / prev.revenue) * 100 
        : (data.revenue > 0 ? 100 : 0);
      momProfitGrowth = prev.profit !== 0 
        ? ((profit - prev.profit) / Math.abs(prev.profit)) * 100 
        : 0;
      momTripsGrowth = prev.tripCount > 0 
        ? ((data.tripCount - prev.tripCount) / prev.tripCount) * 100 
        : (data.tripCount > 0 ? 100 : 0);
    }

    return {
      ...data,
      profit,
      margin: Math.round(margin * 10) / 10,
      arpt,
      momRevGrowth: Math.round(momRevGrowth * 10) / 10,
      momProfitGrowth: Math.round(momProfitGrowth * 10) / 10,
      momTripsGrowth: Math.round(momTripsGrowth * 10) / 10,
      isCurrent: m.isCurrent
    };
  });

  const currentMonthData = sortedMonths[sortedMonths.length - 1];
  const prevMonthData = sortedMonths[sortedMonths.length - 2] || { revenue: 0, profit: 0, tripCount: 0 };

  // Targets & Run-rate pacing
  const defaultTarget = targetRevenue || (prevMonthData.revenue > 0 ? Math.round(prevMonthData.revenue * 1.15) : 2500000);
  const target = Math.max(Number(targetRevenue) || defaultTarget, 100000);

  const daysElapsed = Math.max(currentDay, 1);
  const dailyRunRate = currentMonthData.revenue / daysElapsed;
  const projectedMonthRevenue = Math.round(dailyRunRate * daysInCurrentMonth);
  const targetPctAchieved = Math.min(Math.round((currentMonthData.revenue / target) * 1000) / 10, 999);
  
  // Pacing status
  const expectedPacingPct = (daysElapsed / daysInCurrentMonth) * 100;
  let pacingStatus = 'on_track'; // 'ahead', 'on_track', 'lagging'
  if (targetPctAchieved >= expectedPacingPct * 1.05) {
    pacingStatus = 'ahead';
  } else if (targetPctAchieved < expectedPacingPct * 0.85) {
    pacingStatus = 'lagging';
  }

  // Fleet Asset Yield
  const fleetCount = Math.max(safeTrucks.length, 1);
  const yieldPerTruckPerDay = Math.round(currentMonthData.revenue / (fleetCount * daysElapsed));
  const tripsPerTruck = Math.round((currentMonthData.tripCount / fleetCount) * 10) / 10;
  const scalePotentialOneTruck = Math.round(projectedMonthRevenue / fleetCount);

  // Top Corridors (Current Month)
  const sortedLanes = Object.entries(currentMonthData.lanes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([lane, count]) => ({ lane, count }));

  // Top Clients (Current Month)
  const totalMonthRev = Math.max(currentMonthData.revenue, 1);
  const sortedClients = Object.entries(currentMonthData.clients)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, rev]) => ({
      name,
      revenue: rev,
      sharePct: Math.round((rev / totalMonthRev) * 1000) / 10
    }));

  return {
    currentMonth: currentMonthData,
    prevMonth: prevMonthData,
    target,
    daysElapsed,
    daysInCurrentMonth,
    daysRemaining: daysInCurrentMonth - daysElapsed,
    dailyRunRate: Math.round(dailyRunRate),
    projectedMonthRevenue,
    targetPctAchieved,
    pacingStatus,
    fleetCount,
    yieldPerTruckPerDay,
    tripsPerTruck,
    scalePotentialOneTruck,
    history: sortedMonths,
    topLanes: sortedLanes,
    topClients: sortedClients
  };
};

/**
 * Generates an executive WhatsApp growth snapshot
 */
export const generateGrowthWhatsAppSnapshot = (growthData) => {
  if (!growthData) return '';
  const { currentMonth, prevMonth, target, targetPctAchieved, projectedMonthRevenue, fleetCount, tripsPerTruck } = growthData;

  const revFormatted = `₹${(currentMonth.revenue || 0).toLocaleString('en-IN')}`;
  const profitFormatted = `₹${(currentMonth.profit || 0).toLocaleString('en-IN')}`;
  const targetFormatted = `₹${target.toLocaleString('en-IN')}`;
  const projectedFormatted = `₹${projectedMonthRevenue.toLocaleString('en-IN')}`;
  const momSign = currentMonth.momRevGrowth >= 0 ? '+' : '';

  return `📊 *JAI BHAVANI CARGO — BUSINESS GROWTH PULSE* 🚚\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🗓️ *Period:* ${currentMonth.label} (Day ${growthData.daysElapsed} of ${growthData.daysInCurrentMonth})\n` +
    `🎯 *Monthly Target:* ${targetFormatted}\n` +
    `💰 *Revenue to Date:* ${revFormatted} (${targetPctAchieved}% achieved)\n` +
    `📈 *MoM Growth Rate:* ${momSign}${currentMonth.momRevGrowth}%\n` +
    `💵 *Net Margin:* ${currentMonth.margin}% (${profitFormatted})\n` +
    `🔮 *Month-End Run-Rate Forecast:* ${projectedFormatted}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🚛 *Fleet Scale & Utilization:*\n` +
    `• Active Fleet: ${fleetCount} Registered Trucks\n` +
    `• Turnaround Frequency: ${tripsPerTruck} trips/truck\n` +
    `• Daily Asset Yield: ₹${growthData.yieldPerTruckPerDay.toLocaleString('en-IN')}/truck/day\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `⚡ _Generated instantly via Jai Bhavani Cargo Portal_`;
};
