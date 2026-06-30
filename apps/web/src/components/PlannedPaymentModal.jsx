import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CalendarRange } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { format } from 'date-fns';

const parseNotes = (str) => {
  if (!str) return { type: 'payment', card_id: '', notes: '', pair_id: '' };
  try {
    const p = JSON.parse(str);
    if (p && p.type) return p;
  } catch(e) {}
  return { type: 'payment', card_id: '', notes: str, pair_id: '' };
};

export default function PlannedPaymentModal({ isOpen, onClose, onSuccess, editRecord, splits = [], selectedDate, selectedCardId }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  
  const [formData, setFormData] = useState({
    card_id: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    payment_amount: '',
    waiver_amount: '',
    payment_method: 'Card',
    notes: ''
  });

  const isMultiSplit = splits && splits.length > 0;

  useEffect(() => {
    if (!isOpen) return;
    pb.collection('credit_cards').getFullList({
      filter: `user_id="${currentUser.id}" && status="Active"`,
      sort: 'card_name',
      $autoCancel: false
    }).then(setCards).catch(console.error);
  }, [isOpen, currentUser.id]);

  useEffect(() => {
    if (isOpen && editRecord) {
      const meta = parseNotes(editRecord.notes);
      
      setFormData({
        card_id: meta.card_id || '',
        payment_date: editRecord.payment_date ? format(new Date(editRecord.payment_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        payment_amount: editRecord.expected_surcharge_amount?.toString() || '',
        waiver_amount: '',
        payment_method: editRecord.payment_method || 'Card',
        notes: meta.notes || editRecord.notes || ''
      });
    } else if (isOpen) {
      setFormData({
        card_id: selectedCardId || '',
        payment_date: selectedDate || format(new Date(), 'yyyy-MM-dd'),
        payment_amount: '',
        waiver_amount: '',
        payment_method: 'Card',
        notes: ''
      });
    }
  }, [isOpen, editRecord, selectedCardId, selectedDate]);

  // Auto-fetch linked pending waiver when card changes (only for single payment mode)
  useEffect(() => {
    if (!isOpen || !formData.card_id || isMultiSplit || editRecord) return;
    const fetchWaiver = async () => {
      try {
        const records = await pb.collection('planned_surcharge_payments').getFullList({
          filter: `user_id="${currentUser.id}" && status='pending'`,
          $autoCancel: false
        });
        const waiver = records.find(r => {
          const m = parseNotes(r.notes);
          return m.type === 'waiver' && m.card_id === formData.card_id;
        });
        
        if (waiver && waiver.expected_surcharge_amount) {
          setFormData(prev => ({ ...prev, waiver_amount: waiver.expected_surcharge_amount.toString() }));
        }
      } catch (e) {
        console.error('Failed to fetch linked waiver:', e);
      }
    };
    fetchWaiver();
  }, [formData.card_id, currentUser.id, isOpen, isMultiSplit, editRecord]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isMultiSplit) {
        for (const split of splits) {
          const pairId = `pair_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          
          const paymentPayload = {
            user_id: currentUser.id,
            payment_date: new Date(formData.payment_date).toISOString(),
            expected_surcharge_amount: parseFloat(split.amount),
            payment_method: formData.payment_method,
            notes: JSON.stringify({ type: 'payment', card_id: formData.card_id, notes: formData.notes, pair_id: pairId }),
            status: 'pending'
          };
          await pb.collection('planned_surcharge_payments').create(paymentPayload, { $autoCancel: false });
          
          if (split.savings > 0) {
            const waiverPayload = {
              user_id: currentUser.id,
              payment_date: new Date(formData.payment_date).toISOString(),
              expected_surcharge_amount: parseFloat(split.savings),
              payment_method: 'Card',
              notes: JSON.stringify({ type: 'waiver', card_id: formData.card_id, notes: 'Auto-scheduled split waiver', pair_id: pairId }),
              status: 'pending'
            };
            await pb.collection('planned_surcharge_payments').create(waiverPayload, { $autoCancel: false });
          }
        }
      } else {
        // Single payment / edit logic
        const meta = editRecord ? parseNotes(editRecord.notes) : {};
        const pairId = meta.pair_id || `pair_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const paymentPayload = {
          user_id: currentUser.id,
          payment_date: new Date(formData.payment_date).toISOString(),
          expected_surcharge_amount: parseFloat(formData.payment_amount || 0),
          payment_method: formData.payment_method,
          notes: JSON.stringify({ type: 'payment', card_id: formData.card_id, notes: formData.notes, pair_id: pairId }),
          status: editRecord ? editRecord.status : 'pending'
        };

        if (editRecord) {
          await pb.collection('planned_surcharge_payments').update(editRecord.id, paymentPayload, { $autoCancel: false });
        } else {
          await pb.collection('planned_surcharge_payments').create(paymentPayload, { $autoCancel: false });
        }

        if (formData.card_id) {
          const pendingRecords = await pb.collection('planned_surcharge_payments').getFullList({
            filter: `user_id="${currentUser.id}" && status='pending'`,
            $autoCancel: false
          });
          
          let existingWaiver = null;
          if (meta.pair_id) {
            existingWaiver = pendingRecords.find(r => parseNotes(r.notes).pair_id === meta.pair_id && parseNotes(r.notes).type === 'waiver');
          } else {
            existingWaiver = pendingRecords.find(r => parseNotes(r.notes).type === 'waiver' && parseNotes(r.notes).card_id === formData.card_id);
          }

          const waiverAmount = parseFloat(formData.waiver_amount || 0);
          
          if (waiverAmount > 0) {
            const waiverPayload = {
              user_id: currentUser.id,
              payment_date: new Date(formData.payment_date).toISOString(),
              expected_surcharge_amount: waiverAmount,
              payment_method: 'Card',
              notes: JSON.stringify({ type: 'waiver', card_id: formData.card_id, notes: 'Auto-scheduled linked waiver', pair_id: pairId }),
              status: existingWaiver ? existingWaiver.status : 'pending'
            };
            
            if (existingWaiver) {
              await pb.collection('planned_surcharge_payments').update(existingWaiver.id, waiverPayload, { $autoCancel: false });
            } else {
              await pb.collection('planned_surcharge_payments').create(waiverPayload, { $autoCancel: false });
            }
          } else if (existingWaiver) {
            await pb.collection('planned_surcharge_payments').update(existingWaiver.id, { 
              payment_date: new Date(formData.payment_date).toISOString() 
            }, { $autoCancel: false });
          }
        }
      }

      // Update credit card waiver usage limit in the database
      let totalWaiver = 0;
      if (isMultiSplit) {
        splits.forEach(split => {
          if (split.savings > 0) {
            totalWaiver += parseFloat(split.savings) || 0;
          }
        });
      } else {
        totalWaiver = parseFloat(formData.waiver_amount) || 0;
      }

      if (formData.card_id && totalWaiver > 0) {
        const card = await pb.collection('credit_cards').getOne(formData.card_id, { $autoCancel: false });
        const currentAvailableLimit = Number(card.monthly_waiver_limit || 20000) - Number(card.current_month_waiver_used || 0);
        const numericAmount = Number(totalWaiver) || parseFloat(totalWaiver);
        const newAvailableLimit = currentAvailableLimit - numericAmount;
        
        // Calculate new monthly waiver used
        const newWaiverUsed = Number(card.monthly_waiver_limit || 20000) - newAvailableLimit;
        
        await pb.collection('credit_cards').update(card.id, {
          current_month_waiver_used: newWaiverUsed
        }, { $autoCancel: false });
      }

      toast.success(isMultiSplit ? 'All payments and waivers scheduled successfully!' : 'Payment and associated surcharge waiver scheduled for the same date.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving planned payment:', err);
      toast.error(err.message || 'Failed to save planned payment(s)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[550px] bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-primary" />
            {editRecord ? 'Edit Planned Payment' : (isMultiSplit ? 'Plan Multiple Payments' : 'Plan Payment & Waiver')}
          </DialogTitle>
          <DialogDescription>
            {isMultiSplit 
              ? 'Consolidate and schedule multiple split payments and waivers on a single date.'
              : 'Schedule a payment and automatically sync the associated surcharge waiver date.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          
          <div className="col-span-2 space-y-2 bg-primary/5 p-4 rounded-xl border border-primary/20">
            <Label className="font-bold text-foreground text-primary text-base">Payment Date for All Payments</Label>
            <Input 
              type="date" 
              required
              value={formData.payment_date}
              onChange={e => setFormData({...formData, payment_date: e.target.value})}
              className="bg-background rounded-xl border-primary/30 h-12 shadow-sm"
            />
            <p className="text-xs text-primary/80 font-medium">All payments and waivers configured below will be consolidated to this exact date.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-medium text-foreground">Select Card</Label>
              <Select 
                value={formData.card_id} 
                onValueChange={v => setFormData({...formData, card_id: v})}
              >
                <SelectTrigger className="bg-background rounded-xl">
                  <SelectValue placeholder="Select associated card" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map(card => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.bank_name} - {card.card_name} (..{card.card_number_last4})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-medium text-foreground">Payment Method</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={v => setFormData({...formData, payment_method: v})}
              >
                <SelectTrigger className="bg-background rounded-xl">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isMultiSplit ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-medium text-foreground">Payment Amount (₹)</Label>
                <Input 
                  type="number" 
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.payment_amount}
                  onChange={e => setFormData({...formData, payment_amount: e.target.value})}
                  className="bg-background rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-foreground text-primary">Surcharge Waiver (₹)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="0.00 (Optional)"
                  value={formData.waiver_amount}
                  onChange={e => setFormData({...formData, waiver_amount: e.target.value})}
                  className="bg-background rounded-xl border-primary/20 focus-visible:ring-primary/30"
                />
              </div>
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-xl border border-border mt-2">
              <p className="text-sm font-semibold text-foreground mb-3">Scheduling {splits.length} Transactions:</p>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                {splits.map((s, i) => (
                  <div key={i} className="flex justify-between items-center text-sm bg-background p-3 rounded-lg border border-border">
                    <span className="font-medium">Split {i+1}</span>
                    <div className="text-right">
                      <span className="font-bold tabular-nums">₹{s.amount.toLocaleString()}</span>
                      {s.savings > 0 && <span className="text-xs text-primary font-medium block">+ Waiver: ₹{s.savings.toLocaleString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-medium">Total Bill Combined</span>
                <span className="font-bold text-foreground">₹{splits.reduce((a,b)=>a+b.amount,0).toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-medium text-foreground">Notes (Optional)</Label>
            <Textarea 
              placeholder="Details about this payment..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="resize-none bg-background rounded-xl"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="rounded-xl shadow-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl shadow-sm">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editRecord ? 'Save Changes' : (isMultiSplit ? `Plan ${splits.length} Payments` : 'Schedule Payment')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}