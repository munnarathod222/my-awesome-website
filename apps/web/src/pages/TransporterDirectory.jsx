import React, { useState } from 'react';
import { Users, ShieldCheck, Star, MapPin, Truck, Phone, Mail, Award, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const SAMPLE_TRANSPORTERS = [
  {
    id: 'TRP-101',
    company_name: 'Jai Bhavani Cargo Express',
    owner_name: 'Vinod Rathod',
    phone: '+91 7794072244',
    email: 'vinod@jaibhavanicargo.com',
    headquarters: 'Ghatkesar, Hyderabad, TS',
    gstin: '36DPXPR9171A1Z8',
    fleet_size: 45,
    primary_routes: ['HYD → MUM', 'HYD → BLR', 'DEL → HYD'],
    trust_score: 98,
    rating: 4.9,
    reviews_count: 340,
    verified_docs: ['GST Verified', 'PAN Verified', 'Transport License', 'Insurance Active']
  },
  {
    id: 'TRP-102',
    company_name: 'Deccan Freight Carriers',
    owner_name: 'Suresh Kumar',
    phone: '+91 9849012345',
    email: 'ops@deccanfreight.com',
    headquarters: 'Secunderabad, TS',
    gstin: '36AAACD8812F1Z4',
    fleet_size: 28,
    primary_routes: ['HYD → MAA', 'HYD → VZG'],
    trust_score: 94,
    rating: 4.7,
    reviews_count: 180,
    verified_docs: ['GST Verified', 'PAN Verified', 'Insurance Active']
  },
  {
    id: 'TRP-103',
    company_name: 'Western Express Logistics',
    owner_name: 'Rajesh Patel',
    phone: '+91 9825098765',
    email: 'contact@westernexpress.in',
    headquarters: 'Bhiwandi, Mumbai, MH',
    gstin: '27AAPFW9918M1Z9',
    fleet_size: 62,
    primary_routes: ['MUM → DEL', 'MUM → BLR', 'BHI → HYD'],
    trust_score: 96,
    rating: 4.8,
    reviews_count: 512,
    verified_docs: ['GST Verified', 'PAN Verified', 'Transport License', 'ISO Certified']
  }
];

export default function TransporterDirectory() {
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_TRANSPORTERS.filter(t => 
    t.company_name.toLowerCase().includes(search.toLowerCase()) ||
    t.headquarters.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-400" /> Verified Transport Partner Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse verified fleet operators, compliance documents, and AI trust scores across India.
          </p>
        </div>

        <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 text-xs font-bold px-3 py-1">
          54 Verified Transporters
        </Badge>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Search transport partner by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <Card key={t.id} className="bg-slate-900/80 border-slate-800 rounded-3xl p-5 space-y-4 hover:border-teal-400/50 transition-all shadow-xl">
            <CardContent className="p-0 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-extrabold text-white">{t.company_name}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" /> {t.headquarters}
                  </div>
                </div>

                <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 text-xs font-mono font-bold">
                  {t.trust_score}% TRUST SCORE
                </Badge>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Fleet Capacity:</span>
                  <strong className="text-white">{t.fleet_size} Trucks</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">GSTIN:</span>
                  <strong className="text-amber-400 font-mono">{t.gstin}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rating:</span>
                  <span className="text-emerald-400 font-bold">★ {t.rating} ({t.reviews_count} reviews)</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Primary Operating Routes</div>
                <div className="flex flex-wrap gap-1">
                  {t.primary_routes.map((r, i) => (
                    <span key={i} className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded-md border border-slate-700">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {t.verified_docs.map((doc, i) => (
                  <span key={i} className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> {doc}
                  </span>
                ))}
              </div>

              <Button 
                onClick={() => toast.success(`Connecting to ${t.company_name} (${t.phone})`)}
                className="w-full h-9 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700"
              >
                <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Contact Fleet Owner ({t.phone})
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
