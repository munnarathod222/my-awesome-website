/**
 * Trip Cost & Profitability Engine for Jai Bhavani Cargo
 * 
 * Auto-calculates full trip operating economics:
 * - Fuel Cost (Loaded Distance / Loaded Mileage + Empty Distance / Empty Mileage) × Diesel Price
 * - Toll & FASTag Charges
 * - Driver Salary & Trip Allowance
 * - Maintenance & Tyre Wear per KM
 * - Monthly Fixed Cost Allocation (EMI, Insurance, Road Tax, Fitness, GPS)
 * - Return Load / Backhaul Economic Impact
 * - Sensitivity Matrices (Fuel Price ±₹5, ±₹10, ±₹15 and Mileage 5, 6, 7 KM/L)
 */

export const DEFAULT_DIESEL_PRICE = 103.85;

export const DEFAULT_VEHICLE_COST_PROFILES = {
  '20FT SXL': {
    loadedMileage: 5.8,
    emptyMileage: 7.0,
    maintenancePerKm: 3.0,
    tyrePerKm: 1.0,
    driverCostPerDay: 1350,
    monthlyFixedCost: 55000,
    avgMonthlyKm: 9000,
    defaultTollPerKm: 3.2,
    defaultPayloadTons: 6.0
  },
  '24FT SXL': {
    loadedMileage: 5.4,
    emptyMileage: 6.5,
    maintenancePerKm: 3.2,
    tyrePerKm: 1.2,
    driverCostPerDay: 1400,
    monthlyFixedCost: 58000,
    avgMonthlyKm: 9000,
    defaultTollPerKm: 3.4,
    defaultPayloadTons: 7.5
  },
  '32FT SXL': {
    loadedMileage: 5.2,
    emptyMileage: 6.2,
    maintenancePerKm: 3.5,
    tyrePerKm: 1.5,
    driverCostPerDay: 1500,
    monthlyFixedCost: 65000,
    avgMonthlyKm: 10000,
    defaultTollPerKm: 3.8,
    defaultPayloadTons: 9.0
  },
  '32FT MXL': {
    loadedMileage: 4.6,
    emptyMileage: 5.8,
    maintenancePerKm: 4.0,
    tyrePerKm: 2.0,
    driverCostPerDay: 1600,
    monthlyFixedCost: 75000,
    avgMonthlyKm: 10000,
    defaultTollPerKm: 4.5,
    defaultPayloadTons: 15.0
  },
  'DEFAULT': {
    loadedMileage: 5.2,
    emptyMileage: 6.5,
    maintenancePerKm: 3.5,
    tyrePerKm: 1.5,
    driverCostPerDay: 1450,
    monthlyFixedCost: 60000,
    avgMonthlyKm: 9500,
    defaultTollPerKm: 3.5,
    defaultPayloadTons: 7.0
  }
};

/**
 * Get profile for vehicle type
 */
export const getVehicleCostProfile = (truckType) => {
  const normType = (truckType || '').toUpperCase().trim();
  for (const [key, val] of Object.entries(DEFAULT_VEHICLE_COST_PROFILES)) {
    if (normType.includes(key.replace(/\s+/g, '')) || key.includes(normType)) {
      return { ...val, type: key };
    }
  }
  return { ...DEFAULT_VEHICLE_COST_PROFILES.DEFAULT, type: '32FT SXL' };
};

/**
 * Calculate complete trip cost breakdown
 */
