import React, { useState, useEffect } from 'react';
import { 
  PlaneTakeoff, Clock, MapPin, RefreshCw, Filter, Search, 
  Maximize2, Minimize2, ShieldAlert, CheckCircle2, AlertTriangle, 
  Truck, ArrowRight, Radio, ExternalLink, Hash, User, Anchor
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { reservationClient } from '@/lib/reservationClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

const STATUS_THEME = {
  'DEPARTED': {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    label: 'DEPARTED'
  },
  'BOARDING': {
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    label: 'BOARDING / LOADING'
  },
  'GATE OPEN': {
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    dot: 'bg-cyan-400',
    text: 'text-cyan-400',
    label: 'GATE OPEN (BAY READY)'
  },
  'DELAYED': {
    badge: 'bg-rose-500/25 text-rose-300 border-rose-500/50 animate-pulse',
    dot: 'bg-rose-400',
    text: 'text-rose-400',
    label: 'DELAYED'
  },
  'SCHEDULED': {
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    dot: 'bg-slate-400',
    text: 'text-slate-300',
    label: 'SCHEDULED'
  },
  'HELD': {
    badge: 'bg-amber-600/20 text-amber-300 border-amber-600/40',
    dot: 'bg-amber-500',
    text: 'text-amber-300',
    label: 'BUSY / HELD'
  }
};

export default function DepartureBoardPage() {
  let currentUser = null;
  try {
    const auth = useAuth();
    currentUser = auth?.currentUser;
  } catch (e) {
    try {
      currentUser = JSON.parse(localStorage.getItem('app_auth_user'));
    } catch (err) {}
  }

  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHub, setSelectedHub] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isKioskMode, setIsKioskMode] = useState(false);

  // Edit / Bay Management Modal
  const [activeDeparture, setActiveDeparture] = useState(null);
  const [newBay, setNewBay] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // Live Clock updater (every second)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDepartures = async () => {
    try {
      setLoading(true);
      const res = await reservationClient.getDepartures();
      setDepartures(res.departures || []);
    } catch (err) {
      toast.error('Failed to load departure board: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartures();
    // Auto-refresh board every 30 seconds
    const interval = setInterval(loadDepartures, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateBay = async (e) => {
    e.preventDefault();
    if (!activeDeparture) return;
    try {
      await reservationClient.updateDepartureBay({
        id: activeDeparture.id,
        dock_bay: newBay || activeDeparture.dock_bay,
        status: newStatus || activeDeparture.status
      });
      toast.success(`Departure for ${activeDeparture.truck_number} updated to ${newStatus || activeDeparture.status}!`);
      setActiveDeparture(null);
      loadDepartures();
    } catch (err) {
      toast.error(err.message || 'Failed to update departure');
    }
  };

  // Filter Departures
  const filtered = departures.filter(dep => {
    const matchesSearch = 
      (dep.truck_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dep.destination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dep.driver_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dep.dock_bay || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dep.lr_pod_number || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHub = selectedHub === 'All' || dep.origin.toLowerCase().includes(selectedHub.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || dep.status === selectedStatus;

    return matchesSearch && matchesHub && matchesStatus;
  });

  const activeCount = departures.filter(d => d.status !== 'DEPARTED').length;
  const delayedCount = departures.filter(d => d.status === 'DELAYED').length;
  const boardingCount = departures.filter(d => d.status === 'BOARDING').length;

  return (
    <div className={`p-4 md:p-6 space-y-5 font-sans transition-all ${isKioskMode ? 'fixed inset-0 z-50 bg-slate-950 overflow-y-auto p-8' : 'max-w-[1600px] mx-auto'}`}>
      {/* ── Top Airport Terminal Display Header ───────────────────────── */}
      <div className="bg-slate-900/95 border border-slate-800 p-4 md:p-5 rounded-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 shrink-0">
            <PlaneTakeoff className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                FIDS · CENTRAL DISPATCH TERMINAL
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE BOARD
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-0.5 font-mono">
              TRUCK DEPARTURE BOARD
            </h1>
          </div>
        </div>

        {/* Digital Clock & Terminal Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Airport Flip Digital Clock */}
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2.5 font-mono shadow-inner">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-lg md:text-xl font-black text-emerald-400 tracking-wider">
                {currentTime.toLocaleTimeString('en-IN', { hour12: false })}
              </span>
              <span className="text-[10px] font-bold text-slate-500 ml-1">IST</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold border-l border-slate-800 pl-2 hidden sm:inline">
              {currentTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadDepartures}
            className="border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 text-xs h-10 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Fullscreen TV Kiosk Mode Toggle */}
          <Button 
            size="sm"
            onClick={() => setIsKioskMode(!isKioskMode)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-10 rounded-xl shadow-lg shadow-emerald-500/20"
          >
            {isKioskMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 mr-1.5" />
                Exit Kiosk Mode
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
                Fullscreen TV Kiosk
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Status KPI Counter Banner ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Departure Bays', count: activeCount, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', dot: 'bg-cyan-400' },
          { label: 'Boarding / Loading', count: boardingCount, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
          { label: 'SLA Delayed Trucks', count: delayedCount, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', dot: 'bg-rose-400' },
          { label: 'Total Scheduled Departures', count: departures.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' }
        ].map((kpi, idx) => (
          <div key={idx} className={`p-3 rounded-2xl border ${kpi.bg} flex items-center justify-between`}>
            <div>
              <p className="text-[11px] font-bold text-slate-400">{kpi.label}</p>
              <p className={`text-2xl font-black ${kpi.color} font-mono mt-0.5`}>{kpi.count}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${kpi.dot}`} />
          </div>
        ))}
      </div>

      {/* ── Filters & Search Strip ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <Input 
              placeholder="Filter by Truck # (TG12, TS08), City, Dock Bay, or LR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border-slate-800 text-xs h-9 pl-9 text-white placeholder:text-slate-500 rounded-xl font-mono"
            />
          </div>

          {/* Hub Filter Pills */}
          <div className="flex items-center gap-1">
            {['All', 'Hyderabad', 'Hubli', 'Pune', 'Bangalore'].map(hub => (
              <button
                key={hub}
                onClick={() => setSelectedHub(hub)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedHub === hub 
                    ? 'bg-emerald-500 text-slate-950 font-black' 
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {hub}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <strong className="text-emerald-400 font-mono">{filtered.length}</strong> of {departures.length} Departures
        </div>
      </div>

      {/* ── Digital Departure Board Table (Airport Split-Flap Style) ─── */}
      <Card className="bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            {/* Table Header */}
            <thead className="bg-slate-900 text-slate-400 font-black text-[11px] tracking-wider uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">SCHED. TIME</th>
                <th className="py-3 px-4">TRUCK #</th>
                <th className="py-3 px-4">DESTINATION ROUTE</th>
                <th className="py-3 px-4">VEHICLE TYPE</th>
                <th className="py-3 px-4 text-center">DOCK BAY</th>
                <th className="py-3 px-4">DRIVER PILOT</th>
                <th className="py-3 px-4">LR / CONSIGNMENT</th>
                <th className="py-3 px-4">CARGO / WT</th>
                <th className="py-3 px-4 text-right">DEPARTURE STATUS</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-850">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-300">Syncing with warehouse telematics & dock bay sensors...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center text-slate-500">
                    <Truck className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-400" />
                    <p className="font-bold text-slate-300">No scheduled departures found</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Try clearing filter parameters.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((dep, idx) => {
                  const theme = STATUS_THEME[dep.status] || STATUS_THEME['SCHEDULED'];
                  const schedTimeFormatted = dep.scheduled_departure ? new Date(dep.scheduled_departure).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '18:00';

                  return (
                    <tr 
                      key={dep.id || idx}
                      onClick={() => {
                        setActiveDeparture(dep);
                        setNewBay(dep.dock_bay);
                        setNewStatus(dep.status);
                      }}
                      className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                    >
                      {/* Scheduled Time */}
                      <td className="py-3.5 px-4 font-black text-emerald-400 text-sm whitespace-nowrap">
                        {schedTimeFormatted}
                      </td>

                      {/* Truck Registration */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-white text-sm tracking-wider group-hover:text-emerald-400 transition-colors">
                            {dep.truck_number}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                        </div>
                      </td>

                      {/* Route */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                            <span className="text-slate-400">{dep.origin}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-emerald-300 font-extrabold">{dep.destination}</span>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-bold">
                          {dep.vehicle_category}
                        </span>
                      </td>

                      {/* Dock Bay Allocation */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-black text-xs">
                          {dep.dock_bay}
                        </span>
                      </td>

                      {/* Driver Pilot */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                          <User className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{dep.driver_name}</span>
                        </div>
                      </td>

                      {/* LR Number */}
                      <td className="py-3.5 px-4 font-bold text-slate-400 whitespace-nowrap">
                        {dep.lr_pod_number}
                      </td>

                      {/* Cargo Weight */}
                      <td className="py-3.5 px-4 font-bold text-slate-300 whitespace-nowrap">
                        {dep.cargo_weight}
                      </td>

                      {/* Departure Status Badge */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-lg border font-black text-xs ${theme.badge}`}>
                          {dep.status === 'DELAYED' ? `DELAYED (+${dep.delay_minutes || 25}m)` : theme.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Dock Bay & Status Management Modal ──────────────────────── */}
      {activeDeparture && (
        <Dialog open={Boolean(activeDeparture)} onOpenChange={() => setActiveDeparture(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md rounded-2xl shadow-2xl font-sans">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-white flex items-center justify-between font-mono">
                <span>Gate Control: {activeDeparture.truck_number}</span>
                <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {activeDeparture.trip_code}
                </span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateBay} className="space-y-4 py-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Destination Route:</span>
                  <strong className="text-white">{activeDeparture.origin} → {activeDeparture.destination}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Assigned Driver:</span>
                  <strong className="text-emerald-400">{activeDeparture.driver_name}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>E-Way / LR #:</span>
                  <strong className="text-slate-300 font-mono">{activeDeparture.lr_pod_number}</strong>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Warehouse Dock Bay</label>
                <select
                  value={newBay}
                  onChange={(e) => setNewBay(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs h-9 mt-1 px-3 rounded-xl text-white font-bold"
                >
                  <option value="Bay #01">Bay #01 (Primary FTL Loading)</option>
                  <option value="Bay #02">Bay #02 (Secondary FTL Loading)</option>
                  <option value="Bay #03">Bay #03 (Heavy Container Bay)</option>
                  <option value="Bay #04">Bay #04 (Express Cross-Dock)</option>
                  <option value="Bay #05">Bay #05 (Unloading & Verification)</option>
                  <option value="Bay #06">Bay #06 (Inspection Bay)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Departure Gate Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs h-9 mt-1 px-3 rounded-xl text-white font-bold"
                >
                  <option value="GATE OPEN">GATE OPEN (Dock ready, awaiting truck)</option>
                  <option value="BOARDING">BOARDING / LOADING (Cargo loading in progress)</option>
                  <option value="DEPARTED">DEPARTED (Truck left warehouse on highway)</option>
                  <option value="DELAYED">DELAYED (SLA departure delayed)</option>
                  <option value="SCHEDULED">SCHEDULED (Normal queue)</option>
                </select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setActiveDeparture(null)} className="border-slate-800 rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs">
                  Save Dock Assignment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
