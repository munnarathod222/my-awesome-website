import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const generateAdvancePayslipPDF = async (payroll, employee, advances = []) => {
  try {
    const doc = new jsPDF({ format: 'a4', orientation: 'portrait' });
    const monthName = payroll ? format(new Date(payroll.payroll_year, payroll.payroll_month - 1), 'MMMM yyyy') : 'Current';
    const hasAdvance = advances.length > 0;
    const primaryColor = [55, 65, 81]; // Slate 700
    const accentColor = [100, 116, 139]; // Slate 500
    const successColor = [16, 185, 129]; // Emerald 500
    const dangerColor = [239, 68, 68]; // Red 500
    
    // --- PAGE 1: Header & Employee Info ---
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text('JAI BHAVANI CARGO', 14, 25);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...accentColor);
    doc.text('123 Transport Nagar, Logistics Hub', 14, 32);
    doc.text('Mumbai, Maharashtra 400001', 14, 37);
    doc.text('GSTIN: 27AADCB2230M1Z2', 14, 42);

    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text(hasAdvance ? 'ADVANCE & PAYSLIP' : 'PAYSLIP', 196, 25, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Issue Date: ${format(new Date(), 'dd MMM yyyy')}`, 196, 32, { align: 'right' });
    doc.text(`Doc Ref: JB-PAY-${payroll?.id?.substring(0,6) || 'DRFT'}`, 196, 37, { align: 'right' });

    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(14, 48, 196, 48);

    // Employee Info Section
    doc.autoTable({
      startY: 55,
      head: [['Employee Details', '']],
      body: [
        ['Name', employee?.name || payroll?.employee_name || 'N/A'],
        ['Employee ID', (employee?.id || payroll?.employee_id || '').substring(0, 8)],
        ['Designation', employee?.position || employee?.employee_type || payroll?.designation || 'N/A'],
        ['Department', 'Operations / Logistics'],
        ['Manager', 'System Administrator']
      ],
      theme: 'plain',
      headStyles: { fillColor: [241, 245, 249], textColor: primaryColor, fontStyle: 'bold' },
      styles: { cellPadding: 3, fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold', textColor: accentColor, cellWidth: 50 }, 1: { textColor: primaryColor } }
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // Advance Details Box (if applicable)
    if (hasAdvance) {
      doc.setDrawColor(245, 158, 11); // Amber
      doc.setFillColor(254, 252, 232); // Amber 50
      doc.roundedRect(14, currentY, 182, 45, 3, 3, 'FD');
      
      doc.setFontSize(12);
      doc.setTextColor(180, 83, 9); // Amber 600
      doc.setFont(undefined, 'bold');
      doc.text('Advance Payment Record', 20, currentY + 10);
      
      const totalAdvance = advances.reduce((sum, a) => sum + (a.amount || 0), 0);
      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59);
      doc.text(`Rs. ${totalAdvance.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 20, currentY + 22);
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(...accentColor);
      doc.text(`Count: ${advances.length} advance(s) recorded in this period.`, 20, currentY + 30);
      
      // Advance specifics
      const latestAdv = advances[0];
      doc.text(`Latest Reason: ${latestAdv.reason || 'N/A'}`, 100, currentY + 10);
      doc.text(`Latest Date: ${latestAdv.date ? format(new Date(latestAdv.date), 'dd MMM yyyy') : 'N/A'}`, 100, currentY + 18);
      doc.text(`Status: ${latestAdv.status}`, 100, currentY + 26);
      
      currentY += 55;
    }

    // --- PAGE 2: Payroll Period & Attendance ---
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text('Payroll Period & Attendance', 14, 25);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 30, 196, 30);

    doc.autoTable({
      startY: 35,
      head: [['Period Details', '']],
      body: [
        ['Month / Year', monthName],
        ['Payment Status', (payroll?.payment_status || 'Pending').toUpperCase()],
        ['Payment Mode', payroll?.payment_mode || 'Bank Transfer'],
        ['Payment Date', payroll?.payment_date ? format(new Date(payroll?.payment_date), 'dd MMM yyyy') : 'Pending']
      ],
      theme: 'plain',
      headStyles: { fillColor: [241, 245, 249], textColor: primaryColor, fontStyle: 'bold' },
      styles: { cellPadding: 3, fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold', textColor: accentColor, cellWidth: 50 }, 1: { textColor: primaryColor } },
      margin: { right: 110 }
    });

    doc.autoTable({
      startY: 35,
      head: [['Attendance Summary', '']],
      body: [
        ['Total Working Days', '30'],
        ['Days Present', `${payroll?.attendance_days || 0}`],
        ['Days Absent', `${30 - (payroll?.attendance_days || 0)}`],
        ['Attendance %', `${((payroll?.attendance_days || 0) / 30 * 100).toFixed(1)}%`]
      ],
      theme: 'plain',
      headStyles: { fillColor: [241, 245, 249], textColor: primaryColor, fontStyle: 'bold' },
      styles: { cellPadding: 3, fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold', textColor: accentColor, cellWidth: 50 }, 1: { textColor: primaryColor } },
      margin: { left: 110 }
    });

    currentY = Math.max(doc.lastAutoTable.finalY, 80) + 15;

    // --- PAGE 3: Salary Breakdown ---
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text('Salary Breakdown', 14, 25);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 30, 196, 30);

    // Earnings
    const earningsBody = [
      ['Basic Salary', (payroll?.total_salary || payroll?.base_salary || 0).toLocaleString('en-IN', {minimumFractionDigits:2})]
    ];
    if (payroll?.allowances_breakdown) {
      Object.entries(payroll.allowances_breakdown).forEach(([k, v]) => {
        if (Number(v) > 0) earningsBody.push([k.replace(/_/g, ' ').toUpperCase(), Number(v).toLocaleString('en-IN', {minimumFractionDigits:2})]);
      });
    }
    if (payroll?.trip_bonus > 0) earningsBody.push(['Trip Bonus', payroll.trip_bonus.toLocaleString('en-IN', {minimumFractionDigits:2})]);
    
    earningsBody.push(['Total Gross Earnings', (payroll?.gross_salary || 0).toLocaleString('en-IN', {minimumFractionDigits:2})]);

    doc.autoTable({
      startY: 35,
      head: [['Earnings Description', 'Amount (Rs.)']],
      body: earningsBody,
      theme: 'grid',
      headStyles: { fillColor: [241, 245, 249], textColor: primaryColor },
      footStyles: { fillColor: [241, 245, 249], textColor: primaryColor, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      columnStyles: { 1: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.row.index === earningsBody.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [248, 250, 252];
        }
      }
    });

    const earningsY = doc.lastAutoTable.finalY + 10;

    // Deductions
    const deductionsBody = [];
    if (payroll?.attendance_deduction > 0) deductionsBody.push(['Absent Deduction', payroll.attendance_deduction.toLocaleString('en-IN', {minimumFractionDigits:2})]);
    if (payroll?.taxes > 0) deductionsBody.push(['Taxes / TDS', payroll.taxes.toLocaleString('en-IN', {minimumFractionDigits:2})]);
    
    if (payroll?.deductions_breakdown) {
      Object.entries(payroll.deductions_breakdown).forEach(([k, v]) => {
        if (Number(v) > 0 && k !== 'advance_deduction') {
          deductionsBody.push([k.replace(/_/g, ' ').toUpperCase(), Number(v).toLocaleString('en-IN', {minimumFractionDigits:2})]);
        }
      });
    }
    
    const advanceDeducted = advances.filter(a => a.status === 'Deducted').reduce((sum, a) => sum + a.amount, 0) || payroll?.driver_advances || 0;
    if (advanceDeducted > 0) {
      deductionsBody.push(['Advance Recovery', advanceDeducted.toLocaleString('en-IN', {minimumFractionDigits:2})]);
    }
    
    if (deductionsBody.length === 0) deductionsBody.push(['No Deductions', '0.00']);
    
    const totalDeds = ((payroll?.gross_salary || 0) - (payroll?.net_salary || 0));
    deductionsBody.push(['Total Deductions', totalDeds.toLocaleString('en-IN', {minimumFractionDigits:2})]);

    doc.autoTable({
      startY: earningsY,
      head: [['Deductions Description', 'Amount (Rs.)']],
      body: deductionsBody,
      theme: 'grid',
      headStyles: { fillColor: [241, 245, 249], textColor: primaryColor },
      styles: { fontSize: 9 },
      columnStyles: { 1: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.cell.text[0] === 'Advance Recovery') {
          data.cell.styles.textColor = dangerColor;
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.row.index === deductionsBody.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [254, 242, 242]; // Red 50
          data.cell.styles.textColor = dangerColor;
        }
      }
    });

    // --- PAGE 4: Summary & Signatures ---
    doc.addPage();
    
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text('Salary Summary', 14, 25);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 30, 196, 30);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 40, 182, 40, 3, 3, 'F');
    
    doc.setFontSize(11);
    doc.setTextColor(...accentColor);
    doc.text('Gross Earnings:', 20, 52);
    doc.text('Total Deductions:', 20, 62);
    
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(`Rs. ${(payroll?.gross_salary || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}`, 80, 52);
    doc.setTextColor(...dangerColor);
    doc.text(`- Rs. ${totalDeds.toLocaleString('en-IN', {minimumFractionDigits:2})}`, 80, 62);
    
    doc.setDrawColor(203, 213, 225);
    doc.line(110, 45, 110, 75);

    doc.setFontSize(14);
    doc.setTextColor(...accentColor);
    doc.text('NET PAYABLE', 120, 55);
    doc.setFontSize(22);
    doc.setTextColor(...successColor);
    doc.text(`Rs. ${(payroll?.net_salary || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}`, 120, 68);

    // Recovery Schedule mock for context
    if (advanceDeducted > 0) {
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text('Advance Recovery Schedule', 14, 100);
      
      doc.autoTable({
        startY: 105,
        head: [['Month', 'Deducted Amount', 'Status']],
        body: [
          [monthName, `Rs. ${advanceDeducted.toLocaleString('en-IN', {minimumFractionDigits:2})}`, 'Deducted Current']
        ],
        theme: 'plain',
        headStyles: { fillColor: [241, 245, 249], textColor: primaryColor, fontStyle: 'bold' },
        styles: { fontSize: 9 }
      });
    }

    // Signatures
    const sigY = 220;
    doc.setDrawColor(148, 163, 184);
    doc.line(20, sigY, 70, sigY);
    doc.setFontSize(10);
    doc.setTextColor(...accentColor);
    doc.text('Authorized Signatory', 45, sigY + 6, { align: 'center' });
    
    doc.line(130, sigY, 180, sigY);
    doc.text('Employee Signature', 155, sigY + 6, { align: 'center' });

    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Generated by Jai Bhavani Cargo System • Page ${i} of ${pageCount} • This is a computer generated document.`,
        105, 285, { align: 'center' }
      );
    }

    return doc.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate Advance Payslip PDF');
  }
};