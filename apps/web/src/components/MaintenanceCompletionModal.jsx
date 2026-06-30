import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

export default function MaintenanceCompletionModal({ isOpen, onClose, onSuccess, problem }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!problem) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await pb.collection('maintenance_problems').update(problem.id, {
        status: 'Resolved',
        date_solved: today
      }, { $autoCancel: false });
      
      toast.success('Problem marked as solved');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to resolve problem:', error);
      toast.error('Failed to mark problem as solved. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[450px] rounded-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="w-6 h-6 text-success" />
            Mark Problem as Solved?
          </DialogTitle>
          <DialogDescription>
            Confirm that this maintenance issue has been successfully resolved and the vehicle is operational.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/30 p-4 rounded-xl space-y-3 my-2 text-sm border border-border/50">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Truck ID</span>
            <span className="font-bold text-foreground bg-background px-2 py-1 rounded-md border border-border shadow-sm">
              {problem.truck_id}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Date Reported</span>
            <span className="font-medium text-foreground">
              {problem.date_reported ? format(new Date(problem.date_reported), 'MMM dd, yyyy') : '-'}
            </span>
          </div>
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border/50">
            <span className="text-muted-foreground font-medium">Description</span>
            <p className="bg-background p-3 rounded-lg border border-border text-foreground leading-relaxed">
              {problem.description}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-0 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isSubmitting} 
            className="bg-success text-success-foreground hover:bg-success/90 rounded-xl shadow-sm"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Confirm Resolution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}