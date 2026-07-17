import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { format } from 'date-fns';
import { useCashbookInit } from '@/hooks/useCashbookInit.js';
import { logCashbookError } from '@/lib/cashbookErrorHandler.js';

const AddExpenseModal = ({ isOpen, onClose, onSuccess, editExpense = null }) => {
  const { currentUser } = useAuth();
  const { cashbook, loading: initLoading } = useCashbookInit();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trucks, setTrucks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: 'Maintenance',
    description: '',
    amount: '',
    payment_method: 'Cash',
    truck_id: '',
    employee_id: '',
    status: 'Approved',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchTrucks();
      fetchEmployees();
      if (editExpense) {
        setFormData({
          date: editExpense.date.split('T')[0],
          category: editExpense.category || 'Maintenance',
          description: editExpense.description || '',
          amount: editExpense.amount || '',
          payment_method: editExpense.payment_method || 'Cash',
          truck_id: editExpense.truck_id || '',
          employee_id: editExpense.employee_id || '',
          status: editExpense.status || 'Approved',
          notes: editExpense.notes || ''
        });
      } else {
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          category: 'Maintenance',
          description: '',
          amount: '',
          payment_method: 'Cash',
          truck_id: '',
          employee_id: '',
          status: 'Approved',
          notes: ''
        });
      }
    }
  }, [isOpen, editExpense]);

  const fetchTrucks = async () => {
    try {
      const records = await pb.collection('trucks').getFullList({ $autoCancel: false });
      setTrucks(records);
    } catch (error) {
      console.error('Failed to fetch trucks', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const records = await pb.collection('employees').getFullList({ sort: 'name', $autoCancel: false });
      setEmployees(records);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cashbook && !initLoading) {
      toast.error('Cashbook not initialized. Please refresh and try again.', {
        action: { label: 'Refresh', onClick: () => window.location.reload() }
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        created_by: currentUser.id
      };
      
      // Clean up empty associations
      if (payload.employee_id === 'none') payload.employee_id = '';
      if (payload.truck_id === 'none') payload.truck_id = '';

      if (editExpense) {
        await pb.collection('expenses').update(editExpense.id, payload, { $autoCancel: false });
        
        // Cashbook entry updated automatically via database update hook
        
        toast.success('Expense updated successfully');
      } else {
        const newExpense = await pb.collection('expenses').create(payload, { $autoCancel: false });
        
        // If this is a FASTag Recharge expense, update the fastag balance
        if (payload.category === 'FASTag Recharge' && payload.truck_id) {
          try {
            const trs = await pb.collection('trucks').getFullList({
              filter: `truck_number = "${payload.truck_id}"`,
              $autoCancel: false
            });
            if (trs.length > 0) {
              const trk = trs[0];
              const curBal = trk.current_fastag_balance || 0;
              await pb.collection('trucks').update(trk.id, {
                current_fastag_balance: curBal + payload.amount,
                last_recharge_date: `${payload.date} 12:00:00.000Z`,
                last_recharge_amount: payload.amount
              }, { $autoCancel: false });

              // Also create a fastag_recharges log
              await pb.collection('fastag_recharges').create({
                truck_id: trk.id,
                recharge_date: `${payload.date} 12:00:00.000Z`,
                recharge_amount: payload.amount,
                payment_method: payload.payment_method || 'UPI',
                reference_number: '',
                notes: payload.notes || 'Added from Expense Manager'
              }, { $autoCancel: false });
            }
          } catch (err) {
            console.error('Failed to sync fastag recharge from expense:', err);
          }
        }
        
        toast.success('Expense created successfully');
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      logCashbookError(error, { action: 'Submit Expense', formData });
      toast.error(`Failed to create expense: ${error.message}`, {
        action: { label: 'Retry', onClick: () => handleSubmit(e) }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">{editExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          <DialogDescription>
            {editExpense ? 'Update the details of this expense.' : 'Record a new expense. This will automatically update the Cashbook.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                required
                className="rounded-xl"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                className="rounded-xl"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger id="category" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fuel">Fuel</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Toll">Toll</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                  <SelectItem value="Salary">Salary</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="FASTag Recharge">FASTag Recharge</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                <SelectTrigger id="payment_method" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              required
              className="rounded-xl"
              placeholder="E.g., Engine oil replacement"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="truck">Related Truck (Optional)</Label>
              <Select value={formData.truck_id || 'none'} onValueChange={(v) => setFormData({ ...formData, truck_id: v === 'none' ? '' : v })}>
                <SelectTrigger id="truck" className="rounded-xl">
                  <SelectValue placeholder="Select a truck" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / N/A</SelectItem>
                  {trucks.map(t => (
                    <SelectItem key={t.id} value={t.truck_number}>{t.truck_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee">Employee (Optional)</Label>
              <Select value={formData.employee_id || 'none'} onValueChange={(v) => setFormData({ ...formData, employee_id: v === 'none' ? '' : v })}>
                <SelectTrigger id="employee" className="rounded-xl">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / N/A</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name} - {emp.employee_type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional information..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="resize-none h-20 rounded-xl"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" className="rounded-xl shadow-sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl shadow-sm" disabled={isSubmitting || (!cashbook && !initLoading)}>
              {isSubmitting ? 'Saving...' : editExpense ? 'Update Expense' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;