import express from 'express';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Send quote via email using PocketBase built-in mailer
router.post('/send-email', async (req, res) => {
  const { quoteId, recipientEmail } = req.body;

  // Validate input
  if (!quoteId || !recipientEmail) {
    return res.status(400).json({ error: 'quoteId and recipientEmail are required' });
  }

  // Fetch quote from PocketBase
  const quote = await pb.collection('quotes').getOne(quoteId);

  if (!quote) {
    throw new Error(`Quote with ID ${quoteId} not found`);
  }

  // Generate email content with quote details and calculation breakdown
  const emailSubject = `Quote #${quote.id} - ${quote.projectName || 'Project Quote'}`;
  const emailBody = generateQuoteEmailContent(quote);

  // Send email using PocketBase built-in mailer
  await pb.sendEmail({
    to: recipientEmail,
    subject: emailSubject,
    html: emailBody,
  });

  // Update quote status to 'Sent'
  await pb.collection('quotes').update(quoteId, {
    status: 'Sent',
    sentAt: new Date().toISOString(),
  });

  logger.info(`Quote ${quoteId} sent to ${recipientEmail}`);

  res.json({
    success: true,
    message: 'Quote sent successfully',
  });
});

// Download quote as PDF
router.post('/download-pdf', async (req, res) => {
  const { quoteId } = req.body;

  // Validate input
  if (!quoteId) {
    return res.status(400).json({ error: 'quoteId is required' });
  }

  // Fetch quote from PocketBase
  const quote = await pb.collection('quotes').getOne(quoteId);

  if (!quote) {
    throw new Error(`Quote with ID ${quoteId} not found`);
  }

  // Generate PDF
  const pdfBuffer = generateQuotePDF(quote);

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=quote_${quoteId}.pdf`);

  res.send(pdfBuffer);
});

/**
 * Generate HTML email content for quote
 */
function generateQuoteEmailContent(quote) {
  const items = quote.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const fuelSurcharge = quote.fuelSurcharge || 0;
  const handlingFees = quote.handlingFees || 0;
  const total = subtotal + fuelSurcharge + handlingFees;

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
          .quote-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .quote-details { font-size: 14px; color: #666; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background-color: #f5f5f5; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
          .summary { margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .summary-row.total { font-size: 18px; font-weight: bold; border-top: 2px solid #ddd; padding-top: 10px; color: #007bff; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="quote-title">Quote #${quote.id}</div>
            <div class="quote-details">
              <p><strong>Project:</strong> ${quote.projectName || 'N/A'}</p>
              <p><strong>Date:</strong> ${new Date(quote.created).toLocaleDateString()}</p>
              <p><strong>Valid Until:</strong> ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Quote Items</div>
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
            ${fuelSurcharge > 0 ? `
              <div class="summary-row">
                <span>Fuel Surcharge:</span>
                <span>${formatCurrency(fuelSurcharge)}</span>
              </div>
            ` : ''}
            ${handlingFees > 0 ? `
              <div class="summary-row">
                <span>Handling Fees:</span>
                <span>${formatCurrency(handlingFees)}</span>
              </div>
            ` : ''}
            <div class="summary-row total">
              <span>Total:</span>
              <span>${formatCurrency(total)}</span>
            </div>
          </div>

          ${quote.notes ? `
            <div class="section">
              <div class="section-title">Notes</div>
              <p>${quote.notes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>This is an automated quote. Please contact us if you have any questions.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate PDF for quote
 */
function generateQuotePDF(quote) {
  const doc = new jsPDF();
  const items = quote.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const fuelSurcharge = quote.fuelSurcharge || 0;
  const handlingFees = quote.handlingFees || 0;
  const total = subtotal + fuelSurcharge + handlingFees;

  // Company Header
  doc.setFontSize(20);
  doc.text('QUOTE', 20, 20);
  doc.setFontSize(10);
  doc.text(`Quote #${quote.id}`, 20, 30);
  doc.text(`Date: ${new Date(quote.created).toLocaleDateString()}`, 20, 37);
  if (quote.validUntil) {
    doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}`, 20, 44);
  }

  // Project Details
  doc.setFontSize(12);
  doc.text('Project Details', 20, 55);
  doc.setFontSize(10);
  doc.text(`Project: ${quote.projectName || 'N/A'}`, 20, 62);
  if (quote.customerName) {
    doc.text(`Customer: ${quote.customerName}`, 20, 69);
  }
  if (quote.customerEmail) {
    doc.text(`Email: ${quote.customerEmail}`, 20, 76);
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
    headStyles: { fillColor: [0, 123, 255], textColor: 255 },
  });

  // Calculation Breakdown
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 120, finalY);
  let currentY = finalY + 7;

  if (fuelSurcharge > 0) {
    doc.text(`Fuel Surcharge: ${formatCurrency(fuelSurcharge)}`, 120, currentY);
    currentY += 7;
  }

  if (handlingFees > 0) {
    doc.text(`Handling Fees: ${formatCurrency(handlingFees)}`, 120, currentY);
    currentY += 7;
  }

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Total: ${formatCurrency(total)}`, 120, currentY + 5);

  // Notes
  if (quote.notes) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Notes:', 20, currentY + 15);
    doc.text(quote.notes, 20, currentY + 22, { maxWidth: 170 });
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