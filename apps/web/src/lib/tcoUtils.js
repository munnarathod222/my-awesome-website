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
 * Calculates Total Cost of Ownership (TCO) metrics & replacement tipping point signal for a vehicle.
 */
export function calculateVehicleTCO(truck, fuelLogs = [], maintenanceLogs = [], expenses = []) {
  const truckId = truck.id;
  const truckNumber = truck.truck_number;

  // Check for custom TCO overrides edited by user
  const override = getTruckTCOOverride(truckId) || getTruckTCOOverride(truckNumber) || {};

  // 1. Initial CapEx (Purchase price, body building, registration)
  const purchasePrice = Number(override.purchase_price ?? truck.purchase_price ?? truck.initial_cost ?? 3200000);
  const bodyBuildingCost = Number(override.body_building_cost ?? truck.body_building_cost ?? 350000);
  const totalCapEx = purchasePrice + bodyBuildingCost;

  // 2. Odometer & Age
  const currentOdometer = Number(override.odometer_km ?? truck.odometer_km ?? truck.current_km ?? 145000);
  const purchaseYear = Number(override.year_of_manufacture ?? truck.year_of_manufacture ?? (truck.purchase_date ? new Date(truck.purchase_date).getFullYear() : 2020));
  const currentYear = new Date().getFullYear();
  const vehicleAgeYears = Math.max(0.5, currentYear - purchaseYear + (new Date().getMonth() / 12));

  // 3. Cumulative Fuel Costs
  const vehicleFuelLogs = fuelLogs.filter(f => f.truck_id === truckId || f.truck_number === truckNumber || f.vehicle_name?.includes(truckNumber));
  const totalFuelCost = vehicleFuelLogs.reduce((sum, f) => sum + Number(f.total_cost || f.cost || 0), 0);
  const totalFuelLiters = vehicleFuelLogs.reduce((sum, f) => sum + Number(f.liters || 0), 0);
  const totalFuelDistance = vehicleFuelLogs.reduce((sum, f) => sum + Number(f.distance || f.distance_driven || 0), 0);
  
  // Use tracked odometer or logged fuel distance
  const totalDistanceKm = Math.max(currentOdometer, totalFuelDistance, 1000);

  // 4. Cumulative Maintenance & Repair Costs
  const vehicleMaintLogs = maintenanceLogs.filter(m => m.truck_id === truckId || m.truck_number === truckNumber);
  const vehicleMaintExpenses = expenses.filter(e => 
    (e.truck_id === truckId || e.truck_id === truckNumber) && 
    (e.subcategory === 'Maintenance' || e.subcategory === 'Repairs' || e.category === 'Maintenance')
  );
  
  const totalMaintCostLogs = vehicleMaintLogs.reduce((sum, m) => sum + Number(m.cost || m.total_cost || 0), 0);
  const totalMaintCostExpenses = vehicleMaintExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const overrideMaintCost = override.manual_maintenance_cost ? Number(override.manual_maintenance_cost) : 0;
  const totalMaintenanceCost = Math.max(totalMaintCostLogs, totalMaintCostExpenses, Number(truck.total_maintenance_cost || 0), overrideMaintCost);

  // 5. Cumulative Insurance, Tax & Permits
  const insurancePerYear = Number(override.annual_insurance ?? truck.annual_insurance ?? 45000);
  const totalInsuranceCost = Math.round(insurancePerYear * vehicleAgeYears);

  // 6. Downtime Opportunity Cost
  const recordedBreakdownDays = vehicleMaintLogs.reduce((sum, m) => sum + Number(m.downtime_days || 0), 0);
  const estimatedBreakdownDays = override.breakdown_days !== undefined ? Number(override.breakdown_days) : (recordedBreakdownDays || Math.round(vehicleAgeYears * 4));
  const dailyOpportunityCost = Number(override.daily_opportunity_cost ?? truck.daily_opportunity_cost ?? 5000);
  const totalDowntimeCost = estimatedBreakdownDays * dailyOpportunityCost;

  // 7. Estimated Resale / Salvage Market Value
  const defaultDepreciationRate = 0.15;
  let estimatedSalvageValue = Number(override.salvage_value ?? truck.salvage_value ?? truck.resale_value ?? 0);
  if (!estimatedSalvageValue) {
    estimatedSalvageValue = Math.max(300000, Math.round(totalCapEx * Math.pow(1 - defaultDepreciationRate, vehicleAgeYears)));
  }

  // 8. Net Total Cost of Ownership
  const totalOperatingCost = totalFuelCost + totalMaintenanceCost + totalInsuranceCost + totalDowntimeCost;
  const netTCO = totalCapEx + totalOperatingCost - estimatedSalvageValue;
  const costPerKm = Number((netTCO / totalDistanceKm).toFixed(2));
  const operatingCostPerKm = Number((totalOperatingCost / totalDistanceKm).toFixed(2));

  // 9. Economic Replacement Tipping Point Signal
  const annualMaintDowntime = (totalMaintenanceCost + totalDowntimeCost) / vehicleAgeYears;
  const maintenanceRatio = annualMaintDowntime / estimatedSalvageValue;

  let replacementSignal = 'MAINTAIN'; 
  let signalBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let signalTitle = '🟢 Keep & Maintain';
  let signalReason = 'Operating expenses are well within economic limits. Maintenance is optimal.';

  if (maintenanceRatio >= 0.40 || vehicleAgeYears >= 8 || currentOdometer >= 450000) {
    replacementSignal = 'REPLACE_NOW';
    signalBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    signalTitle = '🔴 Sell / Replace Now';
    signalReason = 'Cumulative maintenance & breakdown downtime costs exceed annual depreciation. TCO per KM has peaked; selling now prevents financial loss.';
  } else if (maintenanceRatio >= 0.25 || vehicleAgeYears >= 5 || currentOdometer >= 300000) {
    replacementSignal = 'PLAN';
    signalBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    signalTitle = '🟡 Plan Replacement (6-12 Months)';
    signalReason = 'Vehicle is approaching economic tipping point. Maintenance & downtime costs are rising above 25% of asset equity.';
  }

  // 10. Year-by-Year TCO Progression Curve Data for Charts
  const yearlyTrend = [];
  const maxYears = Math.max(10, Math.ceil(vehicleAgeYears) + 2);
  let cumOpEx = 0;
  let currentVal = totalCapEx;
  const annualKm = Math.round(totalDistanceKm / vehicleAgeYears) || 60000;
  const baseFuelPerYear = totalFuelCost / vehicleAgeYears || (annualKm * 18);
  const baseMaintPerYear = (totalMaintenanceCost / vehicleAgeYears) || 60000;

  for (let yr = 1; yr <= maxYears; yr++) {
    const yrMaint = Math.round(baseMaintPerYear * Math.pow(1.18, yr - 1));
    const yrFuel = Math.round(baseFuelPerYear);
    const yrIns = insurancePerYear;
    const yrDowntime = Math.round((yr * 2) * dailyOpportunityCost);
    const yrOpEx = yrFuel + yrMaint + yrIns + yrDowntime;
    cumOpEx += yrOpEx;
    currentVal = Math.max(250000, Math.round(totalCapEx * Math.pow(0.85, yr)));

    const yrNetTCO = totalCapEx + cumOpEx - currentVal;
    const yrKm = yr * annualKm;
    const yrCPKM = Number((yrNetTCO / yrKm).toFixed(2));
    const isTippingPoint = yrMaint + yrDowntime > (totalCapEx * 0.12);

    yearlyTrend.push({
      year: `Year ${yr}`,
      yearNum: yr,
      capEx: totalCapEx,
      cumulativeOpEx: cumOpEx,
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
    model: truck.model || 'Commercial Goods Carrier',
    vehicleAgeYears: Number(vehicleAgeYears.toFixed(1)),
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
 * Calculates Fleet-wide TCO aggregates
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

  const avgFleetCPKM = totalFleetDistance > 0 ? Number((totalFleetTCO / totalFleetDistance).toFixed(2)) : 0;

  const replaceNowCount = vehicleTCOList.filter(v => v.replacementSignal === 'REPLACE_NOW').length;
  const planCount = vehicleTCOList.filter(v => v.replacementSignal === 'PLAN').length;
  const maintainCount = vehicleTCOList.filter(v => v.replacementSignal === 'MAINTAIN').length;

  return {
    totalFleetTCO,
    avgFleetCPKM,
    totalFleetDistance,
    totalFleetCapEx,
    totalFleetOperatingCost,
    totalFleetSalvageValue,
    replaceNowCount,
    planCount,
    maintainCount
  };
}
