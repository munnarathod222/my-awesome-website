import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
  CreditCard, Wallet, Plus, Search, Truck, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Filter, CheckCircle2, 
  History, DollarSign, Route as RouteIcon, ShieldAlert, Sparkles, Mail 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import FASTagRechargeModal from '@/components/FASTagRechargeModal.jsx';
import RecordTollDeductionModal from '@/components/RecordTollDeductionModal.jsx';
import { fetchAllFASTagDeductions } from '@/lib/fastagDeductionUtils.js';
import SendMailDialog from '@/components/SendMailDialog.jsx';

import { useSearchParams } from 'react-router-dom';

export default function FASTagManagerPage() {
  const [searchParams] = useSearchParams();
  const [trucks, setTrucks] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [recharges, setRecharges] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logSearch, setLogSearch] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [truckFilter, setTruckFilter] = useState('all'); // 'all' | 'low' | 'healthy'

  useEffect(() => {
    const qParam = searchParams.get('truck') || searchParams.get('truck_number') || searchParams.get('truckId');
    if (qParam) {
      setSearchQuery(qParam);
    }
  }, [searchParams]);

  const [selectedTruckForRecharge, setSelectedTruckForRecharge] = useState(null);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);
  const [mailData, setMailData] = useState({ recipient: '', subject: '', body: '', html: '', label: '' });

  const triggerEmailFAStag = () => {
    const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
    const totalRecharge = recharges.reduce((a, b) => a + Number(b.recharge_amount || 0), 0);
    const totalToll = deductions.reduce((a, b) => a + Number(b.amount || 0), 0);
    const rows = deductions.slice(0, 10).map(d => `<tr><td style="padding:5px 0;font-size:12px;color:#64748b">${d.date || d.created?.substring(0,10) || '—'}</td><td style="padding:5px 0;font-size:12px;color:#1e293b">${d.truck_number || '—'}</td><td style="padding:5px 0;font-size:12px;color:#1e293b">${d.description || 'Toll'}</td><td style="padding:5px 0;font-weight:700;font-size:12px;color:#e11d48;text-align:right">${fmt(d.amount)}</td></tr>`).join('');
    const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden"><div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:20px 24px"><p style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:2px;margin:0 0 6px">JAI BHAVANI CARGO</p><h2 style="color:#f8fafc;font-size:20px;font-weight:800;margin:0">FASTag Statement</h2></div><div style="padding:20px 24px;background:#f8fafc"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px"><div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px"><p style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:1px;margin:0 0 4px">TOTAL RECHARGED</p><p style="color:#059669;font-size:20px;font-weight:800;margin:0">${fmt(totalRecharge)}</p></div><div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px"><p style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:1px;margin:0 0 4px">TOTAL TOLL PAID</p><p style="color:#e11d48;font-size:20px;font-weight:800;margin:0">${fmt(totalToll)}</p></div></div><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;padding-bottom:8px">DATE</th><th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;padding-bottom:8px">TRUCK</th><th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;padding-bottom:8px">DESCRIPTION</th><th style="text-align:right;font-size:10px;font-weight:700;color:#94a3b8;padding-bottom:8px">AMOUNT</th></tr></thead><tbody>${rows}</tbody></table>${deductions.length > 10 ? `<p style="font-size:11px;color:#94a3b8;margin-top:10px">+ ${deductions.length - 10} more records</p>` : ''}</div></div>`;
    setMailData({ recipient: '', subject: 'FASTag Statement – Jai Bhavani Cargo', body: 'Please find the FASTag statement below.', html, label: 'FASTag Statement' });
    setMailOpen(true);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [trucksData, txData, rechargesData, tripsData] = await Promise.all([
        pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false }),
        fetchAllFASTagDeductions(),
        pb.collection('fastag_recharges').getFullList({ sort: '-recharge_date', expand: 'truck_id', $autoCancel: false }).catch(() => []),
        pb.collection('trip_logs').getFullList({ 
          sort: '-date', 
          fields: 'id,trip_id,truck_number,route,date,trip_status',
          $autoCancel: false 
        }).catch(() => [])
      ]);

      setTrucks(trucksData);
      setDeductions(txData);
      setRecharges(rechargesData);
      setTrips(tripsData);
    } catch (err) {
      console.error('[FASTagManagerPage] Error fetching FASTag data:', err);
      toast.error('Failed to load FASTag data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalFleetBalance = trucks.reduce((sum, t) => sum + (Number(t.current_fastag_balance) || 0), 0);
    const lowBalanceTrucks = trucks.filter(t => (Number(t.current_fastag_balance) || 0) < 2000);
    const criticalBalanceTrucks = trucks.filter(t => (Number(t.current_fastag_balance) || 0) < 500);
    
    const totalDeductionsAmount = deductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const totalRechargesAmount = recharges.reduce((sum, r) => sum + (Number(r.recharge_amount) || 0), 0);

    return {
      totalFleetBalance,
      totalTrucks: trucks.length,
      lowBalanceCount: lowBalanceTrucks.length,
      criticalBalanceCount: criticalBalanceTrucks.length,
      totalDeductionsAmount,
      totalRechargesAmount
    };
  }, [trucks, deductions, recharges]);

  // Filtered Truck Boxes
  const filteredTrucks = useMemo(() => {
    return trucks.filter(t => {
      const bal = Number(t.current_fastag_balance) || 0;
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || 
        (t.truck_number && t.truck_number.toLowerCase().includes(query)) ||
        (t.fastag_id && t.fastag_id.toLowerCase().includes(query));

      if (!matchesSearch) return false;
      if (truckFilter === 'low') return bal < 2000;
      if (truckFilter === 'healthy') return bal >= 2000;
      return true;
    });
  }, [trucks, searchQuery, truckFilter]);

  const handleOpenRecharge = (truck) => {
    setSelectedTruckForRecharge(truck);
    setIsRechargeModalOpen(true);
  };

  // Build trip lookup map keyed by trip_id and id for fast enrichment
  const tripMap = useMemo(() => {
    const map = {};
    trips.forEach(t => {
      if (t.trip_id) map[t.trip_id] = t;
      if (t.id) map[t.id] = t;
    });
    return map;
  }, [trips]);

  // Build truck lookup map keyed by truck_number and id
  const truckMap = useMemo(() => {
    const map = {};
    trucks.forEach(t => {
      if (t.truck_number) map[t.truck_number.toUpperCase()] = t;
      if (t.id) map[t.id] = t;
    });
    return map;
  }, [trucks]);

  const filteredDeductions = useMemo(() => {
    const q = logSearch.toLowerCase().trim();
    if (!q) return deductions;
    return deductions.filter(d => {
      const trip = d.trip_code ? (tripMap[d.trip_code] || {}) : {};
      return (
        (d.truck_number && d.truck_number.toLowerCase().includes(q)) ||
        (d.trip_code && d.trip_code.toLowerCase().includes(q)) ||
        (d.notes && d.notes.toLowerCase().includes(q)) ||
        (d.toll_plaza && d.toll_plaza.toLowerCase().includes(q)) ||
        (trip.route && trip.route.toLowerCase().includes(q))
      );
    });
  }, [deductions, logSearch, tripMap]);

  const filteredRecharges = useMemo(() => {
    const q = logSearch.toLowerCase().trim();
    if (!q) return recharges;
    return recharges.filter(r => {
      const truckNum = r.expand?.truck_id?.truck_number || r.truck_id || '';
      return (
        truckNum.toLowerCase().includes(q) ||
        (r.reference_number && r.reference_number.toLowerCase().includes(q)) ||
        (r.payment_method && r.payment_method.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q))
      );
    });
  }, [recharges, logSearch]);


  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-12">
        <LoadingSpinner text="Loading FASTag balance cards & logs..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8"
    >
      <Helmet>
        <title>FASTag Management | Jai Bhavani Cargo</title>
      </Helmet>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-sm">
              <CreditCard className="w-7 h-7 text-blue-500" />
            </div>
            FASTag Management
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Monitor truck FASTag wallet balances, automated toll deduction logs, and recharge records.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Button 
            onClick={fetchData} 
            variant="outline" 
            className="bg-card shadow-sm rounded-xl hover:border-primary/50"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          {trucks.length > 0 && (
            <>
              <Button 
                onClick={triggerEmailFAStag}
                variant="outline"
                className="rounded-xl shadow-sm text-blue-400 border-blue-500/30 hover:bg-blue-500/10 font-bold"
              >
                <Mail className="w-4 h-4 mr-1.5" /> Email Statement
              </Button>
              <Button 
                onClick={() => setIsDeductionModalOpen(true)} 
                variant="outline"
                className="rounded-xl shadow-sm border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-bold"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Record Toll Deduction
              </Button>
              <Button 
                onClick={() => handleOpenRecharge(trucks[0])} 
                className="rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Record FASTag Recharge
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Overview Summary Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Wallet Balance */}
        <Card className="bg-card border-border/50 shadow-soft rounded-2xl relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fleet FASTag Balance</span>
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground font-heading">
              {formatCurrency(metrics.totalFleetBalance)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">
              Across {metrics.totalTrucks} fleet trucks
            </div>
          </CardContent>
        </Card>

        {/* Low Balance Alert */}
        <Card className="bg-card border-border/50 shadow-soft rounded-2xl relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Low Balance Trucks</span>
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-500 font-heading">
              {metrics.lowBalanceCount} Trucks
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">
              {metrics.criticalBalanceCount} critical (&lt; ₹500)
            </div>
          </CardContent>
        </Card>

        {/* Total Toll Deductions */}
        <Card className="bg-card border-border/50 shadow-soft rounded-2xl relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Toll Deductions</span>
              <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-500 font-heading">
              {formatCurrency(metrics.totalDeductionsAmount)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">
              {deductions.length} recorded toll debits
            </div>
          </CardContent>
        </Card>

        {/* Total Recharges */}
        <Card className="bg-card border-border/50 shadow-soft rounded-2xl relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Recharges</span>
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-500 font-heading">
              {formatCurrency(metrics.totalRechargesAmount)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">
              {recharges.length} recharge entries
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Fleet FASTag Balance Boxes Section ──────────────────────────── */}
      <Card className="border-border/50 shadow-soft bg-card rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-border/40 bg-secondary/10">
          <div>
            <CardTitle className="font-heading text-xl flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-500" />
              Fleet Truck FASTag Wallet Cards
            </CardTitle>
            <CardDescription>Live FASTag balance status per truck with instant recharge action.</CardDescription>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search truck no..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs rounded-xl bg-background"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-background p-1 rounded-xl border border-border/50">
              <button
                onClick={() => setTruckFilter('all')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  truckFilter === 'all' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({trucks.length})
              </button>
              <button
                onClick={() => setTruckFilter('low')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  truckFilter === 'low' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Low ({metrics.lowBalanceCount})
              </button>
              <button
                onClick={() => setTruckFilter('healthy')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  truckFilter === 'healthy' ? 'bg-emerald-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Healthy
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {filteredTrucks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="w-12 h-12 opacity-30 mx-auto mb-3" />
              <p className="text-base font-semibold">No trucks found matching filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTrucks.map(truck => {
                const bal = Number(truck.current_fastag_balance) || 0;
                const isCritical = bal < 500;
                const isLow = bal >= 500 && bal < 2000;

                let badgeClass = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
                let badgeLabel = "Healthy";
                if (isCritical) {
                  badgeClass = "bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse";
                  badgeLabel = "Critical (< ₹500)";
                } else if (isLow) {
                  badgeClass = "bg-amber-500/15 text-amber-400 border-amber-500/30";
                  badgeLabel = "Low Balance";
                }

                return (
                  <div
                    key={truck.id}
                    className="p-5 rounded-2xl bg-card border border-border/60 hover:border-blue-500/40 transition-all shadow-md hover:shadow-lg flex flex-col justify-between space-y-4 group"
                  >
                    {/* Truck Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20 group-hover:scale-105 transition-transform">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-mono font-black text-base text-foreground tracking-wide">
                            {truck.truck_number}
                          </div>
                          {truck.fastag_id && (
                            <div className="text-[10px] text-muted-foreground font-mono">
                              ID: {truck.fastag_id}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${badgeClass}`}>
                        {badgeLabel}
                      </Badge>
                    </div>

                    {/* Balance Display */}
                    <div className="py-2 border-t border-b border-border/40">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                        FASTag Balance
                      </span>
                      <div className={`text-2xl font-black font-heading tracking-tight ${
                        isCritical ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-emerald-400'
                      }`}>
                        {formatCurrency(bal)}
                      </div>
                    </div>

                    {/* Quick Action Button */}
                    <Button
                      onClick={() => handleOpenRecharge(truck)}
                      size="sm"
                      className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Recharge FASTag
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── FASTag Logs Tabs (Deduction Logs & Recharge Logs) ────────────── */}
      <Card className="border-border/50 shadow-soft bg-card rounded-2xl overflow-hidden">
        <Tabs defaultValue="deductions" className="w-full">
          <CardHeader className="pb-0 border-b border-border/40 bg-secondary/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="font-heading text-xl flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  FASTag Transaction & Recharge Logs
                </CardTitle>
                <CardDescription>Complete audit records of trip toll debits and account recharges.</CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                {/* Search across logs */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search truck, trip, toll plaza..."
                    value={logSearch}
                    onChange={e => setLogSearch(e.target.value)}
                    className="pl-8 h-9 text-xs rounded-xl bg-background w-full sm:w-56"
                  />
                </div>

                <TabsList className="bg-background border border-border/50 p-1 rounded-xl">
                  <TabsTrigger value="deductions" className="rounded-lg text-xs font-bold px-4 py-1.5">
                    <ArrowDownRight className="w-3 h-3 mr-1 text-rose-500" />
                    Toll Deductions ({filteredDeductions.length})
                  </TabsTrigger>
                  <TabsTrigger value="recharges" className="rounded-lg text-xs font-bold px-4 py-1.5">
                    <ArrowUpRight className="w-3 h-3 mr-1 text-emerald-500" />
                    Recharge Logs ({filteredRecharges.length})
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </CardHeader>

          {/* Tab 1: Toll Deduction Logs — enriched with Trip details */}
          <TabsContent value="deductions" className="p-0 m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6 font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Truck No.</TableHead>
                    <TableHead className="font-semibold">Trip ID</TableHead>
                    <TableHead className="font-semibold">Route</TableHead>
                    <TableHead className="font-semibold">Toll Plaza</TableHead>
                    <TableHead className="font-semibold text-center">Source</TableHead>
                    <TableHead className="text-right font-semibold">Deducted</TableHead>
                    <TableHead className="pr-6 font-semibold">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeductions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                        <RouteIcon className="w-10 h-10 opacity-25 mx-auto mb-3" />
                        <p className="font-semibold text-sm">No toll deduction logs found.</p>
                        <p className="text-xs mt-1 opacity-70">Deductions are auto-logged when a trip is marked Delivered or Completed.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDeductions.map(item => {
                      // Enrich with linked trip data
                      const linkedTrip = item.trip_code ? (tripMap[item.trip_code] || null) : null;
                      const isAutoTripDeduction = !!linkedTrip;
                      const displayTripId = linkedTrip?.trip_id || item.trip_code || null;
                      const displayRoute = linkedTrip?.route || item.route || null;
                      const tollPlaza = item.toll_plaza || null;

                      let dateStr = '—';
                      try {
                        if (item.date) {
                          const d = new Date(item.date.replace(' ', 'T'));
                          dateStr = format(d, 'dd MMM yyyy, hh:mm a');
                        }
                      } catch {}

                      return (
                        <TableRow key={item.id} className={`hover:bg-muted/20 transition-colors border-b border-border/30 ${isAutoTripDeduction ? 'bg-blue-500/2' : ''}`}>
                          <TableCell className="pl-6 whitespace-nowrap font-medium text-sm">
                            {dateStr}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono font-black text-sm text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                              {item.truck_number || '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {displayTripId ? (
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-bold font-mono text-[11px] px-2 py-0.5">
                                  {displayTripId}
                                </Badge>
                                {linkedTrip?.trip_status && (
                                  <Badge variant="outline" className={`text-[9px] font-bold px-1.5 py-0 ${
                                    linkedTrip.trip_status === 'Delivered' || linkedTrip.trip_status === 'Completed'
                                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                  }`}>
                                    {linkedTrip.trip_status}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Manual Entry</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {displayRoute ? (
                              <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                                <RouteIcon className="w-3 h-3 text-muted-foreground shrink-0" />
                                {displayRoute}
                              </span>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell>
                            {tollPlaza ? (
                              <span className="text-xs font-medium text-foreground">{tollPlaza}</span>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-center">
                            {isAutoTripDeduction ? (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold text-[9px] px-2">
                                Auto Trip
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold text-[9px] px-2">
                                Manual
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-black text-rose-500 text-sm tabular-nums">
                              -{formatCurrency(item.amount)}
                            </span>
                          </TableCell>
                          <TableCell className="pr-6 text-xs text-muted-foreground max-w-[200px] truncate">
                            {item.notes || 'Automated toll charge'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Summary Footer */}
            {filteredDeductions.length > 0 && (
              <div className="bg-muted/30 border-t border-border/40 px-6 py-3 flex flex-wrap justify-between items-center gap-3 text-xs">
                <span className="text-muted-foreground">
                  {filteredDeductions.length} deduction{filteredDeductions.length !== 1 ? 's' : ''} shown
                  {' · '}<strong>{filteredDeductions.filter(d => !!d.trip_code).length}</strong> linked to trips
                  {' · '}<strong>{filteredDeductions.filter(d => !d.trip_code).length}</strong> manual entries
                </span>
                <span className="font-bold text-rose-500 tabular-nums text-sm">
                  Total: -{formatCurrency(filteredDeductions.reduce((s, d) => s + (Number(d.amount) || 0), 0))}
                </span>
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Recharge Logs */}
          <TabsContent value="recharges" className="p-0 m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6 font-semibold">Recharge Date</TableHead>
                    <TableHead className="font-semibold">Truck</TableHead>
                    <TableHead className="font-semibold text-center">Payment Method</TableHead>
                    <TableHead className="font-semibold">Reference / UTR No.</TableHead>
                    <TableHead className="text-right font-semibold">Amount Recharged</TableHead>
                    <TableHead className="pr-6 font-semibold">Notes / Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecharges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                        <Wallet className="w-10 h-10 opacity-25 mx-auto mb-3" />
                        <p className="font-semibold text-sm">No recharge logs found.</p>
                        <p className="text-xs mt-1 opacity-70">Use the "Record FASTag Recharge" button to log a wallet top-up.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecharges.map(item => {
                      const truckData = item.expand?.truck_id || truckMap[String(item.truck_id || '').toUpperCase()] || null;
                      const truckNum = truckData?.truck_number || item.truck_id || '—';
                      const truckName = truckData?.truck_name || truckData?.model || null;

                      let dateStr = '—';
                      try {
                        if (item.recharge_date) dateStr = format(new Date(item.recharge_date), 'dd MMM yyyy');
                      } catch {}

                      const methodColorMap = {
                        'UPI': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                        'NEFT': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                        'IMPS': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                        'Cash': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                        'Cheque': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                        'Credit Card': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                        'Debit Card': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
                      };
                      const methodClass = methodColorMap[item.payment_method] || 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

                      return (
                        <TableRow key={item.id} className="hover:bg-muted/20 transition-colors border-b border-border/30">
                          <TableCell className="pl-6 whitespace-nowrap font-semibold text-sm">
                            {dateStr}
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-mono font-black text-sm text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                                {truckNum}
                              </span>
                              {truckName && (
                                <div className="text-[10px] text-muted-foreground mt-0.5">{truckName}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`font-bold text-[10px] px-2 py-0.5 ${methodClass}`}>
                              {item.payment_method || 'UPI'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.reference_number ? (
                              <span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded-lg border border-border/50 text-foreground font-semibold">
                                {item.reference_number}
                              </span>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-black text-emerald-500 text-sm tabular-nums">
                              +{formatCurrency(item.recharge_amount)}
                            </span>
                          </TableCell>
                          <TableCell className="pr-6 text-xs text-muted-foreground max-w-[200px] truncate">
                            {item.notes || 'FASTag wallet recharge'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Summary Footer */}
            {filteredRecharges.length > 0 && (
              <div className="bg-muted/30 border-t border-border/40 px-6 py-3 flex flex-wrap justify-between items-center gap-3 text-xs">
                <span className="text-muted-foreground">
                  {filteredRecharges.length} recharge{filteredRecharges.length !== 1 ? 's' : ''} shown
                </span>
                <span className="font-bold text-emerald-500 tabular-nums text-sm">
                  Total: +{formatCurrency(filteredRecharges.reduce((s, r) => s + (Number(r.recharge_amount) || 0), 0))}
                </span>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>


      {/* ── FASTag Modals ───────────────────────────────────────── */}
      {selectedTruckForRecharge && (
        <FASTagRechargeModal
          isOpen={isRechargeModalOpen}
          onClose={() => {
            setIsRechargeModalOpen(false);
            setSelectedTruckForRecharge(null);
          }}
          truck={selectedTruckForRecharge}
          onSuccess={fetchData}
        />
      )}

      <RecordTollDeductionModal
        isOpen={isDeductionModalOpen}
        onClose={() => setIsDeductionModalOpen(false)}
        trucks={trucks}
        onSuccess={fetchData}
      />
      <SendMailDialog
        isOpen={mailOpen}
        onOpenChange={setMailOpen}
        defaultRecipient={mailData.recipient}
        defaultSubject={mailData.subject}
        defaultBody={mailData.body}
        richHtmlContent={mailData.html}
        contextLabel={mailData.label}
      />
    </motion.div>
  );
}
