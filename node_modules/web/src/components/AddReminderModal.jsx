import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { format } from 'date-fns';

const AddReminderModal = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_type: 'Manual',
    reminder_date: format(new Date(), 'yyyy-MM-dd'),
    priority: 'Medium',
    status: 'Active',
    notes: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return toast.error('Title is required');
    }
    if (!formData.reminder_date) {
      return toast.error('Due date is required');
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        reminder_date: new Date(formData.reminder_date).toISOString(),
        user_id: currentUser.id,
        created_by: currentUser.id
      };
      
      await pb.collection('reminders').create(payload, { $autoCancel: false });
      toast.success('Reminder created successfully');
      setFormData({
        title: '',
        description: '',
        reminder_type: 'Manual',
        reminder_date: format(new Date(), 'yyyy-MM-dd'),
        priority: 'Medium',
        status: 'Active',
        notes: ''
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create reminder:', error);
      toast.error('Failed to create reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Reminder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input 
              id="title" 
              placeholder="e.g. Renew truck insurance"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="bg-background text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reminder_type">Type</Label>
              <Select value={formData.reminder_type} onValueChange={(v) => handleChange('reminder_type', v)}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Truck Doc Expiry">Truck Doc Expiry</SelectItem>
                  <SelectItem value="Credit Card Payment">Credit Card Payment</SelectItem>
                  <SelectItem value="Kilometric Maintenance">Kilometric Maintenance</SelectItem>
                  <SelectItem value="FASTag Low-Balance">FASTag Low-Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder_date">Due Date *</Label>
              <Input 
                id="reminder_date"
                type="date"
                value={formData.reminder_date}
                onChange={(e) => handleChange('reminder_date', e.target.value)}
                className="bg-background text-foreground dark:[color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Snoozed">Snoozed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Brief Description</Label>
            <Input 
              id="description" 
              placeholder="Short description of the task"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="bg-background text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Any specific details, links, or context..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="resize-none bg-background text-foreground"
              rows={3}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Reminder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReminderModal;