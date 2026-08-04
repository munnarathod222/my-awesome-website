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
    payment_due_date: '15',
    full_payment_amount: '',
    minimum_payment_amount: '',
    id: null
  });

  // Fetch available primary cards for linking dropdown
  useEffect(() => {
    if (!isOpen || !currentUser?.id) return;
    const fetchPrimaryCards = async () => {
      setFetchingPrimary(true);
      try {
        const records = await pb.collection('credit_cards').getFullList({
          filter: `user_id = "${currentUser.id}" && status = "Active"`,
          sort: 'card_name',
          $autoCancel: false
        });
        // Filter out current card and any existing add-on cards to show only Primary cards
        const eligible = records.filter(c => {
          if (card && c.id === card.id) return false;
          if (c.is_addon) return false;
          if (c.card_name && c.card_name.includes('[Add-On:')) return false;
          return true;
        });
        setPrimaryCards(eligible);
      } catch (err) {
        console.error('Failed to fetch primary cards:', err);
      } finally {
        setFetchingPrimary(false);
      }
    };
    fetchPrimaryCards();
  }, [isOpen, currentUser?.id, card]);

  useEffect(() => {
    if (isOpen) {
      if (card) {
        let isAddon = Boolean(card.is_addon || card.primary_card_id);
        let primaryId = card.primary_card_id || '';
        let cleanName = card.card_name || '';

        if (cleanName.includes('[Add-On:')) {
          const match = cleanName.match(/\[Add-On:(.*?)\]/);
          if (match) {
            isAddon = true;
            primaryId = match[1];
            cleanName = cleanName.replace(/\[Add-On:.*?\]/, '').trim();
          }
        }

        setFormData({
          card_name: cleanName,
          card_number_last4: card.card_number_last4 || '',
          card_type: card.card_type || 'Credit',
          bank_name: card.bank_name || '',
          billing_cycle_start: card.billing_cycle_start?.toString() || '1',
          billing_cycle_end: card.billing_cycle_end?.toString() || '30',
          credit_limit: card.credit_limit?.toString() || '',
          status: card.status || 'Active',
          is_addon: isAddon,
          primary_card_id: primaryId
        });

        // Fetch associated payment due date record
        if (card.card_type === 'Credit') {
          pb.collection('payment_due_dates').getFirstListItem(
            `card_id="${card.id}" && user_id="${currentUser.id}"`,
            { $autoCancel: false }
          ).then(rec => {
            if (rec) {
              setPaymentDueDateData({
                payment_due_date: rec.payment_due_date?.toString() || '15',
                full_payment_amount: rec.full_payment_amount?.toString() || '',
                minimum_payment_amount: rec.minimum_payment_amount?.toString() || '',
                id: rec.id
              });
            }
          }).catch(() => {
            setPaymentDueDateData({
              payment_due_date: '15',
              full_payment_amount: '',
              minimum_payment_amount: '',
              id: null
            });
          });
        }
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
          payment_due_date: '15',
          full_payment_amount: '',
          minimum_payment_amount: '',
          id: null
        });
      }
    }
  }, [isOpen, card, currentUser.id]);

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
      const isAddon = Boolean(formData.is_addon && formData.primary_card_id);
      const cleanCardName = formData.card_name.replace(/\[Add-On:.*?\]/, '').trim();
      const storedCardName = isAddon ? `${cleanCardName} [Add-On:${formData.primary_card_id}]` : cleanCardName;

      const cardPayload = {
        card_name: storedCardName,
        card_number_last4: formData.card_number_last4,
        card_type: formData.card_type,
        bank_name: formData.bank_name,
        billing_cycle_start: Number(formData.billing_cycle_start) || 1,
        billing_cycle_end: Number(formData.billing_cycle_end) || 30,
        credit_limit: Number(formData.credit_limit) || 0,
        status: formData.status,
        user_id: currentUser.id,
        is_addon: isAddon,
        primary_card_id: isAddon ? formData.primary_card_id : '',
        // Include required waiver fields with standard defaults (5000 per-transaction limit, 20000 monthly limit)
        max_waiver_per_transaction: card ? (Number(card.max_waiver_per_transaction) || 5000) : 5000,
        monthly_waiver_limit: card ? (Number(card.monthly_waiver_limit) || 20000) : 20000,
        current_month_waiver_used: card ? (Number(card.current_month_waiver_used) || 0) : 0
      };

      let savedCard;
      try {
        if (card) {
          savedCard = await pb.collection('credit_cards').update(card.id, cardPayload, { $autoCancel: false });
        } else {
          savedCard = await pb.collection('credit_cards').create(cardPayload, { $autoCancel: false });
        }
      } catch (err) {
        console.warn('Initial card save failed, executing fallback:', err);
        const fallbackPayload = {
          card_name: storedCardName,
          card_number_last4: formData.card_number_last4,
          card_type: formData.card_type,
          bank_name: formData.bank_name,
          billing_cycle_start: Number(formData.billing_cycle_start) || 1,
          billing_cycle_end: Number(formData.billing_cycle_end) || 30,
          credit_limit: Number(formData.credit_limit) || 0,
          status: formData.status,
          user_id: currentUser.id,
          max_waiver_per_transaction: card ? (Number(card.max_waiver_per_transaction) || 5000) : 5000,
          monthly_waiver_limit: card ? (Number(card.monthly_waiver_limit) || 20000) : 20000,
          current_month_waiver_used: card ? (Number(card.current_month_waiver_used) || 0) : 0
        };
        if (card) {
          savedCard = await pb.collection('credit_cards').update(card.id, fallbackPayload, { $autoCancel: false });
        } else {
          savedCard = await pb.collection('credit_cards').create(fallbackPayload, { $autoCancel: false });
        }
      }

      toast.success(card ? 'Credit card updated successfully' : 'New credit card added successfully');

      // Safely handle payment due dates & reminders
      if (formData.card_type === 'Credit' && paymentDueDateData.payment_due_date && savedCard) {
        try {
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
        } catch (e) {
          console.warn('Payment due date optional record error:', e);
        }

        try {
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

          const existingReminder = await pb.collection('reminders').getFirstListItem(
            `linked_card_id="${savedCard.id}" && status="Active"`,
            { $autoCancel: false }
          );
          await pb.collection('reminders').update(existingReminder.id, reminderPayload, { $autoCancel: false });
        } catch (e) {
          // Ignore optional reminder sync errors
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

            {formData.is_addon && (
              <div className="space-y-2 pt-2 border-t border-border/50 animate-in fade-in duration-200">
                <Label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" /> Link to Primary Card *
                </Label>

                {fetchingPrimary ? (
                  <p className="text-xs text-muted-foreground">Loading primary cards...</p>
                ) : (
                  <Select value={formData.primary_card_id} onValueChange={(val) => {
                    const found = primaryCards.find(p => p.id === val);
                    setFormData(prev => ({ 
                      ...prev, 
                      primary_card_id: val,
                      credit_limit: found ? found.credit_limit?.toString() || '' : prev.credit_limit
                    }));
                  }}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="Select Primary Card" />
                    </SelectTrigger>
                    <SelectContent>
                      {primaryCards.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.card_name.replace(/\[Add-On:.*?\]/, '').trim()} ({p.bank_name} *{p.card_number_last4}) — Limit: ₹{(p.credit_limit || 0).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {selectedPrimary && (
                  <p className="text-[11px] text-muted-foreground bg-background/50 p-2 rounded-lg border border-border/40">
                    ℹ️ Shares the <span className="font-bold text-foreground">₹{(selectedPrimary.credit_limit || 0).toLocaleString()}</span> credit limit of <span className="font-bold text-foreground">{selectedPrimary.card_name.replace(/\[Add-On:.*?\]/, '').trim()}</span>.
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
                  <SelectItem value="Prepaid">Prepaid / Fuel Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Credit Limit (₹) {formData.is_addon ? '(Shared)' : ''}</Label>
              <Input 
                type="number" 
                min="0"
                value={formData.credit_limit}
                onChange={(e) => setFormData({...formData, credit_limit: e.target.value})}
                className="bg-background text-foreground"
                placeholder="e.g. 150000"
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
                  <SelectItem value="Inactive">Inactive / Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Billing Start Day</Label>
              <Input 
                type="number" 
                min="1" 
                max="31"
                value={formData.billing_cycle_start}
                onChange={(e) => setFormData({...formData, billing_cycle_start: e.target.value})}
                className="bg-background text-foreground"
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label>Billing End Day</Label>
              <Input 
                type="number" 
                min="1" 
                max="31"
                value={formData.billing_cycle_end}
                onChange={(e) => setFormData({...formData, billing_cycle_end: e.target.value})}
                className="bg-background text-foreground"
                placeholder="30"
              />
            </div>
          </div>

          {/* Additional Credit Card due date section */}
          {formData.card_type === 'Credit' && (
            <div className="p-3 bg-muted/20 border border-border/60 rounded-xl space-y-3 mt-2">
              <Label className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Statement & Due Dates</Label>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Due Day *</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="31"
                    value={paymentDueDateData.payment_due_date}
                    onChange={(e) => setPaymentDueDateData({...paymentDueDateData, payment_due_date: e.target.value})}
                    className="bg-background text-foreground h-9"
                    placeholder="15"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Statement Bal (₹)</Label>
                  <Input 
                    type="number" 
                    min="0"
                    value={paymentDueDateData.full_payment_amount}
                    onChange={(e) => setPaymentDueDateData({...paymentDueDateData, full_payment_amount: e.target.value})}
                    className="bg-background text-foreground h-9"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Min Due (₹)</Label>
                  <Input 
                    type="number" 
                    min="0"
                    value={paymentDueDateData.minimum_payment_amount}
                    onChange={(e) => setPaymentDueDateData({...paymentDueDateData, minimum_payment_amount: e.target.value})}
                    className="bg-background text-foreground h-9"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {card ? 'Save Changes' : 'Add Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CardModal;