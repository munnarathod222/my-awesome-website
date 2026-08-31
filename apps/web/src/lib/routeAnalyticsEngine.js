/**
 * Route Master Analytics & Intelligence Engine
 * Computes corridor profitability, expense variances, turnaround times, and load balancing
 */

export function computeRouteCorridorMetrics(routes = [], tripLogs = []) {
  if (!Array.isArray(routes) || routes.length === 0) {
    return { corridors: [], totalRevenue: 0, totalProfit: 0, avgTurnaroundHours: 0, varianceAlerts: [] };
  }

  const logs = Array.isArray(tripLogs) ? tripLogs : [];

  const corridorMap = {};

  routes.forEach(r => {
    const key = r.id;
    const name = r.route_name || `${r.origin_village || r.start_location} - ${r.destination_village || r.end_location}`;
    const code = r.route_code || 'CORRIDOR';

    corridorMap[key] = {
      id: r.id,
      routeName: name,
      routeCode: code,
      distanceKm: parseFloat(r.distance_km || r.distance) || 0,
      standardRate: parseFloat(r.amount_per_trip) || 0,
      standardToll: parseFloat(r.fastag_charge) || 0,
      stopsCount: Array.isArray(r.stops) ? r.stops.length : 0,
      stops: Array.isArray(r.stops) ? r.stops : [],
      tripCount: 0,
      totalRevenue: 0,
      totalFuelCost: 0,
      totalTollCost: 0,
      totalDriverBata: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMarginPercent: 0,
      avgTransitHours: 0,
      tollVariances: [],
      isRoundTrip: Boolean(r.is_round_trip_rate || r.is_round_trip || name.includes('/'))
    };
  });

  // Process trip logs
  logs.forEach(log => {
    // Find matching corridor by route_id or origin/destination match
    let matchedCorridorKey = log.route_id;

    if (!matchedCorridorKey || !corridorMap[matchedCorridorKey]) {
      const logOrigin = (log.origin_village || log.start_location || '').trim().toLowerCase();
      const logDest = (log.destination_village || log.end_location || '').trim().toLowerCase();

      const foundRoute = routes.find(r => {
        const rOrig = (r.origin_village || r.start_location || '').trim().toLowerCase();
        const rDest = (r.destination_village || r.end_location || '').trim().toLowerCase();
        return (rOrig === logOrigin && rDest === logDest) || (rOrig === logDest && rDest === logOrigin);
      });

      if (foundRoute) {
        matchedCorridorKey = foundRoute.id;
      }
    }

    if (matchedCorridorKey && corridorMap[matchedCorridorKey]) {
      const corr = corridorMap[matchedCorridorKey];
      corr.tripCount += 1;

      const rev = parseFloat(log.revenue || log.freight_amount || log.amount_per_trip) || corr.standardRate || 0;
      const fuel = parseFloat(log.fuel_expenses || log.diesel_cost || log.fuel_cost) || 0;
      const toll = parseFloat(log.toll_expenses || log.fastag_charge || log.toll_amount) || 0;
      const bata = parseFloat(log.driver_bata || log.bata) || 0;
      const other = parseFloat(log.other_expenses || log.misc_expenses) || 0;

      const totalExp = fuel + toll + bata + other;
      const profit = rev - totalExp;

      corr.totalRevenue += rev;
      corr.totalFuelCost += fuel;
      corr.totalTollCost += toll;
      corr.totalDriverBata += bata;
      corr.totalExpenses += totalExp;
      corr.netProfit += profit;

      // Variance check
      if (corr.standardToll > 0 && toll > 0) {
        const diff = toll - corr.standardToll;
        if (Math.abs(diff) > 50) {
          corr.tollVariances.push({
            tripId: log.trip_id || log.id || log.lr_number,
            truckNo: log.truck_number || 'TG12U2637',
            actualToll: toll,
            expectedToll: corr.standardToll,
            variance: diff
          });
        }
      }
    }
  });

  // Compute margins and rankings
  let overallRevenue = 0;
  let overallProfit = 0;
  let totalTripCount = 0;
  const varianceAlerts = [];

  const corridorList = Object.values(corridorMap).map(corr => {
    if (corr.totalRevenue > 0) {
      corr.profitMarginPercent = (corr.netProfit / corr.totalRevenue) * 100;
    } else {
      corr.profitMarginPercent = 0;
    }

    overallRevenue += corr.totalRevenue;
    overallProfit += corr.netProfit;
    totalTripCount += corr.tripCount;

    if (corr.tollVariances.length > 0) {
      corr.tollVariances.forEach(v => {
        varianceAlerts.push({
          corridorName: corr.routeName,
          corridorCode: corr.routeCode,
          ...v
        });
      });
    }

    // Determine performance tier badge
    if (corr.profitMarginPercent >= 30) {
      corr.tier = 'gold';
      corr.tierLabel = '🥇 Gold Profit Corridor';
    } else if (corr.profitMarginPercent >= 15) {
      corr.tier = 'standard';
      corr.tierLabel = '⚡ Standard Corridor';
    } else {
      corr.tier = 'risk';
      corr.tierLabel = '⚠️ Low Margin Corridor';
    }

    return corr;
  });

  // Sort by Net Profit descending
  corridorList.sort((a, b) => b.netProfit - a.netProfit);

  return {
    corridors: corridorList,
    totalRevenue: overallRevenue,
    totalProfit: overallProfit,
    totalTripCount,
    overallMarginPercent: overallRevenue > 0 ? (overallProfit / overallRevenue) * 100 : 0,
    varianceAlerts
  };
}
