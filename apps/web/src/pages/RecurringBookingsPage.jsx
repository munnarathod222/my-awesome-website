import React, { useState, useEffect } from 'react';
import { 
  Repeat, Calendar, Clock, MapPin, Truck, Plus, CheckCircle2, 
  AlertCircle, DollarSign, Building, Phone, ChevronRight, RefreshCw, Lock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { reservationClient } from '@/lib/reservationClient.js';
import pb from '@/lib/pocketbaseClient.js';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function RecurringBookingsPage() {
  const [recurringList, setRecurringList] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRec, setSelectedRec] = useState(null);

  // New recurring booking form
  const [recForm, setRecForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    origin: 'Hyderabad Hub',
    destination: 'Hubli Terminal',
    vehicle_category: '32FT SXL',
    recurring_days: ['Monday', 'Wednesday', 'Friday'],
    preferred_time: '18:00',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    rate_per_trip: 27500,
    special_instructions: 'Fixed schedule departure, priority dock clearance'
  });

  // Assign truck form
  const [allocTruck, setAllocTruck] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [recRes, fleetTrucks] = await Promise.all([
        reservationClient.getRecurringBookings(),
        pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false }).catch(() => [])
      ]);
      setRecurringList(recRes.recurring || []);
      setTrucks(fleetTrucks);
    } catch (err) {
      toast.error('Failed to load recurring bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleDay = (day) => {
    const cur = [...recForm.recurring_days];
    const idx = cur.indexOf(day);
    if (idx >= 0) {
      if (cur.length === 1) {
        toast.warning('At least one day must be selected.');
        return;
      }
      cur.splice(idx, 1);
    } else {
      cur.push(day);
    }
    setRecForm({ ...recForm, recurring_days: cur });
  };

  const handleCreateRecurring = async (e) => {
    e.preventDefault();
    if (!recForm.customer_name || !recForm.customer_phone) {
      toast.warning('Client name and phone are required.');
      return;
    }

    try {
      await reservationClient.createRecurringBooking(recForm);
      toast.success('Recurring booking schedule recorded! Awaiting truck assignment.');
      setIsNewModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to submit recurring booking');
    }
  };

  const handleAssignTruck = async (e) => {
    e.preventDefault();
    if (!allocTruck) {
      toast.warning('Please select a truck to dedicate to this schedule.');
      return;
    }

    try {
      await reservationClient.assignTruckToRecurring({
        id: selectedRec.id,
        truck_number: allocTruck
      });
      toast.success(`Truck ${allocTruck} linked to recurring schedule! Matching days locked.`);
      setIsAssignModalOpen(false);
      setSelectedRec(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Truck assignment failed');
    }
  };

  const activeCount = recurringList.filter(r => r.status === 'Active').length;
  const pendingCount = recurringList.filter(r => r.status === 'Pending Dispatch Review').length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1500px] mx-auto font-sans">
      {/* ── Top Header Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/25">
              Module 11: Repeat Route Scheduling
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              Automated Recurring Dispatches
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Repeat className="w-7 h-7 text-teal-400" />
            Recurring Truck Booking
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Schedule recurring dispatches (e.g. Every Mon, Wed & Fri). Dynamic truck assignment locks recurring slots across the fleet schedule.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={loadData}
            variant="outline"
            className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 gap-1.5 text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 font-black gap-2 text-xs shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" />
            New Recurring Schedule
          </Button>
        </div>
      </div>

      {/* ── KPI Metric Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900/60 border-slate-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Recurring Schedules</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{activeCount}</span>
            <span className="text-xs text-teal-400 font-bold">Lanes Running</span>
          </div>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Truck Assignment</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{pendingCount}</span>
            <span className="text-xs text-slate-400 font-medium">Needs Dispatch Lock</span>
          </div>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Dispatches Generated</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {recurringList.reduce((sum, r) => sum + ((r.recurring_days || []).length || 0), 0)}
            </span>
            <span className="text-xs text-emerald-400 font-bold">Trips / Week</span>
          </div>
        </Card>
      </div>

      {/* ── Recurring Schedules Table ───────────────────────────────── */}
      <Card className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-extrabold text-white">Active Recurring Schedules & Allocations</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Showing {recurringList.length} Scheduled Patterns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Recurrence Code</th>
                <th className="p-3.5">Customer & Contact</th>
                <th className="p-3.5">Route</th>
                <th className="p-3.5">Frequency Days</th>
                <th className="p-3.5">Preferred Time</th>
                <th className="p-3.5">Rate / Trip</th>
                <th className="p-3.5">Assigned Vehicle</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {recurringList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500">
                    No recurring booking schedules registered. Click "New Recurring Schedule" to configure recurring truck movements.
                  </td>
                </tr>
              ) : (
                recurringList.map(rec => {
                  const isActive = rec.status === 'Active';
                  const isPending = rec.status === 'Pending Dispatch Review';
                  const days = Array.isArray(rec.recurring_days) ? rec.recurring_days : [];

                  return (
                    <tr key={rec.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-teal-400">
                        {rec.recurrence_code}
                      </td>
                      <td className="p-3.5">
                        <div className="font-extrabold text-white">{rec.customer_name}</div>
                        <div className="text-[11px] text-slate-400">{rec.customer_phone}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-white font-bold">{rec.origin} → {rec.destination}</div>
                        <div className="text-[11px] text-slate-400">{rec.vehicle_category}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {days.map(d => (
                            <span key={d} className="px-1.5 py-0.5 rounded text-[10px] bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold">
                              {d.slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-mono text-white font-bold">{rec.preferred_time || '18:00'}</div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400 text-sm">
                        ₹{parseFloat(rec.rate_per_trip || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        {rec.assigned_truck_number ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="font-mono font-extrabold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {rec.assigned_truck_number}
                            </span>
                          </div>
                        ) : (
                          <span className="text-amber-400 text-xs italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <Badge className={`text-[10px] font-black ${
                          isActive 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : isPending 
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {rec.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        {isPending && (
                          <Button
                            onClick={() => {
                              setSelectedRec(rec);
                              setAllocTruck('');
                              setIsAssignModalOpen(true);
                            }}
                            className="bg-teal-600 hover:bg-teal-700 text-slate-950 font-black text-xs py-1 px-2.5 h-auto rounded-lg shadow-sm"
                          >
                            Assign Truck & Lock
                          </Button>
                        )}
                        {isActive && (
                          <span className="text-xs text-slate-500 font-medium">Locked in Calendar</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Modal: New Recurring Schedule Request ───────────────────── */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="bg-slate-950 border border-slate-800 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-white">
              <Repeat className="w-5 h-5 text-teal-400" />
              Configure Recurring Truck Schedule
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateRecurring} className="space-y-4 text-xs font-medium">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Customer / Company Name *</label>
                <Input
                  required
                  placeholder="e.g. Reliance Retail Logistics"
                  value={recForm.customer_name}
                  onChange={e => setRecForm({ ...recForm, customer_name: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Phone Number *</label>
                <Input
                  required
                  placeholder="+91 98765 43210"
                  value={recForm.customer_phone}
                  onChange={e => setRecForm({ ...recForm, customer_phone: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Loading Origin *</label>
                <Input
                  required
                  placeholder="e.g. Hyderabad Hub"
                  value={recForm.origin}
                  onChange={e => setRecForm({ ...recForm, origin: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Destination Terminal *</label>
                <Input
                  required
                  placeholder="e.g. Hubli Terminal"
                  value={recForm.destination}
                  onChange={e => setRecForm({ ...recForm, destination: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>

            {/* Recurring Days Selector */}
            <div>
              <label className="text-slate-400 block mb-1.5 font-bold">Recurring Days of Week *</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => {
                  const isSelected = recForm.recurring_days.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isSelected 
                          ? 'bg-teal-500 text-slate-950 shadow-md font-black' 
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Preferred Departure Time</label>
                <Input
                  type="time"
                  value={recForm.preferred_time}
                  onChange={e => setRecForm({ ...recForm, preferred_time: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Agreed Rate per Trip (₹)</label>
                <Input
                  type="number"
                  value={recForm.rate_per_trip}
                  onChange={e => setRecForm({ ...recForm, rate_per_trip: parseFloat(e.target.value) || 0 })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Start Date</label>
                <Input
                  type="date"
                  value={recForm.start_date}
                  onChange={e => setRecForm({ ...recForm, start_date: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">End Date</label>
                <Input
                  type="date"
                  value={recForm.end_date}
                  onChange={e => setRecForm({ ...recForm, end_date: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsNewModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-black">
                Save Recurring Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Assign Truck & Lock Schedule ─────────────────────── */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="bg-slate-950 border border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-white">
              <Lock className="w-5 h-5 text-teal-400" />
              Link Fleet Truck to Recurring Schedule
            </DialogTitle>
          </DialogHeader>

          {selectedRec && (
            <form onSubmit={handleAssignTruck} className="space-y-4 text-xs font-medium">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="font-bold text-white text-sm">{selectedRec.customer_name}</div>
                <div className="text-slate-400 text-xs mt-0.5">
                  Lane: <strong className="text-white">{selectedRec.origin} → {selectedRec.destination}</strong>
                </div>
                <div className="text-teal-400 text-xs font-bold mt-1">
                  Days: {(selectedRec.recurring_days || []).join(', ')} @ {selectedRec.preferred_time || '18:00'}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Select Truck to Dedicate *</label>
                <select
                  required
                  value={allocTruck}
                  onChange={e => setAllocTruck(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono font-bold"
                >
                  <option value="">-- Choose Truck from Active Fleet --</option>
                  {trucks.map(t => (
                    <option key={t.id} value={t.truck_number}>
                      {t.truck_number} ({t.vehicle_class || t.truck_size || '32FT SXL'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  This vehicle's schedule will be marked as BUSY for all matching days in the calendar.
                </p>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-black">
                  Confirm & Lock Schedule
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
