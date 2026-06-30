import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';

const DeleteCashbookModal = ({ isOpen, onClose, cashbook, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!cashbook) return;
    
    setLoading(true);
    try {
      // First, get all transactions for this cashbook to delete them
      const txs = await pb.collection('cashbook_transactions').getFullList({
        filter: `cashbook_id="${cashbook.id}"`,
        $autoCancel: false
      });

      // Delete all related transactions
      for (const tx of txs) {
        await pb.collection('cashbook_transactions').delete(tx.id, { $autoCancel: false });
      }

      // Then delete the cashbook itself
      await pb.collection('cashbooks').delete(cashbook.id, { $autoCancel: false });

      toast.success('Cashbook and all related transactions deleted');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Delete cashbook error:', error);
      toast.error('Failed to delete cashbook');
    } finally {
      setLoading(false);
    }
  };

  if (!cashbook) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Delete Cashbook
          </DialogTitle>
          <DialogDescription className="pt-3">
            Are you sure you want to delete the cashbook <strong>"{cashbook.name}"</strong>?
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg my-4 text-sm border border-destructive/20">
          <p className="font-semibold mb-1">Warning: Irreversible Action</p>
          <p>This will permanently delete the cashbook and <strong>{cashbook.txCount || 0} associated transactions</strong>. This action cannot be undone.</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Yes, Delete Cashbook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCashbookModal;