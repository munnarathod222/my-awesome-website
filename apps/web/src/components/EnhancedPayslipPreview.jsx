import React from 'react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const formatAmountToWords = (amount) => {
  const value = Math.floor(amount);
  if (value === 0) return 'Zero Rupees Only';
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convert(n) {
    if (n < 20) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + units[n % 10] : '');
    if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }
  return convert(value) + ' Rupees Only';
};

export default function EnhancedPayslipPreview({ payroll, employee, advances = [] }) {
  const hasAdvance = advances.length > 0;
  const advanceDeducted = (!payroll ? advances : advances.filter(a => a.status === 'Deducted')).reduce((sum, a) => sum + a.amount, 0) || payroll?.driver_advances || 0;
  const monthName = payroll ? format(new Date(payroll.payroll_year, payroll.payroll_month - 1), 'MMMM yyyy') : 'Current';

  const basicSalary = payroll?.total_salary || payroll?.base_salary || employee?.salary_amount || employee?.base_salary || 0;
  const grossSalary = payroll?.gross_salary || (basicSalary + (payroll?.trip_bonus || 0));
  const totalDeductions = payroll ? ((payroll.gross_salary || 0) - (payroll.net_salary || 0)) : (advanceDeducted + (payroll?.attendance_deduction || 0) + (payroll?.taxes || 0));
  const netSalary = payroll ? (payroll.net_salary || 0) : (grossSalary - totalDeductions);
  
  return (
    <div className="print-content payslip-container bg-card print:bg-white text-foreground print:text-black border border-border print:border-none rounded-2xl shadow-sm p-8" id="payslip-preview-content">
      {/* Header Area */}
      <div className="text-center mb-8 pb-6 border-b border-border text-foreground">
        <h1 className="text-2xl font-bold tracking-tight uppercase">JAI BHAVANI CARGO</h1>
        <p className="text-xs text-muted-foreground mt-1">123 Transport Nagar, Logistics Hub | Mumbai, Maharashtra 400001</p>
        <p className="text-xs text-muted-foreground">GSTIN: 27AADCB2230M1Z2</p>
        <h2 className="text-lg font-bold mt-4 uppercase tracking-wider">{hasAdvance ? 'ADVANCE & PAYSLIP' : 'PAYSLIP'} FOR {monthName}</h2>
      </div>

      {/* Employee Details Grid */}
      <table className="w-full mb-6 border border-border text-sm">
        <tbody>
          <tr>
            <td className="w-1/4 font-semibold bg-muted/30 p-2.5 border border-border">Employee Name:</td>
            <td className="w-1/4 p-2.5 border border-border font-bold text-foreground">{employee?.name || payroll?.employee_name || '-'}</td>
            <td className="w-1/4 font-semibold bg-muted/30 p-2.5 border border-border">Employee ID:</td>
            <td className="w-1/4 p-2.5 border border-border font-mono text-muted-foreground">{(employee?.id || payroll?.employee_id || '').substring(0,8)}</td>
          </tr>
          <tr>
            <td className="w-1/4 font-semibold bg-muted/30 p-2.5 border border-border">Designation:</td>
            <td className="w-1/4 p-2.5 border border-border capitalize text-foreground">{employee?.position || employee?.employee_type || payroll?.designation || '-'}</td>
            <td className="w-1/4 font-semibold bg-muted/30 p-2.5 border border-border">Days Present / Period:</td>
            <td className="w-1/4 p-2.5 border border-border text-foreground">{payroll ? `${payroll.attendance_days || 0} days` : '30 days'} / {monthName}</td>
          </tr>
          <tr>
            <td className="w-1/4 font-semibold bg-muted/30 p-2.5 border border-border">Payment Status:</td>
            <td className="w-1/4 p-2.5 border border-border text-foreground font-bold uppercase">{payroll?.payment_status || payroll?.status || 'Pending'}</td>
            <td className="w-1/4 font-semibold bg-muted/30 p-2.5 border border-border">Payment Mode / Date:</td>
            <td className="w-1/4 p-2.5 border border-border capitalize text-foreground">{payroll?.payment_mode || 'Bank Transfer'} / {payroll?.payment_date ? format(new Date(payroll.payment_date), 'dd MMM yyyy') : '-'}</td>
          </tr>
        </tbody>
      </table>

      {/* Advance Details Box */}
      {hasAdvance && (
        <div className="mb-6">
          <div className="bg-warning/10 px-4 py-2 font-semibold text-warning-foreground rounded-t-lg border border-warning/20 border-b-0 flex items-center gap-2">
            Advance Payment Record
          </div>
          <table className="w-full border border-warning/20 text-xs">
            <thead>
              <tr className="bg-warning/5 font-medium text-warning-foreground border-b border-warning/20 text-left">
                <th className="p-2 border-r border-warning/20">Date</th>
                <th className="p-2 border-r border-warning/20">Reason</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {advances.map(adv => (
                <tr key={adv.id} className="border-b border-warning/10 bg-card">
                  <td className="p-2 border-r border-warning/10 text-muted-foreground">{adv.date ? format(new Date(adv.date), 'dd MMM') : '-'}</td>
                  <td className="p-2 border-r border-warning/10">{adv.reason || 'Advance'}</td>
                  <td className="p-2 text-right font-semibold">₹{(adv.amount || 0).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-warning/5 font-bold border-t border-warning/20">
                <td colSpan="2" className="p-2 border-r border-warning/20">Total Advance Balance</td>
                <td className="p-2 text-right">₹{advances.reduce((s, a) => s + (a.amount || 0), 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Financial Table */}
      <table className="w-full mb-6 border border-border text-sm">
        <thead>
          <tr className="bg-muted/30 font-bold border-b border-border text-foreground">
            <th className="w-1/4 p-3 text-left border-r border-border">Earnings Description</th>
            <th className="w-1/4 p-3 text-right border-r border-border">Amount (₹)</th>
            <th className="w-1/4 p-3 text-left border-r border-border">Deductions Description</th>
            <th className="w-1/4 p-3 text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2.5 border-r border-b border-border text-muted-foreground">Basic Salary</td>
            <td className="p-2.5 text-right border-r border-b border-border font-mono font-medium text-foreground">{basicSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td className="p-2.5 border-r border-b border-border text-muted-foreground">Absent Deduction</td>
            <td className="p-2.5 text-right border-b border-border font-mono font-medium text-foreground">{payroll?.attendance_deduction ? payroll.attendance_deduction.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}</td>
          </tr>
          <tr>
            <td className="p-2.5 border-r border-b border-border text-muted-foreground">Trip Bonus / Allowances</td>
            <td className="p-2.5 text-right border-r border-b border-border font-mono font-medium text-success">{(payroll?.trip_bonus || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td className="p-2.5 border-r border-b border-border text-muted-foreground">Advance Recovery</td>
            <td className="p-2.5 text-right border-b border-border font-mono font-medium text-destructive">{advanceDeducted.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td className="p-2.5 border-r border-b border-border text-muted-foreground">
              {payroll?.allowances_breakdown ? Object.entries(payroll.allowances_breakdown)
                .filter(([_, v]) => Number(v) > 0)
                .map(([k]) => k.replace(/_/g, ' ')).join(', ') || 'Other Allowances' : 'Other Allowances'}
            </td>
            <td className="p-2.5 text-right border-r border-b border-border font-mono font-medium text-foreground">
              {payroll?.allowances_breakdown ? Object.values(payroll.allowances_breakdown)
                .reduce((sum, v) => sum + (Number(v) || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
            </td>
            <td className="p-2.5 border-r border-b border-border text-muted-foreground">Taxes (TDS / Other)</td>
            <td className="p-2.5 text-right border-b border-border font-mono font-medium text-destructive">{(payroll?.taxes || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          </tr>
          <tr className="bg-muted/20 font-bold border-t border-border text-foreground">
            <td className="p-3 border-r border-border">Total Gross Earnings</td>
            <td className="p-3 text-right border-r border-border font-mono">{grossSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td className="p-3 border-r border-border">Total Deductions</td>
            <td className="p-3 text-right font-mono">{totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          </tr>
        </tbody>
      </table>

      {/* Net Pay Summary */}
      <div className="border border-border rounded-xl overflow-hidden mb-6">
        <div className="bg-muted/50 p-4 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-xs text-foreground">Net Salary Payable (Net Pay)</h3>
            <p className="text-xs text-muted-foreground">Gross Earnings - Total Deductions</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-success font-mono">₹{netSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
        </div>
        <div className="p-3 bg-card text-xs text-muted-foreground font-medium">
          <strong>Net Pay in Words:</strong> {formatAmountToWords(netSalary)}
        </div>
      </div>

      {/* Signatures */}
      <table className="w-full mt-16 pt-8 text-sm">
        <tbody>
          <tr>
            <td className="w-1/2 text-center align-bottom pb-2">
              <div className="border-t border-border w-48 mx-auto mb-2"></div>
              <span className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Employee Signature</span>
            </td>
            <td className="w-1/2 text-center align-bottom pb-2">
              <div className="border-t border-border w-48 mx-auto mb-2"></div>
              <span className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Authorized Signatory</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="text-center text-xs text-muted-foreground opacity-60 mt-12 pt-4 border-t border-border">
        This is a computer-generated document and does not require a physical signature if distributed electronically.
      </div>
    </div>
  );
}