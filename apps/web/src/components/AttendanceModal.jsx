import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';

const AttendanceModal = ({ isOpen, onClose, onSuccess, employees, editRecord = null }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    staff_member: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Present',
    check_in_time: '',
    check_out_time: '',
    notes: ''
  });

  useEffect(() => {
    if (editRecord) {
      setFormData({
        staff_member: editRecord.staff_member,
        date: editRecord.date.split(' ')[0],
        status: editRecord.status,
        check_in_time: editRecord.check_in_time || '',
        check_out_time: editRecord.check_out_time || '',
        notes: editRecord.notes || ''
      });
    } else {
      setFormData({
        staff_member: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'Present',
        check_in_time: '',
        check_out_time: '',
        notes: ''
      });
    }
  }, [editRecord, isOpen]);

  const calculateHours = (inTime, outTime) => {
    if (!inTime || !outTime) return 0;
    try {
      const start = new Date(`1970-01-01T${inTime}`);
      const end = new Date(`1970-01-01T${outTime}`);
      let diff = (end - start) / (1000 * 60 * 60);
      if (diff < 0) diff += 24; // Handle overnight shifts
      return parseFloat(diff.toFixed(2));
    } catch (e) {
      return 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staff_member) return toast.error('Please select a staff member');
    
    setLoading(true);
    try {
      const hours_worked = calculateHours(formData.check_in_time, formData.check_out_time);
      
      const payload = {
        ...formData,
        hours_worked,
        marked_by: pb.authStore.model?.id
      };

      if (editRecord) {
        await pb.collection('attendance').update(editRecord.id, payload, { $autoCancel: false });
        toast.success('Attendance updated successfully');
      } else {
        await pb.collection('attendance').create(payload, { $autoCancel: false });
        toast.success('Attendance marked successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>{editRecord ? 'Edit Attendance' : 'Mark Attendance'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Staff Member *</Label>
              <Select 
                value={formData.staff_member} 
                onValueChange={(v) => setFormData({...formData, staff_member: v})}
                disabled={!!editRecord}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.employee_type})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input 
                type="date" 
                required 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                  <SelectItem value="Work From Home">Work From Home</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Check-in Time</Label>
              <Input 
                type="time" 
                value={formData.check_in_time}
                onChange={(e) => setFormData({...formData, check_in_time: e.target.value})}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label>Check-out Time</Label>
              <Input 
                type="time" 
                value={formData.check_out_time}
                onChange={(e) => setFormData({...formData, check_out_time: e.target.value})}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea 
              placeholder="Optional remarks..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="bg-background resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
              {loading ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceModal;