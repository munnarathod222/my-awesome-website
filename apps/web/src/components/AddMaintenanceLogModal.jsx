import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import TruckSelector from './TruckSelector.jsx';

export default function AddMaintenanceLogModal({ isOpen, onClose, onSubmit, log }) {
  const [formData, setFormData] = useState({
    truck_id: '',
    category: '',
    date: '',
    mileage: '',
    technician_name: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        truck_id: log?.truck_id || '',
        category: log?.category || '',
        date: log?.date ? log.date.split('T')[0] : '',
        mileage: log?.mileage || '',
        technician_name: log?.technician_name || '',
        notes: log?.notes || ''
      });
    }
  }, [isOpen, log]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, category: value }));
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
    onSubmit({
      ...formData,
      mileage: Number(formData.mileage)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{log ? 'Edit Maintenance Log' : 'Add Maintenance Log'}</DialogTitle>
          <DialogDescription>
            {log ? 'Modify the details of this maintenance record.' : 'Record a completed service for a vehicle.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          
          <TruckSelector 
            selectedTruckId={formData.truck_id} 
            onTruckSelect={handleTruckSelect} 
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={handleSelectChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'Greasing', 'Air Filter Clean', 'Oil Change', 'Brake Service', 
                    'Tire Rotation', 'Engine Inspection', 'Transmission Service', 
                    'Coolant Flush', 'Spark Plug Replacement', 'Battery Check', 
                    'Suspension Inspection', 'Alignment', 'Other'
                  ].map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage</Label>
              <Input type="number" id="mileage" name="mileage" value={formData.mileage} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="technician_name">Technician Name</Label>
              <Input id="technician_name" name="technician_name" value={formData.technician_name} onChange={handleChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Close</Button>
            <Button type="submit">{log ? 'Save Changes' : 'Submit'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}