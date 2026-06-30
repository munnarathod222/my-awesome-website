import React, { useState, useEffect } from 'react';
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

const OverviewCard = ({ title, value, icon: Icon, trend, isCurrency = true, valueClass = "" }) => (
  <Card className="shadow-sm border-border hover:shadow-md transition-all">
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="analytics-metric-label">{title}</p>
        <div className="p-2 bg-primary/10 rounded-xl">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="flex flex-col mt-2">
        <div className={`analytics-metric-value ${valueClass}`}>
          {isCurrency ? '₹' : ''}{value}
        </div>
        {trend && (
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-success font-medium">{trend}</span> vs last period
          </p>
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
    loans: []
  });

  const [selectedTruckId, setSelectedTruckId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [payrollLogs, setPayrollLogs] = useState([]);

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
      XLSX.writeFile(workbook, `FleetMaster_Report_${sheetName.replace(/\s+/g, '_')}_${new Date().toISOString().substring(0, 10)}.xlsx`);
      toast.success(`${sheetName} report downloaded as Excel successfully`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to export Excel report');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const raw = await fetchRawAnalyticsData(filters.startDate, filters.endDate);
      
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
        filters.startDate, 
        filters.endDate
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
        trips: raw.trips || []
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

  const handleApplyFilters = () => {
    loadData();
  };

  const handleResetFilters = () => {
    setFilters({ startDate: '', endDate: '', period: 'monthly' });
    setTimeout(loadData, 0);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <OverviewCard 
              title="Total Revenue" 
              value={data.totals.revenue.toLocaleString()} 
              icon={Activity} 
            />
            <OverviewCard 
              title="Total Expenses" 
              value={data.totals.expenses.toLocaleString()} 
              icon={Wallet} 
            />
            <OverviewCard 
              title="Net Profit" 
              value={data.totals.profit.toLocaleString()} 
              icon={BarChart3} 
              valueClass={data.totals.profit >= 0 ? "text-success" : "text-destructive"}
            />
            <OverviewCard 
              title="Profit Margin" 
              value={`${data.totals.margin.toFixed(1)}%`} 
              icon={PieChartIcon} 
              isCurrency={false}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 md:grid-cols-7 bg-muted/50 p-1 rounded-xl mb-8 gap-1 no-print">
              <TabsTrigger value="overview" className="rounded-lg text-xs">Overview</TabsTrigger>
              <TabsTrigger value="revenue" className="rounded-lg text-xs">Revenue</TabsTrigger>
              <TabsTrigger value="shipments" className="rounded-lg text-xs">Shipments</TabsTrigger>
              <TabsTrigger value="expenses" className="rounded-lg text-xs">Expenses</TabsTrigger>
              <TabsTrigger value="vehicles" className="rounded-lg text-xs">Vehicles</TabsTrigger>
              <TabsTrigger value="payroll" className="rounded-lg text-xs">Payroll</TabsTrigger>
              <TabsTrigger value="tax_ca" className="rounded-lg text-xs">CA Tax Portal</TabsTrigger>
            </TabsList>

            {/* Tab Content: Overview */}
            <TabsContent value="overview" className="space-y-8 m-0 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="shadow-sm border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Revenue vs Expenses Trend</CardTitle>
                    <CardDescription>Historical financial performance trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MonthlyTrendChart data={data.monthly} />
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Expense Breakdown</CardTitle>
                    <CardDescription>Overall cost distribution by category</CardDescription>
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
              </div>
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
            <TabsContent value="shipments" className="space-y-8 m-0 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <OverviewCard 
                  title="Total Trips Dispatched" 
                  value={(data.trips || []).length} 
                  icon={Truck} 
                  isCurrency={false}
                />
                <OverviewCard 
                  title="Total KMS Driven" 
                  value={(data.trips || []).reduce((sum, t) => sum + (Number(t.kms) || 0), 0).toLocaleString()} 
                  icon={MapPin} 
                  isCurrency={false}
                />
                <OverviewCard 
                  title="Average Trip Revenue" 
                  value={Math.round((data.trips || []).length > 0 ? data.totals.revenue / data.trips.length : 0).toLocaleString()} 
                  icon={Activity} 
                />
              </div>

              <Card className="shadow-sm border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Recent Dispatch Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-muted-foreground border-collapse">
                      <thead className="text-[10px] uppercase tracking-wider bg-muted/20 border-b border-border/50">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold text-foreground">Date</th>
                          <th className="px-4 py-2.5 font-semibold text-foreground">Route</th>
                          <th className="px-4 py-2.5 font-semibold text-foreground">Truck Number</th>
                          <th className="px-4 py-2.5 font-semibold text-foreground">Driver</th>
                          <th className="px-4 py-2.5 font-semibold text-foreground text-right">KMS</th>
                          <th className="px-4 py-2.5 font-semibold text-foreground text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        {(data.trips || []).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No shipments logged.</td>
                          </tr>
                        ) : (
                          (data.trips || []).slice(0, 15).map((t) => (
                            <tr key={t.id} className="hover:bg-muted/5 transition-colors">
                              <td className="px-4 py-2.5 whitespace-nowrap">{t.date ? new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                              <td className="px-4 py-2.5 font-medium text-foreground">{t.route || '-'}</td>
                              <td className="px-4 py-2.5 font-mono">{t.truck_number || '-'}</td>
                              <td className="px-4 py-2.5">{t.driver_name || '-'}</td>
                              <td className="px-4 py-2.5 text-right tabular-nums">{t.kms ? Number(t.kms).toLocaleString() : '0'}</td>
                              <td className="px-4 py-2.5 text-right text-success font-semibold tabular-nums">₹{t.revenue ? Math.round(Number(t.revenue)).toLocaleString() : '0'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
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
            <TabsContent value="vehicles" className="space-y-8 m-0 animate-in fade-in duration-500">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Truck className="w-5 h-5 text-primary animate-pulse" />
                    Vehicle-by-Vehicle Performance
                  </CardTitle>
                  <CardDescription>
                    Compare financial and operational performance across all vehicles. Monthly loan EMIs are calculated from loan profiles and adjusted for the selected date span.
                  </CardDescription>
                </CardHeader>
              </Card>

              {data.truckAnalytics.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-border">
                  <p className="text-muted-foreground text-xs">No trucks found in the database. Add a truck first to see its analysis here.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Truck Grid Selector (4 cols wide on large screens) */}
                  <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Select Vehicle</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-1">
                      {data.truckAnalytics.map((truck) => {
                        const isSelected = truck.id === selectedTruckId;
                        return (
                          <div
                            key={truck.id}
                            onClick={() => setSelectedTruckId(truck.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden bg-card ${
                              isSelected 
                                ? 'border-primary shadow-lg ring-1 ring-primary/30 translate-x-1' 
                                : 'border-border/50 hover:border-border hover:bg-muted/10'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-0 right-0 w-2.5 h-full bg-primary" />
                            )}
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold tracking-wide text-foreground text-xs">{truck.truck_number}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                truck.profit >= 0 
                                  ? 'bg-success/15 text-success border border-success/20' 
                                  : 'bg-destructive/15 text-destructive border border-destructive/20'
                              }`}>
                                {truck.profit >= 0 ? '+' : ''}{truck.margin.toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mb-3 truncate">{truck.truck_name || 'Generic Truck'}</p>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <span className="text-muted-foreground block text-[8px] uppercase">Revenue</span>
                                <span className="font-semibold text-foreground">₹{Math.round(truck.revenue).toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[8px] uppercase">Net Profit</span>
                                <span className={`font-semibold ${truck.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                                  ₹{Math.round(truck.profit).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Selected Truck Drilldown */}
                  <div className="lg:col-span-8 space-y-6">
                    {(() => {
                      const selectedTruck = data.truckAnalytics.find(t => t.id === selectedTruckId);
                      if (!selectedTruck) {
                        return (
                          <div className="p-8 text-center bg-card border border-border rounded-xl">
                            <p className="text-muted-foreground text-xs">Select a truck from the list to view its financial analysis.</p>
                          </div>
                        );
                      }

                      const expenseData = [
                        { name: 'Fuel', value: selectedTruck.fuel, color: '#38bdf8' },
                        { name: 'Toll', value: selectedTruck.toll, color: '#fbbf24' },
                        { name: 'Driver Expense', value: selectedTruck.driverExpenses, color: '#818cf8' },
                        { name: 'Maintenance', value: selectedTruck.maintenance, color: '#f87171' },
                        { name: 'Insurance', value: selectedTruck.insurance, color: '#34d399' },
                        { name: 'EMI', value: selectedTruck.emi, color: '#c084fc' },
                        { name: 'Misc', value: selectedTruck.misc, color: '#94a3b8' }
                      ].filter(item => item.value > 0);

                      const compChartData = [
                        { name: 'Revenue', value: selectedTruck.revenue, fill: 'url(#revGrad)' },
                        { name: 'Expenses', value: selectedTruck.totalExpenses, fill: 'url(#expGrad)' },
                        { name: 'Net Profit', value: selectedTruck.profit, fill: selectedTruck.profit >= 0 ? 'url(#profGrad)' : 'url(#lossGrad)' }
                      ];

                      return (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/40">
                            <div>
                              <h2 className="text-2xl font-bold text-foreground">{selectedTruck.truck_number}</h2>
                              <p className="text-xs text-muted-foreground">{selectedTruck.truck_name || 'Vehicle profile'}</p>
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50 self-start">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span>Calculated over {calculateDateSpanInMonths(filters.startDate, filters.endDate, selectedTruck.tripsList, selectedTruck.expensesList).toFixed(2)} Months</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-card/45 hover:bg-card/60 transition-all duration-300">
                              <CardContent className="p-5">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Revenue</span>
                                <span className="text-xl font-extrabold text-foreground mt-1.5 block tabular-nums">₹{Math.round(selectedTruck.revenue).toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground mt-2 block flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-primary" /> {selectedTruck.kms.toLocaleString()} kms run
                                </span>
                              </CardContent>
                            </Card>

                            <Card className="bg-card/45 hover:bg-card/60 transition-all duration-300">
                              <CardContent className="p-5">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Expenses</span>
                                <span className="text-xl font-extrabold text-foreground mt-1.5 block tabular-nums">₹{Math.round(selectedTruck.totalExpenses).toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground mt-2 block">Includes loan EMI & payroll</span>
                              </CardContent>
                            </Card>

                            <Card className="bg-card/45 hover:bg-card/60 transition-all duration-300">
                              <CardContent className="p-5">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Net Profit</span>
                                <span className={`text-xl font-extrabold mt-1.5 block tabular-nums ${selectedTruck.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                                  ₹{Math.round(selectedTruck.profit).toLocaleString()}
                                </span>
                                <span className="text-xs text-muted-foreground mt-2 block">Revenue minus overall costs</span>
                              </CardContent>
                            </Card>

                            <Card className="bg-card/45 hover:bg-card/60 transition-all duration-300">
                              <CardContent className="p-5">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Profit Margin</span>
                                <span className={`text-xl font-extrabold mt-1.5 block tabular-nums ${selectedTruck.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                                  {selectedTruck.margin.toFixed(1)}%
                                </span>
                                <span className="text-xs text-muted-foreground mt-2 block">Efficiency of operations</span>
                              </CardContent>
                            </Card>
                          </div>

                          {selectedTruck.hasLoan ? (
                            <Card className="border-border bg-card/25 shadow-sm">
                              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-foreground text-sm">Loan Profile Associated</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {selectedTruck.loanInfo.bankName || 'Bank Loan'} - ₹{selectedTruck.loanInfo.totalLoanAmount.toLocaleString()} @ {selectedTruck.loanInfo.interestRate}% for {selectedTruck.loanInfo.loanTerm} Months.
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right self-stretch sm:self-center border-t sm:border-t-0 border-border/50 pt-2 sm:pt-0">
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block">Monthly EMI</span>
                                  <span className="text-base font-bold text-primary tabular-nums">₹{Math.round(selectedTruck.loanInfo.monthlyEmi).toLocaleString()}</span>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <Card className="border-warning/30 bg-warning/5 shadow-sm">
                              <CardContent className="p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                                <div>
                                  <h4 className="font-semibold text-warning text-sm">No Loan Profile Associated</h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    No loan profile matching vehicle number <span className="font-mono text-foreground font-semibold bg-muted/40 px-1 rounded">{selectedTruck.truck_number}</span> was found in the EMI Calculator. EMIs are excluded from this analysis. Rename your loan profile to match this vehicle's number.
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-border bg-card/30">
                              <CardHeader className="p-5">
                                <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider">Financial Overview</CardTitle>
                              </CardHeader>
                              <CardContent className="p-5 pt-0">
                                <div className="h-[250px] w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={compChartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                      <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                                          <stop offset="95%" stopColor="#34d399" stopOpacity={0.2}/>
                                        </linearGradient>
                                        <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
                                          <stop offset="95%" stopColor="#f87171" stopOpacity={0.2}/>
                                        </linearGradient>
                                        <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                                        </linearGradient>
                                        <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                                      <Tooltip 
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        content={({ active, payload }) => {
                                          if (active && payload && payload.length) {
                                            return (
                                              <div className="bg-popover border border-border p-2.5 rounded-lg shadow-lg">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase">{payload[0].payload.name}</p>
                                                <p className="text-sm font-bold text-foreground mt-1 tabular-nums">₹{Math.round(payload[0].value).toLocaleString()}</p>
                                              </div>
                                            );
                                          }
                                          return null;
                                        }}
                                      />
                                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="border-border bg-card/30">
                              <CardHeader className="p-5">
                                <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider">Expense Distribution</CardTitle>
                              </CardHeader>
                              <CardContent className="p-5 pt-0 flex flex-col justify-between">
                                {expenseData.length === 0 ? (
                                  <div className="h-[250px] flex items-center justify-center text-muted-foreground text-xs">
                                    No expenses recorded for this truck.
                                  </div>
                                ) : (
                                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="h-[200px] w-[200px] relative flex-shrink-0">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                          <Pie
                                            data={expenseData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={75}
                                            paddingAngle={3}
                                            dataKey="value"
                                          >
                                            {expenseData.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                          </Pie>
                                          <Tooltip 
                                            content={({ active, payload }) => {
                                              if (active && payload && payload.length) {
                                                return (
                                                  <div className="bg-popover border border-border p-2.5 rounded-lg shadow-lg">
                                                    <span style={{ color: payload[0].payload.color }} className="text-xs font-semibold uppercase">{payload[0].name}</span>
                                                    <p className="text-sm font-bold text-foreground mt-0.5 tabular-nums">₹{Math.round(payload[0].value).toLocaleString()}</p>
                                                  </div>
                                                );
                                              }
                                              return null;
                                            }}
                                          />
                                        </PieChart>
                                      </ResponsiveContainer>
                                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-[10px] text-muted-foreground uppercase font-semibold text-center leading-none">Total Cost</span>
                                        <span className="text-xs font-bold text-foreground mt-1 tabular-nums">₹{Math.round(selectedTruck.totalExpenses).toLocaleString()}</span>
                                      </div>
                                    </div>
                                    <div className="space-y-1.5 w-full max-h-[220px] overflow-y-auto pr-1">
                                      {expenseData.map((item, index) => {
                                        const percentage = (item.value / selectedTruck.totalExpenses) * 100;
                                        return (
                                          <div key={index} className="flex items-center justify-between text-[10px] p-1 hover:bg-muted/10 rounded transition-colors">
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                              <span className="text-muted-foreground font-medium">{item.name}</span>
                                            </div>
                                            <div className="text-right">
                                              <span className="font-semibold text-foreground block tabular-nums">₹{Math.round(item.value).toLocaleString()}</span>
                                              <span className="text-[8px] text-muted-foreground block tabular-nums">{percentage.toFixed(1)}%</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>

                          <Tabs defaultValue="trips" className="w-full">
                            <TabsList className="grid w-full sm:w-[350px] grid-cols-2 bg-muted/40 p-1 rounded-lg mb-4">
                              <TabsTrigger value="trips" className="text-xs rounded-md">
                                Trip Records ({selectedTruck.tripsList.length})
                              </TabsTrigger>
                              <TabsTrigger value="expenses" className="text-xs rounded-md">
                                Expense Ledger ({selectedTruck.expensesList.length})
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="trips" className="m-0 bg-card/20 rounded-xl border border-border/85 overflow-hidden">
                              {selectedTruck.tripsList.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-xs">
                                  No trips recorded for this truck in the selected range.
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs text-left text-muted-foreground border-collapse">
                                    <thead className="text-[10px] uppercase tracking-wider bg-muted/20 border-b border-border/50">
                                      <tr>
                                        <th className="px-4 py-2.5 font-semibold text-foreground">Date</th>
                                        <th className="px-4 py-2.5 font-semibold text-foreground">Route</th>
                                        <th className="px-4 py-2.5 font-semibold text-foreground"><User className="w-3 h-3 text-muted-foreground inline mr-1" /> Driver</th>
                                        <th className="px-4 py-2.5 font-semibold text-foreground text-right">KMS</th>
                                        <th className="px-4 py-2.5 font-semibold text-foreground text-right">Revenue</th>
                                        <th className="px-4 py-2.5 font-semibold text-foreground text-right">Driver Advance</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                      {selectedTruck.tripsList.map((t) => (
                                        <tr key={t.id} className="hover:bg-muted/5 transition-colors">
                                          <td className="px-4 py-2.5 whitespace-nowrap">{t.date ? new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                                          <td className="px-4 py-2.5 font-medium text-foreground">{t.route || '-'}</td>
                                          <td className="px-4 py-2.5">{t.driver_name || '-'}</td>
                                          <td className="px-4 py-2.5 text-right tabular-nums">{t.kms ? t.kms.toLocaleString() : '0'}</td>
                                          <td className="px-4 py-2.5 text-right text-success font-semibold tabular-nums">₹{t.revenue ? Math.round(t.revenue).toLocaleString() : '0'}</td>
                                          <td className="px-4 py-2.5 text-right text-destructive font-medium tabular-nums">₹{t.advance ? Math.round(t.advance).toLocaleString() : '0'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="expenses" className="m-0 bg-card/20 rounded-xl border border-border/85 overflow-hidden">
                              {selectedTruck.expensesList.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-xs">
                                  No expenses recorded for this truck in the selected range.
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs text-left text-muted-foreground border-collapse">
                                    <thead className="text-[10px] uppercase tracking-wider bg-muted/20 border-b border-border/50">
                                      <tr>
                                        <th className="px-4 py-2.5 font-semibold text-foreground">Date</th>
                                        <th className="px-4 py-2.5 font-semibold text-foreground"><FileText className="w-3 h-3 text-muted-foreground inline mr-1" /> Category</th>
                                        <th className="px-4 py-2.5 font-semibold text-foreground">Subcategory</th>
                                        <th className="px-4 py-2.5 font-semibold text-foreground">Description</th>
                                        <th className="px-4 py-2.5 font-semibold text-foreground text-right">Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                      {selectedTruck.expensesList.map((e) => (
                                        <tr key={e.id} className="hover:bg-muted/5 transition-colors">
                                          <td className="px-4 py-2.5 whitespace-nowrap">{e.date ? new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                                          <td className="px-4 py-2.5 font-medium text-foreground">{e.category || '-'}</td>
                                          <td className="px-4 py-2.5">{e.subcategory || '-'}</td>
                                          <td className="px-4 py-2.5 max-w-[200px] truncate" title={e.description}>{e.description || '-'}</td>
                                          <td className="px-4 py-2.5 text-right text-destructive font-semibold tabular-nums">₹{e.amount ? Math.round(e.amount).toLocaleString() : '0'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>

                        </div>
                      );
                    })()}
                  </div>

                </div>
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
      )}
    </div>
  );
};

export default AnalyticsHub;