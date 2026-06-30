import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';

const StockDeductionModal = ({ isOpen, onClose, onSuccess, item }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [trucks, setTrucks] = useState([]);
  const [formData, setFormData] = useState({
    truck_id: '',
    quantity_deducted: '',
    reason: 'maintenance',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({ truck_id: '', quantity_deducted: '', reason: 'maintenance', notes: '' });
      fetchTrucks();
    }
  }, [isOpen]);

  const fetchTrucks = async () => {
    try {
      const records = await pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false });
      setTrucks(records);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(formData.quantity_deducted);
    if (!qty || qty <= 0) {
      toast.error('Quantity must be greater than zero');
      return;
    }
    if (qty > item.current_stock) {
      toast.error(`Cannot deduct more than current stock (${item.current_stock})`);
      return;
    }
    if (!formData.truck_id) {
      toast.error('Please select a truck');
      return;
    }

    setLoading(true);
    try {
      // 1. Create deduction record
      await pb.collection('stock_deductions').create({
        inventory_item_id: item.id,
        truck_id: formData.truck_id,
        quantity_deducted: qty,
        reason: formData.reason,
        notes: formData.notes,
        deducted_by: currentUser?.id
      }, { $autoCancel: false });

      // 2. Update inventory stock
      await pb.collection('inventory_items').update(item.id, {
        current_stock: item.current_stock - qty
      }, { $autoCancel: false });

      toast.success('Stock deducted successfully');
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to deduct stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deduct Stock: {item?.item_name}</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-sm text-muted-foreground border-b mb-2">
          Current Stock: <span className="font-bold text-foreground">{item?.current_stock} {item?.unit}</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Truck *</Label>
            <Select value={formData.truck_id} onValueChange={(val) => setFormData(p => ({ ...p, truck_id: val }))}>
              <SelectTrigger><SelectValue placeholder="Select a truck" /></SelectTrigger>
              <SelectContent>
                {trucks.map(t => (
                  <SelectItem key={t.id} value={t.truck_number}>{t.truck_number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quantity to Deduct *</Label>
            <Input type="number" step="0.01" value={formData.quantity_deducted} onChange={e => setFormData(p => ({...p, quantity_deducted: e.target.value}))} required />
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={formData.reason} onValueChange={(val) => setFormData(p => ({ ...p, reason: val }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="replacement">Replacement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Input value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Deduct Stock'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockDeductionModal;