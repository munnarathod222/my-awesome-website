import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { BarChart3, Download, PieChart, TrendingUp, AlertCircle, Calendar, Truck, Users, Receipt, FileText, Table as TableIcon, Loader2, ExternalLink, Minimize2, CheckCircle2, ShieldAlert, Settings2, Trash2, Edit2, X, Maximize2, ImageOff, Download as DownloadIcon, Eye, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { downloadFile, generatePDF, generateExcel } from '@/lib/downloadUtils.js';
import { format } from 'date-fns';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const ReportsPage = () => {
  const [stats, setStats] = useState({ revenue: 0, trips: 0, expenses: 0 });
  const [rawData, setRawData] = useState({ trips: [], expenses: [] });
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tripsRes, expensesRes, clientsRes, employeesRes, trucksRes] = await Promise.all([
        pb.collection('trip_logs').getFullList({ expand: 'client_id', $autoCancel: false }),
        pb.collection('expenses').getFullList({ $autoCancel: false }),
        pb.collection('clients').getFullList({ $autoCancel: false }),
        pb.collection('employees').getFullList({ $autoCancel: false }),
        pb.collection('trucks').getFullList({ $autoCancel: false })
      ]);

      const deliveredTrips = tripsRes.filter(t => t.trip_status === 'Delivered');
      const totalRevenue = deliveredTrips.reduce((sum, trip) => sum + (Number(trip.revenue) || 0), 0);
      const totalExpenses = expensesRes.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

      setStats({
        revenue: totalRevenue,
        trips: deliveredTrips.length,
        expenses: totalExpenses
      });
      
      setRawData({
        trips: tripsRes,
        expenses: expensesRes
      });
      setClients(clientsRes);
      setEmployees(employeesRes);
      setTrucks(trucksRes);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data. Please check your connection.');
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const tdsClaims = useMemo(() => {
    const grouped = {};
    
    rawData.trips.forEach(trip => {
      const clientId = trip.client_id;
      if (!clientId) return;
      
      const tdsHeld = Number(trip.tds_deducted_receivable) || 0;
      const grossVolume = Number(trip.revenue) || 0;
      
      if (!grouped[clientId]) {
        const clientInfo = clients.find(c => c.id === clientId);
        grouped[clientId] = {
          clientId,
          clientName: clientInfo?.client_name || 'Unknown Client',
          gstin: clientInfo?.gst_number || 'N/A',
          pan: clientInfo?.pan_number || 'N/A',
          grossVolume: 0,
          tdsHeld: 0
        };
      }
      
      grouped[clientId].grossVolume += grossVolume;
      grouped[clientId].tdsHeld += tdsHeld;
    });
    return Object.values(grouped).sort((a, b) => b.tdsHeld - a.tdsHeld);
  }, [rawData.trips, clients]);

  const [gstViewMode, setGstViewMode] = useState('forward'); // 'forward' or 'rcm'

  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach(emp => { map[emp.name] = emp; });
    return map;
  }, [employees]);

  const taxLedger = useMemo(() => {
    return rawData.trips.map(trip => {
      const isAttached = trip.ownership_type === 'Attached';
      const clientName = trip.expand?.client_id?.client_name || 'Unknown Client';
      const grossInvoice = Number(trip.revenue) || 0;
      const clientTds = Number(trip.tds_deducted_receivable) || 0;
      const fleetType = isAttached ? 'Attached' : 'Owned';
      
      let vendorName = 'N/A';
      let vendorPan = 'N/A';
      let grossPayout = 0;
      let appliedRate = 0;
      let vendorTds = 0;
      let netPayout = 0;

      if (isAttached) {
        vendorName = trip.driver_name || 'N/A';
        const driver = employeeMap[trip.driver_name];
        vendorPan = driver?.pan_card || '';
        grossPayout = Number(trip.vendor_payout) || 0;
        appliedRate = vendorPan ? 1 : 20; // 1% if PAN exists, 20% penalty if missing
        vendorTds = Number((grossPayout * (appliedRate / 100)).toFixed(2));
        netPayout = Number((grossPayout - vendorTds).toFixed(2));
      }

      const isRcm = clientName.toLowerCase().includes('amazon') || clientName.toLowerCase().includes('flipkart');
      const gstClass = isRcm ? 'Reverse Charge Mechanism (RCM - 5% direct)' : 'Forward Charge (12% collect)';

      return {
        tripId: trip.trip_id || 'N/A',
        id: trip.id,
        date: trip.date,
        clientName,
        grossInvoice,
        clientTds,
        fleetType,
        vendorName,
        vendorPan,
        grossPayout,
        appliedRate,
        vendorTds,
        netPayout,
        gstClass,
        isRcm
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [rawData.trips, employeeMap]);

  const totalTdsReceivable = useMemo(() => {
    return taxLedger.reduce((sum, item) => sum + (Number(item.clientTds) || 0), 0);
  }, [taxLedger]);

  const totalTdsPayable = useMemo(() => {
    return taxLedger.reduce((sum, item) => sum + (Number(item.vendorTds) || 0), 0);
  }, [taxLedger]);

  const netPlatformMargin = useMemo(() => {
    const totalRevenue = stats.revenue;
    const totalVendorPayouts = taxLedger.reduce((sum, item) => sum + (Number(item.grossPayout) || 0), 0);
    const totalExpenses = stats.expenses;
    return totalRevenue - totalVendorPayouts - totalExpenses;
  }, [stats.revenue, stats.expenses, taxLedger]);

  // --- REVENUE MEMOS ---
  const clientRevenueData = useMemo(() => {
    const grouped = {};
    rawData.trips.forEach(trip => {
      if (trip.trip_status !== 'Delivered') return;
      const clientName = trip.expand?.client_id?.client_name || 'Unknown Client';
      grouped[clientName] = (grouped[clientName] || 0) + (Number(trip.revenue) || 0);
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [rawData.trips]);

  const monthlyRevenueData = useMemo(() => {
    const grouped = {};
    rawData.trips.forEach(trip => {
      if (trip.trip_status !== 'Delivered') return;
      const date = trip.date ? new Date(trip.date) : new Date(trip.created);
      const monthStr = format(date, 'MMM yyyy');
      grouped[monthStr] = (grouped[monthStr] || 0) + (Number(trip.revenue) || 0);
    });
    return Object.entries(grouped).map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [rawData.trips]);

  const topRoutesData = useMemo(() => {
    const grouped = {};
    rawData.trips.forEach(trip => {
      if (trip.trip_status !== 'Delivered') return;
      const route = trip.route || 'Unknown Route';
      grouped[route] = (grouped[route] || 0) + (Number(trip.revenue) || 0);
    });
    return Object.entries(grouped)
      .map(([route, revenue]) => ({ route, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [rawData.trips]);

  // --- SHIPMENTS MEMOS ---
  const shipmentsStatusData = useMemo(() => {
    const grouped = {};
    rawData.trips.forEach(trip => {
      const status = trip.trip_status || 'Unknown';
      grouped[status] = (grouped[status] || 0) + 1;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [rawData.trips]);

  const shipmentsRouteData = useMemo(() => {
    const grouped = {};
    rawData.trips.forEach(trip => {
      const route = trip.route || 'Unknown Route';
      grouped[route] = (grouped[route] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [rawData.trips]);

  // --- EXPENSE MEMOS ---
  const expensesCategoryData = useMemo(() => {
    const grouped = {};
    rawData.expenses.forEach(exp => {
      const cat = exp.category || 'Other';
      grouped[cat] = (grouped[cat] || 0) + (Number(exp.amount) || 0);
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [rawData.expenses]);

  const monthlyExpenseData = useMemo(() => {
    const grouped = {};
    rawData.expenses.forEach(exp => {
      const date = exp.date ? new Date(exp.date) : new Date(exp.created);
      const monthStr = format(date, 'MMM yyyy');
      grouped[monthStr] = (grouped[monthStr] || 0) + (Number(exp.amount) || 0);
    });
    return Object.entries(grouped).map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [rawData.expenses]);

  // --- VEHICLES PERFORMANCE MEMOS ---
  const fleetPerformanceData = useMemo(() => {
    const grouped = {};
    rawData.trips.forEach(trip => {
      if (trip.trip_status !== 'Delivered') return;
      const truck = trip.truck_number || 'Unknown Vehicle';
      if (!grouped[truck]) {
        grouped[truck] = { truck, trips: 0, revenue: 0, expenses: 0 };
      }
      grouped[truck].trips += 1;
      grouped[truck].revenue += Number(trip.revenue) || 0;
    });

    rawData.expenses.forEach(exp => {
      const truckRecord = trucks.find(t => t.id === exp.truck_id);
      const truck = truckRecord ? truckRecord.truck_number : (exp.truck_id || 'Unknown Vehicle');
      if (!grouped[truck]) {
        grouped[truck] = { truck, trips: 0, revenue: 0, expenses: 0 };
      }
      grouped[truck].expenses += Number(exp.amount) || 0;
    });

    return Object.values(grouped).map(item => ({
      ...item,
      margin: item.revenue - item.expenses
    })).sort((a, b) => b.revenue - a.revenue);
  }, [rawData.trips, rawData.expenses, trucks]);

  // --- PAYROLL MEMOS ---
  const payrollSummaryData = useMemo(() => {
    return employees.map(emp => {
      const basePay = Number(emp.salary_amount) || 0;
      return {
        id: emp.id,
        name: emp.name,
        type: emp.employee_type || 'driver',
        status: emp.active_status || 'active',
        contact: emp.contact || 'N/A',
        basePay,
        netPay: basePay
      };
    });
  }, [employees]);

  // --- OVERVIEW REVENUE VS EXPENSE TREND ---
  const overviewTrendData = useMemo(() => {
    const trend = {};
    monthlyRevenueData.forEach(item => {
      trend[item.month] = { month: item.month, revenue: item.amount, expenses: 0 };
    });
    monthlyExpenseData.forEach(item => {
      if (!trend[item.month]) {
        trend[item.month] = { month: item.month, revenue: 0, expenses: item.amount };
      } else {
        trend[item.month].expenses = item.amount;
      }
    });
    return Object.values(trend).sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [monthlyRevenueData, monthlyExpenseData]);

  const handleTaxExportCSV = () => {
    try {
      const headers = [
        'Trip ID',
        'Date',
        'Client Name',
        'Gross Invoice Amount (INR)',
        'Client TDS Deducted (INR)',
        'Fleet Type',
        'Vendor Name',
        'Vendor PAN',
        'Gross Vendor Payout (INR)',
        'Applied TDS Rate (%)',
        'Vendor TDS Deducted (INR)',
        'Final Net Payout (INR)',
        'GST Classification'
      ];

      const csvRows = [headers.join(',')];

      taxLedger.forEach(item => {
        const row = [
          item.tripId,
          item.date ? item.date.substring(0, 10) : 'N/A',
          `"${item.clientName.replace(/"/g, '""')}"`,
          item.grossInvoice,
          item.clientTds,
          item.fleetType,
          `"${item.vendorName.replace(/"/g, '""')}"`,
          item.vendorPan || 'Missing',
          item.grossPayout,
          `${item.appliedRate}%`,
          item.vendorTds,
          item.netPayout,
          `"${item.gstClass}"`
        ];
        csvRows.push(row.join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Tax_Ledger_Export_${format(new Date(), 'yyyyMMdd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Tax ledger exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV');
    }
  };

  const prepareExportData = () => {
    // Combine trips and expenses into a unified ledger for the report
    const combined = [
      ...rawData.trips.map(t => ({
        Date: format(new Date(t.date || t.created), 'yyyy-MM-dd'),
        Type: 'Trip Revenue',
        Reference: t.truck_number || 'N/A',
        Description: `Route: ${t.route || 'N/A'}`,
        Amount: t.revenue || 0
      })),
      ...rawData.expenses.map(e => ({
        Date: format(new Date(e.date || e.created), 'yyyy-MM-dd'),
        Type: `Expense - ${e.category}`,
        Reference: e.truck_id || 'N/A',
        Description: e.description || 'N/A',
        Amount: -(e.amount || 0)
      }))
    ].sort((a, b) => new Date(b.Date) - new Date(a.Date));

    return combined;
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const data = prepareExportData();
      const columns = [
        { header: 'Date', key: 'Date' },
        { header: 'Type', key: 'Type' },
        { header: 'Reference', key: 'Reference' },
        { header: 'Description', key: 'Description' },
        { header: 'Amount (₹)', key: 'Amount' }
      ];
      
      const totals = {
        Date: 'TOTAL',
        Type: '',
        Reference: '',
        Description: '',
        Amount: `₹${(stats.revenue - stats.expenses).toLocaleString()}`
      };

      const blob = generatePDF(data, 'Financial_Report', {
        title: 'Financial Overview Report',
        columns,
        totals
      });
      
      downloadFile(blob, `Financial_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
      toast.success('PDF report downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to export PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const data = prepareExportData();
      // Add totals row for Excel
      data.push({
        Date: 'TOTAL NET',
        Type: '',
        Reference: '',
        Description: '',
        Amount: stats.revenue - stats.expenses
      });
      
      const blob = generateExcel(data, 'Financial_Report', 'Overview');
      downloadFile(blob, `Financial_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
      toast.success('Excel report downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to export Excel');
    } finally {
      setIsExportingExcel(false);
    }
  };

  if (loading) return <LoadingSpinner text="Generating reports..." />;

  if (error) {
    return (
      <div className="p-12 text-center min-h-[50vh] flex flex-col justify-center items-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Report Generation Failed</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={fetchReportData}>Try Again</Button>
      </div>
    );
  }

  const PlaceholderCard = ({ icon: Icon, title, desc }) => (
    <Card className="min-h-[300px] flex items-center justify-center bg-muted/10 border-border shadow-sm">
      <div className="text-center text-muted-foreground max-w-sm p-6">
        <Icon className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <CardTitle className="text-xl mb-2 text-foreground">{title}</CardTitle>
        <p className="text-sm">{desc}</p>
      </div>
    </Card>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <Helmet>
        <title>Reports & Analytics | Dashboard</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive insights into operations and financials.</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="shadow-sm rounded-xl gap-2" disabled={isExportingPDF || isExportingExcel}>
              {isExportingPDF || isExportingExcel ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportPDF} disabled={isExportingPDF}>
              <FileText className="w-4 h-4 mr-2 text-destructive" /> Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel} disabled={isExportingExcel}>
              <TableIcon className="w-4 h-4 mr-2 text-success" /> Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto justify-start flex-nowrap h-auto mb-8">
          <TabsTrigger value="overview" className="rounded-lg whitespace-nowrap">Overview</TabsTrigger>
          <TabsTrigger value="revenue" className="rounded-lg whitespace-nowrap">Revenue</TabsTrigger>
          <TabsTrigger value="shipments" className="rounded-lg whitespace-nowrap">Shipments</TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-lg whitespace-nowrap">Expenses</TabsTrigger>
          <TabsTrigger value="vehicles" className="rounded-lg whitespace-nowrap">Vehicles</TabsTrigger>
          <TabsTrigger value="payroll" className="rounded-lg whitespace-nowrap">Payroll</TabsTrigger>
          <TabsTrigger value="tds" className="rounded-lg whitespace-nowrap">TDS Claims Directory</TabsTrigger>
          <TabsTrigger value="tax_manager" className="rounded-lg whitespace-nowrap text-primary font-semibold">Tax Manager</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 m-0 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <TrendingUp className="w-4 h-4 text-success opacity-50" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success tracking-tight">₹{stats.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-2">Aggregated from all trips</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                <Receipt className="w-4 h-4 text-destructive opacity-50" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive tracking-tight">₹{stats.expenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-2">Fuel, maint., & misc.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Shipments</CardTitle>
                <Truck className="w-4 h-4 text-primary opacity-50" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-foreground">{stats.trips}</div>
                <p className="text-xs text-muted-foreground mt-2">Active and completed trips</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Monthly Revenue vs Expenses Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {overviewTrendData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No trend data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overviewTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ background: '#111a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-primary" />
                  Expense Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                {expensesCategoryData.length === 0 ? (
                  <div className="text-muted-foreground text-xs">No expense records available</div>
                ) : (
                  <div className="w-full h-full flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="w-full sm:w-1/2 h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={expensesCategoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {expensesCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ background: '#111a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto w-full sm:w-1/2 pr-2">
                      {expensesCategoryData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                            <span className="text-muted-foreground truncate">{entry.name}</span>
                          </div>
                          <span className="font-semibold text-foreground ml-2">₹{entry.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6 m-0 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Delivered Revenue by Client
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {clientRevenueData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No client revenue data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clientRevenueData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                      <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" fontSize={10} width={100} />
                      <Tooltip 
                        contentStyle={{ background: '#111a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      />
                      <Bar dataKey="value" name="Revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Monthly Delivered Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {monthlyRevenueData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No monthly revenue data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRevenueData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ background: '#111a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      />
                      <Line type="monotone" dataKey="amount" name="Revenue" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border mb-4">
              <CardTitle className="text-md font-bold text-foreground">Top 5 Route Segments by Revenue</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-semibold text-foreground">Route Segment</TableHead>
                    <TableHead className="font-semibold text-foreground text-right pr-6">Total Generated Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topRoutesData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-10">No route revenue logs found.</TableCell>
                    </TableRow>
                  ) : (
                    topRoutesData.map((item, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/20">
                        <TableCell className="font-bold text-foreground">{item.route}</TableCell>
                        <TableCell className="text-right font-extrabold text-success pr-6">₹{item.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipments" className="space-y-6 m-0 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-primary" />
                  Shipment Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                {shipmentsStatusData.length === 0 ? (
                  <div className="text-muted-foreground text-xs">No shipment data available</div>
                ) : (
                  <div className="w-full h-full flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="w-full sm:w-1/2 h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={shipmentsStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {shipmentsStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ background: '#111a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto w-full sm:w-1/2 pr-2">
                      {shipmentsStatusData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                            <span className="text-muted-foreground truncate capitalize">{entry.name}</span>
                          </div>
                          <span className="font-semibold text-foreground ml-2">{entry.value} trips</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Top Routes by Shipment Volume
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {shipmentsRouteData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No route frequency data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={shipmentsRouteData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={9} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ background: '#111a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      />
                      <Bar dataKey="value" name="Trips" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border mb-4">
              <CardTitle className="text-md font-bold text-foreground">Recent Shipments Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-muted/30 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="font-semibold text-foreground">Trip ID</TableHead>
                      <TableHead className="font-semibold text-foreground">Date</TableHead>
                      <TableHead className="font-semibold text-foreground">Route</TableHead>
                      <TableHead className="font-semibold text-foreground">Vehicle</TableHead>
                      <TableHead className="font-semibold text-foreground">Driver</TableHead>
                      <TableHead className="font-semibold text-foreground text-right pr-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawData.trips.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-10">No shipments found.</TableCell>
                      </TableRow>
                    ) : (
                      rawData.trips.slice(0, 10).map((t, idx) => (
                        <TableRow key={t.id || idx} className="hover:bg-muted/20">
                          <TableCell className="font-bold text-foreground">{t.trip_id}</TableCell>
                          <TableCell className="text-xs">{t.date ? format(new Date(t.date), 'dd MMM yyyy') : 'N/A'}</TableCell>
                          <TableCell className="font-medium text-foreground">{t.route}</TableCell>
                          <TableCell className="font-mono text-xs">{t.truck_number}</TableCell>
                          <TableCell className="text-xs">{t.driver_name}</TableCell>
                          <TableCell className="text-right pr-6">
                            <Badge variant="outline" className={`text-[10px] uppercase font-bold py-0.5 leading-none ${
                              t.trip_status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              t.trip_status === 'Dispatched' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                              'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}>
                              {t.trip_status || 'Planned'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6 m-0 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-primary" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                {expensesCategoryData.length === 0 ? (
                  <div className="text-muted-foreground text-xs">No expense records available</div>
                ) : (
                  <div className="w-full h-full flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="w-full sm:w-1/2 h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={expensesCategoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {expensesCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ background: '#111a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto w-full sm:w-1/2 pr-2">
                      {expensesCategoryData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                            <span className="text-muted-foreground truncate">{entry.name}</span>
                          </div>
                          <span className="font-semibold text-foreground ml-2">₹{entry.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Monthly Expense Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {monthlyExpenseData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No monthly expense trend data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyExpenseData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ background: '#111a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      />
                      <Line type="monotone" dataKey="amount" name="Expenses" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border mb-4">
              <CardTitle className="text-md font-bold text-foreground">Recent Operational Expenses</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-muted/30 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="font-semibold text-foreground">Date</TableHead>
                      <TableHead className="font-semibold text-foreground">Category</TableHead>
                      <TableHead className="font-semibold text-foreground">Subcategory</TableHead>
                      <TableHead className="font-semibold text-foreground">Description</TableHead>
                      <TableHead className="font-semibold text-foreground">Payment Method</TableHead>
                      <TableHead className="font-semibold text-foreground text-right pr-6">Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawData.expenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-10">No expenses recorded.</TableCell>
                      </TableRow>
                    ) : (
                      rawData.expenses.slice(0, 10).map((e, idx) => (
                        <TableRow key={e.id || idx} className="hover:bg-muted/20">
                          <TableCell className="text-xs">{e.date ? format(new Date(e.date), 'dd MMM yyyy') : 'N/A'}</TableCell>
                          <TableCell className="font-bold text-foreground">{e.category}</TableCell>
                          <TableCell className="text-xs">{e.subcategory || 'General'}</TableCell>
                          <TableCell className="text-xs max-w-[150px] truncate" title={e.description}>{e.description || 'N/A'}</TableCell>
                          <TableCell className="text-xs">{e.payment_method || 'Cash'}</TableCell>
                          <TableCell className="text-right font-extrabold text-destructive pr-6">₹{e.amount?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6 m-0 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Vehicle Net Profitability (Revenue vs Expenses)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {fleetPerformanceData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No fleet performance data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fleetPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="truck" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ background: '#111a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  Shipment Utilisation by Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {fleetPerformanceData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No fleet utilization data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fleetPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="truck" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ background: '#111a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      />
                      <Bar dataKey="trips" name="Trips Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border mb-4">
              <CardTitle className="text-md font-bold text-foreground">Fleet Profitability Ledger</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-semibold text-foreground">Truck Number</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">Trips Ran</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Gross Revenue Generated</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Total Expenses (INR)</TableHead>
                    <TableHead className="font-semibold text-foreground text-right pr-6">Net Retained Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fleetPerformanceData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-10">No profitability ledger compiled.</TableCell>
                    </TableRow>
                  ) : (
                    fleetPerformanceData.map((item, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/20">
                        <TableCell className="font-mono font-bold text-foreground">{item.truck}</TableCell>
                        <TableCell className="text-center font-medium">{item.trips}</TableCell>
                        <TableCell className="text-right font-semibold text-success">₹{item.revenue.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold text-destructive">₹{item.expenses.toLocaleString()}</TableCell>
                        <TableCell className={`text-right font-extrabold pr-6 ${item.margin >= 0 ? 'text-success' : 'text-destructive'}`}>
                          ₹{item.margin.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6 m-0 animate-in fade-in duration-300">
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border mb-4">
              <CardTitle className="text-md font-bold text-foreground">Employee Compensation & Payroll Directory</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-semibold text-foreground">Employee Name</TableHead>
                    <TableHead className="font-semibold text-foreground">Role / Type</TableHead>
                    <TableHead className="font-semibold text-foreground">Contact Info</TableHead>
                    <TableHead className="font-semibold text-foreground">Active Status</TableHead>
                    <TableHead className="font-semibold text-foreground text-right pr-6">Monthly Salary (INR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollSummaryData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-10">No employee compensation profile compiled.</TableCell>
                    </TableRow>
                  ) : (
                    payrollSummaryData.map((emp) => (
                      <TableRow key={emp.id} className="hover:bg-muted/20">
                        <TableCell className="font-bold text-foreground">{emp.name}</TableCell>
                        <TableCell className="capitalize text-xs">{emp.type}</TableCell>
                        <TableCell className="font-mono text-xs">{emp.contact}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[9px] uppercase font-bold py-0.5 leading-none ${
                            emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground'
                          }`}>
                            {emp.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-extrabold text-foreground pr-6">₹{emp.basePay.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tds" className="m-0 animate-in fade-in duration-300">
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border mb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                TDS Claims Ledger (Form 26AS Reconciliation)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border border-border/50">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="font-semibold text-foreground">Client Name</TableHead>
                      <TableHead className="font-semibold text-foreground">Tax ID (GSTIN / PAN)</TableHead>
                      <TableHead className="font-semibold text-foreground text-right">Total Gross Volume Processed</TableHead>
                      <TableHead className="font-semibold text-foreground text-right pr-6">Total TDS Held Back</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tdsClaims.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                          No TDS claims logs compiled. Ensure client setup has Applies TDS Deduction toggled active.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tdsClaims.map((claim, idx) => (
                        <TableRow key={claim.clientId || idx} className="hover:bg-muted/20">
                          <TableCell className="font-bold text-foreground">{claim.clientName}</TableCell>
                          <TableCell>
                            <div className="text-xs">GST: <span className="font-medium text-foreground">{claim.gstin}</span></div>
                            <div className="text-xs mt-1">PAN: <span className="font-medium text-foreground">{claim.pan}</span></div>
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums text-foreground">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(claim.grossVolume)}
                          </TableCell>
                          <TableCell className="text-right font-extrabold tabular-nums text-destructive pr-6">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(claim.tdsHeld)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax_manager" className="m-0 animate-in fade-in duration-300 space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border-border bg-card border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total TDS Receivable (Asset)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-primary tracking-tight">
                  ₹{Number(totalTdsReceivable).toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                  TDS deducted from us by clients. Claimable as Income Tax refund.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card border-l-4 border-l-destructive">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total TDS Payable (Liability)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-destructive tracking-tight">
                  ₹{Number(totalTdsPayable).toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                  TDS deducted by us from attached vendors. Pay to Govt by 7th of next month.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card border-l-4 border-l-success">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Net Retained Platform Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-success tracking-tight">
                  ₹{Number(netPlatformMargin).toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                  Calculated as: Client Revenue - Vendor Gross Payouts - Internal Fleet Expenses.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Tax Ledger Grid */}
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <FileText className="w-5 h-5 text-primary" />
                  Trip Tax Footprint Ledger (Section 194C)
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Line-by-line breakdown of trip-wise client billing and vendor tax compliance.</p>
              </div>
              <Button 
                onClick={handleTaxExportCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm gap-2"
              >
                <FileText className="w-4 h-4" /> Bulk Export to CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="font-semibold text-foreground">Trip Details</TableHead>
                      <TableHead className="font-semibold text-foreground">Client Billing</TableHead>
                      <TableHead className="font-semibold text-foreground">Fleet Type</TableHead>
                      <TableHead className="font-semibold text-foreground">Vendor Details & Payout</TableHead>
                      <TableHead className="font-semibold text-foreground text-right">Vendor TDS (₹)</TableHead>
                      <TableHead className="font-semibold text-foreground text-right pr-6">Net Payout</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxLedger.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          No trip logs loaded in this date range.
                        </TableCell>
                      </TableRow>
                    ) : (
                      taxLedger.map((item) => {
                        const isPenaltyRate = item.appliedRate === 20;
                        return (
                          <TableRow 
                            key={item.id} 
                            className={`hover:bg-muted/20 transition-colors ${
                              isPenaltyRate ? 'bg-red-500/5 hover:bg-red-500/10' : ''
                            }`}
                          >
                            <TableCell>
                              <div className="font-bold text-foreground">{item.tripId}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {item.date ? format(new Date(item.date), 'dd MMM yyyy') : 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-foreground">{item.clientName}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                Inv: <span className="font-bold text-foreground">₹{item.grossInvoice.toLocaleString()}</span>
                              </div>
                              <div className="text-[10px] text-primary font-medium">
                                TDS Recd: ₹{item.clientTds.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={
                                  item.fleetType === 'Attached'
                                    ? 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                                    : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                }
                              >
                                {item.fleetType === 'Attached' ? 'Attached' : 'Owned'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {item.fleetType === 'Attached' ? (
                                <div>
                                  <div className="font-semibold text-foreground">{item.vendorName}</div>
                                  <div className="text-xs flex items-center gap-1.5 mt-0.5">
                                    <span className="text-muted-foreground">PAN:</span> 
                                    <span className={`font-mono font-bold ${isPenaltyRate ? 'text-destructive' : 'text-foreground'}`}>
                                      {item.vendorPan || 'MISSING'}
                                    </span>
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    Gross: <span className="font-bold">₹{item.grossPayout.toLocaleString()}</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic text-xs">Internal Crew</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.fleetType === 'Attached' ? (
                                <div className="flex flex-col items-end">
                                  <span className={`font-bold tabular-nums ${isPenaltyRate ? 'text-destructive font-extrabold text-sm' : 'text-foreground'}`}>
                                    ₹{item.vendorTds.toLocaleString()}
                                  </span>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-[9px] mt-1 ${
                                      isPenaltyRate ? 'bg-red-500/10 text-red-600 border-red-500/20 font-bold' : 'bg-secondary text-muted-foreground'
                                    }`}
                                  >
                                    Rate: {item.appliedRate}%
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-bold tabular-nums text-foreground pr-6">
                              {item.fleetType === 'Attached' ? (
                                `₹${item.netPayout.toLocaleString()}`
                              ) : (
                                <span className="text-muted-foreground text-xs font-normal italic">N/A</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* GST Classification Section */}
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <PieChart className="w-5 h-5 text-primary" />
                  GST Outward Invoice Classification Ledger
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track client invoices grouped by forward charge tax collection or Reverse Charge Mechanism compliance.
                </p>
              </div>
              
              {/* GST Toggler Buttons */}
              <div className="flex bg-muted/60 p-1 rounded-xl border border-border/50">
                <Button
                  size="sm"
                  variant={gstViewMode === 'forward' ? 'default' : 'ghost'}
                  onClick={() => setGstViewMode('forward')}
                  className="rounded-lg text-xs px-4"
                >
                  Forward Charge Ledger (12% Collect)
                </Button>
                <Button
                  size="sm"
                  variant={gstViewMode === 'rcm' ? 'default' : 'ghost'}
                  onClick={() => setGstViewMode('rcm')}
                  className="rounded-lg text-xs px-4"
                >
                  RCM Ledger (5% Direct Pay)
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="font-semibold text-foreground">Invoice ID</TableHead>
                      <TableHead className="font-semibold text-foreground">Billing Date</TableHead>
                      <TableHead className="font-semibold text-foreground">Client Name</TableHead>
                      <TableHead className="font-semibold text-foreground">Tax Classification</TableHead>
                      <TableHead className="font-semibold text-foreground text-right pr-6">Invoiced Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxLedger.filter(item => gstViewMode === 'rcm' ? item.isRcm : !item.isRcm).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          No transactions found for this GST classification.
                        </TableCell>
                      </TableRow>
                    ) : (
                      taxLedger
                        .filter(item => gstViewMode === 'rcm' ? item.isRcm : !item.isRcm)
                        .map((item) => (
                          <TableRow key={item.id} className="hover:bg-muted/20">
                            <TableCell className="font-bold text-foreground">{item.tripId}</TableCell>
                            <TableCell className="text-sm">
                              {item.date ? format(new Date(item.date), 'dd MMM yyyy') : 'N/A'}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{item.clientName}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-foreground">{item.gstClass}</span>
                                {item.isRcm && (
                                  <span className="text-[10px] text-orange-500 font-medium italic mt-0.5">
                                    * Disclaimer: GST under reverse charge mechanism is payable directly by the recipient.
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-extrabold tabular-nums text-foreground pr-6">
                              ₹{item.grossInvoice.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;