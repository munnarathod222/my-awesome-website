import React, { useState, useEffect, useRef } from 'react';
import { 
  PlaneTakeoff, Clock, Minimize2, RefreshCw, ArrowRight, User, 
  Truck, ShieldAlert, Sparkles, ChevronLeft, ChevronRight, Pause, Play,
  Search, Copy, Check, Share2, IndianRupee, Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRateBadge, laneRateClient } from '@/lib/laneRateClient.js';
import { toast } from 'sonner';

// System Status Visual Theme Configuration
export const SYSTEM_STATUS_STYLES = {
  'Loading in Progress': {
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
    dot: 'bg-amber-400 animate-ping',
    text: 'text-amber-400',
    icon: '🟡'
  },
  'Loading': {
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
    dot: 'bg-amber-400 animate-ping',
    text: 'text-amber-400',
    icon: '🟡'
  },
  'Arrived at Dock': {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    icon: '🟢'
  },
  'Delayed / Breakdown': {
    badge: 'bg-rose-500/25 text-rose-300 border-rose-500/50 animate-pulse',
    dot: 'bg-rose-500 animate-ping',
    text: 'text-rose-400',
    icon: '🔴'
  },
  'Delayed': {
    badge: 'bg-rose-500/25 text-rose-300 border-rose-500/50 animate-pulse',
    dot: 'bg-rose-500 animate-ping',
    text: 'text-rose-400',
    icon: '🔴'
  },
  'Dispatched': {
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    dot: 'bg-cyan-400',
    text: 'text-cyan-400',
    icon: '🔵'
  },
  'In Transit': {
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    dot: 'bg-sky-400',
    text: 'text-sky-400',
    icon: '🔵'
  },
  'Unloading in Progress': {
    badge: 'bg-orange-500/25 text-orange-300 border-orange-500/50 animate-pulse',
    dot: 'bg-orange-400 animate-ping',
    text: 'text-orange-400',
    icon: '🟠'
  },
  'Unloading': {
    badge: 'bg-orange-500/25 text-orange-300 border-orange-500/50 animate-pulse',
    dot: 'bg-orange-400 animate-ping',
    text: 'text-orange-400',
    icon: '🟠'
  },
  'Arrived at Delivery Location': {
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    dot: 'bg-teal-400',
    text: 'text-teal-300',
    icon: '🟢'
  },
  'Vehicle Assigned': {
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    dot: 'bg-purple-400',
    text: 'text-purple-300',
    icon: '🟣'
  },
  'Upcoming': {
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    dot: 'bg-slate-500',
    text: 'text-slate-400',
    icon: '⚪'
  },
  'Delivered': {
    badge: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/40',
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
    icon: '🟢'
  },
  'Completed': {
    badge: 'bg-emerald-800/20 text-emerald-200 border-emerald-800/40',
    dot: 'bg-emerald-500',
    text: 'text-emerald-200',
    icon: '🟢'
  },
  'Cancelled': {
    badge: 'bg-slate-900 text-slate-500 border-slate-800 line-through',
    dot: 'bg-slate-600',
    text: 'text-slate-500',
    icon: '⚪'
  }
};

export const getSystemStatusStyle = (status) => {
  if (!status) return SYSTEM_STATUS_STYLES['Upcoming'];
  const trimmed = status.trim();
  if (SYSTEM_STATUS_STYLES[trimmed]) {
    return SYSTEM_STATUS_STYLES[trimmed];
  }
  // Case-insensitive lookup
  const matchKey = Object.keys(SYSTEM_STATUS_STYLES).find(
    k => k.toLowerCase() === trimmed.toLowerCase()
  );
  if (matchKey) {
    return SYSTEM_STATUS_STYLES[matchKey];
  }

  // Fallback
  return {
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    dot: 'bg-slate-400',
    text: 'text-slate-300',
    icon: '⚪'
  };
};

const ITEMS_PER_PAGE = 10;
const PAGE_INTERVAL_MS = 15000; // 15 seconds per page rotation

