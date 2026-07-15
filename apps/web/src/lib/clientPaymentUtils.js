export const calculateClientMetrics = (clientId, trips) => {
  const clientTrips = trips.filter(t => t.client_id === clientId);
  let totalInvoiced = 0;
  let totalReceived = 0;
  let totalPending = 0;
  let lastPaymentDate = null;
  let receivedTripsCount = 0;
  let pendingTripsCount = 0;

  clientTrips.forEach(trip => {
    const revenue = Number(trip.revenue) || 0;
    const advance = Number(trip.advance_received_from_client) || 0;
    totalInvoiced += revenue;
    
    if (trip.client_payment_status === 'received') {
      totalReceived += revenue;
      receivedTripsCount++;
      if (!lastPaymentDate || new Date(trip.date) > new Date(lastPaymentDate)) {
        lastPaymentDate = trip.date;
      }
    } else {
      // If payment is pending/blank, the client has still paid the advance amount
      totalReceived += advance;
      
      // The remaining outstanding balance applies to all pending trips
      totalPending += Math.max(0, revenue - advance);
      pendingTripsCount++;
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
    const metrics = calculateClientMetrics(client.id, trips);
    return {
      client_id: client.id,
      client_name: client.client_name || client.company_name || 'Unknown',
      ...metrics,
      rawClient: client
    };
  });
};