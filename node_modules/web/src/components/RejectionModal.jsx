import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { XCircle } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function RejectionModal({ isOpen, onClose, requestData, currentUser, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const handleReject = async () => {
    if (!requestData) return;
    if (!notes.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    
    setLoading(true);
    try {
      await pb.collection('signup_requests').update(requestData.id, {
        status: 'Rejected',
        approved_date: new Date().toISOString(),
        approved_by: currentUser.id,
        notes: notes
      }, { $autoCancel: false });

      toast.success('Request rejected successfully');
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Rejection error:", err);
      toast.error(err.message || "Failed to reject request.");
    } finally {
      setLoading(false);
    }
  };

  if (!requestData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="w-5 h-5" /> Reject Account Request
          </DialogTitle>
          <DialogDescription>
            You are about to reject the access request for <strong>{requestData.full_name}</strong> ({requestData.email}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reject_notes">Reason for Rejection <span className="text-destructive">*</span></Label>
            <Textarea 
              id="reject_notes" 
              placeholder="Please provide a reason. This will be stored for audit purposes..." 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none min-h-[100px]"
              required
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={handleReject} disabled={loading}>
            {loading ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}