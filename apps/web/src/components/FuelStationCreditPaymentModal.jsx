import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Loader2, IndianRupee, Wallet, CreditCard, Banknote, Building2, CheckCircle2 } from 'lucide-react';
import { fetchFuelStations, payFuelStationCredit } from '@/lib/fuelStationUtils.js';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function FuelStationCreditPaymentModal({ isOpen, onClose, selectedStationId, onSuccess }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);

  const [formData, setFormData] = useState({
    station_id: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    payment_method: 'Bank Transfer', // Bank Transfer, UPI, Cash, FASTag
    reference_no: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadStations();
    }
  }, [isOpen]);

  const loadStations = async () => {
    const data = await fetchFuelStations();
    setStations(data);
    if (selectedStationId) {
      const match = data.find(s => s.id === selectedStationId);
      if (match) {
        setSelectedStation(match);
        setFormData(prev => ({
          ...prev,
          station_id: match.id,
          amount: (match.credit_balance || 0) > 0 ? (match.credit_balance || 0).toString() : ''
        }));
        return;
      }
    }
    if (data.length > 0) {
      setSelectedStation(data[0]);
      setFormData(prev => ({
        ...prev,
        station_id: data[0].id,
        amount: (data[0].credit_balance || 0) > 0 ? (data[0].credit_balance || 0).toString() : ''
      }));
    }
  };

  const handleStationChange = (id) => {
    const match = stations.find(s => s.id === id);
    setSelectedStation(match || null);
    setFormData(prev => ({
      ...prev,
      station_id: id,
      amount: match && (match.credit_balance || 0) > 0 ? (match.credit_balance || 0).toString() : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const paidAmt = parseFloat(formData.amount);
    if (!paidAmt || paidAmt <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (!selectedStation) {
      toast.error('Please select a fuel station');
      return;
    }

    setLoading(true);
    try {
      // 1. Reduce credit balance on fuel station
      await payFuelStationCredit(selectedStation.id, paidAmt);

      // 2. Create fuel payment record in PocketBase
      const paymentPayload = {
        station_name: selectedStation.station_name,
        amount: paidAmt,
        payment_date: `${formData.payment_date} 12:00:00.000Z`,
        payment_method: formData.payment_method,
        reference_no: formData.reference_no || '',
        status: 'Completed',
        notes: `Credit Dues Payment to ${selectedStation.station_name}. ${formData.notes || ''}`.trim(),
        user_id: currentUser?.id || ''
      };

      try {
        await pb.collection('fuel_payments').create(paymentPayload, { $autoCancel: false });
      } catch (err) {
        console.log('Fuel payments creation fallback:', err?.message);
      }

      // 3. Create linked Cashbook / Expense entry for complete financial auditing
      try {
        await pb.collection('cashbook').create({
          entry_type: 'Out', // Payment Out
          category: 'Fuel Credit Settlement',
          amount: paidAmt,
          entry_date: `${formData.payment_date} 12:00:00.000Z`,
          payment_method: formData.payment_method,
          description: `Fuel Credit Settlement for ${selectedStation.station_name} (Ref: ${formData.reference_no || 'N/A'})`,
          created_by: currentUser?.id || ''
        }, { $autoCancel: false });
      } catch (err) {
        console.log('Cashbook creation fallback:', err?.message);
      }

      toast.success(`Successfully paid ₹${paidAmt.toLocaleString('en-IN')} to ${selectedStation.station_name}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Credit payment failed:', err);
      toast.error('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-card text-card-foreground border-border shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold font-heading text-emerald-400">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Pay Fuel Station Credit (Udhar Settlement)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="font-semibold">Select Fuel Station *</Label>
            <Select value={formData.station_id} onValueChange={handleStationChange}>
              <SelectTrigger className="bg-background h-12">
                <SelectValue placeholder="Select station..." />
              </SelectTrigger>
              <SelectContent>
                {stations.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex justify-between items-center gap-4 w-full">
                      <span className="font-bold">{s.station_name}</span>
                      <span className="font-mono text-amber-400 text-xs">
                        Udhar: ₹{(s.credit_balance || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStation && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">Current Outstanding Credit</p>
                <p className="text-2xl font-extrabold text-amber-400 font-mono">
                  ₹{(selectedStation.credit_balance || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-amber-400/40" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Payment Date *</Label>
              <Input 
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                className="bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Payment Amount (₹) *</Label>
              <Input 
                type="number"
                min="1"
                step="any"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="bg-background font-mono font-bold text-emerald-400 text-lg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Payment Method *</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, payment_method: v }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer / NEFT</SelectItem>
                  <SelectItem value="UPI">UPI / PhonePe / GPay</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="FASTag">FASTag Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">UTR / Reference No.</Label>
              <Input 
                placeholder="e.g. UTR123456789"
                value={formData.reference_no}
                onChange={(e) => setFormData(prev => ({ ...prev, reference_no: e.target.value }))}
                className="bg-background font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Notes / Remarks</Label>
            <Textarea 
              placeholder="e.g. Paid via PhonePe by Director Vinod Rathod"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-background h-20"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={onClose} disabled={loading} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Confirm Payment Out
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
