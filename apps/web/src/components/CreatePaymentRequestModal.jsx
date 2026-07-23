import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreditCard, Calendar, User, FileText, PlusCircle, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

const CATEGORIES = [
  'Freight Invoice',
  'Detention / Halting Charge',
  'Loading & Unloading Charge',
  'Toll Reimbursement',
  'Damage / Shortage Claim Settlement',
  'Custom Service Invoice'
];

export default function CreatePaymentRequestModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [unpaidTrips, setUnpaidTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);

  const [formData, setFormData] = useState({
    client_id: '',
    trip_id: '',
    category: 'Freight Invoice',
    amount: '',
    invoice_no: '',
    request_date: new Date().toISOString().split('T')[0],
    due_date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split('T')[0];
    })(),
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchMasterData();
      setFormData({
        client_id: '',
        trip_id: '',
        category: 'Freight Invoice',
        amount: '',
        invoice_no: `INV-${Date.now().toString().substring(7)}`,
        request_date: new Date().toISOString().split('T')[0],
        due_date: (() => {
          const d = new Date();
          d.setDate(d.getDate() + 7);
          return d.toISOString().split('T')[0];
        })(),
        notes: ''
      });
    }
  }, [isOpen]);

  const fetchMasterData = async () => {
    try {
      const [cls, trips] = await Promise.all([
        pb.collection('clients').getFullList({ sort: 'client_name', $autoCancel: false }),
        pb.collection('trip_logs').getFullList({
          filter: 'client_payment_status = "pending" || client_payment_status = "delayed"',
          sort: '-date',
          $autoCancel: false
        })
      ]);
      setClients(cls);
      setUnpaidTrips(trips);
    } catch (err) {
      console.error('Failed to fetch modal master data:', err);
    }
  };

  const handleClientChange = (clientId) => {
    setFormData(prev => ({ ...prev, client_id: clientId, trip_id: '', amount: '' }));
    if (clientId) {
      const clientTrips = unpaidTrips.filter(t => t.client_id === clientId);
      setFilteredTrips(clientTrips);
    } else {
      setFilteredTrips([]);
    }
  };

  const handleTripChange = (tripId) => {
    const tripObj = unpaidTrips.find(t => t.id === tripId);
    setFormData(prev => ({
      ...prev,
      trip_id: tripId,
      amount: tripObj ? String(tripObj.revenue || tripObj.freight_amount || '') : prev.amount
    }));
  };

  const setDuePreset = (days) => {
    const reqDate = formData.request_date ? new Date(formData.request_date) : new Date();
    reqDate.setDate(reqDate.getDate() + days);
    setFormData(prev => ({ ...prev, due_date: reqDate.toISOString().split('T')[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_id) {
      toast.error('Please select a Client');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid Amount');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        client_id: formData.client_id,
        trip_id: formData.trip_id || null,
        amount: Number(formData.amount),
        request_date: new Date(formData.request_date).toISOString(),
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        status: 'Pending',
        invoice_no: formData.invoice_no || `INV-${Date.now().toString().substring(7)}`,
        notes: `[${formData.category}] ${formData.notes}`.trim()
      };

      let createdRecord = null;
      try {
        createdRecord = await pb.collection('payment_requests').create(payload, { $autoCancel: false });
      } catch (pbErr) {
        console.warn('PocketBase payment_requests create warning:', pbErr);
      }

      // If tied to a trip, update trip log status
      if (formData.trip_id) {
        try {
          await pb.collection('trip_logs').update(formData.trip_id, {
            client_payment_status: 'pending'
          }, { $autoCancel: false });
        } catch (e) {}
      }

      // Sync into local storage fallback
      try {
        const localReqs = JSON.parse(localStorage.getItem('jbc_payment_requests') || '[]');
        const selectedClientObj = clients.find(c => c.id === formData.client_id);
        const selectedTripObj = unpaidTrips.find(t => t.id === formData.trip_id);
        
        const localItem = {
          id: createdRecord?.id || `pr_${Date.now()}`,
          client_id: formData.client_id,
          trip_id: formData.trip_id,
          amount: Number(formData.amount),
          request_date: payload.request_date,
          due_date: payload.due_date,
          status: 'Pending',
          calculatedStatus: 'Pending',
          daysOverdue: 0,
          invoice_no: payload.invoice_no,
          notes: payload.notes,
          created: new Date().toISOString(),
          expand: {
            client_id: selectedClientObj,
            trip_id: selectedTripObj
          }
        };

        localStorage.setItem('jbc_payment_requests', JSON.stringify([localItem, ...localReqs]));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}

      toast.success(`Payment request of ₹${Number(formData.amount).toLocaleString('en-IN')} created successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create payment request:', err);
      toast.error('Failed to create payment request: ' + (err.message || 'Error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[580px] bg-card text-card-foreground border-border rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold font-heading flex items-center gap-2">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
              <PlusCircle className="w-5 h-5" />
            </div>
            Create New Payment Request
          </DialogTitle>
          <DialogDescription>
            Generate a formal payment request or freight invoice for any client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Client Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-primary" /> Select Client *
            </Label>
            <Select value={formData.client_id} onValueChange={handleClientChange}>
              <SelectTrigger className="bg-background border-border rounded-xl font-medium text-sm">
                <SelectValue placeholder="-- Choose Client --" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="font-semibold text-foreground">{c.client_name || c.name}</span>
                    {c.company_name && <span className="text-xs text-muted-foreground ml-2">({c.company_name})</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Optional Trip Log Selection */}
          {formData.client_id && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-blue-500" /> Associated Trip Log (Optional)
              </Label>
              <Select value={formData.trip_id} onValueChange={handleTripChange}>
                <SelectTrigger className="bg-background border-border rounded-xl text-sm">
                  <SelectValue placeholder="-- Select Unpaid Trip (Optional) --" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">No Trip (Standalone Invoice)</SelectItem>
                  {filteredTrips.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="font-mono font-bold text-blue-500 mr-2">{t.trip_id || t.id.substring(0, 8)}</span>
                      <span>{t.origin || 'Origin'} ➔ {t.destination || 'Destination'}</span>
                      <span className="text-xs text-emerald-500 font-bold ml-2">(₹{Number(t.revenue || 0).toLocaleString('en-IN')})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Request Category
              </Label>
              <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))}>
                <SelectTrigger className="bg-background border-border rounded-xl text-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Request Amount (₹) *
              </Label>
              <Input
                type="number"
                required
                min="1"
                placeholder="e.g. 45000"
                value={formData.amount}
                onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                className="bg-background border-border rounded-xl font-bold font-mono text-base text-emerald-500"
              />
            </div>
          </div>

          {/* Dates & Presets */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Request Date
              </Label>
              <Input
                type="date"
                value={formData.request_date}
                onChange={e => setFormData(p => ({ ...p, request_date: e.target.value }))}
                className="bg-background border-border rounded-xl text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Due Date
                </Label>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setDuePreset(7)} className="text-[10px] px-1.5 py-0.5 bg-muted hover:bg-primary/20 hover:text-primary rounded font-bold">7D</button>
                  <button type="button" onClick={() => setDuePreset(15)} className="text-[10px] px-1.5 py-0.5 bg-muted hover:bg-primary/20 hover:text-primary rounded font-bold">15D</button>
                  <button type="button" onClick={() => setDuePreset(30)} className="text-[10px] px-1.5 py-0.5 bg-muted hover:bg-primary/20 hover:text-primary rounded font-bold">30D</button>
                </div>
              </div>
              <Input
                type="date"
                value={formData.due_date}
                onChange={e => setFormData(p => ({ ...p, due_date: e.target.value }))}
                className="bg-background border-border rounded-xl text-sm font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Invoice Reference / Notes
            </Label>
            <Textarea
              placeholder="Add payment terms, PO number, or specific instructions for client..."
              rows={3}
              value={formData.notes}
              onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
              className="bg-background border-border rounded-xl text-sm"
            />
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-semibold">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6">
              {loading ? 'Creating...' : 'Create Payment Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
