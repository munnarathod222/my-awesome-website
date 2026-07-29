import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Star, Award, Phone, CheckCircle2, Search, Truck, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const SAMPLE_DRIVERS = [
  {
    id: 'DRV-501',
    name: 'Dayanand Surwase',
    dl_number: 'MH1420180092109',
    badge_type: 'Heavy Commercial Vehicle (HGV)',
    experience_years: 12,
    safety_score: '99.2%',
    current_status: 'Available for Dispatch',
    preferred_lanes: 'Hyderabad ↔ Mumbai / Pune',
    mobile: '+91 9845011928',
    rating: 4.9,
    completed_trips: 420
  },
  {
    id: 'DRV-502',
    name: 'Rajesh Y',
    dl_number: 'TS0920150918231',
    badge_type: 'Multi-Axle Container Trailer',
    experience_years: 8,
    safety_score: '98.5%',
    current_status: 'On Active Trip (Free on July 31)',
    preferred_lanes: 'Hyderabad ↔ Bengaluru / Chennai',
    mobile: '+91 9700192834',
    rating: 4.8,
    completed_trips: 290
  },
  {
    id: 'DRV-503',
    name: 'Vinay Verma',
    dl_number: 'KA0420120987123',
    badge_type: 'Hazardous Chemical & Reefer',
    experience_years: 15,
    safety_score: '99.8%',
    current_status: 'Available for Dispatch',
    preferred_lanes: 'Pan India Long Haul',
    mobile: '+91 9110293847',
    rating: 5.0,
    completed_trips: 510
  }
];

export default function DriverMarketplace() {
  const [drivers] = useState(SAMPLE_DRIVERS);
  const [search, setSearch] = useState('');

  const filtered = drivers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.dl_number.toLowerCase().includes(search.toLowerCase()) ||
    d.preferred_lanes.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-400" /> Commercial Driver Directory & Hiring
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Hire verified heavy commercial vehicle drivers with verified DLs and safety performance records.
          </p>
        </div>

        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-bold px-3 py-1">
          120 Active Verified Drivers
        </Badge>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Search driver by name, DL number, or route..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => (
          <Card key={d.id} className="bg-slate-900/80 border-slate-800 rounded-3xl p-5 space-y-4 hover:border-emerald-400/50 transition-all shadow-xl">
            <CardContent className="p-0 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-extrabold text-white">{d.name}</h3>
                  <div className="text-xs text-amber-400 font-mono font-bold mt-0.5">
                    DL: {d.dl_number}
                  </div>
                </div>

                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                  {d.current_status}
                </Badge>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Experience:</span>
                  <strong className="text-white">{d.experience_years} Years</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Safety Record:</span>
                  <strong className="text-emerald-400">{d.safety_score} Clean</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Rating:</span>
                  <span className="text-amber-400 font-bold">★ {d.rating} ({d.completed_trips} trips)</span>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Badge: <strong className="text-slate-200">{d.badge_type}</strong>
              </div>

              <Button 
                onClick={() => toast.success(`1-Click Driver Hiring request sent to ${d.name} (${d.mobile})`)}
                className="w-full h-9 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md"
              >
                1-Click Hire / Dispatch Driver
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
