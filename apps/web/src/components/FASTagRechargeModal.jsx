import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';

import apiServerClient from '@/lib/apiServerClient.js';

const FASTagRechargeModal = ({ isOpen, onClose, truck, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recharge_date: format(new Date(), 'yyyy-MM-dd'),
    recharge_amount: '',
    payment_method: 'UPI',
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        recharge_date: format(new Date(), 'yyyy-MM-dd'),
        recharge_amount: '',
        payment_method: 'UPI',
        reference_number: '',
        notes: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.recharge_amount || !formData.payment_method) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);

    const withTimeout = (promise, ms) => Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Recharge timed out — please try again')), ms))
    ]);

    try {
      const amount = parseFloat(formData.recharge_amount);
      let saved = false;

      // Step 1: Try superuser backend API
      try {
        const apiRes = await withTimeout(apiServerClient.fetch('/driver/recharge-fastag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            truck_id: truck.id,
            recharge_date: `${formData.recharge_date} 12:00:00.000Z`,
            recharge_amount: amount,
            payment_method: formData.payment_method,
            reference_number: formData.reference_number,
            notes: formData.notes
          })
        }), 15000);

        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.success) {
            saved = true;
          }
        }
      } catch (apiErr) {
        console.warn('Backend FASTag recharge API notice, trying SDK direct:', apiErr.message);
      }

      // Step 2: Fallback to PocketBase SDK directly
      if (!saved) {
        // 1. Create recharge record
        await withTimeout(pb.collection('fastag_recharges').create({
          truck_id: truck.id,
          recharge_date: `${formData.recharge_date} 12:00:00.000Z`,
          recharge_amount: amount,
          payment_method: formData.payment_method,
          reference_number: formData.reference_number,
          notes: formData.notes
        }, { $autoCancel: false }), 15000).catch(() => {});

        // 2. Update truck balance
        const currentBalance = truck.current_fastag_balance || 0;
        await withTimeout(pb.collection('trucks').update(truck.id, {
          current_fastag_balance: currentBalance + amount,
          last_recharge_date: `${formData.recharge_date} 12:00:00.000Z`,
          last_recharge_amount: amount
        }, { $autoCancel: false }), 15000);

        // 3. Create expense record (pass truck.id, NOT truck_number!)
        try {
          await pb.collection('expenses').create({
            date: `${formData.recharge_date} 12:00:00.000Z`,
            category: 'FASTag Recharge',
            description: `FASTag Recharge for truck ${truck.truck_number}`,
            amount: amount,
            payment_method: formData.payment_method,
            truck_id: truck.id,
            status: 'Approved',
            notes: formData.notes || '',
            created_by: pb.authStore.model?.id || ''
          }, { $autoCancel: false });
        } catch (expErr) {}
      }

      toast.success('FASTag balance recharged successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('FASTag recharge error:', error);
      toast.error(`Failed to record recharge: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>Record FASTag Recharge - {truck?.truck_number}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Recharge Date *</Label>
              <Input 
                type="date"
                required
                value={formData.recharge_date}
                onChange={(e) => setFormData({...formData, recharge_date: e.target.value})}
                className="bg-input text-foreground border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (₹) *</Label>
              <Input 
                type="number"
                required
                step="0.01"
                min="1"
                value={formData.recharge_amount}
                onChange={(e) => setFormData({...formData, recharge_amount: e.target.value})}
                className="bg-input text-foreground border-border"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <Select value={formData.payment_method} onValueChange={(val) => setFormData({...formData, payment_method: val})}>
                <SelectTrigger className="bg-input text-foreground border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reference Number</Label>
              <Input 
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                className="bg-input text-foreground border-border"
                placeholder="UTR / Txn ID"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="bg-input text-foreground border-border min-h-[80px]"
              placeholder="Optional notes..."
            />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? 'Recording...' : 'Record Recharge'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FASTagRechargeModal;