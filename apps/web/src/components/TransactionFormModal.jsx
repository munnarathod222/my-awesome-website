import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const TransactionFormModal = ({ isOpen, onClose, cashbookId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    transaction_type: 'Cash Out',
    amount: '',
    payment_mode: 'Cash',
    category: 'Other',
    description: '',
    reference_number: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    try {
      await pb.collection('cashbook_transactions').create({
        cashbook_id: cashbookId,
        date: new Date(formData.date).toISOString(),
        transaction_type: formData.transaction_type === 'Cash In' ? 'credit' : 'debit',
        amount: Number(formData.amount),
        payment_mode: formData.payment_mode,
        category: formData.category,
        description: formData.description,
        reference_number: formData.reference_number
      }, { $autoCancel: false });

      toast.success('Transaction added successfully');
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        transaction_type: 'Cash Out',
        amount: '',
        payment_mode: 'Cash',
        category: 'Other',
        description: '',
        reference_number: ''
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Create transaction error:', error);
      toast.error('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tx_type">Type</Label>
              <Select 
                value={formData.transaction_type} 
                onValueChange={(val) => setFormData({ ...formData, transaction_type: val })}
              >
                <SelectTrigger className={formData.transaction_type === 'Cash In' ? 'text-success font-medium' : 'text-destructive font-medium'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash In" className="text-success">Cash In (Credit)</SelectItem>
                  <SelectItem value="Cash Out" className="text-destructive">Cash Out (Debit)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx_date">Date</Label>
              <Input
                id="tx_date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tx_amount">Amount <span className="text-destructive">*</span></Label>
              <Input
                id="tx_amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="font-bold text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx_payment_mode">Payment Mode</Label>
              <Select 
                value={formData.payment_mode} 
                onValueChange={(val) => setFormData({ ...formData, payment_mode: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx_category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(val) => setFormData({ ...formData, category: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fuel">Fuel</SelectItem>
                <SelectItem value="Salary">Salary</SelectItem>
                <SelectItem value="Advance">Advance</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="FASTag">FASTag</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx_desc">Description</Label>
            <Input
              id="tx_desc"
              placeholder="What was this for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx_ref">Reference Number (Optional)</Label>
            <Input
              id="tx_ref"
              placeholder="Receipt or Ref #"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionFormModal;