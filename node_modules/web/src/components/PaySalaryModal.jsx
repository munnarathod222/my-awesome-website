import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';

const PaySalaryModal = ({ isOpen, onClose, employee, advances, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    billing_cycle: 'Monthly'
  });

  const pendingAdvances = advances?.filter(a => a.employee_id === employee?.id && a.status === 'Pending') || [];
  const advancesDeducted = pendingAdvances.reduce((sum, a) => sum + a.amount, 0);
  const baseSalary = employee?.salary_amount || employee?.base_salary || 0;
  const netAmount = Math.max(0, baseSalary - advancesDeducted);

  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        billing_cycle: employee.salary_billing_cycle || 'Monthly'
      });
    }
  }, [employee, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employee) return;

    setLoading(true);
    try {
      // Create salary payment
      await pb.collection('salary_payments').create({
        employee_id: employee.id,
        amount: baseSalary,
        payment_date: `${formData.payment_date} 12:00:00.000Z`,
        billing_cycle: formData.billing_cycle,
        advances_deducted: advancesDeducted,
        net_amount: netAmount,
        status: 'Paid'
      }, { $autoCancel: false });

      // Mark advances as deducted
      for (const adv of pendingAdvances) {
        await pb.collection('advances').update(adv.id, {
          status: 'Deducted'
        }, { $autoCancel: false });
      }
      
      toast.success('Salary payment recorded successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to process salary payment');
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>Process Salary Payment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="bg-muted/40 p-4 rounded-xl space-y-3 border border-border">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Employee</span>
              <span className="font-semibold">{employee.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Base Salary</span>
              <span className="font-medium">₹{baseSalary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Pending Advances ({pendingAdvances.length})</span>
              <span className="font-medium text-destructive">- ₹{advancesDeducted.toLocaleString()}</span>
            </div>
            <div className="pt-3 mt-3 border-t border-border flex justify-between items-center">
              <span className="font-semibold">Net Amount to Pay</span>
              <span className="text-xl font-bold text-primary">₹{netAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input 
                type="date"
                required
                value={formData.payment_date}
                onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                className="bg-background dark:[color-scheme:dark]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Billing Cycle</Label>
              <Select 
                value={formData.billing_cycle} 
                onValueChange={(val) => setFormData({...formData, billing_cycle: val})}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaySalaryModal;