import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import TruckSelector from './TruckSelector.jsx';

export default function AddMaintenanceReminderModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    truck_id: '',
    maintenance_type: '',
    reminder_date: '',
    status: 'Pending'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleTruckSelect = (truckId) => {
    setFormData((prev) => ({ ...prev, truck_id: truckId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.truck_id) {
      toast.error('Truck ID is required');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Maintenance Reminder</DialogTitle>
          <DialogDescription>Schedule a future maintenance alert.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          
          <TruckSelector 
            selectedTruckId={formData.truck_id} 
            onTruckSelect={handleTruckSelect} 
          />

          <div className="space-y-2">
            <Label htmlFor="maintenance_type">Maintenance Type</Label>
            <Input id="maintenance_type" name="maintenance_type" value={formData.maintenance_type} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reminder_date">Reminder Date</Label>
              <Input type="date" id="reminder_date" name="reminder_date" value={formData.reminder_date} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={handleStatusChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Close</Button>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}