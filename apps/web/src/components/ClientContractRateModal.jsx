import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Tag, Save, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientContractRateModal({ isOpen, onClose, clientId, clientName }) {
  const [rates, setRates] = useState([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [agreedFreight, setAgreedFreight] = useState('');
  const [truckType, setTruckType] = useState('32 FT Multi-Axle');

  useEffect(() => {
    if (clientId) {
      const stored = localStorage.getItem(`jbc_contract_rates_${clientId}`);
      if (stored) {
        try { setRates(JSON.parse(stored)); } catch (e) { setRates([]); }
      } else {
        // Default seed for Amazon / corporate clients
        setRates([
          { id: '1', origin: 'HYDERABAD', destination: 'BANGALORE', agreedFreight: 17100, truckType: '32 FT MX' },
          { id: '2', origin: 'WARANGAL', destination: 'HYDERABAD', agreedFreight: 7100, truckType: '32 FT MX' }
        ]);
      }
    }
  }, [clientId]);

  const handleAddRate = (e) => {
    e.preventDefault();
    if (!origin || !destination || !agreedFreight) {
      toast.error('Please enter Origin, Destination, and Agreed Freight rate.');
      return;
    }

    const newRate = {
      id: Date.now().toString(),
      origin: origin.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      agreedFreight: Number(agreedFreight),
      truckType
    };

    const updated = [...rates, newRate];
    setRates(updated);
    localStorage.setItem(`jbc_contract_rates_${clientId}`, JSON.stringify(updated));
    setOrigin('');
    setDestination('');
    setAgreedFreight('');
    toast.success('Contract rate added!');
  };

  const handleDelete = (id) => {
    const updated = rates.filter(r => r.id !== id);
    setRates(updated);
    localStorage.setItem(`jbc_contract_rates_${clientId}`, JSON.stringify(updated));
    toast.success('Rate removed.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-2xl p-6 bg-slate-900 text-white border border-slate-800 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-400">
            <Tag className="w-5 h-5" />
            <span className="text-xs uppercase font-semibold tracking-wider">Contract Rate Master</span>
          </div>
          <DialogTitle className="text-xl font-bold font-heading text-slate-100">
            Contracted Freight Rates: {clientName || 'Corporate Client'}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Pre-configured contract rates auto-fill freight amounts during trip logging and payment requests.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddRate} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 my-2">
          <span className="text-xs font-semibold text-slate-300 block">Add New Agreed Route Tariff</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <Label className="text-[10px] text-slate-400 uppercase">Origin</Label>
              <Input 
                value={origin} 
                onChange={(e) => setOrigin(e.target.value)} 
                placeholder="e.g. HYDERABAD" 
                className="h-8 text-xs bg-slate-900 border-slate-700 text-white mt-1" 
              />
            </div>
            <div>
              <Label className="text-[10px] text-slate-400 uppercase">Destination</Label>
              <Input 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)} 
                placeholder="e.g. BANGALORE" 
                className="h-8 text-xs bg-slate-900 border-slate-700 text-white mt-1" 
              />
            </div>
            <div>
              <Label className="text-[10px] text-slate-400 uppercase">Agreed Rate (₹)</Label>
              <Input 
                type="number" 
                value={agreedFreight} 
                onChange={(e) => setAgreedFreight(e.target.value)} 
                placeholder="17100" 
                className="h-8 text-xs bg-slate-900 border-slate-700 text-white mt-1" 
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" size="sm" className="w-full h-8 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Rate
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <span className="text-xs font-semibold text-slate-400">Active Tariff Rates ({rates.length})</span>
          {rates.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/30 rounded-xl">
              No custom rates configured. Default trip pricing will apply.
            </div>
          ) : (
            rates.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-slate-200">{r.origin} ➔ {r.destination}</span>
                    <span className="text-slate-500 block text-[11px]">{r.truckType || 'Fleet Vehicle'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-500/20 text-emerald-400 font-mono font-bold text-sm px-2.5 py-0.5">
                    ₹{Number(r.agreedFreight).toLocaleString('en-IN')}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="h-7 w-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
