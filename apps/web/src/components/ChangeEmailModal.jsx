import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { validateEmail } from '@/lib/validators.js';

export default function ChangeEmailModal({ children }) {
  const { currentUser, setCurrentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');

  // Validations
  const isNewValid = newEmail.trim().length > 0 && validateEmail(newEmail);
  const isConfirmValid = newEmail === confirmEmail && confirmEmail.length > 0;
  const isDiffFromCurrent = newEmail.toLowerCase() !== currentUser?.email?.toLowerCase();
  
  const isFormValid = isNewValid && isConfirmValid && isDiffFromCurrent;

  const resetForm = () => {
    setNewEmail('');
    setConfirmEmail('');
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(false);
    setIsLoading(true);
    try {
      // 1. Build the custom authorization token matching the backend pocketbaseAuth middleware
      const tokenData = {
        token: pb.authStore.token,
        record: pb.authStore.model
      };
      const base64Token = btoa(JSON.stringify(tokenData));

      // 2. Perform backend API request
      const res = await fetch('/hcgi/api/user/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${base64Token}`
        },
        body: JSON.stringify({ newEmail: newEmail.trim() })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update email');
      }

      // 3. Update local PocketBase authStore session and global currentUser context
      const freshUser = await pb.collection('users').getOne(currentUser.id, { $autoCancel: false });
      pb.authStore.save(pb.authStore.token, freshUser);
      setCurrentUser(freshUser);

      toast.success('Login Email updated successfully');
      handleOpenChange(false);
    } catch (err) {
      console.error('[ChangeEmailModal] Error changing email:', err);
      toast.error(err.message || 'Failed to change email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || <Button variant="outline" className="rounded-xl"><Mail className="w-4 h-4 mr-2" /> Change Email</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border border-border/50 rounded-2xl shadow-elevated">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Mail className="w-5 h-5 text-primary" /> Change Login Email
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Update the email address used to log into your account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Current Email */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-semibold">Current Email Address</Label>
            <Input 
              type="email" 
              value={currentUser?.email || ''} 
              disabled 
              className="bg-muted/40 border-border/50 rounded-xl font-medium text-xs h-10 select-none"
            />
          </div>

          {/* New Email */}
          <div className="space-y-1.5">
            <Label htmlFor="new-email" className="text-xs text-muted-foreground font-semibold">New Email Address</Label>
            <div className="relative">
              <Input
                id="new-email"
                type="email"
                placeholder="enter new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="pr-10 border-border/50 rounded-xl text-xs h-10"
                disabled={isLoading}
                required
              />
              {isNewValid && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

          {/* Confirm Email */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm-email" className="text-xs text-muted-foreground font-semibold">Confirm New Email</Label>
            <div className="relative">
              <Input
                id="confirm-email"
                type="email"
                placeholder="confirm your new email address"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="pr-10 border-border/50 rounded-xl text-xs h-10"
                disabled={isLoading}
                required
              />
              {isConfirmValid && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
            {confirmEmail && !isConfirmValid && (
              <p className="text-[10px] text-destructive font-medium mt-1">Email addresses do not match</p>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-border/30 mt-6 flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="rounded-xl text-xs px-4"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || isLoading}
              className="rounded-xl text-xs px-4 shadow-md font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
