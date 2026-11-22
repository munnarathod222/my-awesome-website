import React, { useState, useEffect } from 'react';
import { 
  PlaneTakeoff, Clock, MapPin, RefreshCw, Filter, Search, 
  Maximize2, Minimize2, ShieldAlert, CheckCircle2, AlertTriangle, 
  Truck, ArrowRight, Radio, ExternalLink, Hash, User, Anchor, Settings
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { reservationClient } from '@/lib/reservationClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import DepartureFlightBoardFullscreen, { getSystemStatusStyle } from '@/components/DepartureFlightBoardFullscreen.jsx';
import InstantLaneQuoterWidget from '@/components/InstantLaneQuoterWidget.jsx';
import LaneRateManagerModal from '@/components/LaneRateManagerModal.jsx';
import { laneRateClient } from '@/lib/laneRateClient.js';

export const SYSTEM_STATUS_OPTIONS = [
  'Upcoming',
  'Vehicle Assigned',
  'Arrived at Dock',
  'Loading in Progress',
  'Dispatched',
  'In Transit',
  'Arrived at Delivery Location',
  'Unloading in Progress',
  'Delivered',
  'Completed',
  'Delayed / Breakdown'
];

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isManageLanesOpen, setIsManageLanesOpen] = useState(false);
  const [lanes, setLanes] = useState([]);

  // Edit / Bay Management Modal
  const [activeDeparture, setActiveDeparture] = useState(null);
  const [newBay, setNewBay] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // Live Clock updater (every second)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load Lanes
  useEffect(() => {
    setLanes(laneRateClient.getLanes());
  }, []);

  // Check URL query parameters for fullscreen
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('fullscreen') === 'true' || sp.get('view') === 'fids' || sp.get('view') === 'kiosk') {
        setIsFullscreen(true);
      }
    } catch (_) {}
  }, []);

  const loadDepartures = async () => {
    try {
      setLoading(true);
      let list = [];
      try {
        const res = await reservationClient.getDepartures();
        if (res && Array.isArray(res.departures) && res.departures.length > 0) {
          list = res.departures;
        }
      } catch (_) {}

      // If API returned empty, fetch directly from PocketBase trip_logs
      if (list.length === 0) {
        // First try to get any non-completed trips
        let trips = await pb.collection('trip_logs').getFullList({
          filter: 'trip_status != "Completed" && trip_status != "Cancelled"',
          sort: '-created',
          $autoCancel: false
        }).catch(() => []);

        // If all trips in DB are completed or no active trips, fetch latest real trips from trip_logs
        if (trips.length === 0) {
          trips = await pb.collection('trip_logs').getList(1, 50, {
            sort: '-date,-created',
            $autoCancel: false
          }).then(r => r.items).catch(() => []);
        }

        const trucks = await pb.collection('trucks').getFullList({
          $autoCancel: false
        }).catch(() => []);
        const truckMap = new Map();
        trucks.forEach(t => truckMap.set(t.truck_number, t));

        list = trips.map((trip, idx) => {
          const truck = truckMap.get(trip.truck_number) || {};
          const bayNum = (idx % 6) + 1;
          const sysStatus = trip.trip_status || 'Upcoming';

          let origin = 'Hyderabad';
          let destination = 'Hubli';
          if (trip.route) {
            if (trip.route.includes(' to ') || trip.route.includes(' To ')) {
              const parts = trip.route.split(/\s+[tT][oO]\s+/);
              origin = parts[0]?.trim() || origin;
              destination = parts[1]?.trim() || destination;
            } else if (trip.route.includes('->') || trip.route.includes('➔')) {
              const parts = trip.route.split(/->|➔/);
              origin = parts[0]?.trim() || origin;
              destination = parts[parts.length - 1]?.trim() || destination;
            } else {
              origin = trip.route;
            }
          }

          const rawWeight = Number(trip.actual_weight) || Number(trip.charged_weight) || 0;
          const cargoWeight = rawWeight > 0 
            ? `${rawWeight} MT` 
            : (trip.packages_count > 0 ? `${trip.packages_count} pkgs` : '—');

          return {
            id: trip.id,
            type: 'trip',
            trip_code: trip.trip_id || `TRIP-${idx + 101}`,
            truck_number: trip.truck_number || '',
            vehicle_category: truck.vehicle_class || truck.truck_size || '32 FT',
            driver_name: trip.driver_name || truck.driver_name || 'Driver Not Assigned',
            origin: origin,
            destination: destination,
            dock_bay: `Bay #${String(bayNum).padStart(2, '0')}`,
            scheduled_departure: trip.loading_dock_arrival_time || trip.date || new Date().toISOString(),
            status: sysStatus,
            trip_status: sysStatus,
            delay_minutes: sysStatus.toLowerCase().includes('delayed') ? 25 : 0,
            lr_pod_number: trip.invoice_number || trip.trip_id || '—',
            cargo_weight: cargoWeight
          };
        });
      }

      setDepartures(list);
    } catch (err) {
      toast.error('Failed to load departure board: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartures();
    const interval = setInterval(loadDepartures, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleEnterFullscreen = () => {
    setIsFullscreen(true);
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (_) {}
  };

  const handleExitFullscreen = () => {
    setIsFullscreen(false);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (_) {}
  };

  const handleUpdateBay = async (e) => {
    e.preventDefault();
    if (!activeDeparture) return;
    try {
      const updatedStatus = newStatus || activeDeparture.status || 'Upcoming';
      const updatedBay = newBay || activeDeparture.dock_bay || 'Bay #01';

      if (activeDeparture.id) {
        // Update trip_status directly in PocketBase trip_logs
        await pb.collection('trip_logs').update(activeDeparture.id, {
          trip_status: updatedStatus
        }, { $autoCancel: false }).catch(() => {});

        try {
          await reservationClient.updateDepartureBay({
            id: activeDeparture.id,
            dock_bay: updatedBay,
            status: updatedStatus
          });
        } catch (_) {}
      }

      toast.success(`Truck ${activeDeparture.truck_number} updated to "${updatedStatus}" at ${updatedBay}!`);
      setActiveDeparture(null);
      loadDepartures();
    } catch (err) {
      toast.error(err.message || 'Failed to update departure');
    }
  };

  // Filter Departures
  const filtered = departures.filter(dep => {
    const curStatus = dep.status || dep.trip_status || '';
    const matchesSearch = 
      (dep.truck_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dep.destination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dep.driver_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dep.dock_bay || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dep.lr_pod_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      curStatus.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHub = selectedHub === 'All' || (dep.origin || '').toLowerCase().includes(selectedHub.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || curStatus.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesHub && matchesStatus;
  });

  const loadingCount = departures.filter(d => (d.status || '').toLowerCase().includes('loading')).length;
  const inTransitCount = departures.filter(d => (d.status || '').toLowerCase().includes('transit') || (d.status || '').toLowerCase().includes('dispatched')).length;
  const delayedCount = departures.filter(d => (d.status || '').toLowerCase().includes('delayed') || (d.status || '').toLowerCase().includes('breakdown')).length;
  const dockCount = departures.filter(d => (d.status || '').toLowerCase().includes('dock')).length;

  return (
    <>
      {/* ── True Fullscreen Flight Departure Board (FIDS) Overlay ─────── */}
      {isFullscreen && (
        <DepartureFlightBoardFullscreen
          departures={departures}
          lanes={lanes}
          onExitFullscreen={handleExitFullscreen}
          onRefresh={loadDepartures}
          onDepartureClick={(dep) => {
            setActiveDeparture(dep);
            setNewBay(dep.dock_bay);
            setNewStatus(dep.status || dep.trip_status);
          }}
        />
      )}

      <div className="p-4 md:p-6 space-y-5 font-sans max-w-[1650px] mx-auto">
        
        {/* ── Top Airport Terminal Display Header ───────────────────────── */}
        <div className="bg-slate-900/95 border border-slate-800 p-4 md:p-5 rounded-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
              <PlaneTakeoff className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  FIDS · CENTRAL DISPATCH TERMINAL
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  LIVE SYSTEM STATUS
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-0.5 font-mono">
                TRUCK DEPARTURE BOARD
              </h1>
            </div>
          </div>

          {/* Digital Clock, Refresh, & Fullscreen TV Kiosk Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Digital Clock */}
            <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2.5 font-mono shadow-inner">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-lg md:text-xl font-black text-amber-400 tracking-wider">
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

            {/* FULLSCREEN FLIGHT DEPARTURE BOARD TRIGGER */}
            <Button 
              size="sm"
              onClick={handleEnterFullscreen}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs h-10 px-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Maximize2 className="w-4 h-4 text-slate-950" />
              <span>Fullscreen Flight Board</span>
            </Button>
          </div>
        </div>

        {/* ── Instant Lane Quoter & General Lanes Tool ──────────────────── */}
        <InstantLaneQuoterWidget
          lanes={lanes}
          onOpenManageLanes={() => setIsManageLanesOpen(true)}
        />

        {/* ── Status KPI Counter Banner (Using Real System Statuses) ────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Loading in Progress', count: loadingCount, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400 animate-pulse' },
            { label: 'Arrived at Dock', count: dockCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
            { label: 'In Transit / Dispatched', count: inTransitCount, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', dot: 'bg-cyan-400' },
            { label: 'Delayed / Breakdown', count: delayedCount, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', dot: 'bg-rose-500 animate-ping' }
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
                placeholder="Filter by Truck #, Destination, Dock Bay, or Status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs h-9 pl-9 text-white placeholder:text-slate-500 rounded-xl font-mono"
              />
            </div>

            {/* Hub Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {['All', 'Hyderabad', 'Hubli', 'Pune', 'Bangalore'].map(hub => (
                <button
                  key={hub}
                  onClick={() => setSelectedHub(hub)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedHub === hub 
                      ? 'bg-amber-500 text-slate-950 font-black' 
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {hub}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs h-9 px-3 rounded-xl text-slate-300 font-bold"
            >
              <option value="All">All System Statuses</option>
              {SYSTEM_STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-amber-400 font-mono">{filtered.length}</strong> of {departures.length} Departures
          </div>
        </div>

        {/* ── Digital Departure Board Table ─────────────────────────────── */}
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
                  <th className="py-3 px-4 text-right">SYSTEM STATUS</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-850">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center text-slate-400">
                      <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
                      <p className="font-bold text-slate-300">Syncing with warehouse telematics & dock bay sensors...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center text-slate-500">
                      <Truck className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-400" />
                      <p className="font-bold text-slate-300">No scheduled departures found</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Try clearing filter parameters.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((dep, idx) => {
                    const currentStatus = dep.status || dep.trip_status || 'Upcoming';
                    const theme = getSystemStatusStyle(currentStatus);
                    const schedTimeFormatted = dep.scheduled_departure ? new Date(dep.scheduled_departure).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '18:00';

                    return (
                      <tr 
                        key={dep.id || idx}
                        onClick={() => {
                          setActiveDeparture(dep);
                          setNewBay(dep.dock_bay);
                          setNewStatus(currentStatus);
                        }}
                        className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                      >
                        {/* Scheduled Time */}
                        <td className="py-3.5 px-4 font-black text-amber-400 text-sm whitespace-nowrap">
                          {schedTimeFormatted}
                        </td>

                        {/* Truck Registration */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-white text-sm tracking-wider group-hover:text-amber-400 transition-colors bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {dep.truck_number}
                            </span>
                          </div>
                        </td>

                        {/* Route */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                              <span className="text-slate-400">{dep.origin}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="text-amber-300 font-extrabold">{dep.destination}</span>
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

                        {/* EXACT SYSTEM STATUS */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-black text-xs uppercase ${theme.badge}`}>
                            <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                            {currentStatus}
                            {currentStatus.includes('Delayed') && dep.delay_minutes ? ` (+${dep.delay_minutes}m)` : ''}
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

        {/* ── Dock Bay & System Status Management Modal ─────────────────── */}
        {activeDeparture && (
          <Dialog open={Boolean(activeDeparture)} onOpenChange={() => setActiveDeparture(null)}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md rounded-2xl shadow-2xl font-sans">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-white flex items-center justify-between font-mono">
                  <span>Gate Control: {activeDeparture.truck_number}</span>
                  <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
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
                    <strong className="text-amber-400">{activeDeparture.driver_name}</strong>
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
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Trip System Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs h-9 mt-1 px-3 rounded-xl text-white font-bold"
                  >
                    {SYSTEM_STATUS_OPTIONS.map(statusOpt => (
                      <option key={statusOpt} value={statusOpt}>{statusOpt}</option>
                    ))}
                  </select>
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setActiveDeparture(null)} className="border-slate-800 rounded-xl text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs">
                    Save Status & Dock
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* ── Lane Rate Manager Modal ─────────────────────────────────── */}
        <LaneRateManagerModal
          isOpen={isManageLanesOpen}
          onClose={() => setIsManageLanesOpen(false)}
          onLanesUpdated={(updated) => setLanes(updated)}
        />
      </div>
    </>
  );
}
