import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Printer, Mail, Loader2, Building2, IndianRupee } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { generateAdvancePayslipPDF } from '@/lib/AdvancePayslipGenerator.js';
import { downloadFile } from '@/lib/downloadUtils.js';

export default function PayslipPreviewModal({ isOpen, onClose, payrollId }) {
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [advances, setAdvances] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isOpen && payrollId) {
      fetchPayrollData();
    }
  }, [isOpen, payrollId]);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const data = await pb.collection('payroll').getOne(payrollId, {
        expand: 'employee_id_relation',
        $autoCancel: false
      });
      
      const start = new Date(data.payroll_year, data.payroll_month - 1, 1).toISOString().split('T')[0];
      const end = new Date(data.payroll_year, data.payroll_month, 0).toISOString().split('T')[0];
      
      const advs = await pb.collection('advances').getFullList({
        filter: `employee_id = '${data.employee_id}' && date >= '${start}' && date <= '${end} 23:59:59'`,
        $autoCancel: false
      });

      setRecord(data);
      setAdvances(advs);
    } catch (error) {
      console.error('Failed to fetch payslip details:', error);
      toast.error('Could not load payslip details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!record) return;
    setExporting(true);
    try {
      if (advances.length > 0) {
        // Use the specialized Advance generator
        const blob = await generateAdvancePayslipPDF(record, record.expand?.employee_id_relation, advances);
        const empId = record.employee_id || 'Unknown';
        const mStr = record.payroll_month.toString().padStart(2, '0');
        const yStr = record.payroll_year;
        downloadFile(blob, `Advance_Payslip_${empId}_${mStr}${yStr}.pdf`);
        toast.success('Advance Payslip downloaded successfully');
        setExporting(false);
        return;
      }

      // Fallback for standard payslip without advances
      const doc = new jsPDF();
      const monthName = format(new Date(record.payroll_year, record.payroll_month - 1), 'MMMM yyyy');
      
      doc.setFontSize(20);
      doc.setTextColor(33, 37, 41);
      doc.text('JAI BHAVANI CARGO', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(108, 117, 125);
      doc.text('Payslip for the month of ' + monthName, 105, 28, { align: 'center' });
      doc.line(14, 35, 196, 35);

      doc.setFontSize(10);
      doc.setTextColor(33, 37, 41);
      doc.text('Employee Name:', 14, 45);
      doc.text(record.employee_name || 'N/A', 50, 45);
      doc.text('Designation:', 110, 45);
      doc.text(record.designation || 'N/A', 140, 45);
      
      doc.text('Employee ID:', 14, 52);
      doc.text(record.expand?.employee_id_relation?.id?.substring(0,8) || 'N/A', 50, 52);
      doc.text('Status:', 110, 52);
      doc.text(record.status || 'N/A', 140, 52);

      doc.autoTable({
        startY: 60,
        head: [['Attendance & Rate', 'Value']],
        body: [
          ['Days Worked', `${record.attendance_days || 0} days`],
          ['Daily Rate', `Rs. ${(record.daily_rate || 0).toFixed(2)}`],
          ['Basic Salary (Calculated)', `Rs. ${(record.total_salary || 0).toFixed(2)}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [248, 249, 250], textColor: [33, 37, 41], fontStyle: 'bold' },
        margin: { right: 110 }
      });

      const allowances = record.allowances_breakdown || {};
      const deductions = record.deductions_breakdown || {};

      const earningsBody = [
        ['Basic Salary', (record.total_salary || 0).toFixed(2)],
        ['House Rent Allowance (HRA)', (allowances.hra || 0).toFixed(2)],
        ['Transport Allowance (TA)', (allowances.ta || 0).toFixed(2)],
        ['Bonus', (allowances.bonus || 0).toFixed(2)],
        ['Incentives', (allowances.incentive || 0).toFixed(2)],
        ['Other Allowances', (allowances.other_allowances || 0).toFixed(2)]
      ].filter(item => Number(item[1]) > 0 || item[0] === 'Basic Salary');

      const deductionsBody = [
        ['Absent Deduction', (deductions.absent_deduction || 0).toFixed(2)],
        ['Late Arrival', (deductions.late_arrival_deduction || 0).toFixed(2)],
        ['Taxes', (record.taxes || 0).toFixed(2)],
        ['Other Deductions', (deductions.other_deductions || 0).toFixed(2)]
      ].filter(item => Number(item[1]) > 0);

      if (deductionsBody.length === 0) deductionsBody.push(['None', '0.00']);

      const finalY = doc.lastAutoTable.finalY + 10;

      doc.autoTable({
        startY: finalY,
        head: [['Earnings', 'Amount (Rs.)']],
        body: earningsBody,
        theme: 'grid',
        headStyles: { fillColor: [46, 204, 113], textColor: 255 },
        margin: { right: 110 }
      });

      doc.autoTable({
        startY: finalY,
        head: [['Deductions', 'Amount (Rs.)']],
        body: deductionsBody,
        theme: 'grid',
        headStyles: { fillColor: [231, 76, 60], textColor: 255 },
        margin: { left: 110 }
      });

      const tablesFinalY = Math.max(
        doc.autoTable.previous.finalY, 
        doc.previousAutoTable?.finalY || 0
      ) + 15;

      doc.setFillColor(248, 249, 250);
      doc.rect(14, tablesFinalY, 182, 25, 'F');
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Gross Salary:', 20, tablesFinalY + 10);
      doc.text(`Rs. ${(record.gross_salary || 0).toFixed(2)}`, 80, tablesFinalY + 10);
      
      doc.text('Total Deductions:', 110, tablesFinalY + 10);
      doc.text(`Rs. ${((record.gross_salary || 0) - (record.net_salary || 0)).toFixed(2)}`, 160, tablesFinalY + 10);
      
      doc.setFontSize(14);
      doc.setTextColor(46, 204, 113);
      doc.text('NET PAY:', 110, tablesFinalY + 20);
      doc.text(`Rs. ${(record.net_salary || 0).toFixed(2)}`, 160, tablesFinalY + 20);

      doc.setFontSize(9);
      doc.setTextColor(108, 117, 125);
      doc.setFont(undefined, 'normal');
      doc.text('This is a computer generated document. No signature is required.', 105, 280, { align: 'center' });

      doc.save(`Payslip_${record.employee_name.replace(/\s+/g, '_')}_${monthName.replace(/\s+/g, '_')}.pdf`);
      toast.success('Payslip downloaded successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const hasAdvance = advances.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {hasAdvance ? 'Advance & Payslip Preview' : 'Payslip Preview'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="hidden sm:flex">
                <Printer className="w-4 h-4 mr-2" /> Print {hasAdvance ? 'Advance Payslip' : 'Payslip'}
              </Button>
              <Button size="sm" onClick={handleExportPDF} disabled={loading || exporting}>
                {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Download {hasAdvance ? 'Advance Payslip' : 'Payslip'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-muted/10 print:bg-white print:p-0">
          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          ) : record ? (
            <div className="print-content bg-card print:bg-white border border-border print:border-none rounded-xl p-8 shadow-sm print:shadow-none mx-auto max-w-4xl text-sm">
              
              <div className="text-center mb-8 pb-6 border-b border-border text-foreground">
                <h1 className="text-2xl font-bold tracking-tight uppercase">Jai Bhavani Cargo</h1>
                <p className="text-muted-foreground mt-1">Salary Payslip for {format(new Date(record.payroll_year, record.payroll_month - 1), 'MMMM yyyy')}</p>
              </div>

              {/* Employee Details Grid */}
              <table className="w-full mb-6 border border-border text-sm">
                <tbody>
                  <tr>
                    <td className="w-1/4 font-semibold bg-muted/30 p-2.5 border border-border">Employee Name:</td>
                    <td className="w-1/4 p-2.5 border border-border font-bold text-foreground">{record.employee_name}</td>
                    <td className="w-1/4 font-semibold bg-muted/30 p-2.5 border border-border">Employee ID:</td>
                    <td className="w-1/4 p-2.5 border border-border font-mono text-muted-foreground">{record.expand?.employee_id_relation?.id?.substring(0,8) || record.employee_id || '-'}</td>
                  </tr>
                  <tr>
                    <td className="w-1/4 font-semibold bg-muted/30 p-2.5 border border-border">Designation:</td>
                    <td className="w-1/4 p-2.5 border border-border capitalize text-foreground">{record.designation || 'Staff'}</td>
                    <td className="w-1/4 font-semibold bg-muted/30 p-2.5 border border-border">Payment Status:</td>
                    <td className="w-1/4 p-2.5 border border-border">
                      <span className={`font-bold text-xs uppercase px-2.5 py-1 rounded-full border ${
                        record.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/4 font-semibold bg-muted/30 p-2.5 border border-border">Days Worked:</td>
                    <td className="w-1/4 p-2.5 border border-border text-foreground">{record.attendance_days || 0}</td>
                    <td className="w-1/4 font-semibold bg-muted/30 p-2.5 border border-border">Payment Date:</td>
                    <td className="w-1/4 p-2.5 border border-border text-foreground">
                      {record.payment_date ? format(new Date(record.payment_date), 'dd MMM yyyy') : 'Pending'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {hasAdvance && (
                <div className="mb-6">
                  <div className="bg-warning/10 px-4 py-2 font-semibold text-warning-foreground rounded-t-lg border border-warning/20 border-b-0 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" /> Advance Details
                  </div>
                  <table className="w-full border border-warning/20 text-xs">
                    <thead>
                      <tr className="bg-warning/5 font-medium text-warning-foreground border-b border-warning/20 text-left">
                        <th className="p-2 border-r border-warning/20">Date</th>
                        <th className="p-2 border-r border-warning/20">Reason</th>
                        <th className="p-2 text-right border-r border-warning/20">Amount</th>
                        <th className="p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {advances.map(adv => (
                        <tr key={adv.id} className="border-b border-warning/10 bg-card">
                          <td className="p-2 border-r border-warning/10 text-muted-foreground">{adv.date ? format(new Date(adv.date), 'dd MMM yyyy') : '-'}</td>
                          <td className="p-2 border-r border-warning/10 truncate max-w-[200px]">{adv.reason || 'Advance Payment'}</td>
                          <td className="p-2 text-right font-semibold border-r border-warning/10">₹{(adv.amount || 0).toLocaleString()}</td>
                          <td className="p-2 text-center">
                            <Badge variant="outline" className={adv.status === 'Deducted' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
                              {adv.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Financial Table */}
              <table className="w-full mb-6 border border-border text-sm">
                <thead>
                  <tr className="bg-muted/30 font-bold border-b border-border text-foreground">
                    <th className="w-1/2 p-3 text-left border-r border-border">Earnings Description</th>
                    <th className="w-1/2 p-3 text-left">Deductions Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="align-top">
                    {/* Earnings Column */}
                    <td className="p-4 border-r border-border">
                      <div className="flex justify-between mb-3">
                        <span className="text-muted-foreground font-medium">Basic Salary</span>
                        <span className="font-mono font-bold text-foreground">₹{(record.total_salary || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      {record.allowances_breakdown && Object.entries(record.allowances_breakdown).map(([key, val]) => {
                        if (Number(val) <= 0) return null;
                        return (
                          <div key={key} className="flex justify-between mb-3">
                            <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-mono font-bold text-foreground">₹{Number(val).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </div>
                        );
                      })}
                    </td>
                    {/* Deductions Column */}
                    <td className="p-4">
                      {record.taxes > 0 && (
                        <div className="flex justify-between mb-3">
                          <span className="text-muted-foreground">Taxes (TDS)</span>
                          <span className="font-mono font-bold text-destructive">₹{(record.taxes || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                      )}
                      {record.deductions_breakdown && Object.entries(record.deductions_breakdown).map(([key, val]) => {
                        if (Number(val) <= 0 || key === 'advance_deduction') return null;
                        return (
                          <div key={key} className="flex justify-between mb-3">
                            <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-mono font-bold text-destructive">₹{Number(val).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </div>
                        );
                      })}
                      {/* Explicit Advance Deduction Label */}
                      {(() => {
                        const advanceDeducted = advances.filter(a => a.status === 'Deducted').reduce((sum, a) => sum + a.amount, 0) || record.driver_advances || 0;
                        if (advanceDeducted > 0) {
                          return (
                            <div className="flex justify-between mb-3">
                              <span className="text-destructive font-medium">Advance Deduction</span>
                              <span className="font-mono font-bold text-destructive">₹{advanceDeducted.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      {(!record.deductions_breakdown || Object.values(record.deductions_breakdown).every(v => Number(v) === 0)) && !record.taxes && !(record.driver_advances > 0) && (
                        <div className="text-center text-muted-foreground italic py-4">No deductions recorded.</div>
                      )}
                    </td>
                  </tr>
                  {/* Totals Row */}
                  <tr className="bg-muted/20 border-t border-border font-bold text-foreground">
                    <td className="p-3 border-r border-border">
                      <div className="flex justify-between">
                        <span>Gross Earnings</span>
                        <span className="font-mono">₹{(record.gross_salary || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-between">
                        <span>Total Deductions</span>
                        <span className="font-mono">₹{((record.gross_salary || 0) - (record.net_salary || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Net Salary Highlight */}
              <div className="bg-muted/50 p-4 border border-border rounded-xl flex justify-between items-center mb-6">
                <div>
                  <p className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">Net Salary Payable (Net Pay)</p>
                  <p className="text-xs text-muted-foreground">Gross Earnings - Total Deductions</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold tracking-tight text-success font-mono">₹{(record.net_salary || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>
              </div>

              {/* Footer info & Signatures */}
              <div className="flex justify-between mt-16 pt-8 text-sm font-semibold text-muted-foreground">
                <div className="text-center w-48">
                  <Separator className="mb-2 bg-border" />
                  <span>Authorized Signatory</span>
                </div>
                <div className="text-center w-48">
                  <Separator className="mb-2 bg-border" />
                  <span>Employee Signature</span>
                </div>
              </div>

              <div className="mt-8 text-center text-xs text-muted-foreground print:block">
                This is a computer generated document and does not require a physical signature if distributed electronically.
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Record not found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}