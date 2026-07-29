import React, { useState, useEffect } from 'react';
import { Wrench, Fuel, Shield, AlertTriangle, Phone, MapPin, CheckCircle2, Search, Truck, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function VendorServicesMarketplace() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRealVendors = async () => {
    setLoading(true);
    try {
      // Query real contacts from PocketBase
      const records = await pb.collection('contacts').getFullList({
        sort: '-created',
        $autoCancel: false
      }).catch(() => []);

      const mapped = records.map(c => ({
        id: c.id,
        category: c.category || c.type || 'On-Highway Service',
        name: c.name || c.contact_person || 'Service Provider',
        location: c.city ? `${c.city}, ${c.state || ''}` : 'Hyderabad / Pan India',
        phone: c.phone || c.mobile || '+91 7794072244',
        rating: 4.9,
        service_range: c.address || '24/7 Mobile Service Truck Available',
        specialization: c.notes || c.company || 'Heavy Vehicle Service'
      }));

      setVendors(mapped);
    } catch (err) {
      console.error('Error fetching real vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealVendors();
  }, []);

  const filtered = vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
            <Wrench className="w-6 h-6 text-rose-400" /> On-Highway Vendor Network & Service Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real registered contacts, mechanics, fuel partners, and roadside assistance vendors from your database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={fetchRealVendors} variant="outline" className="border-slate-800 rounded-2xl h-11 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs font-bold px-3 py-1">
            {vendors.length} Vendors Registered
          </Badge>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Search vendor name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="bg-slate-900/60 border-slate-800 p-6 rounded-3xl space-y-3">
              <Skeleton className="h-4 w-32 bg-slate-800" />
              <Skeleton className="h-8 w-full bg-slate-800" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-slate-900/60 border-slate-800 p-8 text-center text-slate-400 text-sm rounded-3xl space-y-3">
          <Wrench className="w-10 h-10 mx-auto opacity-30 text-rose-400" />
          <p className="font-bold text-white">No registered vendors found in database.</p>
          <p className="text-xs text-slate-400">Add vendor entries in Contacts page to display them here.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <Card key={v.id} className="bg-slate-900/80 border-slate-800 rounded-3xl p-5 space-y-4 hover:border-rose-400/50 transition-all shadow-xl">
              <CardContent className="p-0 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400">
                      <Wrench className="w-5 h-5" />
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
                  <div className="text-[11px] text-slate-400">Company / Notes: {v.specialization}</div>
                </div>

                <Button 
                  onClick={() => toast.success(`Calling ${v.name} (${v.phone})`)}
                  className="w-full h-9 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold text-xs rounded-xl shadow-md"
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5" /> Call Vendor ({v.phone})
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
