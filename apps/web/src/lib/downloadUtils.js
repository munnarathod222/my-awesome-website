import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import pb from './pocketbaseClient.js';

let companySettingsCache = null;
let cachedLogoBase64 = null;
let cachedSignatureBase64 = null;

const loadImageBase64 = (url) => {
  return new Promise((resolve) => {
    try {
      const img = document.createElement('img');
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 100;
          canvas.height = img.height || 100;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (e) {
          resolve(url);
        }
      };
      img.onerror = () => resolve(url);
      img.src = url;
    } catch (err) {
      resolve(url);
    }
  });
};

export const fetchCompanySettings = async () => {
  try {
    const record = await pb.collection('company_settings').getOne('companysettings', { $autoCancel: false });
    companySettingsCache = record;
    if (record && record.company_logo) {
      const logoUrl = pb.files.getUrl(record, record.company_logo);
      cachedLogoBase64 = await loadImageBase64(logoUrl).catch(() => null);
    } else {
      cachedLogoBase64 = null;
    }

    if (record && record.e_signature) {
      const sigUrl = pb.files.getUrl(record, record.e_signature);
      cachedSignatureBase64 = await loadImageBase64(sigUrl).catch(() => null);
    } else {
      const localSig = localStorage.getItem('jbc_e_signature');
      cachedSignatureBase64 = localSig || null;
    }

    return record;
  } catch (error) {
    console.error('Failed to pre-fetch company settings:', error);
    return null;
  }
};

export const getCachedSignatureBase64 = () => cachedSignatureBase64 || localStorage.getItem('jbc_e_signature');

// Initial load
fetchCompanySettings().catch(() => {});

/**
 * Creates a blob URL, triggers download, and cleans up resources.
 */
export const downloadFile = (blob, filename) => {
  try {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download file');
  }
};

/**
 * Generates a PDF document using jsPDF and jspdf-autotable with Company Settings integration.
 */
