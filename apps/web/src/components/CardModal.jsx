import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Loader2 } from 'lucide-react';
import { setDate, isBefore, startOfDay, addMonths } from 'date-fns';


const CardModal = ({ isOpen, onClose, card, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    card_name: '',
    card_number_last4: '',
    card_type: 'Credit',
    bank_name: '',
    billing_cycle_start: '1',
    billing_cycle_end: '30',
    credit_limit: '',
    status: 'Active'
  });

  const [paymentDueDateData, setPaymentDueDateData] = useState({
    id: '',
    payment_due_date: '15',
    full_payment_amount: '',
    minimum_payment_amount: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (card) {
        setFormData({
          card_name: card.card_name || '',
          card_number_last4: card.card_number_last4 || '',
          card_type: card.card_type || 'Credit',
          bank_name: card.bank_name || '',
          billing_cycle_start: card.billing_cycle_start?.toString() || '1',
          billing_cycle_end: card.billing_cycle_end?.toString() || '30',
          credit_limit: card.credit_limit?.toString() || '',
          status: card.status || 'Active'
        });

        // Fetch existing payment due date linked to this card
        const fetchDueDate = async () => {
          try {
            const record = await pb.collection('payment_due_dates').getFirstListItem(`card_id="${card.id}"`, { $autoCancel: false });
            if (record) {
              setPaymentDueDateData({
                id: record.id,
                payment_due_date: record.payment_due_date?.toString() || '15',
                full_payment_amount: record.full_payment_amount?.toString() || '',
                minimum_payment_amount: record.minimum_payment_amount?.toString() || ''
              });
            }
          } catch (e) {
            console.log('No existing payment due date record found:', e);
            setPaymentDueDateData({
              id: '',
              payment_due_date: '15',
              full_payment_amount: '',
              minimum_payment_amount: ''
            });
          }
        };
        fetchDueDate();
      } else {
        setFormData({
          card_name: '',
          card_number_last4: '',
          card_type: 'Credit',
          bank_name: '',
          billing_cycle_start: '1',
          billing_cycle_end: '30',
          credit_limit: '',
          status: 'Active'
        });
        setPaymentDueDateData({
          id: '',
          payment_due_date: '15',
          full_payment_amount: '',
          minimum_payment_amount: ''
        });
      }
    }
  }, [isOpen, card]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.card_number_last4 || formData.card_number_last4.length !== 4) {
      return toast.error('Please enter exactly 4 digits for the card number');
    }

    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        billing_cycle_start: parseInt(formData.billing_cycle_start) || 1,
        billing_cycle_end: parseInt(formData.billing_cycle_end) || 30,
        credit_limit: parseFloat(formData.credit_limit) || 0,
        user_id: currentUser?.id || ''
      };

      let savedCard;
      if (card) {
        savedCard = await pb.collection('credit_cards').update(card.id, payload, { $autoCancel: false });
        toast.success('Card updated successfully');
      } else {
        savedCard = await pb.collection('credit_cards').create(payload, { $autoCancel: false });
        toast.success('Card added successfully');
      }

      // Save/update payment_due_dates record
      if (formData.card_type === 'Credit' && currentUser?.id) {
        const dueDatePayload = {
          card_id: savedCard.id,
          payment_due_date: parseInt(paymentDueDateData.payment_due_date) || 15,
          full_payment_amount: parseFloat(paymentDueDateData.full_payment_amount) || 0,
          minimum_payment_amount: parseFloat(paymentDueDateData.minimum_payment_amount) || 0,
          user_id: currentUser.id
        };

        if (paymentDueDateData.id) {
          await pb.collection('payment_due_dates').update(paymentDueDateData.id, dueDatePayload, { $autoCancel: false });
        } else {
          await pb.collection('payment_due_dates').create(dueDatePayload, { $autoCancel: false });
        }

        // Trigger / Sync high-priority Reminder automatically when statement amount is updated
        let nextDueDate = setDate(new Date(), dueDatePayload.payment_due_date);
        if (isBefore(nextDueDate, startOfDay(new Date()))) {
          nextDueDate = addMonths(nextDueDate, 1);
        }

        const reminderPayload = {
          title: `Pay ${savedCard.card_name} Bill`,
          description: `Statement Bill Amount: ₹${dueDatePayload.full_payment_amount.toLocaleString('en-IN')}. Minimum Due: ₹${dueDatePayload.minimum_payment_amount.toLocaleString('en-IN')}.`,
          reminder_type: 'Credit Card Payment',
          reminder_date: nextDueDate.toISOString(),
          priority: 'High',
          status: 'Active',
          created_by: currentUser.id,
          user_id: currentUser.id,
          linked_card_id: savedCard.id
        };

        // Check if there is an existing active reminder for this card
        try {
          const existingReminder = await pb.collection('reminders').getFirstListItem(
            `linked_card_id="${savedCard.id}" && status="Active"`,
            { $autoCancel: false }
          );
          await pb.collection('reminders').update(existingReminder.id, reminderPayload, { $autoCancel: false });
        } catch (e) {
          // If no active reminder exists, create a new one
          await pb.collection('reminders').create(reminderPayload, { $autoCancel: false });
        }
      }

      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving card:', error);
      toast.error(error.message || 'Failed to save card details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>{card ? 'Edit Card Details' : 'Add New Credit Card'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Card Name / Alias *</Label>
              <Input 
                type="text" 
                required
                value={formData.card_name}
                onChange={(e) => setFormData({...formData, card_name: e.target.value})}
                className="bg-background text-foreground"
                placeholder="e.g. HDFC Fuel Card"
              />
            </div>
            <div className="space-y-2">
              <Label>Bank Name *</Label>
              <Input 
                type="text" 
                required
                value={formData.bank_name}
                onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                className="bg-background text-foreground"
                placeholder="e.g. HDFC Bank"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Last 4 Digits *</Label>
              <Input 
                type="text" 
                required
                maxLength={4}
                pattern="\d{4}"
                value={formData.card_number_last4}
                onChange={(e) => setFormData({...formData, card_number_last4: e.target.value.replace(/\D/g, '')})}
                className="bg-background text-foreground font-mono"
                placeholder="1234"
              />
            </div>
            <div className="space-y-2">
              <Label>Card Type *</Label>
              <Select value={formData.card_type} onValueChange={(val) => setFormData({...formData, card_type: val})}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit">Credit Card</SelectItem>
                  <SelectItem value="Debit">Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Billing Start Day</Label>
              <Input 
                type="number" 
                required
                min="1"
                max="31"
                value={formData.billing_cycle_start}
                onChange={(e) => setFormData({...formData, billing_cycle_start: e.target.value})}
                className="bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Billing End Day</Label>
              <Input 
                type="number" 
                required
                min="1"
                max="31"
                value={formData.billing_cycle_end}
                onChange={(e) => setFormData({...formData, billing_cycle_end: e.target.value})}
                className="bg-background text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Credit Limit (₹)</Label>
              <Input 
                type="number" 
                step="1000"
                min="0"
                value={formData.credit_limit}
                onChange={(e) => setFormData({...formData, credit_limit: e.target.value})}
                className="bg-background text-foreground"
                placeholder="e.g. 50000"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.card_type === 'Credit' && (
            <div className="border-t border-border pt-4 mt-2 space-y-4">
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Statement & Due Dates</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Due Day *</Label>
                  <Input 
                    type="number" 
                    min="1"
                    max="31"
                    required
                    value={paymentDueDateData.payment_due_date}
                    onChange={(e) => setPaymentDueDateData({...paymentDueDateData, payment_due_date: e.target.value})}
                    className="bg-background text-foreground"
                    placeholder="15"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Statement Bal (₹)</Label>
                  <Input 
                    type="number" 
                    min="0"
                    value={paymentDueDateData.full_payment_amount}
                    onChange={(e) => setPaymentDueDateData({...paymentDueDateData, full_payment_amount: e.target.value})}
                    className="bg-background text-foreground"
                    placeholder="5000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Min Due (₹)</Label>
                  <Input 
                    type="number" 
                    min="0"
                    value={paymentDueDateData.minimum_payment_amount}
                    onChange={(e) => setPaymentDueDateData({...paymentDueDateData, minimum_payment_amount: e.target.value})}
                    className="bg-background text-foreground"
                    placeholder="500"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-border mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (card ? 'Save Changes' : 'Add Card')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CardModal;