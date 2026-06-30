import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, Receipt, Users, Banknote, FileText } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const InvoiceForm = ({ invoice, prefilledQuote, onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    invoice_number: `INV-${Date.now().toString().slice(-6)}`,
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customer_name: '',
    customer_email: '',
    customer_address: '',
    customer_phone: '',
    company_name: 'FastFreight Logistics',
    company_address: '123 Transport Hub, Industrial Area\nNew Delhi, India',
    company_phone: '+91 9876543210',
    company_email: 'billing@fastfreight.com',
    payment_terms: 'Net 14 Days',
    bank_details: 'Bank: State Bank of India\nA/C No: 33445566778\nIFSC: SBIN0001234',
    notes: '',
    status: 'Draft',
    tax_percentage: 18,
    discount_percentage: 0,
    quote_reference: ''
  });

  const [lineItems, setLineItems] = useState([
    { id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, amount: 0 }
  ]);

  // Pre-fill data if editing or converting from quote
  useEffect(() => {
    if (invoice) {
      setFormData({
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date.split('T')[0],
        due_date: invoice.due_date.split('T')[0],
        customer_name: invoice.customer_name || '',
        customer_email: invoice.customer_email || '',
        customer_address: invoice.customer_address || '',
        customer_phone: invoice.customer_phone || '',
        company_name: invoice.company_name || '',
        company_address: invoice.company_address || '',
        company_phone: invoice.company_phone || '',
        company_email: invoice.company_email || '',
        payment_terms: invoice.payment_terms || '',
        bank_details: invoice.bank_details || '',
        notes: invoice.notes || '',
        status: invoice.status || 'Draft',
        tax_percentage: invoice.tax_percentage || 0,
        discount_percentage: invoice.discount_percentage || 0,
        quote_reference: invoice.quote_reference || ''
      });
      setLineItems(invoice.line_items || []);
    } else if (prefilledQuote) {
      setFormData(prev => ({
        ...prev,
        customer_name: prefilledQuote.customer_name,
        customer_email: prefilledQuote.customer_email,
        customer_phone: prefilledQuote.customer_phone || '',
        quote_reference: prefilledQuote.id
      }));
      setLineItems([{
        id: crypto.randomUUID(),
        description: `Freight charges for Quote ${prefilledQuote.quote_number} (${prefilledQuote.origin} to ${prefilledQuote.destination})`,
        quantity: 1,
        unit_price: prefilledQuote.total_price,
        amount: prefilledQuote.total_price
      }]);
    }
  }, [invoice, prefilledQuote]);

  // Handle general field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Line item operations
  const handleLineItemChange = (id, field, value) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.unit_price);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const addLineItem = () => {
    setLineItems(prev => [
      ...prev,
      { id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, amount: 0 }
    ]);
  };

  const removeLineItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Real-time calculations
  const calculations = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const tax_amount = subtotal * (Number(formData.tax_percentage) / 100);
    const discount_amount = subtotal * (Number(formData.discount_percentage) / 100);
    const total_amount = subtotal + tax_amount - discount_amount;

    return { subtotal, tax_amount, discount_amount, total_amount };
  }, [lineItems, formData.tax_percentage, formData.discount_percentage]);

  const handleSubmit = async (e, forcedStatus = null) => {
    e.preventDefault();
    setLoading(true);

    const submitStatus = forcedStatus || formData.status;

    try {
      const payload = {
        ...formData,
        status: submitStatus,
        tax_percentage: Number(formData.tax_percentage),
        discount_percentage: Number(formData.discount_percentage),
        subtotal: calculations.subtotal,
        tax_amount: calculations.tax_amount,
        discount_amount: calculations.discount_amount,
        total_amount: calculations.total_amount,
        line_items: lineItems,
        created_by: currentUser.id
      };

      if (invoice) {
        await pb.collection('invoices').update(invoice.id, payload, { $autoCancel: false });
        toast.success(`Invoice updated (${submitStatus})`);
      } else {
        await pb.collection('invoices').create(payload, { $autoCancel: false });
        toast.success(`Invoice created (${submitStatus})`);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border-border rounded-xl shadow-sm border p-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="w-6 h-6 text-primary" />
          {invoice ? 'Edit Invoice' : 'Create New Invoice'}
        </h2>
        {prefilledQuote && (
          <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
            Generating from Quote #{prefilledQuote.quote_number}
          </span>
        )}
      </div>

      <form onSubmit={(e) => handleSubmit(e, null)} className="space-y-8">
        
        {/* Top Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Invoice Info */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border">
            <h3 className="font-semibold flex items-center gap-2 text-muted-foreground border-b border-border pb-2">
              <FileText className="w-4 h-4" /> Invoice Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input value={formData.invoice_number} readOnly className="bg-muted font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Input type="date" required value={formData.invoice_date} onChange={(e) => handleChange('invoice_date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" required value={formData.due_date} onChange={(e) => handleChange('due_date', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border">
            <h3 className="font-semibold flex items-center gap-2 text-muted-foreground border-b border-border pb-2">
              <Users className="w-4 h-4" /> Bill To (Customer)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input required value={formData.customer_name} onChange={(e) => handleChange('customer_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" required value={formData.customer_email} onChange={(e) => handleChange('customer_email', e.target.value)} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Address</Label>
                <Textarea value={formData.customer_address} onChange={(e) => handleChange('customer_address', e.target.value)} className="resize-none h-12" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Phone</Label>
                <Input value={formData.customer_phone} onChange={(e) => handleChange('customer_phone', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Banknote className="w-5 h-5 text-primary" /> Line Items
          </h3>
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="bg-muted grid grid-cols-12 gap-4 p-3 text-sm font-medium text-muted-foreground">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-right">Quantity</div>
              <div className="col-span-2 text-right">Unit Price (₹)</div>
              <div className="col-span-2 text-right">Amount (₹)</div>
            </div>
            <div className="divide-y divide-border">
              {lineItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 p-3 items-center group hover:bg-muted/10 transition-colors">
                  <div className="col-span-6">
                    <Input 
                      placeholder="Item description..." 
                      required 
                      value={item.description} 
                      onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)} 
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      min="1" 
                      required 
                      className="text-right" 
                      value={item.quantity} 
                      onChange={(e) => handleLineItemChange(item.id, 'quantity', e.target.value)} 
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      step="0.01" 
                      required 
                      className="text-right" 
                      value={item.unit_price} 
                      onChange={(e) => handleLineItemChange(item.id, 'unit_price', e.target.value)} 
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <span className="font-medium">{(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeLineItem(item.id)} 
                      disabled={lineItems.length === 1}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="mt-2 text-primary border-primary/20 hover:bg-primary/5">
            <PlusCircle className="w-4 h-4 mr-2" /> Add Line Item
          </Button>
        </div>

        {/* Footer Calcs & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Textarea value={formData.payment_terms} onChange={(e) => handleChange('payment_terms', e.target.value)} className="resize-none" />
            </div>
            <div className="space-y-2">
              <Label>Bank Details</Label>
              <Textarea value={formData.bank_details} onChange={(e) => handleChange('bank_details', e.target.value)} className="h-24 resize-none font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Internal Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} className="resize-none" />
            </div>
          </div>

          <div className="bg-muted/30 p-6 rounded-xl border border-border h-fit space-y-4">
            <h3 className="font-semibold mb-4 text-muted-foreground">Calculation Summary</h3>
            <div className="flex justify-between items-center text-sm">
              <span>Subtotal</span>
              <span className="font-medium">₹{calculations.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span>Tax (%)</span>
                <Input 
                  type="number" 
                  className="w-16 h-8 text-right px-2" 
                  value={formData.tax_percentage} 
                  onChange={(e) => handleChange('tax_percentage', e.target.value)} 
                />
              </div>
              <span>₹{calculations.tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span>Discount (%)</span>
                <Input 
                  type="number" 
                  className="w-16 h-8 text-right px-2" 
                  value={formData.discount_percentage} 
                  onChange={(e) => handleChange('discount_percentage', e.target.value)} 
                />
              </div>
              <span className="text-destructive">- ₹{calculations.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
              <span className="font-bold text-lg">Total Amount</span>
              <span className="font-bold text-xl text-primary">₹{calculations.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          )}
          <Button 
            type="button" 
            variant="secondary" 
            disabled={loading} 
            onClick={(e) => handleSubmit(e, 'Draft')}
          >
            Save as Draft
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            onClick={(e) => handleSubmit(e, 'Sent')}
          >
            {loading ? 'Saving...' : 'Save & Send Invoice'}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default InvoiceForm;