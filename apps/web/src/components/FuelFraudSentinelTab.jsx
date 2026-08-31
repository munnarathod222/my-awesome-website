import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShieldAlert, AlertTriangle, Fuel, Search, Filter, 
  Wrench, Scale, Clock, User, CheckCircle2, DollarSign, 
  ArrowRight, Download, RefreshCw, Eye, ShieldCheck, PieChart
} from 'lucide-react';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import FuelInvestigationModal from './FuelInvestigationModal.jsx';

export default function FuelFraudSentinelTab({ 
  fuelLogs = [], 
  trucks = {}, 
  loading = false, 
  onRefresh 
}) {
  const [searchTruck, setSearchTruck] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all'); // all, high (>20%), moderate (10-20%)
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLogForInvestigation, setSelectedLogForInvestigation] = useState(null);

  // Diesel price baseline
  const dieselPrice = 94.5;

  // Process and enrich all logs with expected vs actual mileage & anomaly analysis
  const enrichedAnomalies = useMemo(() => {
    const list = [];

    (fuelLogs || []).forEach(log => {
      const truckId = log.truck_id || log.vehicle_id || log.truck_number;
      const truckObj = Object.values(trucks).find(t => t.id === truckId || t.truck_number === truckId) || {};
      
      const expectedMileage = Number(log.expected_mileage || truckObj.expected_mileage || 5.8);
      const dist = parseFloat(log.distance || log.kms || log.distance_driven || 0);
      const liters = parseFloat(log.liters || log.fuel_amount || 0);

      const actualMileage = (dist > 0 && liters > 0) ? (dist / liters) : 0;
      
      let dropPct = 0;
      let isAnomaly = false;
      let excessLiters = 0;
      let financialLoss = 0;

      if (expectedMileage > 0 && actualMileage > 0 && actualMileage < expectedMileage) {
        dropPct = Math.round(((expectedMileage - actualMileage) / expectedMileage) * 100);
        if (dropPct >= 10) {
          isAnomaly = true;
          excessLiters = Math.max(0, Math.round((liters - (dist / expectedMileage)) * 10) / 10);
          financialLoss = Math.round(excessLiters * dieselPrice);
        }
      }

      list.push({
        ...log,
        truck_number: log.truck_number || truckObj.truck_number || log.vehicle_id || 'Fleet Truck',
        expected_mileage: expectedMileage,
        actual_mileage: actualMileage > 0 ? Math.round(actualMileage * 100) / 100 : '—',
        raw_actual: actualMileage,
        efficiency_drop_pct: dropPct,
        is_anomaly: isAnomaly || log.is_anomaly,
        excess_liters_lost: excessLiters,
        financial_loss_inr: financialLoss,
        investigation_status: log.investigation_status || (isAnomaly ? 'Open' : 'Normal')
      });
    });

    return list;
  }, [fuelLogs, trucks]);

  // Filtered anomalies list
  const filteredList = useMemo(() => {
    return enrichedAnomalies.filter(item => {
      // Must have some distance or liters to evaluate
      if (!item.is_anomaly && severityFilter !== 'all_logs') return false;

      if (searchTruck) {
        const q = searchTruck.toLowerCase();
        const trk = (item.truck_number || '').toLowerCase();
        const drv = (item.driver_name || '').toLowerCase();
        if (!trk.includes(q) && !drv.includes(q)) return false;
      }

      if (severityFilter === 'high' && item.efficiency_drop_pct < 20) return false;
      if (severityFilter === 'moderate' && (item.efficiency_drop_pct < 10 || item.efficiency_drop_pct >= 20)) return false;

      if (statusFilter !== 'all' && item.investigation_status !== statusFilter) return false;

      return true;
    });
  }, [enrichedAnomalies, searchTruck, severityFilter, statusFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const anomalies = enrichedAnomalies.filter(a => a.is_anomaly);
    let totalLitersLost = 0;
    let totalCostLost = 0;
    let openCount = 0;
    let resolvedCount = 0;

    anomalies.forEach(a => {
      totalLitersLost += a.excess_liters_lost || 0;
      totalCostLost += a.financial_loss_inr || 0;
      if (a.investigation_status === 'Resolved - Maintenance' || a.investigation_status === 'Closed - No Theft') {
        resolvedCount++;
      } else {
        openCount++;
      }
    });

    return {
      totalAnomalies: anomalies.length,
      totalLitersLost: Math.round(totalLitersLost),
      totalCostLost: Math.round(totalCostLost),
      openCount,
      resolvedCount
    };
  }, [enrichedAnomalies]);

  return (
    <div className="space-y-6">
      
      {/* Top Sentinel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px] font-mono font-bold">
              AI PILFERAGE & ANOMALY SENTINEL
            </Badge>
            <span className="text-xs text-slate-400">Real-time Fuel Fraud Prevention</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white font-heading flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 shrink-0" /> Fuel Fraud Prevention & Loss Investigation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Detects abnormal mileage drops, estimates diesel loss, and guides 5-point root cause investigations.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            className="w-full sm:w-auto rounded-xl border-slate-700 bg-slate-800 text-xs font-bold shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Telematics
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <Card className="rounded-2xl border-slate-800 bg-slate-900/80 p-3 sm:p-4 space-y-1">
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase font-bold">Flagged Drops</span>
          <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 shrink-0" /> {metrics.totalAnomalies}
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">&gt;10% drop</p>
        </Card>

        <Card className="rounded-2xl border-slate-800 bg-slate-900/80 p-3 sm:p-4 space-y-1">
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase font-bold">Diesel Wasted</span>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            {metrics.totalLitersLost.toLocaleString('en-IN')} L
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">Excess liters vs target</p>
        </Card>

        <Card className="rounded-2xl border-slate-800 bg-slate-900/80 p-3 sm:p-4 space-y-1">
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase font-bold">Cost Loss</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {formatCurrency(metrics.totalCostLost)}
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">₹94.5/L diesel</p>
        </Card>

        <Card className="rounded-2xl border-slate-800 bg-slate-900/80 p-3 sm:p-4 space-y-1">
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase font-bold">Investigation</span>
          <div className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-1.5 flex-wrap">
            <span className="text-amber-400 text-base sm:text-2xl">{metrics.openCount} Open</span>
            <span className="text-slate-600">/</span>
            <span className="text-emerald-400 text-xs sm:text-base">{metrics.resolvedCount} Done</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">Supervisor actions</p>
        </Card>
      </div>

      {/* 5 Investigation Categories Guide Bar */}
      <Card className="rounded-2xl border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            🔍 5 Guided Investigation Root Causes
          </span>
          <span className="text-[11px] text-slate-500">Standard SOP Diagnostic Framework</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center gap-1">🛢️ Fuel Theft</div>
            <p className="text-[10px] text-slate-400">Siphoning, slip discrepancy, fake bill</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center gap-1">⏱️ Excessive Idling</div>
            <p className="text-[10px] text-slate-400">AC on during dock wait, overnight idle</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center gap-1">🔧 Vehicle Issue</div>
            <p className="text-[10px] text-slate-400">Clogged injector, turbo loss, brake drag</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center gap-1">👨‍✈️ Driver Behaviour</div>
            <p className="text-[10px] text-slate-400">High RPM, rash acceleration, speeding</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center gap-1">⚖️ Overloading</div>
            <p className="text-[10px] text-slate-400">Payload &gt; GVW rating, tarpaulin drag</p>
          </div>
        </div>
      </Card>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search truck number, driver..."
              value={searchTruck}
              onChange={e => setSearchTruck(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs bg-slate-900 border-slate-800 rounded-xl">
              <SelectValue placeholder="Severity..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
              <SelectItem value="all">All Anomalies (&ge;10%)</SelectItem>
              <SelectItem value="high">High Drop (&ge;20%)</SelectItem>
              <SelectItem value="moderate">Moderate (10% - 20%)</SelectItem>
              <SelectItem value="all_logs">View All Refills</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs bg-slate-900 border-slate-800 rounded-xl">
              <SelectValue placeholder="Status..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Under Investigation">Under Investigation</SelectItem>
              <SelectItem value="Recovery Initiated">Recovery Initiated</SelectItem>
              <SelectItem value="Resolved - Maintenance">Resolved (Maintenance)</SelectItem>
              <SelectItem value="Closed - No Theft">Closed (Legitimate)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Anomalies Investigation Table */}
      <Card className="rounded-3xl border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950/80 border-b border-slate-800">
              <TableRow>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-5">Date &amp; Refill</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Truck / Driver</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Expected Mileage</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Actual Mileage</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Efficiency Drop</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Est. Loss</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Investigation</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pr-5 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-500 text-xs">
                    No fuel mileage anomalies detected with current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map(item => (
                  <TableRow key={item.id} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                    <TableCell className="pl-5 text-xs font-medium text-slate-300">
                      <div>{item.date ? item.date.split('T')[0] : '—'}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{item.liters || 0} L filled</span>
                    </TableCell>

                    <TableCell className="text-xs">
                      <div className="font-mono font-bold text-white">{item.truck_number}</div>
                      <span className="text-[10px] text-slate-400">{item.driver_name || 'Driver'}</span>
                    </TableCell>

                    <TableCell className="text-center font-mono text-xs font-semibold text-slate-300">
                      {item.expected_mileage} km/L
                    </TableCell>

                    <TableCell className="text-center font-mono text-xs font-bold text-rose-400">
                      {item.actual_mileage} km/L
                    </TableCell>

                    <TableCell className="text-center">
                      {item.efficiency_drop_pct > 0 ? (
                        <Badge className={`text-xs font-mono font-bold ${
                          item.efficiency_drop_pct >= 20 
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        }`}>
                          ⚠️ -{item.efficiency_drop_pct}% Drop
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                          Optimal
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs">
                      <div className="font-bold text-emerald-400">{formatCurrency(item.financial_loss_inr)}</div>
                      <span className="text-[10px] text-slate-500">~{item.excess_liters_lost} L</span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-[10px] font-semibold ${
                        item.investigation_status === 'Resolved - Maintenance' || item.investigation_status === 'Closed - No Theft'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.investigation_status === 'Recovery Initiated'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : item.investigation_status === 'Under Investigation'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {item.investigation_status || 'Open'}
                      </Badge>
                    </TableCell>

                    <TableCell className="pr-5 text-right">
                      <Button
                        size="sm"
                        onClick={() => setSelectedLogForInvestigation(item)}
                        className="h-8 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow gap-1"
                      >
                        <Wrench className="w-3 h-3" /> Investigate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Investigation Modal */}
      {selectedLogForInvestigation && (
        <FuelInvestigationModal
          isOpen={!!selectedLogForInvestigation}
          onClose={() => setSelectedLogForInvestigation(null)}
          log={selectedLogForInvestigation}
          onSuccess={() => {
            onRefresh?.();
          }}
        />
      )}

    </div>
  );
}
