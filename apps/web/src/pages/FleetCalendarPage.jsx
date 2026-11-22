import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Truck, Clock, ShieldAlert, CheckCircle2, 
  AlertTriangle, Filter, Plus, Wrench, ChevronLeft, ChevronRight,
  MapPin, RefreshCw, X, ShieldX, User, Info, FileText, ArrowRight,
  Repeat, CalendarDays, Compass, Check, Search, Phone, Mail, DollarSign
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { reservationClient } from '@/lib/reservationClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

const STATUS_CONFIG = {
  'Available': { 
    bg: 'bg-emerald-500/15 hover:bg-emerald-500/25', 
    text: 'text-emerald-400', 
    border: 'border-emerald-500/30', 
    dot: 'bg-emerald-400',
    label: 'Available' 
  },
  'Booked': { 
    bg: 'bg-blue-500/20 hover:bg-blue-500/30', 
    text: 'text-blue-300', 
    border: 'border-blue-500/40', 
    dot: 'bg-blue-400',
    label: 'Confirmed Booked' 
  },
  'Booking Requested': { 
    bg: 'bg-amber-500/20 hover:bg-amber-500/30', 
    text: 'text-amber-300', 
    border: 'border-amber-500/40', 
    dot: 'bg-amber-400',
    label: 'Booking Request' 
  },
  'Loading': { 
    bg: 'bg-teal-500/20 hover:bg-teal-500/30', 
    text: 'text-teal-300', 
    border: 'border-teal-500/40', 
    dot: 'bg-teal-400',
    label: 'Loading at Dock' 
  },
  'In Transit': { 
    bg: 'bg-purple-500/20 hover:bg-purple-500/30', 
    text: 'text-purple-300', 
    border: 'border-purple-500/40', 
    dot: 'bg-purple-400',
    label: 'In Transit' 
  },
  'Unloading': { 
    bg: 'bg-cyan-500/20 hover:bg-cyan-500/30', 
    text: 'text-cyan-300', 
    border: 'border-cyan-500/40', 
    dot: 'bg-cyan-400',
    label: 'Unloading at Dock' 
  },
  'Waiting': { 
    bg: 'bg-yellow-500/20 hover:bg-yellow-500/30', 
    text: 'text-yellow-300', 
    border: 'border-yellow-500/40', 
    dot: 'bg-yellow-400',
    label: 'Detained / Waiting' 
  },
  'Expected Available': { 
    bg: 'bg-emerald-500/10 border-dashed hover:bg-emerald-500/20', 
    text: 'text-emerald-300', 
    border: 'border-emerald-400/40', 
    dot: 'bg-emerald-300',
    label: 'Expected Available' 
  },
  'Maintenance': { 
    bg: 'bg-orange-500/20 hover:bg-orange-500/30', 
    text: 'text-orange-300', 
    border: 'border-orange-500/40', 
    dot: 'bg-orange-400',
    label: 'Maintenance' 
  },
  'Breakdown': { 
    bg: 'bg-rose-500/25 hover:bg-rose-500/35', 
    text: 'text-rose-300', 
    border: 'border-rose-500/50', 
    dot: 'bg-rose-400',
    label: 'Breakdown' 
  },
  'Documents Expired': { 
    bg: 'bg-red-500/30 hover:bg-red-500/40', 
    text: 'text-red-300', 
    border: 'border-red-500/60', 
    dot: 'bg-red-500',
    label: 'Docs Expired' 
  },
  'Schedule Conflict': { 
    bg: 'bg-red-600/30 animate-pulse', 
    text: 'text-red-200', 
    border: 'border-red-500', 
    dot: 'bg-red-400',
    label: 'Conflict' 
  },
};

