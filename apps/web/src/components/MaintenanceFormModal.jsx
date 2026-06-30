import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function MaintenanceFormModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    maintenance_type: '',
    maintenance_interval_km: '',
    maintenance_interval_months: '',
    next_maintenance_date: '',
    estimated_cost: '',
    priority_level: 'Medium',
    assigned_technician: '',
    notes: '',
    status: 'Scheduled'
  });

  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
      if (initialData) {
        setFormData({
          vehicle_id: initialData.vehicle_id || '',
          maintenance_type: initialData.maintenance_type || '',
          maintenance_interval_km: initialData.maintenance_interval_km || '',
          maintenance_interval_months: initialData.maintenance_interval_months || '',
          next_maintenance_date: initialData.next_maintenance_date ? initialData.next_maintenance_date.split('T')[0] : '',
          estimated_cost: initialData.estimated_cost || '',
          priority_level: initialData.priority_level || 'Medium',
          assigned_technician: initialData.assigned_technician || '',
          notes: initialData.notes || '',
          status: initialData.status || 'Scheduled'
        });
      } else {
        setFormData({
          vehicle_id: '',
          maintenance_type: '',
          maintenance_interval_km: '',
          maintenance_interval_months: '',
          next_maintenance_date: '',
          estimated_cost: '',
          priority_level: 'Medium',
          assigned_technician: '',
          notes: '',
          status: 'Scheduled'
        });
      }
    }
  }, [isOpen, initialData]);

  const fetchVehicles = async () => {
    try {
      const records = await pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false });
      setVehicles(records);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      toast.error('Failed to load vehicles list');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicle_id || !formData.maintenance_type || !formData.next_maintenance_date) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        maintenance_interval_km: formData.maintenance_interval_km ? Number(formData.maintenance_interval_km) : null,
        maintenance_interval_months: formData.maintenance_interval_months ? Number(formData.maintenance_interval_months) : null,
        estimated_cost: formData.estimated_cost ? Number(formData.estimated_cost) : null,
        next_maintenance_date: new Date(formData.next_maintenance_date).toISOString()
      };

      if (initialData) {
        await pb.collection('maintenance_schedules').update(initialData.id, payload, { $autoCancel: false });
        toast.success('Maintenance schedule updated successfully');
      } else {
        await pb.collection('maintenance_schedules').create(payload, { $autoCancel: false });
        toast.success('Maintenance schedule created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving maintenance schedule:', error);
      toast.error(error.message || 'Failed to save maintenance schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            {initialData ? 'Edit Maintenance Schedule' : 'Schedule New Maintenance'}
          </DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details for this maintenance task.' : 'Add a new preventive maintenance task for a vehicle.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_id">Vehicle <span className="text-destructive">*</span></Label>
              <Select value={formData.vehicle_id} onValueChange={(val) => handleSelectChange('vehicle_id', val)}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select Vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.truck_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenance_type">Maintenance Type <span className="text-destructive">*</span></Label>
              <Select value={formData.maintenance_type} onValueChange={(val) => handleSelectChange('maintenance_type', val)}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oil Change">Oil Change</SelectItem>
                  <SelectItem value="Tire Rotation">Tire Rotation</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                  <SelectItem value="Brake Service">Brake Service</SelectItem>
                  <SelectItem value="Filter Replacement">Filter Replacement</SelectItem>
                  <SelectItem value="Fluid Check">Fluid Check</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="next_maintenance_date">Next Date <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                id="next_maintenance_date"
                name="next_maintenance_date"
                value={formData.next_maintenance_date}
                onChange={handleChange}
                className="bg-background text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority_level">Priority</Label>
              <Select value={formData.priority_level} onValueChange={(val) => handleSelectChange('priority_level', val)}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maintenance_interval_km">Interval (KM)</Label>
              <Input
                type="number"
                id="maintenance_interval_km"
                name="maintenance_interval_km"
                value={formData.maintenance_interval_km}
                onChange={handleChange}
                placeholder="e.g. 10000"
                className="bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenance_interval_months">Interval (Months)</Label>
              <Input
                type="number"
                id="maintenance_interval_months"
                name="maintenance_interval_months"
                value={formData.maintenance_interval_months}
                onChange={handleChange}
                placeholder="e.g. 6"
                className="bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_cost">Estimated Cost</Label>
              <Input
                type="number"
                step="0.01"
                id="estimated_cost"
                name="estimated_cost"
                value={formData.estimated_cost}
                onChange={handleChange}
                placeholder="0.00"
                className="bg-background text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_technician">Assigned Technician</Label>
            <Input
              id="assigned_technician"
              name="assigned_technician"
              value={formData.assigned_technician}
              onChange={handleChange}
              placeholder="Name or ID"
              className="bg-background text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional details..."
              className="bg-background text-foreground min-h-[80px]"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {initialData ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}