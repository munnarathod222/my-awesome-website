import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const MarkPaymentPaidModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: request?.amount || '',
    payment_method: '',
    notes: ''
  });

  // Keep state sync when request prop changes
  React.useEffect(() => {
    if (request) {
      setFormData(prev => ({ ...prev, amount: request.amount || '' }));
    }
  }, [request]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.payment_method) {
      toast.error('Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      // 1. Update Payment Request
      await pb.collection('payment_requests').update(request.id, {
        status: 'Paid',
        payment_method: formData.payment_method,
        notes: request.notes ? `${request.notes}\nPaid Note: ${formData.notes}` : formData.notes
      }, { $autoCancel: false });

      // 2. Update Trip Log client_payment_status
      if (request.trip_id) {
        await pb.collection('trip_logs').update(request.trip_id, {
          client_payment_status: 'received'
        }, { $autoCancel: false });
      }

      toast.success('Payment marked as received');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error marking payment as paid:', err);
      toast.error('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Payment as Received</DialogTitle>
          <DialogDescription>Record the payment details received from the client.</DialogDescription>
        </DialogHeader>
        
        <form id="mark-paid-form" onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="date">Payment Date</Label>
            <Input 
              id="date" 
              type="date" 
              required
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount Received (₹)</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01" 
              required
              value={formData.amount} 
              onChange={e => setFormData({...formData, amount: e.target.value})} 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select required value={formData.payment_method} onValueChange={v => setFormData({...formData, payment_method: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Check">Check</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              placeholder="Transaction ID or remarks..." 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})} 
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" form="mark-paid-form" disabled={loading || !formData.payment_method}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarkPaymentPaidModal;