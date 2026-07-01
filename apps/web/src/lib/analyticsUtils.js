import pb from '@/lib/pocketbaseClient.js';
import { format, subMonths, parseISO, getQuarter, getYear, isWithinInterval } from 'date-fns';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ==========================================
// Existing Functions
// ==========================================

export const calculateGrowthPercentage = (current, previous) => {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const calculateProfitMetrics = (revenue, expenses) => {
  const profit = revenue - expenses;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  return { profit, margin };
};

export const fetchRawAnalyticsData = async (startDate, endDate) => {
  try {
    let filterStr = '';
    if (startDate && endDate) {
      filterStr = `date >= "${startDate}" && date <= "${endDate}"`;
    }

    const [tripsRes, expensesRes, trucksRes, loansRes, employeesRes, fuelTrackerRes] = await Promise.all([
      pb.collection('trip_logs').getFullList({
        filter: filterStr,
        $autoCancel: false
      }),
      pb.collection('expenses').getFullList({
        filter: filterStr,
        $autoCancel: false
      }),
      pb.collection('trucks').getFullList({
        $autoCancel: false
      }),
      pb.collection('loan_profiles').getFullList({
        $autoCancel: false
      }),
      pb.collection('employees').getFullList({
        $autoCancel: false
      }),
      pb.collection('fuel_tracker').getFullList({
        $autoCancel: false
      })
    ]);

    return { 
      trips: tripsRes, 
      expenses: expensesRes, 
      trucks: trucksRes, 
      loans: loansRes,
      employees: employeesRes,
      fuelTracker: fuelTrackerRes
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    throw error;
  }
};

export const calculateDateSpanInMonths = (startDate, endDate, trips, expenses) => {
  let start = startDate ? new Date(startDate) : null;
  let end = endDate ? new Date(endDate) : null;

  if (!start || !end) {
    let allDates = [];
    trips.forEach(t => { if (t.date) allDates.push(new Date(t.date)); });
    expenses.forEach(e => { if (e.date) allDates.push(new Date(e.date)); });

    if (allDates.length > 0) {
      start = new Date(Math.min(...allDates));
      end = new Date(Math.max(...allDates));
    }
  }

  if (!start || !end) {
    return 1;
  }

  const diffTime = Math.abs(end - start);
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const months = diffDays / 30.4375;
  return Math.max(0.1, Math.round(months * 100) / 100);
};

export const aggregateTruckAnalyticsData = (trips, expenses, trucks, loans, startDate, endDate) => {
  const dateSpanMonths = calculateDateSpanInMonths(startDate, endDate, trips, expenses);
  const normalize = (val) => (val || '').replace(/\s+/g, '').toUpperCase();

  return trucks.map(truck => {
    const truckId = truck.id;
    const truckNum = truck.truck_number;
    const normNum = normalize(truckNum);

    const matchedTrips = trips.filter(t => {
      const tripNum = t.truck_number;
      return tripNum === truckId || normalize(tripNum) === normNum;
    });

    const matchedExpenses = expenses.filter(e => {
      const expTruckId = e.truck_id;
      return expTruckId === truckId || normalize(expTruckId) === normNum;
    });

    const revenue = matchedTrips.reduce((sum, t) => sum + (Number(t.revenue) || 0), 0);
    const tripDriverAdvances = matchedTrips.reduce((sum, t) => sum + (Number(t.advance_paid_to_driver) || 0), 0);
    const kms = matchedTrips.reduce((sum, t) => sum + (Number(t.kms) || 0), 0);

    let fuel = 0;
    let toll = 0;
    let insurance = 0;
    let maintenance = 0;
    let driverSalary = 0;
    let misc = 0;

    matchedExpenses.forEach(exp => {
      const cat = (exp.category || '').toLowerCase();
      const sub = (exp.subcategory || '').toLowerCase();
      const amt = Number(exp.amount) || 0;

      if (cat === 'fuel' || sub === 'fuel') {
        fuel += amt;
      } else if (cat === 'toll' || sub === 'toll') {
        toll += amt;
      } else if (cat === 'insurance' || sub === 'insurance') {
        insurance += amt;
      } else if (sub === 'maintenance' || cat.includes('maintenance') || cat.includes('repair') || sub.includes('repair')) {
        maintenance += amt;
      } else if (cat === 'salary' || cat === 'employee advance' || sub === 'salary' || sub === 'employee advance') {
        driverSalary += amt;
      } else {
        misc += amt;
      }
    });

    const matchedLoan = loans.find(l => {
      const name = l.profileName;
      return name === truckId || normalize(name) === normNum;
    });

    let monthlyEmi = 0;
    let totalLoanAmount = 0;
    let interestRate = 0;
    let loanTerm = 0;
    let bankName = '';
    let disbursalDate = '';

    if (matchedLoan) {
      totalLoanAmount = matchedLoan.loanAmount || 0;
      interestRate = matchedLoan.interestRate || 0;
      loanTerm = matchedLoan.loanTerm || 0;
      bankName = matchedLoan.bank_name || '';
      disbursalDate = matchedLoan.disbursal_date || '';

      const p = totalLoanAmount;
      const rAnnual = interestRate;
      const n = loanTerm;

      if (p > 0 && n > 0) {
        const rMonthly = (rAnnual / 12) / 100;
        if (rMonthly === 0) {
          monthlyEmi = p / n;
        } else {
          monthlyEmi = (p * rMonthly * Math.pow(1 + rMonthly, n)) / (Math.pow(1 + rMonthly, n) - 1);
        }
      }
    }

    const totalEmi = monthlyEmi * dateSpanMonths;
    const driverExpenses = tripDriverAdvances + driverSalary;
    const totalExpenses = fuel + toll + insurance + maintenance + driverExpenses + misc + totalEmi;
    const profit = revenue - totalExpenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      id: truckId,
      truck_number: truckNum,
      truck_name: truck.truck_name,
      revenue,
      kms,
      fuel,
      toll,
      insurance,
      maintenance,
      driverExpenses,
      emi: totalEmi,
      monthlyEmi,
      misc,
      totalExpenses,
      profit,
      margin,
      hasLoan: !!matchedLoan,
      loanInfo: matchedLoan ? {
        bankName,
        totalLoanAmount,
        interestRate,
        loanTerm,
        monthlyEmi,
        disbursalDate
      } : null,
      tripsList: matchedTrips.map(t => ({
        id: t.id,
        date: t.date,
        route: t.route,
        driver_name: t.driver_name,
        kms: t.kms,
        revenue: t.revenue,
        advance: t.advance_paid_to_driver
      })).sort((a,b) => (b.date || '').localeCompare(a.date || '')),
      expensesList: matchedExpenses.map(e => ({
        id: e.id,
        date: e.date,
        category: e.category,
        subcategory: e.subcategory,
        amount: e.amount,
        description: e.description || e.notes || ''
      })).sort((a,b) => (b.date || '').localeCompare(a.date || ''))
    };
  });
};

export const aggregateMonthlyData = (trips, expenses) => {
  const monthlyMap = {};

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    const key = format(d, 'yyyy-MM');
    monthlyMap[key] = {
      month: format(d, 'MMM yyyy'),
      sortKey: key,
      revenue: 0,
      expenses: 0,
      profit: 0,
      margin: 0
    };
  }

  trips.forEach(trip => {
    if (!trip.date) return;
    const key = format(parseISO(trip.date), 'yyyy-MM');
    if (monthlyMap[key]) {
      monthlyMap[key].revenue += (Number(trip.revenue) || 0);
    }
  });

  expenses.forEach(exp => {
    if (!exp.date) return;
    const key = format(parseISO(exp.date), 'yyyy-MM');
    if (monthlyMap[key]) {
      monthlyMap[key].expenses += (Number(exp.amount) || 0);
    }
  });

  const result = Object.values(monthlyMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  
  // Calculate profit, margin, and MoM
  result.forEach((item, index) => {
    const metrics = calculateProfitMetrics(item.revenue, item.expenses);
    item.profit = metrics.profit;
    item.margin = metrics.margin;
    
    if (index > 0) {
      const prev = result[index - 1];
      item.momGrowth = calculateGrowthPercentage(item.profit, prev.profit);
    } else {
      item.momGrowth = 0;
    }
  });

  return result;
};

export const aggregateCategoryData = (expenses) => {
  const categoryMap = {};
  
  expenses.forEach(exp => {
    const cat = exp.category || 'Uncategorized';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { name: cat, value: 0 };
    }
    categoryMap[cat].value += (Number(exp.amount) || 0);
  });

  return Object.values(categoryMap).sort((a, b) => b.value - a.value);
};

