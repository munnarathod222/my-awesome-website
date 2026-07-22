import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, TrendingUp, TrendingDown, Wallet, PieChart as PieChartIcon, BarChart3, 
  CalendarDays, BarChart as BarChartIcon, Truck, AlertCircle, Calendar, 
  MapPin, User, FileText, CheckCircle2, ChevronDown 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  fetchRawAnalyticsData, 
  aggregateMonthlyData, 
  aggregateCategoryData, 
  aggregateQuarterlyData, 
  aggregateAnnualData,
  aggregateCategoryMonthlyData,
  formatCategoryMonthlyForChart,
  aggregateTruckAnalyticsData,
  calculateDateSpanInMonths
} from '@/lib/analyticsUtils.js';
import AnalyticsFilters from '@/components/AnalyticsFilters.jsx';
import MonthlyAnalyticsTable from '@/components/MonthlyAnalyticsTable.jsx';
import QuarterlyAnalysisSummary from '@/components/QuarterlyAnalysisSummary.jsx';
import AnnualAnalysisSummary from '@/components/AnnualAnalysisSummary.jsx';
import { MonthlyTrendChart, CategoryPieChart, QuarterlyComparisonChart } from '@/components/ChartComponents.jsx';
import CategoryMonthlyTable from '@/components/CategoryMonthlyTable.jsx';
import CategoryMonthlyCharts from '@/components/CategoryMonthlyCharts.jsx';
import CategoryComparisonMonthly from '@/components/CategoryComparisonMonthly.jsx';
import CharteredAccountantPortal from '@/components/CharteredAccountantPortal.jsx';
import { 
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, XAxis, YAxis, CartesianGrid 
} from 'recharts';

// Inline SVG Sparkline (no external dep needed)
const SparkLine = ({ data, color = '#6366f1' }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80, h = 36;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts.split(' ').pop().split(',')[0]} cy={pts.split(' ').pop().split(',')[1]} r="3" fill={color} />
    </svg>
  );
};

