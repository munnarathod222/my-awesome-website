import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';

const RestockManagementModal = ({ isOpen, onClose, onSuccess, item }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity_added: '',
    cost_per_unit: '',
    supplier_name: '',
    date_received: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        quantity_added: '',
        cost_per_unit: item.unit_cost || '',
        supplier_name: item.supplier_name || '',
        date_received: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [isOpen, item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(formData.quantity_added);
    const cost = Number(formData.cost_per_unit);
    
    if (!qty || qty <= 0) {
      toast.error('Quantity must be greater than zero');
      return;
    }
    
    setLoading(true);
    try {
      const totalCost = qty * cost;

      await pb.collection('restock_history').create({
        inventory_item_id: item.id,
        quantity_added: qty,
        cost_per_unit: cost,
        total_cost: totalCost,
        supplier_name: formData.supplier_name,
        date_received: new Date(formData.date_received).toISOString(),
        notes: formData.notes,
        restocked_by: currentUser?.id
      }, { $autoCancel: false });

      await pb.collection('inventory_items').update(item.id, {
        current_stock: item.current_stock + qty,
        unit_cost: cost,
        supplier_name: formData.supplier_name,
        last_restocked_date: new Date(formData.date_received).toISOString()
      }, { $autoCancel: false });

      toast.success('Stock added successfully');
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to restock item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Stock: {item?.item_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Quantity to Add *</Label>
            <Input type="number" step="0.01" value={formData.quantity_added} onChange={e => setFormData(p => ({...p, quantity_added: e.target.value}))} required />
          </div>
          <div className="space-y-2">
            <Label>Cost per Unit *</Label>
            <Input type="number" step="0.01" value={formData.cost_per_unit} onChange={e => setFormData(p => ({...p, cost_per_unit: e.target.value}))} required />
          </div>
          <div className="space-y-2">
            <Label>Supplier Name</Label>
            <Input value={formData.supplier_name} onChange={e => setFormData(p => ({...p, supplier_name: e.target.value}))} required />
          </div>
          <div className="space-y-2">
            <Label>Date Received *</Label>
            <Input type="date" value={formData.date_received} onChange={e => setFormData(p => ({...p, date_received: e.target.value}))} required />
          </div>
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Add Stock'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RestockManagementModal;