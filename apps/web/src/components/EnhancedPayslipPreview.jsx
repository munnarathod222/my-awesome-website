import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';

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

import { getTranslation, transliterateText } from '@/lib/payslipTranslations.js';

export default function EnhancedPayslipPreview({ payroll, employee, advances = [], language = 'en' }) {
  const [companySettings, setCompanySettings] = useState(null);
  const t = (key) => getTranslation(language, key);
  const tr = (text) => transliterateText(text, language);

  useEffect(() => {
    pb.collection('company_settings').getOne('companysettings', { $autoCancel: false })
      .then(setCompanySettings)
      .catch(() => {});
  }, []);

  const hasAdvance = advances.length > 0;
  const advanceDeducted = (!payroll ? advances : advances.filter(a => a.status === 'Deducted')).reduce((sum, a) => sum + a.amount, 0) || payroll?.driver_advances || 0;
  const monthName = payroll ? format(new Date(payroll.payroll_year, payroll.payroll_month - 1), 'MMMM yyyy') : 'Current';

  const basicSalary = payroll?.total_salary || payroll?.base_salary || employee?.salary_amount || employee?.base_salary || 0;
  const grossSalary = payroll?.gross_salary || (basicSalary + (payroll?.trip_bonus || 0));
  const totalDeductions = payroll ? ((payroll.gross_salary || 0) - (payroll.net_salary || 0)) : (advanceDeducted + (payroll?.attendance_deduction || 0) + (payroll?.taxes || 0));
  const netSalary = payroll ? (payroll.net_salary || 0) : (grossSalary - totalDeductions);
  
  const getCleanEmployeeId = (emp, pay) => {
    if (emp?.employee_code) return String(emp.employee_code);
    if (emp?.emp_id) return String(emp.emp_id);
    if (emp?.employee_number) return String(emp.employee_number);
    if (pay?.employee_code) return String(pay.employee_code);
    
    const rawId = emp?.id || pay?.employee_id || '';
    if (!rawId) return '1';

    let hash = 0;
    for (let i = 0; i < rawId.length; i++) {
      hash = (hash * 31 + rawId.charCodeAt(i)) % 997;
    }
    return String((hash % 100) + 1);
  };

  const compName = companySettings?.company_name || 'JAI BHAVANI CARGO';
  const compAddress = companySettings?.company_address || 'Plot No. 3, Patel Nagar, Ghatkesar, Medchal-Malkajgiri Dist., Telangana - 501301';
  const compPhone = companySettings?.company_phone || '7794072244';
  const compEmail = companySettings?.company_email || 'vinod@jaibhavanicargo.com';
  const compGstin = companySettings?.company_gstin || '36AAACJ2230M1Z2';

  const contactLine = [
    compPhone ? `Ph: ${compPhone}` : null,
    compEmail ? `Email: ${compEmail}` : null,
    compGstin ? `GSTIN: ${compGstin}` : null
  ].filter(Boolean).join(' | ');

  const rawPosition = employee?.position || employee?.employee_type || payroll?.designation || '';
  const displayPosition = rawPosition.toLowerCase().includes('driver') ? t('driverRole') : (rawPosition || '-');
  const rawStatus = payroll?.payment_status || payroll?.status || 'Pending';
  const displayStatus = rawStatus.toLowerCase().includes('paid') ? t('paid') : t('pending');
  const driverNameDisplay = tr(employee?.name || payroll?.employee_name || '-');

  return (
    <div className="print-content payslip-container bg-white text-slate-950 border border-slate-300 rounded-2xl shadow-md p-8" id="payslip-preview-content" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
      {/* Header Area */}
      <div className="text-center mb-8 pb-6 border-b border-slate-300 text-slate-950" style={{ borderColor: '#e2e8f0' }}>
        <h1 className="text-2xl font-bold tracking-tight uppercase text-slate-950" style={{ color: '#000000' }}>{compName}</h1>
        <p className="text-xs text-slate-600 mt-1" style={{ color: '#475569' }}>{compAddress}</p>
        {contactLine && <p className="text-xs text-slate-600" style={{ color: '#475569' }}>{contactLine}</p>}
        <h2 className="text-lg font-bold mt-4 uppercase tracking-wider text-slate-900" style={{ color: '#0f172a' }}>{hasAdvance ? t('titleAdvancePayslip') : t('titlePayslip')} ({monthName})</h2>
      </div>

      {/* Employee Details Grid */}
      <table className="w-full mb-6 border border-slate-300 text-sm" style={{ borderCollapse: 'collapse', borderColor: '#cbd5e1' }}>
        <tbody>
          <tr>
            <td className="w-1/4 font-semibold bg-slate-100 p-2.5 border border-slate-300" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>{t('empName')}</td>
            <td className="w-1/4 p-2.5 border border-slate-300 font-bold text-slate-950" style={{ color: '#000000' }}>{driverNameDisplay}</td>
            <td className="w-1/4 font-semibold bg-slate-100 p-2.5 border border-slate-300" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>{t('empId')}</td>
            <td className="w-1/4 p-2.5 border border-slate-300 font-mono text-slate-700 font-bold" style={{ color: '#000000' }}>{getCleanEmployeeId(employee, payroll)}</td>
          </tr>
          <tr>
            <td className="w-1/4 font-semibold bg-slate-100 p-2.5 border border-slate-300" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>{t('designation')}</td>
            <td className="w-1/4 p-2.5 border border-slate-300 capitalize text-slate-950" style={{ color: '#000000' }}>{displayPosition}</td>
            <td className="w-1/4 font-semibold bg-slate-100 p-2.5 border border-slate-300" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>{t('daysPresent')}</td>
            <td className="w-1/4 p-2.5 border border-slate-300 text-slate-950" style={{ color: '#000000' }}>{payroll ? `${payroll.attendance_days || 0} ${t('days')}` : `30 ${t('days')}`} / {monthName}</td>
          </tr>
          <tr>
            <td className="w-1/4 font-semibold bg-slate-100 p-2.5 border border-slate-300" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>{t('paymentStatus')}</td>
            <td className="w-1/4 p-2.5 border border-slate-300 text-slate-950 font-bold uppercase" style={{ color: '#000000' }}>{displayStatus}</td>
            <td className="w-1/4 font-semibold bg-slate-100 p-2.5 border border-slate-300" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>{t('paymentModeDate')}</td>
            <td className="w-1/4 p-2.5 border border-slate-300 capitalize text-slate-950" style={{ color: '#000000' }}>{t('bankTransfer')} / {payroll?.payment_date ? format(new Date(payroll.payment_date), 'dd MMM yyyy') : '-'}</td>
          </tr>
        </tbody>
      </table>

      {/* Advance Details Box */}
      {hasAdvance && (
        <div className="mb-6">
          <div className="bg-amber-100 px-4 py-2 font-semibold text-amber-950 rounded-t-lg border border-amber-300 border-b-0 flex items-center gap-2" style={{ backgroundColor: '#fef3c7', color: '#451a03', borderColor: '#fcd34d' }}>
            {t('advanceRecordsHeader')}
          </div>
          <table className="w-full border border-amber-300 text-xs" style={{ borderCollapse: 'collapse', borderColor: '#fcd34d' }}>
            <thead>
              <tr className="bg-amber-100 font-bold text-amber-950 border-b border-amber-300 text-left" style={{ backgroundColor: '#fef3c7', color: '#451a03' }}>
                <th className="p-2.5 border-r border-amber-300 font-bold text-amber-950" style={{ color: '#451a03', fontWeight: 'bold' }}>{t('date')}</th>
                <th className="p-2.5 border-r border-amber-300 font-bold text-amber-950" style={{ color: '#451a03', fontWeight: 'bold' }}>{t('reason')}</th>
                <th className="p-2.5 text-right font-bold text-amber-950" style={{ color: '#451a03', fontWeight: 'bold' }}>{t('amount')}</th>
              </tr>
            </thead>
            <tbody>
              {advances.map(adv => (
                <tr key={adv.id} className="border-b border-amber-200 bg-white" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                  <td className="p-2 border-r border-amber-200 text-slate-700" style={{ color: '#334155' }}>{adv.date ? format(new Date(adv.date), 'dd MMM') : '-'}</td>
                  <td className="p-2 border-r border-amber-200 text-slate-900 font-medium" style={{ color: '#0f172a' }}>{tr(adv.reason || 'Advance')}</td>
                  <td className="p-2 text-right font-semibold text-slate-950" style={{ color: '#000000' }}>₹{(adv.amount || 0).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-amber-100 font-bold border-t border-amber-300" style={{ backgroundColor: '#fef3c7', color: '#000000' }}>
                <td colSpan="2" className="p-2 border-r border-amber-300">{t('totalAdvances')}</td>
                <td className="p-2 text-right">₹{advances.reduce((s, a) => s + (a.amount || 0), 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Financial Table */}
      <table className="w-full mb-6 border border-slate-300 text-sm" style={{ borderCollapse: 'collapse', borderColor: '#cbd5e1' }}>
        <thead>
          <tr className="bg-slate-100 font-bold border-b border-slate-300 text-slate-950" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
            <th className="w-1/4 p-3 text-left border-r border-slate-300">{t('earningsDesc')}</th>
            <th className="w-1/4 p-3 text-right border-r border-slate-300">{t('amount')}</th>
            <th className="w-1/4 p-3 text-left border-r border-slate-300">{t('deductionsDesc')}</th>
            <th className="w-1/4 p-3 text-right">{t('amount')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2.5 border-r border-b border-slate-300 text-slate-700" style={{ color: '#334155' }}>{t('basicSalary')}</td>
            <td className="p-2.5 text-right border-r border-b border-slate-300 font-mono font-medium text-slate-950" style={{ color: '#000000' }}>{basicSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td className="p-2.5 border-r border-b border-slate-300 text-slate-700" style={{ color: '#334155' }}>{t('absentDeduction')}</td>
            <td className="p-2.5 text-right border-b border-slate-300 font-mono font-medium text-slate-950" style={{ color: '#000000' }}>{payroll?.attendance_deduction ? payroll.attendance_deduction.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}</td>
          </tr>
          <tr>
            <td className="p-2.5 border-r border-b border-slate-300 text-slate-700" style={{ color: '#334155' }}>{t('tripBonus')}</td>
            <td className="p-2.5 text-right border-r border-b border-slate-300 font-mono font-medium text-emerald-700" style={{ color: '#047857' }}>{(payroll?.trip_bonus || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td className="p-2.5 border-r border-b border-slate-300 text-slate-700" style={{ color: '#334155' }}>{t('advanceRecovery')}</td>
            <td className="p-2.5 text-right border-b border-slate-300 font-mono font-medium text-rose-700" style={{ color: '#be123c' }}>{advanceDeducted.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td className="p-2.5 border-r border-b border-slate-300 text-slate-700" style={{ color: '#334155' }}>
              {payroll?.allowances_breakdown ? Object.entries(payroll.allowances_breakdown)
                .filter(([_, v]) => Number(v) > 0)
                .map(([k]) => k.replace(/_/g, ' ')).join(', ') || t('otherAllowances') : t('otherAllowances')}
            </td>
            <td className="p-2.5 text-right border-r border-b border-slate-300 font-mono font-medium text-slate-950" style={{ color: '#000000' }}>
              {payroll?.allowances_breakdown ? Object.values(payroll.allowances_breakdown)
                .reduce((sum, v) => sum + (Number(v) || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
            </td>
            <td className="p-2.5 border-r border-b border-slate-300 text-slate-700" style={{ color: '#334155' }}>{t('taxesLabel')}</td>
            <td className="p-2.5 text-right border-b border-slate-300 font-mono font-medium text-rose-700" style={{ color: '#be123c' }}>{(payroll?.taxes || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          </tr>
          <tr className="bg-slate-100 font-bold border-t border-slate-300 text-slate-950" style={{ backgroundColor: '#f1f5f9', color: '#000000' }}>
            <td className="p-3 border-r border-slate-300">{t('grossSalary')}</td>
            <td className="p-3 text-right border-r border-slate-300 font-mono">{grossSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td className="p-3 border-r border-slate-300">{t('totalDeductions')}</td>
            <td className="p-3 text-right font-mono">{totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          </tr>
        </tbody>
      </table>

      {/* Net Pay Summary */}
      <div className="border border-slate-300 rounded-xl overflow-hidden mb-6" style={{ borderColor: '#cbd5e1' }}>
        <div className="bg-slate-50 p-4 border-b border-slate-300 flex justify-between items-center" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700" style={{ color: '#334155' }}>{t('netPayable')}</h3>
            <p className="text-xs text-slate-500">{t('netPaySubtext')}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-mono text-slate-950" style={{ color: '#000000' }}>
              ₹{netSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </span>
          </div>
        </div>
        <div className="p-3 bg-white text-xs font-medium text-slate-800" style={{ backgroundColor: '#ffffff', color: '#1e293b' }}>
          {t('amountInWords')} <span className="font-bold text-slate-950">{formatAmountToWords(netSalary)}</span>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 pt-12 mt-8 text-center text-xs border-t border-dashed border-slate-300" style={{ borderColor: '#cbd5e1' }}>
        <div>
          <div className="border-b border-slate-400 mb-2 h-10 border-dashed"></div>
          <p className="font-semibold text-slate-800">{t('authorizedSignatory')}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{compName}</p>
        </div>
        <div>
          <div className="border-b border-slate-400 mb-2 h-10 border-dashed"></div>
          <p className="font-semibold text-slate-800">{t('employeeSignature')}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{employee?.name || payroll?.employee_name || 'Employee'}</p>
        </div>
      </div>
    </div>
  );
}