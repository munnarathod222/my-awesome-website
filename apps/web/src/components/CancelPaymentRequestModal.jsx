import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const CancelPaymentRequestModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleCancel = async () => {
    setLoading(true);
    try {
      const updatedNotes = reason ? (request.notes ? `${request.notes}\nCancel Reason: ${reason}` : `Cancel Reason: ${reason}`) : request.notes;
      
      await pb.collection('payment_requests').update(request.id, {
        status: 'Cancelled',
        notes: updatedNotes
      }, { $autoCancel: false });

      toast.success('Payment request cancelled');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error cancelling request:', err);
      toast.error('Failed to cancel payment request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <XCircle className="w-5 h-5" /> Cancel Payment Request
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this payment request? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea 
              id="reason" 
              placeholder="Why is this request being cancelled?" 
              value={reason} 
              onChange={e => setReason(e.target.value)} 
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Keep Request</Button>
          <Button variant="destructive" onClick={handleCancel} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelPaymentRequestModal;