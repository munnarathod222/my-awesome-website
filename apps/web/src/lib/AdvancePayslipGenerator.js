import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import pb from './pocketbaseClient.js';
import { getTranslation, transliterateText } from './payslipTranslations.js';

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
    let sourceElem = document.getElementById('payslip-preview-content');
    let container = null;
    let targetElem = null;

    if (sourceElem) {
      // Use exact live preview element rendered on screen!
      targetElem = sourceElem;
    } else {
      // Build full-width offscreen replica matching EnhancedPayslipPreview
      const t = (key) => getTranslation(language, key);
      const tr = (text) => transliterateText(text, language);
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
        if (emp?.employee_number) return String(emp.employee_number);
        if (emp?.emp_number) return String(emp.emp_number);
        if (emp?.employee_code) return String(emp.employee_code);
        if (emp?.emp_id) return String(emp.emp_id);
        if (pay?.employee_code) return String(pay.employee_code);
        return 'EMP-001';
      };

      const empName = tr(employee?.name || payroll?.employee_name || '-');
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

      container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '800px';
      container.style.background = '#ffffff';
      container.style.color = '#000000';
      container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
      container.style.padding = '25px';
      container.style.boxSizing = 'border-box';

      let advanceRowsHtml = '';
      if (hasAdvance) {
        advanceRowsHtml = `
          <div style="margin-bottom: 16px;">
            <div style="background-color: #fef3c7; color: #451a03; border: 1px solid #fcd34d; border-bottom: 0; padding: 8px 12px; font-weight: bold; font-size: 13px; border-top-left-radius: 6px; border-top-right-radius: 6px;">
              ${t('advanceRecordsHeader')}
            </div>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #fcd34d; font-size: 12px;">
              <thead>
                <tr style="background-color: #fef3c7; color: #451a03; text-align: left;">
                  <th style="padding: 6px 10px; border-right: 1px solid #fcd34d; font-weight: bold;">${t('date')}</th>
                  <th style="padding: 6px 10px; border-right: 1px solid #fcd34d; font-weight: bold;">${t('reason')}</th>
                  <th style="padding: 6px 10px; text-align: right; font-weight: bold;">${t('amount')}</th>
                </tr>
              </thead>
              <tbody>
                ${advances.map(a => `
                  <tr style="border-top: 1px solid #fef08a;">
                    <td style="padding: 6px 10px; border-right: 1px solid #fef08a;">${a.date ? a.date.split('T')[0] : ''}</td>
                    <td style="padding: 6px 10px; border-right: 1px solid #fef08a; font-weight: 500;">${tr(a.reason || 'Advance')}</td>
                    <td style="padding: 6px 10px; text-align: right; font-weight: 600;">₹${(Number(a.amount) || 0).toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
                <tr style="background-color: #fef3c7; font-weight: bold; border-top: 1px solid #fcd34d;">
                  <td colSpan="2" style="padding: 6px 10px; border-right: 1px solid #fcd34d;">${t('totalAdvances')}</td>
                  <td style="padding: 6px 10px; text-align: right;">₹${advanceDeducted.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      }

      container.innerHTML = `
        <div style="text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #cbd5e1;">
          <div style="font-size: 22px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; color: #000000;">${compName}</div>
          <div style="font-size: 12px; color: #334155; margin-top: 2px;">${compAddress}</div>
          ${contactLine ? `<div style="font-size: 11px; color: #475569; margin-top: 1px;">${contactLine}</div>` : ''}
          <div style="font-size: 15px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-top: 8px; letter-spacing: 0.5px;">
            ${hasAdvance ? t('titleAdvancePayslip') : t('titlePayslip')} (${monthName})
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; border: 1px solid #cbd5e1;">
          <tbody>
            <tr>
              <td style="width: 25%; font-weight: 600; background-color: #f1f5f9; padding: 8px 10px; border: 1px solid #cbd5e1;">${t('empName')}</td>
              <td style="width: 25%; font-weight: 700; padding: 8px 10px; border: 1px solid #cbd5e1;">${empName}</td>
              <td style="width: 25%; font-weight: 600; background-color: #f1f5f9; padding: 8px 10px; border: 1px solid #cbd5e1;">${t('empId')}</td>
              <td style="width: 25%; font-weight: 700; font-family: monospace; padding: 8px 10px; border: 1px solid #cbd5e1;">${empId}</td>
            </tr>
            <tr>
              <td style="width: 25%; font-weight: 600; background-color: #f1f5f9; padding: 8px 10px; border: 1px solid #cbd5e1;">${t('designation')}</td>
              <td style="width: 25%; padding: 8px 10px; border: 1px solid #cbd5e1; text-transform: capitalize;">${designation}</td>
              <td style="width: 25%; font-weight: 600; background-color: #f1f5f9; padding: 8px 10px; border: 1px solid #cbd5e1;">${t('daysPresent')}</td>
              <td style="width: 25%; padding: 8px 10px; border: 1px solid #cbd5e1;">${daysPresent}</td>
            </tr>
            <tr>
              <td style="width: 25%; font-weight: 600; background-color: #f1f5f9; padding: 8px 10px; border: 1px solid #cbd5e1;">${t('paymentStatus')}</td>
              <td style="width: 25%; font-weight: 700; padding: 8px 10px; border: 1px solid #cbd5e1; text-transform: uppercase;">${paymentStatus}</td>
              <td style="width: 25%; font-weight: 600; background-color: #f1f5f9; padding: 8px 10px; border: 1px solid #cbd5e1;">${t('paymentModeDate')}</td>
              <td style="width: 25%; padding: 8px 10px; border: 1px solid #cbd5e1;">${paymentModeDate}</td>
            </tr>
          </tbody>
        </table>

        ${advanceRowsHtml}

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background-color: #f1f5f9; font-weight: 700; text-align: left;">
              <th style="width: 30%; padding: 8px 10px; border: 1px solid #cbd5e1;">${t('earningsDesc')}</th>
              <th style="width: 20%; padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right;">${t('amount')}</th>
              <th style="width: 30%; padding: 8px 10px; border: 1px solid #cbd5e1;">${t('deductionsDesc')}</th>
              <th style="width: 20%; padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right;">${t('amount')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">${t('basicSalary')}</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace;">₹${basicSalary.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">${t('absentDeduction')}</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace;">₹${absentDeduction.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
            </tr>
            <tr>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">${t('tripBonus')}</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; color: #047857;">₹${tripBonus.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">${t('advanceRecovery')}</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; color: #be123c;">₹${advanceDeducted.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
            </tr>
            <tr>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">${t('otherAllowances')}</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace;">₹0.00</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">${t('taxesLabel')}</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; color: #be123c;">₹${taxes.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
            </tr>
            <tr style="background-color: #f1f5f9; font-weight: 700;">
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">${t('grossSalary')}</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace;">₹${grossSalary.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">${t('totalDeductions')}</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace;">₹${totalDeductions.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
            </tr>
          </tbody>
        </table>

        <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
          <div style="background-color: #f8fafc; padding: 10px 14px; border-bottom: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #334155;">${t('netPayable')}</div>
              <div style="font-size: 10px; color: #64748b;">${t('netPaySubtext')}</div>
            </div>
            <div style="font-size: 20px; font-weight: 900; font-family: monospace; color: #000000;">
              ₹${netSalary.toLocaleString('en-IN', {minimumFractionDigits:2})}
            </div>
          </div>
          <div style="padding: 10px 14px; background-color: #ffffff; font-size: 11px; font-weight: 600; color: #1e293b;">
            ${t('amountInWords')} <span style="font-weight: 700; color: #000000;">${formatAmountToWords(netSalary)}</span>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 11px;">
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
      targetElem = container;
    }

    const canvas = await html2canvas(targetElem, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }

    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF({ format: 'a4', orientation: 'portrait', unit: 'mm' });
    
    // FULL A4 WIDTH: Fill 196mm width edge-to-edge till 7mm borders
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 7;
    const printWidth = pdfWidth - (margin * 2); // 196mm
    const printHeight = (canvas.height * printWidth) / canvas.width;
    
    if (printHeight <= (pdfHeight - (margin * 2))) {
      doc.addImage(imgData, 'PNG', margin, margin, printWidth, printHeight);
    } else {
      let heightLeft = printHeight;
      let position = margin;

      doc.addImage(imgData, 'PNG', margin, position, printWidth, printHeight);
      heightLeft -= (pdfHeight - (margin * 2));

      while (heightLeft > 0) {
        position = heightLeft - printHeight + margin;
        doc.addPage();
        doc.addImage(imgData, 'PNG', margin, position, printWidth, printHeight);
        heightLeft -= (pdfHeight - (margin * 2));
      }
    }

    return doc.output('blob');
  } catch (err) {
    console.error('PDF generation error:', err);
    throw err;
  }
};