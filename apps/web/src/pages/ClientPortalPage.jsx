import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Building2, Truck, FileText, Download, Eye, Phone, MapPin, 
  CheckCircle2, Clock, AlertCircle, Search, RefreshCw, Filter, 
  Calendar, DollarSign, ArrowUpRight, ShieldCheck, Sparkles, FileBox
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';

export default function ClientPortalPage() {
  const { currentUser } = useAuth();
  const [clientData, setClientData] = useState(null);
  const [tripLogs, setTripLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected POD Preview Modal
  const [selectedPodTrip, setSelectedPodTrip] = useState(null);
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);

  const fetchClientPortalData = async () => {
    setLoading(true);
    try {
      let activeClient = null;

      // 1. Identify Client Record
      if (currentUser?.client_id) {
        activeClient = await pb.collection('clients').getOne(currentUser.client_id, { $autoCancel: false }).catch(() => null);
      }
      
      if (!activeClient && currentUser?.name) {
        // Fallback search by client name
        activeClient = await pb.collection('clients').getFirstListItem(`client_name ~ "${currentUser.name}"`, { $autoCancel: false }).catch(() => null);
      }

      // If still no specific client linked, load first active client as fallback for admin preview
      if (!activeClient) {
        const firstClient = await pb.collection('clients').getFirstListItem('status="Active"', { $autoCancel: false }).catch(() => null);
        activeClient = firstClient;
      }

      setClientData(activeClient);

      // 2. Fetch Trip Logs for this client
      let logsFilter = '';
      if (activeClient) {
        logsFilter = `client_name = "${activeClient.client_name}" || client = "${activeClient.client_name}" || client_id = "${activeClient.id}"`;
      }

      const logs = await pb.collection('trip_logs').getFullList({
        filter: logsFilter,
        sort: '-start_date',
        $autoCancel: false
      }).catch(() => []);

      setTripLogs(logs);

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

  // Metrics
  const metrics = useMemo(() => {
    const activeShipments = tripLogs.filter(t => t.trip_status !== 'Delivered' && t.trip_status !== 'Completed' && t.trip_status !== 'Cancelled');
    const deliveredShipments = tripLogs.filter(t => t.trip_status === 'Delivered' || t.trip_status === 'Completed');
    const totalFreight = tripLogs.reduce((sum, t) => sum + (Number(t.freight_amount) || 0), 0);
    const podsCount = deliveredShipments.filter(t => t.pod_url || t.pod_file || t.pod_uploaded).length;

    return {
      activeCount: activeShipments.length,
      deliveredCount: deliveredShipments.length,
      totalFreight,
      podsCount,
      activeShipments,
      deliveredShipments
    };
  }, [tripLogs]);

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
    setSelectedPodTrip(trip);
    setIsPodModalOpen(true);
  };

  const handleExportCSV = () => {
    if (tripLogs.length === 0) {
      toast.error('No freight logs available to export');
      return;
    }

    const headers = ['Trip ID', 'Date', 'Vehicle No', 'Route', 'Driver', 'Status', 'Freight (INR)', 'Payment Status'];
    const rows = tripLogs.map(t => [
      t.trip_id || t.id,
      t.start_date ? format(new Date(t.start_date), 'yyyy-MM-dd') : '',
      t.truck_number || '',
      `"${t.route || ''}"`,
      `"${t.driver_name || ''}"`,
      t.trip_status || '',
      t.freight_amount || 0,
      t.payment_status || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Freight_Logs_${clientData?.client_name || 'Client'}_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Freight log exported successfully');
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-12">
        <LoadingSpinner text="Loading client portal dashboard..." />
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 p-6 rounded-3xl bg-card border border-border/50 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 text-primary shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground tracking-tight">
                {clientData?.client_name || 'Corporate Client Portal'}
              </h1>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold text-xs">
                Verified Portal Access
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-3">
              {clientData?.gstin && <span>GSTIN: <strong className="font-mono text-foreground">{clientData.gstin}</strong></span>}
              <span>Contact: <strong className="text-foreground">{clientData?.contact_person || 'Logistics Desk'}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button onClick={fetchClientPortalData} variant="outline" size="sm" className="rounded-xl bg-background">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={handleExportCSV} size="sm" className="rounded-xl bg-primary shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Download Freight Log CSV
          </Button>
        </div>
      </div>

      {/* ── Client Metrics Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Shipments */}
        <Card className="bg-card border-border/50 shadow-soft rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Shipments</span>
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-blue-400 font-heading">
              {metrics.activeCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Currently in-transit on highway routes
            </div>
          </CardContent>
        </Card>

        {/* Delivered Shipments */}
        <Card className="bg-card border-border/50 shadow-soft rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivered Shipments</span>
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-400 font-heading">
              {metrics.deliveredCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Completed dispatches
            </div>
          </CardContent>
        </Card>

        {/* POD Documents Available */}
        <Card className="bg-card border-border/50 shadow-soft rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">POD Documents</span>
              <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400">
                <FileBox className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-violet-400 font-heading">
              {metrics.podsCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Ready for instant download
            </div>
          </CardContent>
        </Card>

        {/* Total Freight Ledger */}
        <Card className="bg-card border-border/50 shadow-soft rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Freight Billing</span>
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-400 font-heading">
              {formatCurrency(metrics.totalFreight)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Across all dispatches
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Client Portal Main Tabs ──────────────────────────────────────── */}
      <Card className="border-border/50 shadow-soft bg-card rounded-2xl overflow-hidden">
        <Tabs defaultValue="active" className="w-full">
          <CardHeader className="pb-0 border-b border-border/40 bg-secondary/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="font-heading text-xl">Shipment & Freight Portal</CardTitle>
                <CardDescription>Real-time active tracking, proof of delivery downloads, and freight statements.</CardDescription>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search trip..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-xs rounded-xl bg-background"
                  />
                </div>

                <TabsList className="bg-background border border-border/50 p-1 rounded-xl">
                  <TabsTrigger value="active" className="rounded-lg text-xs font-bold px-3 py-1.5">
                    Active ({metrics.activeCount})
                  </TabsTrigger>
                  <TabsTrigger value="pods" className="rounded-lg text-xs font-bold px-3 py-1.5">
                    POD Downloads ({metrics.podsCount})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="rounded-lg text-xs font-bold px-3 py-1.5">
                    All Freight Logs ({tripLogs.length})
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </CardHeader>

          {/* Tab 1: Active Shipments Tracking */}
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
                    <TableHead className="pr-6 text-right font-semibold">Freight (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.activeShipments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No active in-transit shipments at the moment.
                      </TableCell>
                    </TableRow>
                  ) : (
                    metrics.activeShipments.map(item => (
                      <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-6 font-mono font-bold text-sm text-primary">
                          {item.trip_id || item.id}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {item.start_date ? format(new Date(item.start_date), 'dd MMM yyyy') : '—'}
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
                          {formatCurrency(item.freight_amount || 0)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab 2: POD Downloads */}
          <TabsContent value="pods" className="p-0 m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6 font-semibold">Trip ID</TableHead>
                    <TableHead className="font-semibold">Delivery Date</TableHead>
                    <TableHead className="font-semibold">Vehicle No.</TableHead>
                    <TableHead className="font-semibold">Route</TableHead>
                    <TableHead className="font-semibold text-center">POD Status</TableHead>
                    <TableHead className="pr-6 text-right font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.deliveredShipments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No delivered shipments yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    metrics.deliveredShipments.map(item => {
                      const podUrl = item.pod_url || (item.pod_file ? pb.files.getUrl(item, item.pod_file) : null);
                      return (
                        <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="pl-6 font-mono font-bold text-sm text-primary">
                            {item.trip_id || item.id}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {item.delivery_date ? format(new Date(item.delivery_date), 'dd MMM yyyy') : (item.updated ? format(new Date(item.updated), 'dd MMM yyyy') : '—')}
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
                                Pending POD Upload
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            {podUrl ? (
                              <Button
                                size="sm"
                                onClick={() => handleOpenPod({ ...item, podUrl })}
                                className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1.5" /> View / Download POD
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Unavailable</span>
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

          {/* Tab 3: All Freight Logs */}
          <TabsContent value="all" className="p-0 m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6 font-semibold">Trip ID</TableHead>
                    <TableHead className="font-semibold">Dispatch Date</TableHead>
                    <TableHead className="font-semibold">Vehicle No.</TableHead>
                    <TableHead className="font-semibold">Route</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                    <TableHead className="font-semibold text-center">Payment</TableHead>
                    <TableHead className="pr-6 text-right font-semibold">Freight (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No freight logs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map(item => (
                      <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-6 font-mono font-bold text-sm text-primary">
                          {item.trip_id || item.id}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {item.start_date ? format(new Date(item.start_date), 'dd MMM yyyy') : '—'}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-sm">
                          {item.truck_number || '—'}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {item.route || '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`font-bold text-xs ${
                            item.trip_status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {item.trip_status || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`font-bold text-xs ${
                            item.payment_status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {item.payment_status || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right font-bold text-sm font-mono">
                          {formatCurrency(item.freight_amount || 0)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

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
                  <Eye className="w-4 h-4 mr-2" /> Open Full Image
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
                  <Download className="w-4 h-4 mr-2" /> Download POD Image
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
