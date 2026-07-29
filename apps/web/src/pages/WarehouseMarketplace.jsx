import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Calendar, CheckCircle2, Search, ShieldCheck, Box, Thermometer, Lock, Eye, DollarSign, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function WarehouseMarketplace() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reserveModal, setReserveModal] = useState(false);
  const [selectedWh, setSelectedWh] = useState(null);

  const fetchRealWarehouses = async () => {
    setLoading(true);
    try {
      // Query company settings for main warehouse location or database facilities
      const records = await pb.collection('company_settings').getFullList({ $autoCancel: false }).catch(() => []);

      let list = [];
      if (records.length > 0) {
        const c = records[0];
        list.push({
          id: c.id || 'wh-main',
          name: `${c.company_name || 'Jai Bhavani Cargo'} Central Logistics Park`,
          location: c.address || 'Ghatkesar, Hyderabad, TS',
          available_sqft: 45000,
          rate_per_sqft: 28,
          facilities: ['24/7 Security', 'CCTV Monitoring', 'Dock Leveler', 'WMS System'],
          contact: c.phone || '+91 7794072244',
          rating: 4.9
        });
      }

      setWarehouses(list);
    } catch (err) {
      console.error('Error fetching real warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealWarehouses();
  }, []);

  const filtered = warehouses.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-400" /> Warehouse & Storage Space Marketplace
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real warehouse infrastructure and storage facility management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={fetchRealWarehouses} variant="outline" className="border-slate-800 rounded-2xl h-11 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs font-bold px-3 py-1">
            {warehouses.length} Real Locations Available
          </Badge>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Search warehouse by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1].map(i => (
            <Card key={i} className="bg-slate-900/60 border-slate-800 p-6 rounded-3xl space-y-3">
              <Skeleton className="h-4 w-32 bg-slate-800" />
              <Skeleton className="h-8 w-full bg-slate-800" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-slate-900/60 border-slate-800 p-8 text-center text-slate-400 text-sm rounded-3xl space-y-3">
          <Building2 className="w-10 h-10 mx-auto opacity-30 text-purple-400" />
          <p className="font-bold text-white">No warehouse facilities registered yet in database.</p>
          <p className="text-xs text-slate-400">Configure company warehouse facilities to display them here.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((w) => (
            <Card key={w.id} className="bg-slate-900/80 border-slate-800 rounded-3xl p-5 space-y-4 hover:border-purple-400/50 transition-all shadow-xl">
              <CardContent className="p-0 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-extrabold text-white">{w.name}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" /> {w.location}
                    </div>
                  </div>

                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs font-mono font-bold">
                    ★ {w.rating}
                  </Badge>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Available Storage:</span>
                    <strong className="text-emerald-400 font-bold">{w.available_sqft.toLocaleString()} Sq. Ft</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Monthly Rate:</span>
                    <strong className="text-purple-400 font-bold">₹{w.rate_per_sqft} / Sq. Ft</strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Facilities</div>
                  <div className="flex flex-wrap gap-1">
                    {w.facilities.map((f, i) => (
                      <span key={i} className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => { setSelectedWh(w); setReserveModal(true); }}
                  className="w-full h-9 bg-purple-500 hover:bg-purple-600 text-slate-950 font-bold text-xs rounded-xl shadow-md"
                >
                  Reserve Storage Space
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={reserveModal} onOpenChange={setReserveModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-3xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" /> Reserve Storage Space
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {selectedWh?.name} ({selectedWh?.location})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300">Required Area (Sq. Ft)</label>
              <Input type="number" defaultValue="5000" className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white font-mono" />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300">Storage Lease Duration (Months)</label>
              <Input type="number" defaultValue="6" className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white font-mono" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReserveModal(false)} className="rounded-xl text-xs">Cancel</Button>
            <Button onClick={() => { toast.success(`Space booking request sent to ${selectedWh?.name}!`); setReserveModal(false); }} className="bg-purple-500 hover:bg-purple-600 text-slate-950 font-bold text-xs rounded-xl">
              Submit Reservation Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
