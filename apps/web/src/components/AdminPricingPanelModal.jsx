import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save, ShieldCheck, DollarSign, Truck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_PRICING_RULES, getFreightPricingRules, saveFreightPricingRules } from '@/lib/pricingEngine.js';

export default function AdminPricingPanelModal({ isOpen, onClose, onSaved }) {
  const [rules, setRules] = useState(DEFAULT_PRICING_RULES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getFreightPricingRules().then(res => setRules(res));
    }
  }, [isOpen]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveFreightPricingRules(rules);
      toast.success('Admin Freight Pricing Rules Updated Successfully!');
      if (onSaved) onSaved(rules);
      onClose();
    } catch (err) {
      toast.error('Failed to save pricing rules.');
    } finally {
      setSaving(false);
    }
  };

  const updateVehicleRate = (vId, rate) => {
    setRules(prev => ({
      ...prev,
      vehicleRates: {
        ...prev.vehicleRates,
        [vId]: {
          ...prev.vehicleRates[vId],
          ratePerKm: Number(rate) || 0
        }
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl rounded-3xl bg-slate-950 border-slate-800 text-slate-100 p-6 space-y-4 font-sans">
        <DialogHeader className="border-b border-slate-800 pb-3">
          <DialogTitle className="text-lg font-extrabold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> Admin Freight Pricing Rules Panel
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Base Surcharges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-[10px] font-bold text-slate-400 uppercase">Minimum Freight (₹)</Label>
              <Input
                type="number"
                value={rules.minFreight}
                onChange={(e) => setRules({ ...rules, minFreight: Number(e.target.value) })}
                className="bg-slate-900 border-slate-800 text-xs h-9 mt-1 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <Label className="text-[10px] font-bold text-slate-400 uppercase">Loading Charge (₹)</Label>
              <Input
                type="number"
                value={rules.loadingCharge}
                onChange={(e) => setRules({ ...rules, loadingCharge: Number(e.target.value) })}
                className="bg-slate-900 border-slate-800 text-xs h-9 mt-1 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <Label className="text-[10px] font-bold text-slate-400 uppercase">Toll Est. / KM (₹)</Label>
              <Input
                type="number"
                step="0.1"
                value={rules.tollPerKm}
                onChange={(e) => setRules({ ...rules, tollPerKm: Number(e.target.value) })}
                className="bg-slate-900 border-slate-800 text-xs h-9 mt-1 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <Label className="text-[10px] font-bold text-slate-400 uppercase">Fuel Surcharge (%)</Label>
              <Input
                type="number"
                value={rules.fuelSurchargePct}
                onChange={(e) => setRules({ ...rules, fuelSurchargePct: Number(e.target.value) })}
                className="bg-slate-900 border-slate-800 text-xs h-9 mt-1 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <Label className="text-[10px] font-bold text-slate-400 uppercase">Night Transit (₹)</Label>
              <Input
                type="number"
                value={rules.nightCharge}
                onChange={(e) => setRules({ ...rules, nightCharge: Number(e.target.value) })}
                className="bg-slate-900 border-slate-800 text-xs h-9 mt-1 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <Label className="text-[10px] font-bold text-slate-400 uppercase">Urgent Surcharge (%)</Label>
              <Input
                type="number"
                value={rules.urgentSurchargePct}
                onChange={(e) => setRules({ ...rules, urgentSurchargePct: Number(e.target.value) })}
                className="bg-slate-900 border-slate-800 text-xs h-9 mt-1 rounded-xl text-white font-mono"
              />
            </div>
          </div>

          {/* Per Vehicle Per KM Rates */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-400" /> Vehicle Per-KM Rates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(rules.vehicleRates || {}).map(([vId, vObj]) => (
                <div key={vId} className="flex items-center justify-between p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-300 truncate max-w-[170px]">{vObj.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 font-mono">₹</span>
                    <Input
                      type="number"
                      value={vObj.ratePerKm}
                      onChange={(e) => updateVehicleRate(vId, e.target.value)}
                      className="w-16 h-7 text-xs bg-slate-950 border-slate-800 text-emerald-400 font-mono font-bold px-1.5 rounded-lg text-center"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">/km</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose} className="text-xs text-slate-400">Cancel</Button>
            <Button type="submit" disabled={saving} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
              <Save className="w-3.5 h-3.5 mr-1" /> Save Pricing Rules
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
