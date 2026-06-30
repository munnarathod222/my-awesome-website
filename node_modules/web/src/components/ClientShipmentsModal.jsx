import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function ClientShipmentsModal({ isOpen, onClose, clientId, onSuccess, existingShipment = null }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shipment_date: '',
    delivery_date: '',
    shipment_status: 'Pending',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    if (existingShipment) {
      setFormData({
        shipment_date: existingShipment.shipment_date ? existingShipment.shipment_date.substring(0, 10) : '',
        delivery_date: existingShipment.delivery_date ? existingShipment.delivery_date.substring(0, 10) : '',
        shipment_status: existingShipment.shipment_status || 'Pending',
        amount: existingShipment.amount || '',
        notes: existingShipment.notes || ''
      });
    } else {
      setFormData({
        shipment_date: new Date().toISOString().substring(0, 10),
        delivery_date: '',
        shipment_status: 'Pending',
        amount: '',
        notes: ''
      });
    }
  }, [existingShipment, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        client_id: clientId,
        amount: Number(formData.amount) || 0,
        shipment_date: formData.shipment_date ? new Date(formData.shipment_date).toISOString() : null,
        delivery_date: formData.delivery_date ? new Date(formData.delivery_date).toISOString() : null,
      };

      if (existingShipment) {
        await pb.collection('client_shipments').update(existingShipment.id, data, { $autoCancel: false });
        toast.success('Shipment updated successfully');
      } else {
        await pb.collection('client_shipments').create(data, { $autoCancel: false });
        toast.success('Shipment added successfully');
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving shipment:', err);
      toast.error(err.message || 'Failed to save shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{existingShipment ? 'Edit Shipment' : 'Add New Shipment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shipment_date">Shipment Date</Label>
              <Input type="date" id="shipment_date" name="shipment_date" value={formData.shipment_date} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_date">Delivery Date</Label>
              <Input type="date" id="delivery_date" name="delivery_date" value={formData.delivery_date} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shipment_status">Status</Label>
              <Select value={formData.shipment_status} onValueChange={(val) => handleSelectChange('shipment_status', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input type="number" id="amount" name="amount" min="0" step="0.01" value={formData.amount} onChange={handleChange} placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} value={formData.notes} onChange={handleChange} placeholder="Any additional notes..." />
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Shipment'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}