export const aggregateQuarterlyData = (monthlyData) => {
  const quarterlyMap = {};

  monthlyData.forEach(month => {
    const date = parseISO(`${month.sortKey}-01`);
    const q = getQuarter(date);
    const y = getYear(date);
    const key = `Q${q} ${y}`;

    if (!quarterlyMap[key]) {
      quarterlyMap[key] = {
        quarter: key,
        sortKey: `${y}-Q${q}`,
        revenue: 0,
        expenses: 0,
        profit: 0
      };
    }

    quarterlyMap[key].revenue += month.revenue;
    quarterlyMap[key].expenses += month.expenses;
    quarterlyMap[key].profit += month.profit;
  });

  const result = Object.values(quarterlyMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  
  result.forEach((item, index) => {
    if (index > 0) {
      const prev = result[index - 1];
      item.qoqGrowth = calculateGrowthPercentage(item.profit, prev.profit);
    } else {
      item.qoqGrowth = 0;
    }
  });

  return result;
};

export const aggregateAnnualData = (monthlyData) => {
  const annualMap = {};

  monthlyData.forEach(month => {
    const y = month.sortKey.split('-')[0];
    
    if (!annualMap[y]) {
      annualMap[y] = {
        year: y,
        revenue: 0,
        expenses: 0,
        profit: 0
      };
    }

    annualMap[y].revenue += month.revenue;
    annualMap[y].expenses += month.expenses;
    annualMap[y].profit += month.profit;
  });

  const result = Object.values(annualMap).sort((a, b) => a.year.localeCompare(b.year));
  
  result.forEach((item, index) => {
    if (index > 0) {
      const prev = result[index - 1];
      item.yoyGrowth = calculateGrowthPercentage(item.profit, prev.profit);
    } else {
      item.yoyGrowth = 0;
    }
  });

  return result;
};

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '';
  const numAmount = Number(amount);
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
};

