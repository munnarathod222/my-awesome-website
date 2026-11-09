/**
 * Monthly Fleet & Driver Trip Intelligence Engine
 * "LOG DATA ONCE -> ZERO-SEARCH OPERATIONAL INSIGHTS"
 *
 * Accurately filters and calculates monthly trip counts, utilization tiers,
 * distance, and freight revenue for all trucks and drivers across Jai Bhavani Cargo.
 */

export function normalizeVehiclePlate(str) {
  if (!str) return '';
  return String(str).replace(/[\s\-_]/g, '').toUpperCase();
}

export function normalizeDriverName(str) {
  if (!str) return '';
  return String(str).trim().toLowerCase().replace(/\s+/g, ' ');
}

export function extractTripYearMonth(trip) {
  if (!trip) return '';
  // Check in order: trip.date, trip.start_date, trip.created
  const raw = trip.date || trip.start_date || trip.created;
  if (!raw) return '';
  
  if (typeof raw === 'string') {
    // If format is YYYY-MM-DD or ISO
    const match = raw.match(/^(\d{4})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}`;
  }
  
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getAvailableMonthsList(trips = []) {
  const monthsSet = new Set();
  
  // Always include current month and previous 5 months
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    monthsSet.add(`${y}-${m}`);
  }

  // Also include any months present in trip logs
  (trips || []).forEach(t => {
    const ym = extractTripYearMonth(t);
    if (ym) monthsSet.add(ym);
  });

  const sorted = Array.from(monthsSet).sort().reverse();
  return sorted.map(ym => {
    const [y, m] = ym.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1, 1);
    const label = dateObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    return { value: ym, label };
  });
}

/**
 * Main Aggregator Function
 */
export function computeMonthlyFleetAndDriverStats({
  trips = [],
  trucks = [],
  drivers = [],
  selectedYearMonth = ''
}) {
  const now = new Date();
  const curY = now.getFullYear();
  const curM = String(now.getMonth() + 1).padStart(2, '0');
  const targetYearMonth = selectedYearMonth || `${curY}-${curM}`;

  // 1. Filter trips belonging to target month
  const monthTrips = (trips || []).filter(t => {
    const ym = extractTripYearMonth(t);
    return ym === targetYearMonth;
  });

  // 2. Aggregate Truck Statistics
  const truckStats = (trucks || []).map(truck => {
    const truckId = truck.id;
    const cleanPlate = normalizeVehiclePlate(truck.truck_number);

    const vehicleTrips = monthTrips.filter(t => {
      if (t.truck_id && (t.truck_id === truckId || t.vehicle_id === truckId)) return true;
      const tPlate = normalizeVehiclePlate(t.truck_number || t.vehicle_number);
      if (tPlate && cleanPlate && (tPlate === cleanPlate || tPlate.includes(cleanPlate) || cleanPlate.includes(tPlate))) {
        return true;
      }
      return false;
    });

    const tripCount = vehicleTrips.length;
    const totalKm = vehicleTrips.reduce((sum, t) => {
      const km = Number(t.actual_km) || Number(t.kms) || Number(t.trip_km) || Number(t.distance_km) || 0;
      return sum + km;
    }, 0);

    const totalFreight = vehicleTrips.reduce((sum, t) => {
      const rev = Number(t.revenue) || Number(t.freight_amount) || Number(t.amount) || Number(t.total_freight) || 0;
      return sum + rev;
    }, 0);

    // Identify primary driver for this truck this month
    const driverCounts = {};
    vehicleTrips.forEach(t => {
      const dName = t.driver_name || t.assigned_driver_name || '';
      if (dName) driverCounts[dName] = (driverCounts[dName] || 0) + 1;
    });
    const mostFreqDriver = Object.keys(driverCounts).sort((a, b) => driverCounts[b] - driverCounts[a])[0];
    const assignedDriver = mostFreqDriver || truck.assigned_driver_name || truck.driver_name || 'Unassigned';

    // Utilization status
    let utilizationStatus = 'optimal';
    let utilizationLabel = 'Optimal (8+ Trips)';
    let badgeColor = 'emerald';
    if (tripCount >= 8) {
      utilizationStatus = 'optimal';
      utilizationLabel = 'High Utilization';
      badgeColor = 'emerald';
    } else if (tripCount >= 4) {
      utilizationStatus = 'moderate';
      utilizationLabel = 'Available for Dispatch';
      badgeColor = 'amber';
    } else {
      utilizationStatus = 'underutilized';
      utilizationLabel = tripCount === 0 ? 'Idle · No Trips Logged' : 'Low Run · Needs Load';
      badgeColor = 'rose';
    }

    return {
      truck,
      truckId,
      truckNumber: truck.truck_number || 'Vehicle',
      model: truck.model || truck.make || 'Commercial Truck',
      bodyType: truck.truck_type || truck.body_type || '32 FT SXL',
      tonnage: truck.capacity_tonnage || truck.tonnage || 9,
      cleanPlate,
      tripCount,
      totalKm,
      totalFreight,
      assignedDriver,
      utilizationStatus,
      utilizationLabel,
      badgeColor,
      trips: vehicleTrips
    };
  });

  // Sort trucks: underutilized first if owner needs to act, or by tripCount descending
  const sortedTrucks = [...truckStats].sort((a, b) => b.tripCount - a.tripCount);

  // 3. Aggregate Driver Statistics
  const driverStats = (drivers || []).map(driver => {
    const driverId = driver.id;
    const dName = driver.name || driver.driver_name || 'Driver';
    const cleanDName = normalizeDriverName(dName);
    const code = driver.employee_code || driver.driver_code || driver.code || '';

    const driverTrips = monthTrips.filter(t => {
      if (t.driver_employee_id && (t.driver_employee_id === driverId || t.driver_id === driverId)) return true;
      if (code && (t.driver_employee_code === code || t.driver_code === code)) return true;
      const tDName = normalizeDriverName(t.driver_name);
      if (tDName && cleanDName && (tDName === cleanDName || tDName.includes(cleanDName) || cleanDName.includes(tDName))) {
        return true;
      }
      return false;
    });

    const tripCount = driverTrips.length;
    const monthlyTarget = 10;
    const targetPercent = Math.min(100, Math.round((tripCount / monthlyTarget) * 100));

    const totalKm = driverTrips.reduce((sum, t) => {
      const km = Number(t.actual_km) || Number(t.kms) || Number(t.trip_km) || Number(t.distance_km) || 0;
      return sum + km;
    }, 0);

    const totalFreight = driverTrips.reduce((sum, t) => {
      const rev = Number(t.revenue) || Number(t.freight_amount) || Number(t.amount) || Number(t.total_freight) || 0;
      return sum + rev;
    }, 0);

    // Primary vehicle driven by driver this month
    const truckPlates = {};
    driverTrips.forEach(t => {
      const p = t.truck_number || t.vehicle_number || '';
      if (p) truckPlates[p] = (truckPlates[p] || 0) + 1;
    });
    const topPlate = Object.keys(truckPlates).sort((a, b) => truckPlates[b] - truckPlates[a])[0];
    const assignedVehicle = topPlate || driver.assigned_truck || 'Fleet Pool';

    return {
      driver,
      driverId,
      name: dName,
      code,
      phone: driver.phone || driver.contact_number || '',
      tripCount,
      monthlyTarget,
      targetPercent,
      totalKm,
      totalFreight,
      assignedVehicle,
      trips: driverTrips
    };
  });

  const sortedDrivers = [...driverStats].sort((a, b) => b.tripCount - a.tripCount);

  // 4. Fleet-Level Summary
  const totalFleetTrips = monthTrips.length;
  const activeTrucksCount = truckStats.filter(t => t.tripCount > 0).length;
  const underutilizedCount = truckStats.filter(t => t.tripCount < 4).length;
  const avgTripsPerTruck = truckStats.length > 0 ? (totalFleetTrips / truckStats.length).toFixed(1) : 0;
  const topTruck = sortedTrucks[0] ? `${sortedTrucks[0].truckNumber} (${sortedTrucks[0].tripCount} trips)` : 'None';
  const topDriver = sortedDrivers[0] ? `${sortedDrivers[0].name} (${sortedDrivers[0].tripCount} trips)` : 'None';

  return {
    selectedYearMonth: targetYearMonth,
    totalFleetTrips,
    activeTrucksCount,
    underutilizedCount,
    avgTripsPerTruck,
    topTruck,
    topDriver,
    trucks: sortedTrucks,
    drivers: sortedDrivers,
    monthTrips
  };
}
