import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Truck, Clock, ShieldAlert, CheckCircle2, 
  AlertTriangle, Filter, Plus, Wrench, ChevronLeft, ChevronRight,
  MapPin, RefreshCw, X, ShieldX, User, Info, FileText
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
  'Available': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Available' },
  'Booked': { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Booked' },
  'Booking Requested': { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Booking Requested' },
  'Loading': { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30', label: 'Loading at Dock' },
  'In Transit': { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', label: 'In Transit' },
  'Unloading': { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', label: 'Unloading at Dock' },
  'Waiting': { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Detained / Waiting' },
  'Expected Available': { bg: 'bg-emerald-500/10 border-dashed', text: 'text-emerald-300', border: 'border-emerald-400/40', label: 'Expected Available' },
  'Maintenance': { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Maintenance' },
  'Breakdown': { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40', label: 'Breakdown' },
  'Documents Expired': { bg: 'bg-red-500/25', text: 'text-red-400', border: 'border-red-500/50', label: 'Documents Expired' },
  'Schedule Conflict': { bg: 'bg-crimson-500/30 animate-pulse', text: 'text-red-300', border: 'border-red-500', label: 'Schedule Conflict' },
};

export default function FleetCalendarPage() {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState('weekly'); // daily, weekly, monthly
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  // Manual block form state
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
      const res = await reservationClient.getCalendar(viewMode);
      setTimelineData(res.timeline || []);
    } catch (err) {
      toast.error('Failed to load fleet calendar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
  }, [viewMode]);

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
      toast.success(`Truck ${blockForm.truck_number} blocked for ${blockForm.block_type}.`);
      setIsBlockModalOpen(false);
      loadCalendar();
    } catch (err) {
      toast.error(err.message || 'Failed to create block');
    }
  };

  const filteredTimeline = timelineData.filter(t => 
    (t.truck_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.current_location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.current_status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate 7-day timeline headers for weekly view
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d,
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      isToday: i === 0
    };
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Module 1: Airline-Style Fleet Schedule
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> Live Telematics & Forecast Matrix
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-emerald-400" />
            Fleet Availability Calendar
          </h1>
          <p className="text-sm text-slate-400">
            Real-time multi-resource timeline. Schedule bookings, forecast truck movements, and manage fleet downtime.
          </p>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex items-center">
            {['daily', 'weekly', 'monthly'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                  viewMode === mode 
                    ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadCalendar}
            className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
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
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md shadow-amber-600/20"
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
            Block Availability
          </Button>
        </div>
      </div>

      {/* ── Status KPI Key Strip ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {Object.entries(STATUS_CONFIG).slice(0, 6).map(([statusKey, cfg]) => {
          const count = timelineData.filter(t => t.current_status === statusKey).length;
          return (
            <div 
              key={statusKey} 
              className={`p-2.5 rounded-xl border ${cfg.border} ${cfg.bg} flex items-center justify-between transition-all`}
            >
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-slate-300">{cfg.label}</p>
                <p className={`text-base font-extrabold ${cfg.text}`}>{count} Trucks</p>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${cfg.text.replace('text-', 'bg-')}`} />
            </div>
          );
        })}
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <Input 
          placeholder="Filter by truck number, terminal city, or status..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-950 border-slate-800 text-xs h-9 text-white placeholder:text-slate-500"
        />
        <div className="text-xs text-slate-400 shrink-0 font-medium px-2">
          Showing <span className="text-emerald-400 font-bold">{filteredTimeline.length}</span> of {timelineData.length} Fleet Resources
        </div>
      </div>

      {/* ── Timeline Gantt Grid ─────────────────────────────────────── */}
      <Card className="bg-slate-950 border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Table Header: Days Grid */}
            <div className="grid grid-cols-12 bg-slate-900/90 border-b border-slate-800 text-xs font-bold text-slate-300 py-3 px-4">
              <div className="col-span-3 flex items-center gap-2 text-slate-400 uppercase tracking-wider text-[11px]">
                <Truck className="w-4 h-4 text-emerald-400" />
                Fleet Resource & Specs
              </div>
              <div className="col-span-9 grid grid-cols-7 gap-1">
                {days.map((day, idx) => (
                  <div 
                    key={idx} 
                    className={`text-center py-1 rounded-md ${day.isToday ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400'}`}
                  >
                    <p className="text-[10px] uppercase font-semibold">{day.label.split(',')[0]}</p>
                    <p className="text-xs font-extrabold">{day.label.split(',')[1] || day.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Table Rows: Each Truck as a Resource */}
            {loading ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                <p className="text-sm">Calculating real-time fleet movement schedules...</p>
              </div>
            ) : filteredTimeline.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Truck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">No fleet resources found matching filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-850">
                {filteredTimeline.map(truck => {
                  const cfg = STATUS_CONFIG[truck.current_status] || STATUS_CONFIG['Available'];
                  return (
                    <div 
                      key={truck.truck_id || truck.truck_number}
                      className="grid grid-cols-12 py-3.5 px-4 items-center hover:bg-slate-900/50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedTruck(truck)}
                    >
                      {/* Truck Details */}
                      <div className="col-span-3 space-y-1 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-white tracking-wide group-hover:text-emerald-400 transition-colors">
                            {truck.truck_number}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-700 bg-slate-900 text-slate-300">
                            {truck.vehicle_category || '32FT SXL'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            {truck.predicted_location || truck.current_location || 'Depot'}
                          </span>
                          <span>•</span>
                          <span>{truck.capacity_tons || 14.5} MT</span>
                        </div>
                      </div>

                      {/* 7-Day Visual Schedule Bar */}
                      <div className="col-span-9 grid grid-cols-7 gap-1 h-10 items-center">
                        <div className={`col-span-7 h-8 rounded-lg border ${cfg.border} ${cfg.bg} flex items-center justify-between px-3 relative overflow-hidden shadow-inner`}>
                          <div className="flex items-center gap-2 z-10">
                            <span className={`w-2 h-2 rounded-full ${cfg.text.replace('text-', 'bg-')} animate-pulse`} />
                            <span className={`text-xs font-extrabold ${cfg.text}`}>
                              {cfg.label}
                            </span>
                            {truck.expected_destination && (
                              <span className="text-[11px] text-slate-300 font-medium">
                                → {truck.expected_destination}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 z-10 text-[11px] text-slate-400">
                            {truck.earliest_next_departure && (
                              <span>Next Free: {new Date(truck.earliest_next_departure).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                            <Badge className="bg-slate-900/80 text-[10px] text-emerald-400 border border-emerald-500/30">
                              {truck.prediction_confidence || 85}% Conf.
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ── Truck Schedule Details Drawer / Modal ───────────────────── */}
      {selectedTruck && (
        <Dialog open={!!selectedTruck} onOpenChange={() => setSelectedTruck(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                  <Truck className="w-5 h-5 text-emerald-400" />
                  {selectedTruck.truck_number} — Schedule Details
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-[11px]">Current Scheduled Status</p>
                  <p className="text-sm font-extrabold text-emerald-400">{selectedTruck.current_status}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[11px]">Prediction Confidence</p>
                  <p className="text-sm font-extrabold text-cyan-400">{selectedTruck.prediction_confidence}% High</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Current Location</span>
                  <span className="font-bold text-white text-xs">{selectedTruck.current_location || 'Hyderabad'}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Predicted Availability Spot</span>
                  <span className="font-bold text-emerald-400 text-xs">{selectedTruck.predicted_location || 'Hyderabad'}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Vehicle Specs</span>
                  <span className="font-bold text-white text-xs">{selectedTruck.vehicle_category} ({selectedTruck.capacity_tons} MT)</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Earliest Next Departure</span>
                  <span className="font-bold text-white text-xs">
                    {selectedTruck.earliest_next_departure ? new Date(selectedTruck.earliest_next_departure).toLocaleString('en-IN') : 'Available Immediately'}
                  </span>
                </div>
              </div>

              {/* Confirmed Bookings list */}
              <div>
                <h4 className="font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  Upcoming Confirmed Bookings ({selectedTruck.reservations?.length || 0})
                </h4>
                {selectedTruck.reservations?.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedTruck.reservations.map(res => (
                      <div key={res.id || res.booking_number} className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between items-center text-[11px]">
                        <div>
                          <span className="font-bold text-white">{res.booking_number}</span>
                          <p className="text-slate-400">{res.origin} → {res.destination}</p>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-400 text-[10px] border-blue-500/30">
                          {res.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">No conflicting confirmed bookings on this timeline.</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedTruck(null)} className="border-slate-800">
                Close
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  setBlockForm(prev => ({ ...prev, truck_number: selectedTruck.truck_number }));
                  setSelectedTruck(null);
                  setIsBlockModalOpen(true);
                }}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold"
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                Block This Truck
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Manual Block Availability Modal ─────────────────────────── */}
      <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Manual Fleet Availability Block
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateBlock} className="space-y-3.5 py-2 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Select Truck</label>
              <select
                value={blockForm.truck_number}
                onChange={(e) => setBlockForm({ ...blockForm, truck_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-white text-xs"
                required
              >
                <option value="">-- Choose Truck --</option>
                {timelineData.map(t => (
                  <option key={t.truck_number} value={t.truck_number}>
                    {t.truck_number} ({t.vehicle_category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Block Reason Category</label>
              <select
                value={blockForm.block_type}
                onChange={(e) => setBlockForm({ ...blockForm, block_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-white text-xs"
              >
                <option value="Maintenance">Scheduled Workshop Maintenance</option>
                <option value="Breakdown">Mechanical Breakdown</option>
                <option value="Document Expired">Permit / Insurance Expired</option>
                <option value="RTO Inspection">RTO Passing / Fitness Inspection</option>
                <option value="Personal Use">Owner / Personal Use</option>
                <option value="Operational Hold">Operational Hold</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Start Date & Time</label>
                <Input 
                  type="datetime-local" 
                  value={blockForm.start_time}
                  onChange={(e) => setBlockForm({ ...blockForm, start_time: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">End Date & Time</label>
                <Input 
                  type="datetime-local" 
                  value={blockForm.end_time}
                  onChange={(e) => setBlockForm({ ...blockForm, end_time: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Specific Reason & Notes</label>
              <Input 
                placeholder="e.g. Engine overhaul and front axle tyre replacement"
                value={blockForm.reason}
                onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white text-xs"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsBlockModalOpen(false)} className="border-slate-800">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold">
                Lock Availability
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
