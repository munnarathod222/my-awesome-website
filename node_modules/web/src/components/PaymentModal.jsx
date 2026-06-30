import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

const PaymentModal = ({ isOpen, onClose, cards = [], defaultCardId, defaultAmount, fuelPaymentId, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    card_id: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    amount_paid: '',
    payment_method: 'Bank Transfer',
    reference_number: ''
  });

  useEffect(() => {
    if (isOpen) {
      const safeCards = cards || [];
      setFormData({
        card_id: defaultCardId || (safeCards.length > 0 ? safeCards[0].id : ''),
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        amount_paid: defaultAmount?.toString() || '',
        payment_method: 'Bank Transfer',
        reference_number: ''
      });
    }
  }, [isOpen, defaultCardId, defaultAmount, cards]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.card_id) {
      toast.error('Please select a card');
      return;
    }
    
    setLoading(true);
    try {
      // 1. Create payment record
      await pb.collection('payment_records').create({
        card_id: formData.card_id,
        payment_date: formData.payment_date + ' 12:00:00.000Z',
        amount_paid: parseFloat(formData.amount_paid) || 0,
        payment_method: formData.payment_method,
        reference_number: formData.reference_number,
        fuel_payment_id: fuelPaymentId || '',
        user_id: currentUser.id
      }, { $autoCancel: false });

      // 2. If it's linked to a specific fuel payment, update that payment to Paid
      if (fuelPaymentId) {
        await pb.collection('fuel_payments').update(fuelPaymentId, {
          payment_status: 'Paid'
        }, { $autoCancel: false });
      }

      toast.success('Payment recorded successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const safeCardsList = cards || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground rounded-2xl">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Credit Card</Label>
            <Select value={formData.card_id} onValueChange={(val) => setFormData({...formData, card_id: val})}>
              <SelectTrigger className="bg-input text-foreground">
                <SelectValue placeholder="Select card" />
              </SelectTrigger>
              <SelectContent>
                {safeCardsList.length > 0 ? (
                  safeCardsList.map(card => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.card_name} (..{card.card_number_last4})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-cards" disabled>No cards available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input 
                type="date" 
                required
                value={formData.payment_date}
                onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                className="bg-input text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount Paid (₹)</Label>
              <Input 
                type="number" 
                required
                step="0.01"
                min="0.01"
                value={formData.amount_paid}
                onChange={(e) => setFormData({...formData, amount_paid: e.target.value})}
                className="bg-input text-foreground"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={formData.payment_method} onValueChange={(val) => setFormData({...formData, payment_method: val})}>
                <SelectTrigger className="bg-input text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reference Number</Label>
              <Input 
                type="text" 
                value={formData.reference_number}
                onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                className="bg-input text-foreground"
                placeholder="UTR / Ref ID"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;