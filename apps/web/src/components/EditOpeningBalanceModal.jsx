import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function EditOpeningBalanceModal({ isOpen, onClose, onSuccess, existingRecord }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (existingRecord) {
        const isExpense = existingRecord.transaction_type === 'Expense' || existingRecord.transaction_type === 'expense' || existingRecord.transaction_type === 'debit';
        const displayAmt = isExpense ? -existingRecord.amount : existingRecord.amount;
        setAmount(displayAmt?.toString() || '0');
        setDate(existingRecord.date ? existingRecord.date.split('T')[0] : new Date().toISOString().split('T')[0]);
        setNotes(existingRecord.notes || '');
      } else {
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
      }
    }
  }, [isOpen, existingRecord]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
      toast.error('Please enter a valid number for the amount');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const data = {
        amount: Math.abs(numAmount), // Store positive amount, type defines direction
        date: new Date(date).toISOString(),
        description: 'Opening Balance',
        category: 'Manual',
        transaction_type: numAmount >= 0 ? 'Income' : 'Expense',
        status: 'Completed',
        reference_type: 'opening_balance',
        added_by: pb.authStore.model?.id || ''
      };

      let record = null;
      try {
        record = await pb.collection('cashbook').getFirstListItem(
          `description="Opening Balance" || reference_type="opening_balance"`, 
          { $autoCancel: false }
        );
      } catch (err) {
        // Not found, will create new
      }

      if (record) {
        await pb.collection('cashbook').update(record.id, data, { $autoCancel: false });
        toast.success('Opening balance updated successfully');
      } else {
        await pb.collection('cashbook').create(data, { $autoCancel: false });
        toast.success('Opening balance set successfully');
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving opening balance:', error);
      toast.error(error.message || 'Failed to save opening balance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-[425px] max-h-[92vh] flex flex-col p-6 overflow-hidden rounded-2xl bg-background gap-0">
        <DialogHeader className="shrink-0 pb-3 border-b border-border/50">
          <DialogTitle className="font-heading">Set Opening Balance</DialogTitle>
          <DialogDescription>
            Establish the starting point for your running balance in the cashbook system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
          <div className="space-y-2">
            <Label htmlFor="ob-amount" className="text-foreground font-medium">Amount (₹)</Label>
            <Input
              id="ob-amount"
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-foreground rounded-xl"
              placeholder="e.g. 15000 or -500"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter a positive number for credit balance or negative number for debt balance
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ob-date" className="text-foreground font-medium">Date</Label>
            <Input
              id="ob-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl"
              required
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" className="rounded-xl shadow-sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl shadow-sm" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Balance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}