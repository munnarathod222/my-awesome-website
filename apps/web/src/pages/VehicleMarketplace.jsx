import React, { useState } from 'react';
import { 
  Truck, MapPin, Calendar, IndianRupee, ArrowRight, Sparkles, 
  Search, Filter, Plus, ShieldCheck, CheckCircle2, Star, Shield, 
  Phone, Eye, Clock, Download, ChevronRight, Check
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const SAMPLE_VEHICLES = [
  {
    id: 'TRK-9001',
    truck_number: 'TS 08 UK 4491',
    truck_name: 'Tata Prima 4028.S',
    vehicle_type: '32 FT Container SXL',
    capacity_tons: 22,
    rate_per_km: 68,
    fixed_route_rate: 45000,
    current_location: 'Hyderabad, TS',
    preferred_routes: 'Hyderabad → Mumbai / Pune',
    availability_status: 'Available Now',
    owner_company: 'Jai Bhavani Express Fleet',
    rating: 4.9,
    trips_completed: 184,
    features: ['GPS Live Track', 'FASTag Enabled', 'Insured', 'Air Suspension']
  },
  {
    id: 'TRK-9002',
    truck_number: 'MH 04 AB 9120',
    truck_name: 'Ashok Leyland 5525',
    vehicle_type: '40 FT High Cube Trailer',
    capacity_tons: 34,
    rate_per_km: 82,
    fixed_route_rate: 78000,
    current_location: 'Mumbai, MH',
    preferred_routes: 'Mumbai → Delhi / NCR',
    availability_status: 'Available Tomorrow',
    owner_company: 'Star Cargo Carriers',
    rating: 4.8,
    trips_completed: 210,
    features: ['Multi-Axle Heavy', 'GPS Track', 'Hydro Ramp']
  },
  {
    id: 'TRK-9003',
    truck_number: 'KA 01 MG 3301',
    truck_name: 'BharatBenz 2823C',
    vehicle_type: 'Cold Storage Reefer',
    capacity_tons: 16,
    rate_per_km: 75,
    fixed_route_rate: 52000,
    current_location: 'Bengaluru, KA',
    preferred_routes: 'Bengaluru → Chennai / Hyd',
    availability_status: 'Available Now',
    owner_company: 'FrostLine Cold Chain',
    rating: 4.9,
    trips_completed: 142,
    features: ['-20°C Temp Control', 'IoT Sensor', 'Realtime Temp Alert']
  },
  {
    id: 'TRK-9004',
    truck_number: 'GJ 12 U 8812',
    truck_name: 'Eicher Pro 6037',
    vehicle_type: '24 FT Open Body Truck',
    capacity_tons: 14,
    rate_per_km: 55,
    fixed_route_rate: 38000,
    current_location: 'Ahmedabad, GJ',
    preferred_routes: 'Ahmedabad → Jaipur / Delhi',
    availability_status: 'On Duty (Free in 2 days)',
    owner_company: 'Gujarat Freight Alliance',
    rating: 4.7,
    trips_completed: 96,
    features: ['Tarpaulin Cover', 'GPS Track', 'FASTag']
  }
];

export default function VehicleMarketplace({ activeRole = 'transporter' }) {
  const [vehicles, setVehicles] = useState(SAMPLE_VEHICLES);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.truck_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.truck_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.current_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.owner_company.toLowerCase().includes(searchTerm.toLowerCase());
    
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
            Book verified commercial trucks, containers, trailers, and reefers directly from fleet owners.
          </p>
        </div>

        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-bold px-3 py-1">
          89 Verified Trucks Ready
        </Badge>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/40 border border-slate-800/80 p-3 rounded-2xl">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search vehicle number, location, model, or owner..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-950 border-slate-800 text-xs rounded-xl"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-slate-950 border-slate-800 text-xs rounded-xl">
            <SelectValue placeholder="All Truck Types" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 text-xs">
            <SelectItem value="all">All Vehicle Types</SelectItem>
            <SelectItem value="Container">Container Trucks</SelectItem>
            <SelectItem value="Trailer">Trailers & Multi-Axle</SelectItem>
            <SelectItem value="Reefer">Cold Storage Reefers</SelectItem>
            <SelectItem value="Open Body">Open Body Trucks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicles Cards Grid */}
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
                      ★ {v.rating} ({v.trips_completed} trips)
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

              {/* Specifications & Rate */}
              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">PAYLOAD CAPACITY</div>
                  <div className="font-bold text-white text-xs mt-0.5">{v.capacity_tons} Tons</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">RATE PER KM</div>
                  <div className="font-extrabold text-amber-400 text-xs font-mono mt-0.5">₹{v.rate_per_km} / KM</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-mono">LOCATION</div>
                  <div className="font-bold text-white text-xs mt-0.5 flex items-center justify-end gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" /> {v.current_location}
                  </div>
                </div>
              </div>

              {/* Features Tags */}
              <div className="flex flex-wrap gap-1.5">
                {v.features.map((feat, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700">
                    ✓ {feat}
                  </span>
                ))}
              </div>

              {/* Owner & Book Button */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400 font-medium">
                  Operated by <strong className="text-white">{v.owner_company}</strong>
                </div>

                <Button 
                  size="sm"
                  onClick={() => { setSelectedVehicle(v); setBookingModalOpen(true); }}
                  className="h-9 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md"
                >
                  Book Vehicle
                </Button>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-3xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" /> Reserve Vehicle {selectedVehicle?.truck_number}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Confirm pickup date and route details to reserve this vehicle instantly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
              <div className="text-white font-extrabold">{selectedVehicle?.truck_name} ({selectedVehicle?.vehicle_type})</div>
              <div className="text-amber-400 font-mono">Rate: ₹{selectedVehicle?.rate_per_km}/KM • Est. Route: ₹{selectedVehicle?.fixed_route_rate?.toLocaleString('en-IN')}</div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Pickup Date</Label>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Destination Location</Label>
              <Input placeholder="Enter destination city" defaultValue="Mumbai, MH" className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white" />
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
