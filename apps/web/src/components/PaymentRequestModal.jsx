import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { formatCurrency } from '@/lib/analyticsUtils.js';

const PaymentRequestModal = ({ isOpen, onClose, trip, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action) => {
    setLoading(true);
    try {
      if (action === 'send') {
        const today = new Date();
        const due = new Date();
        due.setDate(today.getDate() + 7);

        // 1. Create payment request
        await pb.collection('payment_requests').create({
          trip_id: trip.id,
          client_id: trip.client_id || trip.expand?.client_id?.id,
          amount: trip.revenue || 0,
          request_date: today.toISOString().split('T')[0],
          due_date: due.toISOString().split('T')[0],
          status: 'Pending'
        }, { $autoCancel: false });

        toast.success('Payment request sent to client');
      }

      // 2. Update trip status to completed
      await pb.collection('trip_logs').update(trip.id, {
        trip_status: 'Completed'
      }, { $autoCancel: false });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error handling payment request:', err);
      toast.error('Failed to process payment request action.');
    } finally {
      setLoading(false);
    }
  };

  if (!trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Payment Request?</DialogTitle>
          <DialogDescription>
            You marked trip to <span className="font-semibold text-foreground">{trip.route}</span> as Completed. 
            Would you like to send a payment request for <span className="font-semibold text-foreground">{formatCurrency(trip.revenue)}</span> to the client now?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleAction('skip')} disabled={loading}>
            Skip for Now
          </Button>
          <Button onClick={() => handleAction('send')} disabled={loading || !trip.client_id}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send Payment Request
          </Button>
        </DialogFooter>
        {!trip.client_id && !trip.expand?.client_id && (
          <p className="text-xs text-destructive text-center mt-2">Cannot send request: No client assigned to this trip.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentRequestModal;