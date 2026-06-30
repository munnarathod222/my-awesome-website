import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calculator, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SalaryCalculationService from '@/lib/SalaryCalculationService.js';
import PayrollSlipPreview from '@/components/PayrollSlipPreview.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function PayrollGenerationModal({ isOpen, onClose, employees, onSuccess }) {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  
  const [payrollData, setPayrollData] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setPayrollData(null);
      setEmployeeData(null);
      setSelectedEmployeeId('');
    }
  }, [isOpen]);

  const handleCalculate = async () => {
    if (!selectedEmployeeId) {
      toast.error("Please select an employee");
      return;
    }

    setLoading(true);
    try {
      const emp = employees.find(e => e.id === selectedEmployeeId);
      
      // Fetch pending advances for this employee to show in breakdown
      const pendingAdvances = await pb.collection('advances').getFullList({
        filter: `employee_id = "${selectedEmployeeId}" && status = "Pending"`,
        $autoCancel: false
      });
      
      setEmployeeData({ ...emp, pendingAdvances });
      
      const calcResult = await SalaryCalculationService.calculateSalaryWithDeductions(selectedEmployeeId, month, year);
      setPayrollData({ ...calcResult, month, year });
      setStep(2);
    } catch (error) {
      toast.error(error.message || "Failed to calculate payroll");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndSave = async () => {
    setLoading(true);
    try {
      const metrics = payrollData.breakdown.attendanceMetrics;
      const deductions = payrollData.breakdown.deductions;
      
      // Format advance deductions for the JSON field
      const advanceDeductionsDetails = employeeData.pendingAdvances.map(adv => ({
        advance_id: adv.id,
        amount: adv.remaining_balance ?? adv.amount,
        status: 'Deducted',
        deducted_date: new Date().toISOString()
      }));
      
      // Save to payroll collection
      const payrollRecord = await pb.collection('payroll').create({
        payroll_month: month,
        payroll_year: year,
        employee_id: selectedEmployeeId,
        employee_id_relation: selectedEmployeeId,
        employee_name: employeeData.name,
        designation: employeeData.position || employeeData.employee_type,
        base_salary: payrollData.baseSalary,
        gross_salary: payrollData.grossSalary,
        net_salary: payrollData.netSalary,
        taxes: payrollData.taxes,
        attendance_deduction: deductions.attendance,
        driver_advances: deductions.advances,
        advance_deductions_details: advanceDeductionsDetails,
        payment_status: 'pending',
        status: 'Approved',
        daily_rate: payrollData.baseSalary / 30,
        attendance_days: metrics.totalDays,
        present_days: metrics.presentDays,
        absent_days: metrics.absentDays,
        leave_days: metrics.leaveDays,
        total_salary: payrollData.netSalary
      }, { $autoCancel: false });

      // Update the advances to reflect the deduction
      for (const adv of employeeData.pendingAdvances) {
        await pb.collection('advances').update(adv.id, {
          remaining_balance: 0,
          status: 'Settled',
          settled_date: new Date().toISOString()
        }, { $autoCancel: false });
      }

      setStep(3);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to save payroll record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl p-0 bg-card border-border/50">
        
        {step === 1 && (
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Calculator className="w-6 h-6 text-primary" />
                Generate Payroll
              </DialogTitle>
              <DialogDescription>
                Select an employee and period to automatically calculate their salary with attendance and advance deductions.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              <div className="space-y-2 md:col-span-3">
                <Label>Employee</Label>
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger className="w-full bg-background rounded-xl">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.employee_type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                  <SelectTrigger className="w-full bg-background rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                  <SelectTrigger className="w-full bg-background rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[year - 1, year, year + 1].map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-8">
              <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
              <Button onClick={handleCalculate} disabled={loading || !selectedEmployeeId} className="rounded-xl gap-2 shadow-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                {loading ? 'Calculating...' : 'Calculate & Preview'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col h-full overflow-hidden">
            <DialogHeader className="p-6 border-b border-border bg-muted/10 shrink-0">
              <DialogTitle className="text-xl font-bold">Payroll Preview</DialogTitle>
              <DialogDescription>Review the calculated salary slip before saving.</DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
              <PayrollSlipPreview payrollData={payrollData} employeeData={employeeData} />
            </div>

            <DialogFooter className="p-6 border-t border-border shrink-0 bg-background">
              <Button variant="outline" onClick={() => setStep(1)} disabled={loading} className="rounded-xl">
                Back
              </Button>
              <Button onClick={handleConfirmAndSave} disabled={loading} className="rounded-xl shadow-sm">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {loading ? 'Saving...' : 'Confirm & Generate'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 3 && (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-20 h-20 text-success mx-auto mb-6" />
            <DialogTitle className="text-2xl font-bold mb-2">Payroll Generated!</DialogTitle>
            <DialogDescription className="text-base mb-8">
              The payroll record for {employeeData?.name} has been saved successfully.
            </DialogDescription>
            <Button onClick={onClose} className="rounded-xl px-8 shadow-sm">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}