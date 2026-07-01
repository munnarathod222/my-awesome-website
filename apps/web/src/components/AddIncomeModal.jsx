import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { format } from 'date-fns';

const AddIncomeModal = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: 'Trip Revenue',
    description: '',
    amount: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await pb.collection('cashbook').create({
        date: formData.date + ' 12:00:00.000Z',
        description: formData.description,
        category: formData.category,
        amount: parseFloat(formData.amount),
        transaction_type: 'Income',
        notes: formData.notes,
        added_by: currentUser.id
      }, { $autoCancel: false });

      toast.success('Income recorded in Cashbook');
      if (onSuccess) onSuccess();
      
      // Reset form
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        category: 'Trip Revenue',
        description: '',
        amount: '',
        notes: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Submission failed', error);
      toast.error('Failed to record income');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-md max-h-[92vh] flex flex-col p-6 overflow-hidden rounded-3xl bg-background gap-0">
        <DialogHeader className="shrink-0 pb-3 border-b border-border/50">
          <DialogTitle>Add Income</DialogTitle>
          <DialogDescription>
            Record new income directly into the Cashbook.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="income-date">Date</Label>
              <Input
                id="income-date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income-amount">Amount (₹)</Label>
              <Input
                id="income-amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-category">Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger id="income-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Trip Revenue">Trip Revenue</SelectItem>
                <SelectItem value="Advance Received">Advance Received</SelectItem>
                <SelectItem value="Loan Received">Loan Received</SelectItem>
                <SelectItem value="Asset Sale">Asset Sale</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-description">Description</Label>
            <Input
              id="income-description"
              required
              placeholder="E.g., Payment from Client XYZ"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-notes">Notes (Optional)</Label>
            <Textarea
              id="income-notes"
              placeholder="Additional information..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="resize-none h-20"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-success text-success-foreground hover:bg-success/90">
              {isSubmitting ? 'Saving...' : 'Record Income'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddIncomeModal;