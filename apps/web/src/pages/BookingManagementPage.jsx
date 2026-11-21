import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Clock, CheckCircle2, XCircle, FileText, 
  Printer, User, Phone, MapPin, DollarSign, Filter, RefreshCw, AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { reservationClient } from '@/lib/reservationClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function BookingManagementPage() {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Approval modal state
  const [selectedForApproval, setSelectedForApproval] = useState(null);
  const [allocTruckNumber, setAllocTruckNumber] = useState('');
  const [agreedFreight, setAgreedFreight] = useState('');

  // Rejection modal state
  const [selectedForRejection, setSelectedForRejection] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadReservations = async () => {
    try {
      setLoading(true);
      const res = await reservationClient.listReservations();
      setReservations(res.reservations || []);
    } catch (err) {
      toast.error('Failed to load reservations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!allocTruckNumber) {
      toast.warning('Please specify truck number for allocation.');
      return;
    }

    try {
      await reservationClient.approveReservation(selectedForApproval.id, {
        truck_number: allocTruckNumber,
        agreed_freight: agreedFreight,
        approved_by: currentUser?.full_name || currentUser?.name || 'Dispatcher'
      });
      toast.success(`Booking ${selectedForApproval.booking_number} approved and allocated to ${allocTruckNumber}!`);
      setSelectedForApproval(null);
      loadReservations();
    } catch (err) {
      toast.error(err.message || 'Approval failed');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason) {
      toast.warning('Documented reason is required for rejection.');
      return;
    }

    try {
      await reservationClient.rejectReservation(
        selectedForRejection.id,
        rejectReason,
        currentUser?.full_name || currentUser?.name || 'Dispatcher'
      );
      toast.success(`Booking ${selectedForRejection.booking_number} rejected.`);
      setSelectedForRejection(null);
      loadReservations();
    } catch (err) {
      toast.error(err.message || 'Rejection failed');
    }
  };

  const filteredReservations = reservations.filter(r => {
    const matchesTab = activeTab === 'All' || 
      (activeTab === 'Pending' && (r.status === 'Pending' || r.reservation_type === 'Booking Request')) ||
      (activeTab === 'Confirmed' && r.status === 'Confirmed') ||
      (activeTab === 'Provisional' && r.reservation_type === 'Provisional');

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (r.booking_number || '').toLowerCase().includes(searchLower) ||
      (r.customer_name || '').toLowerCase().includes(searchLower) ||
      (r.truck_number || '').toLowerCase().includes(searchLower) ||
      (r.origin || '').toLowerCase().includes(searchLower) ||
      (r.destination || '').toLowerCase().includes(searchLower);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Module 4 & 9: 3-Tier Reservations & Control Center
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ClipboardCheck className="w-3.5 h-3.5 text-violet-400" />
              Confirmed, Provisional & Request Lifecycle
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3">
            <FileText className="w-7 h-7 text-violet-400" />
            Fleet Reservation Management
          </h1>
          <p className="text-sm text-slate-400">
            Review incoming booking requests, allocate trucks, approve provisional reservations, and monitor schedules.
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadReservations}
          className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ── Filter Tabs & Search Bar ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
          {['All', 'Confirmed', 'Pending', 'Provisional'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === tab 
                  ? 'bg-violet-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <Input 
          placeholder="Filter by booking number, customer, truck, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-950 border-slate-800 text-xs h-9 text-white placeholder:text-slate-500 max-w-xs"
        />
      </div>

      {/* ── Reservations Table ──────────────────────────────────────── */}
      <Card className="bg-slate-950 border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Allocated Truck</th>
                <th className="py-3.5 px-4">Corridor Route</th>
                <th className="py-3.5 px-4">Loading Date & SLA</th>
                <th className="py-3.5 px-4">Freight (₹)</th>
                <th className="py-3.5 px-4">Booking Type</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-violet-400" />
                    Loading reservations registry...
                  </td>
                </tr>
              ) : filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    No reservations found in this view.
                  </td>
                </tr>
              ) : (
                filteredReservations.map(res => (
                  <tr key={res.id || res.booking_number} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-black text-white">{res.booking_number}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{res.customer_name}</p>
                      <p className="text-[11px] text-slate-400">{res.customer_phone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {res.truck_number ? (
                        <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {res.truck_number}
                        </div>
                      ) : (
                        <span className="text-amber-400 font-semibold italic">Unallocated</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {res.origin} → {res.destination}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(res.loading_datetime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-white">
                      ₹{(res.final_agreed_freight || res.indicative_freight || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge className={
                        res.status === 'Confirmed' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : res.status === 'Pending' 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }>
                        {res.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {res.status === 'Pending' || !res.truck_number ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setSelectedForApproval(res);
                              setAllocTruckNumber(res.truck_number || '');
                              setAgreedFreight(res.final_agreed_freight || res.indicative_freight || 28000);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-7 px-2.5 font-bold"
                          >
                            Allocate
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedForRejection(res)}
                            className="border-rose-900/60 text-rose-400 hover:bg-rose-950 text-[11px] h-7 px-2"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => toast.info(`Printing voucher for ${res.booking_number}`)}
                          className="text-slate-400 hover:text-white text-[11px] h-7 px-2"
                        >
                          <Printer className="w-3.5 h-3.5 mr-1" /> Slip
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Allocation & Approval Modal ─────────────────────────────── */}
      {selectedForApproval && (
        <Dialog open={!!selectedForApproval} onOpenChange={() => setSelectedForApproval(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Allocate Truck to Booking {selectedForApproval.booking_number}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleApprove} className="space-y-3 py-2 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Enter / Select Truck Number</label>
                <Input 
                  placeholder="e.g. TS08 UJ 5428"
                  value={allocTruckNumber}
                  onChange={(e) => setAllocTruckNumber(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Final Agreed Freight (₹)</label>
                <Input 
                  type="number"
                  value={agreedFreight}
                  onChange={(e) => setAgreedFreight(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white text-xs font-bold"
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedForApproval(null)} className="border-slate-800">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  Approve & Lock Schedule
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Rejection Modal ─────────────────────────────────────────── */}
      {selectedForRejection && (
        <Dialog open={!!selectedForRejection} onOpenChange={() => setSelectedForRejection(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-rose-400">
                <XCircle className="w-5 h-5" />
                Reject Booking Request {selectedForRejection.booking_number}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleReject} className="space-y-3 py-2 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Documented Rejection Reason (Mandatory Audit)</label>
                <Input 
                  placeholder="e.g. No available fleet within 100km deadhead for requested date"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white text-xs"
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedForRejection(null)} className="border-slate-800">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-500 text-white font-bold">
                  Confirm Rejection
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