export const calculateTripCost = ({
  distanceKm = 590,
  emptyKm = 0,
  returnDistanceKm = 0,
  truckType = '20FT SXL',
  dieselPrice = DEFAULT_DIESEL_PRICE,
  customMileageLoaded = null,
  customMileageEmpty = null,
  manualToll = null,
  driverAllowance = null,
  tripDays = null,
  returnLoadFreight = 0,
  returnLoadAvailable = false,
  customMaintenancePerKm = null
}) => {
  const profile = getVehicleCostProfile(truckType);

  const distLoaded = Math.max(0, Number(distanceKm || 0));
  const distEmpty = Math.max(0, Number(emptyKm || 0));
  const distReturn = returnLoadAvailable ? Math.max(0, Number(returnDistanceKm || distLoaded)) : 0;
  const totalTripKm = distLoaded + distEmpty + distReturn;

  const loadedMileage = Number(customMileageLoaded || profile.loadedMileage);
  const emptyMileage = Number(customMileageEmpty || profile.emptyMileage);
  const maintRate = Number(customMaintenancePerKm || profile.maintenancePerKm);
  const tyreRate = Number(profile.tyrePerKm);

  // Estimated trip duration (avg 400km/day)
  const estimatedDays = tripDays ? Number(tripDays) : Math.max(1, Math.ceil(totalTripKm / 400));

  // 1. Fuel Calculation
  const fuelLitersLoaded = distLoaded > 0 && loadedMileage > 0 ? (distLoaded / loadedMileage) : 0;
  const fuelLitersEmpty = distEmpty > 0 && emptyMileage > 0 ? (distEmpty / emptyMileage) : 0;
  const fuelLitersReturn = distReturn > 0 && loadedMileage > 0 ? (distReturn / loadedMileage) : 0;
  const totalFuelLiters = Number((fuelLitersLoaded + fuelLitersEmpty + fuelLitersReturn).toFixed(1));
  const fuelCost = Math.round(totalFuelLiters * Number(dieselPrice || DEFAULT_DIESEL_PRICE));

  // 2. Toll Calculation
  let tollCost = 0;
  if (manualToll !== null && manualToll !== undefined && Number(manualToll) >= 0) {
    tollCost = Math.round(Number(manualToll));
  } else {
    // Toll for loaded + return if applicable
    const tollKm = distLoaded + distReturn;
    tollCost = Math.round(tollKm * profile.defaultTollPerKm);
  }

  // 3. Driver Cost
  const driverDaily = Number(driverAllowance !== null && driverAllowance !== undefined ? driverAllowance : profile.driverCostPerDay);
  const driverCost = Math.round(estimatedDays * driverDaily);

  // 4. Maintenance & Tyres
  const maintenanceCost = Math.round(totalTripKm * maintRate);
  const tyreCost = Math.round(totalTripKm * tyreRate);

  // 5. Fixed Cost Allocation (EMI, Insurance, Fitness, GPS)
  const fixedPerKm = profile.avgMonthlyKm > 0 ? (profile.monthlyFixedCost / profile.avgMonthlyKm) : 6.0;
  const fixedCostAllocation = Math.round(totalTripKm * fixedPerKm);

  // 6. Miscellaneous (Permits, Tea/Food, Parking, Minor Road Expenses)
  const miscCost = Math.round(estimatedDays * 350);

  // Total One-Way / Round-Trip Operating Cost
  const totalCost = fuelCost + tollCost + driverCost + maintenanceCost + tyreCost + fixedCostAllocation + miscCost;
  const costPerKm = totalTripKm > 0 ? Number((totalCost / totalTripKm).toFixed(2)) : 0;

  // Minimum Acceptable Rate (Cost + 12% baseline operating safety buffer)
  const minProfitableBid = Math.round((totalCost * 1.12) / 100) * 100;

  return {
    totalTripKm,
    loadedKm: distLoaded,
    emptyKm: distEmpty,
    returnKm: distReturn,
    totalFuelLiters,
    fuelCost,
    tollCost,
    driverCost,
    maintenanceCost,
    tyreCost,
    fixedCostAllocation,
    miscCost,
    totalCost,
    costPerKm,
    minProfitableBid,
    estimatedDays,
    dieselPrice: Number(dieselPrice || DEFAULT_DIESEL_PRICE),
    loadedMileage,
    emptyMileage,
    returnLoadEconomics: {
      available: returnLoadAvailable,
      returnFreight: Number(returnLoadFreight || 0),
      combinedRoundTripCost: totalCost,
      netOutboundBurden: returnLoadAvailable ? Math.max(0, totalCost - Number(returnLoadFreight || 0)) : totalCost
    }
  };
};

/**
 * Fuel & Mileage Sensitivity Matrix Generator
 */
export const calculateSensitivityMatrix = ({ distanceKm = 590, truckType = '20FT SXL', dieselPrice = DEFAULT_DIESEL_PRICE, quotedRate = 22000 }) => {
  const baseCost = calculateTripCost({ distanceKm, truckType, dieselPrice });
  const priceVariations = [-10, -5, 0, 5, 10, 15];
  const mileageVariations = [4.5, 5.2, 5.8, 6.5, 7.0];

  const fuelSensitivity = priceVariations.map(delta => {
    const testPrice = dieselPrice + delta;
    const testCalc = calculateTripCost({ distanceKm, truckType, dieselPrice: testPrice });
    const profit = quotedRate - testCalc.totalCost;
    const margin = quotedRate > 0 ? ((profit / quotedRate) * 100).toFixed(1) : 0;
    return {
      delta,
      dieselPrice: testPrice.toFixed(2),
      fuelCost: testCalc.fuelCost,
      totalCost: testCalc.totalCost,
      profit,
      margin
    };
  });

  const mileageSensitivity = mileageVariations.map(kmpl => {
    const testCalc = calculateTripCost({ distanceKm, truckType, dieselPrice, customMileageLoaded: kmpl });
    const profit = quotedRate - testCalc.totalCost;
    const margin = quotedRate > 0 ? ((profit / quotedRate) * 100).toFixed(1) : 0;
    return {
      mileage: kmpl,
      fuelCost: testCalc.fuelCost,
      totalCost: testCalc.totalCost,
      profit,
      margin
    };
  });

  return { fuelSensitivity, mileageSensitivity, baseTripCost: baseCost.totalCost };
};
