import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function ClientPaymentsModal({ isOpen, onClose, clientId, onSuccess, existingPayment = null }) {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [formData, setFormData] = useState({
    payment_date: '',
    amount: '',
    payment_method: 'Bank Transfer',
    reference_number: '',
    invoice_id: 'none',
    notes: ''
  });

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await pb.collection('client_invoices').getFullList({
          filter: `client_id="${clientId}" && payment_status != "Paid"`,
          sort: '-created',
          $autoCancel: false
        });
        setInvoices(res);
      } catch (err) {
        console.error("Failed to load invoices", err);
      }
    };
    if (isOpen) {
      fetchInvoices();
    }
  }, [clientId, isOpen]);

  useEffect(() => {
    if (existingPayment) {
      setFormData({
        payment_date: existingPayment.payment_date ? existingPayment.payment_date.substring(0, 10) : '',
        amount: existingPayment.amount || '',
        payment_method: existingPayment.payment_method || 'Bank Transfer',
        reference_number: existingPayment.reference_number || '',
        invoice_id: existingPayment.invoice_id || 'none',
        notes: existingPayment.notes || ''
      });
    } else {
      setFormData({
        payment_date: new Date().toISOString().substring(0, 10),
        amount: '',
        payment_method: 'Bank Transfer',
        reference_number: '',
        invoice_id: 'none',
        notes: ''
      });
    }
  }, [existingPayment, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.payment_date) return toast.error('Payment Date is required');
    if (!formData.amount) return toast.error('Amount is required');

    setLoading(true);
    try {
      const data = {
        ...formData,
        client_id: clientId,
        invoice_id: formData.invoice_id === 'none' ? null : formData.invoice_id,
        amount: Number(formData.amount) || 0,
        payment_date: formData.payment_date ? new Date(formData.payment_date).toISOString() : null,
      };

      if (existingPayment) {
        await pb.collection('client_payments').update(existingPayment.id, data, { $autoCancel: false });
        toast.success('Payment updated successfully');
      } else {
        await pb.collection('client_payments').create(data, { $autoCancel: false });
        toast.success('Payment recorded successfully');
        
        // If linked to invoice, auto-update the invoice paid amount
        if (data.invoice_id) {
          try {
            const invoice = await pb.collection('client_invoices').getOne(data.invoice_id, { $autoCancel: false });
            const newPaid = (invoice.paid_amount || 0) + data.amount;
            const newBalance = Math.max(0, (invoice.amount || 0) - newPaid);
            let status = invoice.payment_status;
            if (newPaid >= invoice.amount) status = 'Paid';
            else if (newPaid > 0) status = 'Partially Paid';
            
            await pb.collection('client_invoices').update(invoice.id, {
              paid_amount: newPaid,
              balance: newBalance,
              payment_status: status
            }, { $autoCancel: false });
          } catch(err) {
            console.error("Could not update linked invoice", err);
            toast.warning('Payment recorded but linked invoice could not be updated.');
          }
        }
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving payment:', err);
      toast.error(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{existingPayment ? 'Edit Payment' : 'Record New Payment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date <span className="text-destructive">*</span></Label>
              <Input type="date" id="payment_date" name="payment_date" value={formData.payment_date} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) <span className="text-destructive">*</span></Label>
              <Input type="number" id="amount" name="amount" min="0.01" step="0.01" value={formData.amount} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Method <span className="text-destructive">*</span></Label>
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
              <Label htmlFor="reference_number">Reference No.</Label>
              <Input id="reference_number" name="reference_number" value={formData.reference_number} onChange={handleChange} placeholder="Txn ID, Cheque No..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice_id">Link to Invoice</Label>
            <Select value={formData.invoice_id} onValueChange={(val) => handleSelectChange('invoice_id', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Unpaid Invoice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Do not link to specific invoice --</SelectItem>
                {invoices.map(inv => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.invoice_number} (Bal: ₹{inv.balance?.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} value={formData.notes} onChange={handleChange} placeholder="Additional details..." />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Payment'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}