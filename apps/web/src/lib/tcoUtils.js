import pb from './pocketbaseClient.js';

const TCO_OVERRIDES_STORAGE_KEY = 'jbc_truck_tco_overrides';

export function getTruckTCOOverride(truckIdOrNumber) {
  try {
    const raw = localStorage.getItem(TCO_OVERRIDES_STORAGE_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      return map[truckIdOrNumber] || null;
    }
  } catch (e) {
    console.error('Failed to parse TCO overrides', e);
  }
  return null;
}

export function saveTruckTCOOverride(truckIdOrNumber, overrideData) {
  try {
    const raw = localStorage.getItem(TCO_OVERRIDES_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[truckIdOrNumber] = {
      ...(map[truckIdOrNumber] || {}),
      ...overrideData,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(TCO_OVERRIDES_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save TCO override', e);
  }
}

/**
 * Calculates Accurate Total Cost of Ownership (TCO) & Return on Investment (ROI) metrics for a vehicle.
 */
export function calculateVehicleTCO(truck, fuelLogs = [], maintenanceLogs = [], expenses = [], tripLogs = []) {
  const truckId = truck.id;
  const truckNumber = truck.truck_number;

  // Check for custom TCO overrides edited by user
  const override = getTruckTCOOverride(truckId) || getTruckTCOOverride(truckNumber) || {};

  // 1. Initial CapEx (Purchase price, body building, registration)
  const purchasePrice = Number(override.purchase_price ?? truck.purchase_price ?? truck.initial_cost ?? 2800000);
  const bodyBuildingCost = Number(override.body_building_cost ?? truck.body_building_cost ?? 250000);
  const totalCapEx = Math.max(100000, purchasePrice + bodyBuildingCost);

  // 2. Cumulative Trip Distance & Odometer
  const vehicleTrips = tripLogs.filter(t => t.truck_id === truckId || t.truck_number === truckNumber);
  const totalTripKms = vehicleTrips.reduce((sum, t) => sum + Number(t.kms || t.distance || 0), 0);

  const vehicleFuelLogs = fuelLogs.filter(f => 
    f.truck_id === truckId || 
    f.truck_number === truckNumber || 
    (f.vehicle_name && f.vehicle_name.includes(truckNumber))
  );
  const totalFuelDistanceLogs = vehicleFuelLogs.reduce((sum, f) => sum + Number(f.distance || f.distance_driven || 0), 0);
  const currentOdometer = Number(override.odometer_km ?? truck.odometer_km ?? truck.current_km ?? 0);

  const totalDistanceKm = Math.max(currentOdometer, totalTripKms, totalFuelDistanceLogs, 100);

  // 3. Vehicle Age
  const purchaseYear = Number(override.year_of_manufacture ?? truck.year_of_manufacture ?? (truck.purchase_date ? new Date(truck.purchase_date).getFullYear() : 2022));
  const currentYear = new Date().getFullYear();
  const vehicleAgeYears = Math.max(0.5, currentYear - purchaseYear + (new Date().getMonth() / 12));

  // 4. Cumulative Trip Revenue
  const totalTripRevenueLogs = vehicleTrips.reduce((sum, t) => sum + Number(t.revenue || t.freight_amount || t.amount || 0), 0);
  const overrideRevenue = override.manual_total_revenue ? Number(override.manual_total_revenue) : 0;
  const totalTripRevenue = Math.max(totalTripRevenueLogs, overrideRevenue);
  const totalTripsCount = vehicleTrips.length;

  // 5. ACCURATE OPERATING EXPENSES (Fuel, Maintenance, Driver Pay, Tolls, Insurance, Downtime)
  const totalFuelCostLogs = vehicleFuelLogs.reduce((sum, f) => sum + Number(f.total_cost || f.cost || 0), 0);
  const totalFuelLiters = vehicleFuelLogs.reduce((sum, f) => sum + Number(f.liters || 0), 0);

  const vehicleMaintLogs = maintenanceLogs.filter(m => m.truck_id === truckId || m.truck_number === truckNumber);
  const totalMaintCostLogs = vehicleMaintLogs.reduce((sum, m) => sum + Number(m.cost || m.total_cost || 0), 0);

  const vehicleExpenses = expenses.filter(e => 
    e.truck_id === truckId || e.truck_id === truckNumber || e.vehicle_number === truckNumber
  );
  const totalExpensesFromExpenses = vehicleExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const totalTripExpenses = vehicleTrips.reduce((sum, t) => {
    const driverAdvance = Number(t.advance_paid_to_driver || 0);
    const toll = Number(t.toll_deduction || 0);
    const vendor = Number(t.vendor_payout || 0);
    const tripExp = Number(t.total_trip_expense || t.expenses || 0);
    return sum + Math.max(driverAdvance + toll + vendor, tripExp);
  }, 0);

  const insurancePerYear = Number(override.annual_insurance ?? truck.annual_insurance ?? 42000);
  const totalInsuranceCost = Math.round(insurancePerYear * vehicleAgeYears);

  const recordedBreakdownDays = vehicleMaintLogs.reduce((sum, m) => sum + Number(m.downtime_days || 0), 0);
  const estimatedBreakdownDays = override.breakdown_days !== undefined ? Number(override.breakdown_days) : recordedBreakdownDays;
  const dailyOpportunityCost = Number(override.daily_opportunity_cost ?? truck.daily_opportunity_cost ?? 4500);
  const totalDowntimeCost = estimatedBreakdownDays * dailyOpportunityCost;

  const totalMaintenanceCost = Math.max(totalMaintCostLogs, Number(override.manual_maintenance_cost || 0));
  const totalFuelCost = Math.max(totalFuelCostLogs, Number(override.manual_fuel_cost || 0));

  // Sum of all direct logged expenses
  const totalLoggedOpEx = totalFuelCost + totalMaintenanceCost + totalExpensesFromExpenses + totalTripExpenses + totalInsuranceCost + totalDowntimeCost;

  // Realistic Operating Expense Fallback:
  // In commercial freight, operating expenses (diesel, toll, driver pay, maintenance) average ~72% of freight revenue.
  // If line-by-line expense logs in DB are incomplete (<65% of revenue), use realistic operating cost so profit is NOT falsely equal to revenue!
  const realisticMinOpEx = totalTripRevenue > 0 ? Math.round(totalTripRevenue * 0.72) : 0;
  
  let totalOperatingCost = Math.max(totalLoggedOpEx, realisticMinOpEx);

  if (override.manual_operating_cost !== undefined && override.manual_operating_cost !== null && override.manual_operating_cost !== '') {
    totalOperatingCost = Number(override.manual_operating_cost);
  }

  // 6. Resale Value & Net TCO
  const defaultDepreciationRate = 0.12;
  let estimatedSalvageValue = Number(override.salvage_value ?? truck.salvage_value ?? truck.resale_value ?? 0);
  if (!estimatedSalvageValue) {
    estimatedSalvageValue = Math.max(250000, Math.round(totalCapEx * Math.pow(1 - defaultDepreciationRate, vehicleAgeYears)));
  }

  const netTCO = totalCapEx + totalOperatingCost - estimatedSalvageValue;

  // 7. ACCURATE REAL PROFIT & ROI
  // Real Net Operating Profit = Total Freight Revenue - Total Operating Expenses
  const netProfit = totalTripRevenue - totalOperatingCost;
  const operatingMarginPercent = totalTripRevenue > 0 ? Number(((netProfit / totalTripRevenue) * 100).toFixed(1)) : 0;

  // Lifetime Asset Net Gain & Real ROI %
  const netLifetimeGain = totalTripRevenue + estimatedSalvageValue - totalCapEx - totalOperatingCost;
  const roiPercent = Number(((netLifetimeGain / totalCapEx) * 100).toFixed(1));

  const revenuePerKm = totalDistanceKm > 0 ? Number((totalTripRevenue / totalDistanceKm).toFixed(2)) : 0;
  const operatingCostPerKm = totalDistanceKm > 0 ? Number((totalOperatingCost / totalDistanceKm).toFixed(2)) : 0;
  const costPerKm = totalDistanceKm > 0 ? Number((netTCO / totalDistanceKm).toFixed(2)) : 0;

  const vehicleAgeMonths = Math.max(1, Math.round(vehicleAgeYears * 12));
  const avgMonthlyNetCashflow = netProfit / vehicleAgeMonths;
  const paybackPeriodMonths = (avgMonthlyNetCashflow > 0 && totalTripRevenue > 0) ? Math.ceil(totalCapEx / avgMonthlyNetCashflow) : 999;
  const paybackProgressPercent = Math.min(100, Math.max(0, Math.round((totalTripRevenue / totalCapEx) * 100)));

  let roiStatus = 'HIGH';
  let roiBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let roiTitle = '🚀 Outstanding ROI';

  if (roiPercent < 0) {
    roiStatus = 'NEGATIVE';
    roiBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    roiTitle = '🔻 Operating Deficit / Loss';
  } else if (roiPercent < 15) {
    roiStatus = 'LOW';
    roiBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    roiTitle = '⚠️ Low Margin ROI';
  } else if (roiPercent < 35) {
    roiStatus = 'MODERATE';
    roiBadgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    roiTitle = '📈 Healthy ROI';
  }

  // 10. Economic Replacement Tipping Point Signal
  const annualMaintDowntime = (totalMaintenanceCost + totalDowntimeCost) / vehicleAgeYears;
  const maintenanceRatio = estimatedSalvageValue > 0 ? annualMaintDowntime / estimatedSalvageValue : 0.1;

  let replacementSignal = 'MAINTAIN'; 
  let signalBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let signalTitle = '🟢 Keep & Maintain';
  let signalReason = 'Operating expenses are within healthy economic limits. Asset equity is strong.';

  if (maintenanceRatio >= 0.40 || vehicleAgeYears >= 8 || currentOdometer >= 450000) {
    replacementSignal = 'REPLACE_NOW';
    signalBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    signalTitle = '🔴 Sell / Replace Now';
    signalReason = 'Maintenance & downtime costs exceed asset depreciation rate. Selling prevents loss.';
  } else if (maintenanceRatio >= 0.25 || vehicleAgeYears >= 5 || currentOdometer >= 300000) {
    replacementSignal = 'PLAN';
    signalBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    signalTitle = '🟡 Plan Replacement (6-12 Months)';
    signalReason = 'Vehicle is approaching economic tipping point. Maintenance & downtime costs are rising.';
  }

  // 11. Year-by-Year Trend
  const yearlyTrend = [];
  const maxYears = Math.max(7, Math.ceil(vehicleAgeYears) + 2);
  let cumOpEx = 0;
  let cumRevenue = 0;
  let currentVal = totalCapEx;
  const annualKm = Math.round(totalDistanceKm / vehicleAgeYears) || 45000;
  const baseFuelPerYear = totalFuelCost / vehicleAgeYears || 0;
  const baseMaintPerYear = totalMaintenanceCost / vehicleAgeYears || 0;
  const baseRevenuePerYear = totalTripRevenue / vehicleAgeYears || 0;

  for (let yr = 1; yr <= maxYears; yr++) {
    const yrMaint = Math.round(baseMaintPerYear * Math.pow(1.15, yr - 1));
    const yrFuel = Math.round(baseFuelPerYear);
    const yrIns = insurancePerYear;
    const yrDowntime = Math.round(yr * dailyOpportunityCost);
    const yrOpEx = yrFuel + yrMaint + yrIns + yrDowntime;
    cumOpEx += yrOpEx;
    cumRevenue += baseRevenuePerYear;

    currentVal = Math.max(200000, Math.round(totalCapEx * Math.pow(0.88, yr)));

    const yrNetTCO = totalCapEx + cumOpEx - currentVal;
    const yrNetProfit = cumRevenue - cumOpEx;
    const yrROI = Number(((yrNetProfit / totalCapEx) * 100).toFixed(1));
    const yrKm = yr * annualKm;
    const yrCPKM = yrKm > 0 ? Number((yrNetTCO / yrKm).toFixed(2)) : 0;
    const isTippingPoint = yrMaint + yrDowntime > (totalCapEx * 0.15);

    yearlyTrend.push({
      year: `Year ${yr}`,
      yearNum: yr,
      capEx: totalCapEx,
      cumulativeOpEx: cumOpEx,
      cumulativeRevenue: Math.round(cumRevenue),
      cumulativeNetProfit: Math.round(yrNetProfit),
      roiPercent: yrROI,
      maintenanceCost: yrMaint,
      downtimeCost: yrDowntime,
      resaleValue: currentVal,
      netTCO: yrNetTCO,
      cpkm: yrCPKM,
      isTippingPoint
    });
  }

  return {
    truckId,
    truckNumber,
    truckName: truck.truck_name || truckNumber,
    manufacturer: truck.manufacturer || 'Tata / Ashok Leyland',
    model: truck.model || 'Goods Carrier',
    vehicleAgeYears: Number(vehicleAgeYears.toFixed(1)),
    vehicleAgeMonths,
    purchaseYear,
    totalDistanceKm,
    purchasePrice,
    bodyBuildingCost,
    totalCapEx,
    totalFuelCost,
    totalFuelLiters,
    totalMaintenanceCost,
    totalInsuranceCost,
    insurancePerYear,
    totalDowntimeCost,
    estimatedBreakdownDays,
    dailyOpportunityCost,
    estimatedSalvageValue,
    totalOperatingCost,
    netTCO,
    costPerKm,
    operatingCostPerKm,
    totalTripRevenue: Math.round(totalTripRevenue),
    totalTripsCount,
    netProfit: Math.round(netProfit),
    roiPercent,
    revenuePerKm,
    profitPerKm,
    paybackPeriodMonths,
    paybackProgressPercent,
    roiStatus,
    roiBadgeColor,
    roiTitle,
    replacementSignal,
    signalBadgeColor,
    signalTitle,
    signalReason,
    maintenanceRatio: Number((maintenanceRatio * 100).toFixed(1)),
    yearlyTrend,
    override
  };
}

/**
 * Calculates Fleet-wide TCO & ROI aggregates accurately
 */
export function calculateFleetTCOSummary(vehicleTCOList = []) {
  if (!vehicleTCOList || vehicleTCOList.length === 0) {
    return {
      totalFleetTCO: 0,
      avgFleetCPKM: 0,
      totalFleetDistance: 0,
      totalFleetCapEx: 0,
      totalFleetOperatingCost: 0,
      totalFleetSalvageValue: 0,
      totalFleetRevenue: 0,
      totalFleetNetProfit: 0,
      avgFleetROI: 0,
      avgFleetRPKM: 0,
      replaceNowCount: 0,
      planCount: 0,
      maintainCount: 0
    };
  }

  const totalFleetTCO = vehicleTCOList.reduce((sum, v) => sum + v.netTCO, 0);
  const totalFleetDistance = vehicleTCOList.reduce((sum, v) => sum + v.totalDistanceKm, 0);
  const totalFleetCapEx = vehicleTCOList.reduce((sum, v) => sum + v.totalCapEx, 0);
  const totalFleetOperatingCost = vehicleTCOList.reduce((sum, v) => sum + v.totalOperatingCost, 0);
  const totalFleetSalvageValue = vehicleTCOList.reduce((sum, v) => sum + v.estimatedSalvageValue, 0);

  const totalFleetRevenue = vehicleTCOList.reduce((sum, v) => sum + (v.totalTripRevenue || 0), 0);
  const totalFleetNetProfit = vehicleTCOList.reduce((sum, v) => sum + (v.netProfit || 0), 0);

  const avgFleetCPKM = totalFleetDistance > 0 ? Number((totalFleetTCO / totalFleetDistance).toFixed(2)) : 0;
  const avgFleetRPKM = totalFleetDistance > 0 ? Number((totalFleetRevenue / totalFleetDistance).toFixed(2)) : 0;
  const avgFleetROI = totalFleetCapEx > 0 ? Number(((totalFleetNetProfit / totalFleetCapEx) * 100).toFixed(1)) : 0;

  const replaceNowCount = vehicleTCOList.filter(v => v.replacementSignal === 'REPLACE_NOW').length;
  const planCount = vehicleTCOList.filter(v => v.replacementSignal === 'PLAN').length;
  const maintainCount = vehicleTCOList.filter(v => v.replacementSignal === 'MAINTAIN').length;

  return {
    totalFleetTCO,
    avgFleetCPKM,
    avgFleetRPKM,
    avgFleetROI,
    totalFleetRevenue,
    totalFleetNetProfit,
    totalFleetDistance,
    totalFleetCapEx,
    totalFleetOperatingCost,
    totalFleetSalvageValue,
    replaceNowCount,
    planCount,
    maintainCount
  };
}
