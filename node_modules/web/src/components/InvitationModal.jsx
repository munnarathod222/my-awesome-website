import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { validateEmail } from '@/lib/validators.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function InvitationModal({ isOpen, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('dispatcher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setEmail('');
    setRole('dispatcher');
    setError('');
  };

  const handleOpenChange = (open) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    console.log('[InvitationModal] Starting invitation submission process...');
    console.log('[InvitationModal] Input values - Email:', email, '| Role:', role);

    if (!email || !validateEmail(email)) {
      console.warn('[InvitationModal] Validation failed: Invalid email format.');
      setError('Please enter a valid email address.');
      return;
    }

    if (!role) {
      console.warn('[InvitationModal] Validation failed: Role not selected.');
      setError('Please select a role.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email,
        role,
        // Backend handles invited_by using req.auth.id, but we can pass name for logging/reference if needed
        invited_by_name: currentUser?.full_name || currentUser?.name || 'Admin', 
      };
      
      console.log('[InvitationModal] Sending API request to /invitations/send-invitation with payload:', payload);

      const response = await apiServerClient.fetch('/invitations/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('[InvitationModal] Received response status:', response.status);
      const data = await response.json();
      console.log('[InvitationModal] Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to send invitation');
      }

      if (data.debugLink) {
        console.log('[InvitationModal] Local test mode detected. Debug link:', data.debugLink);
        toast.success('Invitation Created (Local Test Mode)!', {
          description: 'Email delivery skipped. Link copied to clipboard.',
          duration: 8000,
        });
        
        try {
          navigator.clipboard.writeText(data.debugLink);
        } catch (clipErr) {
          console.warn('[InvitationModal] Clipboard copy failed:', clipErr);
        }
      } else {
        toast.success('Invitation sent successfully!', {
          description: `An email has been sent to ${email}`,
        });
      }

      if (onSuccess) onSuccess();
      handleOpenChange(false);
    } catch (err) {
      console.error('[InvitationModal] Invitation error caught:', err);
      let errorMsg = 'Failed to send invitation. Please try again.';
      
      const errLower = err.message.toLowerCase();
      if (errLower.includes('already exists') || errLower.includes('unique constraint')) {
        errorMsg = 'A user or pending invitation with this email already exists.';
      } else if (errLower.includes('format') || errLower.includes('invalid email')) {
        errorMsg = 'The provided email address format is invalid.';
      } else if (errLower.includes('permission') || errLower.includes('forbidden') || errLower.includes('unauthorized')) {
        errorMsg = 'You do not have permission to send invitations.';
      } else if (errLower.includes('email') && (errLower.includes('failed') || errLower.includes('send'))) {
        errorMsg = 'Failed to deliver the email. Please check the address or try again later.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      console.warn('[InvitationModal] Displaying error message to user:', errorMsg);
      setError(errorMsg);
      toast.error('Invitation Failed', { description: errorMsg });
    } finally {
      setLoading(false);
      console.log('[InvitationModal] Submission process completed.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mail className="w-5 h-5 text-primary" /> Invite New User
          </DialogTitle>
          <DialogDescription>
            Send an email invitation to give a new user access to the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background text-foreground"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role <span className="text-destructive">*</span></Label>
            <Select value={role} onValueChange={setRole} disabled={loading}>
              <SelectTrigger id="role" className="bg-background text-foreground">
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="dispatcher">Dispatcher</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Determines their access level across the platform.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[140px]">
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}