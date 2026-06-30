export const calculateClientMetrics = (clientId, trips) => {
  const clientTrips = trips.filter(t => t.client_id === clientId);
  let totalInvoiced = 0;
  let totalReceived = 0;
  let totalPending = 0;
  let lastPaymentDate = null;
  let receivedTripsCount = 0;
  let pendingTripsCount = 0;

  clientTrips.forEach(trip => {
    const amt = trip.revenue || 0;
    totalInvoiced += amt;
    
    if (trip.client_payment_status === 'received') {
      totalReceived += amt;
      receivedTripsCount++;
      if (!lastPaymentDate || new Date(trip.date) > new Date(lastPaymentDate)) {
        lastPaymentDate = trip.date;
      }
    } else if (trip.client_payment_status === 'pending' || !trip.client_payment_status) {
      // Treat 'blank' or missing status as pending for outstanding calculations
      totalPending += amt;
      pendingTripsCount++;
    }
  });

  const outstandingBalance = totalInvoiced - totalReceived;
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
    const metrics = calculateClientMetrics(client.id, trips);
    return {
      client_id: client.id,
      client_name: client.client_name || client.company_name || 'Unknown',
      ...metrics,
      rawClient: client
    };
  });
};