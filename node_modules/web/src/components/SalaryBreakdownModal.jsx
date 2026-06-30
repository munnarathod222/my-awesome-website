import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calculator, IndianRupee, CalendarDays, User, Building, AlertCircle } from 'lucide-react';

export default function SalaryBreakdownModal({ 
  isOpen, 
  onClose, 
  employee, 
  month, 
  year, 
  stats 
}) {
  if (!employee || !stats) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthName = monthNames[month - 1];

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Calculator className="w-5 h-5 text-primary" />
              Salary Breakdown
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Calculation details for {monthName} {year}
            </p>
          </DialogHeader>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{employee.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> 
                <span className="capitalize">{employee.employee_type}</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Calculation Variables</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background border border-border rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Base Salary</p>
                <p className="font-medium flex items-center text-foreground">
                  <IndianRupee className="w-3 h-3 mr-1" />
                  {stats.baseSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-background border border-border rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Total Working Days</p>
                <p className="font-medium flex items-center text-foreground">
                  <CalendarDays className="w-3 h-3 mr-1 text-muted-foreground" />
                  {stats.workingDays}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background border border-border rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Days Present</p>
                <p className="font-medium text-foreground">{stats.presentDays}</p>
              </div>
              <div className="bg-background border border-border rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Daily Rate</p>
                <p className="font-medium flex items-center text-foreground">
                  <IndianRupee className="w-3 h-3 mr-1" />
                  {stats.dailyRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Formula & Final Result</h4>
            
            <div className="bg-muted/30 p-4 rounded-xl border border-border text-sm space-y-2 font-mono">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>(Base Salary ÷ Working Days)</span>
                <span>× Days Present</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span>(₹{stats.baseSalary} ÷ {stats.workingDays})</span>
                <span>× {stats.presentDays}</span>
              </div>
              <div className="flex justify-between items-center font-semibold text-base pt-1 text-foreground">
                <span>Gross Payable</span>
                <span>₹{stats.calculatedSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            
            {stats.workingDays === 0 && (
              <div className="flex items-start gap-2 p-3 bg-warning/10 text-warning rounded-xl text-sm mt-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>No working days found for this month (e.g. all weekends or invalid dates).</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted/30 px-6 py-4 border-t border-border flex justify-end">
          <Button onClick={onClose} className="rounded-xl shadow-sm bg-primary text-primary-foreground">
            Close Summary
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}