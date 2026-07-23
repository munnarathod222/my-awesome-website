import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { recordTollDeduction } from '@/lib/fastagDeductionUtils.js';

const RecordTollDeductionModal = ({ isOpen, onClose, trucks = [], selectedTruck = null, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    truck_id: '',
    truck_number: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    toll_plaza: '',
    trip_code: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      const defaultTruck = selectedTruck || (trucks.length > 0 ? trucks[0] : null);
      setFormData({
        truck_id: defaultTruck?.id || '',
        truck_number: defaultTruck?.truck_number || '',
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: '',
        toll_plaza: '',
        trip_code: '',
        notes: ''
      });
    }
  }, [isOpen, selectedTruck, trucks]);

  const handleTruckChange = (truckId) => {
    const trk = trucks.find(t => t.id === truckId);
    setFormData(prev => ({
      ...prev,
      truck_id: truckId,
      truck_number: trk ? trk.truck_number : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.truck_number || !formData.amount) {
      toast.error('Please select a truck and enter toll amount');
      return;
    }

    setLoading(true);
    try {
      await recordTollDeduction({
        truckId: formData.truck_id,
        truckNumber: formData.truck_number,
        amount: parseFloat(formData.amount),
        date: formData.date,
        tollPlazaName: formData.toll_plaza,
        tripCode: formData.trip_code,
        notes: formData.notes
      });

      // Also create an expense entry for complete accounting balance
      try {
        await pb.collection('expenses').create({
          date: `${formData.date} 12:00:00.000Z`,
          category: 'Toll Tax',
          description: `FASTag Toll Debit for ${formData.truck_number} ${formData.toll_plaza ? `at ${formData.toll_plaza}` : ''}`,
          amount: parseFloat(formData.amount),
          payment_method: 'FASTag',
          truck_id: formData.truck_number,
          status: 'Approved',
          notes: formData.notes || '',
          created_by: pb.authStore.model?.id || ''
        }, { $autoCancel: false });
      } catch (expErr) {
        console.error('Failed to log matching toll expense:', expErr);
      }

      toast.success(`Toll deduction of ₹${formData.amount} recorded for ${formData.truck_number}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to record toll deduction');
    } finally {
      setLoading(false);
    }
  };

  const currentTruckObj = trucks.find(t => t.id === formData.truck_id);
  const currentBal = currentTruckObj ? (Number(currentTruckObj.current_fastag_balance) || 0) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-card text-card-foreground border-border rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-heading flex items-center gap-2">
            <span className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg">🏷️</span>
            Record FASTag Toll Deduction
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          {/* Select Truck */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Select Fleet Truck *
            </Label>
            <Select value={formData.truck_id} onValueChange={handleTruckChange}>
              <SelectTrigger className="bg-background border-border rounded-xl">
                <SelectValue placeholder="Choose truck" />
              </SelectTrigger>
              <SelectContent>
                {trucks.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.truck_number} (Bal: ₹{(Number(t.current_fastag_balance) || 0).toLocaleString('en-IN')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentTruckObj && (
              <div className="text-[11px] text-muted-foreground mt-1 flex justify-between font-mono">
                <span>Current Balance: <strong className="text-emerald-500">₹{currentBal.toLocaleString('en-IN')}</strong></span>
                {formData.amount && (
                  <span>After Toll: <strong className="text-rose-500">₹{Math.max(0, currentBal - parseFloat(formData.amount || 0)).toLocaleString('en-IN')}</strong></span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Toll Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Toll Amount (₹) *
              </Label>
              <Input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 350"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="bg-background border-border rounded-xl font-mono text-base font-bold text-rose-500"
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Deduction Date *
              </Label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="bg-background border-border rounded-xl text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Toll Plaza Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Toll Plaza Name (Optional)
              </Label>
              <Input
                placeholder="e.g. Panipat Toll"
                value={formData.toll_plaza}
                onChange={e => setFormData({ ...formData, toll_plaza: e.target.value })}
                className="bg-background border-border rounded-xl text-sm"
              />
            </div>

            {/* Trip ID / Code */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Trip ID (Optional)
              </Label>
              <Input
                placeholder="e.g. TRP-1042"
                value={formData.trip_code}
                onChange={e => setFormData({ ...formData, trip_code: e.target.value })}
                className="bg-background border-border rounded-xl font-mono text-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Notes / Remarks
            </Label>
            <Textarea
              placeholder="e.g. Automated FASTag debit at NH44 Plaza"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="bg-background border-border rounded-xl text-sm resize-none"
              rows={2}
            />
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {loading ? 'Recording...' : 'Save Toll Deduction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordTollDeductionModal;
