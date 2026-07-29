import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Building2, Truck, FileText, Download, Eye, Phone, MapPin, 
  CheckCircle2, Clock, AlertCircle, Search, RefreshCw, Filter, 
  Calendar, IndianRupee, ArrowUpRight, ShieldCheck, Sparkles, FileBox,
  Receipt, ArrowRight, UserCheck, Send, Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess.js';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';

export default function ClientPortalPage() {
  const { currentUser } = useAuth();
  const { isAdmin, isSuperAdmin } = useRoleBasedAccess();
  
  const [allClients, setAllClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientData, setClientData] = useState(null);
  const [tripLogs, setTripLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected POD Preview Modal
  const [selectedPodTrip, setSelectedPodTrip] = useState(null);
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);

  // Client Bidding State
  const [biddingModalOpen, setBiddingModalOpen] = useState(false);
  const [selectedLane, setSelectedLane] = useState(null);
  const [clientBidAmount, setClientBidAmount] = useState('');
  const [clientCargoWeight, setClientCargoWeight] = useState('18');
  const [activeLanes] = useState([
    { id: 'LANE-101', route: 'Hyderabad → Mumbai', origin: 'Hyderabad, TS', destination: 'Mumbai, MH', benchmark_rate: 48000, ai_rate: 49500, distance_km: 710, required_truck: '32 FT Container SXL' },
    { id: 'LANE-102', route: 'Bengaluru → Delhi NCR', origin: 'Bengaluru, KA', destination: 'Delhi NCR', benchmark_rate: 85000, ai_rate: 87200, distance_km: 1740, required_truck: '40 FT High Cube Trailer' },
    { id: 'LANE-103', route: 'Chennai → Kolkata', origin: 'Chennai, TN', destination: 'Kolkata, WB', benchmark_rate: 62000, ai_rate: 61500, distance_km: 1660, required_truck: '24 FT Open Body' },
    { id: 'LANE-104', route: 'Ahmedabad → Hyderabad', origin: 'Ahmedabad, GJ', destination: 'Hyderabad, TS', benchmark_rate: 54000, ai_rate: 55800, distance_km: 1210, required_truck: '32 FT Multi-Axle' }
  ]);

  const handleClientSubmitBid = async () => {
    if (!clientBidAmount || !selectedLane) return;
    try {
      await pb.collection('trip_logs').create({
        route: selectedLane.route,
        start_location: selectedLane.origin,
        end_location: selectedLane.destination,
        cargo_type: 'Client Dedicated Load',
        revenue: Number(clientBidAmount),
        trip_status: 'Bidding Open',
        notes: `Client Bid: ₹${clientBidAmount} for ${selectedLane.route} by ${clientData?.client_name || currentUser?.email}`
      }, { $autoCancel: false }).catch(() => null);

      toast.success(`Bid of ₹${Number(clientBidAmount).toLocaleString('en-IN')} submitted for ${selectedLane.route}! Admin will review your bid.`);
      setBiddingModalOpen(false);
      setClientBidAmount('');
    } catch (err) {
      console.error('Bid submission error:', err);
      toast.error('Could not submit bid');
    }
  };

  const fetchClientPortalData = async (targetClientId = null) => {
    setLoading(true);
    try {
      // 1. Fetch all clients list for fallback or admin switcher
      const clientsList = await pb.collection('clients').getFullList({ sort: 'client_name', $autoCancel: false }).catch(() => []);
      setAllClients(clientsList);

      let activeClient = null;

      const activeId = targetClientId || selectedClientId;
      if (activeId) {
        activeClient = clientsList.find(c => c.id === activeId);
      }

      if (!activeClient && currentUser?.client_id) {
        activeClient = clientsList.find(c => c.id === currentUser.client_id);
      }
      
      if (!activeClient && currentUser?.id) {
        activeClient = clientsList.find(c => c.portal_user_id === currentUser.id);
      }

      if (!activeClient && currentUser?.email) {
        const cleanEmail = (currentUser.email || '').toLowerCase().trim();
        activeClient = clientsList.find(c => (c.email || '').toLowerCase().trim() === cleanEmail);
      }

      if (!activeClient && currentUser?.name) {
        const cleanName = (currentUser.name || '').toLowerCase().trim();
        activeClient = clientsList.find(c => 
          (c.client_name || '').toLowerCase().includes(cleanName) || 
          (c.company_name || '').toLowerCase().includes(cleanName)
        );
      }

      // Default to first client if still null (e.g. Admin preview)
      if (!activeClient && clientsList.length > 0) {
        activeClient = clientsList[0];
      }

      setClientData(activeClient);
      if (activeClient) {
        setSelectedClientId(activeClient.id);
      }

      // 2. Fetch Trip Logs for this client
      if (activeClient) {
        // Fetch all trips for maximum reliability
        const allLogs = await pb.collection('trip_logs').getFullList({ sort: '-date', $autoCancel: false }).catch(() => []);

        // Filter trips belonging to this client (by client_id or client_name or company_name)
        const matched = allLogs.filter(t => {
          if (t.client_id && t.client_id === activeClient.id) return true;
          if (t.client_name && (t.client_name === activeClient.client_name || t.client_name === activeClient.company_name)) return true;
          if (t.client && (t.client === activeClient.client_name || t.client === activeClient.company_name)) return true;
          return false;
        });

        // If matched is empty but user is admin previewing, display allLogs as fallback so portal shows data
        setTripLogs(matched.length > 0 ? matched : (isAdmin || isSuperAdmin ? allLogs : []));
      } else {
        setTripLogs([]);
      }

    } catch (err) {
      console.error('[ClientPortalPage] Error loading portal data:', err);
      toast.error('Failed to load client portal dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientPortalData();
  }, [currentUser]);

  const handleClientSelectChange = (id) => {
    setSelectedClientId(id);
    fetchClientPortalData(id);
  };

  // Metrics Calculation
  const metrics = useMemo(() => {
    const upcomingTrips = tripLogs.filter(t => 
      t.trip_status === 'Upcoming' || t.trip_status === 'Scheduled' || t.trip_status === 'Pending'
    );
    const activeShipments = tripLogs.filter(t => 
      t.trip_status === 'Dispatched' || t.trip_status === 'In Transit' || t.trip_status === 'Active'
    );
    const completedTrips = tripLogs.filter(t => 
      t.trip_status === 'Delivered' || t.trip_status === 'Completed'
    );

    // Total Freight Billing
    const totalFreight = tripLogs.reduce((sum, t) => sum + (Number(t.revenue) || Number(t.freight_amount) || 0), 0);
    
    // Total Advance Paid by Client
    const totalAdvance = tripLogs.reduce((sum, t) => sum + (Number(t.advance_received_from_client) || 0), 0);

    // Net Payable Dues to Admin (Delivered & Completed Trips Only)
    const pendingDeliveredTrips = tripLogs.filter(t => {
      const isDelivered = t.trip_status === 'Delivered' || t.trip_status === 'Completed';
      const st = (t.client_payment_status || '').toLowerCase();
      return isDelivered && st !== 'received' && st !== 'paid';
    });

    const payableAmount = pendingDeliveredTrips.reduce((sum, t) => {
      const rev = Number(t.revenue) || Number(t.freight_amount) || 0;
      const adv = Number(t.advance_received_from_client) || 0;
      const toll = Number(t.toll_deduction) || 0;
      return sum + Math.max(0, rev - adv - toll);
    }, 0);

    const podsCount = completedTrips.filter(t => t.pod_url || t.pod_file || t.pod_link || t.pod_status === 'Uploaded' || t.pod_uploaded).length;

    return {
      upcomingTrips,
      activeShipments,
      completedTrips,
      upcomingCount: upcomingTrips.length,
      activeCount: activeShipments.length,
      completedCount: completedTrips.length,
      totalFreight,
      totalAdvance,
      payableAmount,
      podsCount
    };
  }, [tripLogs, clientData]);

  // Filtered Logs for Search
  const filteredLogs = useMemo(() => {
    return tripLogs.filter(t => {
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return (
        (t.trip_id && t.trip_id.toLowerCase().includes(q)) ||
        (t.truck_number && t.truck_number.toLowerCase().includes(q)) ||
        (t.route && t.route.toLowerCase().includes(q)) ||
        (t.driver_name && t.driver_name.toLowerCase().includes(q))
      );
    });
  }, [tripLogs, searchQuery]);

  const handleOpenPod = (trip) => {
    const podUrl = trip.pod_url || trip.pod_link || (trip.pod_file ? pb.files.getUrl(trip, trip.pod_file) : null);
    setSelectedPodTrip({ ...trip, podUrl });
    setIsPodModalOpen(true);
  };

  const handleExportCSV = () => {
    if (tripLogs.length === 0) {
      toast.error('No freight logs available to export');
      return;
    }

    const headers = ['Trip ID', 'Date', 'Vehicle No', 'Route', 'Driver', 'Trip Status', 'Total Freight (INR)', 'Advance Paid (INR)', 'Payment Status'];
    const rows = tripLogs.map(t => [
      t.trip_id || t.id,
      t.date ? format(new Date(t.date), 'yyyy-MM-dd') : (t.start_date ? format(new Date(t.start_date), 'yyyy-MM-dd') : ''),
      t.truck_number || '',
      `"${t.route || ''}"`,
      `"${t.driver_name || ''}"`,
      t.trip_status || '',
      t.revenue || t.freight_amount || 0,
      t.advance_received_from_client || 0,
      t.client_payment_status || 'Pending'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Freight_Statement_${clientData?.client_name || 'Client'}_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Freight log exported successfully');
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-12">
        <LoadingSpinner text="Loading client portal statement & shipments..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8"
    >
      <Helmet>
        <title>Client Portal | Jai Bhavani Cargo</title>
      </Helmet>

      {/* ── Client Portal Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 p-6 rounded-3xl bg-card border border-border/50 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 text-primary shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground tracking-tight">
                {clientData?.client_name || 'Corporate Client Portal'}
              </h1>
              {clientData?.company_name && (
                <Badge variant="outline" className="text-xs font-semibold">
                  {clientData.company_name}
                </Badge>
              )}
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold text-xs">
                Verified Portal Access
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-4 flex-wrap">
              {clientData?.gst_number && <span>GSTIN: <strong className="font-mono text-foreground">{clientData.gst_number}</strong></span>}
              {clientData?.phone && <span>Phone: <strong className="text-foreground">{clientData.phone}</strong></span>}
              <span>Contact: <strong className="text-foreground">{clientData?.contact_person || 'Logistics Manager'}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          {(isAdmin || isSuperAdmin) && allClients.length > 0 && (
            <div className="w-56">
              <Select value={selectedClientId} onValueChange={handleClientSelectChange}>
                <SelectTrigger className="bg-background text-xs font-semibold rounded-xl">
                  <SelectValue placeholder="Select Client Preview" />
                </SelectTrigger>
                <SelectContent>
                  {allClients.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.client_name} {c.company_name ? `(${c.company_name})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={() => fetchClientPortalData()} variant="outline" size="sm" className="rounded-xl bg-background">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={handleExportCSV} size="sm" className="rounded-xl bg-primary shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Export Statement CSV
          </Button>
        </div>
      </div>

      {/* ── Client KPI Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Payable Amount to Admin (Outstanding Dues) */}
        <Card className="bg-card border-rose-500/30 bg-rose-500/5 shadow-soft rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <IndianRupee className="w-20 h-20 text-rose-500" />
          </div>
          <CardContent className="p-5 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Payable Amount to Admin</span>
              <div className="p-2 bg-rose-500/15 rounded-xl text-rose-400">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-rose-400 font-heading">
              {formatCurrency(metrics.payableAmount)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">
              Net dues for delivered shipments to Jai Bhavani Cargo
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Trips */}
        <Card className="bg-card border-border/50 shadow-soft rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Upcoming Trips</span>
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-400 font-heading">
              {metrics.upcomingCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Scheduled dispatches loading soon
            </div>
          </CardContent>
        </Card>

        {/* Active In-Transit */}
        <Card className="bg-card border-border/50 shadow-soft rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active In-Transit</span>
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-blue-400 font-heading">
              {metrics.activeCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Currently moving on route
            </div>
          </CardContent>
        </Card>

        {/* Completed Trips */}
        <Card className="bg-card border-border/50 shadow-soft rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Completed Trips</span>
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-400 font-heading">
              {metrics.completedCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Successfully delivered shipments
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Freight Statement Tabs ──────────────────────────────────────── */}
      <Card className="border-border/50 shadow-soft bg-card rounded-2xl overflow-hidden">
        <Tabs defaultValue="completed" className="w-full">
          <CardHeader className="pb-0 border-b border-border/40 bg-secondary/10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="font-heading text-xl">Shipments & Freight Ledger</CardTitle>
                <CardDescription>Real-time active tracking, proof of delivery downloads, and freight statements.</CardDescription>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search trip, route, vehicle..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-xs rounded-xl bg-background"
                  />
                </div>

                <TabsList className="bg-background border border-border/50 p-1 rounded-xl flex-wrap">
                  <TabsTrigger value="upcoming" className="rounded-lg text-xs font-bold px-3 py-1.5">
                    Upcoming ({metrics.upcomingCount})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="rounded-lg text-xs font-bold px-3 py-1.5">
                    In-Transit ({metrics.activeCount})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-lg text-xs font-bold px-3 py-1.5">
                    Completed & PODs ({metrics.completedCount})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="rounded-lg text-xs font-bold px-3 py-1.5">
                    All Freight ({tripLogs.length})
                  </TabsTrigger>
                  <TabsTrigger value="bidding" className="rounded-lg text-xs font-bold px-3 py-1.5 border border-amber-500/30 text-amber-400">
                    <Send className="w-3 h-3 mr-1" /> Lane Bidding & Rates
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </CardHeader>

          {/* Tab 1: Upcoming Trips */}
          <TabsContent value="upcoming" className="p-0 m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6 font-semibold">Trip ID</TableHead>
                    <TableHead className="font-semibold">Scheduled Date</TableHead>
                    <TableHead className="font-semibold">Vehicle No.</TableHead>
                    <TableHead className="font-semibold">Route</TableHead>
                    <TableHead className="font-semibold">Driver</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                    <TableHead className="pr-6 text-right font-semibold">Estimated Freight (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.upcomingTrips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No upcoming scheduled trips at the moment.
                      </TableCell>
                    </TableRow>
                  ) : (
                    metrics.upcomingTrips.map(item => (
                      <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-6 font-mono font-bold text-sm text-amber-400">
                          {item.trip_id || item.id}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {item.date ? format(new Date(item.date), 'dd MMM yyyy') : '—'}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-sm">
                          {item.truck_number || '—'}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {item.route || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.driver_name || '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold text-xs">
                            {item.trip_status || 'Upcoming'}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right font-bold text-sm font-mono">
                          {formatCurrency(item.revenue || item.freight_amount || 0)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab 2: Active In-Transit */}
          <TabsContent value="active" className="p-0 m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6 font-semibold">Trip ID</TableHead>
                    <TableHead className="font-semibold">Dispatch Date</TableHead>
                    <TableHead className="font-semibold">Vehicle No.</TableHead>
                    <TableHead className="font-semibold">Route</TableHead>
                    <TableHead className="font-semibold">Driver Contact</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                    <TableHead className="pr-6 text-right font-semibold">Freight Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.activeShipments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No active in-transit shipments currently on route.
                      </TableCell>
                    </TableRow>
                  ) : (
                    metrics.activeShipments.map(item => (
                      <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-6 font-mono font-bold text-sm text-primary">
                          {item.trip_id || item.id}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {item.date ? format(new Date(item.date), 'dd MMM yyyy') : '—'}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-sm">
                          {item.truck_number || '—'}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {item.route || '—'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.driver_phone ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => window.open(`tel:${item.driver_phone}`)}
                              className="h-7 px-2 text-emerald-400 hover:text-emerald-300 font-bold"
                            >
                              <Phone className="w-3.5 h-3.5 mr-1" /> Call {item.driver_name ? `(${item.driver_name})` : ''}
                            </Button>
                          ) : (
                            item.driver_name || '—'
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold text-xs animate-pulse">
                            {item.trip_status || 'In-Transit'}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right font-bold text-sm font-mono">
                          {formatCurrency(item.revenue || item.freight_amount || 0)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab 3: Completed Trips & PODs */}
          <TabsContent value="completed" className="p-0 m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6 font-semibold">Trip ID</TableHead>
                    <TableHead className="font-semibold">Delivery Date</TableHead>
                    <TableHead className="font-semibold">Vehicle No.</TableHead>
                    <TableHead className="font-semibold">Route</TableHead>
                    <TableHead className="font-semibold text-center">POD Status</TableHead>
                    <TableHead className="font-semibold text-center">Payment Status</TableHead>
                    <TableHead className="pr-6 text-right font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.completedTrips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No completed delivered trips yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    metrics.completedTrips.map(item => {
                      const podUrl = item.pod_url || item.pod_link || (item.pod_file ? pb.files.getUrl(item, item.pod_file) : null);
                      const isPaid = (item.client_payment_status || '').toLowerCase() === 'received' || (item.client_payment_status || '').toLowerCase() === 'paid';
                      return (
                        <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="pl-6 font-mono font-bold text-sm text-primary">
                            {item.trip_id || item.id}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {item.date ? format(new Date(item.date), 'dd MMM yyyy') : '—'}
                          </TableCell>
                          <TableCell className="font-mono font-bold text-sm">
                            {item.truck_number || '—'}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {item.route || '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            {podUrl ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold text-xs">
                                POD Uploaded
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold text-xs">
                                Pending POD
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`font-bold text-xs ${
                              isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {isPaid ? 'Paid' : 'Unpaid / Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            {podUrl ? (
                              <Button
                                size="sm"
                                onClick={() => handleOpenPod(item)}
                                className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1.5" /> View POD
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Pending POD</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab 4: All Freight Logs Statement */}
          <TabsContent value="all" className="p-0 m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6 font-semibold">Trip ID</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Vehicle No.</TableHead>
                    <TableHead className="font-semibold">Route</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                    <TableHead className="font-semibold text-center">Payment Status</TableHead>
                    <TableHead className="font-semibold text-right">Advance Paid (₹)</TableHead>
                    <TableHead className="pr-6 text-right font-semibold">Total Freight (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        No freight statement logs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map(item => {
                      const isPaid = (item.client_payment_status || '').toLowerCase() === 'received' || (item.client_payment_status || '').toLowerCase() === 'paid';
                      return (
                        <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="pl-6 font-mono font-bold text-sm text-primary">
                            {item.trip_id || item.id}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {item.date ? format(new Date(item.date), 'dd MMM yyyy') : '—'}
                          </TableCell>
                          <TableCell className="font-mono font-bold text-sm">
                            {item.truck_number || '—'}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {item.route || '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`font-bold text-xs ${
                              item.trip_status === 'Delivered' || item.trip_status === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {item.trip_status || 'Scheduled'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`font-bold text-xs ${
                              isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {item.client_payment_status || 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-muted-foreground">
                            {formatCurrency(item.advance_received_from_client || 0)}
                          </TableCell>
                          <TableCell className="pr-6 text-right font-bold text-sm font-mono">
                            {formatCurrency(item.revenue || item.freight_amount || 0)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab 5: Route Lane Bidding for Clients */}
          <TabsContent value="bidding" className="p-5 m-0 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Send className="w-4 h-4 text-amber-400" /> Active Route Lanes Bidding Exchange
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submit custom freight bids directly for dedicated transport lanes.
                </p>
              </div>
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs font-mono">
                {activeLanes.length} Active Bidding Lanes
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeLanes.map((lane) => (
                <Card key={lane.id} className="bg-card border-border/60 rounded-2xl p-4 space-y-3 hover:border-amber-400/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-400/30 font-mono">
                        {lane.id}
                      </Badge>
                      <h4 className="text-base font-extrabold text-foreground mt-1">{lane.route}</h4>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{lane.distance_km} KM</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-xl font-mono">
                    <div>
                      <span className="text-[10px] text-muted-foreground">BENCHMARK RATE:</span>
                      <div className="font-bold text-foreground">₹{lane.benchmark_rate.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-400">AI RECOMMENDED:</span>
                      <div className="font-bold text-amber-400">₹{lane.ai_rate.toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-primary" /> {lane.required_truck}
                    </span>
                    <Button 
                      size="sm"
                      onClick={() => { setSelectedLane(lane); setClientBidAmount(lane.benchmark_rate.toString()); setBiddingModalOpen(true); }}
                      className="h-8 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl"
                    >
                      <Send className="w-3 h-3 mr-1" /> Bid For Lane
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* ── Client Bidding Modal ────────────────────────────────────────────── */}
      <Dialog open={biddingModalOpen} onOpenChange={setBiddingModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-amber-400">
              <Send className="w-5 h-5 text-amber-400" /> Submit Freight Bid for {selectedLane?.route}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submit your target price for this dedicated transport lane.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-muted/40 p-3 rounded-xl border border-border text-xs space-y-1 font-mono">
              <div>Target Benchmark: <strong className="text-foreground">₹{selectedLane?.benchmark_rate?.toLocaleString('en-IN')}</strong></div>
              <div>AI Market Estimate: <strong className="text-amber-400">₹{selectedLane?.ai_rate?.toLocaleString('en-IN')}</strong></div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Your Bid Amount (₹)</Label>
              <Input 
                type="number"
                value={clientBidAmount}
                onChange={(e) => setClientBidAmount(e.target.value)}
                className="bg-background border-border text-sm font-bold font-mono text-emerald-400 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Cargo Weight (Tons)</Label>
              <Input 
                type="number"
                value={clientCargoWeight}
                onChange={(e) => setClientCargoWeight(e.target.value)}
                className="bg-background border-border text-xs rounded-xl text-foreground"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBiddingModalOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button onClick={handleClientSubmitBid} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl">
              Submit Bid to Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── POD Preview Modal ────────────────────────────────────────────── */}
      {selectedPodTrip && (
        <Dialog open={isPodModalOpen} onOpenChange={setIsPodModalOpen}>
          <DialogContent className="sm:max-w-[650px] bg-card border-border shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-heading font-bold flex items-center gap-2">
                <FileBox className="w-5 h-5 text-violet-400" />
                Proof of Delivery (POD) - {selectedPodTrip.trip_id || selectedPodTrip.id}
              </DialogTitle>
              <DialogDescription>
                Vehicle: <strong className="text-foreground">{selectedPodTrip.truck_number}</strong> | Route: <strong className="text-foreground">{selectedPodTrip.route}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-border flex items-center justify-center relative">
                {selectedPodTrip.podUrl ? (
                  <img
                    src={selectedPodTrip.podUrl}
                    alt="Proof of Delivery"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">No image preview available</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => window.open(selectedPodTrip.podUrl, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2" /> Open Full Document
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedPodTrip.podUrl;
                    link.download = `POD_${selectedPodTrip.trip_id || selectedPodTrip.id}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('POD downloaded');
                  }}
                >
                  <Download className="w-4 h-4 mr-2" /> Download POD
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
