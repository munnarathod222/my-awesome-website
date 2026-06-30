import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const EditCashbookModal = ({ isOpen, onClose, cashbook, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    opening_balance: '',
    description: '',
    currency: 'INR'
  });

  useEffect(() => {
    if (cashbook && isOpen) {
      setFormData({
        name: cashbook.name || '',
        opening_balance: cashbook.opening_balance !== undefined ? cashbook.opening_balance.toString() : '0',
        description: cashbook.description || '',
        currency: cashbook.currency || 'INR'
      });
    }
  }, [cashbook, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Cashbook name is required');
      return;
    }

    setLoading(true);
    try {
      await pb.collection('cashbooks').update(cashbook.id, {
        name: formData.name,
        opening_balance: formData.opening_balance === '' ? 0 : Number(formData.opening_balance),
        description: formData.description,
        currency: formData.currency
      }, { $autoCancel: false });

      toast.success('Cashbook updated successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Update cashbook error:', error);
      toast.error(error.message || 'Failed to update cashbook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Cashbook</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit_name">Book Name <span className="text-destructive">*</span></Label>
            <Input
              id="edit_name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_opening_balance">Opening Balance</Label>
            <Input
              id="edit_opening_balance"
              type="number"
              step="0.01"
              value={formData.opening_balance}
              onChange={(e) => setFormData({ ...formData, opening_balance: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Changing this will recalculate all running balances for this book.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_currency">Currency</Label>
            <Select 
              value={formData.currency} 
              onValueChange={(val) => setFormData({ ...formData, currency: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_description">Description</Label>
            <Textarea
              id="edit_description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCashbookModal;