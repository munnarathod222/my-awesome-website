import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const EditEmployeeModal = ({ isOpen, onClose, employee, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    position: '',
    base_salary: '',
    salary_billing_cycle: ''
  });

  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        position: employee.position || '',
        base_salary: employee.base_salary?.toString() || '',
        salary_billing_cycle: employee.salary_billing_cycle || 'Monthly'
      });
    }
  }, [employee, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employee) return;

    setLoading(true);
    try {
      await pb.collection('employees').update(employee.id, {
        position: formData.position,
        base_salary: Number(formData.base_salary),
        salary_billing_cycle: formData.salary_billing_cycle
      }, { $autoCancel: false });
      
      toast.success('Employee updated successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>Edit Employee Payroll Info</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Name</Label>
              <Input value={employee.name} readOnly className="bg-muted text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={employee.contact || '-'} readOnly className="bg-muted text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <Label>Position</Label>
              <Input 
                value={formData.position} 
                onChange={(e) => setFormData({...formData, position: e.target.value})} 
                className="bg-background"
                placeholder="e.g. Senior Driver"
              />
            </div>

            <div className="space-y-2">
              <Label>Base Salary (₹)</Label>
              <Input 
                type="number"
                min="0"
                required
                value={formData.base_salary} 
                onChange={(e) => setFormData({...formData, base_salary: e.target.value})} 
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label>Billing Cycle</Label>
              <Select 
                value={formData.salary_billing_cycle} 
                onValueChange={(val) => setFormData({...formData, salary_billing_cycle: val})}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeModal;