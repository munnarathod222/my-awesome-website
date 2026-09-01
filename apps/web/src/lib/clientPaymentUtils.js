/**
 * Transport Credit Scoring Engine & Client Financial Analytics
 * 
 * Scores clients on a 300 - 850 scale based on:
 * 1. Average Payment Days (35% weight)
 * 2. On-Time Payment Reliability % (30% weight)
 * 3. Credit Utilization % (20% weight)
 * 4. Business Volume & History (15% weight)
 */

export const calculateClientMetrics = (clientId, trips = [], billingType = 'Spot', clientRecord = null) => {
  const clientTrips = trips.filter(t => t.client_id === clientId || t.client === clientId);
  const isContract = billingType === 'Contract';

  let totalInvoiced = 0;
  let totalReceived = 0;
  let totalPending = 0;
  let lastPaymentDate = null;
  let receivedTripsCount = 0;
  let pendingTripsCount = 0;

  // Track payment duration for Average Payment Days calculation
  let totalPaymentDaysSum = 0;
  let paidTripsWithDurationCount = 0;
  let onTimeTripsCount = 0;

  const now = new Date();
  now.setHours(23, 59, 59, 999);

  clientTrips.forEach(trip => {
    const revenue = Number(trip.revenue || trip.total_freight || trip.amount || 0);
    const advance = Number(trip.advance_received_from_client || trip.advance || 0);

    const tripDateStr = trip.date || trip.created || trip.booking_date;
    let isFutureDate = false;
    if (tripDateStr) {
      const parsedDate = new Date(typeof tripDateStr === 'string' && tripDateStr.includes(' ') && !tripDateStr.includes('T') ? tripDateStr.replace(' ', 'T') : tripDateStr);
      if (!isNaN(parsedDate.getTime())) {
        isFutureDate = parsedDate.getTime() > now.getTime();
      }
    }

    const normStatus = (trip.trip_status || '').trim().toUpperCase();
    const isUpcoming = isFutureDate || normStatus === 'UPCOMING' || normStatus === 'DISPATCHED' || normStatus === 'IN TRANSIT' || normStatus === 'IN-TRANSIT' || normStatus === 'PLANNED';
    const isDelivered = (normStatus === 'DELIVERED' || normStatus === 'COMPLETED' || (!normStatus && !isFutureDate)) && !isUpcoming;
    const isFullyPaid = (trip.client_payment_status || '').toLowerCase() === 'received' || (trip.client_payment_status || '').toLowerCase() === 'paid' || trip.payment_status === 'Paid';

    if (!isUpcoming || isFullyPaid) {
      totalInvoiced += revenue;
    }

    // Calculate trip age / payment duration days
    const bookingDate = trip.date || trip.created || trip.booking_date;
    const paymentDate = trip.payment_cleared_date || trip.updated || new Date().toISOString();

    if (bookingDate) {
      const daysTaken = Math.max(1, Math.round((new Date(paymentDate) - new Date(bookingDate)) / (1000 * 60 * 60 * 24)));
      if (isFullyPaid) {
        totalPaymentDaysSum += daysTaken;
        paidTripsWithDurationCount++;
        if (daysTaken <= 30) {
          onTimeTripsCount++;
        }
      }
    }

    if (isFullyPaid) {
      totalReceived += revenue;
      receivedTripsCount++;
      if (!lastPaymentDate || new Date(trip.date) > new Date(lastPaymentDate)) {
        lastPaymentDate = trip.date;
      }
    } else {
      // For both Contract and Spot: only completed/delivered past/present trips count towards outstanding dues
      totalReceived += advance;
      if (isDelivered) {
        totalPending += Math.max(0, revenue - advance);
        pendingTripsCount++;
      }
    }
  });

  const outstandingBalance = totalPending;
  const receivedPct = totalInvoiced > 0 ? Number(((totalReceived / totalInvoiced) * 100).toFixed(1)) : 0;
  const pendingPct = totalInvoiced > 0 ? Number(((outstandingBalance / totalInvoiced) * 100).toFixed(1)) : 0;

  // Average Payment Days calculation (default to 22 days if no payment history yet)
  const avgPaymentDays = paidTripsWithDurationCount > 0 
    ? Math.round(totalPaymentDaysSum / paidTripsWithDurationCount) 
    : (clientRecord?.avg_payment_days || (clientTrips.length > 0 ? 28 : 18));

  // Payment Reliability Rate (%)
  const paymentReliabilityPct = paidTripsWithDurationCount > 0 
    ? Math.round((onTimeTripsCount / paidTripsWithDurationCount) * 100)
    : (clientTrips.length > 0 ? 85 : 100);

  // Credit Limit & Utilization
  const creditLimit = Number(clientRecord?.credit_limit || 500000);
  const creditUtilizationPct = creditLimit > 0 
    ? Math.min(100, Math.round((outstandingBalance / creditLimit) * 100))
    : 0;

  // ----------------------------------------------------
  // TRANSPORT CREDIT SCORE CALCULATION (300 to 850)
  // ----------------------------------------------------
  let score = 300; // Base score

  // 1. Payment Speed Days Points (Max 220 pts)
  if (avgPaymentDays <= 15) score += 220;
  else if (avgPaymentDays <= 25) score += 180;
  else if (avgPaymentDays <= 35) score += 140;
  else if (avgPaymentDays <= 45) score += 90;
  else if (avgPaymentDays <= 60) score += 40;
  else score += 10;

  // 2. Payment Reliability Rate Points (Max 180 pts)
  score += Math.round((paymentReliabilityPct / 100) * 180);

  // 3. Credit Utilization Points (Max 100 pts)
  if (creditUtilizationPct <= 30) score += 100;
  else if (creditUtilizationPct <= 60) score += 75;
  else if (creditUtilizationPct <= 85) score += 40;
  else score += 10; // Over-utilized / high risk balance

  // 4. Trip Volume & Relationship Seniority Points (Max 50 pts)
  const tripCount = clientTrips.length;
  if (tripCount >= 50) score += 50;
  else if (tripCount >= 20) score += 40;
  else if (tripCount >= 5) score += 25;
  else score += 15;

  // Clamp Score between 300 and 850
  const creditScore = Math.min(850, Math.max(300, Math.round(score)));

  // Credit Tier Configuration
  let creditTier = 'AAA';
  let riskLabel = 'Low Risk (Excellent)';
  let riskColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
  let badgeColor = 'bg-emerald-500 text-white';

  if (creditScore >= 750) {
    creditTier = 'AAA';
    riskLabel = 'Excellent Credit';
    riskColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
    badgeColor = 'bg-emerald-500 text-white';
  } else if (creditScore >= 670) {
    creditTier = 'AA';
    riskLabel = 'Good Credit';
    riskColor = 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    badgeColor = 'bg-blue-600 text-white';
  } else if (creditScore >= 580) {
    creditTier = 'A';
    riskLabel = 'Fair Credit';
    riskColor = 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    badgeColor = 'bg-amber-500 text-white';
  } else {
    creditTier = 'C';
    riskLabel = 'High Risk / Watch';
    riskColor = 'bg-rose-500/10 text-rose-500 border-rose-500/30';
    badgeColor = 'bg-rose-600 text-white';
  }

  return {
    totalInvoiced,
    totalReceived,
    totalPending,
    outstandingBalance,
    receivedPct,
    pendingPct,
    lastPaymentDate,
    totalTrips: clientTrips.length,
    pendingTrips: pendingTripsCount,
    receivedTrips: receivedTripsCount,

    // Credit Scoring Output
    creditScore,
    creditTier,
    riskLabel,
    riskColor,
    badgeColor,
    avgPaymentDays,
    paymentReliabilityPct,
    creditUtilizationPct,
    creditLimit,
  };
};

export const aggregateClientAnalysis = (clients = [], trips = []) => {
  return clients.map(client => {
    const metrics = calculateClientMetrics(client.id, trips, client.billing_type || 'Spot', client);
    return {
      client_id: client.id,
      client_name: client.client_name || client.company_name || 'Unknown Client',
      ...metrics,
      rawClient: client
    };
  });
};