import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle, SplitSquareHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { format } from 'date-fns';

const PaymentRecordModal = ({ isOpen, onClose, card, currentBalance, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showWaiverWarning, setShowWaiverWarning] = useState(false);

  const [formData, setFormData] = useState({
    amount_paid: currentBalance > 0 ? currentBalance.toString() : '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'Bank Transfer',
    reference_number: ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount_paid);

    // If payment method is Card or related, check waiver (often credit card bill payments don't have surcharges, 
    // but if the user requested this check on PaymentRecordModal, we enforce it here).
    const limit = card?.max_waiver_per_transaction || 5000;
    if (amount > limit && !showWaiverWarning) {
      setShowWaiverWarning(true);
      return;
    }

    await submitPayment();
  };

  const submitPayment = async () => {
    setLoading(true);
    try {
      const payload = {
        card_id: card.id,
        user_id: currentUser.id,
        amount_paid: parseFloat(formData.amount_paid),
        payment_date: new Date(formData.payment_date).toISOString(),
        payment_method: formData.payment_method,
        reference_number: formData.reference_number
      };

      await pb.collection('payment_records').create(payload, { $autoCancel: false });
      toast.success('Payment recorded successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleUseSplitter = () => {
    onClose();
    toast.info("Go to Surcharge Manager > Payment Splitter to optimize this transaction.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Log a payment made towards your {card?.card_name} balance.
          </DialogDescription>
        </DialogHeader>

        {showWaiverWarning ? (
          <div className="py-4 space-y-4 animate-in fade-in zoom-in-95">
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Waiver Limit Exceeded!</AlertTitle>
              <AlertDescription className="text-sm mt-2 leading-relaxed">
                This amount (₹{parseFloat(formData.amount_paid).toLocaleString()}) exceeds the per-transaction waiver limit (₹{(card?.max_waiver_per_transaction || 5000).toLocaleString()}) for this card.
                <br/><br/>
                If this transaction incurs a surcharge, you will lose out on waiver benefits. We highly recommend splitting this payment.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-3">
              <Button onClick={handleUseSplitter} className="w-full gap-2 h-12 text-base">
                <SplitSquareHorizontal className="w-5 h-5" /> Cancel & Use Payment Splitter
              </Button>
              <Button variant="ghost" onClick={submitPayment} disabled={loading} className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Proceed Anyway
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount Paid (₹)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.amount_paid}
                onChange={e => setFormData({ ...formData, amount_paid: e.target.value })}
                className="text-lg bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input
                type="date"
                required
                value={formData.payment_date}
                onChange={e => setFormData({ ...formData, payment_date: e.target.value })}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={formData.payment_method} onValueChange={v => setFormData({ ...formData, payment_method: v })}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reference Number (Optional)</Label>
              <Input
                type="text"
                placeholder="Transaction ID / UTR"
                value={formData.reference_number}
                onChange={e => setFormData({ ...formData, reference_number: e.target.value })}
                className="bg-background"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                Continue
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentRecordModal;