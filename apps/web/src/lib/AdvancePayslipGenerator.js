import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import pb from './pocketbaseClient.js';

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

export const generateAdvancePayslipPDF = async (payroll, employee, advances = []) => {
  try {
    let companySettings = null;
    try {
      companySettings = await pb.collection('company_settings').getOne('companysettings', { $autoCancel: false });
    } catch(e) {}

    const compName = companySettings?.company_name || 'JAI BHAVANI CARGO';
    const compAddress = companySettings?.company_address || 'Plot No. 3, Patel Nagar, Ghatkesar, Medchal-Malkajgiri Dist., Telangana - 501301';
    const compPhone = companySettings?.company_phone || '7794072244';
    const compEmail = companySettings?.company_email || 'vinod@jaibhavanicargo.com';
    const compGstin = companySettings?.company_gstin || '36AAACJ2230M1Z2';

    const doc = new jsPDF({ format: 'a4', orientation: 'portrait' });
    const monthName = payroll ? format(new Date(payroll.payroll_year, payroll.payroll_month - 1), 'MMMM yyyy') : 'Current';
    const hasAdvance = advances.length > 0;
    
    const primaryColor = [15, 23, 42]; // Slate 900
    const accentColor = [71, 85, 105]; // Slate 600
    
    const getCleanEmpId = (emp, pay) => {
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

    // 1. Company Header
    doc.setFontSize(18);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text(compName.toUpperCase(), 105, 18, { align: 'center' });
    
    doc.setFontSize(8.5);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...accentColor);
    doc.text(compAddress, 105, 23, { align: 'center' });

    const contactLine = [
      compPhone ? `Ph: ${compPhone}` : null,
      compEmail ? `Email: ${compEmail}` : null,
      compGstin ? `GSTIN: ${compGstin}` : null
    ].filter(Boolean).join(' | ');

    if (contactLine) {
      doc.text(contactLine, 105, 27.5, { align: 'center' });
    }

    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text(`${hasAdvance ? 'ADVANCE & PAYSLIP' : 'PAYSLIP'} FOR ${monthName.toUpperCase()}`, 105, 34, { align: 'center' });

    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.line(14, 37, 196, 37);

    // 2. Employee Details Grid
    const empName = employee?.name || payroll?.employee_name || '-';
    const empId = getCleanEmpId(employee, payroll);
    const designation = employee?.position || employee?.employee_type || payroll?.designation || '-';
    const daysPresent = `${payroll ? `${payroll.attendance_days || 0} days` : '30 days'} / ${monthName}`;
    const paymentStatus = (payroll?.payment_status || payroll?.status || 'Pending').toUpperCase();
    const paymentModeDate = `${payroll?.payment_mode || 'Bank Transfer'} / ${payroll?.payment_date ? format(new Date(payroll.payment_date), 'dd MMM yyyy') : '-'}`;

    autoTable(doc, {
      startY: 40,
      head: [],
      body: [
        [
          { content: 'Employee Name:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: empName, styles: { fontStyle: 'bold' } },
          { content: 'Employee ID:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: empId, styles: { fontStyle: 'bold' } }
        ],
        [
          { content: 'Designation:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: designation },
          { content: 'Days Present / Period:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: daysPresent }
        ],
        [
          { content: 'Payment Status:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: paymentStatus, styles: { fontStyle: 'bold' } },
          { content: 'Payment Mode / Date:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: paymentModeDate }
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 8.5, cellPadding: 2.5, textColor: [15, 23, 42], borderColor: [203, 213, 225] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 53 },
        2: { cellWidth: 42 },
        3: { cellWidth: 47 }
      }
    });

    let currentY = doc.lastAutoTable.finalY + 5;

    // 3. Advance Details Box (if advances exist)
    if (hasAdvance) {
      doc.setFillColor(254, 243, 199); // Amber 100
      doc.rect(14, currentY, 182, 6, 'F');
      doc.setFontSize(8.5);
      doc.setTextColor(69, 26, 3); // Amber 950
      doc.setFont(undefined, 'bold');
      doc.text('Advance Payment Record', 17, currentY + 4.2);

      const advRows = advances.map(a => [
        a.date ? format(new Date(a.date), 'dd MMM yyyy') : '-',
        a.reason || 'Advance',
        `Rs. ${(a.amount || 0).toLocaleString('en-IN')}`
      ]);

      const totalAdv = advances.reduce((s, a) => s + (a.amount || 0), 0);
      advRows.push([
        { content: 'Total Advance Balance', colSpan: 2, styles: { fontStyle: 'bold' } },
        { content: `Rs. ${totalAdv.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', halign: 'right' } }
      ]);

      autoTable(doc, {
        startY: currentY + 6,
        head: [['Date', 'Reason', 'Amount']],
        body: advRows,
        theme: 'grid',
        headStyles: { fillColor: [255, 251, 235], textColor: [69, 26, 3], fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2, borderColor: [252, 211, 77] },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 107 },
          2: { cellWidth: 40, halign: 'right' }
        }
      });

      currentY = doc.lastAutoTable.finalY + 5;
    }

    // 4. Financial Table (Earnings vs Deductions)
    const basicSalary = payroll?.total_salary || payroll?.base_salary || employee?.salary_amount || employee?.base_salary || 0;
    const tripBonus = payroll?.trip_bonus || 0;
    const grossSalary = payroll?.gross_salary || (basicSalary + tripBonus);

    const advanceDeducted = (!payroll ? advances : advances.filter(a => a.status === 'Deducted')).reduce((sum, a) => sum + a.amount, 0) || payroll?.driver_advances || 0;
    const absentDeduction = payroll?.attendance_deduction || 0;
    const taxes = payroll?.taxes || 0;
    const totalDeductions = payroll ? ((payroll.gross_salary || 0) - (payroll.net_salary || 0)) : (advanceDeducted + absentDeduction + taxes);
    const netSalary = payroll ? (payroll.net_salary || 0) : (grossSalary - totalDeductions);

    let otherAllowancesStr = 'Other Allowances';
    let otherAllowancesAmt = 0;
    if (payroll?.allowances_breakdown) {
      const entries = Object.entries(payroll.allowances_breakdown).filter(([_, v]) => Number(v) > 0);
      if (entries.length > 0) {
        otherAllowancesStr = entries.map(([k]) => k.replace(/_/g, ' ')).join(', ');
        otherAllowancesAmt = entries.reduce((s, [_, v]) => s + Number(v), 0);
      }
    }

    autoTable(doc, {
      startY: currentY,
      head: [['Earnings Description', 'Amount (Rs.)', 'Deductions Description', 'Amount (Rs.)']],
      body: [
        ['Basic Salary', basicSalary.toLocaleString('en-IN', {minimumFractionDigits:2}), 'Absent Deduction', absentDeduction.toLocaleString('en-IN', {minimumFractionDigits:2})],
        ['Trip Bonus / Allowances', tripBonus.toLocaleString('en-IN', {minimumFractionDigits:2}), 'Advance Recovery', advanceDeducted.toLocaleString('en-IN', {minimumFractionDigits:2})],
        [otherAllowancesStr, otherAllowancesAmt.toLocaleString('en-IN', {minimumFractionDigits:2}), 'Taxes (TDS / Other)', taxes.toLocaleString('en-IN', {minimumFractionDigits:2})],
        [
          { content: 'Total Gross Earnings', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: grossSalary.toLocaleString('en-IN', {minimumFractionDigits:2}), styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: 'Total Deductions', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: totalDeductions.toLocaleString('en-IN', {minimumFractionDigits:2}), styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [241, 245, 249], textColor: primaryColor, fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8.5, cellPadding: 2.5, borderColor: [203, 213, 225], textColor: [15, 23, 42] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 41, halign: 'right' },
        2: { cellWidth: 50 },
        3: { cellWidth: 41, halign: 'right' }
      }
    });

    currentY = doc.lastAutoTable.finalY + 5;

    // 5. Net Salary Payable Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, currentY, 182, 16, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setTextColor(...accentColor);
    doc.setFont(undefined, 'bold');
    doc.text('NET SALARY PAYABLE (NET PAY)', 18, currentY + 6);
    doc.setFont(undefined, 'normal');
    doc.text('Gross Earnings - Total Deductions', 18, 10.5 + currentY);

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text(`Rs. ${netSalary.toLocaleString('en-IN', {minimumFractionDigits:2})}`, 190, currentY + 8, { align: 'right' });

    doc.setFontSize(7.5);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(`Net Pay in Words: ${formatAmountToWords(netSalary)}`, 18, currentY + 14.5);

    currentY += 24;

    // 6. Signatures Block
    doc.setDrawColor(203, 213, 225);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(14, currentY, 196, currentY);
    doc.setLineDashPattern([], 0);

    const sigY = currentY + 14;
    doc.setDrawColor(148, 163, 184);
    doc.line(25, sigY, 75, sigY);
    doc.setFontSize(8.5);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Authorized Signatory', 50, sigY + 5, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...accentColor);
    doc.text(compName, 50, sigY + 9, { align: 'center' });

    doc.line(135, sigY, 185, sigY);
    doc.setFontSize(8.5);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Employee Signature', 160, sigY + 5, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...accentColor);
    doc.text(empName, 160, sigY + 9, { align: 'center' });

    return doc.output('blob');
  } catch (error) {
    console.error('Error generating advance payslip PDF:', error);
    throw error;
  }
};