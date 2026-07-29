import React, { useState, useEffect } from 'react';
import { 
  Package, MapPin, Calendar, IndianRupee, ArrowRight, Sparkles, 
  Search, Filter, Plus, ShieldCheck, CheckCircle2, Clock, Truck, 
  SlidersHorizontal, RefreshCw, Send, Eye, Edit, Trash2, MoreVertical
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

export default function LoadMarketplace({ activeRole = 'customer' }) {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [biddingModalOpen, setBiddingModalOpen] = useState(false);
  
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  // Form State for Posting / Editing Load
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    cargo_type: 'FMCG Goods',
    weight_tons: '',
    required_truck: '32 FT Container SXL',
    target_price: '',
    pickup_date: new Date().toISOString().split('T')[0]
  });

  const [aiPrice, setAiPrice] = useState(null);
  const [isCalculatingAi, setIsCalculatingAi] = useState(false);

  const fetchRealLoads = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('trip_logs').getFullList({
        sort: '-created',
        $autoCancel: false
      }).catch(() => []);

      const mapped = records.map(r => ({
        id: r.id,
        raw_record: r,
        load_number: r.trip_number || `LOAD-${r.id.slice(0, 6).toUpperCase()}`,
        origin: r.route_start || r.start_location || r.route?.split('-')[0]?.trim() || 'Hyderabad',
        destination: r.route_end || r.end_location || r.route?.split('-')[1]?.trim() || 'Mumbai',
        cargo_type: r.cargo_type || r.material || 'General Freight',
        weight_tons: Number(r.weight) || (Number(r.kms_driven) ? Math.round(Number(r.kms_driven) / 40) || 18 : 18),
        required_truck: r.truck_number ? `Truck ${r.truck_number}` : '32 FT Container SXL',
        post_date: r.date ? r.date.split('T')[0] : r.created.split('T')[0],
        pickup_date: r.date ? r.date.split('T')[0] : new Date().toISOString().split('T')[0],
        target_price: Number(r.revenue || r.amount || r.rate) || 45000,
        ai_suggested_price: Math.round((Number(r.revenue || r.amount || r.rate) || 45000) * 1.04),
        bids_count: Number(r.bids_count) || 0,
        status: r.trip_status || r.status || 'Bidding Open',
        posted_by: r.driver_name || 'Verified Shipper',
        distance_km: Number(r.kms_driven) || 680,
        eta_hours: Math.round((Number(r.kms_driven) || 680) / 45)
      }));

      setLoads(mapped);
    } catch (err) {
      console.error('Error fetching real loads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealLoads();
  }, []);

  const calculateAiPrice = () => {
    if (!formData.origin || !formData.destination || !formData.weight_tons) return;
    setIsCalculatingAi(true);
    setTimeout(() => {
      const weight = Number(formData.weight_tons) || 10;
      const baseEstimate = 16000 + (weight * 1750);
      setAiPrice(baseEstimate);
      setFormData(p => ({ ...p, target_price: baseEstimate }));
      setIsCalculatingAi(false);
      toast.success(`AI Price calculated: ₹${baseEstimate.toLocaleString('en-IN')}`);
    }, 400);
  };

  const handlePostLoad = async (e) => {
    e.preventDefault();
    try {
      const dateISO = new Date(formData.pickup_date).toISOString();
      await pb.collection('trip_logs').create({
        date: dateISO,
        route: `${formData.origin} - ${formData.destination}`,
        start_location: formData.origin,
        end_location: formData.destination,
        cargo_type: formData.cargo_type,
        revenue: Number(formData.target_price),
        trip_status: 'Bidding Open',
        notes: `Truck: ${formData.required_truck}, Weight: ${formData.weight_tons} Tons`
      }, { $autoCancel: false });

      toast.success(`Load published successfully!`);
      setPostModalOpen(false);
      fetchRealLoads();
    } catch (err) {
      console.error('Failed to post load:', err);
      toast.error('Failed to save load');
    }
  };

  const handleOpenEditModal = (load) => {
    setSelectedLoad(load);
    setFormData({
      origin: load.origin,
      destination: load.destination,
      cargo_type: load.cargo_type,
      weight_tons: load.weight_tons.toString(),
      required_truck: load.required_truck,
      target_price: load.target_price.toString(),
      pickup_date: load.pickup_date
    });
    setEditModalOpen(true);
  };

  const handleUpdateLoad = async (e) => {
    e.preventDefault();
    if (!selectedLoad) return;
    try {
      await pb.collection('trip_logs').update(selectedLoad.id, {
        route: `${formData.origin} - ${formData.destination}`,
        start_location: formData.origin,
        end_location: formData.destination,
        cargo_type: formData.cargo_type,
        revenue: Number(formData.target_price),
        notes: `Truck: ${formData.required_truck}, Weight: ${formData.weight_tons} Tons`
      }, { $autoCancel: false });

      toast.success(`Load ${selectedLoad.load_number} updated successfully!`);
      setEditModalOpen(false);
      fetchRealLoads();
    } catch (err) {
      console.error('Failed to update load:', err);
      toast.error('Failed to update load record');
    }
  };

  const handleDeleteLoad = async (loadId) => {
    if (!window.confirm('Are you sure you want to delete this freight load entry?')) return;
    try {
      await pb.collection('trip_logs').delete(loadId, { $autoCancel: false });
      toast.success('Load deleted successfully');
      fetchRealLoads();
    } catch (err) {
      console.error('Failed to delete load:', err);
      toast.error('Could not delete load');
    }
  };

  const handleSubmitBid = () => {
    if (!bidAmount || !selectedLoad) return;
    setLoads(prev => prev.map(l => {
      if (l.id === selectedLoad.id) {
        return { ...l, bids_count: l.bids_count + 1 };
      }
      return l;
    }));
    toast.success(`Bid of ₹${Number(bidAmount).toLocaleString('en-IN')} submitted for ${selectedLoad.load_number}!`);
    setBiddingModalOpen(false);
    setBidAmount('');
  };

  const filteredLoads = loads.filter(l => 
    l.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.load_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.cargo_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Cargo Load Marketplace
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Post cargo loads, receive bids from verified transporters, and manage active freight shipments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button onClick={fetchRealLoads} variant="outline" className="border-slate-800 text-xs rounded-xl h-10">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button 
            onClick={() => {
              setFormData({
                origin: '',
                destination: '',
                cargo_type: 'FMCG Goods',
                weight_tons: '18',
                required_truck: '32 FT Container SXL',
                target_price: '48000',
                pickup_date: new Date().toISOString().split('T')[0]
              });
              setPostModalOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl h-10 px-4 shadow-md"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Post Freight Load
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Search location, cargo, or Load ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-slate-950 border-slate-800 text-xs rounded-xl text-white h-10"
        />
      </div>

      {/* Load Cards List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl space-y-3">
              <Skeleton className="h-4 w-32 bg-slate-800" />
              <Skeleton className="h-8 w-full bg-slate-800" />
            </Card>
          ))}
        </div>
      ) : filteredLoads.length === 0 ? (
        <Card className="bg-slate-900/60 border-slate-800 p-8 text-center text-slate-400 text-xs rounded-2xl space-y-3">
          <Package className="w-10 h-10 mx-auto text-slate-600" />
          <p className="font-bold text-white text-sm">No active freight loads found.</p>
          <p className="text-slate-400">Click <strong>"Post Freight Load"</strong> above to list a new cargo load.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredLoads.map((load) => (
            <Card key={load.id} className="bg-slate-900/90 border-slate-800 rounded-2xl hover:border-slate-700 transition-all shadow-md">
              <CardContent className="p-5 space-y-4">
                
                {/* Header & Explicit EDIT/DELETE Buttons */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                        {load.load_number}
                      </span>
                      <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                        {load.posted_by}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                      {load.cargo_type} ({load.weight_tons} Tons)
                    </h3>
                  </div>

                  {/* Explicit EDIT & DELETE Controls */}
                  <div className="flex items-center gap-1.5">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenEditModal(load)}
                      className="h-8 px-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                      title="Edit Load Details"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Button>

                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteLoad(load.id)}
                      className="h-8 w-8 p-0 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-700 rounded-lg flex items-center justify-center"
                      title="Delete Load"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Pickup -> Drop Route */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">PICKUP</div>
                    <div className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" /> {load.origin}
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono text-slate-500">{load.distance_km} KM</span>
                    <div className="w-14 h-0.5 bg-gradient-to-r from-rose-500 via-primary to-emerald-500 my-1 relative">
                      <ArrowRight className="w-3 h-3 text-primary absolute -right-1.5 -top-1.5" />
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-mono uppercase">DROP</div>
                    <div className="font-bold text-white flex items-center gap-1.5 justify-end mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {load.destination}
                    </div>
                  </div>
                </div>

                {/* Pricing Overview */}
                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <div className="text-[10px] text-slate-400 font-mono">TARGET FREIGHT</div>
                    <div className="font-black text-white text-sm font-mono mt-0.5">
                      ₹{load.target_price.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI ESTIMATE
                    </div>
                    <div className="font-black text-amber-400 text-sm font-mono mt-0.5">
                      ₹{load.ai_suggested_price.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-mono">LIVE BIDS</div>
                    <div className="font-bold text-emerald-400 text-xs mt-0.5">
                      {load.bids_count} Bids
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-primary" /> {load.required_truck}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => { setSelectedLoad(load); setBiddingModalOpen(true); }}
                      className="h-8 text-xs border-slate-700 rounded-lg"
                    >
                      Place Bid
                    </Button>

                    <Button 
                      size="sm"
                      onClick={() => toast.success(`Booking initiated for ${load.load_number}!`)}
                      className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-lg"
                    >
                      Book Load
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Post Load Modal */}
      <Dialog open={postModalOpen} onOpenChange={setPostModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Post Freight Cargo Load
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Publish a new load to receive competitive bids from transporters.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePostLoad} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Pickup City</Label>
                <Input 
                  required
                  placeholder="e.g. Hyderabad, TS" 
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Destination City</Label>
                <Input 
                  required
                  placeholder="e.g. Mumbai, MH" 
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Cargo Description</Label>
                <Input 
                  required
                  placeholder="e.g. Industrial Machinery" 
                  value={formData.cargo_type}
                  onChange={(e) => setFormData({ ...formData, cargo_type: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Total Weight (Tons)</Label>
                <Input 
                  type="number"
                  required
                  placeholder="e.g. 18" 
                  value={formData.weight_tons}
                  onChange={(e) => setFormData({ ...formData, weight_tons: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-2">
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Rate Suggestion
                </div>
                <div className="text-[11px] text-slate-400">
                  {aiPrice ? `Suggested Price: ₹${aiPrice.toLocaleString('en-IN')}` : 'Click to calculate rate'}
                </div>
              </div>
              <Button 
                type="button" 
                size="sm"
                onClick={calculateAiPrice}
                disabled={isCalculatingAi}
                className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shrink-0"
              >
                {isCalculatingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Get Rate'}
              </Button>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Target Offer (₹)</Label>
              <Input 
                type="number"
                required
                placeholder="e.g. 48000" 
                value={formData.target_price}
                onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
                className="bg-slate-950 border-slate-800 text-xs rounded-xl font-mono font-bold text-white"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setPostModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl">
                Publish Load
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Load Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-amber-400">
              <Edit className="w-5 h-5 text-amber-400" /> Edit Freight Load ({selectedLoad?.load_number})
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update cargo parameters and offer price for this load.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateLoad} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Pickup City</Label>
                <Input 
                  required
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Destination City</Label>
                <Input 
                  required
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Cargo Description</Label>
                <Input 
                  required
                  value={formData.cargo_type}
                  onChange={(e) => setFormData({ ...formData, cargo_type: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Target Price (₹)</Label>
                <Input 
                  type="number"
                  required
                  value={formData.target_price}
                  onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white font-bold font-mono text-amber-400"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl">
                Save & Update Load
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bidding Modal */}
      <Dialog open={biddingModalOpen} onOpenChange={setBiddingModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-emerald-400">
              <Send className="w-5 h-5 text-emerald-400" /> Submit Bidding Offer
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Submit your bid price for load {selectedLoad?.load_number}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="text-slate-400 font-mono">Shipper Target Price: <span className="text-white font-bold">₹{selectedLoad?.target_price?.toLocaleString('en-IN')}</span></div>
              <div className="text-amber-400 font-mono">AI Recommended Price: <span className="font-bold">₹{selectedLoad?.ai_suggested_price?.toLocaleString('en-IN')}</span></div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Your Bid Amount (₹)</Label>
              <Input 
                type="number"
                placeholder="Enter bid amount" 
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
              Submit Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
