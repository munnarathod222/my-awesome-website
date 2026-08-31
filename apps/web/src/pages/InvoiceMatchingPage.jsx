import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Search, Link as LinkIcon, FileText, CheckCircle2, XCircle, AlertCircle, Clock, 
  Receipt, MapPin, Truck, Eye, Download, RefreshCw, FileBox, DollarSign, Filter, Check,
  ChevronRight, ArrowRight, ExternalLink, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/analyticsUtils.js';

export default function InvoiceMatchingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tripIdParam = searchParams.get('tripId') || searchParams.get('trip_id') || '';

  // Data State
  const [trips, setTrips] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(tripIdParam);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClient, setFilterClient] = useState('all');

  // Load database tables
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tripsData, reqsData, proofsData, cashbookData, clientsData] = await Promise.all([
        pb.collection('trip_logs').getFullList({ sort: '-date', expand: 'client_id,route_id', $autoCancel: false }),
        pb.collection('payment_requests').getFullList({ expand: 'trip_id,client_id', $autoCancel: false }),
        pb.collection('delivery_proofs').getFullList({ $autoCancel: false }),
        pb.collection('cashbook').getFullList({ filter: 'reference_id != ""', $autoCancel: false }),
        pb.collection('clients').getFullList({ $autoCancel: false })
      ]);

      setTrips(tripsData);
      setInvoices(reqsData);
      setProofs(proofsData);
      setPayments(cashbookData);
      setClients(clientsData);
      
      // Proactively handle target query parameter
      if (tripIdParam) {
        const found = tripsData.find(t => 
          (t.trip_id && t.trip_id.toLowerCase() === tripIdParam.toLowerCase()) || 
          t.id === tripIdParam
        );
        if (found) {
          setSelectedTrip(found);
          setIsDetailModalOpen(true);
        } else {
          toast.error(`Trip ${tripIdParam} not found`);
        }
      }
    } catch (err) {
      console.error('Failed to load reconciliation data:', err);
      toast.error('Failed to sync financial tables');
    } finally {
      setLoading(false);
    }
  }, [tripIdParam]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync searchQuery with parameters
  useEffect(() => {
    if (tripIdParam) {
      setSearchQuery(tripIdParam);
      const found = trips.find(t => 
        (t.trip_id && t.trip_id.toLowerCase() === tripIdParam.toLowerCase()) || 
        t.id === tripIdParam
      );
      if (found) {
        setSelectedTrip(found);
        setIsDetailModalOpen(true);
      }
    }
  }, [tripIdParam, trips]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchParams({});
      return;
    }
    setSearchParams({ tripId: searchQuery.trim() });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setSelectedTrip(null);
    setIsDetailModalOpen(false);
  };

  // Enrichment pipeline: map each trip to its connected records
  const enrichedTrips = useMemo(() => {
    return trips.map(trip => {
      // 1. Trip/LR Details
      const isLRComplete = (Number(trip.revenue) || Number(trip.freight_amount) || 0) > 0 && !!trip.route;

      // 2. POD Details
      // A trip has POD if it has files in delivery_proofs or pod_file/pod_link in trip_logs
      const relatedProofs = proofs.filter(p => p.trip_id === trip.id);
      const hasProofRecord = relatedProofs.length > 0;
      const hasTripPod = !!trip.pod_file || !!trip.pod_link;
      const hasPOD = hasProofRecord || hasTripPod;
      
      let podStatus = 'Missing';
      if (hasPOD) {
        const statuses = [...relatedProofs.map(p => p.status), trip.pod_status].filter(Boolean);
        if (statuses.includes('Approved') || statuses.includes('Verified')) {
          podStatus = 'Approved';
        } else if (statuses.includes('Rejected')) {
          podStatus = 'Rejected';
        } else {
          podStatus = 'Pending Verification';
        }
      }

      // 3. Invoice Details
      const relatedInvoice = invoices.find(inv => inv.trip_id === trip.id);
      let invoiceStatus = 'Not Generated';
      if (relatedInvoice) {
        invoiceStatus = relatedInvoice.status || 'Pending';
      } else if (trip.trip_status === 'Delivered') {
        invoiceStatus = 'Ready to Invoice';
      } else {
        invoiceStatus = 'Awaiting Dispatch';
      }

      // 4. Payment Details
      // Look up cashbook transactions where reference_id contains this trip's id
      const matchingPayments = payments.filter(pay => 
        (pay.reference_id || '').split(',').includes(trip.id) ||
        (pay.reference_id || '') === trip.id ||
        (pay.reference_id || '').split(',').includes(trip.trip_id)
      );
      
      let paymentStatus = 'Unpaid';
      if (trip.client_payment_status === 'received' || relatedInvoice?.status === 'Paid') {
        paymentStatus = 'Settled';
      } else if (trip.client_payment_status === 'delayed') {
        paymentStatus = 'Delayed';
      } else if (matchingPayments.length > 0) {
        const totalPaid = matchingPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const gross = Number(trip.revenue) || 0;
        const adv = Number(trip.advance_received_from_client) || 0;
        const due = gross - adv;
        if (totalPaid >= due && due > 0) {
          paymentStatus = 'Settled';
        } else if (totalPaid > 0) {
          paymentStatus = 'Partial';
        } else {
          paymentStatus = 'Unpaid';
        }
      } else if (trip.client_payment_status === 'pending') {
        paymentStatus = 'Unpaid';
      }

      // Overall match status
      let overallStatus = 'Incomplete';
      if (isLRComplete && podStatus === 'Approved' && invoiceStatus === 'Paid' && paymentStatus === 'Settled') {
        overallStatus = 'Reconciled';
      } else if (!hasPOD) {
        overallStatus = 'Missing POD';
      } else if (!relatedInvoice) {
        overallStatus = 'Pending Invoice';
      } else if (paymentStatus !== 'Settled') {
        overallStatus = 'Unpaid Dues';
      }

      return {
        ...trip,
        isLRComplete,
        hasPOD,
        podStatus,
        relatedProofs,
        relatedInvoice,
        invoiceStatus,
        matchingPayments,
        paymentStatus,
        overallStatus
      };
    });
  }, [trips, invoices, proofs, payments]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = enrichedTrips.length;
    const reconciled = enrichedTrips.filter(t => t.overallStatus === 'Reconciled').length;
    const missingPod = enrichedTrips.filter(t => t.podStatus === 'Missing').length;
    const pendingInvoice = enrichedTrips.filter(t => t.invoiceStatus === 'Ready to Invoice' || t.invoiceStatus === 'Not Generated').length;
    const unpaid = enrichedTrips.filter(t => t.paymentStatus === 'Unpaid' || t.paymentStatus === 'Partial').length;

    return { total, reconciled, missingPod, pendingInvoice, unpaid };
  }, [enrichedTrips]);

  // Filtering
  const filteredTrips = useMemo(() => {
    return enrichedTrips.filter(t => {
      const matchesSearch = !searchQuery || 
        (t.trip_id && t.trip_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.route && t.route.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.truck_number && t.truck_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.driver_name && t.driver_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'reconciled' && t.overallStatus === 'Reconciled') ||
        (filterStatus === 'missing_pod' && t.podStatus === 'Missing') ||
        (filterStatus === 'pending_invoice' && (t.invoiceStatus === 'Ready to Invoice' || t.invoiceStatus === 'Not Generated')) ||
        (filterStatus === 'unpaid' && (t.paymentStatus === 'Unpaid' || t.paymentStatus === 'Partial'));

      const matchesClient = filterClient === 'all' || t.client_id === filterClient;

      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [enrichedTrips, searchQuery, filterStatus, filterClient]);

  // Format date helper
  const formatDate = (dateVal) => {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '—';
    return format(d, 'dd MMM yyyy');
  };

  return (
    <>
      <Helmet>
        <title>Invoice Matching - Jai Bhavani Cargo</title>
      </Helmet>
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-heading font-extrabold tracking-tight text-foreground">Invoice Matching</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Audit the complete financial lifecycle chain: <strong>Trip → LR → POD → Invoice → Payment</strong>.
            </p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" className="h-9 gap-2 bg-card hover:border-primary/50 rounded-xl">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Reload Audit Dbs
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-card/50 border-border/40 shadow-sm rounded-2xl">
            <CardContent className="p-4">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Audited</span>
              <h3 className="text-2xl font-black text-foreground mt-1">{stats.total}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Total logs tracked</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/5 border-emerald-500/10 shadow-sm rounded-2xl">
            <CardContent className="p-4">
              <span className="text-[10px] uppercase font-bold text-emerald-500 dark:text-emerald-400 tracking-wider">Fully Reconciled</span>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.reconciled}</h3>
              <p className="text-[10px] text-emerald-500/70 mt-1">Payment chain complete</p>
            </CardContent>
          </Card>
          <Card className="bg-rose-500/5 border-rose-500/10 shadow-sm rounded-2xl">
            <CardContent className="p-4">
              <span className="text-[10px] uppercase font-bold text-rose-500 dark:text-rose-400 tracking-wider">Missing POD</span>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.missingPod}</h3>
              <p className="text-[10px] text-rose-500/70 mt-1">Needs proof upload</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/10 shadow-sm rounded-2xl">
            <CardContent className="p-4">
              <span className="text-[10px] uppercase font-bold text-amber-500 dark:text-amber-400 tracking-wider">Pending Invoice</span>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.pendingInvoice}</h3>
              <p className="text-[10px] text-amber-500/70 mt-1">Unbilled delivered trips</p>
            </CardContent>
          </Card>
          <Card className="bg-sky-500/5 border-sky-500/10 shadow-sm rounded-2xl">
            <CardContent className="p-4">
              <span className="text-[10px] uppercase font-bold text-sky-500 dark:text-sky-400 tracking-wider">Unpaid Balance</span>
              <h3 className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{stats.unpaid}</h3>
              <p className="text-[10px] text-sky-500/70 mt-1">Collections outstanding</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters Controls */}
        <Card className="shadow-soft border-border/50 bg-card rounded-2xl">
          <CardContent className="p-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by Trip ID (e.g. JBC-2026-00125), Route, Truck, or Driver..." 
                  className="pl-9 h-10 bg-background/50 border-border rounded-xl"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={clearSearch} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-background/30 px-3 py-1.5 rounded-xl border border-border/40 shrink-0">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Reconcile Status:</span>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Stages</option>
                    <option value="reconciled">Fully Reconciled</option>
                    <option value="missing_pod">Missing POD</option>
                    <option value="pending_invoice">Pending Invoice</option>
                    <option value="unpaid">Unpaid Collection</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-background/30 px-3 py-1.5 rounded-xl border border-border/40 shrink-0">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Client:</span>
                  <select 
                    value={filterClient} 
                    onChange={(e) => setFilterClient(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-foreground focus:outline-none cursor-pointer max-w-[150px]"
                  >
                    <option value="all">All Clients</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.client_name}</option>
                    ))}
                  </select>
                </div>

                <Button type="submit" className="h-10 rounded-xl px-5 shadow-sm font-bold w-full md:w-auto">
                  Audit Chain
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Dashboard Shipments Table */}
        <Card className="shadow-soft border-border/50 bg-card rounded-2xl overflow-hidden">
          <CardHeader className="py-4 px-6 border-b border-border/40 bg-secondary/5">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-extrabold">Audit Cockpit & Reconciliation Logs</CardTitle>
                <CardDescription className="text-xs mt-0.5">Overview of shipment lifecycle stages. Click a row to see full financial links.</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-background/80 border-border text-[11px] font-semibold px-2 py-0.5">
                {filteredTrips.length} results
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground text-sm">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <span>Loading reconciliation ledgers...</span>
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <FileBox className="w-12 h-12 opacity-30 mx-auto mb-3" />
                <p className="text-lg font-semibold text-foreground">No matches found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search for another Trip ID.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow className="hover:bg-transparent border-b-border/40">
                      <TableHead className="font-semibold text-xs">Trip ID</TableHead>
                      <TableHead className="font-semibold text-xs">Date</TableHead>
                      <TableHead className="font-semibold text-xs">Client & Route</TableHead>
                      <TableHead className="font-semibold text-xs">Asset/Driver</TableHead>
                      <TableHead className="text-center font-semibold text-xs w-[320px]">Financial Stage Pipeline</TableHead>
                      <TableHead className="text-right font-semibold text-xs">Net Amount</TableHead>
                      <TableHead className="text-center font-semibold text-xs">Reconciled</TableHead>
                      <TableHead className="text-center font-semibold text-xs pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrips.map(t => {
                      return (
                        <TableRow 
                          key={t.id} 
                          className="hover:bg-muted/20 border-b-border/30 group transition-all cursor-pointer"
                          onClick={() => {
                            setSelectedTrip(t);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          <TableCell className="font-mono font-bold text-sm text-primary">
                            {t.trip_id || '—'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground font-medium">
                            {formatDate(t.date)}
                          </TableCell>
                          <TableCell className="py-2.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-xs text-foreground">
                                {t.expand?.client_id?.client_name || 'Unassigned'}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5" /> {t.route || 'No Route'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-semibold text-foreground font-mono">{t.truck_number || '—'}</span>
                              <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{t.driver_name || '—'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-2.5" onClick={e => e.stopPropagation()}>
                            {/* Visual 5-Stage Stepper Badges */}
                            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-tight">
                              {/* 1. Trip */}
                              <div className="flex flex-col items-center gap-1 flex-1">
                                <Badge className={cn(
                                  "text-[9px] px-1.5 py-0.5 font-black uppercase rounded",
                                  t.trip_status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                  t.trip_status === 'Upcoming' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                )}>
                                  Trip
                                </Badge>
                                <span className="text-[8px] text-muted-foreground/60 mt-0.5">
                                  {t.trip_status || 'Upcoming'}
                                </span>
                              </div>
                              
                              <ChevronRight className="w-3 h-3 text-muted-foreground/30 shrink-0 mx-0.5" />

                              {/* 2. LR */}
                              <div className="flex flex-col items-center gap-1 flex-1">
                                <Badge className={cn(
                                  "text-[9px] px-1.5 py-0.5 font-black uppercase rounded",
                                  t.isLRComplete ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                )}>
                                  LR
                                </Badge>
                                <span className="text-[8px] text-muted-foreground/60 mt-0.5">
                                  {t.isLRComplete ? 'Confirmed' : 'Pending'}
                                </span>
                              </div>

                              <ChevronRight className="w-3 h-3 text-muted-foreground/30 shrink-0 mx-0.5" />

                              {/* 3. POD */}
                              <div className="flex flex-col items-center gap-1 flex-1">
                                <Badge className={cn(
                                  "text-[9px] px-1.5 py-0.5 font-black uppercase rounded",
                                  t.podStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  t.podStatus === 'Missing' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                  'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                )}>
                                  POD
                                </Badge>
                                <span className="text-[8px] text-muted-foreground/60 mt-0.5 truncate max-w-[55px]">
                                  {t.podStatus}
                                </span>
                              </div>

                              <ChevronRight className="w-3 h-3 text-muted-foreground/30 shrink-0 mx-0.5" />

                              {/* 4. Invoice */}
                              <div className="flex flex-col items-center gap-1 flex-1">
                                <Badge className={cn(
                                  "text-[9px] px-1.5 py-0.5 font-black uppercase rounded",
                                  t.invoiceStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  t.invoiceStatus === 'Ready to Invoice' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  t.invoiceStatus === 'Not Generated' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                )}>
                                  Invoice
                                </Badge>
                                <span className="text-[8px] text-muted-foreground/60 mt-0.5 truncate max-w-[55px]">
                                  {t.invoiceStatus === 'Paid' ? 'Paid' : t.invoiceStatus === 'Pending' ? 'Sent' : t.invoiceStatus}
                                </span>
                              </div>

                              <ChevronRight className="w-3 h-3 text-muted-foreground/30 shrink-0 mx-0.5" />

                              {/* 5. Payment */}
                              <div className="flex flex-col items-center gap-1 flex-1">
                                <Badge className={cn(
                                  "text-[9px] px-1.5 py-0.5 font-black uppercase rounded",
                                  t.paymentStatus === 'Settled' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  t.paymentStatus === 'Partial' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                )}>
                                  Payment
                                </Badge>
                                <span className="text-[8px] text-muted-foreground/60 mt-0.5">
                                  {t.paymentStatus}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs font-bold text-foreground">
                            {formatCurrency(t.revenue)}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={cn(
                              "inline-flex items-center justify-center w-5 h-5 rounded-full",
                              t.overallStatus === 'Reconciled' ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                            )}>
                              {t.overallStatus === 'Reconciled' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5 opacity-40" />}
                            </span>
                          </TableCell>
                          <TableCell className="text-center pr-6" onClick={e => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 text-xs font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-lg px-2"
                              onClick={() => {
                                setSelectedTrip(t);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              Inspect Chain
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reconciliation Audit Dialog */}
      <Dialog open={isDetailModalOpen} onOpenChange={(open) => !open && setIsDetailModalOpen(false)}>
        <DialogContent className="w-[95vw] max-w-3xl rounded-3xl p-6 overflow-y-auto max-h-[90vh] bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 font-heading text-xl text-foreground">
              <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                <Receipt className="w-5 h-5" />
              </div>
              Financial Chain Audit Ledger
            </DialogTitle>
            <DialogDescription className="pt-1.5 text-xs text-muted-foreground">
              Inspecting matching links across shipment database indexes for Trip ID: <span className="font-mono font-bold text-primary text-sm">{selectedTrip?.trip_id}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedTrip && (
            <div className="space-y-6 my-2 text-sm">
              
              {/* Stepper Chain Flow Graphic */}
              <div className="bg-secondary/10 border border-border/40 rounded-2xl p-5 shadow-inner">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
                  
                  {/* Stage 1: Trip */}
                  <div className="flex flex-col items-center text-center">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center border-2 font-bold transition-all shadow-sm",
                      selectedTrip.trip_status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse'
                    )}>
                      1
                    </div>
                    <span className="text-[10px] font-extrabold uppercase mt-1.5 text-foreground">Trip Details</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5">{selectedTrip.trip_status || 'Upcoming'}</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 hidden md:block" />

                  {/* Stage 2: LR */}
                  <div className="flex flex-col items-center text-center">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center border-2 font-bold transition-all shadow-sm",
                      selectedTrip.isLRComplete ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                    )}>
                      2
                    </div>
                    <span className="text-[10px] font-extrabold uppercase mt-1.5 text-foreground">LR Setup</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5">{selectedTrip.isLRComplete ? 'Rates Set' : 'Missing Rates'}</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 hidden md:block" />

                  {/* Stage 3: POD */}
                  <div className="flex flex-col items-center text-center">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center border-2 font-bold transition-all shadow-sm",
                      selectedTrip.podStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                      selectedTrip.podStatus === 'Missing' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' :
                      'bg-sky-500/10 text-sky-500 border-sky-500/30'
                    )}>
                      3
                    </div>
                    <span className="text-[10px] font-extrabold uppercase mt-1.5 text-foreground">POD Proof</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5">{selectedTrip.podStatus}</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 hidden md:block" />

                  {/* Stage 4: Invoice */}
                  <div className="flex flex-col items-center text-center">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center border-2 font-bold transition-all shadow-sm",
                      selectedTrip.invoiceStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                      selectedTrip.invoiceStatus === 'Ready to Invoice' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                      selectedTrip.invoiceStatus === 'Not Generated' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' :
                      'bg-blue-500/10 text-blue-500 border-blue-500/30'
                    )}>
                      4
                    </div>
                    <span className="text-[10px] font-extrabold uppercase mt-1.5 text-foreground">Invoice Request</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5">
                      {selectedTrip.relatedInvoice ? `INV-${selectedTrip.relatedInvoice.id.substring(0,8).toUpperCase()}` : selectedTrip.invoiceStatus}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 hidden md:block" />

                  {/* Stage 5: Payment */}
                  <div className="flex flex-col items-center text-center">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center border-2 font-bold transition-all shadow-sm",
                      selectedTrip.paymentStatus === 'Settled' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                      selectedTrip.paymentStatus === 'Partial' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                      'bg-rose-500/10 text-rose-500 border-rose-500/30'
                    )}>
                      5
                    </div>
                    <span className="text-[10px] font-extrabold uppercase mt-1.5 text-foreground">Collection Ledger</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5">{selectedTrip.paymentStatus}</span>
                  </div>

                </div>
              </div>

              {/* Connected Ledgers Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Trip & Asset Card */}
                <Card className="bg-card border-border/50 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="py-2.5 px-4 bg-muted/30 border-b border-border/40 flex flex-row items-center gap-2 shrink-0">
                    <Truck className="w-4 h-4 text-slate-400" />
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300">1. Trip & Asset Ledger</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                      <span className="text-muted-foreground">Vehicle Number:</span>
                      <strong className="text-foreground font-mono">{selectedTrip.truck_number || '—'}</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                      <span className="text-muted-foreground">Driver Assignment:</span>
                      <span className="font-semibold text-foreground">{selectedTrip.driver_name || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                      <span className="text-muted-foreground">Start / Dispatch Date:</span>
                      <span className="font-semibold text-foreground">{formatDate(selectedTrip.date)}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                      <span className="text-muted-foreground">Trip Route:</span>
                      <span className="font-bold text-foreground text-right max-w-[180px] truncate">{selectedTrip.route || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Asset Ownership:</span>
                      <span className="font-medium text-foreground">{selectedTrip.ownership_type || 'Owned'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. LR / Contract Dues Card */}
                <Card className="bg-card border-border/50 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="py-2.5 px-4 bg-muted/30 border-b border-border/40 flex flex-row items-center gap-2 shrink-0">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300">2. LR Contract Financials</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                      <span className="text-muted-foreground">Gross Freight Revenue:</span>
                      <strong className="text-emerald-500 font-bold">{formatCurrency(selectedTrip.revenue)}</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                      <span className="text-muted-foreground">Client Advance Received:</span>
                      <span className="font-semibold text-foreground">-{formatCurrency(selectedTrip.advance_received_from_client)}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                      <span className="text-muted-foreground">Driver Advance Paid:</span>
                      <span className="font-semibold text-foreground">-{formatCurrency(selectedTrip.advance_paid_to_driver)}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                      <span className="text-muted-foreground">TDS Receivable Deductions:</span>
                      <span className="font-semibold text-foreground">-{formatCurrency(selectedTrip.tds_deducted_receivable)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-foreground">
                      <span>Net Outstanding Balance:</span>
                      <span className="text-primary font-black">
                        {formatCurrency(Math.max(0, (Number(selectedTrip.revenue) || 0) - (Number(selectedTrip.advance_received_from_client) || 0) - (Number(selectedTrip.tds_deducted_receivable) || 0)))}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. POD Verification Card */}
                <Card className="bg-card border-border/50 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="py-2.5 px-4 bg-muted/30 border-b border-border/40 flex flex-row items-center gap-2 shrink-0">
                    <FileBox className="w-4 h-4 text-slate-400" />
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300">3. POD Proof of Delivery</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3.5 text-xs">
                    <div className="flex justify-between items-center border-b border-white/[0.02] pb-1.5">
                      <span className="text-muted-foreground">Proof Status:</span>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shadow-sm",
                        selectedTrip.podStatus === 'Approved' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                        selectedTrip.podStatus === 'Missing' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                        'bg-sky-500/15 text-sky-400 border-sky-500/30'
                      )}>
                        {selectedTrip.podStatus}
                      </span>
                    </div>
                    
                    {/* View POD Document files links */}
                    <div className="space-y-2">
                      <span className="text-muted-foreground block">Uploaded Proof Files:</span>
                      {selectedTrip.hasPOD ? (
                        <div className="flex flex-col gap-1.5">
                          {selectedTrip.pod_file && (
                            <a 
                              href={pb.files.getUrl(selectedTrip, selectedTrip.pod_file)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline text-xs flex items-center gap-1.5 font-semibold bg-primary/5 p-2 rounded-lg border border-primary/10 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Uploaded POD Document
                            </a>
                          )}
                          {selectedTrip.pod_link && (
                            <a 
                              href={selectedTrip.pod_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline text-xs flex items-center gap-1.5 font-semibold bg-primary/5 p-2 rounded-lg border border-primary/10 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View External POD Link
                            </a>
                          )}
                          {selectedTrip.relatedProofs.map(p => (
                            <a 
                              key={p.id}
                              href={pb.files.getUrl(p, p.files)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline text-xs flex items-center gap-1.5 font-semibold bg-primary/5 p-2 rounded-lg border border-primary/10 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> {p.document_type || 'POD Proof'} file ({p.reference_number || 'No Ref'})
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-rose-400 font-medium italic">
                          No delivery proof documents have been uploaded for this trip yet.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 4. GST Invoice Details Card */}
                <Card className="bg-card border-border/50 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="py-2.5 px-4 bg-muted/30 border-b border-border/40 flex flex-row items-center gap-2 shrink-0">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300">4. GST Invoice / Billing</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2 text-xs">
                    {selectedTrip.relatedInvoice ? (
                      <>
                        <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                          <span className="text-muted-foreground">Invoice Reference:</span>
                          <strong className="text-foreground font-mono">
                            INV-{selectedTrip.relatedInvoice.id.substring(0, 8).toUpperCase()}
                          </strong>
                        </div>
                        <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                          <span className="text-muted-foreground">Request Date:</span>
                          <span className="font-semibold text-foreground">{formatDate(selectedTrip.relatedInvoice.request_date)}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                          <span className="text-muted-foreground">Payment Due Date:</span>
                          <span className="font-semibold text-foreground">{formatDate(selectedTrip.relatedInvoice.due_date)}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                          <span className="text-muted-foreground">Invoiced Net Amount:</span>
                          <strong className="text-foreground">{formatCurrency(selectedTrip.relatedInvoice.amount)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Invoice Status:</span>
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                            selectedTrip.relatedInvoice.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-warning/15 text-warning border-warning/30'
                          )}>
                            {selectedTrip.relatedInvoice.status || 'Pending'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="py-2 text-center">
                        <p className="text-xs text-amber-500 font-semibold mb-2">No Invoice is generated for this trip yet.</p>
                        {selectedTrip.trip_status === 'Delivered' ? (
                          <p className="text-[11px] text-muted-foreground">
                            This trip has been delivered and is ready for billing. Go to <strong>Payment Requests</strong> tab to generate the GST invoice.
                          </p>
                        ) : (
                          <p className="text-[11px] text-muted-foreground">
                            Waiting for the truck to deliver cargo before generating an invoice.
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>

              {/* 5. Payments Ledger allocations list */}
              <Card className="bg-card border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="py-2.5 px-4 bg-muted/30 border-b border-border/40 flex flex-row items-center gap-2 shrink-0">
                  <Receipt className="w-4 h-4 text-slate-400" />
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300">5. Cashbook Collection Settlements</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {selectedTrip.matchingPayments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-muted/10">
                          <TableRow className="hover:bg-transparent border-b-border/30">
                            <TableHead className="text-[10px] uppercase font-bold py-2">Date</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold py-2">Transaction Description</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold py-2">Category</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold py-2 text-right">Settled Amount</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold py-2 text-center">State</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedTrip.matchingPayments.map(p => (
                            <TableRow key={p.id} className="hover:bg-muted/10 border-b-border/20">
                              <TableCell className="text-xs py-2 whitespace-nowrap font-mono">{formatDate(p.date)}</TableCell>
                              <TableCell className="text-xs py-2 font-medium max-w-[280px] truncate" title={p.description}>
                                {p.description}
                              </TableCell>
                              <TableCell className="text-[10px] font-semibold py-2 text-muted-foreground">{p.category || 'Trip Revenue'}</TableCell>
                              <TableCell className="text-xs py-2 text-right font-bold text-emerald-500">
                                {formatCurrency(p.amount)}
                              </TableCell>
                              <TableCell className="text-xs py-2 text-center">
                                <Badge className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-1 py-0 rounded">
                                  {p.status || 'Completed'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-rose-400 font-medium italic">
                      No cashbook payments or final bank settlement allocations found for this trip.
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          )}

          <DialogFooter className="mt-4">
            <Button onClick={() => setIsDetailModalOpen(false)} className="rounded-xl w-full shadow-sm font-bold">
              Close Audit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
