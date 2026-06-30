import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

export default function AdvanceEditModal({ isOpen, onClose, advance, onSuccess }) {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  
  const [formData, setFormData] = useState({
    employee_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
    status: 'Pending'
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await pb.collection('employees').getFullList({ sort: 'name', $autoCancel: false });
        setEmployees(res);
      } catch (err) {
        console.error(err);
      }
    };
    if (isOpen) fetchEmployees();
  }, [isOpen]);

  useEffect(() => {
    if (advance) {
      setFormData({
        employee_id: advance.employee_id || '',
        amount: advance.amount || '',
        date: advance.date ? advance.date.split('T')[0] : '',
        reason: advance.reason || '',
        status: advance.status || 'Pending'
      });
    } else {
      setFormData({
        employee_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        reason: '',
        status: 'Pending'
      });
    }
  }, [advance, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_id) {
      toast.error('Please select an employee');
      return;
    }
    
    setIsLoading(true);
    
    try {
      let record;
      const payload = {
        ...formData,
        amount: Number(formData.amount)
      };

      if (advance) {
        record = await pb.collection('advances').update(advance.id, payload, { $autoCancel: false });
        
        await apiServerClient.fetch('/cashbook/sync-advance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ advanceId: record.id, userId: currentUser.id })
        });
        
        toast.success('Advance updated and synced to cashbook');
      } else {
        record = await pb.collection('advances').create(payload, { $autoCancel: false });
        
        await apiServerClient.fetch('/cashbook/sync-advance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ advanceId: record.id, userId: currentUser.id })
        });
        
        toast.success('Advance created and synced to cashbook');
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Advance save error:', err);
      toast.error('Failed to save advance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this advance?')) return;
    
    setIsLoading(true);
    try {
      await pb.collection('advances').delete(advance.id, { $autoCancel: false });
      
      await apiServerClient.fetch(`/cashbook/sync-advance/${advance.id}`, {
        method: 'DELETE'
      });
      
      toast.success('Advance deleted and removed from cashbook');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete advance');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[450px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{advance ? 'Edit Driver Advance' : 'New Driver Advance'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select value={formData.employee_id} onValueChange={(v) => setFormData({ ...formData, employee_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input 
                type="number" 
                step="0.01" 
                value={formData.amount} 
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Input 
              value={formData.reason} 
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })} 
              placeholder="e.g. Fuel, Toll, Personal" 
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Deducted">Deducted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
            {advance && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading} className="w-full sm:w-auto sm:mr-auto rounded-xl">
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto rounded-xl">
              {isLoading ? 'Saving...' : 'Save Advance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}