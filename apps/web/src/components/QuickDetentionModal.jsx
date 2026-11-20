import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, AlertTriangle, IndianRupee } from 'lucide-react';

export default function QuickDetentionModal({ isOpen, trip, onClose, onSuccess }) {
  if (!trip) return null;

  const [days, setDays] = useState(trip.detention_days !== undefined && trip.detention_days !== null ? String(trip.detention_days) : '0');
  const [ratePerDay, setRatePerDay] = useState(trip.detention_rate_per_day !== undefined && trip.detention_rate_per_day !== null ? String(trip.detention_rate_per_day) : '1500');
  const [amount, setAmount] = useState(trip.detention_amount !== undefined && trip.detention_amount !== null ? String(trip.detention_amount) : '0');
  const [reason, setReason] = useState(trip.detention_reason || 'Unloading Dock Halting / Delay');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if trip changes
  useEffect(() => {
    if (trip) {
      const initialDays = trip.detention_days !== undefined && trip.detention_days !== null ? String(trip.detention_days) : '0';
      const initialRate = trip.detention_rate_per_day !== undefined && trip.detention_rate_per_day !== null ? String(trip.detention_rate_per_day) : '1500';
      const initialAmt = trip.detention_amount !== undefined && trip.detention_amount !== null ? String(trip.detention_amount) : '0';
      
      setDays(initialDays);
      setRatePerDay(initialRate);
      setAmount(initialAmt);
      setReason(trip.detention_reason || 'Unloading Dock Halting / Delay');
    }
  }, [trip]);

  // Handle Days change
  const handleDaysChange = (newDays) => {
    setDays(newDays);
    const parsedDays = parseFloat(newDays) || 0;
    const parsedRate = parseFloat(ratePerDay) || 1500;
    const computedAmt = Math.round(parsedDays * parsedRate);
    setAmount(String(computedAmt));
  };

  // Handle Rate change
  const handleRateChange = (newRate) => {
    setRatePerDay(newRate);
    const parsedDays = parseFloat(days) || 0;
    const parsedRate = parseFloat(newRate) || 0;
    const computedAmt = Math.round(parsedDays * parsedRate);
    setAmount(String(computedAmt));
  };

  // Financial Balance Calculations
  const baseRevenue = parseFloat(trip.revenue || trip.freight_amount) || 0;
  const advanceClient = parseFloat(trip.advance_received_from_client) || 0;
  const loadingCharges = trip.loading_paid_by !== 'company' ? (parseFloat(trip.loading_charges) || 0) : 0;
  const unloadingCharges = trip.unloading_paid_by !== 'company' ? (parseFloat(trip.unloading_charges) || 0) : 0;
  const tollDeduction = parseFloat(trip.toll_deduction) || 0;

  const currentDetention = parseFloat(amount) || 0;
  const grossBillable = baseRevenue + currentDetention + loadingCharges + unloadingCharges;
  const netBalanceDue = Math.max(0, grossBillable - advanceClient - tollDeduction);

  const prevDetention = parseFloat(trip.detention_amount) || 0;
  const prevGross = baseRevenue + prevDetention + loadingCharges + unloadingCharges;
  const prevBalance = Math.max(0, prevGross - advanceClient - tollDeduction);
  const balanceDifference = netBalanceDue - prevBalance;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const parsedDays = parseFloat(days) || 0;
      const parsedRate = parseFloat(ratePerDay) || 1500;
      const parsedAmount = parseFloat(amount) || 0;
      const finalReason = reason === 'Custom' ? (customReason || 'Custom Halting') : reason;

      const payload = {
        detention_days: parsedDays,
        detention_rate_per_day: parsedRate,
        detention_amount: parsedAmount,
        detention_reason: finalReason,
        detention_status: parsedAmount > 0 ? 'billable' : 'none'
      };

      const updated = await pb.collection('trip_logs').update(trip.id, payload, { $autoCancel: false });
      toast.success(`Detention of ₹${parsedAmount.toLocaleString('en-IN')} saved! Net balance updated to ₹${netBalanceDue.toLocaleString('en-IN')}`);

      if (onSuccess) {
        onSuccess(updated);
      }
      onClose();
    } catch (err) {
      console.error('Failed to update detention charges:', err);
      toast.error('Failed to save detention: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-card border-border shadow-2xl p-6 rounded-2xl">
        <DialogHeader className="border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 text-lg border border-amber-500/20">
              ⏳
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Add Detention Charges (Halting)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Trip <strong className="text-foreground">{trip.trip_id || 'N/A'}</strong> • Truck: <strong className="text-foreground">{trip.truck_number || 'N/A'}</strong> • Driver: <strong className="text-foreground">{trip.driver_name || 'N/A'}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Inputs Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Number of Days */}
            <div className="space-y-1.5">
              <Label htmlFor="quick-det-days" className="text-xs font-semibold">
                Detention Days (Halting)
              </Label>
              <Input
                id="quick-det-days"
                type="number"
                step="0.5"
                min="0"
                value={days}
                onChange={(e) => handleDaysChange(e.target.value)}
                placeholder="e.g. 2"
                required
                className="bg-background h-9 text-xs font-mono font-bold"
              />
              <span className="text-[10px] text-muted-foreground block">
                Number of days truck was detained
              </span>
            </div>

            {/* Rate per Day */}
            <div className="space-y-1.5">
              <Label htmlFor="quick-det-rate" className="text-xs font-semibold">
                Daily Rate (₹ / Day)
              </Label>
              <Input
                id="quick-det-rate"
                type="number"
                step="100"
                min="0"
                value={ratePerDay}
                onChange={(e) => handleRateChange(e.target.value)}
                placeholder="1500"
                required
                className="bg-background h-9 text-xs font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">
                Contractual halting rate per day
              </span>
            </div>
          </div>

          {/* Total Detention Amount */}
          <div className="space-y-1.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <Label htmlFor="quick-det-amount" className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span>Total Detention Charges (₹)</span>
              </Label>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                + Adds Directly to Balance
              </span>
            </div>
            <Input
              id="quick-det-amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="bg-background h-9 text-sm font-mono font-black text-amber-300 border-amber-500/50"
            />
            <span className="text-[10px] text-amber-200/70 block">
              Auto-calculated as Days × Rate. You can also type a custom agreed amount.
            </span>
          </div>

          {/* Reason / Location */}
          <div className="space-y-1.5">
            <Label htmlFor="quick-det-reason" className="text-xs font-semibold">
              Reason / Delay Stage
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="quick-det-reason" className="bg-background h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unloading Dock Halting / Delay">Unloading Dock Halting / Delay</SelectItem>
                <SelectItem value="Loading Plant Halting / Delay">Loading Plant Halting / Delay</SelectItem>
                <SelectItem value="Consignee Warehouse Closed">Consignee Warehouse Closed</SelectItem>
                <SelectItem value="Material Inspection / Testing Delay">Material Inspection / Testing Delay</SelectItem>
                <SelectItem value="Labor / Forklift Unavailable">Labor / Forklift Unavailable</SelectItem>
                <SelectItem value="En-Route Transit / Border Hold">En-Route Transit / Border Hold</SelectItem>
                <SelectItem value="Custom">Custom Reason...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reason === 'Custom' && (
            <div className="space-y-1.5">
              <Label htmlFor="quick-det-custom-reason" className="text-xs font-semibold">Specify Custom Reason</Label>
              <Input
                id="quick-det-custom-reason"
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter details of detention..."
                className="bg-background h-9 text-xs"
              />
            </div>
          )}

          {/* Live Balance Impact Card */}
          <div className="p-3.5 rounded-xl bg-secondary/20 border border-border/80 space-y-2">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Real-time Trip Balance Preview</span>
              {balanceDifference > 0 && (
                <span className="text-emerald-400 font-mono font-bold">
                  +₹{balanceDifference.toLocaleString('en-IN')} added
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
              <div className="p-2 rounded-lg bg-background/60 border border-border/40">
                <span className="text-[10px] text-muted-foreground block font-sans">Base Freight</span>
                <span className="font-bold text-foreground">₹{baseRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 rounded-lg bg-background/60 border border-border/40">
                <span className="text-[10px] text-muted-foreground block font-sans">Client Advance</span>
                <span className="font-bold text-sky-400">-{advanceClient > 0 ? `₹${advanceClient.toLocaleString('en-IN')}` : '₹0'}</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 font-bold block font-sans">Net Balance Due</span>
                <span className="font-black text-emerald-400 text-sm">₹{netBalanceDue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="h-9 px-4 text-xs font-semibold">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="h-9 px-5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md">
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save & Update Balance</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
