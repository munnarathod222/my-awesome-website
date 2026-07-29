import React, { useState } from 'react';
import { Wrench, Fuel, Shield, AlertTriangle, Phone, MapPin, CheckCircle2, Search, Truck, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const SAMPLE_VENDORS = [
  {
    id: 'VND-301',
    category: 'Highway Mechanics',
    icon: Wrench,
    name: 'National Truck Mechanics & Express Repair',
    location: 'NH-44 Highway, Shamshabad, Hyderabad',
    phone: '+91 9849099881',
    rating: 4.9,
    service_range: '24/7 Mobile Service Truck Available (Within 40 KM)',
    specialization: 'Engine Overhaul, Air Brakes, Clutch & Gearbox Repair'
  },
  {
    id: 'VND-302',
    category: 'Fuel Outlets',
    icon: Fuel,
    name: 'HPCL Mega Diesel Station & FASTag Point',
    location: 'Bhiwandi Bypass, Mumbai-Thane Highway',
    phone: '+91 9821033445',
    rating: 4.8,
    service_range: 'High-Flow Diesel Dispenser, AdBlue Refill, FASTag Recharge',
    specialization: 'Clean Fuel Guarantee & Corporate Credit Facility'
  },
  {
    id: 'VND-303',
    category: 'Tyre Dealers & Alignment',
    icon: Wrench,
    name: 'MRF Express Truck Tyre Care & Retreading',
    location: 'Outer Ring Road, Bengaluru',
    phone: '+91 8022091122',
    rating: 4.9,
    service_range: '32-Point Laser Wheel Alignment & On-Spot Tyre Replacement',
    specialization: 'Tubeless Heavy Radial Tyres & Retread Warranty'
  },
  {
    id: 'VND-304',
    category: 'Crane & Recovery Vehicles',
    icon: AlertTriangle,
    name: 'Apollo 24/7 Heavy Breakdown Recovery & Hydraulic Cranes',
    location: 'Pune-Mumbai Expressway Plaza',
    phone: '+91 9112099000',
    rating: 5.0,
    service_range: '50-Ton Hydraulic Crane & Underlift Towing (Instant Dispatch)',
    specialization: 'Accident Recovery, Highway Towing & Emergency Pulling'
  },
  {
    id: 'VND-305',
    category: 'Transit Insurance',
    icon: Shield,
    name: 'ICICI Lombard All-Risk Goods Transit Insurance',
    location: 'Pan-India Instant Digital Policy',
    phone: '+91 18002585999',
    rating: 4.9,
    service_range: 'Instant Cover Note for Full Truck Loads & Partial Cargo',
    specialization: 'Zero Deductible Theft & Accident Damage Claim Guarantee'
  }
];

export default function VendorServicesMarketplace() {
  const [vendors] = useState(SAMPLE_VENDORS);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const filtered = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.location.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === 'all' || v.category.toLowerCase().includes(catFilter.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
            <Wrench className="w-6 h-6 text-rose-400" /> On-Highway Vendor Network & Emergency Assistance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Nationwide network of mobile mechanics, diesel outlets, tyre dealers, cranes, and transit insurance.
          </p>
        </div>

        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs font-bold px-3 py-1">
          210 Verified On-Highway Vendors
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search vendor name, location, or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {['all', 'Mechanics', 'Fuel', 'Tyre', 'Crane', 'Insurance'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                catFilter === cat 
                  ? 'bg-rose-500 text-slate-950 border-rose-500' 
                  : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => {
          const IconComp = v.icon || Wrench;
          return (
            <Card key={v.id} className="bg-slate-900/80 border-slate-800 rounded-3xl p-5 space-y-4 hover:border-rose-400/50 transition-all shadow-xl">
              <CardContent className="p-0 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <Badge variant="outline" className="text-[9px] text-rose-400 border-rose-500/30 uppercase font-mono">
                        {v.category}
                      </Badge>
                      <h3 className="text-sm font-extrabold text-white mt-0.5">{v.name}</h3>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {v.location}
                </div>

                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-300 font-semibold">{v.service_range}</div>
                  <div className="text-[11px] text-slate-400">Specialization: {v.specialization}</div>
                </div>

                <Button 
                  onClick={() => toast.success(`Connecting emergency request to ${v.name} (${v.phone})`)}
                  className="w-full h-9 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold text-xs rounded-xl shadow-md"
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5" /> 1-Tap Call & SOS Service ({v.phone})
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
