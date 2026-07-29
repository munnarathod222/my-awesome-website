import React, { useState, useEffect } from 'react';
import { 
  Package, MapPin, Calendar, IndianRupee, ArrowRight, Sparkles, 
  Search, Filter, Plus, ShieldCheck, CheckCircle2, Clock, Truck, 
  SlidersHorizontal, RefreshCw, Send, Eye, Download, ChevronRight, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const SAMPLE_LOADS = [
  {
    id: 'LOAD-8801',
    origin: 'Hyderabad, TS',
    destination: 'Mumbai, MH',
    cargo_type: 'Industrial Machinery',
    weight_tons: 18,
    required_truck: '32 FT Container SXL',
    post_date: '2026-07-29',
    pickup_date: '2026-07-30',
    target_price: 48000,
    ai_suggested_price: 49500,
    bids_count: 5,
    status: 'Bidding Open',
    posted_by: 'PharmaTech Corp',
    gstin: '36AAACP8912Z1',
    distance_km: 710,
    eta_hours: 16
  },
  {
    id: 'LOAD-8802',
    origin: 'Bengaluru, KA',
    destination: 'Delhi NCR',
    cargo_type: 'FMCG / Electronics',
    weight_tons: 24,
    required_truck: '40 FT High Cube Trailer',
    post_date: '2026-07-29',
    pickup_date: '2026-07-31',
    target_price: 85000,
    ai_suggested_price: 87200,
    bids_count: 8,
    status: 'Instant Booking Available',
    posted_by: 'Reliance Retail Logistics',
    gstin: '29AAACR7718A1Z5',
    distance_km: 1740,
    eta_hours: 36
  },
  {
    id: 'LOAD-8803',
    origin: 'Chennai, TN',
    destination: 'Kolkata, WB',
    cargo_type: 'Auto Spare Parts',
    weight_tons: 12,
    required_truck: '24 FT Open Body',
    post_date: '2026-07-28',
    pickup_date: '2026-07-30',
    target_price: 62000,
    ai_suggested_price: 61500,
    bids_count: 3,
    status: 'Booked - In Transit',
    posted_by: 'Hyundai Auto Logistics',
    gstin: '33AAACH1192M1Z2',
    distance_km: 1660,
    eta_hours: 32
  },
  {
    id: 'LOAD-8804',
    origin: 'Ahmedabad, GJ',
    destination: 'Hyderabad, TS',
    cargo_type: 'Chemical Drums (Non-Haz)',
    weight_tons: 20,
    required_truck: '32 FT Multi-Axle',
    post_date: '2026-07-29',
    pickup_date: '2026-08-01',
    target_price: 54000,
    ai_suggested_price: 55800,
    bids_count: 4,
    status: 'Bidding Open',
    posted_by: 'Gujarat Synthetics Ltd',
    gstin: '24AAAAG1092F1Z8',
    distance_km: 1210,
    eta_hours: 24
  }
];

export default function LoadMarketplace({ activeRole = 'customer', isShipperView = false }) {
  const [loads, setLoads] = useState(SAMPLE_LOADS);
  const [searchTerm, setSearchTerm] = useState('');
  const [cargoFilter, setCargoFilter] = useState('all');
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [biddingModalOpen, setBiddingModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  // Form State for Posting Load
  const [newLoad, setNewLoad] = useState({
    origin: '',
    destination: '',
    cargo_type: 'FMCG Goods',
    weight_tons: '',
    required_truck: '32 FT Container SXL',
    target_price: '',
    pickup_date: new Date().toISOString().split('T')[0]
  });

  // AI Price Calculator State
  const [aiPrice, setAiPrice] = useState(null);
  const [isCalculatingAi, setIsCalculatingAi] = useState(false);

  const calculateAiPrice = () => {
    if (!newLoad.origin || !newLoad.destination || !newLoad.weight_tons) return;
    setIsCalculatingAi(true);
    setTimeout(() => {
      const weight = Number(newLoad.weight_tons) || 10;
      const baseEstimate = 15000 + (weight * 1800);
      setAiPrice(baseEstimate);
      setNewLoad(p => ({ ...p, target_price: baseEstimate }));
      setIsCalculatingAi(false);
      toast.success(`AI Freight Price calculated: ₹${baseEstimate.toLocaleString('en-IN')}`);
    }, 600);
  };

  const handlePostLoad = (e) => {
    e.preventDefault();
    const created = {
      id: `LOAD-${Math.floor(1000 + Math.random() * 9000)}`,
      ...newLoad,
      weight_tons: Number(newLoad.weight_tons),
      target_price: Number(newLoad.target_price),
      ai_suggested_price: aiPrice || (Number(newLoad.target_price) * 1.03),
      post_date: new Date().toISOString().split('T')[0],
      bids_count: 0,
      status: 'Bidding Open',
      posted_by: 'Jai Bhavani Direct Shipper',
      gstin: '36DPXPR9171A1Z8',
      distance_km: 680,
      eta_hours: 15
    };

    setLoads([created, ...loads]);
    setPostModalOpen(false);
    toast.success(`Load ${created.id} posted successfully to Freight Marketplace!`);
  };

  const handleSubmitBid = () => {
    if (!bidAmount || !selectedLoad) return;
    setLoads(prev => prev.map(l => {
      if (l.id === selectedLoad.id) {
        return { ...l, bids_count: l.bids_count + 1 };
      }
      return l;
    }));
    toast.success(`Bid of ₹${Number(bidAmount).toLocaleString('en-IN')} submitted for ${selectedLoad.id}!`);
    setBiddingModalOpen(false);
    setBidAmount('');
  };

  const filteredLoads = loads.filter(l => {
    const matchesSearch = 
      l.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.cargo_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCargo = cargoFilter === 'all' || l.cargo_type.toLowerCase().includes(cargoFilter.toLowerCase());
    return matchesSearch && matchesCargo;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" /> Load Marketplace & Freight Exchange
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time freight matching, AI price recommendations, and instant transport booking across India.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            onClick={() => setPostModalOpen(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600 rounded-2xl font-bold text-xs shadow-lg shadow-primary/20 h-11"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Post New Freight Load
          </Button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/40 border border-slate-800/80 p-3 rounded-2xl">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search origin, destination, cargo type, or Load ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-950 border-slate-800 text-xs rounded-xl"
          />
        </div>

        <Select value={cargoFilter} onValueChange={setCargoFilter}>
          <SelectTrigger className="bg-slate-950 border-slate-800 text-xs rounded-xl">
            <SelectValue placeholder="All Cargo Types" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 text-xs">
            <SelectItem value="all">All Cargo Types</SelectItem>
            <SelectItem value="Machinery">Machinery & Metals</SelectItem>
            <SelectItem value="FMCG">FMCG & Retail</SelectItem>
            <SelectItem value="Auto">Auto Spare Parts</SelectItem>
            <SelectItem value="Chemical">Chemicals & Industrial</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => { setSearchTerm(''); setCargoFilter('all'); }} className="border-slate-800 rounded-xl text-xs">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Filters
        </Button>
      </div>

      {/* Freight Load Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredLoads.map((load) => (
          <Card key={load.id} className="bg-slate-900/80 border-slate-800 rounded-3xl hover:border-primary/50 transition-all duration-300 shadow-xl overflow-hidden group">
            <CardContent className="p-5 space-y-4">
              
              {/* Header Badge */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                      {load.id}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                      Posted by {load.posted_by}
                    </Badge>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    {load.cargo_type} ({load.weight_tons} Tons)
                  </h3>
                </div>

                <Badge className={`text-xs font-semibold px-3 py-1 ${
                  load.status.includes('Booked') 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-primary/20 text-primary border-primary/30'
                }`}>
                  {load.status}
                </Badge>
              </div>

              {/* Origin to Destination Route */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">PICKUP LOCATION</div>
                  <div className="font-extrabold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" /> {load.origin}
                  </div>
                </div>

                <div className="flex flex-col items-center px-2">
                  <span className="text-[9px] font-mono text-slate-400">{load.distance_km} KM</span>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-rose-500 via-primary to-emerald-500 my-1 relative">
                    <ArrowRight className="w-3 h-3 text-primary absolute -right-1.5 -top-1.5" />
                  </div>
                  <span className="text-[9px] font-mono text-amber-400">~{load.eta_hours} Hours</span>
                </div>

                <div className="space-y-0.5 text-right">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">DROP LOCATION</div>
                  <div className="font-extrabold text-white flex items-center gap-1.5 justify-end">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {load.destination}
                  </div>
                </div>
              </div>

              {/* Pricing & Bids Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">TARGET FREIGHT</div>
                  <div className="font-black text-white text-sm font-mono mt-0.5">
                    ₹{load.target_price.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI PRICE
                  </div>
                  <div className="font-black text-amber-400 text-sm font-mono mt-0.5">
                    ₹{load.ai_suggested_price.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-mono">LIVE BIDS</div>
                  <div className="font-bold text-emerald-400 text-xs mt-0.5">
                    {load.bids_count} Bids Received
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-primary" /> {load.required_truck}
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => { setSelectedLoad(load); setBiddingModalOpen(true); }}
                    className="h-9 px-3 border-slate-700 text-xs rounded-xl text-slate-200 hover:text-white"
                  >
                    Place Bid
                  </Button>

                  <Button 
                    size="sm"
                    onClick={() => toast.success(`Instant booking initiated for ${load.id}!`)}
                    className="h-9 px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-md"
                  >
                    Book Load Now
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post Load Modal */}
      <Dialog open={postModalOpen} onOpenChange={setPostModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-3xl max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Post New Cargo Freight Load
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              List your cargo load to receive instant bids from 50+ verified transport partners.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePostLoad} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Pickup Location</Label>
                <Input 
                  required
                  placeholder="e.g. Hyderabad, TS" 
                  value={newLoad.origin}
                  onChange={(e) => setNewLoad({ ...newLoad, origin: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Drop Location</Label>
                <Input 
                  required
                  placeholder="e.g. Mumbai, MH" 
                  value={newLoad.destination}
                  onChange={(e) => setNewLoad({ ...newLoad, destination: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Cargo Description</Label>
                <Input 
                  required
                  placeholder="e.g. Industrial Machinery" 
                  value={newLoad.cargo_type}
                  onChange={(e) => setNewLoad({ ...newLoad, cargo_type: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Total Weight (Tons)</Label>
                <Input 
                  type="number"
                  required
                  placeholder="e.g. 18" 
                  value={newLoad.weight_tons}
                  onChange={(e) => setNewLoad({ ...newLoad, weight_tons: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Required Truck Type</Label>
              <Select value={newLoad.required_truck} onValueChange={(v) => setNewLoad({ ...newLoad, required_truck: v })}>
                <SelectTrigger className="bg-slate-950 border-slate-800 text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-xs">
                  <SelectItem value="32 FT Container SXL">32 FT Container SXL</SelectItem>
                  <SelectItem value="40 FT High Cube Trailer">40 FT High Cube Trailer</SelectItem>
                  <SelectItem value="24 FT Open Body">24 FT Open Body</SelectItem>
                  <SelectItem value="32 FT Multi-Axle">32 FT Multi-Axle</SelectItem>
                  <SelectItem value="Cold Storage Reefer">Cold Storage Reefer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AI Rate Estimator Trigger */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-2">
              <div className="text-xs space-y-0.5">
                <div className="font-extrabold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Freight Price Estimator
                </div>
                <div className="text-[11px] text-slate-400">
                  {aiPrice ? `Suggested Price: ₹${aiPrice.toLocaleString('en-IN')}` : 'Calculate market price based on diesel & distance'}
                </div>
              </div>
              <Button 
                type="button" 
                size="sm"
                onClick={calculateAiPrice}
                disabled={isCalculatingAi}
                className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shrink-0"
              >
                {isCalculatingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Get AI Rate'}
              </Button>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Your Offer Price (₹)</Label>
              <Input 
                type="number"
                required
                placeholder="e.g. 48000" 
                value={newLoad.target_price}
                onChange={(e) => setNewLoad({ ...newLoad, target_price: e.target.value })}
                className="bg-slate-950 border-slate-800 text-xs rounded-xl font-mono font-bold"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setPostModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl">
                Publish Load to Marketplace
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bidding Modal */}
      <Dialog open={biddingModalOpen} onOpenChange={setBiddingModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-3xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-400" /> Submit Bidding Counter-Offer
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Submit your bid price for load {selectedLoad?.id} ({selectedLoad?.origin} → {selectedLoad?.destination}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
              <div className="text-slate-400 font-mono">Shipper Target Price: <span className="text-white font-bold">₹{selectedLoad?.target_price?.toLocaleString('en-IN')}</span></div>
              <div className="text-amber-400 font-mono">AI Recommended Price: <span className="font-bold">₹{selectedLoad?.ai_suggested_price?.toLocaleString('en-IN')}</span></div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Your Bid Amount (₹)</Label>
              <Input 
                type="number"
                placeholder="Enter competitive bid price" 
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="bg-slate-950 border-slate-800 text-sm font-bold font-mono text-emerald-400 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBiddingModalOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button onClick={handleSubmitBid} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl">
              Confirm & Submit Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
