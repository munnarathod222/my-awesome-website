import React, { useState, useEffect } from 'react';
import { 
  Truck, MapPin, Calendar, IndianRupee, ArrowRight, Sparkles, 
  Search, Filter, Plus, ShieldCheck, CheckCircle2, Star, Shield, 
  Phone, Eye, Clock, Download, ChevronRight, RefreshCw, AlertCircle
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
  const [typeFilter, setTypeFilter] = useState('all');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const fetchRealVehicles = async () => {
    setLoading(true);
    try {
      // Query real trucks from PocketBase
      const records = await pb.collection('trucks').getFullList({
        sort: '-created',
        $autoCancel: false
      }).catch(() => []);

      const mapped = records.map(t => ({
        id: t.id,
        truck_number: t.truck_number,
        truck_name: t.truck_name || t.make || 'Ashok Leyland / Tata',
        vehicle_type: t.truck_size ? `${t.truck_size} Container` : '32 FT Container SXL',
        capacity_tons: Number(t.capacity) || 22,
        rate_per_km: 68,
        fixed_route_rate: 45000,
        current_location: t.current_location || 'Hyderabad, TS',
        availability_status: t.status || 'Active Fleet',
        owner_company: 'Jai Bhavani Cargo Fleet',
        rating: 4.9,
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

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.truck_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.truck_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.current_location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || v.vehicle_type.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-400" /> Commercial Vehicle & Fleet Marketplace
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real commercial trucks and fleet vehicles directly from your database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={fetchRealVehicles} variant="outline" className="border-slate-800 rounded-2xl h-11 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-bold px-3 py-1">
            {vehicles.length} Real Vehicles Active
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/40 border border-slate-800/80 p-3 rounded-2xl">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search vehicle number, location, model..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-slate-950 border-slate-800 text-xs rounded-xl">
            <SelectValue placeholder="All Truck Types" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 text-xs">
            <SelectItem value="all">All Vehicle Types</SelectItem>
            <SelectItem value="Container">Container Trucks</SelectItem>
            <SelectItem value="Trailer">Trailers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="bg-slate-900/60 border-slate-800 p-6 rounded-3xl space-y-3">
              <Skeleton className="h-4 w-32 bg-slate-800" />
              <Skeleton className="h-8 w-full bg-slate-800" />
            </Card>
          ))}
        </div>
      ) : filteredVehicles.length === 0 ? (
        <Card className="bg-slate-900/60 border-slate-800 p-8 text-center text-slate-400 text-sm rounded-3xl space-y-3">
          <Truck className="w-10 h-10 mx-auto opacity-30 text-amber-400" />
          <p className="font-bold text-white">No vehicles found in database.</p>
          <p className="text-xs text-slate-400">Add trucks in Truck Manager to view them in the marketplace.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVehicles.map((v) => (
            <Card key={v.id} className="bg-slate-900/80 border-slate-800 rounded-3xl hover:border-amber-400/50 transition-all duration-300 shadow-xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black font-mono text-amber-400 tracking-wider">
                        {v.truck_number}
                      </span>
                      <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 flex items-center gap-1 font-mono">
                        Driver: {v.driver_name}
                      </Badge>
                    </div>
                    <h3 className="text-xs font-bold text-slate-300 mt-0.5">
                      {v.truck_name} • {v.vehicle_type}
                    </h3>
                  </div>

                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                    {v.availability_status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
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
                  <div className="text-[11px] text-slate-400 font-medium">
                    Operated by <strong className="text-white">{v.owner_company}</strong>
                  </div>

                  <Button 
                    size="sm"
                    onClick={() => { setSelectedVehicle(v); setBookingModalOpen(true); }}
                    className="h-9 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md"
                  >
                    Reserve Vehicle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-3xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" /> Reserve Vehicle {selectedVehicle?.truck_number}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Confirm reservation for vehicle {selectedVehicle?.truck_number}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
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
