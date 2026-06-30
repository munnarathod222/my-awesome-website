import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function ClientInvoicesModal({ isOpen, onClose, clientId, onSuccess, existingInvoice = null }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: '',
    invoice_date: '',
    due_date: '',
    amount: '',
    paid_amount: '0',
    payment_status: 'Unpaid',
    payment_method: '',
    notes: ''
  });

  useEffect(() => {
    if (existingInvoice) {
      setFormData({
        invoice_number: existingInvoice.invoice_number || '',
        invoice_date: existingInvoice.invoice_date ? existingInvoice.invoice_date.substring(0, 10) : '',
        due_date: existingInvoice.due_date ? existingInvoice.due_date.substring(0, 10) : '',
        amount: existingInvoice.amount || '',
        paid_amount: existingInvoice.paid_amount || '0',
        payment_status: existingInvoice.payment_status || 'Unpaid',
        payment_method: existingInvoice.payment_method || '',
        notes: existingInvoice.notes || ''
      });
    } else {
      setFormData({
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        invoice_date: new Date().toISOString().substring(0, 10),
        due_date: '',
        amount: '',
        paid_amount: '0',
        payment_status: 'Unpaid',
        payment_method: '',
        notes: ''
      });
    }
  }, [existingInvoice, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-update status based on amounts if manually changed
      if (name === 'amount' || name === 'paid_amount') {
        const amt = Number(name === 'amount' ? value : newData.amount) || 0;
        const paid = Number(name === 'paid_amount' ? value : newData.paid_amount) || 0;
        if (paid >= amt && amt > 0) newData.payment_status = 'Paid';
        else if (paid > 0 && paid < amt) newData.payment_status = 'Partially Paid';
        else if (paid === 0) newData.payment_status = 'Unpaid';
      }
      return newData;
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.invoice_number) return toast.error('Invoice Number is required');
    if (!formData.invoice_date) return toast.error('Invoice Date is required');
    if (!formData.amount) return toast.error('Amount is required');

    setLoading(true);
    try {
      const amt = Number(formData.amount) || 0;
      const paid = Number(formData.paid_amount) || 0;
      const balance = Math.max(0, amt - paid);

      const data = {
        ...formData,
        client_id: clientId,
        amount: amt,
        paid_amount: paid,
        balance: balance,
        invoice_date: formData.invoice_date ? new Date(formData.invoice_date).toISOString() : null,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      };

      if (existingInvoice) {
        await pb.collection('client_invoices').update(existingInvoice.id, data, { $autoCancel: false });
        toast.success('Invoice updated successfully');
      } else {
        // Verify unique invoice number
        const check = await pb.collection('client_invoices').getList(1, 1, { filter: `invoice_number="${data.invoice_number}"`, $autoCancel: false });
        if (check.items.length > 0) {
          throw new Error('Invoice Number already exists. Please choose a different one.');
        }
        await pb.collection('client_invoices').create(data, { $autoCancel: false });
        toast.success('Invoice created successfully');
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving invoice:', err);
      toast.error(err.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{existingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number <span className="text-destructive">*</span></Label>
              <Input id="invoice_number" name="invoice_number" value={formData.invoice_number} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_status">Status</Label>
              <Select value={formData.payment_status} onValueChange={(val) => handleSelectChange('payment_status', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_date">Invoice Date <span className="text-destructive">*</span></Label>
              <Input type="date" id="invoice_date" name="invoice_date" value={formData.invoice_date} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input type="date" id="due_date" name="due_date" value={formData.due_date} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Total Amount (₹) <span className="text-destructive">*</span></Label>
              <Input type="number" id="amount" name="amount" min="0" step="0.01" value={formData.amount} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paid_amount">Paid Amount (₹)</Label>
              <Input type="number" id="paid_amount" name="paid_amount" min="0" step="0.01" value={formData.paid_amount} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method (if paid)</Label>
            <Select value={formData.payment_method} onValueChange={(val) => handleSelectChange('payment_method', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Check">Check</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} value={formData.notes} onChange={handleChange} placeholder="Invoice notes or remarks..." />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Invoice'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}