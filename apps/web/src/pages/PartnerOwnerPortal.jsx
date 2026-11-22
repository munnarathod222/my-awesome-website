import React, { useState, useEffect } from 'react';
import { 
  Truck, Plus, ShieldCheck, MapPin, DollarSign, Calendar, Clock, 
  CheckCircle2, AlertCircle, FileText, Phone, User, RefreshCw, Send, Lock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { reservationClient } from '@/lib/reservationClient.js';

export default function PartnerOwnerPortal() {
  const [partnerTrucks, setPartnerTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAvailModalOpen, setIsAvailModalOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);

  // New truck registration form
  const [regForm, setRegForm] = useState({
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    owner_pan: '',
    bank_account_number: '',
    bank_ifsc: '',
    truck_number: '',
    truck_type: '32FT SXL',
    capacity_tons: 14.5,
    rc_number: '',
    fitness_expiry: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    insurance_expiry: new Date(Date.now() + 240 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    declared_empty_location: 'Hyderabad Hub',
    agreed_payout_rate: 32
  });

  // Declare availability form
  const [availForm, setAvailForm] = useState({
    current_availability: 'Available for Trips',
    declared_empty_location: 'Hyderabad Hub',
    available_from_date: new Date().toISOString().slice(0, 16),
    preferred_return_destination: 'Hubli'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await reservationClient.getPartnerTrucks();
      setPartnerTrucks(res.trucks || []);
    } catch (err) {
      toast.error('Failed to load partner trucks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.owner_name || !regForm.owner_phone || !regForm.truck_number) {
      toast.warning('Owner name, phone, and truck number are mandatory.');
      return;
    }

    try {
      await reservationClient.registerPartnerTruck(regForm);
      toast.success(`Attached truck ${regForm.truck_number} registered! Dispatch verification pending.`);
      setIsRegisterModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  const handleUpdateAvailability = async (e) => {
    e.preventDefault();
    try {
      await reservationClient.declarePartnerAvailability({
        id: selectedTruck.id,
        ...availForm
      });
      toast.success(`Availability declared for ${selectedTruck.truck_number}!`);
      setIsAvailModalOpen(false);
      setSelectedTruck(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to declare availability');
    }
  };

  const handleVerifyTruck = async (id, status) => {
    try {
      await reservationClient.verifyPartnerTruck({
        id,
        verification_status: status
      });
      toast.success(`Truck marked as ${status}`);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Verification update failed');
    }
  };

  const verifiedCount = partnerTrucks.filter(t => t.verification_status === 'Verified Active').length;
  const availableCount = partnerTrucks.filter(t => t.current_availability === 'Available for Trips').length;
  const totalPayout = partnerTrucks.reduce((sum, t) => sum + (parseFloat(t.total_net_payout) || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1500px] mx-auto font-sans">
      {/* ── Top Header Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25">
              Marketplace Fleet Network
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Attached Truck Owner Portal
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-amber-400" />
            Attached Truck Owner Portal
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            External truck owners can onboard vehicles, declare empty location & availability, receive direct trip offers, and track settlement earnings.
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
            onClick={() => setIsRegisterModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black gap-2 text-xs shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Register Attached Vehicle
          </Button>
        </div>
      </div>

      {/* ── KPI Metric Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Partner Fleet</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{partnerTrucks.length}</span>
            <span className="text-xs text-amber-400 font-bold">Total Trucks</span>
          </div>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Active</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{verifiedCount}</span>
            <span className="text-xs text-slate-400 font-medium">Compliance Approved</span>
          </div>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Declared Ready for Load</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-400">{availableCount}</span>
            <span className="text-xs text-slate-400 font-medium">Available Now</span>
          </div>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Disbursed Payouts</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">₹{totalPayout.toLocaleString('en-IN')}</span>
            <span className="text-xs text-emerald-400 font-bold">Ledger Cleared</span>
          </div>
        </Card>
      </div>

      {/* ── Partner Fleet Table ─────────────────────────────────────── */}
      <Card className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-extrabold text-white">Attached Fleet Register & Live Availability</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Showing {partnerTrucks.length} Vehicles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Truck Reg No</th>
                <th className="p-3.5">Owner & Contact</th>
                <th className="p-3.5">Category & Capacity</th>
                <th className="p-3.5">Current Location & Preference</th>
                <th className="p-3.5">Live Status</th>
                <th className="p-3.5">Verification</th>
                <th className="p-3.5">Payout Rate</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {partnerTrucks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No attached partner trucks registered yet. Click "Register Attached Vehicle" to onboard an external fleet truck.
                  </td>
                </tr>
              ) : (
                partnerTrucks.map(truck => {
                  const isVerified = truck.verification_status === 'Verified Active';
                  const isAvailable = truck.current_availability === 'Available for Trips';

                  return (
                    <tr key={truck.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-mono font-extrabold text-white">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                          <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-300">
                            {truck.truck_number}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-extrabold text-white">{truck.owner_name}</div>
                        <div className="text-[11px] text-slate-400">{truck.owner_phone}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-white font-bold">{truck.truck_type}</div>
                        <div className="text-[11px] text-slate-400">{truck.capacity_tons} MT payload</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-white font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>{truck.declared_empty_location || 'Not declared'}</span>
                        </div>
                        {truck.preferred_return_destination && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Heading to: {truck.preferred_return_destination}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <Badge className={`text-[10px] font-black ${
                          isAvailable 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {truck.current_availability}
                        </Badge>
                      </td>
                      <td className="p-3.5">
                        <Badge className={`text-[10px] font-black ${
                          isVerified 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {truck.verification_status}
                        </Badge>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-white">
                        ₹{truck.agreed_payout_rate || 32}/km
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <Button
                          onClick={() => {
                            setSelectedTruck(truck);
                            setAvailForm({
                              current_availability: truck.current_availability || 'Available for Trips',
                              declared_empty_location: truck.declared_empty_location || '',
                              available_from_date: truck.available_from_date || new Date().toISOString().slice(0, 16),
                              preferred_return_destination: truck.preferred_return_destination || ''
                            });
                            setIsAvailModalOpen(true);
                          }}
                          variant="outline"
                          className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs py-1 px-2 h-auto"
                        >
                          Declare Avail
                        </Button>
                        {!isVerified && (
                          <Button
                            onClick={() => handleVerifyTruck(truck.id, 'Verified Active')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1 px-2.5 h-auto rounded-lg"
                          >
                            Verify & Approve
                          </Button>
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

      {/* ── Modal: Register Attached Vehicle ────────────────────────── */}
      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent className="bg-slate-950 border border-slate-800 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-white">
              <Truck className="w-5 h-5 text-amber-400" />
              Onboard Attached Vehicle (Partner Portal)
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleRegister} className="space-y-4 text-xs font-medium">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Truck Registration No *</label>
                <Input
                  required
                  placeholder="e.g. MH12 RN 8841"
                  value={regForm.truck_number}
                  onChange={e => setRegForm({ ...regForm, truck_number: e.target.value.toUpperCase() })}
                  className="bg-slate-900 border-slate-800 text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Truck Class / Spec *</label>
                <select
                  value={regForm.truck_type}
                  onChange={e => setRegForm({ ...regForm, truck_type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="32FT SXL">32FT SXL (Single Axle 14.5 MT)</option>
                  <option value="32FT MXL">32FT MXL (Multi Axle 18.5 MT)</option>
                  <option value="24FT Container">24FT Container (8.5 MT)</option>
                  <option value="40FT Trailer">40FT Trailer (28 MT)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Truck Owner Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Santosh Gaikwad"
                  value={regForm.owner_name}
                  onChange={e => setRegForm({ ...regForm, owner_name: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Owner Contact Phone *</label>
                <Input
                  required
                  placeholder="+91 98220 12345"
                  value={regForm.owner_phone}
                  onChange={e => setRegForm({ ...regForm, owner_phone: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Owner PAN Number</label>
                <Input
                  placeholder="ABCDE1234F"
                  value={regForm.owner_pan}
                  onChange={e => setRegForm({ ...regForm, owner_pan: e.target.value.toUpperCase() })}
                  className="bg-slate-900 border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Bank Account / IFSC</label>
                <Input
                  placeholder="Account No / IFSC for Net Payouts"
                  value={regForm.bank_account_number}
                  onChange={e => setRegForm({ ...regForm, bank_account_number: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Current Empty Location</label>
                <Input
                  placeholder="e.g. Pune Chakan MIDC"
                  value={regForm.declared_empty_location}
                  onChange={e => setRegForm({ ...regForm, declared_empty_location: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Agreed Payout Rate (₹/km)</label>
                <Input
                  type="number"
                  value={regForm.agreed_payout_rate}
                  onChange={e => setRegForm({ ...regForm, agreed_payout_rate: parseFloat(e.target.value) || 0 })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsRegisterModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black">
                Register Attached Vehicle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Declare Availability & Return Destination ────────── */}
      <Dialog open={isAvailModalOpen} onOpenChange={setIsAvailModalOpen}>
        <DialogContent className="bg-slate-950 border border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-white">
              <MapPin className="w-5 h-5 text-amber-400" />
              Declare Empty Location & Availability
            </DialogTitle>
          </DialogHeader>

          {selectedTruck && (
            <form onSubmit={handleUpdateAvailability} className="space-y-4 text-xs font-medium">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="font-mono font-bold text-amber-300 text-sm">{selectedTruck.truck_number}</div>
                <div className="text-slate-400 text-xs mt-0.5">
                  Owner: <strong className="text-white">{selectedTruck.owner_name}</strong> ({selectedTruck.owner_phone})
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Current Availability Status</label>
                <select
                  value={availForm.current_availability}
                  onChange={e => setAvailForm({ ...availForm, current_availability: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                >
                  <option value="Available for Trips">Available for Trips</option>
                  <option value="On Assigned Trip">On Assigned Trip</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Current Empty Location *</label>
                <Input
                  required
                  placeholder="e.g. Pune MIDC / Hubli APMC Yard"
                  value={availForm.declared_empty_location}
                  onChange={e => setAvailForm({ ...availForm, declared_empty_location: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Preferred Return Destination</label>
                <Input
                  placeholder="e.g. Hyderabad / Bangalore"
                  value={availForm.preferred_return_destination}
                  onChange={e => setAvailForm({ ...availForm, preferred_return_destination: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAvailModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black">
                  Update Availability
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
