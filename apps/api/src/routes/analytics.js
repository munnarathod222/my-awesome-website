import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper to calculate monthly EMI
const getMonthlyEMI = (loanAmount, interestRate, loanTerm) => {
  const P = Number(loanAmount) || 0;
  const annualRate = Number(interestRate) || 0;
  const n = Number(loanTerm) || 0;
  
  if (P <= 0 || n <= 0) return 0;
  
  const r = annualRate / 12 / 100;
  if (r <= 0) return P / n;
  
  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Number(emi.toFixed(2));
};

// Helper to check if loan EMI is active in a given YYYY-MM month
const isLoanActiveInMonth = (loan, targetYear, targetMonth) => {
  const startStr = loan.first_emi_date || loan.disbursal_date || loan.created;
  if (!startStr) return true; // fallback to active if no date exists

  try {
    const startDate = new Date(startStr);
    const targetDate = new Date(targetYear, targetMonth - 1, 15); // middle of month to avoid TZ issues
    const termMonths = Number(loan.loanTerm) || 0;
    
    // Calculate end date by adding termMonths
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + termMonths);
    
    return targetDate >= startDate && targetDate <= endDate;
  } catch (e) {
    return true;
  }
};

/**
 * GET /analytics/pl-matrix
 * Fetches data-rich P&L Matrix for Fleet Overview or Truck-by-Truck Analysis
 */
router.get('/pl-matrix', async (req, res) => {
  const { vehicleId } = req.query;
  
  try {
    let truckFilterText = '';
    let expenseFilterText = '';
    let loanFilterText = '';
    let truckNumber = '';

    // If vehicleId is specified, fetch the truck and set filters
    if (vehicleId && vehicleId !== 'all') {
      try {
        const truck = await pb.collection('trucks').getOne(vehicleId, { $autoCancel: false });
        truckNumber = truck.truck_number;
        truckFilterText = `truck_number = "${truckNumber}"`;
        expenseFilterText = `truck_id = "${vehicleId}"`;
        loanFilterText = `profileName = "${truckNumber}"`;
      } catch (err) {
        logger.error(`Error looking up vehicle ID ${vehicleId}:`, err);
        return res.status(404).json({ error: 'Selected truck not found' });
      }
    }

    // Fetch Delivered Trip Logs only (Upcoming/Dispatched/In Transit excluded from P&L)
    const tripFilter = `trip_status = "Delivered"${truckFilterText ? ' && ' + truckFilterText : ''}`;
    const trips = await pb.collection('trip_logs').getFullList({
      filter: tripFilter,
      $autoCancel: false
    });

    // Fetch Expenses
    const expenseFilter = expenseFilterText;
    const expenses = await pb.collection('expenses').getFullList({
      filter: expenseFilter || undefined,
      $autoCancel: false
    });

    // Fetch Loan Profiles (EMI)
    const loanFilter = loanFilterText;
    const loans = await pb.collection('loan_profiles').getFullList({
      filter: loanFilter || undefined,
      $autoCancel: false
    });

    // Grouping structure by YYYY-MM
    const monthlyGroups = {};

    // Helper to initialize a month
    const initMonth = (yearMonth) => {
      if (!monthlyGroups[yearMonth]) {
        monthlyGroups[yearMonth] = {
          month: yearMonth,
          revenue: 0,
          expenses: {
            fuelFastag: 0,
            salaryAdvance: 0,
            maintenance: 0,
            fixedEmi: 0,
            other: 0,
            total: 0
          },
          netProfit: 0
        };
      }
    };

    // 1. Process Revenue (Completed Trips)
    trips.forEach(trip => {
      if (!trip.date) return;
      const yearMonth = trip.date.substring(0, 7); // "YYYY-MM"
      initMonth(yearMonth);
      
      const revAmt = Number(trip.revenue) || 0;
      monthlyGroups[yearMonth].revenue += revAmt;
    });

    // 2. Process Expenses
    expenses.forEach(exp => {
      if (!exp.date) return;
      const yearMonth = exp.date.substring(0, 7); // "YYYY-MM"
      initMonth(yearMonth);
      
      const amt = Number(exp.amount) || 0;
      const category = exp.category || '';
      const subcat = exp.subcategory || '';
      
      const targetExp = monthlyGroups[yearMonth].expenses;
      
      if (category === 'Fuel' || category === 'FASTag') {
        targetExp.fuelFastag += amt;
      } else if (category === 'Salary' || category === 'Employee Advance' || category === 'Advance' || category === 'Employee') {
        targetExp.salaryAdvance += amt;
      } else if (category === 'Maintenance' || subcat === 'Maintenance') {
        targetExp.maintenance += amt;
      } else {
        targetExp.other += amt;
      }
      
      targetExp.total += amt;
    });

    // 3. Process EMIs
    // Since EMIs are monthly fixed obligations, we populate them for every active month 
    // represented in our transaction dates (or default to past 12 months)
    const activeMonths = Object.keys(monthlyGroups);
    
    // If no months are active, default to current/recent months
    if (activeMonths.length === 0) {
      const today = new Date();
      for (let i = 0; i < 12; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const ym = d.toISOString().substring(0, 7);
        activeMonths.push(ym);
        initMonth(ym);
      }
    }

    activeMonths.forEach(ym => {
      const [year, month] = ym.split('-').map(Number);
      let monthEmiTotal = 0;

      loans.forEach(loan => {
        if (isLoanActiveInMonth(loan, year, month)) {
          const emi = getMonthlyEMI(loan.loanAmount, loan.interestRate, loan.loanTerm);
          monthEmiTotal += emi;
        }
      });

      const targetExp = monthlyGroups[ym].expenses;
      targetExp.fixedEmi = monthEmiTotal;
      targetExp.total += monthEmiTotal;
    });

    // 4. Calculate Net Profit and format P&L Matrix
    const matrix = Object.values(monthlyGroups).map(g => {
      // Calculate Net Profit
      const totalRev = Number(g.revenue.toFixed(2));
      const totalExp = Number(g.expenses.total.toFixed(2));
      const netProf = Number((totalRev - totalExp).toFixed(2));
      
      return {
        month: g.month,
        revenue: totalRev,
        expenses: {
          fuelFastag: Number(g.expenses.fuelFastag.toFixed(2)),
          salaryAdvance: Number(g.expenses.salaryAdvance.toFixed(2)),
          maintenance: Number(g.expenses.maintenance.toFixed(2)),
          fixedEmi: Number(g.expenses.fixedEmi.toFixed(2)),
          other: Number(g.expenses.other.toFixed(2)),
          total: totalExp
        },
        netProfit: netProf
      };
    });

    // Sort descending by month
    matrix.sort((a, b) => b.month.localeCompare(a.month));

    res.json({
      success: true,
      matrix,
      truckNumber: truckNumber || 'All Fleet'
    });

  } catch (error) {
    logger.error('Error fetching P&L Matrix:', error);
    res.status(500).json({ error: 'Failed to compute P&L Matrix analytics' });
  }
});

/**
 * GET /analytics/truck-pnl
 * Individual Truck-wise Profit & Loss statement including EMI, Insurance, Road Tax, Repairs & Depreciation.
 */
router.get('/truck-pnl', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const end = endDate ? new Date(endDate + 'T23:59:59.999Z') : new Date();
    const start = startDate ? new Date(startDate + 'T00:00:00.000Z') : new Date(end.getFullYear(), end.getMonth(), 1);
    const daysInPeriod = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
    const monthsFactor = daysInPeriod / 30.4375;
    const yearsFactor = daysInPeriod / 365;

    const [trucks, trips, fuelLogs, maintLogs, expenses] = await Promise.all([
      pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false }).catch(() => []),
      pb.collection('trip_logs').getFullList({ $autoCancel: false }).catch(() => []),
      pb.collection('expenses_fuel').getFullList({ $autoCancel: false }).catch(() => []),
      pb.collection('expenses_maintenance').getFullList({ $autoCancel: false }).catch(() => []),
      pb.collection('expenses').getFullList({ $autoCancel: false }).catch(() => [])
    ]);

    const inRange = (dStr) => {
      if (!dStr) return false;
      const t = new Date(dStr).getTime();
      return !isNaN(t) && t >= start.getTime() && t <= end.getTime();
    };

    const statements = trucks.map(truck => {
      const tNum = (truck.truck_number || '').trim().toUpperCase();
      const tId = truck.id;

      const truckTrips = trips.filter(tr => {
        const tn = (tr.truck_number || '').trim().toUpperCase();
        return tn === tNum && inRange(tr.date || tr.created) && (tr.trip_status || '') !== 'Cancelled';
      });

      const revenue = truckTrips.reduce((s, tr) => s + (Number(tr.revenue) || Number(tr.freight_amount) || 0), 0);
      const totalKms = truckTrips.reduce((s, tr) => s + (Number(tr.kms) || Number(tr.distance) || 0), 0);
      const driverBatta = truckTrips.reduce((s, tr) => s + (Number(tr.driver_batta) || Number(tr.enroute_expenses) || 0), 0);
      const tollCost = truckTrips.reduce((s, tr) => s + (Number(tr.fastag_toll) || Number(tr.toll_charges) || 0), 0);

      const fuelCost = fuelLogs
        .filter(f => (f.truck_id === tId || (f.truck_number || '').trim().toUpperCase() === tNum) && inRange(f.date || f.created))
        .reduce((s, f) => s + (Number(f.amount) || Number(f.total_cost) || 0), 0);

      const repairCost = maintLogs
        .filter(m => (m.truck_id === tId || (m.truck_number || '').trim().toUpperCase() === tNum) && inRange(m.date || m.created))
        .reduce((s, m) => s + (Number(m.amount) || Number(m.cost) || 0), 0);

      const extraRepair = expenses
        .filter(e => (e.truck_id === tId || (e.truck_number || '').trim().toUpperCase() === tNum) && inRange(e.date || e.created) && /repair|maint|tyre|service|battery/i.test(e.category || ''))
        .reduce((s, e) => s + (Number(e.amount) || 0), 0);

      const repairsTotal = repairCost + extraRepair;
      const variableTotal = fuelCost + tollCost + driverBatta + repairsTotal;
      const grossProfit = revenue - variableTotal;

      // Fixed ownership costs pro-rated to period
      const monthlyEmi = Number(truck.monthly_emi_amount) || 0;
      const annualIns = Number(truck.annual_insurance_cost) || 0;
      const annualTax = Number(truck.annual_road_tax_cost) || 0;
      const purchasePrice = Number(truck.purchase_price) || 0;
      const depRate = Number(truck.annual_depreciation_rate) || (purchasePrice > 0 ? 15 : 0);

      const emiCost = monthlyEmi * monthsFactor;
      const insuranceCost = annualIns * yearsFactor;
      const taxCost = annualTax * yearsFactor;
      const depreciationCost = purchasePrice * (depRate / 100) * yearsFactor;
      const fixedTotal = emiCost + insuranceCost + taxCost + depreciationCost;

      const netProfit = grossProfit - fixedTotal;
      const netMarginPct = revenue > 0 ? Number(((netProfit / revenue) * 100).toFixed(1)) : 0;

      return {
        truck_id: tId,
        truck_number: truck.truck_number,
        truck_size: truck.truck_size || truck.vehicle_class || '32 FT',
        trips_count: truckTrips.length,
        total_kms: Math.round(totalKms),
        revenue: Math.round(revenue),
        variable_costs: {
          fuel: Math.round(fuelCost),
          tolls: Math.round(tollCost),
          driver_batta: Math.round(driverBatta),
          repairs: Math.round(repairsTotal),
          total: Math.round(variableTotal)
        },
        gross_profit: Math.round(grossProfit),
        fixed_costs: {
          emi: Math.round(emiCost),
          insurance: Math.round(insuranceCost),
          road_tax: Math.round(taxCost),
          depreciation: Math.round(depreciationCost),
          total: Math.round(fixedTotal)
        },
        net_profit: Math.round(netProfit),
        net_margin_pct: netMarginPct
      };
    });

    statements.sort((a, b) => b.net_profit - a.net_profit);

    res.json({
      success: true,
      period: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0], days: daysInPeriod },
      statements
    });
  } catch (err) {
    logger.error('Error computing truck-wise P&L:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
