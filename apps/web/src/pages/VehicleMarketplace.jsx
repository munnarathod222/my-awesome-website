import React, { useState, useEffect } from 'react';
import { 
  Truck, MapPin, Calendar, IndianRupee, ArrowRight, Sparkles, 
  Search, Filter, Plus, ShieldCheck, CheckCircle2, Star, Shield, 
  Phone, Eye, Clock, Download, ChevronRight, RefreshCw, Edit, Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function VehicleMarketplace({ activeRole = 'transporter' }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Edit Vehicle Form State
  const [editForm, setEditForm] = useState({
    truck_number: '',
    truck_name: '',
    vehicle_type: '',
    capacity_tons: '',
    current_location: '',
    driver_name: ''
  });

  const fetchRealVehicles = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('trucks').getFullList({
        sort: '-created',
        $autoCancel: false
      }).catch(() => []);

      const mapped = records.map(t => ({
        id: t.id,
        raw: t,
        truck_number: t.truck_number,
        truck_name: t.truck_name || t.make || 'Ashok Leyland / Tata',
        vehicle_type: t.truck_size ? `${t.truck_size} Container` : '32 FT Container SXL',
        capacity_tons: Number(t.capacity) || 22,
        rate_per_km: 68,
        current_location: t.current_location || 'Hyderabad, TS',
        availability_status: t.status || 'Active Fleet',
        owner_company: 'Jai Bhavani Cargo Fleet',
        fastag_balance: t.current_fastag_balance || 0,
        driver_name: t.driver_name || 'Assigned Driver'
      }));

      setVehicles(mapped);
    } catch (err) {
      console.error('Error fetching real trucks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealVehicles();
  }, []);

  const handleOpenEdit = (v) => {
    setSelectedVehicle(v);
    setEditForm({
      truck_number: v.truck_number,
      truck_name: v.truck_name,
      vehicle_type: v.vehicle_type,
      capacity_tons: v.capacity_tons.toString(),
      current_location: v.current_location,
      driver_name: v.driver_name
    });
    setEditModalOpen(true);
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    try {
      await pb.collection('trucks').update(selectedVehicle.id, {
        truck_number: editForm.truck_number,
        truck_name: editForm.truck_name,
        capacity: Number(editForm.capacity_tons),
        current_location: editForm.current_location,
        driver_name: editForm.driver_name
      }, { $autoCancel: false });

      toast.success(`Vehicle ${editForm.truck_number} updated successfully!`);
      setEditModalOpen(false);
      fetchRealVehicles();
    } catch (err) {
      console.error('Failed to update vehicle:', err);
      toast.error('Failed to update vehicle record');
    }
  };

  const handleDeleteVehicle = async (vId, vNum) => {
    if (!window.confirm(`Are you sure you want to delete vehicle ${vNum}?`)) return;
    try {
      await pb.collection('trucks').delete(vId, { $autoCancel: false });
      toast.success(`Vehicle ${vNum} deleted`);
      fetchRealVehicles();
    } catch (err) {
      console.error('Failed to delete truck:', err);
      toast.error('Could not delete vehicle');
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.truck_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.truck_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.current_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" /> Commercial Fleet & Truck Marketplace
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            View, edit, and reserve commercial fleet trucks directly from your database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button onClick={fetchRealVehicles} variant="outline" className="border-slate-800 rounded-xl h-10 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-bold px-3 py-1">
            {vehicles.length} Trucks Active
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Search vehicle number, location, or model..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-slate-950 border-slate-800 text-xs rounded-xl text-white h-10"
        />
      </div>

      {/* Vehicles Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl space-y-3">
              <Skeleton className="h-4 w-32 bg-slate-800" />
              <Skeleton className="h-8 w-full bg-slate-800" />
            </Card>
          ))}
        </div>
      ) : filteredVehicles.length === 0 ? (
        <Card className="bg-slate-900/60 border-slate-800 p-8 text-center text-slate-400 text-xs rounded-2xl space-y-3">
          <Truck className="w-10 h-10 mx-auto text-slate-600" />
          <p className="font-bold text-white text-sm">No trucks found in database.</p>
          <p className="text-slate-400">Add trucks in Truck Manager to view them in the marketplace.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVehicles.map((v) => (
            <Card key={v.id} className="bg-slate-900/90 border-slate-800 rounded-2xl hover:border-slate-700 transition-all shadow-md">
              <CardContent className="p-5 space-y-4">
                
                {/* Header & Explicit EDIT/DELETE Buttons */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black font-mono text-amber-400 tracking-wider">
                        {v.truck_number}
                      </span>
                      <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                        {v.driver_name}
                      </Badge>
                    </div>
                    <h3 className="text-xs font-bold text-slate-300 mt-0.5">
                      {v.truck_name} • {v.vehicle_type}
                    </h3>
                  </div>

                  {/* Explicit Edit & Delete Controls */}
                  <div className="flex items-center gap-1.5">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenEdit(v)}
                      className="h-8 px-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                      title="Edit Vehicle Details"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Button>

                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteVehicle(v.id, v.truck_number)}
                      className="h-8 w-8 p-0 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-700 rounded-lg flex items-center justify-center"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <div className="text-[10px] text-slate-400 font-mono">CAPACITY</div>
                    <div className="font-bold text-white text-xs mt-0.5">{v.capacity_tons} Tons</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-mono">FASTAG BAL</div>
                    <div className="font-extrabold text-amber-400 text-xs font-mono mt-0.5">₹{v.fastag_balance}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-mono">LOCATION</div>
                    <div className="font-bold text-white text-xs mt-0.5 flex items-center justify-end gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" /> {v.current_location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-400">
                    Operated by <strong className="text-white">{v.owner_company}</strong>
                  </div>

                  <Button 
                    size="sm"
                    onClick={() => { setSelectedVehicle(v); setBookingModalOpen(true); }}
                    className="h-8 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-md"
                  >
                    Reserve Vehicle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Vehicle Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-amber-400">
              <Edit className="w-5 h-5 text-amber-400" /> Edit Vehicle ({selectedVehicle?.truck_number})
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update commercial vehicle details and location.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateVehicle} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Truck Registration Number</Label>
              <Input 
                required
                value={editForm.truck_number}
                onChange={(e) => setEditForm({ ...editForm, truck_number: e.target.value })}
                className="bg-slate-950 border-slate-800 text-xs rounded-xl text-amber-400 font-bold font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Truck Name / Make</Label>
                <Input 
                  value={editForm.truck_name}
                  onChange={(e) => setEditForm({ ...editForm, truck_name: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Capacity (Tons)</Label>
                <Input 
                  type="number"
                  value={editForm.capacity_tons}
                  onChange={(e) => setEditForm({ ...editForm, capacity_tons: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Current Location</Label>
              <Input 
                value={editForm.current_location}
                onChange={(e) => setEditForm({ ...editForm, current_location: e.target.value })}
                className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl">
                Save & Update Vehicle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" /> Reserve Vehicle {selectedVehicle?.truck_number}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Confirm reservation for vehicle {selectedVehicle?.truck_number}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="text-white font-extrabold">{selectedVehicle?.truck_name} ({selectedVehicle?.vehicle_type})</div>
              <div className="text-amber-400 font-mono">Assigned Driver: {selectedVehicle?.driver_name}</div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Pickup Date</Label>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingModalOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button onClick={() => { toast.success(`Vehicle ${selectedVehicle?.truck_number} reserved successfully!`); setBookingModalOpen(false); }} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl">
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
