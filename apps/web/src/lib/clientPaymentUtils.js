/**
 * calculateClientMetrics
 * 
 * Outstanding rules:
 *  - CONTRACT clients  → Only DELIVERED trips (trip_status === 'Delivered') that
 *                        still have client_payment_status !== 'received' count toward
 *                        outstanding. Full revenue (no advance deduction) is owed
 *                        because contract billing happens at month-end / cycle-end.
 *  - SPOT clients      → Any pending trip: outstanding = revenue - advance_received_from_client
 *                        (advance is deducted from what's owed immediately)
 */
export const calculateClientMetrics = (clientId, trips, billingType = 'Spot') => {
  const clientTrips = trips.filter(t => t.client_id === clientId);
  const isContract = billingType === 'Contract';

  let totalInvoiced = 0;
  let totalReceived = 0;
  let totalPending = 0;
  let lastPaymentDate = null;
  let receivedTripsCount = 0;
  let pendingTripsCount = 0;

  clientTrips.forEach(trip => {
    const revenue = Number(trip.revenue) || 0;
    const advance = Number(trip.advance_received_from_client) || 0;
    const isDelivered = !trip.trip_status || trip.trip_status === 'Delivered';
    const isFullyPaid = trip.client_payment_status === 'received';

    totalInvoiced += revenue;

    if (isFullyPaid) {
      totalReceived += revenue;
      receivedTripsCount++;
      if (!lastPaymentDate || new Date(trip.date) > new Date(lastPaymentDate)) {
        lastPaymentDate = trip.date;
      }
    } else {
      if (isContract) {
        // Contract: only count delivered trips as outstanding (full revenue — no advance deduction)
        totalReceived += advance; // advance still received
        if (isDelivered) {
          totalPending += Math.max(0, revenue - advance);
          pendingTripsCount++;
        }
        // Non-delivered trips are NOT counted in outstanding for contract clients
      } else {
        // Spot: deduct advance and show pending balance
        totalReceived += advance;
        totalPending += Math.max(0, revenue - advance);
        pendingTripsCount++;
      }
    }
  });

  const outstandingBalance = totalPending;
  const receivedPct = totalInvoiced > 0 ? ((totalReceived / totalInvoiced) * 100).toFixed(1) : 0;
  const pendingPct = totalInvoiced > 0 ? ((outstandingBalance / totalInvoiced) * 100).toFixed(1) : 0;

  return {
    totalInvoiced,
    totalReceived,
    totalPending,
    outstandingBalance,
    receivedPct: Number(receivedPct),
    pendingPct: Number(pendingPct),
    lastPaymentDate,
    totalTrips: clientTrips.length,
    pendingTrips: pendingTripsCount,
    receivedTrips: receivedTripsCount
  };
};

export const aggregateClientAnalysis = (clients, trips) => {
  return clients.map(client => {
    const metrics = calculateClientMetrics(client.id, trips, client.billing_type || 'Spot');
    return {
      client_id: client.id,
      client_name: client.client_name || client.company_name || 'Unknown',
      ...metrics,
      rawClient: client
    };
  });
};