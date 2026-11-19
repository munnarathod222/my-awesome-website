import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  ShieldAlert, AlertTriangle, Fuel, Search, Filter, 
  Wrench, Scale, Clock, User, CheckCircle2, DollarSign, 
  ArrowRight, Download, RefreshCw, Eye, ShieldCheck, PieChart,
  Flame, ChevronRight, X, ExternalLink, Paperclip, Camera, TrendingDown,
  UserCheck, AlertOctagon, HelpCircle, FileText
} from 'lucide-react';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import FuelInvestigationModal from './FuelInvestigationModal.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export default function FuelFraudSentinelTab({ 
  fuelLogs = [], 
  trucks = {}, 
  loading = false, 
  onRefresh 
}) {
  // Top Sub-Tab Switcher: 'sensor_bleed' (Driver Bleed Analytics) vs 'mileage_anomaly' (Mileage Drop Sentinel)
  const [activeSubTab, setActiveSubTab] = useState('sensor_bleed');

  // Search & Filters for Mileage Anomaly Sentinel
  const [searchTruck, setSearchTruck] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all'); // all, high (>20%), moderate (10-20%)
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLogForInvestigation, setSelectedLogForInvestigation] = useState(null);

  // Driver Bleed & Theft Reports State
  const [theftReports, setTheftReports] = useState([]);
  const [theftLoading, setTheftLoading] = useState(false);
  const [driverSearch, setDriverSearch] = useState('');
  const [selectedDriverForAudit, setSelectedDriverForAudit] = useState(null);
  const [previewDocUrl, setPreviewDocUrl] = useState(null);
  const [isDeducting, setIsDeducting] = useState(false);

  // Diesel price baseline
  const dieselPrice = 94.5;

  // Fetch live fuel theft reports
  const fetchTheftReports = async () => {
    setTheftLoading(true);
    try {
      const records = await pb.collection('fuel_theft_reports').getFullList({
        sort: '-incident_date',
        $autoCancel: false
      });
      setTheftReports(records || []);
    } catch (err) {
      console.warn('Fuel theft reports fetch notice:', err?.message);
    } finally {
      setTheftLoading(false);
    }
  };

  useEffect(() => {
    fetchTheftReports();
  }, []);

  // ── 1. DRIVER BLEED & SCAM ANALYTICS AGGREGATIONS ────────────────────────
  const driverBleedSummary = useMemo(() => {
    let totalBleedLoss = 0;
    let totalStolenLiters = 0;
    let totalRecovered = 0;

    const driverMap = new Map();
    const stationMap = new Map();

    theftReports.forEach(report => {
      const bleedAmt = Number(report.bleeding_amount || 0);
      const shortLiters = Number(report.stolen_liters || 0);
      const isRecovered = report.status === 'Deducted from Salary / Advance' || !!report.advance_deduction_id;

      totalBleedLoss += bleedAmt;
      totalStolenLiters += shortLiters;
      if (isRecovered) totalRecovered += bleedAmt;

      // Group by Driver
      const driverKey = report.driver_id || report.driver_name || 'Unknown Driver';
      const existingDriver = driverMap.get(driverKey) || {
        driver_id: report.driver_id || '',
        driver_name: report.driver_name || 'Driver',
        truck_number: report.truck_number || '—',
        incidents_count: 0,
        total_stolen_liters: 0,
        total_bleed_amount: 0,
        total_recovered: 0,
        incidents: []
      };

      existingDriver.incidents_count += 1;
      existingDriver.total_stolen_liters += shortLiters;
      existingDriver.total_bleed_amount += bleedAmt;
      if (isRecovered) existingDriver.total_recovered += bleedAmt;
      existingDriver.incidents.push(report);
      if (report.truck_number && report.truck_number !== '—') {
        existingDriver.truck_number = report.truck_number;
      }

      driverMap.set(driverKey, existingDriver);

      // Group by Petrol Pump
      const pumpName = (report.petrol_pump_name || '').trim();
      if (pumpName) {
        const existingPump = stationMap.get(pumpName) || {
          pump_name: pumpName,
          incidents_count: 0,
          total_stolen_liters: 0,
          total_loss_inr: 0
        };
        existingPump.incidents_count += 1;
        existingPump.total_stolen_liters += shortLiters;
        existingPump.total_loss_inr += bleedAmt;
        stationMap.set(pumpName, existingPump);
      }
    });

    // Rank drivers descending by total bleed amount
    const driverList = Array.from(driverMap.values()).map(d => {
      const netUnrecovered = Math.max(0, d.total_bleed_amount - d.total_recovered);
      let riskLevel = 'watchlist';
      if (d.total_bleed_amount >= 5000) riskLevel = 'critical';
      else if (d.total_bleed_amount >= 2000) riskLevel = 'moderate';

      return {
        ...d,
        total_stolen_liters: Math.round(d.total_stolen_liters * 10) / 10,
        net_unrecovered: netUnrecovered,
        risk_level: riskLevel
      };
    }).sort((a, b) => b.total_bleed_amount - a.total_bleed_amount);

    // Rank stations descending by total loss
    const stationList = Array.from(stationMap.values()).sort((a, b) => b.total_loss_inr - a.total_loss_inr);

    const topBleeder = driverList.length > 0 ? driverList[0] : null;

    return {
      totalBleedLoss,
      totalStolenLiters: Math.round(totalStolenLiters * 10) / 10,
      totalRecovered,
      netUnrecovered: Math.max(0, totalBleedLoss - totalRecovered),
      driverList,
      topBleeder,
      stationList,
      totalIncidents: theftReports.length
    };
  }, [theftReports]);

  // Filtered driver leaderboard
  const filteredDriverList = useMemo(() => {
    if (!driverSearch) return driverBleedSummary.driverList;
    const q = driverSearch.toLowerCase();
    return driverBleedSummary.driverList.filter(d => 
      (d.driver_name || '').toLowerCase().includes(q) ||
      (d.truck_number || '').toLowerCase().includes(q)
    );
  }, [driverBleedSummary.driverList, driverSearch]);

  // 1-Click Advance Deduction Recovery
  const handleQuickDeductAdvance = async (report) => {
    if (!report || !report.id) return;
    setIsDeducting(true);
    try {
      const loss = Number(report.bleeding_amount || 0);
      const driver = report.driver_name || 'Driver';
      const truck = report.truck_number || 'Truck';

      // 1. Create debit in expenses_driver_advance
      const advRecord = await pb.collection('expenses_driver_advance').create({
        driver_name: driver,
        amount: loss,
        date: report.incident_date || new Date().toISOString(),
        location: report.petrol_pump_name || truck,
        payment_mode: 'Fuel Theft Recovery',
        notes: `Automatic recovery: Fuel sensor shortfall of ${report.stolen_liters}L on ${truck} at ₹${report.fuel_rate}/L`,
      }, { $autoCancel: false });

      // 2. Update status in fuel_theft_reports
      await pb.collection('fuel_theft_reports').update(report.id, {
        status: 'Deducted from Salary / Advance',
        advance_deduction_id: advRecord.id
      }, { $autoCancel: false });

      toast.success(`₹${loss.toLocaleString('en-IN')} successfully deducted from ${driver}'s salary/advance!`);
      await fetchTheftReports();

      // Update selected driver audit modal if open
      if (selectedDriverForAudit) {
        setSelectedDriverForAudit(prev => {
          if (!prev) return null;
          return {
            ...prev,
            total_recovered: prev.total_recovered + loss,
            net_unrecovered: Math.max(0, prev.net_unrecovered - loss),
            incidents: prev.incidents.map(inc => inc.id === report.id ? { ...inc, status: 'Deducted from Salary / Advance', advance_deduction_id: advRecord.id } : inc)
          };
        });
      }
    } catch (err) {
      console.error('Failed to deduct advance:', err);
      toast.error('Failed to deduct from advance: ' + (err.message || 'Error'));
    } finally {
      setIsDeducting(false);
    }
  };

  // ── 2. MILEAGE DROP ANOMALY CALCULATIONS (EXISTING SENTINEL) ──────────────
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

  const filteredList = useMemo(() => {
    return enrichedAnomalies.filter(item => {
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

  const anomalyMetrics = useMemo(() => {
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
      
      {/* ── TOP SENTINEL HEADER & SUB-TAB SWITCHER ────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
              IoT Sensor Pilferage & Fraud Sentinel
            </Badge>
            <span className="text-xs text-slate-400">Live Telematics & Disparity Tracking</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white font-heading flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 shrink-0" />
            Fuel Theft Prevention & Driver Bleed Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare billed fuel slips against IoT tank sensor ingest, measure individual driver financial bleed, and recoup losses via 1-click salary deductions.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onRefresh?.();
              fetchTheftReports();
              toast.info('Refreshed telematics and theft reports.');
            }}
            className="w-full md:w-auto rounded-xl border-slate-700 bg-slate-800 text-xs font-bold shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Telematics
          </Button>
        </div>
      </div>

      {/* ── VIEW SWITCHER PILLS ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800 w-full sm:w-auto self-start">
        <button
          type="button"
          onClick={() => setActiveSubTab('sensor_bleed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'sensor_bleed'
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-300" />
          🩸 Driver Bleed & Sensor Scams
          <Badge className="ml-1 bg-white/20 text-white font-mono text-[10px] px-1.5 py-0 border-none">
            {driverBleedSummary.totalIncidents}
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('mileage_anomaly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'mileage_anomaly'
              ? 'bg-slate-800 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-amber-400" />
          📉 Mileage Drop Anomaly Sentinel
          <Badge className="ml-1 bg-slate-700 text-slate-300 font-mono text-[10px] px-1.5 py-0 border-none">
            {anomalyMetrics.totalAnomalies}
          </Badge>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-TAB 1: DRIVER BLEED & SENSOR THEFT ANALYTICS ──────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'sensor_bleed' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          
          {/* Bleed Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="rounded-2xl border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 p-3 sm:p-4 space-y-1 shadow-lg">
              <span className="text-[10px] font-mono text-rose-300 uppercase font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> Total Fleet Bleed Loss
              </span>
              <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
                {formatCurrency(driverBleedSummary.totalBleedLoss)}
              </div>
              <p className="text-[10px] text-slate-400 truncate">Cumulative sensor shortfall</p>
            </Card>

            <Card className="rounded-2xl border-slate-800 bg-slate-900/80 p-3 sm:p-4 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-amber-400" /> Diesel Pilfered
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {driverBleedSummary.totalStolenLiters.toLocaleString('en-IN')} L
              </div>
              <p className="text-[10px] text-slate-400 truncate">Billed liters minus sensor fill</p>
            </Card>

            <Card className="rounded-2xl border-slate-800 bg-slate-900/80 p-3 sm:p-4 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" /> Top Bleeding Driver
              </span>
              <div className="text-sm sm:text-base font-black text-white truncate">
                {driverBleedSummary.topBleeder ? driverBleedSummary.topBleeder.driver_name : 'No Bleeders'}
              </div>
              <p className="text-[10px] font-mono text-rose-400 font-bold">
                {driverBleedSummary.topBleeder ? `Bleeding ${formatCurrency(driverBleedSummary.topBleeder.total_bleed_amount)} (${driverBleedSummary.topBleeder.total_stolen_liters}L)` : 'Zero pilferage logged'}
              </p>
            </Card>

            <Card className="rounded-2xl border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 p-3 sm:p-4 space-y-1 shadow-lg">
              <span className="text-[10px] font-mono text-emerald-300 uppercase font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Recouped via Advance
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {formatCurrency(driverBleedSummary.totalRecovered)}
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {formatCurrency(driverBleedSummary.netUnrecovered)} unrecovered
              </p>
            </Card>
          </div>

          {/* Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search bleeder by driver name, truck number..."
                value={driverSearch}
                onChange={e => setDriverSearch(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white"
              />
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Showing {filteredDriverList.length} driver(s) with recorded sensor shortfalls</span>
            </div>
          </div>

          {/* DRIVER BLEED LEADERBOARD & RISK SCORECARD */}
          <Card className="rounded-3xl border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
            <CardHeader className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-rose-400" />
                    Driver Bleed Leaderboard &amp; Risk Scorecard
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Ranks employees by total company money bled via fuel sensor short-filling.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-950/80 border-b border-slate-800">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-5 text-center w-12">Rank</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Driver &amp; Assigned Truck</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Incidents</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Liters Pilfered</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Total Bleed (₹)</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Recovered (₹)</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Risk Level</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pr-5 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDriverList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-slate-500 text-xs">
                        {theftReports.length === 0 
                          ? "No fuel sensor theft or scam incidents recorded yet. Use the 'Report Scam' option while logging a fuel refill to audit sensor shortfalls."
                          : "No drivers match your search query."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDriverList.map((driver, idx) => (
                      <TableRow 
                        key={driver.driver_id || driver.driver_name} 
                        className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors cursor-pointer"
                        onClick={() => setSelectedDriverForAudit(driver)}
                      >
                        <TableCell className="pl-5 text-center font-mono font-black text-xs text-slate-400">
                          {idx === 0 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                              #1
                            </span>
                          ) : idx === 1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                              #2
                            </span>
                          ) : (
                            `#${idx + 1}`
                          )}
                        </TableCell>

                        <TableCell className="text-xs">
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            {driver.driver_name}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Truck: {driver.truck_number || 'Fleet Vehicle'}
                          </span>
                        </TableCell>

                        <TableCell className="text-center font-mono text-xs font-bold text-slate-300">
                          <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300 font-mono text-[10px]">
                            {driver.incidents_count} refill{driver.incidents_count > 1 ? 's' : ''}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right font-mono text-xs font-bold text-amber-400">
                          {driver.total_stolen_liters.toLocaleString('en-IN')} L
                        </TableCell>

                        <TableCell className="text-right font-mono text-sm font-black text-rose-400">
                          {formatCurrency(driver.total_bleed_amount)}
                        </TableCell>

                        <TableCell className="text-right font-mono text-xs text-emerald-400 font-bold">
                          {formatCurrency(driver.total_recovered)}
                        </TableCell>

                        <TableCell className="text-center">
                          {driver.risk_level === 'critical' ? (
                            <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px] font-bold animate-pulse">
                              🔴 Critical Bleeder
                            </Badge>
                          ) : driver.risk_level === 'moderate' ? (
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-bold">
                              🟡 Moderate Bleed
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[10px] font-bold">
                              🔵 Watchlist
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="pr-5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedDriverForAudit(driver)}
                              className="h-7 text-xs px-2.5 rounded-lg border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 gap-1 font-bold"
                            >
                              <Search className="w-3 h-3 text-rose-400" /> Audit Timeline
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* PETROL PUMP COLLUSION HOTSPOTS CARD */}
          {driverBleedSummary.stationList.length > 0 && (
            <Card className="rounded-3xl border-slate-800 bg-slate-900/80 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-amber-400" /> Petrol Pump Collusion Hotspots
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Petrol stations where trucks repeatedly report sensor shortfills across multiple refills.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {driverBleedSummary.stationList.map(station => (
                  <div key={station.pump_name} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate max-w-[200px]" title={station.pump_name}>
                        {station.pump_name}
                      </span>
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px] font-mono">
                        {station.incidents_count} theft{station.incidents_count > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-[11px] text-slate-400">Total Lost:</span>
                      <span className="font-mono font-black text-rose-400 text-xs">
                        {formatCurrency(station.total_loss_inr)} ({station.total_stolen_liters} L)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-TAB 2: MILEAGE DROP ANOMALY SENTINEL (EXISTING) ───────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'mileage_anomaly' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <Card className="rounded-2xl border-slate-800 bg-slate-900/80 p-3 sm:p-4 space-y-1">
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase font-bold">Flagged Drops</span>
              <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 shrink-0" /> {anomalyMetrics.totalAnomalies}
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">&gt;10% drop</p>
            </Card>

            <Card className="rounded-2xl border-slate-800 bg-slate-900/80 p-3 sm:p-4 space-y-1">
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase font-bold">Diesel Wasted</span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {anomalyMetrics.totalLitersLost.toLocaleString('en-IN')} L
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">Excess liters vs target</p>
            </Card>

            <Card className="rounded-2xl border-slate-800 bg-slate-900/80 p-3 sm:p-4 space-y-1">
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase font-bold">Cost Loss</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {formatCurrency(anomalyMetrics.totalCostLost)}
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">₹94.5/L diesel</p>
            </Card>

            <Card className="rounded-2xl border-slate-800 bg-slate-900/80 p-3 sm:p-4 space-y-1">
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase font-bold">Investigation</span>
              <div className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-1.5 flex-wrap">
                <span className="text-amber-400 text-base sm:text-2xl">{anomalyMetrics.openCount} Open</span>
                <span className="text-slate-600">/</span>
                <span className="text-emerald-400 text-xs sm:text-base">{anomalyMetrics.resolvedCount} Done</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">Supervisor actions</p>
            </Card>
          </div>

          {/* 5 Guided Investigation Root Causes Guide Bar */}
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
        </div>
      )}

      {/* ── DRIVER AUDIT DRILLDOWN TIMELINE MODAL ───────────────────────── */}
      {selectedDriverForAudit && (
        <Dialog open={!!selectedDriverForAudit} onOpenChange={() => setSelectedDriverForAudit(null)}>
          <DialogContent className="sm:max-w-3xl bg-slate-950 border-slate-800 text-white max-h-[90vh] overflow-y-auto rounded-3xl p-6">
            <DialogHeader className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    Fuel Theft &amp; Bleed Audit: {selectedDriverForAudit.driver_name}
                  </DialogTitle>
                  <p className="text-xs text-slate-400 mt-1">
                    Complete sensor shortfall history, attached telematics graphs, and advance recovery ledger.
                  </p>
                </div>
              </div>
            </DialogHeader>

            {/* Profile KPI Banner */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 my-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Total Bleed Loss</span>
                <div className="text-lg sm:text-xl font-black font-mono text-rose-400">
                  {formatCurrency(selectedDriverForAudit.total_bleed_amount)}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{selectedDriverForAudit.total_stolen_liters} L stolen</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Recouped Amount</span>
                <div className="text-lg sm:text-xl font-black font-mono text-emerald-400">
                  {formatCurrency(selectedDriverForAudit.total_recovered)}
                </div>
                <span className="text-[10px] text-emerald-400/80">Via Salary Advance</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Net Unrecovered</span>
                <div className="text-lg sm:text-xl font-black font-mono text-amber-400">
                  {formatCurrency(selectedDriverForAudit.net_unrecovered)}
                </div>
                <span className="text-[10px] text-slate-400">Outstanding Balance</span>
              </div>
            </div>

            {/* Incident Timeline List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Chronological Scam &amp; Sensor Shortfall Events ({selectedDriverForAudit.incidents.length})
              </h4>

              {selectedDriverForAudit.incidents.map((incident, i) => {
                const isRecovered = incident.status === 'Deducted from Salary / Advance' || !!incident.advance_deduction_id;
                
                // Get sensor proof files
                const proofFiles = incident.sensor_proof_file 
                  ? (Array.isArray(incident.sensor_proof_file) ? incident.sensor_proof_file : [incident.sensor_proof_file])
                  : [];
                
                // Get fuel bill files
                const billFiles = incident.fuel_bill_file
                  ? (Array.isArray(incident.fuel_bill_file) ? incident.fuel_bill_file : [incident.fuel_bill_file])
                  : [];

                return (
                  <div key={incident.id || i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border-rose-500/30">
                          {incident.incident_date ? incident.incident_date.split('T')[0] : '—'}
                        </Badge>
                        <span className="font-bold text-sm text-white font-mono">{incident.truck_number}</span>
                        {incident.petrol_pump_name && (
                          <span className="text-xs text-slate-400">@ {incident.petrol_pump_name}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${
                          isRecovered 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {incident.status || 'Reported'}
                        </Badge>

                        {!isRecovered && (
                          <Button
                            size="sm"
                            disabled={isDeducting}
                            onClick={() => handleQuickDeductAdvance(incident)}
                            className="h-7 text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg px-2.5 shadow"
                          >
                            ⚡ Deduct {formatCurrency(incident.bleeding_amount)}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Incident Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Billed Slip</span>
                        <div className="font-mono font-bold text-white text-sm mt-0.5">{incident.billed_liters} L</div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Sensor Reading</span>
                        <div className="font-mono font-bold text-slate-300 text-sm mt-0.5">{incident.sensor_liters} L</div>
                      </div>

                      <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-500/30">
                        <span className="text-[10px] text-rose-300 uppercase font-mono">Shortfall Liters</span>
                        <div className="font-mono font-bold text-rose-400 text-sm mt-0.5">-{incident.stolen_liters} L</div>
                      </div>

                      <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/40">
                        <span className="text-[10px] text-rose-300 uppercase font-mono">Bleeding Loss (₹)</span>
                        <div className="font-mono font-black text-rose-300 text-sm mt-0.5">{formatCurrency(incident.bleeding_amount)}</div>
                      </div>
                    </div>

                    {/* Method & Notes */}
                    <div className="text-xs space-y-1">
                      <div className="text-slate-300">
                        <span className="text-slate-500 font-semibold">Theft Method:</span> {incident.theft_type || 'Dispenser Short-fill'}
                      </div>
                      {incident.notes && (
                        <div className="text-slate-400 text-[11px] italic bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                          "{incident.notes}"
                        </div>
                      )}
                    </div>

                    {/* Proof Thumbnails */}
                    {(proofFiles.length > 0 || billFiles.length > 0) && (
                      <div className="pt-1 flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                          <Camera className="w-3.5 h-3.5 text-rose-400" /> Evidence Proofs:
                        </span>
                        {proofFiles.map((f, idx) => {
                          const url = pb.files.getUrl(incident, f);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setPreviewDocUrl(url)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-[11px] font-mono border border-slate-700 transition"
                            >
                              <Eye className="w-3 h-3" /> Sensor Graph {idx + 1}
                            </button>
                          );
                        })}
                        {billFiles.map((f, idx) => {
                          const url = pb.files.getUrl(incident, f);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setPreviewDocUrl(url)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700 transition"
                            >
                              <Paperclip className="w-3 h-3" /> Pump Slip {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button variant="outline" onClick={() => setSelectedDriverForAudit(null)} className="rounded-xl border-slate-700">
                Close Audit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── SENSOR PROOF PREVIEW MODAL ──────────────────────────────────── */}
      {previewDocUrl && (
        <Dialog open={!!previewDocUrl} onOpenChange={() => setPreviewDocUrl(null)}>
          <DialogContent className="sm:max-w-2xl bg-zinc-950 border-zinc-800 text-white p-4">
            <DialogHeader className="border-b border-zinc-800 pb-2 flex flex-row items-center justify-between">
              <DialogTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-400" /> Sensor Proof / Fuel Receipt Inspection
              </DialogTitle>
            </DialogHeader>
            <div className="py-2 flex items-center justify-center max-h-[75vh] overflow-hidden">
              {previewDocUrl.endsWith('.pdf') ? (
                <iframe src={previewDocUrl} className="w-full h-[65vh] rounded-lg" title="Document Preview" />
              ) : (
                <img src={previewDocUrl} alt="Proof" className="max-h-[65vh] w-auto object-contain rounded-lg shadow-xl" />
              )}
            </div>
            <DialogFooter className="pt-2 border-t border-zinc-800 flex justify-between">
              <a 
                href={previewDocUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-mono"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
              </a>
              <Button size="sm" variant="outline" onClick={() => setPreviewDocUrl(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Investigation Modal (Existing) */}
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