export default function FleetCalendarPage() {
  let currentUser = null;
  try {
    const auth = useAuth();
    currentUser = auth?.currentUser;
  } catch (e) {
    try {
      currentUser = JSON.parse(localStorage.getItem('app_auth_user'));
    } catch (err) {}
  }

  const [dateOffset, setDateOffset] = useState(0); // Offset in days from today
  const [viewDaysCount, setViewDaysCount] = useState(7); // 7 (weekly), 14 (bi-weekly), 30 (monthly)
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedTruck, setSelectedTruck] = useState(null);

  // Quick Reservation Modal State
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [reserveForm, setReserveForm] = useState({
    truck_number: '',
    vehicle_category: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    origin: '',
    destination: '',
    loading_datetime: '',
    reservation_type: 'Confirmed',
    indicative_freight: '',
    cargo_weight_tons: '14.5',
    notes: ''
  });

  // Manual Block Modal State
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({
    truck_number: '',
    block_type: 'Maintenance',
    reason: '',
    start_time: new Date().toISOString().slice(0, 16),
    end_time: new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16)
  });

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const res = await reservationClient.getCalendar('weekly');
      setTimelineData(res.timeline || []);
    } catch (err) {
      toast.error('Failed to load fleet calendar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
  }, []);

  // Compute date array based on dateOffset & viewDaysCount
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + dateOffset);

  const days = Array.from({ length: viewDaysCount }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    return {
      date: d,
      dateString: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      isToday
    };
  });

  const startDateFormatted = days[0]?.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const endDateFormatted = days[days.length - 1]?.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Filter trucks
  const filteredTimeline = timelineData.filter(t => {
    const matchesSearch = 
      (t.truck_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.current_location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.predicted_location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.current_status || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || t.vehicle_category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || t.current_status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Extract unique vehicle categories for quick filter
  const categories = ['All', ...new Set(timelineData.map(t => t.vehicle_category).filter(Boolean))];

  // Helper to open quick reservation on a specific truck + date
  const handleOpenReserve = (truck, dateObj) => {
    const dateStr = dateObj ? dateObj.dateString : new Date().toISOString().split('T')[0];
    const defaultTime = `${dateStr}T09:00`;
    setReserveForm({
      truck_number: truck.truck_number,
      vehicle_category: truck.vehicle_category || '32FT SXL',
      customer_name: currentUser?.name || currentUser?.full_name || '',
      customer_phone: currentUser?.phone || '',
      customer_email: currentUser?.email || '',
      origin: truck.predicted_location || truck.current_location || 'Hyderabad Hub',
      destination: '',
      loading_datetime: defaultTime,
      reservation_type: 'Confirmed',
      indicative_freight: '32000',
      cargo_weight_tons: String(truck.capacity_tons || 14.5),
      notes: ''
    });
    setIsReserveModalOpen(true);
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    if (!reserveForm.customer_name || !reserveForm.destination) {
      toast.warning('Please enter customer name and destination.');
      return;
    }
    try {
      await reservationClient.createReservation({
        ...reserveForm,
        created_by: currentUser?.full_name || currentUser?.name || 'Dispatcher'
      });
      toast.success(`Reservation Confirmed for ${reserveForm.truck_number} → ${reserveForm.destination}!`);
      setIsReserveModalOpen(false);
      loadCalendar();
    } catch (err) {
      toast.error(err.message || 'Failed to create reservation');
    }
  };

  const handleCreateBlock = async (e) => {
    e.preventDefault();
    if (!blockForm.truck_number || !blockForm.reason) {
      toast.warning('Please select a truck and enter a reason.');
      return;
    }
    try {
      await reservationClient.createBlock({
        ...blockForm,
        created_by: currentUser?.full_name || currentUser?.name || 'Dispatcher'
      });
      toast.success(`Availability block placed on ${blockForm.truck_number}.`);
      setIsBlockModalOpen(false);
      loadCalendar();
    } catch (err) {
      toast.error(err.message || 'Failed to create block');
    }
  };

  // Determine slot status for each day
  const getSlotInfo = (truck, dayObj, dayIndex) => {
    const dayStr = dayObj.dateString;

    // 1. Check for manual maintenance block on this date
    if (truck.blocks && truck.blocks.length > 0) {
      const activeBlock = truck.blocks.find(b => {
        const start = (b.start_time || '').slice(0, 10);
        const end = (b.end_time || '').slice(0, 10);
        return dayStr >= start && dayStr <= end;
      });
      if (activeBlock) {
        return {
          type: 'block',
          label: `🔧 ${activeBlock.block_type || 'Maintenance'}`,
          sub: activeBlock.reason || 'Blocked',
          status: 'Maintenance',
          clickable: false
        };
      }
    }

    // 2. Check for reservations (Confirmed, Allocated, Booking Requested, or Held)
    if (truck.reservations && truck.reservations.length > 0) {
      const res = truck.reservations.find(r => {
        if (r.status === 'Cancelled' || r.status === 'Rejected') return false;
        const loadD = (r.loading_datetime || r.reserved_from || '').slice(0, 10);
        const unloadD = (r.expected_unloading_datetime || r.reserved_to || loadD).slice(0, 10);
        return dayStr >= loadD && dayStr <= unloadD;
      });
      if (res) {
        const isRequest = res.status === 'Pending' || res.reservation_type === 'Booking Request' || res.status === 'Booking Requested';
        return {
          type: 'reservation',
          label: isRequest ? `⚡ Held: ${res.destination || 'Requested'}` : `🔒 Booked → ${res.destination || 'Unload'}`,
          sub: `${res.customer_name || 'Client'} (${isRequest ? 'Busy Held' : 'Confirmed'})`,
          status: isRequest ? 'Booking Requested' : 'Booked',
          reservation: res,
          clickable: true
        };
      }
    }

    // 3. Current Live Status on Day 0 (Today)
    if (dayObj.isToday) {
      if (truck.current_status === 'In Transit') {
        return {
          type: 'transit',
          label: `🚛 En Route to ${truck.expected_destination || 'Hub'}`,
          sub: truck.estimated_arrival ? `ETA: ${new Date(truck.estimated_arrival).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'In Transit',
          status: 'In Transit',
          clickable: true
        };
      }
      if (truck.current_status === 'Loading' || truck.current_status === 'Unloading') {
        return {
          type: 'dock',
          label: `⚓ ${truck.current_status} at Dock`,
          sub: truck.predicted_location || 'Terminal',
          status: truck.current_status,
          clickable: true
        };
      }
      if (truck.current_status === 'Maintenance' || truck.current_status === 'Breakdown') {
        return {
          type: 'maintenance',
          label: `⚠️ ${truck.current_status}`,
          sub: 'Downtime',
          status: truck.current_status,
          clickable: false
        };
      }
      return {
        type: 'available',
        label: `⚡ Available Now`,
        sub: `at ${truck.current_location || 'Hub'}`,
        status: 'Available',
        clickable: true,
        canBook: true
      };
    }

    // 4. Future Forecast Positioning
    // If today is in transit, day 1 is expected arrival/unload, day 2 is expected available, day 3 is return opportunity
    if (truck.current_status === 'In Transit' && dayIndex === 1) {
      return {
        type: 'arrival',
        label: `📍 Arrival: ${truck.expected_destination || 'Hubli'}`,
        sub: 'Unloading window',
        status: 'Unloading',
        clickable: true
      };
    }
    if (truck.current_status === 'In Transit' && dayIndex === 2) {
      return {
        type: 'expected_available',
        label: `✨ Available at ${truck.expected_destination || 'Hubli'}`,
        sub: 'Ready for outbound',
        status: 'Expected Available',
        clickable: true,
        canBook: true
      };
    }
    if (dayIndex >= 3 && truck.expected_destination && truck.expected_destination.toLowerCase() !== 'hyderabad') {
      return {
        type: 'return_load',
        label: `🔄 Return Load Opportunity`,
        sub: `${truck.expected_destination} → Hyd`,
        status: 'Available',
        clickable: true,
        canBook: true
      };
    }

    // Default open slot: Available for reservation
    return {
      type: 'open',
      label: `+ Reserve`,
      sub: `at ${truck.predicted_location || truck.current_location || 'Depot'}`,
      status: 'Available',
      clickable: true,
      canBook: true
    };
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1500px] mx-auto font-sans">
      {/* ── Top Header Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              Airline Flight-Style Scheduling
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Fleet Dispatch Engine
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-emerald-400" />
            Fleet Availability Calendar
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Real-time multi-resource timeline. Schedule bookings, inspect movement forecasts, and prevent double-booking.
          </p>
        </div>

        {/* View Switcher, Timeline Navigator & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Day / Week View Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center shadow-inner">
            {[
              { days: 7, label: '7 Days' },
              { days: 14, label: '14 Days' },
              { days: 30, label: '30 Days' }
            ].map(v => (
              <button
                key={v.days}
                onClick={() => setViewDaysCount(v.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewDaysCount === v.days 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Date Range Navigation Buttons */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setDateOffset(prev => prev - 7)}
              title="Previous 7 Days"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDateOffset(0)}
              className="px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setDateOffset(prev => prev + 7)}
              title="Next 7 Days"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadCalendar}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 text-xs h-9 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button 
            size="sm" 
            onClick={() => {
              if (timelineData.length > 0) {
                setBlockForm(prev => ({ ...prev, truck_number: timelineData[0].truck_number }));
              }
              setIsBlockModalOpen(true);
            }}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-9 rounded-xl shadow-lg shadow-amber-600/20"
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
            Block Availability
          </Button>
        </div>
      </div>

      {/* ── Status Metrics KPI Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {[
          { label: 'Available', key: 'Available', count: timelineData.filter(t => t.current_status === 'Available').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
          { label: 'In Transit', key: 'In Transit', count: timelineData.filter(t => t.current_status === 'In Transit').length, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', dot: 'bg-purple-400' },
          { label: 'Confirmed Booked', key: 'Booked', count: timelineData.filter(t => t.current_status === 'Booked').length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400' },
          { label: 'Dock Operations', key: 'Loading', count: timelineData.filter(t => t.current_status === 'Loading' || t.current_status === 'Unloading').length, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20', dot: 'bg-teal-400' },
          { label: 'Maintenance / Blocks', key: 'Maintenance', count: timelineData.filter(t => t.current_status === 'Maintenance' || t.current_status === 'Breakdown').length, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', dot: 'bg-orange-400' },
          { label: 'Total Fleet Resources', key: 'Total', count: timelineData.length, color: 'text-slate-200', bg: 'bg-slate-900/80 border-slate-800', dot: 'bg-emerald-500' }
        ].map((item, idx) => (
          <div 
            key={idx}
            className={`p-3 rounded-2xl border ${item.bg} flex items-center justify-between transition-all shadow-sm`}
          >
            <div>
              <p className="text-[11px] font-bold text-slate-400">{item.label}</p>
              <p className={`text-xl font-black ${item.color} tracking-tight`}>{item.count} Trucks</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${item.dot} shadow-sm`} />
          </div>
        ))}
      </div>

      {/* ── Filter Bar & Date Window Indicator ──────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <Input 
              placeholder="Filter by truck number (e.g. TG12, TS08), city, or status..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border-slate-800 text-xs h-9 pl-9 text-white placeholder:text-slate-500 rounded-xl"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-emerald-500 text-slate-950' 
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Date Window Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 shrink-0 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Timeline Horizon: <strong className="text-white">{startDateFormatted}</strong> → <strong className="text-white">{endDateFormatted}</strong></span>
        </div>
      </div>

      {/* ── Interactive Gantt Timeline Board ─────────────────────────── */}
      <Card className="bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${320 + (days.length * 140)}px` }} className="w-full">
            {/* Board Header: Column Names & Days */}
            <div className="flex items-stretch bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-300">
              {/* Left Column Header: Fleet Resource */}
              <div 
                style={{ width: '300px', minWidth: '300px', flexShrink: 0 }}
                className="p-3.5 border-r border-slate-800 flex items-center justify-between uppercase tracking-wider text-[11px] text-slate-400 font-black bg-slate-900/95"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Fleet Resource & Hub</span>
                </div>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  {filteredTimeline.length} Trucks
                </span>
              </div>

              {/* Right Columns: Days Grid Header */}
              <div 
                style={{ 
                  flex: 1, 
                  display: 'grid', 
                  gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
                  gap: '4px'
                }}
                className="p-2"
              >
                {days.map((day, idx) => (
                  <div 
                    key={idx}
                    className={`text-center py-2 px-1 rounded-xl transition-all ${
                      day.isToday 
                        ? 'bg-emerald-500/15 border-2 border-emerald-400/60 shadow-lg shadow-emerald-500/10' 
                        : 'bg-slate-950/60 border border-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className={`text-[11px] font-black uppercase ${day.isToday ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {day.dayName}
                      </span>
                      {day.isToday && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500 text-slate-950 font-black">
                          TODAY
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline justify-center gap-1 mt-0.5">
                      <span className={`text-base font-black ${day.isToday ? 'text-emerald-300' : 'text-white'}`}>
                        {day.dayNum}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {day.month}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Board Body: Individual Truck Rows */}
            {loading ? (
              <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                <p className="text-sm font-bold text-slate-300">Calculating real-time fleet schedules & future movements...</p>
                <p className="text-xs text-slate-500">Checking PocketBase collections, active trips, and conflict locks</p>
              </div>
            ) : filteredTimeline.length === 0 ? (
              <div className="py-20 text-center text-slate-500">
                <Truck className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-400" />
                <p className="text-base font-bold text-slate-300">No fleet trucks found</p>
                <p className="text-xs text-slate-500 mt-1">Try clearing your search query or filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-850">
                {filteredTimeline.map(truck => {
                  const statusCfg = STATUS_CONFIG[truck.current_status] || STATUS_CONFIG['Available'];

                  return (
                    <div 
                      key={truck.truck_id || truck.truck_number}
                      className="flex items-stretch hover:bg-slate-900/40 transition-colors group"
                    >
                      {/* Left Column: Truck Card */}
                      <div 
                        style={{ width: '300px', minWidth: '300px', flexShrink: 0 }}
                        className="p-3.5 border-r border-slate-800 flex flex-col justify-between bg-slate-950/80 group-hover:bg-slate-900/70 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span 
                              onClick={() => setSelectedTruck(truck)}
                              className="font-black text-sm text-white tracking-wide hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              {truck.truck_number}
                              <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                            </span>
                            <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 border-slate-700 bg-slate-900 text-slate-300">
                              {truck.vehicle_category || '32FT SXL'}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1 font-semibold text-slate-300 truncate">
                              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                              {truck.predicted_location || truck.current_location || 'Hyderabad'}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-slate-300 shrink-0">{truck.capacity_tons || 14.5} MT</span>
                          </div>
                        </div>

                        {/* Quick action strip */}
                        <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                          <span className={`font-extrabold ${statusCfg.text} text-[10px] uppercase`}>
                            {statusCfg.label}
                          </span>
                          <button
                            onClick={() => handleOpenReserve(truck, days[0])}
                            className="text-emerald-400 hover:text-emerald-300 font-extrabold flex items-center gap-1 hover:underline"
                          >
                            <Plus className="w-3 h-3" /> Quick Book
                          </button>
                        </div>
                      </div>

                      {/* Right Columns: 7 Gantt Day Slots */}
                      <div 
                        style={{ 
                          flex: 1, 
                          display: 'grid', 
                          gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
                          gap: '4px'
                        }}
                        className="p-2 items-center"
                      >
                        {days.map((day, dIdx) => {
                          const slot = getSlotInfo(truck, day, dIdx);
                          const cfg = STATUS_CONFIG[slot.status] || STATUS_CONFIG['Available'];

                          return (
                            <div
                              key={dIdx}
                              onClick={() => {
                                if (slot.canBook) {
                                  handleOpenReserve(truck, day);
                                } else {
                                  setSelectedTruck(truck);
                                }
                              }}
                              className={`h-14 rounded-xl border p-2 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group/slot ${
                                slot.type === 'open'
                                  ? 'border-slate-850 bg-slate-900/30 hover:border-emerald-500/50 hover:bg-emerald-500/10'
                                  : `${cfg.border} ${cfg.bg} shadow-sm`
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-[11px] font-black leading-tight truncate ${
                                  slot.type === 'open' ? 'text-slate-500 group-hover/slot:text-emerald-300' : cfg.text
                                }`}>
                                  {slot.label}
                                </span>
                                {slot.canBook && (
                                  <Plus className="w-3 h-3 text-slate-500 group-hover/slot:text-emerald-400 shrink-0" />
                                )}
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-400 truncate">
                                <span className="truncate">{slot.sub}</span>
                                {day.isToday && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ── Quick Reservation Dialog ─────────────────────────────────── */}
      <Dialog open={isReserveModalOpen} onOpenChange={setIsReserveModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Book Truck: {reserveForm.truck_number}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateReservation} className="space-y-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Customer Name *</label>
                <Input 
                  required
                  placeholder="e.g. Reliance Retail / Tata"
                  value={reserveForm.customer_name}
                  onChange={(e) => setReserveForm({...reserveForm, customer_name: e.target.value})}
                  className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Customer Phone</label>
                <Input 
                  placeholder="e.g. 9876543210"
                  value={reserveForm.customer_phone}
                  onChange={(e) => setReserveForm({...reserveForm, customer_phone: e.target.value})}
                  className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Origin Hub *</label>
                <Input 
                  required
                  placeholder="e.g. Hyderabad Hub"
                  value={reserveForm.origin}
                  onChange={(e) => setReserveForm({...reserveForm, origin: e.target.value})}
                  className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Destination Hub *</label>
                <Input 
                  required
                  placeholder="e.g. Hubli / Bangalore / Pune"
                  value={reserveForm.destination}
                  onChange={(e) => setReserveForm({...reserveForm, destination: e.target.value})}
                  className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Loading Date & Time *</label>
                <Input 
                  type="datetime-local"
                  required
                  value={reserveForm.loading_datetime}
                  onChange={(e) => setReserveForm({...reserveForm, loading_datetime: e.target.value})}
                  className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Reservation Type</label>
                <select
                  value={reserveForm.reservation_type}
                  onChange={(e) => setReserveForm({...reserveForm, reservation_type: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-xs h-9 mt-1 px-3 rounded-xl text-white font-bold"
                >
                  <option value="Confirmed">Confirmed Reservation (Immediate Lock)</option>
                  <option value="Provisional">Provisional (Requires Approval)</option>
                  <option value="Booking Request">Booking Request</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Agreed Freight (₹)</label>
                <Input 
                  type="number"
                  placeholder="e.g. 32000"
                  value={reserveForm.indicative_freight}
                  onChange={(e) => setReserveForm({...reserveForm, indicative_freight: e.target.value})}
                  className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Cargo Weight (MT)</label>
                <Input 
                  placeholder="e.g. 14.5"
                  value={reserveForm.cargo_weight_tons}
                  onChange={(e) => setReserveForm({...reserveForm, cargo_weight_tons: e.target.value})}
                  className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsReserveModalOpen(false)} className="border-slate-800 rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs">
                Confirm & Lock Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Manual Block Modal ───────────────────────────────────────── */}
      <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Block Truck Availability
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateBlock} className="space-y-3 py-2">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Select Truck *</label>
              <select
                value={blockForm.truck_number}
                onChange={(e) => setBlockForm({...blockForm, truck_number: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 text-xs h-9 mt-1 px-3 rounded-xl text-white font-bold"
              >
                {timelineData.map(t => (
                  <option key={t.truck_number} value={t.truck_number}>
                    {t.truck_number} ({t.vehicle_category} · {t.current_location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Downtime Reason Type *</label>
              <select
                value={blockForm.block_type}
                onChange={(e) => setBlockForm({...blockForm, block_type: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 text-xs h-9 mt-1 px-3 rounded-xl text-white font-bold"
              >
                <option value="Maintenance">Scheduled Maintenance / Workshop</option>
                <option value="Breakdown">Mechanical Breakdown / Repair</option>
                <option value="Documents Expired">RTO / Fitness / Insurance Renewal</option>
                <option value="Driver Unavailable">Driver Leave / Rest Period</option>
                <option value="Operational Hold">Internal Operational Hold</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Detailed Operational Notes *</label>
              <Input 
                required
                placeholder="e.g. Engine overhaul scheduled at Solapur workshop"
                value={blockForm.reason}
                onChange={(e) => setBlockForm({...blockForm, reason: e.target.value})}
                className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Start Time</label>
                <Input 
                  type="datetime-local"
                  required
                  value={blockForm.start_time}
                  onChange={(e) => setBlockForm({...blockForm, start_time: e.target.value})}
                  className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Expected Release Time</label>
                <Input 
                  type="datetime-local"
                  required
                  value={blockForm.end_time}
                  onChange={(e) => setBlockForm({...blockForm, end_time: e.target.value})}
                  className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsBlockModalOpen(false)} className="border-slate-800 rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs">
                Confirm Block
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Truck Inspector Dialog ────────────────────────────────────── */}
      {selectedTruck && (
        <Dialog open={Boolean(selectedTruck)} onOpenChange={() => setSelectedTruck(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg rounded-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-400" />
                  {selectedTruck.truck_number}
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  {selectedTruck.current_status}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Vehicle Category</span>
                  <span className="text-white font-extrabold text-sm">{selectedTruck.vehicle_category || '32FT SXL'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Rated Capacity</span>
                  <span className="text-white font-extrabold text-sm">{selectedTruck.capacity_tons || 14.5} MT</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Current Hub</span>
                  <span className="text-emerald-400 font-extrabold">{selectedTruck.current_location || 'Hyderabad'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Predicted Future Hub</span>
                  <span className="text-cyan-400 font-extrabold">{selectedTruck.predicted_location || 'Hyderabad'}</span>
                </div>
              </div>

              {selectedTruck.expected_destination && (
                <div className="bg-purple-950/30 border border-purple-500/30 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-purple-300 font-bold">
                    <span>En Route Destination:</span>
                    <span>{selectedTruck.expected_destination}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Estimated Arrival (ETA):</span>
                    <span className="text-white font-bold">{selectedTruck.estimated_arrival ? new Date(selectedTruck.estimated_arrival).toLocaleString('en-IN') : 'En Route'}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold">Prediction Engine Confidence:</span>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-black">
                  {selectedTruck.prediction_confidence || 85}% Confidence
                </Badge>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button 
                  onClick={() => {
                    handleOpenReserve(selectedTruck, days[0]);
                    setSelectedTruck(null);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Book Truck Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