export const calculateGrowth = (current, previous) => {
  const cur = Number(current) || 0;
  const prev = Number(previous) || 0;
  if (prev === 0) return cur > 0 ? 100 : 0;
  return ((cur - prev) / Math.abs(prev)) * 100;
};

export const groupDataByMonth = (data) => {
  if (!Array.isArray(data)) return {};
  return data.reduce((acc, item) => {
    const dateStr = item.date || item.created || item.invoice_date || item.payment_date;
    if (!dateStr) return acc;
    try {
      const d = parseISO(dateStr);
      const monthKey = format(d, 'yyyy-MM');
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(item);
    } catch (e) {
      console.warn('Date parsing error for groupDataByMonth', dateStr);
    }
    return acc;
  }, {});
};

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;
  const csvStr = Papa.unparse(data);
  const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = (data, filename = 'export.pdf') => {
  if (!data || !data.length) return;
  const doc = new jsPDF('landscape');
  const headers = Object.keys(data[0]);
  const rows = data.map(item => headers.map(h => {
    const val = item[h];
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }));

  doc.autoTable({
    head: [headers],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 }
  });
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
};

export const printTable = (data) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  let tableHtml = '<table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 12px;">';
  tableHtml += '<thead><tr>';
  headers.forEach(h => {
    tableHtml += `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f8f9fa; text-align: left; text-transform: capitalize;">${h.replace(/_/g, ' ')}</th>`;
  });
  tableHtml += '</tr></thead><tbody>';
  data.forEach(row => {
    tableHtml += '<tr>';
    headers.forEach(h => {
      const val = row[h];
      const displayVal = val === null || val === undefined ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
      tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${displayVal}</td>`;
    });
    tableHtml += '</tr>';
  });
  tableHtml += '</tbody></table>';

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Document</title>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; margin: 0; padding: 20px; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
          body { font-family: sans-serif; padding: 20px; }
          h2 { margin-top: 0; color: #333; }
        </style>
      </head>
      <body>
        <h2>Data Report</h2>
        <p style="color: #666; font-size: 12px; margin-bottom: 20px;">Generated on ${format(new Date(), 'PPpp')}</p>
        ${tableHtml}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

export const exportClientAnalysisToCSV = (data, filename = 'client_analysis.csv') => {
  exportToCSV(data, filename);
};

export const exportClientAnalysisToPDF = (data, filename = 'client_analysis.pdf') => {
  if (!data || !data.length) return;
  const doc = new jsPDF('landscape');
  const headers = Object.keys(data[0]).map(h => h.replace(/_/g, ' ').toUpperCase());
  const rows = data.map(item => Object.keys(data[0]).map(h => {
    const val = item[h];
    if (val === null || val === undefined) return '';
    if (typeof val === 'number' && (h.toLowerCase().includes('amount') || h.toLowerCase().includes('revenue'))) {
      return `Rs. ${val.toLocaleString('en-IN')}`;
    }
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }));

  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text("Client Analysis Report", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 28);

  doc.autoTable({
    startY: 35,
    head: [headers],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
};

// ==========================================
// Category Monthly Analysis Functions
// ==========================================

export const calculateCategoryProfitMargin = (revenue, expenses) => {
  const profit = revenue - expenses;
  if (revenue > 0) return (profit / revenue) * 100;
  if (expenses > 0) return -100;
  return 0;
};

export const aggregateCategoryMonthlyData = (trips, expenses) => {
  const map = {};
  const categories = new Set();
  
  // Pre-fill the last 12 months
  for (let i = 11; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    map[format(d, 'yyyy-MM')] = {};
  }

  // Process Trips as 'Freight Operations' category
  const tripCategory = 'Freight Operations';
  categories.add(tripCategory);
  
  trips.forEach(t => {
    if (!t.date) return;
    const key = format(parseISO(t.date), 'yyyy-MM');
    if (!map[key]) map[key] = {};
    if (!map[key][tripCategory]) map[key][tripCategory] = { revenue: 0, expenses: 0 };
    map[key][tripCategory].revenue += (t.revenue || 0);
  });

  // Process Expenses
  expenses.forEach(e => {
    if (!e.date) return;
    const key = format(parseISO(e.date), 'yyyy-MM');
    if (!map[key]) map[key] = {};
    const cat = e.category || 'Uncategorized';
    categories.add(cat);
    if (!map[key][cat]) map[key][cat] = { revenue: 0, expenses: 0 };
    map[key][cat].expenses += (e.amount || 0);
  });

  const result = [];
  Object.keys(map).sort().forEach(monthKey => {
    const monthLabel = format(parseISO(`${monthKey}-01`), 'MMM yyyy');
    categories.forEach(cat => {
      const rev = map[monthKey][cat]?.revenue || 0;
      const exp = map[monthKey][cat]?.expenses || 0;
      const prof = rev - exp;
      const marg = calculateCategoryProfitMargin(rev, exp);
      
      result.push({
        monthKey,
        month: monthLabel,
        category: cat,
        revenue: rev,
        expenses: exp,
        profit: prof,
        margin: marg
      });
    });
  });

  return result;
};

export const getCategoryMonthlyTrend = (aggregatedData, category) => {
  return aggregatedData
    .filter(d => d.category === category)
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
};

export const formatCategoryMonthlyForChart = (aggregatedData) => {
  const monthsMap = new Map();
  const categories = Array.from(new Set(aggregatedData.map(d => d.category)));

  aggregatedData.forEach(record => {
    if (!monthsMap.has(record.monthKey)) {
      monthsMap.set(record.monthKey, {
        month: record.month,
        monthKey: record.monthKey,
        revenueData: {},
        expensesData: {},
        profitData: {}
      });
    }
    const monthData = monthsMap.get(record.monthKey);
    monthData.revenueData[record.category] = record.revenue;
    monthData.expensesData[record.category] = record.expenses;
    monthData.profitData[record.category] = record.profit;
  });

  const sortedMonths = Array.from(monthsMap.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  const revenueChart = sortedMonths.map(m => ({ month: m.month, ...m.revenueData }));
  const expensesChart = sortedMonths.map(m => ({ month: m.month, ...m.expensesData }));
  const profitChart = sortedMonths.map(m => ({ month: m.month, ...m.profitData }));

  return {
    revenueData: revenueChart,
    expensesData: expensesChart,
    profitData: profitChart,
    categories
  };
};