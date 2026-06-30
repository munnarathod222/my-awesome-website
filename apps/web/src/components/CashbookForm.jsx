import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const CashbookForm = ({ isOpen, onClose, cashbookToEdit, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    opening_balance: '',
    status: 'active'
  });

  useEffect(() => {
    if (cashbookToEdit) {
      setFormData({
        name: cashbookToEdit.name || '',
        description: cashbookToEdit.description || '',
        opening_balance: cashbookToEdit.opening_balance || 0,
        status: cashbookToEdit.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        opening_balance: '',
        status: 'active'
      });
    }
  }, [cashbookToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Cashbook name is required');
      return;
    }

    if (formData.opening_balance === '' || isNaN(formData.opening_balance)) {
      toast.error('Valid opening balance is required');
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        name: formData.name,
        description: formData.description,
        opening_balance: Number(formData.opening_balance),
        status: formData.status
      };

      if (cashbookToEdit) {
        await pb.collection('cashbooks').update(cashbookToEdit.id, dataToSave, { $autoCancel: false });
        toast.success('Cashbook updated successfully');
      } else {
        await pb.collection('cashbooks').create(dataToSave, { $autoCancel: false });
        toast.success('Cashbook created successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(cashbookToEdit ? 'Failed to update cashbook' : 'Failed to create cashbook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[450px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{cashbookToEdit ? 'Edit Cashbook' : 'Create New Cashbook'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="cb_name">Name *</Label>
            <Input
              id="cb_name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-input text-foreground"
              placeholder="Main Petty Cash, Driver Expenses..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cb_opening">Opening Balance *</Label>
            <Input
              id="cb_opening"
              type="number"
              step="0.01"
              required
              value={formData.opening_balance}
              onChange={(e) => setFormData({ ...formData, opening_balance: e.target.value })}
              className="bg-input text-foreground font-medium"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cb_status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(val) => setFormData({ ...formData, status: val })}
            >
              <SelectTrigger id="cb_status" className="bg-input text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cb_desc">Description (Optional)</Label>
            <Textarea
              id="cb_desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-input text-foreground resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? 'Saving...' : cashbookToEdit ? 'Update Cashbook' : 'Create Cashbook'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CashbookForm;