import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { format, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';

const AttendanceMultiSelectModal = ({ isOpen, onClose, onSuccess, employees }) => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [status, setStatus] = useState('Present');
  const [notes, setNotes] = useState('');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setDateRange({
        start: format(new Date(), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
      });
      setSelectedEmployees([]);
      setStatus('Present');
      setNotes('');
    }
  }, [isOpen]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedEmployees(employees.map(e => e.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleToggleEmployee = (id) => {
    setSelectedEmployees(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedEmployees.length === 0) {
      return toast.error('Please select at least one employee');
    }

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    if (endDate < startDate) {
      return toast.error('End date cannot be before start date');
    }

    setLoading(true);
    try {
      const datesToProcess = eachDayOfInterval({ start: startOfDay(startDate), end: startOfDay(endDate) });
      let successCount = 0;
      
      const currentUserId = pb.authStore.model?.id;
      
      // Batch promises
      const promises = [];
      
      for (const dateObj of datesToProcess) {
        const dateStr = `${format(dateObj, 'yyyy-MM-dd')} 12:00:00.000Z`;
        
        for (const empId of selectedEmployees) {
          promises.push(
            pb.collection('attendance').create({
              staff_member: empId,
              date: dateStr,
              status,
              notes,
              marked_by: currentUserId,
              user_id: currentUserId,
              hours_worked: status === 'Half Day' ? 4 : (status === 'Present' ? 8 : 0)
            }, { $autoCancel: false })
            .then(() => { successCount++; })
            .catch(err => { console.error('Failed to create record', err); })
          );
        }
      }

      await Promise.all(promises);
      
      if (successCount > 0) {
        toast.success(`Attendance marked for ${selectedEmployees.length} employees across ${datesToProcess.length} dates (${successCount} records created)`);
        onSuccess();
        onClose();
      } else {
        toast.error('Failed to create any attendance records');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred during submission');
    } finally {
      setLoading(false);
    }
  };

  const allSelected = employees.length > 0 && selectedEmployees.length === employees.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/30">
          <DialogTitle>Mark Bulk Attendance</DialogTitle>
          <DialogDescription>
            Select a date range and employees to apply attendance status in bulk.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input 
                    type="date" 
                    required 
                    value={dateRange.start}
                    onChange={(e) => setDateRange(p => ({...p, start: e.target.value}))}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input 
                    type="date" 
                    required 
                    value={dateRange.end}
                    onChange={(e) => setDateRange(p => ({...p, end: e.target.value}))}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={status} onValueChange={setStatus}>
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Select Employees ({selectedEmployees.length} selected) *</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="selectAll" checked={allSelected} onCheckedChange={handleSelectAll} />
                    <label htmlFor="selectAll" className="text-sm font-medium leading-none cursor-pointer">
                      Select All
                    </label>
                  </div>
                </div>
                
                <div className="border border-border rounded-xl bg-background divide-y divide-border max-h-[200px] overflow-y-auto">
                  {employees.map(emp => (
                    <div key={emp.id} className="flex items-center space-x-3 p-3 hover:bg-muted/30 transition-colors">
                      <Checkbox 
                        id={`emp-${emp.id}`} 
                        checked={selectedEmployees.includes(emp.id)}
                        onCheckedChange={() => handleToggleEmployee(emp.id)}
                      />
                      <label htmlFor={`emp-${emp.id}`} className="flex-1 cursor-pointer text-sm">
                        <span className="font-medium text-foreground block">{emp.name}</span>
                        <span className="text-xs text-muted-foreground">{emp.position || emp.employee_type}</span>
                      </label>
                    </div>
                  ))}
                  {employees.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No active employees found.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea 
                  placeholder="Additional context for these records..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-background resize-none h-20"
                />
              </div>

            </div>
          </ScrollArea>

          <DialogFooter className="p-4 border-t border-border bg-muted/10 shrink-0">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading || selectedEmployees.length === 0} className="min-w-[140px]">
              {loading ? 'Processing...' : `Mark Attendance (${selectedEmployees.length})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceMultiSelectModal;