import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
  CreditCard, Wallet, Plus, Search, Truck, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Filter, CheckCircle2, 
  History, DollarSign, Route as RouteIcon, ShieldAlert, Sparkles 
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

export default function FASTagManagerPage() {
  const [trucks, setTrucks] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [truckFilter, setTruckFilter] = useState('all'); // 'all' | 'low' | 'healthy'
  
  const [selectedTruckForRecharge, setSelectedTruckForRecharge] = useState(null);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch trucks, fastag deductions (remote + local store), and fastag recharges in parallel
      const [trucksData, txData, rechargesData] = await Promise.all([
        pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false }),
        fetchAllFASTagDeductions(),
        pb.collection('fastag_recharges').getFullList({ sort: '-recharge_date', expand: 'truck_id', $autoCancel: false }).catch(() => [])
      ]);

      setTrucks(trucksData);
      setDeductions(txData);
      setRecharges(rechargesData);
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
                <CardDescription>Complete audit records of toll debits and account recharges.</CardDescription>
              </div>

              <TabsList className="bg-background border border-border/50 p-1 rounded-xl">
                <TabsTrigger value="deductions" className="rounded-lg text-xs font-bold px-4 py-1.5">
                  Toll Deduction Logs ({deductions.length})
                </TabsTrigger>
                <TabsTrigger value="recharges" className="rounded-lg text-xs font-bold px-4 py-1.5">
                  Recharge Logs ({recharges.length})
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>

          {/* Tab 1: Toll Deduction Logs */}
          <TabsContent value="deductions" className="p-0 m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6 font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Truck Number</TableHead>
                    <TableHead className="font-semibold">Trip ID / Details</TableHead>
                    <TableHead className="font-semibold text-center">Type</TableHead>
                    <TableHead className="text-right font-semibold">Toll Amount</TableHead>
                    <TableHead className="pr-6 font-semibold">Notes / Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deductions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No FASTag toll deduction logs recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    deductions.map(item => (
                      <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-6 whitespace-nowrap font-medium text-sm">
                          {item.date ? format(new Date(item.date), 'dd MMM yyyy, hh:mm a') : '—'}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-sm text-primary">
                          {item.truck_number || '—'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.trip_code ? (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">
                              {item.trip_code}
                            </Badge>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold text-[10px]">
                            {item.transaction_type || 'Debit'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-rose-500 text-sm">
                          -{formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell className="pr-6 text-xs text-muted-foreground max-w-xs truncate">
                          {item.notes || 'Automated toll charge'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab 2: Recharge Logs */}
          <TabsContent value="recharges" className="p-0 m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6 font-semibold">Recharge Date</TableHead>
                    <TableHead className="font-semibold">Truck Number</TableHead>
                    <TableHead className="font-semibold text-center">Payment Method</TableHead>
                    <TableHead className="font-semibold">Reference No.</TableHead>
                    <TableHead className="text-right font-semibold">Recharge Amount</TableHead>
                    <TableHead className="pr-6 font-semibold">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recharges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No FASTag recharge logs recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recharges.map(item => {
                      const truckNum = item.expand?.truck_id?.truck_number || item.truck_id || '—';
                      return (
                        <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="pl-6 whitespace-nowrap font-medium text-sm">
                            {item.recharge_date ? format(new Date(item.recharge_date), 'dd MMM yyyy') : '—'}
                          </TableCell>
                          <TableCell className="font-mono font-bold text-sm text-primary">
                            {truckNum}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold text-[10px]">
                              {item.payment_method || 'UPI'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {item.reference_number || '—'}
                          </TableCell>
                          <TableCell className="text-right font-bold text-emerald-500 text-sm">
                            +{formatCurrency(item.recharge_amount)}
                          </TableCell>
                          <TableCell className="pr-6 text-xs text-muted-foreground max-w-xs truncate">
                            {item.notes || 'Recharge completed'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
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
    </motion.div>
  );
}
