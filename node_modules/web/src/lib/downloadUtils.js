import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import pb from './pocketbaseClient.js';

let companySettingsCache = null;
let cachedLogoBase64 = null;

const loadImageBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = (err) => reject(err);
    img.src = url;
  });
};

export const fetchCompanySettings = async () => {
  try {
    const record = await pb.collection('company_settings').getOne('companysettings', { $autoCancel: false });
    companySettingsCache = record;
    if (record && record.company_logo) {
      const logoUrl = pb.files.getUrl(record, record.company_logo);
      cachedLogoBase64 = await loadImageBase64(logoUrl);
    } else {
      cachedLogoBase64 = null;
    }
    return record;
  } catch (error) {
    console.error('Failed to pre-fetch company settings:', error);
    return null;
  }
};

// Initial load
fetchCompanySettings().catch(() => {});

/**
 * Creates a blob URL, triggers download, and cleans up resources.
 * @param {Blob} blob - The file blob to download
 * @param {string} filename - The name of the file to save as
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
 * Generates a PDF document from data using jsPDF and jspdf-autotable.
 * @param {Array} data - Array of objects representing rows
 * @param {string} filename - The name of the file (without extension)
 * @param {Object} options - Configuration options (title, columns, companyInfo)
 * @returns {Blob} The generated PDF blob
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

    if (type === 'invoice' && invoiceObj) {
      const inv = invoiceObj;
      const primaryColor = [26, 54, 93]; // Deep Navy Blue
      const secondaryColor = [74, 85, 104]; // Slate Grey
      const borderColor = [226, 232, 240]; // Light Grey
      
      // Top colored bar
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, doc.internal.pageSize.width, 6, 'F');
      
      // Header: Company Name & Type (Dynamic Settings)
      const cName = companySettingsCache?.company_name || inv.company_name || 'JAI BHAVANI CARGO';
      const cAddress = companySettingsCache?.company_address || inv.company_address || 'Plot No. 12, Transport Nagar, Secunderabad';
      const cPhone = companySettingsCache?.company_phone || inv.company_phone || '+91 98765 43210';
      const cEmail = companySettingsCache?.company_email || inv.company_email || 'billing@jbcargo.com';
      const cContact = `Phone: ${cPhone} | Email: ${cEmail}`;
      const cGstin = companySettingsCache?.company_gstin;

      if (cachedLogoBase64) {
        doc.addImage(cachedLogoBase64, 'PNG', 14, 10, 24, 12);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(...primaryColor);
        doc.text(cName, 42, 18);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...secondaryColor);
        doc.text(cAddress, 42, 23);
        doc.text(cContact + (cGstin ? ` | GSTIN: ${cGstin}` : ''), 42, 27);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(...primaryColor);
        doc.text(cName, 14, 20);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...secondaryColor);
        doc.text(cAddress, 14, 26);
        doc.text(cContact + (cGstin ? ` | GSTIN: ${cGstin}` : ''), 14, 31);
      }
      
      // Document type label on the right
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(...primaryColor);
      doc.text('INVOICE', doc.internal.pageSize.width - 14, 22, { align: 'right' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      doc.text(`Invoice No: ${inv.invoice_number}`, doc.internal.pageSize.width - 14, 29, { align: 'right' });
      
      const invDate = inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
      const dueDate = inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
      doc.text(`Date: ${invDate}`, doc.internal.pageSize.width - 14, 35, { align: 'right' });
      doc.text(`Due Date: ${dueDate}`, doc.internal.pageSize.width - 14, 41, { align: 'right' });
      
      // Divider line
      doc.setDrawColor(...borderColor);
      doc.line(14, 47, doc.internal.pageSize.width - 14, 47);
      
      // Bill To & Payment Info columns
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text('BILL TO:', 14, 55);
      doc.text('INVOICE SUMMARY:', doc.internal.pageSize.width / 2 + 10, 55);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(inv.customer_name, 14, 61);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      const custAddress = inv.customer_address || 'Customer Address Details';
      const custEmail = inv.customer_email ? `Email: ${inv.customer_email}` : '';
      const custPhone = inv.customer_phone ? `Phone: ${inv.customer_phone}` : '';
      doc.text(custAddress, 14, 67, { maxWidth: doc.internal.pageSize.width / 2 - 20 });
      doc.text(`${custEmail} ${custEmail && custPhone ? '| ' : ''}${custPhone}`, 14, 73);
      
      // Right side metadata values
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      const statusText = (inv.status || 'Draft').toUpperCase();
      let statusColor = [243, 156, 18]; // Orange
      if (statusText === 'PAID') statusColor = [39, 174, 96]; // Green
      else if (statusText === 'OVERDUE') statusColor = [192, 57, 43]; // Red
      
      doc.setFont('helvetica', 'bold');
      doc.text('Status: ', doc.internal.pageSize.width / 2 + 10, 61);
      doc.setTextColor(...statusColor);
      doc.text(statusText, doc.internal.pageSize.width / 2 + 35, 61);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...secondaryColor);
      doc.text('Payment Terms: Net 30 Days', doc.internal.pageSize.width / 2 + 10, 67);
      doc.text('Currency: INR (Rs.)', doc.internal.pageSize.width / 2 + 10, 73);
      
      // Table data formatting
      const tableData = data.map(row => columns.map(col => {
        const val = row[col.key];
        return val !== undefined && val !== null ? String(val) : '';
      }));
      
      doc.autoTable({
        startY: 82,
        head: [columns.map(c => c.header)],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 10 },
        styles: { fontSize: 9, cellPadding: 4, font: 'helvetica' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right' }
        }
      });
      
      let finalY = doc.lastAutoTable.finalY + 10;
      
      // Prevent overflow onto new page for summary details
      if (finalY > doc.internal.pageSize.height - 75) {
        doc.addPage();
        finalY = 20;
      }
      
      // Draw subtotal and total on the right
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      doc.text('Subtotal:', doc.internal.pageSize.width - 60, finalY, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      doc.text(`₹${(inv.subtotal || inv.total_amount).toLocaleString('en-IN')}`, doc.internal.pageSize.width - 14, finalY, { align: 'right' });
      
      if (inv.tax_amount && inv.tax_amount > 0) {
        finalY += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...secondaryColor);
        doc.text(`GST / Taxes (${inv.tax_rate || 18}%):`, doc.internal.pageSize.width - 60, finalY, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        doc.text(`₹${inv.tax_amount.toLocaleString('en-IN')}`, doc.internal.pageSize.width - 14, finalY, { align: 'right' });
      }
      
      finalY += 8;
      doc.setFillColor(...borderColor);
      doc.rect(doc.internal.pageSize.width - 70, finalY - 5, 56, 9, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...primaryColor);
      doc.text('TOTAL DUE:', doc.internal.pageSize.width - 60, finalY, { align: 'right' });
      doc.text(`₹${inv.total_amount.toLocaleString('en-IN')}`, doc.internal.pageSize.width - 14, finalY, { align: 'right' });
      
      // Draw Bank Details on the left
      let bankY = finalY - (inv.tax_amount && inv.tax_amount > 0 ? 14 : 8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...primaryColor);
      doc.text('PAYMENT DETAILS:', 14, bankY);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...secondaryColor);
      doc.text('Bank Name: HDFC Bank', 14, bankY + 5);
      doc.text(`Account Name: ${(companySettingsCache?.company_name || 'JAI BHAVANI CARGO').toUpperCase()}`, 14, bankY + 9);
      doc.text('Account No: 50200087654321', 14, bankY + 13);
      doc.text('IFSC Code: HDFC0000123', 14, bankY + 17);
      doc.text('Branch: Transport Nagar, Secunderabad', 14, bankY + 21);
      
      // Terms / Signature line
      let footerY = bankY + 30;
      if (footerY > doc.internal.pageSize.height - 30) {
        doc.addPage();
        footerY = 30;
      }
      
      doc.setDrawColor(...borderColor);
      doc.line(14, footerY, doc.internal.pageSize.width - 14, footerY);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...primaryColor);
      doc.text('Terms & Conditions:', 14, footerY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...secondaryColor);
      doc.text('1. Payment is due within the stipulated due date.\n2. Interest @ 18% p.a. will be charged for delayed payment.\n3. All disputes are subject to Hyderabad jurisdiction.', 14, footerY + 10);
      
      // Signature
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.text('Authorized Signature', doc.internal.pageSize.width - 14, footerY + 22, { align: 'right' });
      doc.line(doc.internal.pageSize.width - 60, footerY + 17, doc.internal.pageSize.width - 14, footerY + 17);
    }
    else if (type === 'quote' && quoteObj) {
      const q = quoteObj;
      const primaryColor = [26, 54, 93]; // Deep Navy Blue
      const secondaryColor = [74, 85, 104]; // Slate Grey
      const borderColor = [226, 232, 240]; // Light Grey
      
      // Top colored bar
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, doc.internal.pageSize.width, 6, 'F');
      
      // Header: Company Name & Type (Dynamic Settings)
      const cNameQuote = companySettingsCache?.company_name || 'JAI BHAVANI CARGO';
      const cAddressQuote = companySettingsCache?.company_address || 'Plot No. 12, Transport Nagar, Secunderabad';
      const cPhoneQuote = companySettingsCache?.company_phone || '+91 98765 43210';
      const cEmailQuote = companySettingsCache?.company_email || 'quotes@jbcargo.com';
      const cContactQuote = `Phone: ${cPhoneQuote} | Email: ${cEmailQuote}`;
      const cGstinQuote = companySettingsCache?.company_gstin;

      if (cachedLogoBase64) {
        doc.addImage(cachedLogoBase64, 'PNG', 14, 10, 24, 12);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(...primaryColor);
        doc.text(cNameQuote, 42, 18);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...secondaryColor);
        doc.text(cAddressQuote, 42, 23);
        doc.text(cContactQuote + (cGstinQuote ? ` | GSTIN: ${cGstinQuote}` : ''), 42, 27);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(...primaryColor);
        doc.text(cNameQuote, 14, 20);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...secondaryColor);
        doc.text(cAddressQuote, 14, 26);
        doc.text(cContactQuote + (cGstinQuote ? ` | GSTIN: ${cGstinQuote}` : ''), 14, 31);
      }
      
      // Document label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(...primaryColor);
      doc.text('FREIGHT QUOTE', doc.internal.pageSize.width - 14, 22, { align: 'right' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      doc.text(`Quote No: ${q.quote_number}`, doc.internal.pageSize.width - 14, 29, { align: 'right' });
      
      const qDate = q.created ? new Date(q.created).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString();
      doc.text(`Date: ${qDate}`, doc.internal.pageSize.width - 14, 35, { align: 'right' });
      doc.text(`Valid Until: ${new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, doc.internal.pageSize.width - 14, 41, { align: 'right' });
      
      // Divider
      doc.setDrawColor(...borderColor);
      doc.line(14, 47, doc.internal.pageSize.width - 14, 47);
      
      // Customer Details & Cargo specifications Columns
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text('PREPARED FOR:', 14, 55);
      doc.text('CARGO SPECIFICATIONS:', doc.internal.pageSize.width / 2 + 10, 55);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(q.customer_name, 14, 61);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.text(`Email: ${q.customer_email}`, 14, 67);
      doc.text(`Phone: ${q.customer_phone || '-'}`, 14, 72);
      
      // Cargo specs details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.text(`Origin: ${q.origin}`, doc.internal.pageSize.width / 2 + 10, 61);
      doc.text(`Destination: ${q.destination}`, doc.internal.pageSize.width / 2 + 10, 66);
      doc.text(`Container Type: ${q.container_type}`, doc.internal.pageSize.width / 2 + 10, 71);
      doc.text(`Chargeable Weight: ${q.chargeable_weight} kg (Actual: ${q.actual_weight} kg)`, doc.internal.pageSize.width / 2 + 10, 76);
      
      // Table data formatting (Key-Value table)
      const tableData = data.map(row => columns.map(col => {
        const val = row[col.key];
        return val !== undefined && val !== null ? String(val) : '';
      }));
      
      doc.autoTable({
        startY: 82,
        head: [columns.map(c => c.header)],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 10 },
        styles: { fontSize: 9.5, cellPadding: 4.5, font: 'helvetica' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          1: { halign: 'right', fontStyle: 'bold' }
        }
      });
      
      let finalY = doc.lastAutoTable.finalY + 12;
      if (finalY > doc.internal.pageSize.height - 50) {
        doc.addPage();
        finalY = 25;
      }
      
      // Highlight final Total Price
      doc.setFillColor(...borderColor);
      doc.rect(doc.internal.pageSize.width - 80, finalY - 6, 66, 11, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(...primaryColor);
      doc.text('Estimated Total:', doc.internal.pageSize.width - 74, finalY + 1);
      doc.text(`₹${q.total_price.toLocaleString('en-IN')}`, doc.internal.pageSize.width - 18, finalY + 1, { align: 'right' });
      
      // Terms / Notes
      let footerY = finalY + 18;
      if (footerY > doc.internal.pageSize.height - 40) {
        doc.addPage();
        footerY = 30;
      }
      
      doc.setDrawColor(...borderColor);
      doc.line(14, footerY, doc.internal.pageSize.width - 14, footerY);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...primaryColor);
      doc.text('Terms & Notes:', 14, footerY + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...secondaryColor);
      const quoteNotes = q.notes || '1. Rates are subject to market conditions and space availability.\n2. Demurrage and detention charges are extra as applicable.\n3. Valid for 15 days from the date of issue.';
      doc.text(quoteNotes, 14, footerY + 11, { maxWidth: doc.internal.pageSize.width - 28 });
      
      // Signature
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.text(`Prepared By: ${companySettingsCache?.company_name || 'JAI BHAVANI CARGO'}`, doc.internal.pageSize.width - 14, footerY + 38, { align: 'right' });
      doc.line(doc.internal.pageSize.width - 70, footerY + 32, doc.internal.pageSize.width - 14, footerY + 32);
    }
    else {
      // Header
      doc.setFontSize(18);
      doc.setTextColor(41, 128, 185);
      doc.text(companyInfo, 14, 15);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(title, 14, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 32);

      // Table Data
      const tableData = data.map(row => columns.map(col => {
        const val = row[col.key];
        return val !== undefined && val !== null ? String(val) : '';
      }));

      if (totals) {
        tableData.push(columns.map(col => totals[col.key] ? String(totals[col.key]) : ''));
      }

      doc.autoTable({
        startY: 40,
        head: [columns.map(c => c.header)],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        didParseCell: function(data) {
          // Bold the totals row
          if (totals && data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [230, 235, 245];
          }
        }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} - Generated by Jai Bhavani Cargo System`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    return doc.output('blob');
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF');
  }
};

/**
 * Generates an Excel workbook from data using xlsx.
 * @param {Array} data - Array of objects representing rows
 * @param {string} filename - The name of the file (without extension)
 * @param {string} sheetName - The name of the worksheet
 * @returns {Blob} The generated Excel blob
 */
export const generateExcel = (data, filename, sheetName = 'Sheet1') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Auto-size columns roughly based on header length
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