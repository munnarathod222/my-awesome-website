import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import pb from './pocketbaseClient.js';
import { getTranslation } from './payslipTranslations.js';

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

export const generateAdvancePayslipPDF = async (payroll, employee, advances = [], language = 'en') => {
  try {
    const t = (key) => getTranslation(language, key);
    let companySettings = null;
    try {
      companySettings = await pb.collection('company_settings').getOne('companysettings', { $autoCancel: false });
    } catch(e) {}

    const compName = companySettings?.company_name || 'JAI BHAVANI CARGO';
    const compAddress = companySettings?.company_address || 'Plot No. 3, Patel Nagar, Ghatkesar, Medchal-Malkajgiri Dist., Telangana - 501301';
    const compPhone = companySettings?.company_phone || '7794072244';
    const compEmail = companySettings?.company_email || 'vinod@jaibhavanicargo.com';
    const compGstin = companySettings?.company_gstin || '36AAACJ2230M1Z2';

    const monthName = payroll ? format(new Date(payroll.payroll_year, payroll.payroll_month - 1), 'MMMM yyyy') : 'Current';
    const hasAdvance = advances.length > 0;
    
    const getCleanEmpId = (emp, pay) => {
      if (emp?.employee_code) return String(emp.employee_code);
      if (emp?.emp_id) return String(emp.emp_id);
      if (emp?.employee_number) return String(emp.employee_number);
      if (pay?.employee_code) return String(pay.employee_code);
      
      const rawId = emp?.id || pay?.employee_id || '';
      if (!rawId) return '1';
      let hash = 0;
      for (let i = 0; i < rawId.length; i++) hash = (hash * 31 + rawId.charCodeAt(i)) % 997;
      return String((hash % 100) + 1);
    };

    const empName = employee?.name || payroll?.employee_name || '-';
    const empId = getCleanEmpId(employee, payroll);
    const rawPos = employee?.position || employee?.employee_type || payroll?.designation || '-';
    const designation = rawPos.toLowerCase().includes('driver') ? t('driverRole') : rawPos;
    const daysPresent = `${payroll ? `${payroll.attendance_days || 0} ${t('days')}` : `30 ${t('days')}`} / ${monthName}`;
    const rawStat = (payroll?.payment_status || payroll?.status || 'Pending').toUpperCase();
    const paymentStatus = rawStat.includes('PAID') ? t('paid') : t('pending');
    const paymentModeDate = `${t('bankTransfer')} / ${payroll?.payment_date ? format(new Date(payroll.payment_date), 'dd MMM yyyy') : '-'}`;

    const basicSalary = payroll?.total_salary || payroll?.base_salary || employee?.salary_amount || employee?.base_salary || 0;
    const tripBonus = payroll?.trip_bonus || 0;
    const grossSalary = payroll?.gross_salary || (basicSalary + tripBonus);

    const advanceDeducted = (!payroll ? advances : advances.filter(a => a.status === 'Deducted')).reduce((sum, a) => sum + a.amount, 0) || payroll?.driver_advances || 0;
    const absentDeduction = payroll?.attendance_deduction || 0;
    const taxes = payroll?.taxes || 0;
    const totalDeductions = payroll ? ((payroll.gross_salary || 0) - (payroll.net_salary || 0)) : (advanceDeducted + absentDeduction + taxes);
    const netSalary = payroll ? (payroll.net_salary || 0) : (grossSalary - totalDeductions);

    const contactLine = [
      compPhone ? `Ph: ${compPhone}` : null,
      compEmail ? `Email: ${compEmail}` : null,
      compGstin ? `GSTIN: ${compGstin}` : null
    ].filter(Boolean).join(' | ');

    // Create temporary off-screen container for rendering HTML
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '750px';
    container.style.background = '#ffffff';
    container.style.color = '#000000';
    container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
    container.style.padding = '30px';
    container.style.boxSizing = 'border-box';

    let advanceRowsHtml = '';
    if (hasAdvance) {
      advanceRowsHtml = `
        <div style="margin-bottom: 20px;">
          <div style="background-color: #fef3c7; color: #451a03; border: 1px solid #fcd34d; border-bottom: 0; padding: 8px 12px; font-weight: bold; font-size: 13px; border-top-left-radius: 6px; border-top-right-radius: 6px;">
            ${t('advanceRecordsHeader')}
          </div>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #fcd34d; font-size: 12px;">
            <thead>
              <tr style="background-color: #fffbeb; color: #451a03; text-align: left;">
                <th style="padding: 6px 10px; border-right: 1px solid #fcd34d; border-bottom: 1px solid #fcd34d;">${t('date')}</th>
                <th style="padding: 6px 10px; border-right: 1px solid #fcd34d; border-bottom: 1px solid #fcd34d;">${t('reason')}</th>
                <th style="padding: 6px 10px; text-align: right; border-bottom: 1px solid #fcd34d;">${t('amount')}</th>
              </tr>
            </thead>
            <tbody>
              ${advances.map(adv => `
                <tr style="border-bottom: 1px solid #fde68a;">
                  <td style="padding: 6px 10px; border-right: 1px solid #fde68a;">${adv.date ? format(new Date(adv.date), 'dd MMM yyyy') : '-'}</td>
                  <td style="padding: 6px 10px; border-right: 1px solid #fde68a;">${adv.reason || 'Advance'}</td>
                  <td style="padding: 6px 10px; text-align: right; font-weight: 600;">₹${(adv.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              <tr style="background-color: #fef3c7; font-weight: bold;">
                <td colspan="2" style="padding: 6px 10px; border-right: 1px solid #fcd34d;">${t('totalAdvances')}</td>
                <td style="padding: 6px 10px; text-align: right;">₹${advances.reduce((s, a) => s + (a.amount || 0), 0).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #cbd5e1;">
        <h1 style="font-size: 22px; font-weight: 800; margin: 0; text-transform: uppercase; color: #000000;">${compName}</h1>
        <p style="font-size: 11px; color: #475569; margin: 4px 0 0 0;">${compAddress}</p>
        ${contactLine ? `<p style="font-size: 11px; color: #475569; margin: 2px 0 0 0;">${contactLine}</p>` : ''}
        <h2 style="font-size: 15px; font-weight: 700; margin: 12px 0 0 0; text-transform: uppercase; color: #0f172a;">
          ${hasAdvance ? t('titleAdvancePayslip') : t('titlePayslip')} (${monthName})
        </h2>
      </div>

      <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 20px; font-size: 12px;">
        <tbody>
          <tr>
            <td style="width: 25%; font-weight: 600; background-color: #f1f5f9; padding: 8px 10px; border: 1px solid #cbd5e1; color: #0f172a;">${t('empName')}</td>
            <td style="width: 25%; font-weight: 700; padding: 8px 10px; border: 1px solid #cbd5e1; color: #000000;">${empName}</td>
            <td style="width: 25%; font-weight: 600; background-color: #f1f5f9; padding: 8px 10px; border: 1px solid #cbd5e1; color: #0f172a;">${t('empId')}</td>
            <td style="width: 25%; font-weight: 700; padding: 8px 10px; border: 1px solid #cbd5e1; color: #000000;">${empId}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; background-color: #f1f5f9; padding: 8px 10px; border: 1px solid #cbd5e1; color: #0f172a;">${t('designation')}</td>
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #000000;">${designation}</td>
            <td style="font-weight: 600; background-color: #f1f5f9; padding: 8px 10px; border: 1px solid #cbd5e1; color: #0f172a;">${t('daysPresent')}</td>
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #000000;">${daysPresent}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; background-color: #f1f5f9; padding: 8px 10px; border: 1px solid #cbd5e1; color: #0f172a;">${t('paymentStatus')}</td>
            <td style="font-weight: 700; padding: 8px 10px; border: 1px solid #cbd5e1; color: #000000; text-transform: uppercase;">${paymentStatus}</td>
            <td style="font-weight: 600; background-color: #f1f5f9; padding: 8px 10px; border: 1px solid #cbd5e1; color: #0f172a;">${t('paymentModeDate')}</td>
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #000000;">${paymentModeDate}</td>
          </tr>
        </tbody>
      </table>

      ${advanceRowsHtml}

      <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 20px; font-size: 12px;">
        <thead>
          <tr style="background-color: #f1f5f9; font-weight: 700; color: #0f172a;">
            <th style="width: 25%; padding: 8px 10px; text-align: left; border: 1px solid #cbd5e1;">${t('earningsDesc')}</th>
            <th style="width: 25%; padding: 8px 10px; text-align: right; border: 1px solid #cbd5e1;">${t('amount')}</th>
            <th style="width: 25%; padding: 8px 10px; text-align: left; border: 1px solid #cbd5e1;">${t('deductionsDesc')}</th>
            <th style="width: 25%; padding: 8px 10px; text-align: right; border: 1px solid #cbd5e1;">${t('amount')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #334155;">${t('basicSalary')}</td>
            <td style="padding: 8px 10px; text-align: right; border: 1px solid #cbd5e1; color: #000000; font-family: monospace;">₹${basicSalary.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #334155;">${t('absentDeduction')}</td>
            <td style="padding: 8px 10px; text-align: right; border: 1px solid #cbd5e1; color: #000000; font-family: monospace;">₹${absentDeduction.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
          </tr>
          <tr>
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #334155;">${t('tripBonus')}</td>
            <td style="padding: 8px 10px; text-align: right; border: 1px solid #cbd5e1; color: #047857; font-family: monospace;">₹${tripBonus.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #334155;">${t('advanceRecovery')}</td>
            <td style="padding: 8px 10px; text-align: right; border: 1px solid #cbd5e1; color: #be123c; font-family: monospace;">₹${advanceDeducted.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
          </tr>
          <tr>
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #334155;">${t('otherAllowances')}</td>
            <td style="padding: 8px 10px; text-align: right; border: 1px solid #cbd5e1; color: #000000; font-family: monospace;">₹0.00</td>
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #334155;">${t('taxesLabel')}</td>
            <td style="padding: 8px 10px; text-align: right; border: 1px solid #cbd5e1; color: #be123c; font-family: monospace;">₹${taxes.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
          </tr>
          <tr style="background-color: #f1f5f9; font-weight: bold; color: #000000;">
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">${t('grossSalary')}</td>
            <td style="padding: 8px 10px; text-align: right; border: 1px solid #cbd5e1; font-family: monospace;">₹${grossSalary.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">${t('totalDeductions')}</td>
            <td style="padding: 8px 10px; text-align: right; border: 1px solid #cbd5e1; font-family: monospace;">₹${totalDeductions.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
          </tr>
        </tbody>
      </table>

      <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
        <div style="background-color: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #334155;">${t('netPayable')}</div>
            <div style="font-size: 11px; color: #64748b;">${t('netPaySubtext')}</div>
          </div>
          <div style="font-size: 22px; font-weight: 900; font-family: monospace; color: #000000;">
            ₹${netSalary.toLocaleString('en-IN', {minimumFractionDigits:2})}
          </div>
        </div>
        <div style="padding: 10px 16px; background-color: #ffffff; font-size: 11px; font-weight: 600; color: #1e293b;">
          ${t('amountInWords')} <span style="font-weight: 700; color: #000000;">${formatAmountToWords(netSalary)}</span>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 11px;">
        <div style="text-align: center; width: 40%;">
          <div style="border-bottom: 1px dashed #94a3b8; margin-bottom: 6px; height: 25px;"></div>
          <div style="font-weight: 600; color: #1e293b;">${t('authorizedSignatory')}</div>
          <div style="font-size: 10px; color: #64748b;">${compName}</div>
        </div>
        <div style="text-align: center; width: 40%;">
          <div style="border-bottom: 1px dashed #94a3b8; margin-bottom: 6px; height: 25px;"></div>
          <div style="font-weight: 600; color: #1e293b;">${t('employeeSignature')}</div>
          <div style="font-size: 10px; color: #64748b;">${empName}</div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF({ format: 'a4', orientation: 'portrait' });
    const imgWidth = 210; // A4 width mm
    const pageHeight = 297; // A4 height mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
    return doc.output('blob');
  } catch (err) {
    console.error('PDF generation error:', err);
    throw err;
  }
};