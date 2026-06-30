import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, IndianRupee, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import pb from '@/lib/pocketbaseClient.js';
import { Progress } from '@/components/ui/progress';

export default function WaiverLimitConfiguration({ isOpen, onClose, card, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [formData, setFormData] = useState({
    max_waiver_per_transaction: '',
    monthly_waiver_limit: ''
  });

  useEffect(() => {
    if (isOpen && card) {
      setFormData({
        max_waiver_per_transaction: card.max_waiver_per_transaction?.toString() || '5000',
        monthly_waiver_limit: card.monthly_waiver_limit?.toString() || '20000'
      });
      setErrorDetails(null);
    }
  }, [isOpen, card]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorDetails(null);

    try {
      const perTx = Number(formData.max_waiver_per_transaction);
      const monthly = Number(formData.monthly_waiver_limit);
      const currentUsed = Number(card.current_month_waiver_used) || 0;

      // 1. Strict Validation matching schema constraints
      if (isNaN(perTx) || perTx < 4000 || perTx > 5000) {
        throw new Error("Per-transaction limit must be between ₹4,000 and ₹5,000.");
      }
      if (isNaN(monthly) || monthly <= 0) {
        throw new Error("Monthly waiver limit must be greater than ₹0.");
      }
      if (monthly < perTx) {
        throw new Error("Monthly limit cannot be less than the per-transaction limit.");
      }

      // 2. Prepare payload exactly matching PocketBase schema fields
      // PocketBase requires numbers for number fields, not strings
      // Including current_month_waiver_used as it is a required field in the schema
      const payload = {
        max_waiver_per_transaction: perTx,
        monthly_waiver_limit: monthly,
        current_month_waiver_used: currentUsed
      };

      console.log('Sending update to PocketBase for card:', card.id);
      console.log('Payload:', payload);

      // 3. Perform update with correct collection and ID
      await pb.collection('credit_cards').update(card.id, payload, { $autoCancel: false });

      toast.success('Waiver limits updated successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      // 4. Detailed error logging to console
      console.error('PocketBase Update Error:', err);
      if (err.response) {
        console.error('Detailed PocketBase Response:', JSON.stringify(err.response, null, 2));
      }
      
      // Extract specific validation errors if available
      let errorMessage = err.message || 'Failed to update waiver limits. Please try again.';
      
      if (err.response?.data) {
        const validationErrors = Object.entries(err.response.data)
          .map(([field, details]) => {
            const formattedField = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return `${formattedField}: ${details.message}`;
          })
          .join(' | ');
        
        if (validationErrors) {
          errorMessage = `Validation error: ${validationErrors}`;
        } else if (err.response?.message) {
          errorMessage = err.response.message;
        }
      }

      setErrorDetails(errorMessage);
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  if (!card) return null;

  const used = card.current_month_waiver_used || 0;
  const limit = card.monthly_waiver_limit || 20000;
  const percentUsed = Math.min((used / limit) * 100, 100);
  const available = Math.max(limit - used, 0);

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Configure Waiver Limits
          </DialogTitle>
          <DialogDescription>
            Set the maximum fuel surcharge waiver limits for <span className="font-semibold text-foreground">{card.card_name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/40 p-5 rounded-xl border border-border mt-2 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Current Month Used</span>
            <span className="font-bold text-foreground">₹{used.toLocaleString('en-IN')}</span>
          </div>
          <Progress value={percentUsed} className={`h-2.5 ${percentUsed > 80 ? 'bg-destructive/20 [&>div]:bg-destructive' : ''}`} />
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Remaining Available</span>
            <span className={`font-bold ${available > 0 ? 'text-success' : 'text-destructive'}`}>
              ₹{available.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {errorDetails && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-medium ml-2">{errorDetails}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2.5">
            <Label className="text-sm font-semibold">Max Waiver Per Transaction (₹)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="number" 
                required
                min="4000"
                max="5000"
                step="1"
                value={formData.max_waiver_per_transaction}
                onChange={e => setFormData({...formData, max_waiver_per_transaction: e.target.value})}
                className="pl-9 h-11 bg-background text-base"
                disabled={loading}
              />
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Typically between ₹4,000 and ₹5,000 depending on your bank's policy.
            </p>
          </div>

          <div className="space-y-2.5">
            <Label className="text-sm font-semibold">Monthly Waiver Limit (₹)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="number" 
                required
                min="1000"
                step="1"
                value={formData.monthly_waiver_limit}
                onChange={e => setFormData({...formData, monthly_waiver_limit: e.target.value})}
                className="pl-9 h-11 bg-background text-base"
                disabled={loading}
              />
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              The maximum total transaction value eligible for a waiver per billing cycle.
            </p>
          </div>

          <DialogFooter className="pt-5 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="h-10 px-5">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="h-10 px-6">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Limits
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}