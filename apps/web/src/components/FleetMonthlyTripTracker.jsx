import React, { useState, useMemo } from 'react';
import { 
  Truck, Users, Calendar, ChevronRight, TrendingUp, AlertTriangle, TrendingDown, 
  CheckCircle2, Clock, MapPin, IndianRupee, Eye, ExternalLink, X, 
  BarChart3, Sparkles, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import IdleDayLossCalculatorModal from './IdleDayLossCalculatorModal.jsx';
import { Link } from 'react-router-dom';
import { 
  computeMonthlyFleetAndDriverStats, 
  getAvailableMonthsList 
} from '@/lib/monthlyTripEngine.js';

export default function FleetMonthlyTripTracker({ 
  trips = [], 
  trucks = [], 
  drivers = [],
  loading = false 
}) {
  const now = new Date();
  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const [selectedMonth, setSelectedMonth] = useState(currentYm);
  const [activeTab, setActiveTab] = useState('trucks'); // 'trucks' | 'drivers'
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [selectedIdleLossTruck, setSelectedIdleLossTruck] = useState(null);
  const [isIdleLossModalOpen, setIsIdleLossModalOpen] = useState(false); // { type: 'truck'|'driver', item: {...} }

  const availableMonths = useMemo(() => getAvailableMonthsList(trips), [trips]);

  const stats = useMemo(() => {
    return computeMonthlyFleetAndDriverStats({
      trips,
      trucks,
      drivers,
      selectedYearMonth: selectedMonth
    });
  }, [trips, trucks, drivers, selectedMonth]);

  const selectedMonthLabel = useMemo(() => {
    const found = availableMonths.find(m => m.value === selectedMonth);
    return found ? found.label : selectedMonth;
  }, [availableMonths, selectedMonth]);

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900 shadow-2xl backdrop-blur-xl p-5 md:p-6 mb-6 relative overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/60 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-black text-white tracking-tight font-heading">
                Monthly Trip Intelligence
              </h2>
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[10px] font-mono px-2 py-0.5">
                LIVE FLEET
              </Badge>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Zero-search trip frequency & dispatch utilization tracker
            </p>
          </div>
        </div>

        {/* Controls: Month Selector & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Selector Pill */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 border-none focus:outline-none cursor-pointer pr-1"
            >
              {availableMonths.map((m) => (
                <option key={m.value} value={m.value} className="bg-slate-900 text-slate-200">
                  {m.label} {m.value === currentYm ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('trucks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'trucks'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Trucks ({stats.trucks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'drivers'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Drivers ({stats.drivers.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fleet Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4 relative z-10">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-400" /> Total Fleet Trips
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-white">
              {stats.totalFleetTrips}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">in {selectedMonthLabel}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Avg Trips / Truck
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-cyan-300">
              {stats.avgTripsPerTruck}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">trips / active unit</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Top Active Truck
          </span>
          <div className="mt-1 truncate">
            <span className="text-sm font-bold font-mono text-amber-300 truncate block">
              {stats.topTruck}
            </span>
          </div>
        </div>

        <div className={`rounded-2xl p-3 flex flex-col justify-between border ${
          stats.underutilizedCount > 0 
            ? 'bg-rose-950/20 border-rose-500/30' 
            : 'bg-slate-900/60 border-slate-800/80'
        }`}>
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className={`w-3.5 h-3.5 ${stats.underutilizedCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} /> 
            Needs Loads Alert
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-black font-mono ${stats.underutilizedCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {stats.underutilizedCount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {stats.underutilizedCount === 1 ? 'truck < 4 trips' : 'trucks < 4 trips'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedIdleLossTruck(null);
              setIsIdleLossModalOpen(true);
            }}
            className="mt-2 text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer hover:underline"
          >
            <TrendingDown className="w-3 h-3" />
            <span>Idle Loss Calculator →</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Trucks View */}
      {activeTab === 'trucks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {stats.trucks.map((trk) => {
            const isHigh = trk.tripCount >= 8;
            const isMod = trk.tripCount >= 4 && trk.tripCount < 8;
            const isLow = trk.tripCount < 4;

            return (
              <div
                key={trk.truckId}
                className={`group rounded-2xl border transition-all duration-200 p-4 flex flex-col justify-between ${
                  isHigh 
                    ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/60' 
                    : isMod 
                    ? 'border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50' 
                    : 'border-rose-500/30 bg-rose-950/15 hover:border-rose-500/60'
                }`}
              >
                {/* Truck Top Info */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black font-mono text-white tracking-wide">
                          {trk.truckNumber}
                        </span>
                        <Badge variant="outline" className={`text-[10px] font-mono px-1.5 py-0 rounded ${
                          isHigh 
                            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' 
                            : isMod 
                            ? 'border-amber-500/40 bg-amber-500/15 text-amber-300' 
                            : 'border-rose-500/40 bg-rose-500/15 text-rose-300'
                        }`}>
                          {trk.utilizationLabel}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {trk.model} · {trk.bodyType}
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300 group-hover:bg-slate-700/80 transition-colors">
                      <Truck className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>

                  {/* Trip Counter Big Highlight */}
                  <div className="my-3 py-2.5 px-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                        Monthly Trips
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black font-mono text-white">
                          {trk.tripCount}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          Trips ({selectedMonthLabel})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-semibold block">Driver Assigned</span>
                      <span className="text-xs font-bold text-slate-200 truncate max-w-[130px] block">
                        {trk.assignedDriver}
                      </span>
                    </div>
                  </div>

                  {/* Operational Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono my-2">
                    <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block font-sans">Distance</span>
                      <span className="font-bold text-slate-200">{trk.totalKm.toLocaleString('en-IN')} KM</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block font-sans">Freight Revenue</span>
                      <span className="font-bold text-emerald-400">₹{trk.totalFreight.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Idle Day Loss Calculator Pill */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIdleLossTruck(trk);
                      setIsIdleLossModalOpen(true);
                    }}
                    className="w-full my-2 py-1.5 px-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 flex items-center justify-between text-xs transition cursor-pointer group/loss"
                    title="Calculate idle day standing loss and EMI bleed for this truck"
                  >
                    <span className="flex items-center gap-1.5 text-rose-300 font-semibold text-[11px]">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      Idle Loss Analysis
                    </span>
                    <span className="text-[10px] font-mono font-bold text-rose-400 group-hover/loss:underline flex items-center gap-0.5">
                      Calculate Bleed →
                    </span>
                  </button>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2 pt-2 mt-1 border-t border-slate-800/60">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDetailModalItem({ type: 'truck', item: trk })}
                    className="flex-1 h-8 text-xs font-bold border-slate-700 hover:bg-slate-800 text-slate-200 flex items-center justify-center gap-1.5 rounded-lg"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View {trk.tripCount} Trips</span>
                  </Button>

                  <Link to={`/truck-manager?truck=${encodeURIComponent(trk.truckNumber)}`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                      title="Manage in Truck Manager"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Drivers View */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {stats.drivers.map((drv, idx) => {
            const isTop = idx === 0 && drv.tripCount > 0;

            return (
              <div
                key={drv.driverId}
                className={`group rounded-2xl border transition-all duration-200 p-4 flex flex-col justify-between ${
                  isTop 
                    ? 'border-amber-500/40 bg-amber-950/15 hover:border-amber-500/60' 
                    : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white">
                          {drv.name}
                        </span>
                        {drv.code && (
                          <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-[10px] font-mono px-1.5 py-0 rounded">
                            {drv.code}
                          </Badge>
                        )}
                        {isTop && (
                          <Badge className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0 rounded flex items-center gap-0.5">
                            ⭐ Top Pilot
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Assigned Vehicle: <span className="font-mono text-slate-300 font-bold">{drv.assignedVehicle}</span>
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300 group-hover:bg-slate-700/80 transition-colors">
                      <Users className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>

                  {/* Trip Counter & Target Progress */}
                  <div className="my-3 py-2.5 px-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Trips Completed
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {drv.tripCount} / {drv.monthlyTarget} Target
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-black font-mono text-white">
                        {drv.tripCount}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        Completed Trips ({selectedMonthLabel})
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${drv.targetPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Driver Operational Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono my-2">
                    <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block font-sans">Distance Covered</span>
                      <span className="font-bold text-slate-200">{drv.totalKm.toLocaleString('en-IN')} KM</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block font-sans">Gross Freight Handled</span>
                      <span className="font-bold text-emerald-400">₹{drv.totalFreight.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2 pt-2 mt-1 border-t border-slate-800/60">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDetailModalItem({ type: 'driver', item: drv })}
                    className="flex-1 h-8 text-xs font-bold border-slate-700 hover:bg-slate-800 text-slate-200 flex items-center justify-center gap-1.5 rounded-lg"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View {drv.tripCount} Trips</span>
                  </Button>

                  <Link to="/driver-scorecard">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-1"
                      title="Open Driver Scorecard"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      <span>Scorecard</span>
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Trips Modal */}
      {detailModalItem && (
        <Dialog open={!!detailModalItem} onOpenChange={() => setDetailModalItem(null)}>
          <DialogContent className="max-w-2xl bg-slate-950 border border-slate-800 text-slate-100 p-0 overflow-hidden rounded-3xl shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white font-mono">
                    {detailModalItem.type === 'truck' ? detailModalItem.item.truckNumber : detailModalItem.item.name}
                  </span>
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-mono text-xs">
                    {selectedMonthLabel}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {detailModalItem.item.trips.length} trips completed in {selectedMonthLabel}
                </p>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs text-slate-400 block">Total Freight</span>
                <span className="text-sm font-bold text-emerald-400">
                  ₹{detailModalItem.item.totalFreight.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Modal Trip List */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2.5">
              {detailModalItem.item.trips.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No trips recorded for this vehicle in {selectedMonthLabel}.</p>
                </div>
              ) : (
                detailModalItem.item.trips.map((t, idx) => {
                  const tripDate = t.date || t.start_date || t.created || 'N/A';
                  const routeStr = t.route || `${t.origin || 'Origin'} ➔ ${t.destination || 'Destination'}`;
                  const clientName = t.client_name || t.client || 'Direct Client';
                  const freight = Number(t.revenue || t.freight_amount || t.amount || 0);
                  const km = Number(t.actual_km || t.kms || t.trip_km || 0);

                  return (
                    <div
                      key={t.id || idx}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {tripDate.split('T')[0]}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {routeStr}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span>🏢 {clientName}</span>
                          {detailModalItem.type === 'truck' && t.driver_name && (
                            <span>👤 {t.driver_name}</span>
                          )}
                          {detailModalItem.type === 'driver' && t.truck_number && (
                            <span className="font-mono">🚚 {t.truck_number}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 font-mono text-xs pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        {km > 0 && (
                          <span className="text-slate-400">{km} KM</span>
                        )}
                        <span className="font-bold text-emerald-400">
                          ₹{freight.toLocaleString('en-IN')}
                        </span>
                        <Badge variant="outline" className="border-slate-700 bg-slate-800/50 text-slate-300 text-[10px] px-1.5 py-0">
                          {t.trip_status || t.status || 'Delivered'}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Total distance: <strong className="text-white font-mono">{detailModalItem.item.totalKm.toLocaleString('en-IN')} KM</strong>
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDetailModalItem(null)}
                className="h-8 text-xs border-slate-700 hover:bg-slate-800 text-slate-200 rounded-lg"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Idle Day Loss Calculator Modal */}
      <IdleDayLossCalculatorModal
        isOpen={isIdleLossModalOpen}
        onClose={() => setIsIdleLossModalOpen(false)}
        truck={selectedIdleLossTruck}
        allTrucks={trucks.length > 0 ? trucks : stats.trucks}
        allTrips={trips}
      />
    </div>
  );
}
