import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Mail, Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function ApprovalModal({ isOpen, onClose, requestData, currentUser, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [role, setRole] = useState('manager');

  const handleApprove = async () => {
    if (!requestData) return;
    setLoading(true);

    try {
      // 1. Generate temporary password
      const tempPassword = crypto.randomUUID().slice(0, 10) + 'A1!';

      // 2. Create user account
      const newUserData = {
        email: requestData.email,
        password: tempPassword,
        passwordConfirm: tempPassword,
        full_name: requestData.full_name,
        role: role,
        status: 'active',
        phone_number: requestData.phone || '0000000000',
        emailVisibility: true
      };
      
      const newUser = await pb.collection('users').create(newUserData, { $autoCancel: false });

      // 3. Update signup request status
      await pb.collection('signup_requests').update(requestData.id, {
        status: 'Approved',
        approved_date: new Date().toISOString(),
        approved_by: currentUser.id,
        notes: notes || requestData.notes
      }, { $autoCancel: false });

      toast.success(
        <div>
          <p className="font-bold">User Approved & Created</p>
          <p className="text-sm mt-1">Temp Password: <strong>{tempPassword}</strong></p>
          <p className="text-xs mt-1 text-muted-foreground">Please share this securely with the user.</p>
        </div>,
        { duration: 10000 }
      );

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Approval error:", err);
      toast.error(err.message || "Failed to approve request. Ensure email isn't already used.");
    } finally {
      setLoading(false);
    }
  };

  if (!requestData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> Approve Account Request
          </DialogTitle>
          <DialogDescription>
            Approving this request will create a new user account and generate a temporary password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/40 p-4 rounded-xl border border-border/50 text-sm grid grid-cols-2 gap-y-3 gap-x-4">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Full Name</p>
              <p className="font-medium text-foreground">{requestData.full_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
              <p className="font-medium text-foreground truncate" title={requestData.email}>{requestData.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Building2 className="w-3 h-3" /> Company</p>
              <p className="font-medium text-foreground">{requestData.company_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Requested On</p>
              <p className="font-medium text-foreground">{format(new Date(requestData.requested_date), 'MMM dd, yyyy')}</p>
            </div>
            {requestData.reason && (
              <div className="col-span-2 mt-2 pt-2 border-t border-border/50">
                <p className="text-muted-foreground text-xs mb-1">Reason Provided</p>
                <p className="text-foreground italic">"{requestData.reason}"</p>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="role">Assign Role <span className="text-destructive">*</span></Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="dispatcher">Dispatcher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Internal notes about this approval..." 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleApprove} disabled={loading} className="bg-success text-success-foreground hover:bg-success/90">
            {loading ? 'Approving...' : 'Create Account & Approve'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}