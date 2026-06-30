import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { format } from 'date-fns';

export default function PlannedPaymentsModal({ isOpen, onClose, onSuccess, editRecord }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    expected_surcharge_amount: '',
    payment_method: 'Card',
    notes: ''
  });

  useEffect(() => {
    if (isOpen && editRecord) {
      setFormData({
        payment_date: editRecord.payment_date ? format(new Date(editRecord.payment_date), 'yyyy-MM-dd') : '',
        expected_surcharge_amount: editRecord.expected_surcharge_amount || '',
        payment_method: editRecord.payment_method || 'Card',
        notes: editRecord.notes || ''
      });
    } else if (isOpen) {
      setFormData({
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        expected_surcharge_amount: '',
        payment_method: 'Card',
        notes: ''
      });
    }
  }, [isOpen, editRecord]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        user_id: currentUser.id,
        payment_date: new Date(formData.payment_date).toISOString(),
        expected_surcharge_amount: parseFloat(formData.expected_surcharge_amount),
        payment_method: formData.payment_method,
        notes: formData.notes,
        status: editRecord ? editRecord.status : 'pending'
      };

      if (editRecord) {
        await pb.collection('planned_surcharge_payments').update(editRecord.id, payload, { $autoCancel: false });
        toast.success('Planned payment updated successfully');
      } else {
        await pb.collection('planned_surcharge_payments').create(payload, { $autoCancel: false });
        toast.success('Planned payment added successfully');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving planned payment:', err);
      toast.error(err.message || 'Failed to save planned payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{editRecord ? 'Edit Planned Payment' : 'Add Planned Payment'}</DialogTitle>
          <DialogDescription>
            Schedule upcoming surcharge deductions or expected payments.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input 
                type="date" 
                required
                value={formData.payment_date}
                onChange={e => setFormData({...formData, payment_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Amount (₹)</Label>
              <Input 
                type="number" 
                required
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.expected_surcharge_amount}
                onChange={e => setFormData({...formData, expected_surcharge_amount: e.target.value})}
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label>Payment Method</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={v => setFormData({...formData, payment_method: v})}
              >
                <SelectTrigger>
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

            <div className="space-y-2 col-span-2">
              <Label>Notes (Optional)</Label>
              <Textarea 
                placeholder="Details about this surcharge payment..."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editRecord ? 'Save Changes' : 'Add Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}