import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Truck, Calculator, IndianRupee, Calendar, Wrench, ShieldAlert, Loader2, Save } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { saveTruckTCOOverride, getTruckTCOOverride } from '@/lib/tcoUtils.js';

export default function EditTruckTCOModal({ isOpen, onClose, truckTCO, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    purchase_price: '',
    body_building_cost: '',
    salvage_value: '',
    odometer_km: '',
    year_of_manufacture: '',
    annual_insurance: '',
    breakdown_days: '',
    daily_opportunity_cost: '',
    manual_maintenance_cost: ''
  });

  useEffect(() => {
    if (isOpen && truckTCO) {
      setFormData({
        purchase_price: (truckTCO.purchasePrice || 3200000).toString(),
        body_building_cost: (truckTCO.bodyBuildingCost || 350000).toString(),
        salvage_value: (truckTCO.estimatedSalvageValue || 650000).toString(),
        odometer_km: (truckTCO.totalDistanceKm || 145000).toString(),
        year_of_manufacture: (truckTCO.purchaseYear || 2020).toString(),
        annual_insurance: (truckTCO.insurancePerYear || 45000).toString(),
        breakdown_days: (truckTCO.estimatedBreakdownDays || 12).toString(),
        daily_opportunity_cost: (truckTCO.dailyOpportunityCost || 5000).toString(),
        manual_maintenance_cost: (truckTCO.totalMaintenanceCost || 0).toString(),
        manual_operating_cost: (truckTCO.totalOperatingCost || 0).toString(),
        manual_total_revenue: (truckTCO.totalTripRevenue || 0).toString()
      });
    }
  }, [isOpen, truckTCO]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!truckTCO) return;

    setLoading(true);
    try {
      const payload = {
        purchase_price: parseFloat(formData.purchase_price) || 0,
        body_building_cost: parseFloat(formData.body_building_cost) || 0,
        salvage_value: parseFloat(formData.salvage_value) || 0,
        odometer_km: parseFloat(formData.odometer_km) || 0,
        year_of_manufacture: parseInt(formData.year_of_manufacture, 10) || 2020,
        annual_insurance: parseFloat(formData.annual_insurance) || 0,
        breakdown_days: parseFloat(formData.breakdown_days) || 0,
        daily_opportunity_cost: parseFloat(formData.daily_opportunity_cost) || 0,
        manual_maintenance_cost: parseFloat(formData.manual_maintenance_cost) || 0,
        manual_operating_cost: parseFloat(formData.manual_operating_cost) || 0,
        manual_total_revenue: parseFloat(formData.manual_total_revenue) || 0
      };

      // 1. Try to update PocketBase record
      try {
        await pb.collection('trucks').update(truckTCO.truckId, payload, { $autoCancel: false });
      } catch (err) {
        console.log('[EditTruckTCOModal] PocketBase update fallback to local storage:', err?.message);
      }

      // 2. Always update local override store
      saveTruckTCOOverride(truckTCO.truckId, payload);
      saveTruckTCOOverride(truckTCO.truckNumber, payload);

      toast.success(`TCO financial values updated for ${truckTCO.truckNumber}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update TCO values:', err);
      toast.error('Failed to save TCO values');
    } finally {
      setLoading(false);
    }
  };

  if (!truckTCO) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px] bg-card text-card-foreground border-border shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold font-heading">
            <Calculator className="w-5 h-5 text-primary" />
            Edit TCO Values — {truckTCO.truckNumber}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="p-3 bg-muted/20 border border-border/50 rounded-xl text-xs flex justify-between items-center">
            <div>
              <p className="font-bold text-foreground">{truckTCO.truckName} ({truckTCO.manufacturer})</p>
              <p className="text-muted-foreground">Current Signal: <span className="font-semibold text-primary">{truckTCO.signalTitle}</span></p>
            </div>
            <div className="text-right font-mono font-bold text-sm text-primary">
              ₹{truckTCO.costPerKm} / km
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-xs">Initial Vehicle Purchase Price (₹)</Label>
              <Input 
                type="number"
                min="0"
                step="10000"
                value={formData.purchase_price}
                onChange={(e) => handleChange('purchase_price', e.target.value)}
                className="bg-background font-mono font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-xs">Body Building & Setup Cost (₹)</Label>
              <Input 
                type="number"
                min="0"
                step="5000"
                value={formData.body_building_cost}
                onChange={(e) => handleChange('body_building_cost', e.target.value)}
                className="bg-background font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-xs text-emerald-400">Current Resale / Salvage Value (₹)</Label>
              <Input 
                type="number"
                min="0"
                step="10000"
                value={formData.salvage_value}
                onChange={(e) => handleChange('salvage_value', e.target.value)}
                className="bg-background font-mono font-bold text-emerald-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-xs">Odometer Mileage (KMs)</Label>
              <Input 
                type="number"
                min="0"
                step="1000"
                value={formData.odometer_km}
                onChange={(e) => handleChange('odometer_km', e.target.value)}
                className="bg-background font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-xs">Year of Purchase / Manufacture</Label>
              <Input 
                type="number"
                min="2005"
                max={new Date().getFullYear()}
                value={formData.year_of_manufacture}
                onChange={(e) => handleChange('year_of_manufacture', e.target.value)}
                className="bg-background font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-xs">Annual Insurance Premium (₹)</Label>
              <Input 
                type="number"
                min="0"
                step="1000"
                value={formData.annual_insurance}
                onChange={(e) => handleChange('annual_insurance', e.target.value)}
                className="bg-background font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
            <div className="space-y-2">
              <Label className="font-semibold text-xs text-amber-400">Breakdown Downtime Days / Year</Label>
              <Input 
                type="number"
                min="0"
                max="120"
                value={formData.breakdown_days}
                onChange={(e) => handleChange('breakdown_days', e.target.value)}
                className="bg-background font-mono font-bold text-amber-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-xs text-amber-400">Daily Lost Trip Revenue (₹/day)</Label>
              <Input 
                type="number"
                min="0"
                step="500"
                value={formData.daily_opportunity_cost}
                onChange={(e) => handleChange('daily_opportunity_cost', e.target.value)}
                className="bg-background font-mono font-bold text-amber-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-xs">Manual Maintenance & Repair Overhaul Cost (₹)</Label>
            <Input 
              type="number"
              min="0"
              step="5000"
              placeholder="e.g. 150000"
              value={formData.manual_maintenance_cost}
              onChange={(e) => handleChange('manual_maintenance_cost', e.target.value)}
              className="bg-background font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Manually override or add major engine overhaul / repair expenses for this truck.
            </p>
          </div>

          <DialogFooter className="pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={onClose} disabled={loading} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl shadow-md">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save TCO Values
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
