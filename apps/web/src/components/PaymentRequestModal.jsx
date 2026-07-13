import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { formatCurrency } from '@/lib/analyticsUtils.js';

/**
 * PaymentRequestModal — shown after a trip is marked as "Delivered".
 * The trip status has ALREADY been saved as "Delivered" before this modal opens.
 * This modal's only job is to optionally create a payment_request record.
 */
const PaymentRequestModal = ({ isOpen, onClose, trip, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const due = new Date();
      due.setDate(today.getDate() + 7);

      await pb.collection('payment_requests').create({
        trip_id: trip.id,
        client_id: trip.client_id || trip.expand?.client_id?.id,
        amount: trip.revenue || 0,
        request_date: today.toISOString().split('T')[0],
        due_date: due.toISOString().split('T')[0],
        status: 'Pending'
      }, { $autoCancel: false });

      toast.success('Payment request sent to client');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error creating payment request:', err);
      toast.error('Failed to send payment request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Trip is already marked Delivered — just close the modal
    onSuccess?.();
    onClose();
  };

  if (!trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <DialogTitle className="text-xl font-heading">Trip Marked as Delivered</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            Trip to <span className="font-semibold text-foreground">{trip.route}</span> has been
            marked as <span className="font-semibold text-emerald-600">Delivered</span>.{' '}
            Would you like to send a payment request of{' '}
            <span className="font-semibold text-foreground">{formatCurrency(trip.revenue)}</span> to the client now?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleSkip} disabled={loading} className="rounded-xl">
            Skip for Now
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || !trip.client_id}
            className="rounded-xl shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send Payment Request
          </Button>
        </DialogFooter>
        {!trip.client_id && !trip.expand?.client_id && (
          <p className="text-xs text-destructive text-center mt-2">
            Cannot send request: No client assigned to this trip.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentRequestModal;