/**
 * breakEvenUtils.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Truck-Wise Break-Even Calculator Engine.
 *
 * Calculates:
 *   1. Monthly Fixed Overhead per vehicle (Loan EMI, Allocated Driver Salary,
 *      Insurance amortization, Road Tax, Garage/Parking overhead).
 *   2. Per-Trip Contribution Margin (Average Freight Revenue - Variable Trip Operating Costs).
 *   3. Target Monthly Trips Required to Break Even.
 *   4. Current Month's Actual Completed Trips vs Target & Net Profit/Loss.
 */

export function calculateTruckBreakEven(truck, tripLogs = [], expenses = [], options = {}) {
  const truckId = truck.id;
  const truckNumber = truck.truck_number || truck.number || 'Fleet Truck';

  // 1. Monthly Fixed Overhead
  const defaultEmi = 33410;
  const emi = Number(options.monthlyEmi ?? truck.monthly_emi ?? truck.emi_amount ?? defaultEmi);
  const driverSalary = Number(options.driverSalary ?? truck.driver_salary ?? 20000);
  const annualInsurance = Number(truck.annual_insurance ?? 42000);
  const monthlyInsurance = Math.round(annualInsurance / 12);
  const annualTaxes = Number(truck.annual_tax ?? 18000);
  const monthlyTaxes = Math.round(annualTaxes / 12);
  const parkingOverhead = Number(options.parkingOverhead ?? 4000);

  const totalMonthlyFixedCost = emi + driverSalary + monthlyInsurance + monthlyTaxes + parkingOverhead;

  // 2. Variable Trip Economics
  const vehicleTrips = (tripLogs || []).filter(t => 
    t.truck_id === truckId || 
    t.truck_number === truckNumber || 
    (truckNumber && t.truck_number && t.truck_number.toLowerCase() === truckNumber.toLowerCase())
  );

  let avgTripRevenue = 25000;
  let avgTripVariableCost = 14500;

  if (vehicleTrips.length > 0) {
    const validRevTrips = vehicleTrips.filter(t => Number(t.revenue || t.amount || 0) > 0);
    if (validRevTrips.length > 0) {
      avgTripRevenue = Math.round(validRevTrips.reduce((sum, t) => sum + Number(t.revenue || t.amount || 0), 0) / validRevTrips.length);
    }

    const totalVarCosts = vehicleTrips.reduce((sum, t) => {
      const fuel = Number(t.fuel_cost || t.fuel_expense || 0);
      const toll = Number(t.toll_deduction || t.fastag_deduction || 0);
      const adv = Number(t.advance_paid_to_driver || t.driver_bata || 0);
      const totalExp = Number(t.total_trip_expense || 0);
      return sum + Math.max(fuel + toll + adv, totalExp);
    }, 0);

    if (totalVarCosts > 0) {
      avgTripVariableCost = Math.round(totalVarCosts / vehicleTrips.length);
    }
  }

  // Allow overrides from interactive simulation sliders
  if (options.avgTripRevenue) avgTripRevenue = Number(options.avgTripRevenue);
  if (options.avgTripVariableCost) avgTripVariableCost = Number(options.avgTripVariableCost);

  // Net Contribution Margin per Trip
  const contributionMargin = Math.max(2500, avgTripRevenue - avgTripVariableCost);

  // Target Trips to Break Even
  const targetProfit = Number(options.targetProfit || 0);
  const targetTrips = Math.max(1, Math.ceil((totalMonthlyFixedCost + targetProfit) / contributionMargin));

  // Actual Completed Trips This Month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const completedTripsThisMonth = vehicleTrips.filter(t => {
    const tripDate = t.date ? new Date(t.date) : (t.created ? new Date(t.created) : null);
    if (!tripDate || isNaN(tripDate.getTime())) return false;
    const isThisMonth = tripDate.getFullYear() === currentYear && tripDate.getMonth() === currentMonth;
    const isCompleted = t.trip_status === 'Delivered' || t.trip_status === 'Completed' || t.status === 'Completed';
    return isThisMonth && isCompleted;
  }).length;

  const remainingTrips = Math.max(0, targetTrips - completedTripsThisMonth);
  const progressPercent = Math.min(100, Math.round((completedTripsThisMonth / targetTrips) * 100));

  // Current Net Result (Revenue - Variable Costs - Fixed Cost Allocation)
  const monthlyContributionGenerated = completedTripsThisMonth * contributionMargin;
  const netMonthlyProfitOrLoss = monthlyContributionGenerated - totalMonthlyFixedCost;

  let statusKey = 'IN_THE_RED';
  let statusLabel = `In the Red (${remainingTrips} trips left)`;
  let statusBadge = 'bg-rose-500/15 text-rose-400 border-rose-500/30';

  if (completedTripsThisMonth >= targetTrips) {
    statusKey = 'PROFITABLE';
    statusLabel = `Profitable (+₹${Math.round(netMonthlyProfitOrLoss).toLocaleString('en-IN')})`;
    statusBadge = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  } else if (progressPercent >= 80) {
    statusKey = 'NEAR_BREAK_EVEN';
    statusLabel = `Near Break-Even (${remainingTrips} trips left)`;
    statusBadge = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  }

  return {
    truckId,
    truckNumber,
    truckType: truck.truck_type || truck.vehicle_type || 'Commercial Freight',
    driverName: truck.assigned_driver_name || truck.driver_name || 'Designated Driver',
    totalMonthlyFixedCost,
    fixedCostBreakdown: {
      emi,
      driverSalary,
      monthlyInsurance,
      monthlyTaxes,
      parkingOverhead
    },
    avgTripRevenue,
    avgTripVariableCost,
    contributionMargin,
    targetTrips,
    completedTripsThisMonth,
    remainingTrips,
    progressPercent,
    netMonthlyProfitOrLoss,
    statusKey,
    statusLabel,
    statusBadge
  };
}

export function calculateFleetBreakEvenSummary(truckBreakEvenList = []) {
  const totalFleetFixedCost = truckBreakEvenList.reduce((sum, item) => sum + item.totalMonthlyFixedCost, 0);
  const totalTargetTrips = truckBreakEvenList.reduce((sum, item) => sum + item.targetTrips, 0);
  const totalCompletedTrips = truckBreakEvenList.reduce((sum, item) => sum + item.completedTripsThisMonth, 0);
  const totalRemainingTrips = Math.max(0, totalTargetTrips - totalCompletedTrips);
  const overallProgressPercent = totalTargetTrips > 0 
    ? Math.min(100, Math.round((totalCompletedTrips / totalTargetTrips) * 100))
    : 0;

  const profitableTrucks = truckBreakEvenList.filter(item => item.statusKey === 'PROFITABLE').length;
  const breakEvenTrucks = truckBreakEvenList.filter(item => item.statusKey === 'NEAR_BREAK_EVEN').length;
  const redTrucks = truckBreakEvenList.filter(item => item.statusKey === 'IN_THE_RED').length;

  return {
    totalFleetFixedCost,
    totalTargetTrips,
    totalCompletedTrips,
    totalRemainingTrips,
    overallProgressPercent,
    profitableTrucks,
    breakEvenTrucks,
    redTrucks,
    totalTrucks: truckBreakEvenList.length
  };
}
