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

    // Fetch Completed Trip Logs (Revenue)
    const tripFilter = `trip_status = "Completed"${truckFilterText ? ' && ' + truckFilterText : ''}`;
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
      } else if (category === 'Salary' || category === 'Employee Advance' || category === 'Advance') {
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

export default router;
