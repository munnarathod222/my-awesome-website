import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { BarChart3, Download, PieChart, TrendingUp, AlertCircle, Calendar, Truck, Users, Receipt, FileText, Table as TableIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { downloadFile, generatePDF, generateExcel } from '@/lib/downloadUtils.js';
import { format } from 'date-fns';

const ReportsPage = () => {
  const [stats, setStats] = useState({ revenue: 0, trips: 0, expenses: 0 });
  const [rawData, setRawData] = useState({ trips: [], expenses: [] });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tripsRes, expensesRes, clientsRes] = await Promise.all([
        pb.collection('trip_logs').getFullList({ $autoCancel: false }),
        pb.collection('expenses').getFullList({ $autoCancel: false }),
        pb.collection('clients').getFullList({ $autoCancel: false })
      ]);

      const totalRevenue = tripsRes.reduce((sum, trip) => sum + (Number(trip.revenue) || 0), 0);
      const totalExpenses = expensesRes.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

      setStats({
        revenue: totalRevenue,
        trips: tripsRes.length,
        expenses: totalExpenses
      });
      
      setRawData({
        trips: tripsRes,
        expenses: expensesRes
      });
      setClients(clientsRes);
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlaceholderCard 
              icon={TrendingUp} 
              title="Revenue vs Expenses Trend" 
              desc="Select a date range to view historical comparison data over time." 
            />
            <PlaceholderCard 
              icon={PieChart} 
              title="Expense Breakdown" 
              desc="Detailed categorization of operational costs." 
            />
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="m-0 animate-in fade-in duration-300">
          <PlaceholderCard 
            icon={BarChart3} 
            title="Revenue Analytics" 
            desc="Deep dive into income streams across different routes and clients." 
          />
        </TabsContent>

        <TabsContent value="shipments" className="m-0 animate-in fade-in duration-300">
           <PlaceholderCard 
            icon={Truck} 
            title="Shipment Volume" 
            desc="Monitor freight volume, common routes, and average turnaround times." 
          />
        </TabsContent>

        <TabsContent value="expenses" className="m-0 animate-in fade-in duration-300">
           <PlaceholderCard 
            icon={Receipt} 
            title="Expense Drill-down" 
            desc="Analyze spending patterns on fuel, maintenance, tolls, and driver advances." 
          />
        </TabsContent>

        <TabsContent value="vehicles" className="m-0 animate-in fade-in duration-300">
           <PlaceholderCard 
            icon={Calendar} 
            title="Fleet Performance" 
            desc="Track maintenance schedules, fuel efficiency (km/l), and ROI per truck." 
          />
        </TabsContent>

        <TabsContent value="payroll" className="m-0 animate-in fade-in duration-300">
           <PlaceholderCard 
            icon={Users} 
            title="Payroll Summary" 
            desc="View total employee compensation, bonuses disbursed, and deduction metrics." 
          />
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

      </Tabs>
    </div>
  );
};

export default ReportsPage;