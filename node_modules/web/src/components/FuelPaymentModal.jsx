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

const FuelPaymentModal = ({ isOpen, onClose, transaction, cards, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    card_id: '',
    fuel_amount: '',
    surcharge_percentage: '1',
    payment_status: 'Pending',
    waived_amount: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setFormData({
          date: transaction.date ? format(new Date(transaction.date), 'yyyy-MM-dd') : '',
          card_id: transaction.card_id || '',
          fuel_amount: transaction.fuel_amount?.toString() || '',
          surcharge_percentage: transaction.surcharge_percentage?.toString() || '1',
          payment_status: transaction.payment_status || 'Pending',
          waived_amount: transaction.waived_amount?.toString() || '',
          notes: transaction.notes || ''
        });
      } else {
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          card_id: cards.length > 0 ? cards[0].id : '',
          fuel_amount: '',
          surcharge_percentage: '1',
          payment_status: 'Pending',
          waived_amount: '',
          notes: ''
        });
      }
    }
  }, [isOpen, transaction, cards]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.card_id) {
      toast.error('Please select a credit card');
      return;
    }
    
    setLoading(true);
    try {
      const fuelAmount = parseFloat(formData.fuel_amount) || 0;
      const surchargePct = parseFloat(formData.surcharge_percentage) || 0;
      const surchargeAmount = (fuelAmount * surchargePct) / 100;
      
      const payload = {
        date: formData.date + ' 12:00:00.000Z',
        card_id: formData.card_id,
        fuel_amount: fuelAmount,
        surcharge_percentage: surchargePct,
        surcharge_amount: surchargeAmount,
        payment_status: formData.payment_status,
        waived_amount: parseFloat(formData.waived_amount) || 0,
        notes: formData.notes,
        user_id: currentUser.id,
        month: format(new Date(formData.date), 'yyyy-MM')
      };

      if (transaction) {
        await pb.collection('fuel_payments').update(transaction.id, payload, { $autoCancel: false });
        toast.success('Transaction updated');
      } else {
        await pb.collection('fuel_payments').create(payload, { $autoCancel: false });
        toast.success('Transaction logged successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card text-card-foreground rounded-2xl">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit Fuel Payment' : 'Log Fuel Payment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input 
                type="date" 
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="bg-input text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Credit Card</Label>
              <Select value={formData.card_id} onValueChange={(val) => setFormData({...formData, card_id: val})}>
                <SelectTrigger className="bg-input text-foreground">
                  <SelectValue placeholder="Select card" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map(card => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.card_name} (..{card.card_number_last4})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fuel Amount (₹)</Label>
              <Input 
                type="number" 
                required
                step="0.01"
                min="0"
                value={formData.fuel_amount}
                onChange={(e) => setFormData({...formData, fuel_amount: e.target.value})}
                className="bg-input text-foreground"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Surcharge %</Label>
              <Input 
                type="number" 
                step="0.01"
                min="0"
                value={formData.surcharge_percentage}
                onChange={(e) => setFormData({...formData, surcharge_percentage: e.target.value})}
                className="bg-input text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.payment_status} onValueChange={(val) => setFormData({...formData, payment_status: val})}>
                <SelectTrigger className="bg-input text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Waived Amount (₹)</Label>
              <Input 
                type="number" 
                step="0.01"
                min="0"
                value={formData.waived_amount}
                onChange={(e) => setFormData({...formData, waived_amount: e.target.value})}
                className="bg-input text-foreground"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Input 
              type="text" 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="bg-input text-foreground"
              placeholder="E.g., Vehicle number, trip reference"
            />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FuelPaymentModal;