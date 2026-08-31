import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Building2, MapPin, Truck, DollarSign, Plus, Calculator, ExternalLink, Paperclip, Image as ImageIcon, X } from 'lucide-react';
import { format } from 'date-fns';

const VEHICLE_OPTIONS = [
  '32FTSXL',
  '32FT MXL',
  '24FTSXL',
  '20FTSXL',
  '14FT',
  '17FT',
  '40FT High Cube',
  '42FT SXL'
];

export default function AddBidModal({
  isOpen,
  onClose,
  onAddBid,
  clients = [],
  defaultClient = 'Delhivery',
  defaultType = 'Contract'
}) {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    client_name: defaultClient || 'Delhivery',
    bidding_type: defaultType || 'Contract',
    vehicle_type: '32FTSXL',
    bidding_amount: '',
    bidding_lost_at: '',
    trip_detail: '2 Way',
    starting_point: 'HYD_Medchal GW',
    ending_point: '',
    no_of_stops: 1,
    route_map: '',
    status: 'Not bidded',
    attachments: [],
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        client_name: defaultClient || 'Delhivery',
        bidding_type: defaultType || 'Contract',
        date: format(new Date(), 'yyyy-MM-dd'),
        attachments: []
      }));
    }
  }, [isOpen, defaultClient, defaultType]);

  const handleImageFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImgs = [];
    let count = 0;
    Array.from(files).forEach(f => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) newImgs.push(evt.target.result);
        count++;
        if (count === files.length) {
          setFormData(p => ({ ...p, attachments: [...(p.attachments || []), ...newImgs] }));
          toast.success(`Attached ${newImgs.length} image(s)`);
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.starting_point || !formData.ending_point) {
      toast.error('Please enter starting point and ending point');
      return;
    }

    const newBid = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...formData,
      bidding_amount: formData.bidding_amount ? Number(formData.bidding_amount) : '',
      bidding_lost_at: formData.bidding_lost_at ? Number(formData.bidding_lost_at) : '',
      no_of_stops: Number(formData.no_of_stops || 1)
    };

    onAddBid?.(newBid);
    toast.success(`Bid added for ${newBid.client_name} (${newBid.bidding_type})`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] bg-slate-950 border-slate-800 text-slate-100 shadow-2xl">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-100">Add New Freight Bid</DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Record contract or spot load bidding details with client linking
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-semibold">
              {formData.bidding_type} Bid
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Row 1: Client & Bidding Type & Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-300">Client / Counterparty</Label>
              <Input 
                value={formData.client_name}
                onChange={(e) => setFormData(p => ({ ...p, client_name: e.target.value }))}
                placeholder="e.g. Delhivery, Amazon"
                className="h-9 mt-1 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-300">Bidding Type</Label>
              <Select 
                value={formData.bidding_type} 
                onValueChange={(val) => setFormData(p => ({ ...p, bidding_type: val }))}
              >
                <SelectTrigger className="h-9 mt-1 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="Contract">Contract (Dedicated)</SelectItem>
                  <SelectItem value="Spot">Spot (Ad-hoc Load)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-300">Bid Date</Label>
              <Input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                className="h-9 mt-1 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"
                required
              />
            </div>
          </div>

          {/* Row 2: Origin & Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Starting Point (Origin)
              </Label>
              <Input 
                value={formData.starting_point}
                onChange={(e) => setFormData(p => ({ ...p, starting_point: e.target.value }))}
                placeholder="e.g. HYD_Medchal GW"
                className="h-9 mt-1 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> Ending Point (Destination)
              </Label>
              <Input 
                value={formData.ending_point}
                onChange={(e) => setFormData(p => ({ ...p, ending_point: e.target.value }))}
                placeholder="e.g. Mahabubnagar_boyapally"
                className="h-9 mt-1 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"
                required
              />
            </div>
          </div>

          {/* Row 3: Vehicle Type, Trip Detail & Stops */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-purple-400" /> Vehicle Type
              </Label>
              <Select 
                value={formData.vehicle_type} 
                onValueChange={(val) => setFormData(p => ({ ...p, vehicle_type: val }))}
              >
                <SelectTrigger className="h-9 mt-1 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  {VEHICLE_OPTIONS.map(v => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-300">Trip Detail</Label>
              <Select 
                value={formData.trip_detail} 
                onValueChange={(val) => setFormData(p => ({ ...p, trip_detail: val }))}
              >
                <SelectTrigger className="h-9 mt-1 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="1 Way">1 Way (One-Way)</SelectItem>
                  <SelectItem value="2 Way">2 Way (Round Trip)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-300">No of Stops</Label>
              <Input 
                type="number"
                min="0"
                value={formData.no_of_stops}
                onChange={(e) => setFormData(p => ({ ...p, no_of_stops: e.target.value }))}
                className="h-9 mt-1 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Row 4: Pricing & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-cyan-400" /> Bidding Amount (₹)
              </Label>
              <Input 
                type="number"
                placeholder="Our bid amount"
                value={formData.bidding_amount}
                onChange={(e) => setFormData(p => ({ ...p, bidding_amount: e.target.value }))}
                className="h-9 mt-1 bg-slate-900 border-slate-800 text-cyan-400 font-bold text-xs rounded-xl tabular-nums"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-rose-400" /> Bidding Lost At (₹)
              </Label>
              <Input 
                type="number"
                placeholder="Competitor rate"
                value={formData.bidding_lost_at}
                onChange={(e) => setFormData(p => ({ ...p, bidding_lost_at: e.target.value }))}
                className="h-9 mt-1 bg-slate-900 border-slate-800 text-rose-400 font-bold text-xs rounded-xl tabular-nums"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-300">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData(p => ({ ...p, status: val }))}
              >
                <SelectTrigger className="h-9 mt-1 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="Not bidded">Not bidded</SelectItem>
                  <SelectItem value="Bidded">Bidded</SelectItem>
                  <SelectItem value="Won">Won</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 5: Route Map URL */}
          <div>
            <Label className="text-xs font-semibold text-slate-300">Google Maps Route Map URL</Label>
            <Input 
              type="url"
              placeholder="https://maps.app.goo.gl/..."
              value={formData.route_map}
              onChange={(e) => setFormData(p => ({ ...p, route_map: e.target.value }))}
              className="h-9 mt-1 bg-slate-900 border-slate-800 text-slate-300 text-xs rounded-xl"
            />
          </div>

          {/* Row 6: Attach Images / Documents */}
          <div>
            <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5 text-cyan-400" /> Attach Contract/Spot Images (Rate Cards, Email RFQs, Route Photos)
            </Label>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              {(formData.attachments || []).map((img, idx) => (
                <div key={idx} className="relative group/att border border-slate-800 rounded-lg p-0.5 bg-slate-900">
                  <img src={img} alt={`Att ${idx+1}`} className="w-10 h-10 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, attachments: p.attachments.filter((_, i) => i !== idx) }))}
                    className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-0.5 shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="cursor-pointer border border-dashed border-slate-700 hover:border-cyan-500 bg-slate-900/60 hover:bg-slate-900 p-2.5 rounded-xl flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Upload Images</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageFileChange} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose} className="h-9 text-xs rounded-xl text-slate-400">
              Cancel
            </Button>
            <Button type="submit" className="h-9 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-600/20">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Bid Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
