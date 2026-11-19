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
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Flame, CheckCircle2, Scale, User, Camera, Trash2, FileText, UploadCloud } from 'lucide-react';

import { recordTollDeduction } from '@/lib/fastagDeductionUtils.js';

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
          date: editExpense?.date ? editExpense.date.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
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

  // 🚨 Fuel Sensor Scam / Disparity Reporting State (for Category === 'Fuel')
  const [reportScam, setReportScam] = useState(false);
  const [scamData, setScamData] = useState({
    billed_liters: '',
    sensor_liters: '',
    theft_type: 'Pump Collusion / Short Fill (Billed > Sensor)',
    deduct_from_advance: true,
    proofFiles: [],
    notes: ''
  });
  const [isDraggingSensorProof, setIsDraggingSensorProof] = useState(false);
  const sensorProofInputRef = React.useRef(null);

  const handleSensorProofSelect = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const items = files.map((file, idx) => ({
        key: `sensor-${Date.now()}-${idx}`,
        file,
        name: file.name,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));
      setScamData(prev => ({ ...prev, proofFiles: [...prev.proofFiles, ...items] }));
    }
  };

  const expBilledLiters = parseFloat(scamData.billed_liters) || 0;
  const expSensorLiters = parseFloat(scamData.sensor_liters) || 0;
  const expAmount = parseFloat(formData.amount) || 0;
  const expStolenLiters = (expBilledLiters > 0 && scamData.sensor_liters !== '' && expSensorLiters < expBilledLiters)
    ? Math.round((expBilledLiters - expSensorLiters) * 100) / 100
    : 0;
  const expFuelRate = expBilledLiters > 0
    ? Math.round((expAmount / expBilledLiters) * 100) / 100
    : 94.50;
  const expBleedingLoss = Math.round(expStolenLiters * expFuelRate);

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
        
        // If this is a Toll or FASTag expense, update the truck FASTag balance (+ amount) and log recharge
        const isTollExpense = 
          payload.category === 'Toll' ||
          payload.category === 'Toll Tax' ||
          payload.category === 'FASTag Recharge' ||
          payload.subcategory === 'Toll' ||
          payload.subcategory === 'FASTag' ||
          payload.subcategory === 'Toll / FASTag' ||
          payload.payment_method === 'FASTag' ||
          /toll|fastag/i.test(payload.category || '') ||
          /toll|fastag/i.test(payload.subcategory || '') ||
          /toll|fastag/i.test(payload.description || '');

        if (isTollExpense && payload.truck_id) {
          try {
            const trk = trucks.find(t => t.truck_number === payload.truck_id || t.id === payload.truck_id);
            if (trk) {
              const curBal = Number(trk.current_fastag_balance) || 0;
              const newBal = curBal + Number(payload.amount);
              await pb.collection('trucks').update(trk.id, {
                current_fastag_balance: newBal,
                last_recharge_date: `${payload.date} 12:00:00.000Z`,
                last_recharge_amount: Number(payload.amount)
              }, { $autoCancel: false });

              // Also create a fastag_recharges log
              await pb.collection('fastag_recharges').create({
                truck_id: trk.id,
                recharge_date: `${payload.date} 12:00:00.000Z`,
                recharge_amount: Number(payload.amount),
                payment_method: payload.payment_method || 'Cash',
                reference_number: '',
                notes: payload.notes || payload.description || 'Added from Expense Manager'
              }, { $autoCancel: false });

              toast.success(`₹${payload.amount.toLocaleString('en-IN')} added to ${trk.truck_number}'s FASTag balance!`);
            }
          } catch (err) {
            console.error('Failed to sync fastag recharge from expense:', err);
          }
        }
        
        // 🚨 Record Fuel Sensor Theft & Disparity Report if Category is Fuel
        if (formData.category === 'Fuel' && reportScam && expStolenLiters > 0) {
          try {
            const selectedEmp = employees.find(e => e.id === payload.employee_id);
            const driverName = selectedEmp?.name || 'Driver';
            const scamFd = new FormData();
            scamFd.append('incident_date', `${payload.date} 12:00:00.000Z`);
            if (newExpense?.id) scamFd.append('expense_id', newExpense.id);
            scamFd.append('driver_id', payload.employee_id || '');
            scamFd.append('driver_name', driverName);
            scamFd.append('truck_number', payload.truck_id || '');
            scamFd.append('billed_liters', String(expBilledLiters));
            scamFd.append('sensor_liters', String(expSensorLiters));
            scamFd.append('stolen_liters', String(expStolenLiters));
            scamFd.append('fuel_rate', String(expFuelRate));
            scamFd.append('bleeding_amount', String(expBleedingLoss));
            scamFd.append('theft_type', scamData.theft_type);
            scamFd.append('status', scamData.deduct_from_advance ? 'Deducted from Salary / Advance' : 'Reported');
            scamFd.append('notes', scamData.notes || payload.notes || '');
            scamFd.append('reported_by', currentUser?.name || currentUser?.email || 'Admin');

            (scamData.proofFiles || []).forEach(pf => {
              if (pf.file instanceof File || pf.file instanceof Blob) {
                scamFd.append('sensor_proof_file', pf.file, pf.name || 'sensor_proof.jpg');
              }
            });

            if (scamData.deduct_from_advance && expBleedingLoss > 0) {
              try {
                const adv = await pb.collection('expenses_driver_advance').create({
                  driver_name: driverName,
                  amount: expBleedingLoss,
                  date: `${payload.date} 12:00:00.000Z`,
                  location: payload.truck_id || 'Depot',
                  payment_mode: 'Fuel Theft Recovery',
                  notes: `Auto-recovery: Fuel sensor shortfall of ${expStolenLiters}L on ${payload.truck_id || 'truck'}`,
                }, { $autoCancel: false });
                if (adv?.id) scamFd.append('advance_deduction_id', adv.id);
                toast.success(`₹${expBleedingLoss.toLocaleString('en-IN')} auto-deducted from ${driverName}'s advance!`);
              } catch (aErr) {
                console.warn('Advance deduction note:', aErr);
              }
            }

            await pb.collection('fuel_theft_reports').create(scamFd, { $autoCancel: false });
            toast.error(`🚨 Sensor Disparity & Theft Audit Logged: ${expStolenLiters}L short (₹${expBleedingLoss.toLocaleString('en-IN')} Bleed)`);
          } catch (sErr) {
            console.error('Failed to log fuel theft report from expense:', sErr);
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
                  <SelectItem value="Toll">FASTag - Toll</SelectItem>
                  <SelectItem value="Driver Advance">Driver Advance</SelectItem>
                  <SelectItem value="Salary">Salary</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                  <SelectItem value="EMI">EMI</SelectItem>
                  <SelectItem value="Other">All Other Expenses</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
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

          {formData.category === 'Fuel' && (
            <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
              reportScam 
                ? 'bg-rose-950/20 border-rose-500/50 shadow-lg' 
                : 'bg-muted/30 border-border/80'
            }`}>
              {/* Header Toggle */}
              <div 
                className="p-3 flex items-center justify-between cursor-pointer select-none"
                onClick={() => setReportScam(!reportScam)}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${reportScam ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-heading flex items-center gap-1.5">
                      🚨 Report Fuel Sensor Disparity / Theft
                      {reportScam && expStolenLiters > 0 && (
                        <Badge className="bg-rose-500 text-white text-[10px] font-mono font-bold">
                          {expStolenLiters}L Short
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      IoT sensor recorded less liters in tank than billed
                    </p>
                  </div>
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <Switch 
                    checked={reportScam} 
                    onCheckedChange={setReportScam} 
                    className="data-[state=checked]:bg-rose-600"
                  />
                </div>
              </div>

              {reportScam && (
                <div className="p-3.5 pt-0 space-y-3 border-t border-rose-500/20 animate-in fade-in-50">
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-rose-200">Billed Liters (Slip)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 100"
                        value={scamData.billed_liters}
                        onChange={e => setScamData(prev => ({ ...prev, billed_liters: e.target.value }))}
                        className="h-8 text-xs font-mono rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-rose-200">Sensor Liters (Tank)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 80"
                        value={scamData.sensor_liters}
                        onChange={e => setScamData(prev => ({ ...prev, sensor_liters: e.target.value }))}
                        className="h-8 text-xs font-mono font-bold text-rose-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {expStolenLiters > 0 && (
                    <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-white flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-rose-300 uppercase flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-rose-400" /> Driver Financial Loss
                        </span>
                        <div className="text-lg font-black font-mono text-rose-200">
                          ₹{expBleedingLoss.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <Badge className="bg-rose-500 font-mono text-xs">
                        {expStolenLiters} L Short ({expBilledLiters > 0 ? Math.round((expStolenLiters / expBilledLiters) * 100) : 0}%)
                      </Badge>
                    </div>
                  )}

                  <div className="p-2 rounded-lg bg-background/60 border border-rose-500/20 flex items-start gap-2">
                    <Checkbox
                      id="exp-deduct-adv"
                      checked={scamData.deduct_from_advance}
                      onCheckedChange={c => setScamData(prev => ({ ...prev, deduct_from_advance: !!c }))}
                      className="mt-0.5 data-[state=checked]:bg-rose-600"
                    />
                    <Label htmlFor="exp-deduct-adv" className="text-xs text-foreground cursor-pointer">
                      ⚡ Deduct ₹{expBleedingLoss > 0 ? expBleedingLoss.toLocaleString('en-IN') : 'Loss'} from Driver Advance immediately
                    </Label>
                  </div>
                </div>
              )}
            </div>
          )}

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