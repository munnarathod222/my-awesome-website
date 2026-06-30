import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { downloadFile, generateExcel } from '@/lib/downloadUtils.js';

export default function PayslipExportDialog({ isOpen, onClose, payroll, employee, advances }) {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    try {
      // Build Sheet 1: Summary
      const summaryData = [{
        'Employee Name': employee?.name || payroll?.employee_name,
        'Employee ID': employee?.id || payroll?.employee_id,
        'Designation': payroll?.designation,
        'Period': `${payroll?.payroll_month}/${payroll?.payroll_year}`,
        'Base Salary': payroll?.base_salary,
        'Gross Salary': payroll?.gross_salary,
        'Total Deductions': (payroll?.gross_salary || 0) - (payroll?.net_salary || 0),
        'Net Salary': payroll?.net_salary,
        'Status': payroll?.payment_status
      }];

      // Build Sheet 2: Deductions Breakdown
      const deductionData = [];
      if (payroll?.attendance_deduction) deductionData.push({ Type: 'Attendance Deduction', Amount: payroll.attendance_deduction });
      if (payroll?.taxes) deductionData.push({ Type: 'Taxes', Amount: payroll.taxes });
      
      const advanceDeducted = advances.filter(a => a.status === 'Deducted').reduce((sum, a) => sum + a.amount, 0) || payroll?.driver_advances || 0;
      if (advanceDeducted) deductionData.push({ Type: 'Advance Deduction', Amount: advanceDeducted });

      // Generate Blob
      // Because downloadUtils generateExcel only takes one sheet, we'll manually use XLSX here for multi-sheet
      import('xlsx').then((XLSX) => {
        const wb = XLSX.utils.book_new();
        
        const wsSummary = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
        
        const wsDeductions = XLSX.utils.json_to_sheet(deductionData.length ? deductionData : [{ Type: 'None', Amount: 0 }]);
        XLSX.utils.book_append_sheet(wb, wsDeductions, 'Deductions');

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        downloadFile(blob, `Payslip_Export_${employee?.id || 'emp'}.xlsx`);
        toast.success('Excel exported successfully');
        onClose();
      });
    } catch (err) {
      console.error(err);
      toast.error('Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-success" /> Export to Excel
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            Generate a detailed multi-sheet Excel workbook containing:
          </p>
          <ul className="text-sm font-medium text-left bg-muted/30 p-4 rounded-lg border border-border inline-block mx-auto space-y-1">
            <li>✓ Payslip Summary</li>
            <li>✓ Detailed Breakdown (Deductions & Allowances)</li>
            <li>✓ Advance Recovery Schedule</li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleExport} disabled={loading} className="gap-2 bg-success hover:bg-success/90 text-success-foreground">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}