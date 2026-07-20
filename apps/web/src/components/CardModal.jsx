import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Loader2, CreditCard, Link as LinkIcon, ShieldCheck } from 'lucide-react';

const CardModal = ({ isOpen, onClose, card, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [primaryCards, setPrimaryCards] = useState([]);
  const [fetchingPrimary, setFetchingPrimary] = useState(false);

  const [formData, setFormData] = useState({
    card_name: '',
    card_number_last4: '',
    card_type: 'Credit',
    bank_name: '',
    billing_cycle_start: '1',
    billing_cycle_end: '30',
    credit_limit: '',
    status: 'Active',
    is_addon: false,
    primary_card_id: ''
  });

  const [paymentDueDateData, setPaymentDueDateData] = useState({
    id: '',
    payment_due_date: '15',
    full_payment_amount: '',
    minimum_payment_amount: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch list of primary cards for linking add-on cards
      fetchPrimaryCardsList();

      if (card) {
        setFormData({
          card_name: card.card_name || '',
          card_number_last4: card.card_number_last4 || '',
          card_type: card.card_type || 'Credit',
          bank_name: card.bank_name || '',
          billing_cycle_start: card.billing_cycle_start?.toString() || '1',
          billing_cycle_end: card.billing_cycle_end?.toString() || '30',
          credit_limit: card.credit_limit?.toString() || '',
          status: card.status || 'Active',
          is_addon: Boolean(card.is_addon || card.primary_card_id),
          primary_card_id: card.primary_card_id || ''
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
          status: 'Active',
          is_addon: false,
          primary_card_id: ''
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

  const fetchPrimaryCardsList = async () => {
    setFetchingPrimary(true);
    try {
      const list = await pb.collection('credit_cards').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        sort: 'card_name',
        $autoCancel: false
      });
      // Filter out self if editing, and filter primary cards
      const available = list.filter(c => (!card || c.id !== card.id) && !c.is_addon);
      setPrimaryCards(available);
    } catch (e) {
      console.error('Failed to fetch primary cards:', e);
    } finally {
      setFetchingPrimary(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.card_number_last4 || formData.card_number_last4.length !== 4) {
      return toast.error('Please enter exactly 4 digits for the card number');
    }

    if (formData.is_addon && !formData.primary_card_id) {
      return toast.error('Please select a Primary Credit Card to link this Add-On Card');
    }

    setLoading(true);
    try {
      const cardPayload = {
        card_name: formData.card_name,
        card_number_last4: formData.card_number_last4,
        card_type: formData.card_type,
        bank_name: formData.bank_name,
        billing_cycle_start: Number(formData.billing_cycle_start) || 1,
        billing_cycle_end: Number(formData.billing_cycle_end) || 30,
        credit_limit: Number(formData.credit_limit) || 0,
        status: formData.status,
        user_id: currentUser.id,
        is_addon: Boolean(formData.is_addon),
        primary_card_id: formData.is_addon ? formData.primary_card_id : ''
      };

      let savedCard;
      if (card) {
        savedCard = await pb.collection('credit_cards').update(card.id, cardPayload, { $autoCancel: false });
        toast.success('Credit card updated');
      } else {
        savedCard = await pb.collection('credit_cards').create(cardPayload, { $autoCancel: false });
        toast.success('New credit card added');
      }

      // Handle Payment Due Date for Credit Cards
      if (formData.card_type === 'Credit' && paymentDueDateData.payment_due_date) {
        const dueDatePayload = {
          card_id: savedCard.id,
          payment_due_date: Number(paymentDueDateData.payment_due_date) || 15,
          full_payment_amount: Number(paymentDueDateData.full_payment_amount) || 0,
          minimum_payment_amount: Number(paymentDueDateData.minimum_payment_amount) || 0,
          user_id: currentUser.id
        };

        if (paymentDueDateData.id) {
          await pb.collection('payment_due_dates').update(paymentDueDateData.id, dueDatePayload, { $autoCancel: false });
        } else {
          await pb.collection('payment_due_dates').create(dueDatePayload, { $autoCancel: false });
        }

        // Automatic Reminder sync
        const reminderPayload = {
          title: `Credit Card Bill Due: ${formData.card_name} (*${formData.card_number_last4})`,
          notes: `Credit card bill payment due on day ${paymentDueDateData.payment_due_date} of the month. Total Due: ₹${paymentDueDateData.full_payment_amount || 0}`,
          reminder_type: 'CreditCardBill',
          priority: 'High',
          status: 'Active',
          created_by: currentUser.id,
          user_id: currentUser.id,
          linked_card_id: savedCard.id
        };

        try {
          const existingReminder = await pb.collection('reminders').getFirstListItem(
            `linked_card_id="${savedCard.id}" && status="Active"`,
            { $autoCancel: false }
          );
          await pb.collection('reminders').update(existingReminder.id, reminderPayload, { $autoCancel: false });
        } catch (e) {
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

  const selectedPrimary = primaryCards.find(p => p.id === formData.primary_card_id);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[520px] bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            {card ? 'Edit Card Details' : 'Add Credit / Add-On Card'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Card Category Selector (Primary vs Add-On) */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm">Card Ownership Classification</Label>
              <Badge variant="outline" className={formData.is_addon ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-primary/10 text-primary border-primary/30'}>
                {formData.is_addon ? 'ADD-ON CARD (SHARED LIMIT)' : 'PRIMARY CARD'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, is_addon: false, primary_card_id: '' }))}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${!formData.is_addon ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background text-muted-foreground border-border hover:bg-muted'}`}
              >
                Primary Card
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, is_addon: true }))}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${formData.is_addon ? 'bg-amber-500 text-amber-950 border-amber-500 font-bold shadow-sm' : 'bg-background text-muted-foreground border-border hover:bg-muted'}`}
              >
                Add-On Card (Linked)
              </button>
            </div>

            {/* Dropdown to Link Primary Card if Add-On is selected */}
            {formData.is_addon && (
              <div className="space-y-2 pt-2 border-t border-border/50 animate-in fade-in duration-200">
                <Label className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" /> Link to Primary Card *
                </Label>
                {fetchingPrimary ? (
                  <p className="text-xs text-muted-foreground">Loading primary cards...</p>
                ) : (
                  <Select value={formData.primary_card_id} onValueChange={(val) => setFormData(prev => ({ ...prev, primary_card_id: val }))}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="Select Primary Card" />
                    </SelectTrigger>
                    <SelectContent>
                      {primaryCards.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.card_name} ({p.bank_name} *{p.card_number_last4}) — Limit: ₹{(p.credit_limit || 0).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {selectedPrimary && (
                  <p className="text-[11px] text-muted-foreground bg-background/50 p-2 rounded-lg border border-border/40">
                    ℹ️ Shares the <span className="font-bold text-foreground">₹{(selectedPrimary.credit_limit || 0).toLocaleString()}</span> credit limit of <span className="font-bold text-foreground">{selectedPrimary.card_name}</span>.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Card Name / Holder Alias *</Label>
              <Input 
                type="text" 
                required
                value={formData.card_name}
                onChange={(e) => setFormData({...formData, card_name: e.target.value})}
                className="bg-background text-foreground"
                placeholder={formData.is_addon ? 'e.g. Driver Add-On Card 1' : 'e.g. HDFC Regalia'}
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
              <Label>Credit Limit (₹) {formData.is_addon ? '(Shared)' : ''}</Label>
              <Input 
                type="number" 
                step="1000"
                min="0"
                value={formData.credit_limit}
                onChange={(e) => setFormData({...formData, credit_limit: e.target.value})}
                className="bg-background text-foreground"
                placeholder={formData.is_addon ? '0 (Uses Primary Limit)' : 'e.g. 500000'}
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

          {formData.card_type === 'Credit' && (
            <div className="border-t border-border pt-4 mt-2 space-y-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Statement & Due Dates</h4>
              
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