export const generatePDF = (data, filename, options = {}) => {
  try {
    const doc = new jsPDF();
    const { 
      type = 'generic',
      invoiceObj = null,
      quoteObj = null,
      title = 'Report', 
      columns = [], 
      totals = null,
      companyInfo = companySettingsCache?.company_name || 'Jai Bhavani Cargo'
    } = options;

    const parseDateSafe = (dStr) => {
      if (!dStr) return null;
      if (dStr instanceof Date) return isNaN(dStr.getTime()) ? null : dStr;
      if (typeof dStr === 'number') return new Date(dStr);
      if (typeof dStr === 'string') {
        const trimmed = dStr.trim();
        if (!trimmed) return null;
        const normalized = trimmed.includes(' ') && !trimmed.includes('T') ? trimmed.replace(' ', 'T') : trimmed;
        const dObj = new Date(normalized);
        return isNaN(dObj.getTime()) ? null : dObj;
      }
      return null;
    };

    // ---------------------------------------------------------
    // 1. INVOICE & PAYMENT REQUEST PDF GENERATOR
    // ---------------------------------------------------------
    if ((type === 'invoice' || type === 'payment_request') && invoiceObj) {
      const inv = invoiceObj;
      const isPaymentReq = type === 'payment_request' || inv.invoice_number?.startsWith('REQ-') || inv.invoice_number?.startsWith('PR-');

      const primaryNavy = [15, 23, 42];    // Deep Slate Navy (#0F172A)
      const accentGold = [217, 119, 6];    // Amber Gold (#D97706)
      const secondaryGray = [71, 85, 105];  // Slate 600 (#475569)
      const lightBgColor = [248, 250, 252]; // Slate 50 (#F8FAFC)
      const borderColor = [226, 232, 240];  // Slate 200 (#E2E8F0)

      // Top Dual Colored Banners
      doc.setFillColor(...primaryNavy);
      doc.rect(0, 0, doc.internal.pageSize.width, 7, 'F');
      doc.setFillColor(...accentGold);
      doc.rect(0, 7, doc.internal.pageSize.width, 1.5, 'F');

      // Dynamic Company Info from Company Settings
      const cName = companySettingsCache?.company_name || inv.company_name || 'JAI BHAVANI CARGO';
      const cAddress = companySettingsCache?.company_address || inv.company_address || 'Plot No. 3, Patel Nagar, Ghatkesar, Medchal-Malkajgiri Dist., Telangana - 501301';
      const cPhone = companySettingsCache?.company_phone || inv.company_phone || '+91 7794072244';
      const cEmail = companySettingsCache?.company_email || inv.company_email || 'vinod@jaibhavanicargo.com';
      const cWebsite = companySettingsCache?.company_website || 'www.jaibhavanicargo.com';
      const cGstin = companySettingsCache?.company_gstin || '36DPXPR9171A1Z8';

      // Draw Company Logo or Name Header
      if (cachedLogoBase64) {
        doc.addImage(cachedLogoBase64, 'PNG', 14, 12, 28, 14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...primaryNavy);
        doc.text(cName, 46, 19);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...secondaryGray);
        doc.text(cAddress, 46, 24, { maxWidth: 85 });
        doc.text(`Phone: ${cPhone} | Email: ${cEmail} | GSTIN: ${cGstin}`, 46, 31);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(...primaryNavy);
        doc.text(cName, 14, 21);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...secondaryGray);
        doc.text(cAddress, 14, 26, { maxWidth: 110 });
        doc.text(`Phone: ${cPhone} | Email: ${cEmail} | GSTIN: ${cGstin}`, 14, 31);
      }

      // Document Type Header Label (Top Right)
      const docLabel = isPaymentReq ? 'PAYMENT REQUEST & DEMAND NOTE' : 'TAX INVOICE';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...primaryNavy);
      doc.text(docLabel, doc.internal.pageSize.width - 14, 20, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...secondaryGray);
      doc.text(`${isPaymentReq ? 'Req No' : 'Invoice No'}: ${inv.invoice_number || inv.request_number || 'INV-001'}`, doc.internal.pageSize.width - 14, 26, { align: 'right' });

      const invDateObj = parseDateSafe(inv.invoice_date || inv.request_date || inv.date) || new Date();
      const dueDateObj = parseDateSafe(inv.due_date) || new Date(invDateObj.getTime() + 7 * 24 * 60 * 60 * 1000);
      const invDate = invDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const dueDate = dueDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      
      doc.text(`Date: ${invDate}`, doc.internal.pageSize.width - 14, 31, { align: 'right' });
      doc.text(`Due Date: ${dueDate}`, doc.internal.pageSize.width - 14, 36, { align: 'right' });

      // Horizontal Divider
      doc.setDrawColor(...borderColor);
      doc.line(14, 41, doc.internal.pageSize.width - 14, 41);

      // Bill To Box (Customer Info)
      doc.setFillColor(...lightBgColor);
      doc.roundedRect(14, 45, doc.internal.pageSize.width / 2 - 18, 30, 2, 2, 'F');
      doc.setDrawColor(...borderColor);
      doc.roundedRect(14, 45, doc.internal.pageSize.width / 2 - 18, 30, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...accentGold);
      doc.text('BILLED TO / CUSTOMER DETAILS:', 18, 51);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(inv.customer_name || 'Valued Client', 18, 57);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...secondaryGray);
      const custAddr = inv.customer_address || 'Registered Business Location';
      const custPhone = inv.customer_phone ? `Phone: ${inv.customer_phone}` : '';
      const custEmail = inv.customer_email ? `Email: ${inv.customer_email}` : '';
      doc.text(custAddr, 18, 62, { maxWidth: doc.internal.pageSize.width / 2 - 26 });
      doc.text(`${custPhone} ${custPhone && custEmail ? '| ' : ''}${custEmail}`, 18, 70);

      // Payment Summary Box (Right Side)
      doc.setFillColor(...lightBgColor);
      doc.roundedRect(doc.internal.pageSize.width / 2 + 4, 45, doc.internal.pageSize.width / 2 - 18, 30, 2, 2, 'F');
      doc.setDrawColor(...borderColor);
      doc.roundedRect(doc.internal.pageSize.width / 2 + 4, 45, doc.internal.pageSize.width / 2 - 18, 30, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...accentGold);
      doc.text('PAYMENT & STATUS SUMMARY:', doc.internal.pageSize.width / 2 + 8, 51);

      const statusText = (inv.status || 'Pending').toUpperCase();
      let statusColor = [217, 119, 6]; // Amber
      if (statusText === 'PAID') statusColor = [16, 185, 129]; // Emerald
      else if (statusText === 'OVERDUE') statusColor = [225, 29, 72]; // Rose Red

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...secondaryGray);
      doc.text('Payment Status: ', doc.internal.pageSize.width / 2 + 8, 57);
      doc.setTextColor(...statusColor);
      doc.text(statusText, doc.internal.pageSize.width / 2 + 36, 57);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...secondaryGray);
      doc.text('Payment Terms: Credit Account / Net 30', doc.internal.pageSize.width / 2 + 8, 65);

      // Line Items Table
      const tableData = data.map(row => columns.map(col => {
        const val = row[col.key];
        return val !== undefined && val !== null ? String(val) : '';
      }));

      autoTable(doc, {
        startY: 80,
        head: [columns.map(c => c.header)],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: primaryNavy, textColor: 255, fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 8.5, cellPadding: 4, font: 'helvetica' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          [columns.length - 1]: { halign: 'right', fontStyle: 'bold' }
        }
      });

      let finalY = doc.lastAutoTable.finalY + 8;

      if (finalY > doc.internal.pageSize.height - 85) {
        doc.addPage();
        finalY = 20;
      }

      // Subtotal and Total Cards (Right Side)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...secondaryGray);
      doc.text('Subtotal Amount:', doc.internal.pageSize.width - 70, finalY, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      doc.text(`₹${Number(inv.subtotal || inv.total_amount || 0).toLocaleString('en-IN')}`, doc.internal.pageSize.width - 14, finalY, { align: 'right' });

      if (inv.tax_amount && inv.tax_amount > 0) {
        finalY += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...secondaryGray);
        doc.text(`GST / Tax (${inv.tax_rate || 18}%):`, doc.internal.pageSize.width - 70, finalY, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        doc.text(`₹${Number(inv.tax_amount || 0).toLocaleString('en-IN')}`, doc.internal.pageSize.width - 14, finalY, { align: 'right' });
      }

      finalY += 7;
      const amountStr = `₹${Number(inv.total_amount || 0).toLocaleString('en-IN')}`;
      const boxWidth = 82;
      const boxX = doc.internal.pageSize.width - 14 - boxWidth;

      doc.setFillColor(...primaryNavy);
      doc.roundedRect(boxX, finalY - 5, boxWidth, 9, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text('TOTAL AMOUNT DUE:', boxX + 4, finalY + 1, { align: 'left' });
      doc.text(amountStr, doc.internal.pageSize.width - 18, finalY + 1, { align: 'right' });

      // Bank Details (From Company Settings) - Bottom Left
      let bankY = finalY - (inv.tax_amount && inv.tax_amount > 0 ? 12 : 5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...primaryNavy);
      doc.text('BANK DETAILS:', 14, bankY);

      const bName = companySettingsCache?.bank_name || 'HDFC BANK';
      const bAccName = (companySettingsCache?.account_name || companySettingsCache?.company_name || 'JAI BHAVANI CARGO').toUpperCase();
      const bAccNo = companySettingsCache?.account_number || '50200117182677';
      const bIfsc = companySettingsCache?.ifsc_code || 'HDFC0004480';
      const bBranch = companySettingsCache?.branch_name || 'GHATKESAR BRANCH';

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...secondaryGray);
      doc.text(`Bank Name: ${bName}`, 14, bankY + 5);
      doc.text(`Account Name: ${bAccName}`, 14, bankY + 9);
      doc.text(`Account No: ${bAccNo}`, 14, bankY + 13);
      doc.text(`IFSC Code: ${bIfsc}`, 14, bankY + 17);
      doc.text(`Branch / UPI: ${bBranch}`, 14, bankY + 21);

      // Terms & Signature Footer
      let footerY = bankY + 30;
      if (footerY > doc.internal.pageSize.height - 35) {
        doc.addPage();
        footerY = 25;
      }

      doc.setDrawColor(...borderColor);
      doc.line(14, footerY, doc.internal.pageSize.width - 14, footerY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryNavy);
      doc.text('Terms & Conditions:', 14, footerY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...secondaryGray);
      doc.text('1. Payment is due as per agreed credit terms.\n2. Interest @ 18% p.a. will apply to overdue balances.\n3. All disputes subject to Hyderabad jurisdiction.', 14, footerY + 9);

      // Authorized Signatory (From Company Settings)
      const sigName = companySettingsCache?.signatory_name || localStorage.getItem('jbc_signatory_name') || 'Vinod Rathod';
      const sigTitle = companySettingsCache?.signatory_title || localStorage.getItem('jbc_signatory_title') || 'Authorized Signatory';

      if (cachedSignatureBase64) {
        try {
          doc.addImage(cachedSignatureBase64, 'PNG', doc.internal.pageSize.width - 55, footerY + 2, 35, 12);
        } catch (e) {}
      }

      doc.line(doc.internal.pageSize.width - 65, footerY + 16, doc.internal.pageSize.width - 14, footerY + 16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(`For ${cName}`, doc.internal.pageSize.width - 14, footerY + 20, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...secondaryGray);
      doc.text(`${sigName} (${sigTitle})`, doc.internal.pageSize.width - 14, footerY + 24, { align: 'right' });
    }

    // ---------------------------------------------------------
    // 2. FREIGHT QUOTE PDF GENERATOR
    // ---------------------------------------------------------
    else if (type === 'quote' && quoteObj) {
      const q = quoteObj;
      const primaryNavy = [15, 23, 42];
      const accentGold = [217, 119, 6];
      const secondaryGray = [71, 85, 105];
      const borderColor = [226, 232, 240];

      doc.setFillColor(...primaryNavy);
      doc.rect(0, 0, doc.internal.pageSize.width, 7, 'F');
      doc.setFillColor(...accentGold);
      doc.rect(0, 7, doc.internal.pageSize.width, 1.5, 'F');

      const cNameQuote = companySettingsCache?.company_name || 'JAI BHAVANI CARGO';
      const cAddressQuote = companySettingsCache?.company_address || 'Plot No 3, Patel Nagar, Ghatkesar';
      const cPhoneQuote = companySettingsCache?.company_phone || '+91 7794072244';
      const cEmailQuote = companySettingsCache?.company_email || 'vinod@jaibhavanicargo.com';

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...primaryNavy);
      doc.text(cNameQuote, 14, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...secondaryGray);
      doc.text(cAddressQuote, 14, 25);
      doc.text(`Phone: ${cPhoneQuote} | Email: ${cEmailQuote}`, 14, 29);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...primaryNavy);
      doc.text('FREIGHT QUOTATION', doc.internal.pageSize.width - 14, 20, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...secondaryGray);
      doc.text(`Quote No: ${q.quote_number}`, doc.internal.pageSize.width - 14, 26, { align: 'right' });

      // Table Data
      const tableData = data.map(row => columns.map(col => String(row[col.key] || '')));
      autoTable(doc, {
        startY: 50,
        head: [columns.map(c => c.header)],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: primaryNavy, textColor: 255, fontStyle: 'bold', fontSize: 9 }
      });
    }

    // ---------------------------------------------------------
    // 3. GENERIC / REPORT PDF GENERATOR
    // ---------------------------------------------------------
    else {
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text(companyInfo, 14, 15);
      
      doc.setFontSize(12);
      doc.setTextColor(71, 85, 105);
      doc.text(title, 14, 23);

      const tableData = data.map(row => columns.map(col => String(row[col.key] || '')));
      if (totals) {
        tableData.push(columns.map(col => totals[col.key] ? String(totals[col.key]) : ''));
      }

      autoTable(doc, {
        startY: 30,
        head: [columns.map(c => c.header)],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: 255 }
      });
    }

    // Page Number Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${i} of ${pageCount} — Jai Bhavani Cargo Enterprise System (Official Document)`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 8,
        { align: 'center' }
      );
    }

    return doc.output('blob');
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};

/**
 * Generates an Excel workbook from data using xlsx.
 */
export const generateExcel = (data, filename, sheetName = 'Sheet1') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    if (data.length > 0) {
      const cols = Object.keys(data[0]).map(key => ({ wch: Math.max(key.length + 5, 15) }));
      worksheet['!cols'] = cols;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  } catch (error) {
    console.error('Excel generation failed:', error);
    throw new Error('Failed to generate Excel');
  }
};