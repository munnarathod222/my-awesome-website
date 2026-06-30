import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const FASTagModal = ({ isOpen, onClose, truck, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fastag_id: '',
    fastag_provider: '',
    current_fastag_balance: '',
    last_recharge_date: '',
    last_recharge_amount: '',
    fastag_status: 'Active',
    vehicle_class: '',
    fastag_notes: ''
  });

  useEffect(() => {
    if (isOpen && truck) {
      setFormData({
        fastag_id: truck.fastag_id || '',
        fastag_provider: truck.fastag_provider || '',
        current_fastag_balance: truck.current_fastag_balance?.toString() || '0',
        last_recharge_date: truck.last_recharge_date ? truck.last_recharge_date.split(' ')[0] : '',
        last_recharge_amount: truck.last_recharge_amount?.toString() || '',
        fastag_status: truck.fastag_status || 'Active',
        vehicle_class: truck.vehicle_class || '',
        fastag_notes: truck.fastag_notes || ''
      });
    }
  }, [isOpen, truck]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fastag_id || !formData.fastag_provider || !formData.fastag_status || !formData.vehicle_class) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        current_fastag_balance: parseFloat(formData.current_fastag_balance) || 0,
        last_recharge_amount: formData.last_recharge_amount ? parseFloat(formData.last_recharge_amount) : null,
        last_recharge_date: formData.last_recharge_date ? `${formData.last_recharge_date} 12:00:00.000Z` : null,
      };

      await pb.collection('trucks').update(truck.id, dataToSave, { $autoCancel: false });
      toast.success('FASTag details updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update FASTag details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>Edit FASTag Details - {truck?.truck_number}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>FASTag ID/Number *</Label>
              <Input 
                required
                value={formData.fastag_id}
                onChange={(e) => setFormData({...formData, fastag_id: e.target.value})}
                className="bg-input text-foreground border-border"
                placeholder="Enter FASTag ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Provider *</Label>
              <Select value={formData.fastag_provider} onValueChange={(val) => setFormData({...formData, fastag_provider: val})}>
                <SelectTrigger className="bg-input text-foreground border-border">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ICICI">ICICI Bank</SelectItem>
                  <SelectItem value="HDFC">HDFC Bank</SelectItem>
                  <SelectItem value="Axis">Axis Bank</SelectItem>
                  <SelectItem value="Yes Bank">Yes Bank</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Balance (₹) *</Label>
              <Input 
                type="number"
                required
                step="0.01"
                value={formData.current_fastag_balance}
                onChange={(e) => setFormData({...formData, current_fastag_balance: e.target.value})}
                className="bg-input text-foreground border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select value={formData.fastag_status} onValueChange={(val) => setFormData({...formData, fastag_status: val})}>
                <SelectTrigger className="bg-input text-foreground border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vehicle Class *</Label>
              <Select value={formData.vehicle_class} onValueChange={(val) => setFormData({...formData, vehicle_class: val})}>
                <SelectTrigger className="bg-input text-foreground border-border">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">Class 2</SelectItem>
                  <SelectItem value="3">Class 3</SelectItem>
                  <SelectItem value="4">Class 4</SelectItem>
                  <SelectItem value="5">Class 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Last Recharge Date</Label>
              <Input 
                type="date"
                value={formData.last_recharge_date}
                onChange={(e) => setFormData({...formData, last_recharge_date: e.target.value})}
                className="bg-input text-foreground border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes / Remarks</Label>
            <Textarea 
              value={formData.fastag_notes}
              onChange={(e) => setFormData({...formData, fastag_notes: e.target.value})}
              className="bg-input text-foreground border-border min-h-[80px]"
              placeholder="Any additional notes..."
            />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? 'Saving...' : 'Save Details'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FASTagModal;