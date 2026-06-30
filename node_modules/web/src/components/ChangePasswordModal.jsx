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
import { Eye, EyeOff, Check, X, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';
import { cn } from '@/lib/utils.js';

export default function ChangePasswordModal({ children }) {
  const { changePassword } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Visibility Toggles
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Requirements checklist
  const reqs = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  };

  const strengthScore = Object.values(reqs).filter(Boolean).length;
  
  let strengthLabel = 'Weak';
  let strengthColor = 'bg-destructive';
  let strengthTextColor = 'text-destructive';

  if (strengthScore >= 4 && strengthScore < 5) {
    strengthLabel = 'Good';
    strengthColor = 'bg-yellow-500';
    strengthTextColor = 'text-yellow-500';
  } else if (strengthScore === 5) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-green-600'; // more standard than bg-success for standard tailwind
    strengthTextColor = 'text-green-600';
  } else if (strengthScore >= 2) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-orange-500';
    strengthTextColor = 'text-orange-500';
  }

  // Validations
  const isOldValid = oldPassword.trim().length > 0;
  const isNewValid = strengthScore === 5;
  const isConfirmValid = newPassword === confirmPassword && confirmPassword.length > 0;
  const isDiffFromOld = newPassword !== oldPassword || newPassword.length === 0;

  const isFormValid = isOldValid && isNewValid && isConfirmValid && isDiffFromOld;

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
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

    setIsLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      toast.success('Password changed successfully');
      handleOpenChange(false);
    } catch (err) {
      // Detailed error logging
      console.error('[ChangePasswordModal] Password change error details:');
      console.error('- Status Code:', err?.status || err?.response?.code);
      console.error('- Error Data:', err?.response?.data || err?.data);
      console.error('- Error Message:', err?.message);

      const status = err?.status || err?.response?.code;
      let errorMessage = 'Failed to change password. Please try again.';

      // Handle specific error codes
      switch (status) {
        case 400:
          errorMessage = 'Validation failed. Please verify the new password meets requirements.';
          break;
        case 401:
          errorMessage = 'Invalid current password or expired session.';
          break;
        case 403:
          errorMessage = 'You do not have permission to change this password.';
          break;
        case 404:
          errorMessage = 'User account not found.';
          break;
        case 500:
          errorMessage = 'Server error occurred. Please try again later.';
          break;
        default:
          errorMessage = err?.message || errorMessage;
      }

      toast.error(errorMessage);
      
      // Clear old password so user can retry, but keep new passwords
      setOldPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || <Button variant="outline"><Lock className="w-4 h-4 mr-2" /> Change Password</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Ensure your account remains secure by using a strong, unique password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Old Password */}
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="pr-10 bg-background text-foreground"
                placeholder="Enter current password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {!isOldValid && oldPassword.length > 0 && (
              <p className="text-xs text-destructive">Current password is required.</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={cn("pr-10 bg-background text-foreground", newPassword && !isDiffFromOld && "border-destructive")}
                placeholder="Enter new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {newPassword && !isDiffFromOld && (
              <p className="text-xs text-destructive">New password must be different from current password.</p>
            )}

            {newPassword && (
              <div className="space-y-2 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-muted-foreground">Password strength:</span>
                  <span className={cn("font-bold", strengthTextColor)}>{strengthLabel}</span>
                </div>
                <div className="flex gap-1 h-1.5 w-full">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div 
                      key={level} 
                      className={cn(
                        "flex-1 rounded-full transition-colors duration-300", 
                        level <= strengthScore ? strengthColor : "bg-muted"
                      )} 
                    />
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                  <div className={cn("flex items-center gap-1.5", reqs.length ? "text-green-600" : "text-muted-foreground")}>
                    {reqs.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 8+ characters
                  </div>
                  <div className={cn("flex items-center gap-1.5", reqs.upper ? "text-green-600" : "text-muted-foreground")}>
                    {reqs.upper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Uppercase letter
                  </div>
                  <div className={cn("flex items-center gap-1.5", reqs.lower ? "text-green-600" : "text-muted-foreground")}>
                    {reqs.lower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Lowercase letter
                  </div>
                  <div className={cn("flex items-center gap-1.5", reqs.number ? "text-green-600" : "text-muted-foreground")}>
                    {reqs.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Number
                  </div>
                  <div className={cn("flex items-center gap-1.5", reqs.special ? "text-green-600" : "text-muted-foreground")}>
                    {reqs.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Special character
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "pr-10 bg-background text-foreground", 
                  confirmPassword && !isConfirmValid && "border-destructive focus-visible:ring-destructive"
                )}
                placeholder="Confirm new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && !isConfirmValid && (
              <p className="text-xs text-destructive">Passwords do not match.</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || isLoading}
              className="min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}