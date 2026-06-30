import express from 'express';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Send invoice via email using PocketBase built-in mailer
router.post('/send-email', async (req, res) => {
  const { invoiceId, recipientEmail } = req.body;

  // Validate input
  if (!invoiceId || !recipientEmail) {
    return res.status(400).json({ error: 'invoiceId and recipientEmail are required' });
  }

  // Fetch invoice from PocketBase
  const invoice = await pb.collection('invoices').getOne(invoiceId);

  if (!invoice) {
    throw new Error(`Invoice with ID ${invoiceId} not found`);
  }

  // Generate email content with invoice details and calculation breakdown
  const emailSubject = `Invoice #${invoice.id} - ${invoice.projectName || 'Project Invoice'}`;
  const emailBody = generateInvoiceEmailContent(invoice);

  // Send email using PocketBase built-in mailer
  await pb.sendEmail({
    to: recipientEmail,
    subject: emailSubject,
    html: emailBody,
  });

  // Update invoice status to 'Sent'
  await pb.collection('invoices').update(invoiceId, {
    status: 'Sent',
    sentAt: new Date().toISOString(),
  });

  logger.info(`Invoice ${invoiceId} sent to ${recipientEmail}`);

  res.json({
    success: true,
    message: 'Invoice sent successfully',
  });
});

// Download invoice as PDF
router.post('/download-pdf', async (req, res) => {
  const { invoiceId } = req.body;

  // Validate input
  if (!invoiceId) {
    return res.status(400).json({ error: 'invoiceId is required' });
  }

  // Fetch invoice from PocketBase
  const invoice = await pb.collection('invoices').getOne(invoiceId);

  if (!invoice) {
    throw new Error(`Invoice with ID ${invoiceId} not found`);
  }

  // Generate PDF
  const pdfBuffer = generateInvoicePDF(invoice);

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoiceId}.pdf`);

  res.send(pdfBuffer);
});

/**
 * Generate HTML email content for invoice
 */
function generateInvoiceEmailContent(invoice) {
  const items = invoice.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = invoice.taxRate ? subtotal * (invoice.taxRate / 100) : 0;
  const discount = invoice.discount || 0;
  const total = subtotal + tax - discount;

  let itemsHtml = '';
  items.forEach((item) => {
    const itemTotal = item.quantity * item.unitPrice;
    itemsHtml += `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.description || 'Item'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(itemTotal)}</td>
      </tr>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .invoice-details { font-size: 14px; color: #666; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #28a745; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background-color: #f5f5f5; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
          .summary { margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .summary-row.total { font-size: 18px; font-weight: bold; border-top: 2px solid #ddd; padding-top: 10px; color: #28a745; }
          .payment-terms { background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .bank-details { background-color: #f3e5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="invoice-title">Invoice #${invoice.id}</div>
            <div class="invoice-details">
              <p><strong>Project:</strong> ${invoice.projectName || 'N/A'}</p>
              <p><strong>Date:</strong> ${new Date(invoice.created).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Customer Details</div>
            <p><strong>${invoice.customerName || 'N/A'}</strong></p>
            ${invoice.customerEmail ? `<p>Email: ${invoice.customerEmail}</p>` : ''}
            ${invoice.customerAddress ? `<p>Address: ${invoice.customerAddress}</p>` : ''}
          </div>

          <div class="section">
            <div class="section-title">Invoice Items</div>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            ${invoice.taxRate ? `
              <div class="summary-row">
                <span>Tax (${invoice.taxRate}%):</span>
                <span>${formatCurrency(tax)}</span>
              </div>
            ` : ''}
            ${discount > 0 ? `
              <div class="summary-row">
                <span>Discount:</span>
                <span>-${formatCurrency(discount)}</span>
              </div>
            ` : ''}
            <div class="summary-row total">
              <span>Total:</span>
              <span>${formatCurrency(total)}</span>
            </div>
          </div>

          ${invoice.paymentTerms ? `
            <div class="payment-terms">
              <strong>Payment Terms:</strong>
              <p>${invoice.paymentTerms}</p>
            </div>
          ` : ''}

          ${invoice.bankDetails ? `
            <div class="bank-details">
              <strong>Bank Details:</strong>
              <p>${invoice.bankDetails}</p>
            </div>
          ` : ''}

          ${invoice.notes ? `
            <div class="section">
              <div class="section-title">Notes</div>
              <p>${invoice.notes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>This is an automated invoice. Please contact us if you have any questions.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate PDF for invoice
 */
function generateInvoicePDF(invoice) {
  const doc = new jsPDF();
  const items = invoice.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = invoice.taxRate ? subtotal * (invoice.taxRate / 100) : 0;
  const discount = invoice.discount || 0;
  const total = subtotal + tax - discount;

  // Company Header
  doc.setFontSize(20);
  doc.text('INVOICE', 20, 20);
  doc.setFontSize(10);
  doc.text(`Invoice #${invoice.id}`, 20, 30);
  doc.text(`Date: ${new Date(invoice.created).toLocaleDateString()}`, 20, 37);
  if (invoice.dueDate) {
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 44);
  }

  // Customer Details
  doc.setFontSize(12);
  doc.text('Bill To:', 20, 55);
  doc.setFontSize(10);
  doc.text(invoice.customerName || 'N/A', 20, 62);
  if (invoice.customerEmail) {
    doc.text(`Email: ${invoice.customerEmail}`, 20, 69);
  }
  if (invoice.customerAddress) {
    doc.text(`Address: ${invoice.customerAddress}`, 20, 76);
  }

  // Line Items Table
  const tableData = items.map((item) => [
    item.description || 'Item',
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.quantity * item.unitPrice),
  ]);

  autoTable(doc, {
    head: [['Description', 'Quantity', 'Unit Price', 'Total']],
    body: tableData,
    startY: 85,
    margin: { left: 20, right: 20 },
    styles: { fontSize: 10 },
    headStyles: { fillColor: [40, 167, 69], textColor: 255 },
  });

  // Calculation Breakdown
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 120, finalY);
  let currentY = finalY + 7;

  if (invoice.taxRate) {
    doc.text(`Tax (${invoice.taxRate}%): ${formatCurrency(tax)}`, 120, currentY);
    currentY += 7;
  }

  if (discount > 0) {
    doc.text(`Discount: -${formatCurrency(discount)}`, 120, currentY);
    currentY += 7;
  }

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Total: ${formatCurrency(total)}`, 120, currentY + 5);

  // Payment Terms
  if (invoice.paymentTerms) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Payment Terms:', 20, currentY + 15);
    doc.text(invoice.paymentTerms, 20, currentY + 22, { maxWidth: 170 });
  }

  // Bank Details
  if (invoice.bankDetails) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Bank Details:', 20, currentY + 35);
    doc.text(invoice.bankDetails, 20, currentY + 42, { maxWidth: 170 });
  }

  // Notes
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Notes:', 20, currentY + 55);
    doc.text(invoice.notes, 20, currentY + 62, { maxWidth: 170 });
  }

  return doc.output('arraybuffer');
}

/**
 * Format number as currency (USD)
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default router;