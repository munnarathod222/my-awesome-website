import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { Download, Search, AlertCircle, FileText, CheckCircle, Bell, XCircle, Table as TableIcon, Loader2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import { downloadFile, generatePDF, generateExcel } from '@/lib/downloadUtils.js';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import MarkPaymentPaidModal from '@/components/MarkPaymentPaidModal.jsx';
import SendPaymentReminderModal from '@/components/SendPaymentReminderModal.jsx';
import CancelPaymentRequestModal from '@/components/CancelPaymentRequestModal.jsx';
import { cn } from '@/lib/utils.js';

const STATUS_COLORS = {
  Paid: 'hsl(var(--success))',
  Pending: 'hsl(var(--warning))',
  Overdue: 'hsl(var(--destructive))',
  Cancelled: 'hsl(var(--muted-foreground))'
};

const PaymentRequestsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);

  // Modals
  const [paidModalReq, setPaidModalReq] = useState(null);
  const [reminderModalReq, setReminderModalReq] = useState(null);
  const [cancelModalReq, setCancelModalReq] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'request_date', direction: 'desc' });

  // Export states
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqs, cls] = await Promise.all([
        pb.collection('payment_requests').getFullList({
          expand: 'trip_id,client_id',
          sort: '-request_date',
          $autoCancel: false
        }),
        pb.collection('clients').getFullList({ sort: 'client_name', $autoCancel: false })
      ]);

      // Calculate dynamic overdue
      const today = new Date();
      today.setHours(0,0,0,0);

      const mappedReqs = reqs.map(r => {
        let currentStatus = r.status;
        let daysOverdue = 0;

        if (r.status === 'Pending' && r.due_date) {
          const due = new Date(r.due_date);
          due.setHours(0,0,0,0);
          if (today > due) {
            currentStatus = 'Overdue';
            daysOverdue = differenceInDays(today, due);
          }
        }

        return { ...r, calculatedStatus: currentStatus, daysOverdue };
      });

      // Fetch completed unpaid trips to auto-generate requests if they don't exist
      const unpaidTrips = await pb.collection('trip_logs').getFullList({
        filter: '(client_payment_status = "pending" || client_payment_status = "delayed") && client_id != ""',
        $autoCancel: false
      });

      const existingTripIds = new Set(reqs.map(r => r.trip_id));
      const tripsToGenerate = unpaidTrips.filter(t => !existingTripIds.has(t.id));

      if (tripsToGenerate.length > 0) {
        console.log(`Auto-generating ${tripsToGenerate.length} payment requests for unpaid trips...`);
        const generatedRequests = [];
        for (const trip of tripsToGenerate) {
          try {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7); // Default due date in 7 days
            
            const newReq = await pb.collection('payment_requests').create({
              trip_id: trip.id,
              client_id: trip.client_id,
              amount: trip.revenue || 0,
              request_date: new Date().toISOString(),
              due_date: dueDate.toISOString(),
              status: 'Pending',
              notes: `Auto-generated from unpaid Trip Log: ${trip.trip_id || trip.id}`
            }, { $autoCancel: false });
            
            generatedRequests.push({
              ...newReq,
              calculatedStatus: 'Pending',
              daysOverdue: 0,
              expand: {
                trip_id: trip,
                client_id: cls.find(c => c.id === trip.client_id)
              }
            });
          } catch (err) {
            console.error(`Failed to auto-generate request for trip ${trip.id}:`, err);
          }
        }
        
        setRequests([...mappedReqs, ...generatedRequests]);
      } else {
        setRequests(mappedReqs);
      }
      setClients(cls);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load payment requests');
      toast.error('Failed to sync data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const processedData = useMemo(() => {
    let filtered = requests.filter(r => {
      const matchStatus = statusFilter === 'all' || r.calculatedStatus === statusFilter;
      const matchClient = clientFilter === 'all' || r.client_id === clientFilter;
      const term = search.toLowerCase();
      const matchSearch = !term || (
        r.expand?.client_id?.client_name?.toLowerCase().includes(term) ||
        r.trip_id?.toLowerCase().includes(term)
      );
      return matchStatus && matchClient && matchSearch;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'client_name') {
        aVal = a.expand?.client_id?.client_name || '';
        bVal = b.expand?.client_id?.client_name || '';
      } else if (sortConfig.key === 'status') {
        aVal = a.calculatedStatus;
        bVal = b.calculatedStatus;
      }

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [requests, statusFilter, clientFilter, search, sortConfig]);

  const chartData = useMemo(() => {
    let pendingAmt = 0;
    let paidAmt = 0;
    
    let stats = { Pending: 0, Paid: 0, Overdue: 0, Cancelled: 0 };
    
    const timelineObj = {};

    requests.forEach(r => {
      if (r.calculatedStatus === 'Pending' || r.calculatedStatus === 'Overdue') pendingAmt += r.amount;
      if (r.calculatedStatus === 'Paid') paidAmt += r.amount;
      
      stats[r.calculatedStatus] = (stats[r.calculatedStatus] || 0) + 1;

      const d = r.request_date.split('T')[0];
      if (!timelineObj[d]) timelineObj[d] = 0;
      timelineObj[d]++;
    });

    const statusPie = Object.keys(stats).filter(k => stats[k] > 0).map(k => ({
      name: k, value: stats[k], color: STATUS_COLORS[k]
    }));

    const timeline = Object.keys(timelineObj).sort().map(d => ({
      date: format(new Date(d), 'dd MMM'),
      count: timelineObj[d]
    }));

    return { pendingAmt, paidAmt, statusPie, timeline };
  }, [requests]);

  const prepareExportData = () => {
    return processedData.map(r => ({
      'Trip ID': r.trip_id,
      'Client Name': r.expand?.client_id?.client_name || 'Unknown',
      'Amount': r.amount,
      'Request Date': format(new Date(r.request_date), 'yyyy-MM-dd'),
      'Due Date': r.due_date ? format(new Date(r.due_date), 'yyyy-MM-dd') : '',
      'Status': r.calculatedStatus,
      'Days Overdue': r.daysOverdue || 0,
      'Notes': r.notes || ''
    }));
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const data = prepareExportData();
      const columns = [
        { header: 'Client Name', key: 'Client Name' },
        { header: 'Trip ID', key: 'Trip ID' },
        { header: 'Amount (₹)', key: 'Amount' },
        { header: 'Request Date', key: 'Request Date' },
        { header: 'Due Date', key: 'Due Date' },
        { header: 'Status', key: 'Status' }
      ];
      
      const totalAmount = data.reduce((sum, row) => sum + Number(row.Amount || 0), 0);
      const totals = {
        'Client Name': 'TOTAL',
        'Trip ID': '',
        'Amount': totalAmount,
        'Request Date': '',
        'Due Date': '',
        'Status': ''
      };

      const blob = generatePDF(data, 'Payment_Requests', {
        title: 'Payment Requests Report',
        columns,
        totals
      });
      
      downloadFile(blob, `Payment_Requests_${format(new Date(), 'yyyyMMdd')}.pdf`);
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
      const totalAmount = data.reduce((sum, row) => sum + Number(row.Amount || 0), 0);
      
      data.push({
        'Trip ID': '',
        'Client Name': 'TOTAL',
        'Amount': totalAmount,
        'Request Date': '',
        'Due Date': '',
        'Status': '',
        'Days Overdue': '',
        'Notes': ''
      });

      const blob = generateExcel(data, 'Payment_Requests', 'Requests');
      downloadFile(blob, `Payment_Requests_${format(new Date(), 'yyyyMMdd')}.xlsx`);
      toast.success('Excel report downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to export Excel');
    } finally {
      setIsExportingExcel(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading payment requests..." />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Failed to load data</h2>
        <Button onClick={fetchData}>Try Again</Button>
      </div>
    );
  }

  if (!loading && requests.length === 0) {
    return (
      <>
        <Helmet><title>Payment Requests - Jai Bhavani Cargo</title></Helmet>
        <div className="min-h-[calc(100dvh-4rem)] p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col items-center justify-center text-center space-y-6 bg-background animate-in fade-in">
          <div className="w-20 h-20 bg-muted/40 rounded-3xl flex items-center justify-center">
            <FileText className="w-10 h-10 text-muted-foreground animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">No Payment Requests Found</h1>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Your payment request ledger is currently empty. Generated requests for unpaid completed trips will appear here automatically.
            </p>
          </div>
          <Button asChild className="rounded-xl px-6 h-11 font-bold shadow-sm">
            <a href="/trip-logs">Create Payment Request</a>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Payment Requests - Jai Bhavani Cargo</title></Helmet>
      <div className="min-h-[calc(100dvh-4rem)] p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 bg-background animate-in fade-in">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Payment Requests</h1>
            <p className="text-muted-foreground mt-1 text-sm">Monitor outbounds and manage client collections.</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExportingPDF || isExportingExcel}>
                {isExportingPDF || isExportingExcel ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Export
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending vs Paid Value</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{name: 'Amounts', pending: chartData.pendingAmt, paid: chartData.paidAmt}]} margin={{top:20}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
                  <Tooltip formatter={v => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="paid" name="Paid" fill="hsl(var(--success))" radius={[4,4,0,0]} />
                  <Bar dataKey="pending" name="Pending" fill="hsl(var(--warning))" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status Distribution</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
              {chartData.statusPie.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData.statusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {chartData.statusPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No requests</div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Requests Over Time</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.timeline} margin={{top:20, right: 10, left: -20}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 10}} />
                  <YAxis tickCount={4} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r: 3}} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row justify-between gap-4 pb-4">
            <CardTitle>All Requests</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search client or trip..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Clients" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.client_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="pl-6">Date</TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('client_name')}>Client</TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('amount')}>Amount</TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('due_date')}>Due Date</TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('status')}>Status</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        No payment requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    processedData.map(r => (
                      <TableRow key={r.id} className="hover:bg-muted/30">
                        <TableCell className="pl-6 whitespace-nowrap text-sm text-muted-foreground">
                          {format(new Date(r.request_date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{r.expand?.client_id?.client_name || 'Unknown Client'}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">Trip: {r.trip_id.substring(0,6)}...</div>
                        </TableCell>
                        <TableCell className="amount-display text-sm font-medium">{formatCurrency(r.amount)}</TableCell>
                        <TableCell>
                          {r.due_date ? (
                            <span className={cn("text-sm", r.calculatedStatus === 'Overdue' && "text-destructive font-medium")}>
                              {format(new Date(r.due_date), 'dd MMM yyyy')}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-start gap-1">
                            <Badge variant="outline" className={cn(
                              "border uppercase tracking-wider text-[10px]",
                              r.calculatedStatus === 'Paid' ? "bg-success/10 text-success border-success/20" :
                              r.calculatedStatus === 'Overdue' ? "bg-destructive/10 text-destructive border-destructive/20" :
                              r.calculatedStatus === 'Pending' ? "bg-warning/10 text-warning border-warning/20" :
                              "bg-muted text-muted-foreground border-border"
                            )}>
                              {r.calculatedStatus}
                            </Badge>
                            {r.calculatedStatus === 'Overdue' && (
                              <span className="text-[10px] text-destructive font-medium">{r.daysOverdue} days late</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6 space-x-2">
                          {(r.calculatedStatus === 'Pending' || r.calculatedStatus === 'Overdue') && (
                            <>
                              <Button variant="outline" size="sm" className="h-8" onClick={() => setPaidModalReq(r)}>
                                <CheckCircle className="w-3.5 h-3.5 mr-1 text-success" /> Paid
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 text-primary" onClick={() => setReminderModalReq(r)}>
                                <Bell className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 text-destructive" onClick={() => setCancelModalReq(r)}>
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <MarkPaymentPaidModal 
        isOpen={!!paidModalReq} 
        onClose={() => setPaidModalReq(null)} 
        request={paidModalReq} 
        onSuccess={fetchData} 
      />
      <SendPaymentReminderModal 
        isOpen={!!reminderModalReq} 
        onClose={() => setReminderModalReq(null)} 
        request={reminderModalReq} 
        onSuccess={fetchData} 
      />
      <CancelPaymentRequestModal 
        isOpen={!!cancelModalReq} 
        onClose={() => setCancelModalReq(null)} 
        request={cancelModalReq} 
        onSuccess={fetchData} 
      />
    </>
  );
};

export default PaymentRequestsPage;