import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Tag, CreditCard, Hash, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function TransactionDetailModal({ isOpen, onClose, transaction }) {
  const navigate = useNavigate();

  if (!transaction) return null;

  const navigateToSource = () => {
    // Basic routing mapping based on category/module
    const cat = (transaction.category || '').toLowerCase();
    
    if (cat.includes('fuel')) {
      navigate('/fuel-tracker');
    } else if (cat.includes('payroll') || cat.includes('salary')) {
      navigate('/payroll');
    } else if (cat.includes('advance')) {
      navigate('/expenses'); // Assuming advances are managed in expenses or employee view
    } else if (cat.includes('expense')) {
      navigate('/expenses');
    } else {
      // Fallback
      navigate('/expenses'); 
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            View auto-synced record properties and source origin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">Synced</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3"/> Date</span>
              <p className="font-medium text-foreground">{format(new Date(transaction.date), 'dd MMM yyyy')}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Tag className="w-3 h-3"/> Category</span>
              <p className="font-medium text-foreground">{transaction.category || 'Uncategorized'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="w-3 h-3"/> Amount</span>
              <p className={`font-bold tabular-nums ${transaction.isDebit ? 'text-destructive' : 'text-success'}`}>
                {transaction.isDebit ? '-' : '+'}₹{transaction.displayAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3"/> Running Balance</span>
              <p className="font-medium tabular-nums text-foreground">
                ₹{transaction.runningBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}
              </p>
            </div>
          </div>

          <div className="space-y-1 bg-muted/50 p-3 rounded-lg border border-border">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3"/> Description</span>
            <p className="text-sm text-foreground">{transaction.description || 'No description provided'}</p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between items-center flex-row">
          <p className="text-xs text-muted-foreground">ID: {transaction.id}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={navigateToSource} className="gap-2">
              Go to Source <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}