const OverviewCard = ({ title, value, icon: Icon, trend, trendUp, isCurrency = true, valueClass = "", colorClass = "from-blue-500 to-indigo-500", subLabel, subValue, sparkData }) => (
  <Card className="relative overflow-hidden shadow-md border-border/40 bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
    <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${colorClass}`} />
    <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest leading-tight">{title}</p>
        <div className={`p-2 rounded-xl bg-gradient-to-br ${colorClass} bg-opacity-10 shrink-0`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className={`text-2xl sm:text-3xl font-black tracking-tight text-foreground tabular-nums ${valueClass}`}>
            {isCurrency ? '₹' : ''}{value}
          </div>
          {subLabel && (
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              {subLabel}: <span className="text-foreground font-bold">{subValue}</span>
            </p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-bold ${trendUp !== false ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trendUp !== false ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{trend}</span>
            </div>
          )}
        </div>
        {sparkData && sparkData.length > 1 && (
          <div className="w-20 h-10 shrink-0 opacity-50 group-hover:opacity-90 transition-opacity">
            <SparkLine data={sparkData} color="#6366f1" />
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const AnalyticsHub = () => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    period: 'monthly'
  });
  
  const [data, setData] = useState({
    monthly: [],
    category: [],
    categoryMonthlyRaw: [],
    categoryMonthlyCharts: null,
    quarterly: [],
    annual: [],
    totals: { revenue: 0, expenses: 0, profit: 0, margin: 0 },
    truckAnalytics: [],
    trucks: [],
    loans: [],
    trips: [],
    employees: [],
    fuelTracker: [],
    expensesList: []
  });

  const [selectedTruckId, setSelectedTruckId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [drilldownActive, setDrilldownActive] = useState(false);
  const [customInsValues, setCustomInsValues] = useState({});
  const [customTaxValues, setCustomTaxValues] = useState({});
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [payrollLogs, setPayrollLogs] = useState([]);

  // Calculate available months dynamically from trip and expense logs
  const availableMonths = React.useMemo(() => {
    const months = new Set();
    const now = new Date();
    const currMonth = now.toISOString().substring(0, 7);
    months.add(currMonth);
    
    data.trips.forEach(t => {
      if (t.date && t.date.length >= 7) {
        months.add(t.date.substring(0, 7));
      }
    });
    
    data.expensesList.forEach(e => {
      if (e.date && e.date.length >= 7) {
        months.add(e.date.substring(0, 7));
      }
    });

    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [data.trips, data.expensesList]);

  // Keep selectedMonth updated to latest data period automatically
  React.useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const calculateTruckProfitForMonth = (truck, month) => {
    const normalize = (val) => (val || '').replace(/\s+/g, '').toUpperCase();
    const normNum = normalize(truck.truck_number);
    
    // Filter trips for this truck in this month
    const matchedTrips = data.trips.filter(t => {
      const isMatch = t.truck_number === truck.id || normalize(t.truck_number) === normNum;
      const isMonth = t.date && t.date.substring(0, 7) === month;
      return isMatch && isMonth;
    });

    // Filter expenses for this truck in this month
    const matchedExpenses = data.expensesList.filter(e => {
      const isMatch = e.truck_id === truck.id || normalize(e.truck_id) === normNum;
      const isMonth = e.date && e.date.substring(0, 7) === month;
      return isMatch && isMonth;
    });

    // Filter fuel tracker logs for this truck in this month
    const matchedFuel = data.fuelTracker.filter(f => {
      const isMatch = f.truck_id === truck.id || normalize(f.truck_number) === normNum;
      const isMonth = f.date && f.date.substring(0, 7) === month;
      return isMatch && isMonth;
    });

    const revenue = matchedTrips.reduce((sum, t) => sum + (Number(t.revenue) || 0), 0);

    // EMI
    const matchedLoan = data.loans.find(l => normalize(l.profileName) === normNum);
    let emi = 0;
    if (matchedLoan) {
      const p = matchedLoan.loanAmount || 0;
      const r = (matchedLoan.interestRate || 0) / 12 / 100;
      const n = matchedLoan.loanTerm || 0;
      if (p > 0 && n > 0) {
        emi = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      }
    }

    // Driver base salary
    const driver = data.employees.find(emp => emp.assigned_truck === truck.id);
    const driverSalary = driver ? (Number(driver.salary_amount) || Number(driver.base_salary) || 0) : 0;

    // Insurance Premium Allocation
    const annualInsurance = customInsValues[truck.id] !== undefined 
      ? customInsValues[truck.id] 
      : Number(localStorage.getItem(`truck_annual_ins_${truck.id}`)) || 60000;
    const monthlyInsurance = annualInsurance / 12;

    // Quarterly Tax Allocation
    const annualTax = customTaxValues[truck.id] !== undefined
      ? customTaxValues[truck.id]
      : Number(localStorage.getItem(`truck_annual_tax_${truck.id}`)) || 12000;
    const monthlyTax = annualTax / 3;

    const fixedExpenses = emi + driverSalary + monthlyInsurance + monthlyTax;

    // Variable
    const fuelCost = matchedFuel.reduce((sum, f) => sum + (Number(f.total_cost) || 0), 0) ||
      matchedExpenses.filter(e => e.category === 'Fuel' || e.subcategory === 'Fuel').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const tolls = matchedTrips.reduce((sum, t) => sum + (Number(t.tolls) || 0), 0);
    const maintenance = matchedExpenses.filter(e => e.category === 'Maintenance' || e.subcategory === 'Maintenance').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const variableExpenses = fuelCost + tolls + maintenance;

    const totalExpenses = fixedExpenses + variableExpenses;
    const netProfit = revenue - totalExpenses;

    return {
      revenue,
      totalExpenses,
      netProfit,
      fixedExpenses,
      variableExpenses,
      fuelCost,
      tolls,
      maintenance,
      emi,
      driverSalary,
      monthlyInsurance,
      monthlyTax,
      annualInsurance,
      annualTax
    };
  };

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.id = "print-style-rules";
    styleElement.innerHTML = `
      @media print {
        aside, header, nav, button, .no-print, .tabs-list, [role="tablist"], .analytics-filters {
          display: none !important;
        }
        main, .px-4, .py-8 {
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        .bg-slate-950, .bg-card, .bg-slate-900, .bg-background {
          background: #ffffff !important;
          color: #000000 !important;
        }
        h1, h2, h3, h4, p, span, td, th {
          color: #000000 !important;
        }
        .card, .border-slate-800, .border-border {
          border-color: #cbd5e1 !important;
          box-shadow: none !important;
        }
      }
    `;
    document.head.appendChild(styleElement);
    return () => {
      const el = document.getElementById("print-style-rules");
      if (el) el.remove();
    };
  }, []);

  const handleExport = (type) => {
    if (type === 'pdf') {
      window.print();
      return;
    }

    try {
      let sheetName = 'Overview';
      let exportData = [];

      if (activeTab === 'overview') {
        sheetName = 'Overview Summary';
        exportData = [
          { Metric: 'Total Revenue', Value: Number(data.totals.revenue) || 0 },
          { Metric: 'Total Expenses', Value: Number(data.totals.expenses) || 0 },
          { Metric: 'Net Profit', Value: Number(data.totals.profit) || 0 },
          { Metric: 'Margin', Value: `${(Number(data.totals.margin) || 0).toFixed(2)}%` }
        ];
      } else if (activeTab === 'revenue') {
        sheetName = 'Revenue Analysis';
        exportData = data.monthly.map(m => ({
          Month: m.month,
          Revenue: Number(m.revenue) || 0,
          Expenses: Number(m.expenses) || 0,
          Profit: Number(m.profit) || 0,
          'Margin (%)': (Number(m.margin) || 0).toFixed(1)
        }));
      } else if (activeTab === 'shipments') {
        sheetName = 'Shipments Dispatch';
        exportData = (data.trips || []).map(t => ({
          Date: t.date ? new Date(t.date).toLocaleDateString('en-IN') : '',
          Route: t.route || '',
          'Truck Number': t.truck_number || '',
          Driver: t.driver_name || '',
          KMS: Number(t.kms) || 0,
          Revenue: Number(t.revenue) || 0
        }));
      } else if (activeTab === 'expenses') {
        sheetName = 'Expenses Breakdown';
        exportData = data.category.map(c => ({
          Category: c.name,
          Amount: Number(c.value) || 0
        }));
      } else if (activeTab === 'vehicles') {
        sheetName = 'Vehicle Breakdown';
        exportData = data.truckAnalytics.map(t => ({
          'Vehicle Number': t.truck_number,
          Name: t.truck_name || '',
          Revenue: Number(t.revenue) || 0,
          Expenses: Number(t.totalExpenses) || 0,
          Profit: Number(t.profit) || 0,
          'Margin (%)': (Number(t.margin) || 0).toFixed(1)
        }));
      } else if (activeTab === 'payroll') {
        sheetName = 'Payroll Records';
        exportData = payrollLogs.map(p => ({
          Month: p.month,
          'Driver/Employee': p.driver_name,
          'Base Salary': Number(p.base_salary) || 0,
          'Mileage Bonus': Number(p.trip_bonus) || 0,
          Deductions: Number(p.deductions) || 0,
          'Net Payout': Number(p.net_salary) || 0,
          Status: p.status
        }));
      } else {
        sheetName = 'General Audit';
        exportData = data.monthly.map(m => ({
          Period: m.month,
          Revenue: Number(m.revenue) || 0,
          Expenses: Number(m.expenses) || 0
        }));
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, `JaiBhavani_Report_${sheetName.replace(/\s+/g, '_')}_${new Date().toISOString().substring(0, 10)}.xlsx`);
      toast.success(`${sheetName} report downloaded as Excel successfully`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to export Excel report');
    }
  };

  const loadData = async (overrideFilters) => {
    const activeFilters = overrideFilters || filters;
    setLoading(true);
    try {
      const raw = await fetchRawAnalyticsData(activeFilters.startDate, activeFilters.endDate);
      
      const monthly = aggregateMonthlyData(raw.trips, raw.expenses);
      const category = aggregateCategoryData(raw.expenses);
      const quarterly = aggregateQuarterlyData(monthly);
      const annual = aggregateAnnualData(monthly);
      
      const categoryMonthlyRaw = aggregateCategoryMonthlyData(raw.trips, raw.expenses);
      const categoryMonthlyCharts = formatCategoryMonthlyForChart(categoryMonthlyRaw);

      // Perform truck analytics aggregation
      const truckAnalytics = aggregateTruckAnalyticsData(
        raw.trips, 
        raw.expenses, 
        raw.trucks || [], 
        raw.loans || [], 
        activeFilters.startDate, 
        activeFilters.endDate
      );

      const totalRev = monthly.reduce((sum, m) => sum + m.revenue, 0);
      const totalExp = monthly.reduce((sum, m) => sum + m.expenses, 0);
      const totalProf = totalRev - totalExp;
      const totalMargin = totalRev > 0 ? (totalProf / totalRev) * 100 : 0;

      setData({
        monthly,
        category,
        categoryMonthlyRaw,
        categoryMonthlyCharts,
        quarterly,
        annual,
        totals: { revenue: totalRev, expenses: totalExp, profit: totalProf, margin: totalMargin },
        truckAnalytics,
        trucks: raw.trucks || [],
        loans: raw.loans || [],
        trips: raw.trips || [],
        employees: raw.employees || [],
        fuelTracker: raw.fuelTracker || [],
        expensesList: raw.expenses || []
      });

      try {
        const payrollRes = await pb.collection('payroll').getFullList({
          sort: '-month',
          $autoCancel: false
        });
        setPayrollLogs(payrollRes);
      } catch (err) {
        console.error('Failed to load payroll logs:', err);
      }

      if (truckAnalytics.length > 0) {
        setSelectedTruckId(prev => {
          const stillExists = truckAnalytics.some(t => t.id === prev);
          return stillExists ? prev : truckAnalytics[0].id;
        });
      } else {
        setSelectedTruckId(null);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyFilters = (customFilters) => {
    const targetFilters = customFilters && customFilters.startDate !== undefined ? customFilters : filters;
    loadData(targetFilters);
  };

  const handleResetFilters = () => {
    const defaultFilters = { startDate: '', endDate: '', period: 'monthly' };
    setFilters(defaultFilters);
    loadData(defaultFilters);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/20">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">Analytics Hub</h1>
          <p className="text-lg text-muted-foreground">Comprehensive financial and operational insights.</p>
        </div>
        
        {/* Split Action Export button */}
        <div className="relative inline-flex rounded-xl shadow-sm no-print self-start sm:self-center">
          <button
            onClick={() => handleExport('excel')}
            className="inline-flex items-center gap-2 rounded-l-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 focus:z-10 focus:outline-none transition-colors border-r border-blue-700/50"
          >
            <FileText className="w-4.5 h-4.5" /> Export Report
          </button>
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="inline-flex h-full items-center rounded-r-xl bg-blue-600 px-2 text-white hover:bg-blue-500 focus:z-10 focus:outline-none transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            {exportDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-xl bg-slate-900 border border-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in duration-100">
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleExport('excel');
                      setExportDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <span>📥 Download Excel</span>
                  </button>
                  <button
                    onClick={() => {
                      handleExport('pdf');
                      setExportDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <span>🖨️ Print / PDF</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnalyticsFilters 
        filters={filters} 
        setFilters={setFilters} 
        onApply={handleApplyFilters} 
        onReset={handleResetFilters} 
      />

      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      ) : (() => {
        // Derived extra KPIs from raw data
        const trips = data.trips || [];
        const employees = data.employees || [];
        const monthly = data.monthly || [];
        const totalTrips = trips.length;
        const totalKms = trips.reduce((s,t) => s + (Number(t.kms)||0), 0);
        const avgRevPerTrip = totalTrips > 0 ? Math.round(data.totals.revenue / totalTrips) : 0;
        const avgKmsPerTrip = totalTrips > 0 ? Math.round(totalKms / totalTrips) : 0;
        const activeDrivers = new Set(trips.map(t => t.driver_name).filter(Boolean)).size;
        const activeRoutes = new Set(trips.map(t => t.route).filter(Boolean)).size;
        const totalTolls = trips.reduce((s,t) => s+(Number(t.tolls)||0), 0);
        const fuelCat = (data.category||[]).find(c => c.name?.toLowerCase().includes('fuel'));
        const totalFuel = fuelCat ? fuelCat.value : 0;
        // Monthly spark data arrays
        const revSpark = monthly.map(m => m.revenue);
        const expSpark = monthly.map(m => m.expenses);
        const profSpark = monthly.map(m => m.profit);
        const kmsSpark = monthly.map((m,i) => {
          const mo = m.month;
          return trips.filter(t=>t.date&&t.date.substring(0,7)===mo).reduce((s,t)=>s+(Number(t.kms)||0),0);
        });
        return (
        <>
          {/* 8-Card KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <OverviewCard title="Total Revenue" value={data.totals.revenue.toLocaleString()} icon={Activity}
              colorClass="from-emerald-500 to-teal-500"
              subLabel="Avg/Trip" subValue={`₹${avgRevPerTrip.toLocaleString()}`}
              trend={monthly.length >= 2 ? `₹${Math.round(monthly[monthly.length-1]?.revenue||0).toLocaleString()} last mo` : null}
              trendUp={monthly.length>=2 ? (monthly[monthly.length-1]?.revenue||0)>=(monthly[monthly.length-2]?.revenue||0) : true}
              sparkData={revSpark}
            />
            <OverviewCard title="Total Expenses" value={data.totals.expenses.toLocaleString()} icon={Wallet}
              colorClass="from-rose-500 to-orange-500"
              subLabel="Fuel" subValue={`₹${Math.round(totalFuel).toLocaleString()}`}
              trend={monthly.length >= 2 ? `₹${Math.round(monthly[monthly.length-1]?.expenses||0).toLocaleString()} last mo` : null}
              trendUp={false}
              sparkData={expSpark}
            />
            <OverviewCard title="Net Profit" value={data.totals.profit.toLocaleString()} icon={BarChart3}
              valueClass={data.totals.profit >= 0 ? "text-emerald-400" : "text-rose-400"}
              colorClass={data.totals.profit >= 0 ? "from-emerald-500 to-blue-500" : "from-rose-500 to-red-600"}
              subLabel="Margin" subValue={`${data.totals.margin.toFixed(1)}%`}
              trendUp={data.totals.profit >= 0}
              sparkData={profSpark}
            />
            <OverviewCard title="Profit Margin" value={`${data.totals.margin.toFixed(1)}%`} icon={PieChartIcon}
              isCurrency={false}
              colorClass="from-violet-500 to-purple-500"
              subLabel="Profitable months" subValue={`${monthly.filter(m=>m.profit>=0).length}/${monthly.length}`}
              trendUp={data.totals.margin >= 15}
            />
            <OverviewCard title="Total Trips" value={totalTrips.toLocaleString()} icon={Truck}
              isCurrency={false} colorClass="from-sky-500 to-blue-500"
              subLabel="Active Drivers" subValue={activeDrivers}
              sparkData={monthly.map((m)=>trips.filter(t=>t.date&&t.date.substring(0,7)===m.month).length)}
            />
            <OverviewCard title="Total KMs Driven" value={totalKms.toLocaleString()} icon={MapPin}
              isCurrency={false} colorClass="from-amber-500 to-orange-500"
              subLabel="Avg/Trip" subValue={`${avgKmsPerTrip.toLocaleString()} km`}
              sparkData={kmsSpark}
            />
            <OverviewCard title="Active Routes" value={activeRoutes} icon={Activity}
              isCurrency={false} colorClass="from-indigo-500 to-violet-500"
              subLabel="Toll Spend" subValue={`₹${Math.round(totalTolls).toLocaleString()}`}
            />
            <OverviewCard title="Active Drivers" value={activeDrivers} icon={User}
              isCurrency={false} colorClass="from-pink-500 to-rose-500"
              subLabel="Employees" subValue={employees.length}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full overflow-x-auto hide-scrollbar sm:w-auto bg-muted/50 p-1 rounded-xl mb-8 gap-1 no-print flex-row inline-flex whitespace-nowrap scroll-smooth">
              <TabsTrigger value="overview" className="rounded-lg text-xs shrink-0">Overview</TabsTrigger>
              <TabsTrigger value="revenue" className="rounded-lg text-xs shrink-0">Revenue</TabsTrigger>
              <TabsTrigger value="shipments" className="rounded-lg text-xs shrink-0">Shipments</TabsTrigger>
              <TabsTrigger value="expenses" className="rounded-lg text-xs shrink-0">Expenses</TabsTrigger>
              <TabsTrigger value="vehicles" className="rounded-lg text-xs shrink-0">Vehicles</TabsTrigger>
              <TabsTrigger value="payroll" className="rounded-lg text-xs shrink-0">Payroll</TabsTrigger>
              <TabsTrigger value="tax_ca" className="rounded-lg text-xs shrink-0">CA Tax Portal</TabsTrigger>
            </TabsList>

            {/* Tab Content: Overview */}
            <TabsContent value="overview" className="space-y-8 m-0 animate-in fade-in duration-300">
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-md border-border/40 bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" />Revenue vs Expenses Trend</CardTitle>
                    <CardDescription className="text-[11px]">Month-over-month financial performance</CardDescription>
                  </CardHeader>
                  <CardContent><MonthlyTrendChart data={data.monthly} /></CardContent>
                </Card>
                <Card className="shadow-md border-border/40 bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2"><PieChartIcon className="w-4 h-4 text-violet-400" />Expense Breakdown</CardTitle>
                    <CardDescription className="text-[11px]">Cost distribution by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.category.length > 0 ? <CategoryPieChart data={data.category} /> : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-xs">No category data available</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Leaderboards Row */}
              {(() => {
                const trips = data.trips || [];
                // Driver leaderboard
                const driverMap = {};
                trips.forEach(t => {
                  const d = t.driver_name || 'Unknown';
                  if (!driverMap[d]) driverMap[d] = { name: d, trips: 0, revenue: 0, kms: 0, tolls: 0 };
                  driverMap[d].trips++;
                  driverMap[d].revenue += Number(t.revenue) || 0;
                  driverMap[d].kms += Number(t.kms) || 0;
                  driverMap[d].tolls += Number(t.tolls) || 0;
                });
                const drivers = Object.values(driverMap).sort((a,b) => b.revenue - a.revenue).slice(0, 8);
                const maxDriverRev = drivers[0]?.revenue || 1;

                // Route leaderboard
                const routeMap = {};
                trips.forEach(t => {
                  const r = t.route || 'Unknown Route';
                  if (!routeMap[r]) routeMap[r] = { route: r, trips: 0, revenue: 0, kms: 0 };
                  routeMap[r].trips++;
                  routeMap[r].revenue += Number(t.revenue) || 0;
                  routeMap[r].kms += Number(t.kms) || 0;
                });
                const routes = Object.values(routeMap).sort((a,b) => b.revenue - a.revenue).slice(0, 8);
                const maxRouteRev = routes[0]?.revenue || 1;

                // Top expense categories
                const topCats = [...(data.category || [])].sort((a,b) => b.value - a.value).slice(0, 6);
                const maxCatVal = topCats[0]?.value || 1;
                const CAT_COLORS = ['bg-violet-400','bg-rose-400','bg-amber-400','bg-sky-400','bg-emerald-400','bg-pink-400'];

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Driver Leaderboard */}
                    <Card className="shadow-md border-border/40 bg-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <User className="w-4 h-4 text-sky-400" />Driver Leaderboard
                        </CardTitle>
                        <CardDescription className="text-[11px]">Ranked by revenue generated</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                        {drivers.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-8">No trip data available</p>
                        ) : drivers.map((d, i) => (
                          <div key={d.name} className="group hover:bg-muted/30 rounded-lg p-2 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shrink-0 ${
                                  i === 0 ? 'bg-amber-400 text-black' : i === 1 ? 'bg-slate-400 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'
                                }`}>{i+1}</span>
                                <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">{d.name}</span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-bold text-emerald-400">₹{Math.round(d.revenue).toLocaleString()}</span>
                                <span className="text-[10px] text-muted-foreground ml-1">· {d.trips}T</span>
                              </div>
                            </div>
                            <div className="w-full bg-muted/40 rounded-full h-1">
                              <div className="bg-gradient-to-r from-sky-500 to-blue-500 h-1 rounded-full transition-all" style={{width:`${(d.revenue/maxDriverRev)*100}%`}} />
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Route Intelligence */}
                    <Card className="shadow-md border-border/40 bg-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-400" />Route Intelligence
                        </CardTitle>
                        <CardDescription className="text-[11px]">Top routes by revenue</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                        {routes.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-8">No route data available</p>
                        ) : routes.map((r, i) => (
                          <div key={r.route} className="group hover:bg-muted/30 rounded-lg p-2 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-semibold text-foreground truncate max-w-[130px]" title={r.route}>{r.route}</span>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-bold text-amber-400">₹{Math.round(r.revenue).toLocaleString()}</span>
                                <span className="text-[10px] text-muted-foreground ml-1">· {r.trips}T</span>
                              </div>
                            </div>
                            <div className="w-full bg-muted/40 rounded-full h-1">
                              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1 rounded-full transition-all" style={{width:`${(r.revenue/maxRouteRev)*100}%`}} />
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Expense Categories */}
                    <Card className="shadow-md border-border/40 bg-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-rose-400" />Top Expense Categories
                        </CardTitle>
                        <CardDescription className="text-[11px]">Where money is going</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                        {topCats.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-8">No expense data available</p>
                        ) : topCats.map((cat, i) => (
                          <div key={cat.name} className="group hover:bg-muted/30 rounded-lg p-2 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${CAT_COLORS[i]}`} />
                                <span className="text-[11px] font-semibold text-foreground truncate max-w-[120px]">{cat.name}</span>
                              </div>
                              <span className="text-xs font-bold text-rose-400 shrink-0">₹{Math.round(cat.value).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-muted/40 rounded-full h-1">
                              <div className={`${CAT_COLORS[i]} h-1 rounded-full transition-all`} style={{width:`${(cat.value/maxCatVal)*100}%`}} />
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}

              {/* Business Insights Row */}
              {(() => {
                const trips = data.trips || [];
                const monthly = data.monthly || [];
                const totalTrips = trips.length;
                const totalKms = trips.reduce((s,t)=>s+(Number(t.kms)||0),0);
                const avgKmsPerTrip = totalTrips > 0 ? Math.round(totalKms/totalTrips) : 0;
                const avgRevPerTrip = totalTrips > 0 ? Math.round(data.totals.revenue/totalTrips) : 0;
                const bestMonth = monthly.reduce((best,m)=>m.revenue>=(best?.revenue||0)?m:best, null);
                const worstMonth = monthly.filter(m=>m.revenue>0).reduce((worst,m)=>m.revenue<=(worst?.revenue||Infinity)?m:worst, null);
                const avgMonthlyProfit = monthly.length>0 ? Math.round(monthly.reduce((s,m)=>s+m.profit,0)/monthly.length) : 0;
                const profitableMonths = monthly.filter(m=>m.profit>=0).length;
                const revenuePerKm = totalKms > 0 ? (data.totals.revenue/totalKms).toFixed(2) : 0;

                const insights = [
                  { label: 'Best Month', value: bestMonth ? `${bestMonth.month}` : 'N/A', sub: bestMonth ? `₹${Math.round(bestMonth.revenue).toLocaleString()} rev` : '', color: 'text-emerald-400', icon: '🏆' },
                  { label: 'Avg Monthly Profit', value: `₹${Math.abs(avgMonthlyProfit).toLocaleString()}`, sub: avgMonthlyProfit >= 0 ? 'Profitable avg' : 'Loss avg', color: avgMonthlyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400', icon: avgMonthlyProfit >= 0 ? '📈' : '📉' },
                  { label: 'Rev per KM', value: `₹${revenuePerKm}`, sub: `${totalKms.toLocaleString()} total kms`, color: 'text-sky-400', icon: '⛽' },
                  { label: 'Avg Trip Revenue', value: `₹${avgRevPerTrip.toLocaleString()}`, sub: `${avgKmsPerTrip} km avg/trip`, color: 'text-amber-400', icon: '🚚' },
                  { label: 'Profitable Months', value: `${profitableMonths}/${monthly.length}`, sub: monthly.length>0?`${Math.round((profitableMonths/monthly.length)*100)}% success rate`:'', color: 'text-violet-400', icon: '✅' },
                  { label: 'Total Trips', value: totalTrips.toLocaleString(), sub: `${new Set(trips.map(t=>t.driver_name).filter(Boolean)).size} drivers active`, color: 'text-pink-400', icon: '🗺️' },
                ];
                return (
                  <Card className="shadow-md border-border/40 bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />Business Intelligence Insights
                      </CardTitle>
                      <CardDescription className="text-[11px]">Key derived metrics from your operational data</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {insights.map((ins) => (
                          <div key={ins.label} className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 transition-colors">
                            <span className="text-2xl mb-1">{ins.icon}</span>
                            <span className={`text-sm font-black ${ins.color} tabular-nums`}>{ins.value}</span>
                            <span className="text-[10px] font-bold text-foreground mt-0.5">{ins.label}</span>
                            {ins.sub && <span className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{ins.sub}</span>}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Quarterly Bar Chart */}
              <Card className="shadow-md border-border/40 bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2"><BarChartIcon className="w-4 h-4 text-indigo-400" />Quarterly Performance Comparison</CardTitle>
                </CardHeader>
                <CardContent><QuarterlyComparisonChart data={data.quarterly} /></CardContent>
              </Card>
            </TabsContent>

            {/* Tab Content: Revenue */}
            <TabsContent value="revenue" className="space-y-8 m-0 animate-in fade-in duration-300">
              <Card className="shadow-sm border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Quarterly Revenue Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuarterlyComparisonChart data={data.quarterly} />
                </CardContent>
              </Card>

              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" /> Detailed Monthly Breakdown
                </h3>
                <MonthlyAnalyticsTable data={data.monthly} />
              </div>
            </TabsContent>

            {/* Tab Content: Shipments */}
            <TabsContent value="shipments" className="space-y-6 m-0 animate-in fade-in duration-300">
              {(() => {
                const trips = data.trips || [];
                const totalTrips = trips.length;
                const totalKms = trips.reduce((s,t)=>s+(Number(t.kms)||0),0);
                const totalTolls = trips.reduce((s,t)=>s+(Number(t.tolls)||0),0);
                const avgRevPerTrip = totalTrips > 0 ? Math.round(data.totals.revenue/totalTrips) : 0;
                const avgKmsPerTrip = totalTrips > 0 ? Math.round(totalKms/totalTrips) : 0;

                // Route ranking
                const routeMap = {};
                trips.forEach(t => {
                  const r = t.route || 'Unknown';
                  if (!routeMap[r]) routeMap[r] = { route: r, trips: 0, revenue: 0, kms: 0, tolls: 0 };
                  routeMap[r].trips++;
                  routeMap[r].revenue += Number(t.revenue)||0;
                  routeMap[r].kms += Number(t.kms)||0;
                  routeMap[r].tolls += Number(t.tolls)||0;
                });
                const routeRanking = Object.values(routeMap).sort((a,b)=>b.revenue-a.revenue);

                return (
                  <>
                    {/* KPI mini row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label:'Total Trips', value: totalTrips, icon:'🚚', color:'text-sky-400' },
                        { label:'Total KMs', value: `${totalKms.toLocaleString()} km`, icon:'📍', color:'text-amber-400' },
                        { label:'Avg Rev/Trip', value: `₹${avgRevPerTrip.toLocaleString()}`, icon:'💰', color:'text-emerald-400' },
                        { label:'Total Tolls', value: `₹${Math.round(totalTolls).toLocaleString()}`, icon:'🛣️', color:'text-rose-400' },
                      ].map(k => (
                        <div key={k.label} className="bg-muted/20 border border-border/30 rounded-xl p-4 text-center hover:bg-muted/40 transition-colors">
                          <span className="text-xl">{k.icon}</span>
                          <div className={`text-lg font-black ${k.color} tabular-nums mt-1`}>{k.value}</div>
                          <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">{k.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Route Performance Table */}
                    <Card className="shadow-md border-border/40 bg-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400" />Route Performance Ranking</CardTitle>
                        <CardDescription className="text-[11px]">All routes ranked by total revenue</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-border/40">
                                <th className="px-3 py-2.5 text-left text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">#</th>
                                <th className="px-3 py-2.5 text-left text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Route</th>
                                <th className="px-3 py-2.5 text-center text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Trips</th>
                                <th className="px-3 py-2.5 text-right text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Total KMs</th>
                                <th className="px-3 py-2.5 text-right text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Tolls</th>
                                <th className="px-3 py-2.5 text-right text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Revenue</th>
                                <th className="px-3 py-2.5 text-right text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Rev/Trip</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                              {routeRanking.length === 0 ? (
                                <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No shipment data available</td></tr>
                              ) : routeRanking.map((r, i) => (
                                <tr key={r.route} className="hover:bg-muted/20 transition-colors group">
                                  <td className="px-3 py-2.5">
                                    <span className={`text-[10px] font-black w-5 h-5 inline-flex items-center justify-center rounded-full ${
                                      i===0?'bg-amber-400 text-black':i===1?'bg-slate-400 text-black':i===2?'bg-amber-700 text-white':'bg-muted text-muted-foreground'
                                    }`}>{i+1}</span>
                                  </td>
                                  <td className="px-3 py-2.5 font-semibold text-foreground max-w-[160px] truncate" title={r.route}>{r.route}</td>
                                  <td className="px-3 py-2.5 text-center">
                                    <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">{r.trips}</span>
                                  </td>
                                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{r.kms.toLocaleString()}</td>
                                  <td className="px-3 py-2.5 text-right tabular-nums text-rose-400">₹{Math.round(r.tolls).toLocaleString()}</td>
                                  <td className="px-3 py-2.5 text-right tabular-nums font-bold text-emerald-400">₹{Math.round(r.revenue).toLocaleString()}</td>
                                  <td className="px-3 py-2.5 text-right tabular-nums text-amber-400">₹{r.trips>0?Math.round(r.revenue/r.trips).toLocaleString():0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Dispatch Logs */}
                    <Card className="shadow-md border-border/40 bg-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2"><Truck className="w-4 h-4 text-sky-400" />Recent Dispatch Logs</CardTitle>
                        <CardDescription className="text-[11px]">Last 20 trips sorted by date</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-border/40">
                                {['Date','Route','Truck','Driver','KMs','Tolls','Revenue'].map(h => (
                                  <th key={h} className={`px-3 py-2.5 text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider ${['KMs','Tolls','Revenue'].includes(h)?'text-right':h==='Date'?'text-left whitespace-nowrap':'text-left'}`}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                              {trips.length === 0 ? (
                                <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No shipments logged.</td></tr>
                              ) : [...trips].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,20).map((t) => (
                                <tr key={t.id} className="hover:bg-muted/10 transition-colors">
                                  <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{t.date?new Date(t.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}):'-'}</td>
                                  <td className="px-3 py-2.5 font-medium text-foreground max-w-[140px] truncate" title={t.route}>{t.route||'-'}</td>
                                  <td className="px-3 py-2.5 font-mono text-[10px] text-sky-400">{t.truck_number||'-'}</td>
                                  <td className="px-3 py-2.5 text-muted-foreground">{t.driver_name||'-'}</td>
                                  <td className="px-3 py-2.5 text-right tabular-nums">{t.kms?Number(t.kms).toLocaleString():'0'}</td>
                                  <td className="px-3 py-2.5 text-right tabular-nums text-rose-400">₹{t.tolls?Math.round(Number(t.tolls)).toLocaleString():'0'}</td>
                                  <td className="px-3 py-2.5 text-right font-bold text-emerald-400 tabular-nums">₹{t.revenue?Math.round(Number(t.revenue)).toLocaleString():'0'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </TabsContent>

            {/* Tab Content: Expenses */}
            <TabsContent value="expenses" className="space-y-8 m-0 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="shadow-sm border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Expense Distribution</CardTitle>
                    <CardDescription>Overall breakdown by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.category.length > 0 ? (
                      <CategoryPieChart data={data.category} />
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-xs">
                        No category data available
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Top Expense Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mt-4">
                      {data.category.slice(0, 5).map((cat, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                          <span className="font-medium text-xs">{cat.name}</span>
                          <span className="font-bold tabular-nums text-xs">₹{cat.value.toLocaleString()}</span>
                        </div>
                      ))}
                      {data.category.length === 0 && (
                        <p className="text-center text-muted-foreground py-8 text-xs">No expenses recorded.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <section>
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Category Trends
                </h3>
                <CategoryMonthlyCharts chartData={data.categoryMonthlyCharts} />
              </section>
              
              <section>
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <BarChartIcon className="w-5 h-5 text-primary" /> Monthly Comparisons
                </h3>
                <CategoryComparisonMonthly chartData={data.categoryMonthlyCharts} />
              </section>
            </TabsContent>

            {/* Tab Content: Vehicles */}
            <TabsContent value="vehicles" className="space-y-6 m-0 animate-in fade-in duration-500">
              {!drilldownActive ? (
                // Top-Level Grid Interface (Vehicle Analytics Overview)
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800/85 p-5 rounded-2xl shadow-sm">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary" />
                        Vehicle-by-Vehicle Profitability Grid
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Select a vehicle card below to inspect its detailed month-by-month financial breakdown.
                      </p>
                    </div>
                    
                    {/* Month selector filter */}
                    <div className="flex items-center gap-3 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
                      <span className="text-xs text-muted-foreground pl-2 font-medium">Reporting Month:</span>
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[180px] bg-slate-900 border-slate-800 text-slate-100 rounded-lg h-9">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                          {availableMonths.map(m => (
                            <SelectItem key={m} value={m}>
                              {new Date(m.split('-')[0], m.split('-')[1] - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {data.trucks.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-slate-800 bg-slate-900">
                      <p className="text-muted-foreground text-xs">No vehicles found in the system.</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {data.trucks.map(truck => {
                        const hasImages = truck.body_images && truck.body_images.length > 0;
                        const primaryImage = hasImages ? pb.files.getUrl(truck, truck.body_images[0]) : null;
                        
                        // Calculate profit metrics for this vehicle in this specific month
                        const metrics = calculateTruckProfitForMonth(truck, selectedMonth);
                        const isProfitPositive = metrics.netProfit >= 0;

                        return (
                          <div 
                            key={truck.id} 
                            onClick={() => { setSelectedTruckId(truck.id); setDrilldownActive(true); }}
                            className="group bg-slate-900 border border-slate-800/80 hover:border-primary/40 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
                          >
                            {/* Card Header Image */}
                            <div className="h-44 w-full relative bg-slate-950 overflow-hidden">
                              {hasImages ? (
                                <img 
                                  src={primaryImage} 
                                  alt={truck.truck_name || 'Truck body'} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-slate-950 to-indigo-500/5 relative">
                                  <Truck className="w-12 h-12 text-primary/10 mb-2" />
                                  <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest opacity-60">Fleet Vehicle</span>
                                </div>
                              )}
                              
                              {/* Ownership Badge overlay */}
                              <div className="absolute top-3 left-3 z-10">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                                  truck.ownership_type === 'Attached'
                                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                  {truck.ownership_type || 'Owned'}
                                </span>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-5 flex flex-col justify-between flex-grow space-y-4">
                              <div>
                                {/* Header: Nickname */}
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className="p-1 bg-primary/10 rounded text-primary">
                                    <Truck className="w-3.5 h-3.5" />
                                  </div>
                                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-primary transition-colors truncate">
                                    {truck.truck_name || 'Unnamed Vehicle'}
                                  </h3>
                                </div>
                                
                                {/* Registration number */}
                                <p className="text-xs font-mono font-bold text-slate-400 tracking-wider">
                                  {truck.truck_number}
                                </p>
                              </div>

                              {/* Monthly profit large card */}
                              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex justify-between items-center shadow-inner">
                                <div>
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Net Monthly Profit</span>
                                  <span className={`text-xl font-extrabold tabular-nums block mt-0.5 ${
                                    isProfitPositive ? 'text-emerald-400' : 'text-rose-400'
                                  }`}>
                                    {isProfitPositive ? '+' : ''}₹{Math.round(metrics.netProfit).toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Revenue</span>
                                  <span className="text-xs font-bold text-slate-200 tabular-nums">
                                    ₹{Math.round(metrics.revenue).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                // In-Depth Drilldown Workspace (On-Click Full Analysis)
                (() => {
                  const truck = data.trucks.find(t => t.id === selectedTruckId);
                  if (!truck) return null;

                  const metrics = calculateTruckProfitForMonth(truck, selectedMonth);
                  const isProfitPositive = metrics.netProfit >= 0;

                  // Prepare Expense distribution line items alongside percentage share
                  const expenseList = [
                    { name: 'Fuel Costs', value: metrics.fuelCost, color: 'bg-sky-400' },
                    { name: 'Toll Fees', value: metrics.tolls, color: 'bg-amber-400' },
                    { name: 'Maintenance & Spares', value: metrics.maintenance, color: 'bg-rose-400' },
                    { name: 'EMI / Financing', value: metrics.emi, color: 'bg-purple-400' },
                    { name: 'Driver Base Salary', value: metrics.driverSalary, color: 'bg-indigo-400' },
                    { name: 'Insurance Premium Allocation', value: metrics.monthlyInsurance, color: 'bg-emerald-400' },
                    { name: 'Quarterly Tax Allocation', value: metrics.monthlyTax, color: 'bg-teal-400' }
                  ].filter(item => item.value > 0);

                  const totalExp = metrics.totalExpenses || 1; // avoid div by zero

                  return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                      {/* Back button header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800/80 p-4 rounded-xl shadow-sm">
                        <Button 
                          variant="ghost" 
                          onClick={() => setDrilldownActive(false)} 
                          className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl px-4 text-xs font-semibold gap-2"
                        >
                          ← Back to Grid
                        </Button>

                        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-end">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium">Selected Month:</span>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                              <SelectTrigger className="w-[160px] bg-slate-950 border-slate-800 text-slate-100 rounded-lg h-9">
                                <SelectValue placeholder="Month" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                {availableMonths.map(m => (
                                  <SelectItem key={m} value={m}>
                                    {new Date(m.split('-')[0], m.split('-')[1] - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Truck Profile Banner */}
                      <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-primary/5 border border-slate-800/80">
                        <div className="p-3.5 bg-primary/10 rounded-2xl text-primary border border-primary/20 shrink-0">
                          <Truck className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold tracking-tight text-slate-100">{truck.truck_number}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{truck.truck_name || 'Generic profile'} • {truck.truck_size || 'N/A'} • {truck.truck_axle || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Interactive Allocations Configurator */}
                      <Card className="border-slate-800 bg-slate-900 shadow-lg">
                        <CardHeader className="pb-3 border-b border-slate-800/80">
                          <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-200">
                            <Settings className="w-4 h-4 text-primary" /> Configure Allocations for {truck.truck_number}
                          </CardTitle>
                          <CardDescription className="text-xs text-slate-400">
                            Adjust custom values below. Changes persist in your local browser storage and update the financial model.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-300">Annualized Insurance Premium (₹)</Label>
                            <Input 
                              type="number"
                              value={metrics.annualInsurance}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                setCustomInsValues({...customInsValues, [truck.id]: val});
                                localStorage.setItem(`truck_annual_ins_${truck.id}`, val);
                              }}
                              className="bg-slate-950 border-slate-800 text-slate-100 rounded-xl h-11 text-sm font-bold"
                            />
                            <p className="text-[10px] text-muted-foreground">Allocated monthly cost factor: <span className="text-primary font-bold">₹{Math.round(metrics.monthlyInsurance).toLocaleString('en-IN')}/month</span></p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-300">Annual Quarterly Tax Allocation (₹)</Label>
                            <Input 
                              type="number"
                              value={metrics.annualTax}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                setCustomTaxValues({...customTaxValues, [truck.id]: val});
                                localStorage.setItem(`truck_annual_tax_${truck.id}`, val);
                              }}
                              className="bg-slate-950 border-slate-800 text-slate-100 rounded-xl h-11 text-sm font-bold"
                            />
                            <p className="text-[10px] text-muted-foreground">Allocated monthly cost factor: <span className="text-primary font-bold">₹{Math.round(metrics.monthlyTax).toLocaleString('en-IN')}/month</span></p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Main Financial Workspace Columns */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Column A: Monthly Gross Revenue */}
                        <Card className="border-slate-800 bg-slate-900 flex flex-col justify-between shadow-md">
                          <CardHeader className="pb-3 border-b border-slate-800/80">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              A. Gross Revenue
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-5 space-y-4 flex-grow">
                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/85">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Total Logistics Earnings</span>
                              <span className="text-2xl font-extrabold text-blue-400 mt-1 block tabular-nums">
                                ₹{Math.round(metrics.revenue).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              Aggregated earnings from all contract trip dispatches logged under this truck during {selectedMonth}.
                            </p>
                          </CardContent>
                        </Card>

                        {/* Column B: Monthly Fixed Expenses */}
                        <Card className="border-slate-800 bg-slate-900 flex flex-col justify-between shadow-md">
                          <CardHeader className="pb-3 border-b border-slate-800/80">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              B. Fixed Expenses
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-5 space-y-3.5 flex-grow">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">EMI / Loan Repayments:</span>
                              <span className="font-bold text-slate-200 tabular-nums">₹{Math.round(metrics.emi).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Driver Base Salary:</span>
                              <span className="font-bold text-slate-200 tabular-nums">₹{Math.round(metrics.driverSalary).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Insurance Allocation:</span>
                              <span className="font-bold text-slate-200 tabular-nums">₹{Math.round(metrics.monthlyInsurance).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Quarterly Tax Allocation:</span>
                              <span className="font-bold text-slate-200 tabular-nums">₹{Math.round(metrics.monthlyTax).toLocaleString()}</span>
                            </div>
                            
                            <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs font-bold text-slate-100">
                              <span>Total Fixed Expenses:</span>
                              <span className="text-sm text-primary tabular-nums">₹{Math.round(metrics.fixedExpenses).toLocaleString()}</span>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Column C: Monthly Running / Variable Expenses */}
                        <Card className="border-slate-800 bg-slate-900 flex flex-col justify-between shadow-md">
                          <CardHeader className="pb-3 border-b border-slate-800/80">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              C. Variable / Running Expenses
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-5 space-y-3.5 flex-grow">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Fuel Costs:</span>
                              <span className="font-bold text-slate-200 tabular-nums">₹{Math.round(metrics.fuelCost).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Toll Fees:</span>
                              <span className="font-bold text-slate-200 tabular-nums">₹{Math.round(metrics.tolls).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Maintenance / Upkeep:</span>
                              <span className="font-bold text-slate-200 tabular-nums">₹{Math.round(metrics.maintenance).toLocaleString()}</span>
                            </div>
                            
                            <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs font-bold text-slate-100">
                              <span>Total Variable Expenses:</span>
                              <span className="text-sm text-primary tabular-nums">₹{Math.round(metrics.variableExpenses).toLocaleString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Financial Calculation Matrix Formula Box */}
                      <Card className="border-slate-800 bg-slate-900 overflow-hidden shadow-lg border-l-4 border-l-primary">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Financial Calculation Equation
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-4">
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-center items-center text-center font-mono">
                            <span className="text-xs text-muted-foreground mb-1 block">Net Profit Formula</span>
                            <span className="text-sm sm:text-base font-bold text-primary">
                              Net Profit = Gross Revenue - (Variable Expenses + Fixed Expenses)
                            </span>
                            <div className="w-full border-t border-slate-800/80 my-3" />
                            <div className="flex flex-col sm:flex-row items-center gap-1.5 text-xs text-slate-200">
                              <span className="text-blue-400 font-bold">₹{Math.round(metrics.revenue).toLocaleString()}</span>
                              <span className="text-muted-foreground font-bold">-</span>
                              <span>(</span>
                              <span className="text-slate-100 font-bold">₹{Math.round(metrics.variableExpenses).toLocaleString()}</span>
                              <span className="text-muted-foreground">+</span>
                              <span className="text-slate-100 font-bold">₹{Math.round(metrics.fixedExpenses).toLocaleString()}</span>
                              <span>)</span>
                              <span className="text-muted-foreground font-bold">=</span>
                              <span className={"font-bold text-sm " + (isProfitPositive ? "text-emerald-400" : "text-rose-400")}>
                                ₹{Math.round(metrics.netProfit).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Cash Leakage Analysis Breakdown List */}
                      <Card className="border-slate-800 bg-slate-900 shadow-lg">
                        <CardHeader className="pb-3 border-b border-slate-800/80">
                          <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-200">
                            <PieChartIcon className="w-4 h-4 text-primary" /> Cash Leakage Analysis
                          </CardTitle>
                          <CardDescription className="text-xs text-slate-400">
                            Percentage share of individual expense ledgers to identify core cost leakages.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                          {expenseList.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground text-xs">
                              No expenses recorded in {selectedMonth}.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {expenseList.map((item, index) => {
                                const percentage = (item.value / totalExp) * 100;
                                const isLeakageRisk = percentage > 30; // flag if single cost cohort takes more than 30% of monthly budget
                                return (
                                  <div key={index} className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-200">{item.name}</span>
                                        {isLeakageRisk && (
                                          <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 animate-pulse">
                                            Cost Leakage Risk
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <span className="font-bold text-slate-100 tabular-nums">₹{Math.round(item.value).toLocaleString()}</span>
                                        <span className="text-[10px] text-muted-foreground ml-1.5 tabular-nums">({percentage.toFixed(1)}%)</span>
                                      </div>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-2">
                                      <div 
                                        className={"h-2 rounded-full " + (isLeakageRisk ? "bg-rose-500" : "bg-primary")}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()
              )}
            </TabsContent>

            {/* Tab Content: Payroll */}
            <TabsContent value="payroll" className="space-y-8 m-0 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <OverviewCard 
                  title="Total Payroll Disbursed" 
                  value={payrollLogs.reduce((sum, p) => sum + (Number(p.net_salary) || 0), 0).toLocaleString()} 
                  icon={Wallet} 
                />
                <OverviewCard 
                  title="Total Bonuses Awarded" 
                  value={payrollLogs.reduce((sum, p) => sum + (Number(p.trip_bonus) || 0), 0).toLocaleString()} 
                  icon={TrendingUp} 
                />
                <OverviewCard 
                  title="Total Deductions Applied" 
                  value={payrollLogs.reduce((sum, p) => sum + (Number(p.deductions) || 0), 0).toLocaleString()} 
                  icon={TrendingDown} 
                />
              </div>

              <Card className="shadow-sm border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Payroll Ledger</CardTitle>
                  <CardDescription>Monthly payouts and mileage bonus records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-muted-foreground border-collapse">
                      <thead className="text-[10px] uppercase tracking-wider bg-muted/20 border-b border-border/50">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold text-foreground">Month</th>
                          <th className="px-4 py-2.5 font-semibold text-foreground">Employee/Driver</th>
                          <th className="px-4 py-2.5 font-semibold text-foreground text-right">Base Salary</th>
                          <th className="px-4 py-2.5 font-semibold text-foreground text-right">Mileage Bonus</th>
                          <th className="px-4 py-2.5 font-semibold text-foreground text-right">Deductions</th>
                          <th className="px-4 py-2.5 font-semibold text-foreground text-right">Net Payout</th>
                          <th className="px-4 py-2.5 font-semibold text-foreground text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        {payrollLogs.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                              No payroll records found.
                            </td>
                          </tr>
                        ) : (
                          payrollLogs.map((p) => (
                            <tr key={p.id} className="hover:bg-muted/5 transition-colors">
                              <td className="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">{p.month || '-'}</td>
                              <td className="px-4 py-2.5">{p.driver_name || '-'}</td>
                              <td className="px-4 py-2.5 text-right tabular-nums">₹{(Number(p.base_salary) || 0).toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-right text-success font-semibold tabular-nums">₹{(Number(p.trip_bonus) || 0).toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-right text-destructive font-medium tabular-nums">₹{(Number(p.deductions) || 0).toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-right font-bold text-foreground tabular-nums">₹{(Number(p.net_salary) || 0).toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                  p.status === 'paid' 
                                    ? 'bg-success/15 text-success border border-success/20' 
                                    : 'bg-warning/15 text-warning border border-warning/20'
                                }`}>
                                  {p.status || 'pending'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Content: CA Tax Portal */}
            <TabsContent value="tax_ca" className="space-y-8 m-0 animate-in fade-in duration-500">
              <CharteredAccountantPortal 
                startDate={filters.startDate} 
                endDate={filters.endDate} 
              />
            </TabsContent>
          </Tabs>
        </>
        );
      })()}
    </div>
  );
};

export default AnalyticsHub;