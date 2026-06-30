import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient.js';

const BulkPaymentModal = ({ isOpen, onClose, selectedRecords, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    payment_mode: 'bank transfer',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    remarks: 'Bulk Processed'
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        payment_mode: 'bank transfer',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        remarks: 'Bulk Processed'
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecords || selectedRecords.length === 0) return;
    setLoading(true);

    try {
      const promises = selectedRecords.map(async (recordId) => {
        const response = await apiServerClient.fetch(`/payroll/${recordId}/disburse`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            payment_mode: formData.payment_mode,
            payment_date: formData.payment_date + ' 12:00:00.000Z',
            remarks: formData.remarks
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `Failed to disburse record ${recordId}`);
        }
        return response.json();
      });
      
      await Promise.all(promises);
      
      toast.success(`Marked ${selectedRecords.length} records as paid`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to process bulk payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Bulk Mark as Paid</DialogTitle>
          <DialogDescription>
            You are about to mark {selectedRecords.length} salaries as paid. This action cannot be undone easily.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Payment Mode (Applied to all)</Label>
            <Select value={formData.payment_mode} onValueChange={(val) => setFormData({...formData, payment_mode: val})}>
              <SelectTrigger className="bg-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="bank transfer">Bank Transfer</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Payment Date</Label>
            <Input 
              type="date" 
              required
              className="bg-input text-foreground"
              value={formData.payment_date}
              onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Input 
              type="text" 
              className="bg-input text-foreground"
              placeholder="Bulk ref no."
              value={formData.remarks}
              onChange={(e) => setFormData({...formData, remarks: e.target.value})}
            />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-success text-success-foreground hover:bg-success/90">
              {loading ? 'Processing...' : 'Confirm Bulk Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkPaymentModal;