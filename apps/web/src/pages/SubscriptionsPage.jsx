import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Truck, Calendar, Clock, DollarSign, Plus, CheckCircle2, 
  AlertCircle, Building, Phone, Mail, FileText, ChevronRight, RefreshCw, X, Lock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { reservationClient } from '@/lib/reservationClient.js';
import pb from '@/lib/pocketbaseClient.js';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);

  // New subscription request form
  const [subForm, setSubForm] = useState({
    company_name: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    vehicle_category: '32FT SXL',
    primary_operating_corridor: 'Hyderabad to Hubli Corridor',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    monthly_retainer_fee: 145000,
    included_km_or_trips: 4500,
    overage_rate_per_km: 28,
    billing_cycle: 'Monthly Advance',
    special_sla_notes: 'Dedicated 24/7 round-the-clock driver availability, zero co-loading'
  });

  // Assign truck form
  const [assignForm, setAssignForm] = useState({
    truck_number: '',
    monthly_rate: 145000
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, fleetTrucks] = await Promise.all([
        reservationClient.getSubscriptions(),
        pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false }).catch(() => [])
      ]);
      setSubscriptions(subsRes.subscriptions || []);
      setTrucks(fleetTrucks);
    } catch (err) {
      toast.error('Failed to load subscriptions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!subForm.company_name || !subForm.customer_name || !subForm.customer_phone) {
      toast.warning('Company name, customer name, and phone are required.');
      return;
    }

    try {
      await reservationClient.createSubscription(subForm);
      toast.success('Dedicated Vehicle Subscription request submitted! Awaiting dispatch allocation.');
      setIsRequestModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to submit subscription request');
    }
  };

  const handleAssignTruck = async (e) => {
    e.preventDefault();
    if (!assignForm.truck_number) {
      toast.warning('Please select a truck to allocate.');
      return;
    }

    try {
      await reservationClient.assignTruckToSubscription({
        id: selectedSub.id,
        truck_number: assignForm.truck_number,
        monthly_rate: assignForm.monthly_rate
      });
      toast.success(`Truck ${assignForm.truck_number} allocated to ${selectedSub.company_name}! Schedule locked.`);
      setIsAssignModalOpen(false);
      setSelectedSub(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Truck allocation failed');
    }
  };

  const totalRetainerRevenue = subscriptions
    .filter(s => s.status === 'Active')
    .reduce((sum, s) => sum + (parseFloat(s.monthly_retainer_fee) || 0), 0);

  const activeCount = subscriptions.filter(s => s.status === 'Active').length;
  const pendingCount = subscriptions.filter(s => s.status === 'Pending Dispatch Review').length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1500px] mx-auto font-sans">
      {/* ── Top Header Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/25">
              Module 12: Enterprise Fleet Retainers
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              Dedicated Vehicle Subscriptions
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-purple-400" />
            Dedicated Vehicle Subscriptions
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Reserve dedicated trucks for an entire month at an agreed retainer rate. Dynamic truck assignment locks the vehicle schedule as busy.
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
            onClick={() => setIsRequestModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold gap-2 text-xs shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            New Dedicated Retainer Request
          </Button>
        </div>
      </div>

      {/* ── KPI Metric Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Retainers</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{activeCount}</span>
            <span className="text-xs text-emerald-400 font-bold">Trucks Dedicated</span>
          </div>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{pendingCount}</span>
            <span className="text-xs text-slate-400 font-medium">Awaiting Vehicle Allocation</span>
          </div>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Retainer Inflow</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">₹{totalRetainerRevenue.toLocaleString('en-IN')}</span>
            <span className="text-xs text-purple-400 font-bold">Guaranteed/Mo</span>
          </div>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fleet Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-400">
              {trucks.length > 0 ? Math.round((activeCount / trucks.length) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-400 font-medium">On Contract Locked</span>
          </div>
        </Card>
      </div>

      {/* ── Subscriptions Table ─────────────────────────────────────── */}
      <Card className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-extrabold text-white">Active & Requested Subscriptions</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Showing {subscriptions.length} Contract Agreements
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Contract Code</th>
                <th className="p-3.5">Company & Client</th>
                <th className="p-3.5">Corridor / Spec</th>
                <th className="p-3.5">Contract Term</th>
                <th className="p-3.5">Monthly Retainer</th>
                <th className="p-3.5">Assigned Truck</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No active or pending subscriptions found. Click "New Dedicated Retainer Request" to register one.
                  </td>
                </tr>
              ) : (
                subscriptions.map(sub => {
                  const isActive = sub.status === 'Active';
                  const isPending = sub.status === 'Pending Dispatch Review';
                  return (
                    <tr key={sub.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-purple-400">
                        {sub.subscription_code}
                      </td>
                      <td className="p-3.5">
                        <div className="font-extrabold text-white">{sub.company_name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{sub.customer_name}</span>
                          <span>•</span>
                          <span>{sub.customer_phone}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-white font-bold">{sub.primary_operating_corridor || 'All-India Logistics'}</div>
                        <div className="text-[11px] text-slate-400">{sub.vehicle_category}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-white font-bold">{sub.start_date}</div>
                        <div className="text-[11px] text-slate-400">to {sub.end_date}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-emerald-400 font-black text-sm">
                          ₹{parseFloat(sub.monthly_retainer_fee || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-500">{sub.billing_cycle || 'Monthly Advance'}</div>
                      </td>
                      <td className="p-3.5">
                        {sub.assigned_truck_number ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="font-mono font-extrabold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {sub.assigned_truck_number}
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
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        {isPending && (
                          <Button
                            onClick={() => {
                              setSelectedSub(sub);
                              setAssignForm({
                                truck_number: '',
                                monthly_rate: sub.monthly_retainer_fee || 145000
                              });
                              setIsAssignModalOpen(true);
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-1 px-2.5 h-auto rounded-lg shadow-sm"
                          >
                            Assign Truck & Lock
                          </Button>
                        )}
                        {isActive && (
                          <span className="text-xs text-slate-500 font-medium">Locked in Schedule</span>
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

      {/* ── Modal: New Dedicated Retainer Request ───────────────────── */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="bg-slate-950 border border-slate-800 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-white">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              New Dedicated Vehicle Retainer Request
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateRequest} className="space-y-4 text-xs font-medium">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Company / Shipper Name *</label>
                <Input
                  required
                  placeholder="e.g. UltraTech Cement / DHL Supply Chain"
                  value={subForm.company_name}
                  onChange={e => setSubForm({ ...subForm, company_name: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Primary Contact Person *</label>
                <Input
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={subForm.customer_name}
                  onChange={e => setSubForm({ ...subForm, customer_name: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Phone Number *</label>
                <Input
                  required
                  placeholder="+91 98765 43210"
                  value={subForm.customer_phone}
                  onChange={e => setSubForm({ ...subForm, customer_phone: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="logistics@company.com"
                  value={subForm.customer_email}
                  onChange={e => setSubForm({ ...subForm, customer_email: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Vehicle Category</label>
                <select
                  value={subForm.vehicle_category}
                  onChange={e => setSubForm({ ...subForm, vehicle_category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="32FT SXL">32FT Single Axle (14.5 MT)</option>
                  <option value="32FT MXL">32FT Multi Axle (18.5 MT)</option>
                  <option value="24FT Container">24FT Container (8.5 MT)</option>
                  <option value="40FT High Cube">40FT High Cube Container</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Operating Corridor</label>
                <Input
                  placeholder="e.g. Hyderabad to Hubli Dedicated Lane"
                  value={subForm.primary_operating_corridor}
                  onChange={e => setSubForm({ ...subForm, primary_operating_corridor: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Start Date</label>
                <Input
                  type="date"
                  value={subForm.start_date}
                  onChange={e => setSubForm({ ...subForm, start_date: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">End Date</label>
                <Input
                  type="date"
                  value={subForm.end_date}
                  onChange={e => setSubForm({ ...subForm, end_date: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Monthly Agreed Retainer (₹)</label>
                <Input
                  type="number"
                  value={subForm.monthly_retainer_fee}
                  onChange={e => setSubForm({ ...subForm, monthly_retainer_fee: parseFloat(e.target.value) || 0 })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Billing Cycle</label>
                <select
                  value={subForm.billing_cycle}
                  onChange={e => setSubForm({ ...subForm, billing_cycle: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="Monthly Advance">Monthly Advance</option>
                  <option value="Bi-Weekly">Bi-Weekly</option>
                  <option value="Per Trip Drawdown">Per Trip Drawdown</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsRequestModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                Submit Retainer Request
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
              <Lock className="w-5 h-5 text-purple-400" />
              Assign Fleet Truck & Lock Schedule
            </DialogTitle>
          </DialogHeader>

          {selectedSub && (
            <form onSubmit={handleAssignTruck} className="space-y-4 text-xs font-medium">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="font-bold text-white text-sm">{selectedSub.company_name}</div>
                <div className="text-slate-400 text-xs mt-0.5">
                  Term: <strong className="text-white">{selectedSub.start_date}</strong> to <strong className="text-white">{selectedSub.end_date}</strong>
                </div>
                <div className="text-slate-400 text-xs">
                  Required: <strong className="text-purple-400">{selectedSub.vehicle_category}</strong>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Select Fleet Vehicle to Dedicate *</label>
                <select
                  required
                  value={assignForm.truck_number}
                  onChange={e => setAssignForm({ ...assignForm, truck_number: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono font-bold"
                >
                  <option value="">-- Choose Truck from Active Fleet --</option>
                  {trucks.map(t => (
                    <option key={t.id} value={t.truck_number}>
                      {t.truck_number} ({t.vehicle_class || t.truck_size || '32FT SXL'}) - {t.driver_name || 'Driver Available'}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Assigning will immediately lock this truck's schedule as BUSY for the full period.
                </p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Final Agreed Monthly Retainer (₹)</label>
                <Input
                  type="number"
                  value={assignForm.monthly_rate}
                  onChange={e => setAssignForm({ ...assignForm, monthly_rate: parseFloat(e.target.value) || 0 })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold">
                  Confirm & Lock Truck
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
