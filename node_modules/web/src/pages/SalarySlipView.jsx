import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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

const SalarySlipView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companySettings, setCompanySettings] = useState(null);

  useEffect(() => {
    const fetchSlipAndSettings = async () => {
      try {
        const [slipData, settingsData] = await Promise.all([
          pb.collection('payroll').getOne(id, { $autoCancel: false }),
          pb.collection('company_settings').getOne('companysettings', { $autoCancel: false }).catch(() => null)
        ]);
        setRecord(slipData);
        setCompanySettings(settingsData);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load salary slip');
      } finally {
        setLoading(false);
      }
    };
    fetchSlipAndSettings();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success('Preparing PDF for download. Please use Print -> Save as PDF');
    setTimeout(() => window.print(), 500);
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!record) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Record not found</div>;
  }

  const monthName = format(new Date(record.payroll_year, record.payroll_month - 1), 'MMMM yyyy');
  // Reconstruct absent days for display based on standard deduction rule (₹300/day)
  const absentDays = record.attendance_deduction ? Math.floor(record.attendance_deduction / 300) : 0;

  return (
    <div className="min-h-screen bg-muted/30 py-8 print:bg-white print:py-0">
      <Helmet>
        <title>Salary Slip - {record.employee_name}</title>
      </Helmet>

      {/* Action Bar - Hidden in print */}
      <div className="max-w-4xl mx-auto px-4 mb-6 flex justify-between items-center print-hidden">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Payroll
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Slip Container */}
      <div className="print-content max-w-4xl mx-auto bg-white text-black shadow-lg border border-gray-200 print:shadow-none print:border-none p-8 md:p-12 rounded-2xl">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8 border-b-2 border-gray-900 pb-6 text-center">
          {companySettings?.company_logo && (
            <img 
              src={pb.files.getUrl(companySettings, companySettings.company_logo)} 
              alt="Logo" 
              className="h-16 mb-3 object-contain"
            />
          )}
          <h1 className="text-3xl font-extrabold uppercase tracking-widest text-gray-900">
            {companySettings?.company_name || 'Jai Bhavani Cargo'}
          </h1>
          <p className="text-gray-600 mt-1 text-sm font-medium">
            {companySettings?.company_address || 'Transport & Logistics Solutions'}
          </p>
          {companySettings?.company_phone || companySettings?.company_email ? (
            <p className="text-xs text-gray-500 mt-1">
              {[companySettings.company_phone && `Phone: ${companySettings.company_phone}`, companySettings.company_email && `Email: ${companySettings.company_email}`].filter(Boolean).join(' | ')}
            </p>
          ) : null}
          <h2 className="text-xl font-bold mt-4 uppercase text-gray-800 tracking-wider">Salary Payslip for {monthName}</h2>
        </div>

        {/* Employee Details Grid */}
        <table className="w-full mb-6 border border-gray-300 text-sm">
          <tbody>
            <tr>
              <td className="w-1/4 font-semibold bg-gray-50/80 p-2.5 border border-gray-300 text-gray-700">Employee Name:</td>
              <td className="w-1/4 p-2.5 border border-gray-300 font-bold text-gray-950">{record.employee_name}</td>
              <td className="w-1/4 font-semibold bg-gray-50/80 p-2.5 border border-gray-300 text-gray-700">Employee ID:</td>
              <td className="w-1/4 p-2.5 border border-gray-300 font-mono text-gray-950">{record.employee_id || '-'}</td>
            </tr>
            <tr>
              <td className="w-1/4 font-semibold bg-gray-50/80 p-2.5 border border-gray-300 text-gray-700">Designation:</td>
              <td className="w-1/4 p-2.5 border border-gray-300 capitalize text-gray-950">{record.designation || 'Staff'}</td>
              <td className="w-1/4 font-semibold bg-gray-50/80 p-2.5 border border-gray-300 text-gray-700">Days Present / Period:</td>
              <td className="w-1/4 p-2.5 border border-gray-300 text-gray-950">{record.attendance_days ? `${record.attendance_days} days` : '30 days'} / {monthName}</td>
            </tr>
            <tr>
              <td className="w-1/4 font-semibold bg-gray-50/80 p-2.5 border border-gray-300 text-gray-700">Payment Status:</td>
              <td className="w-1/4 p-2.5 border border-gray-300 text-gray-950 font-bold uppercase">{record.payment_status || 'Pending'}</td>
              <td className="w-1/4 font-semibold bg-gray-50/80 p-2.5 border border-gray-300 text-gray-700">Payment Mode / Date:</td>
              <td className="w-1/4 p-2.5 border border-gray-300 text-gray-950 capitalize">{record.payment_mode || 'Bank Transfer'} / {record.payment_date ? format(new Date(record.payment_date), 'dd MMM yyyy') : '-'}</td>
            </tr>
          </tbody>
        </table>

        {/* Financial Table */}
        <table className="w-full mb-6 border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100 font-bold border-b border-gray-300 text-gray-800">
              <th className="w-1/4 p-3 text-left border-r border-gray-300">Earnings Description</th>
              <th className="w-1/4 p-3 text-right border-r border-gray-300">Amount (₹)</th>
              <th className="w-1/4 p-3 text-left border-r border-gray-300">Deductions Description</th>
              <th className="w-1/4 p-3 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2.5 border-r border-b border-gray-300 text-gray-700">Basic Salary</td>
              <td className="p-2.5 text-right border-r border-b border-gray-300 font-mono font-medium text-gray-950">{(record.base_salary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="p-2.5 border-r border-b border-gray-300 text-gray-700">Absent Deduction</td>
              <td className="p-2.5 text-right border-b border-gray-300 font-mono font-medium text-gray-950">{record.attendance_deduction ? record.attendance_deduction.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}</td>
            </tr>
            <tr>
              <td className="p-2.5 border-r border-b border-gray-300 text-gray-700">Trip Bonus / Allowances</td>
              <td className="p-2.5 text-right border-r border-b border-gray-300 font-mono font-medium text-success">{(record.trip_bonus || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="p-2.5 border-r border-b border-gray-300 text-gray-700">Advance Recovery</td>
              <td className="p-2.5 text-right border-b border-gray-300 font-mono font-medium text-destructive">{(record.driver_advances || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td className="p-2.5 border-r border-b border-gray-300 text-gray-700">
                {record.allowances_breakdown ? Object.entries(record.allowances_breakdown)
                  .filter(([_, v]) => Number(v) > 0)
                  .map(([k]) => k.replace(/_/g, ' ')).join(', ') || 'Other Allowances' : 'Other Allowances'}
              </td>
              <td className="p-2.5 text-right border-r border-b border-gray-300 font-mono font-medium text-gray-950">
                {record.allowances_breakdown ? Object.values(record.allowances_breakdown)
                  .reduce((sum, v) => sum + (Number(v) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
              </td>
              <td className="p-2.5 border-r border-b border-gray-300 text-gray-700">Taxes (TDS / Other)</td>
              <td className="p-2.5 text-right border-b border-gray-300 font-mono font-medium text-destructive">{(record.taxes || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr className="bg-gray-50/80 font-bold border-t border-gray-300 text-gray-800">
              <td className="p-3 border-r border-gray-300">Total Gross Earnings</td>
              <td className="p-3 text-right border-r border-gray-300 font-mono">{(record.base_salary + (record.trip_bonus || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="p-3 border-r border-gray-300">Total Deductions</td>
              <td className="p-3 text-right font-mono">{((record.attendance_deduction || 0) + (record.driver_advances || 0) + (record.taxes || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        {/* Net Salary Highlight */}
        <div className="border border-gray-300 rounded-xl overflow-hidden mb-6">
          <div className="bg-gray-100 p-4 border-b border-gray-300 flex justify-between items-center">
            <span className="font-bold text-gray-800 uppercase tracking-wider text-sm">Net Salary Payable (Net Pay)</span>
            <span className="text-2xl font-extrabold text-gray-950 font-mono">₹{record.net_salary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="p-3 bg-white text-xs text-gray-600 font-medium">
            <strong>Net Pay in Words:</strong> {formatAmountToWords(record.net_salary)}
          </div>
        </div>

        {/* Footer info & Signatures */}
        {record.payment_status === 'paid' && record.remarks && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600">
            <strong>Remarks / Ref:</strong> {record.remarks}
          </div>
        )}

        <table className="w-full mt-16 pt-8 text-sm">
          <tbody>
            <tr>
              <td className="w-1/2 text-center align-bottom pb-2">
                <div className="border-t border-gray-400 w-48 mx-auto mb-2"></div>
                <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Employee Signature</span>
              </td>
              <td className="w-1/2 text-center align-bottom pb-2">
                <div className="border-t border-gray-400 w-48 mx-auto mb-2"></div>
                <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Authorized Signatory</span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div className="mt-12 text-center text-xs text-gray-400">
          This is a computer generated document and does not require a physical signature if distributed electronically.
        </div>

      </div>
    </div>
  );
};

export default SalarySlipView;