export default function DepartureFlightBoardFullscreen({ 
  departures = [], 
  lanes = [], 
  onExitFullscreen, 
  onRefresh, 
  onDepartureClick 
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(0);
  const [isAutoPaging, setIsAutoPaging] = useState(true);
  const [pageProgress, setPageProgress] = useState(0);
  const [quickQuoteLane, setQuickQuoteLane] = useState(null);
  const [quoteCopied, setQuoteCopied] = useState(false);

  // Digital Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalPages = Math.max(1, Math.ceil(departures.length / ITEMS_PER_PAGE));

  // Auto-Paging Carousel Logic
  useEffect(() => {
    if (!isAutoPaging || totalPages <= 1) {
      setPageProgress(0);
      return;
    }

    const stepMs = 200;
    const increment = (stepMs / PAGE_INTERVAL_MS) * 100;

    const interval = setInterval(() => {
      setPageProgress(prev => {
        if (prev >= 100) {
          setCurrentPage(curr => (curr + 1) % totalPages);
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isAutoPaging, totalPages]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onExitFullscreen?.();
      } else if (e.key === ' ' || e.code === 'Space') {
        setIsAutoPaging(prev => !prev);
      } else if (e.key === 'ArrowRight') {
        setCurrentPage(curr => (curr + 1) % totalPages);
        setPageProgress(0);
      } else if (e.key === 'ArrowLeft') {
        setCurrentPage(curr => (curr - 1 + totalPages) % totalPages);
        setPageProgress(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitFullscreen, totalPages]);

  const displayedDepartures = departures.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const loadingCount = departures.filter(d => (d.status || '').toLowerCase().includes('loading')).length;
  const inTransitCount = departures.filter(d => (d.status || '').toLowerCase().includes('transit') || (d.status || '').toLowerCase().includes('dispatched')).length;
  const delayedCount = departures.filter(d => (d.status || '').toLowerCase().includes('delayed') || (d.status || '').toLowerCase().includes('breakdown')).length;
  const dockCount = departures.filter(d => (d.status || '').toLowerCase().includes('dock')).length;

  const handleCopyQuote = (lane) => {
    if (!lane) return;
    const text = laneRateClient.generateWhatsAppQuote(lane);
    navigator.clipboard.writeText(text);
    setQuoteCopied(true);
    toast.success(`Quote for ${lane.origin} ➔ ${lane.destination} copied!`);
    setTimeout(() => setQuoteCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] text-white flex flex-col justify-between overflow-hidden font-mono select-none">
      
      {/* ── Top Airport Terminal Solari Header ─────────────────────────── */}
      <div className="bg-[#0b0e17] border-b border-slate-800/90 px-6 py-4 flex items-center justify-between shadow-2xl shrink-0">
        
        {/* Terminal Title & Live Ping */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black">
            <PlaneTakeoff className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded border border-amber-500/40">
                FIDS · CENTRAL DISPATCH FLIGHT BOARD
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                TERMINAL LIVE
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wider mt-0.5 font-mono">
              JAI BHAVANI CARGO · DEPARTURES / प्रस्थान
            </h1>
          </div>
        </div>

        {/* Live Counters */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Loading</span>
            <span className="text-base font-black text-amber-400 font-mono">{loadingCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">At Dock</span>
            <span className="text-base font-black text-emerald-400 font-mono">{dockCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">In Transit</span>
            <span className="text-base font-black text-cyan-400 font-mono">{inTransitCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Delayed</span>
            <span className="text-base font-black text-rose-400 font-mono">{delayedCount}</span>
          </div>
        </div>

        {/* Digital Split-Flap Clock & Exit Controls */}
        <div className="flex items-center gap-3">
          {/* Digital Clock */}
          <div className="bg-[#05070b] border border-amber-500/30 px-5 py-2.5 rounded-xl flex items-center gap-3 shadow-inner">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-2xl md:text-3xl font-black text-amber-400 tracking-wider">
                {currentTime.toLocaleTimeString('en-IN', { hour12: false })}
              </span>
              <span className="text-xs font-black text-amber-500/80 ml-1.5">IST</span>
            </div>
            <span className="text-xs text-slate-400 font-bold border-l border-slate-800 pl-3">
              {currentTime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Carousel Play/Pause */}
          {totalPages > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoPaging(!isAutoPaging)}
              title={isAutoPaging ? 'Pause rotation (Space)' : 'Resume rotation (Space)'}
              className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white h-11 px-3 rounded-xl"
            >
              {isAutoPaging ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
            </Button>
          )}

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            title="Refresh Departures Data"
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white h-11 px-3 rounded-xl"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          {/* Exit Fullscreen */}
          <Button
            size="sm"
            onClick={onExitFullscreen}
            className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs h-11 px-4 rounded-xl shadow-lg shadow-rose-600/30"
          >
            <Minimize2 className="w-4 h-4 mr-1.5" />
            Exit Fullscreen (Esc)
          </Button>
        </div>
      </div>

      {/* ── Auto-Page Progress Indicator Bar ──────────────────────────── */}
      {totalPages > 1 && (
        <div className="w-full bg-slate-950 h-1 overflow-hidden">
          <div 
            className="bg-amber-400 h-full transition-all duration-200 ease-linear shadow-[0_0_8px_rgba(245,158,11,0.8)]"
            style={{ width: `${pageProgress}%` }}
          />
        </div>
      )}

      {/* ── Main Solari Split-Flap Table ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-3 flex flex-col justify-start">
        <div className="w-full border border-slate-800 rounded-2xl overflow-hidden bg-[#0a0d14] shadow-2xl">
          <table className="w-full text-left text-sm font-mono border-collapse">
            {/* Split-Flap Table Header */}
            <thead className="bg-[#101420] text-amber-400/90 font-black text-xs tracking-wider uppercase border-b-2 border-slate-800">
              <tr>
                <th className="py-3.5 px-4 w-28">TIME</th>
                <th className="py-3.5 px-4 w-36">TRUCK #</th>
                <th className="py-3.5 px-4">DESTINATION ROUTE</th>
                <th className="py-3.5 px-4 w-44">VEHICLE TYPE</th>
                <th className="py-3.5 px-4 w-28 text-center">DOCK BAY</th>
                <th className="py-3.5 px-4 w-44">DRIVER PILOT</th>
                <th className="py-3.5 px-4 w-36">LR / POD</th>
                <th className="py-3.5 px-4 w-28">CARGO</th>
                <th className="py-3.5 px-4 w-56 text-right">SYSTEM STATUS</th>
              </tr>
            </thead>

            {/* Split-Flap Table Body */}
            <tbody className="divide-y divide-slate-800/80">
              {displayedDepartures.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-24 text-center text-slate-500 font-bold text-base">
                    No active truck departures scheduled in terminal queue.
                  </td>
                </tr>
              ) : (
                displayedDepartures.map((dep, idx) => {
                  const currentStatus = dep.status || dep.trip_status || 'Upcoming';
                  const theme = getSystemStatusStyle(currentStatus);
                  const schedTime = dep.scheduled_departure 
                    ? new Date(dep.scheduled_departure).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) 
                    : '18:00';

                  return (
                    <tr 
                      key={dep.id || idx}
                      onClick={() => onDepartureClick?.(dep)}
                      className="hover:bg-slate-900/70 transition-colors cursor-pointer group"
                    >
                      {/* Sched Time */}
                      <td className="py-4 px-4 font-black text-amber-400 text-base whitespace-nowrap tracking-wider">
                        {schedTime}
                      </td>

                      {/* Truck Registration */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-base tracking-widest group-hover:text-amber-400 transition-colors bg-[#05070b] px-2 py-1 rounded border border-slate-800 shadow-inner">
                            {dep.truck_number}
                          </span>
                        </div>
                      </td>

                      {/* Destination Route */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-white font-extrabold text-sm">
                          <span className="text-slate-300">{dep.origin || 'Hyderabad'}</span>
                          <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-amber-300 font-black tracking-wide">{dep.destination || 'Hubli'}</span>
                        </div>
                      </td>

                      {/* Vehicle Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-[#05070b] border border-slate-800 text-slate-300 text-xs font-bold">
                          {dep.vehicle_category || '32FT Container'}
                        </span>
                      </td>

                      {/* Dock Bay */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-black text-xs">
                          {dep.dock_bay || 'Bay #01'}
                        </span>
                      </td>

                      {/* Driver */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-300 font-bold text-xs">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{dep.driver_name || 'Assigned Driver'}</span>
                        </div>
                      </td>

                      {/* LR Number */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-400 font-bold text-xs">
                        {dep.lr_pod_number || 'LR-PENDING'}
                      </td>

                      {/* Cargo Weight */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-300 font-bold text-xs">
                        {dep.cargo_weight || '14.5 MT'}
                      </td>

                      {/* EXACT SYSTEM STATUS */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-black text-xs uppercase tracking-wider ${theme.badge}`}>
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
      </div>

      {/* ── Bottom Flight Board Ticker & Quick Quote Bar ───────────────── */}
      <div className="bg-[#0b0e17] border-t border-slate-800/90 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-2xl">
        
        {/* Ticker Indicator & Page Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-lg text-xs font-black">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            LANE SPOT RATES
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <button 
                onClick={() => { setCurrentPage(c => (c - 1 + totalPages) % totalPages); setPageProgress(0); }}
                className="p-1 hover:text-white rounded bg-slate-900 border border-slate-800"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold font-mono px-1">PAGE {currentPage + 1} OF {totalPages}</span>
              <button 
                onClick={() => { setCurrentPage(c => (c + 1) % totalPages); setPageProgress(0); }}
                className="p-1 hover:text-white rounded bg-slate-900 border border-slate-800"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Scrolling Lane Ticker Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1 max-w-4xl px-2">
          {lanes.map(lane => {
            const badge = formatRateBadge(lane.min_rate, lane.max_rate);
            return (
              <button
                key={lane.id}
                onClick={() => setQuickQuoteLane(lane)}
                className="bg-[#05070b] border border-slate-800 hover:border-amber-500/60 px-3 py-1 rounded-xl flex items-center gap-2 text-xs transition-all shrink-0 group"
              >
                <span className="text-slate-300 font-bold group-hover:text-white">
                  {lane.origin.slice(0, 3)} ➔ {lane.destination.slice(0, 3)}:
                </span>
                <span className="text-amber-400 font-black">₹{badge}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-400 font-bold hidden xl:block">
          Click any lane to quote instantly • Press <kbd className="bg-slate-900 border border-slate-800 px-1 py-0.5 rounded text-amber-400">Space</kbd> to Pause
        </div>
      </div>

      {/* ── Instant Quote Modal in Fullscreen ───────────────────────────── */}
      {quickQuoteLane && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0e17] border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-amber-400 font-black text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                INSTANT CUSTOMER FREIGHT QUOTE
              </span>
              <button 
                onClick={() => setQuickQuoteLane(null)} 
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-[#05070b] p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Route Corridor:</span>
                <span className="text-lg font-black text-white">
                  {quickQuoteLane.origin} ➔ {quickQuoteLane.destination}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Vehicle Spec:</span>
                <span className="text-emerald-300 font-bold text-xs">{quickQuoteLane.vehicle_type}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                <span className="text-slate-400 text-xs">Recommended Spot Rate:</span>
                <span className="text-2xl font-black text-amber-400">
                  ₹{(quickQuoteLane.min_rate || 0).toLocaleString('en-IN')} - ₹{(quickQuoteLane.max_rate || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Transit SLA:</span>
                <span className="text-white font-bold">{quickQuoteLane.transit_hours}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickQuoteLane(null)}
                className="border-slate-800 text-slate-400 text-xs rounded-xl"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => handleCopyQuote(quickQuoteLane)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20"
              >
                {quoteCopied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {quoteCopied ? 'Copied to Clipboard!' : 'Copy WhatsApp Quote'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
