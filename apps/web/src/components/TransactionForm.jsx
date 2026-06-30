import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const TransactionForm = ({ isOpen, onClose, cashbookId, transactionToEdit, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    transaction_type: 'Cash Out',
    amount: '',
    payment_mode: 'Cash',
    description: '',
    reference_number: '',
    category: 'Other'
  });

  useEffect(() => {
    if (transactionToEdit) {
      setFormData({
        date: transactionToEdit.date ? format(new Date(transactionToEdit.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        transaction_type: (transactionToEdit.transaction_type === 'credit' || transactionToEdit.transaction_type === 'Cash In') ? 'Cash In' : 'Cash Out',
        amount: transactionToEdit.amount || '',
        payment_mode: transactionToEdit.payment_mode || 'Cash',
        description: transactionToEdit.description || '',
        reference_number: transactionToEdit.reference_number || '',
        category: transactionToEdit.category || 'Other'
      });
      setFile(null);
    } else {
      resetForm();
    }
  }, [transactionToEdit, isOpen]);

  const resetForm = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      transaction_type: 'Cash Out',
      amount: '',
      payment_mode: 'Cash',
      description: '',
      reference_number: '',
      category: 'Other'
    });
    setFile(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('cashbook_id', cashbookId);
      data.append('date', formData.date + ' 12:00:00.000Z'); // Adding time to avoid timezone offset issues
      data.append('transaction_type', formData.transaction_type === 'Cash In' ? 'credit' : 'debit');
      data.append('amount', formData.amount);
      data.append('payment_mode', formData.payment_mode);
      data.append('description', formData.description);
      data.append('reference_number', formData.reference_number);
      data.append('category', formData.category);
      
      if (file) {
        data.append('image', file);
      }

      if (transactionToEdit) {
        await pb.collection('cashbook_transactions').update(transactionToEdit.id, data, { $autoCancel: false });
        toast.success('Transaction updated successfully');
      } else {
        await pb.collection('cashbook_transactions').create(data, { $autoCancel: false });
        toast.success('Transaction added successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(transactionToEdit ? 'Failed to update transaction' : 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{transactionToEdit ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-input text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction_type">Type *</Label>
              <Select 
                value={formData.transaction_type} 
                onValueChange={(val) => setFormData({ ...formData, transaction_type: val })}
              >
                <SelectTrigger id="transaction_type" className="bg-input text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash In">Cash In</SelectItem>
                  <SelectItem value="Cash Out">Cash Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-input text-foreground font-medium"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_mode">Payment Mode *</Label>
              <Select 
                value={formData.payment_mode} 
                onValueChange={(val) => setFormData({ ...formData, payment_mode: val })}
              >
                <SelectTrigger id="payment_mode" className="bg-input text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(val) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger id="category" className="bg-input text-foreground">
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
              <Label htmlFor="reference_number">Reference No. (Optional)</Label>
              <Input
                id="reference_number"
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                className="bg-input text-foreground"
                placeholder="Txn ID, Cheque No, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description / Remarks</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-input text-foreground resize-none"
              rows={3}
              placeholder="Add details about this transaction..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Attachment (Image)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="bg-input text-foreground cursor-pointer"
            />
            {transactionToEdit && transactionToEdit.image && !file && (
              <p className="text-xs text-muted-foreground mt-1">Current file will be kept if no new file is uploaded.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? 'Saving...' : transactionToEdit ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionForm;