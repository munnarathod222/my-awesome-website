import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { formatCurrency } from '@/lib/analyticsUtils.js';

const SendPaymentReminderModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('Email');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (request && isOpen) {
      const clientName = request.expand?.client_id?.client_name || 'Valued Client';
      const formattedDue = request.due_date ? format(new Date(request.due_date), 'dd MMM yyyy') : 'immediately';
      setMessage(`Dear ${clientName},\n\nThis is a reminder that payment of ${formatCurrency(request.amount)} for Trip ID ${request.trip_id} is due on ${formattedDue}.\n\nPlease arrange payment at your earliest convenience.\n\nThank you.`);
    }
  }, [request, isOpen]);

  const handleSend = async () => {
    setLoading(true);
    try {
      // Since this is a simulated send, we just log it in the request's notes
      const timeStr = format(new Date(), 'dd MMM yyyy HH:mm');
      const logEntry = `[${timeStr}] Reminder sent via ${method}`;
      
      const updatedNotes = request.notes ? `${request.notes}\n${logEntry}` : logEntry;

      await pb.collection('payment_requests').update(request.id, {
        notes: updatedNotes
      }, { $autoCancel: false });

      toast.success(`Reminder sent to client via ${method}`);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error sending reminder:', err);
      toast.error('Failed to send reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Payment Reminder</DialogTitle>
          <DialogDescription>Draft a reminder message for the client.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Send Via</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground mt-1">Note: This is simulated in the current environment and will log the action.</p>
          </div>

          <div className="space-y-2">
            <Label>Message Template</Label>
            <Textarea 
              className="min-h-[150px]"
              value={message} 
              onChange={e => setMessage(e.target.value)} 
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSend} disabled={loading || !message.trim()}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bell className="w-4 h-4 mr-2" />}
            Send Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendPaymentReminderModal;