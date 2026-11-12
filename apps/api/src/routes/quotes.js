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


/**
 * POST /api/quotes/convert-to-trip
 * Converts an approved quotation into an operational live dispatch in trip_logs
 */
router.post('/convert-to-trip', async (req, res) => {
  try {
    const {
      quoteId,
      truckId,
      truckNumber,
      driverId,
      driverName,
      driverPhone,
      pickupDate,
      deliveryEta,
      loadingDock,
      unloadingDock,
      driverAdvance,
      notes,
      actor
    } = req.body;

    if (!quoteId) {
      return res.status(400).json({ success: false, error: 'quoteId is required' });
    }

    const quote = await pb.collection('quotes').getOne(quoteId, { $autoCancel: false });
    if (!quote) {
      return res.status(404).json({ success: false, error: 'Quotation not found' });
    }

    const tripNumber = `TRIP-${Date.now().toString(36).toUpperCase()}`;
    const quoteRevenue = Number(quote.total_amount || quote.amount || quote.rate || 0);
    const origin = quote.origin || quote.pickup_location || 'Origin Hub';
    const destination = quote.destination || quote.drop_location || 'Destination Hub';
    const route = `${origin} -> ${destination}`;

    const tripPayload = {
      trip_id: tripNumber,
      route: route,
      origin: origin,
      destination: destination,
      client_id: quote.client_id || quote.customer_id || '',
      customer_name: quote.customer_name || '',
      truck_id: truckId || '',
      truck_number: truckNumber || '',
      driver_id: driverId || '',
      driver_name: driverName || '',
      driver_phone: driverPhone || '',
      revenue: quoteRevenue,
      advance_paid_to_driver: Number(driverAdvance || 0),
      trip_status: 'Upcoming',
      client_payment_status: 'pending',
      date: pickupDate ? new Date(pickupDate).toISOString() : new Date().toISOString(),
      delivery_deadline: deliveryEta ? new Date(deliveryEta).toISOString() : '',
      delivery_eta: deliveryEta ? new Date(deliveryEta).toISOString() : '',
      notes: notes || quote.notes || `Converted from Quotation #${quote.quote_number || quote.id}`,
      quote_id: quote.id,
      loading_dock: loadingDock || 'Loading Gate 1',
      unloading_dock: unloadingDock || 'Destination Dock',
      closure_blockers: '[]'
    };

    const newTrip = await pb.collection('trip_logs').create(tripPayload, { $autoCancel: false });

    // Update Quote status
    await pb.collection('quotes').update(quoteId, {
      status: 'Converted',
      converted_trip_id: newTrip.id,
      converted_trip_number: tripNumber,
      converted_at: new Date().toISOString()
    }, { $autoCancel: false });

    // If driver advance is specified, log in cashbook
    if (Number(driverAdvance) > 0) {
      try {
        await pb.collection('cashbook').create({
          transaction_type: 'Expense',
          category: 'Driver Advance',
          amount: Number(driverAdvance),
          description: `Advance for Converted Trip ${tripNumber} (${route}) - Driver: ${driverName || 'N/A'}`,
          reference_id: newTrip.id,
          date: new Date().toISOString(),
          payment_method: 'Cash',
          status: 'Paid'
        }, { $autoCancel: false });
      } catch (e) {
        logger.warn(`[QuoteConversion] Notice logging advance: ${e.message}`);
      }
    }

    // Create high-priority dispatch task
    try {
      await pb.collection('operations_tasks').create({
        task_number: `DISP-${Date.now().toString(36).toUpperCase()}`,
        title: `Dispatch Booking: ${tripNumber} (${route})`,
        description: `Trip converted from Quotation #${quote.quote_number || quote.id} for client ${quote.customer_name}. Assigned truck: ${truckNumber || 'TBA'}, Driver: ${driverName || 'TBA'}.`,
        category: 'Dispatch & Trips',
        department: 'Operations',
        priority: 'High',
        status: 'To Do',
        due_date: pickupDate ? new Date(pickupDate).toISOString() : new Date().toISOString(),
        assigned_to_name: driverName || 'Route Dispatcher',
        accountable_owner_name: 'Vinod kumar Rathod',
        related_entity_type: 'trip_logs',
        related_entity_id: newTrip.id
      }, { $autoCancel: false });
    } catch (e) {}

    // Ingest into Cryptographic Audit Trail
    try {
      const { ingestEvent } = await import('../services/auditService.js');
      ingestEvent({
        action: 'QUOTATION_CONVERTED_TO_TRIP',
        module: 'LOGISTICS',
        entity_type: 'TRIP',
        entity_id: newTrip.id,
        details: `Quotation #${quote.quote_number || quote.id} (₹${quoteRevenue.toLocaleString('en-IN')}) converted to live operational dispatch ${tripNumber} (${route}).`,
        actor: { id: actor?.id || 'usr_vinod_admin', name: actor?.name || 'Vinod Kumar Rathod', role: 'superuser' },
        new_values: { trip_id: tripNumber, revenue: quoteRevenue, route, truckNumber, driverName }
      });
    } catch (e) {}

    logger.info(`[QuoteConversion] Converted Quote ${quoteId} to Trip ${tripNumber}`);

    res.json({
      success: true,
      message: `Quotation converted successfully to Trip ${tripNumber}`,
      trip: newTrip,
      tripNumber
    });
  } catch (err) {
    logger.error(`[QuoteConversion Error] ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ==========================================
// CLIENT PORTAL SELF-SERVICE QUOTATION APIS
// ==========================================

// 1. Submit Rate Request from Client Portal
router.post('/client/request', async (req, res) => {
  try {
    const {
      clientId,
      customerName,
      customerPhone,
      customerEmail,
      origin,
      destination,
      pickupDate,
      deliveryUrgency = 'Standard',
      materialType = 'General Cargo',
      cargoWeightKg = 0,
      cargoVolume = '',
      truckSize = '32 FT SXL',
      contractType = 'Spot',
      packaging = 'Palletized',
      specialRequirements = [],
      estimatedPrice = 0,
      notes = ''
    } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ success: false, error: 'Origin and Destination are required.' });
    }

    const quoteNumber = 'QT-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const recordData = {
      quote_number: quoteNumber,
      customer_name: customerName || 'Corporate Client',
      customer_phone: customerPhone || '',
      customer_email: customerEmail || '',
      client_id: clientId || '',
      origin: origin.trim(),
      destination: destination.trim(),
      truck_size: truckSize,
      material_type: materialType,
      actual_weight: Number(cargoWeightKg) || 0,
      cargo_weight: Number(cargoWeightKg) || 0,
      total_price: Number(estimatedPrice) || 0,
      status: 'Requested',
      notes: `[Self-Service Portal Request]\nPickup Date: ${pickupDate || 'Flexible'}\nUrgency: ${deliveryUrgency}\nPackaging: ${packaging}\nContract: ${contractType}\nVolume: ${cargoVolume || 'N/A'}\nSpecial Req: ${Array.isArray(specialRequirements) ? specialRequirements.join(', ') : specialRequirements}\nClient Notes: ${notes}`,
      created: new Date().toISOString()
    };

    let savedQuote = null;
    try {
      savedQuote = await pb.collection('quotes').create(recordData, { $autoCancel: false });
    } catch (pbErr) {
      logger.warn('[ClientQuoteRequest] Could not write directly to PocketBase quotes, using fallback mock: ' + pbErr.message);
      savedQuote = { id: 'qt_cli_' + Date.now(), ...recordData };
    }

    // Create an operations task so dispatchers see it immediately
    try {
      await pb.collection('operations_tasks').create({
        task_title: `Review Self-Service Quote #${quoteNumber} (${customerName || 'Client'})`,
        task_description: `Client requested rate for ${origin} ➡️ ${destination} (${truckSize}, ${cargoWeightKg} kg, ${contractType}). Action required: review pricing and update quote.`,
        department: 'Operations',
        priority: 'High',
        status: 'To Do',
        due_date: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        related_entity_type: 'quotes',
        related_entity_id: savedQuote.id
      }, { $autoCancel: false });
    } catch (e) {}

    logger.info(`[ClientQuoteRequest] Successfully created quote request ${quoteNumber} for ${customerName}`);

    res.json({
      success: true,
      message: 'Rate request submitted successfully! Dispatch will review and confirm within 15 minutes.',
      quote: savedQuote,
      quoteNumber
    });
  } catch (err) {
    logger.error('[ClientQuoteRequest Error] ' + err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Fetch all quotes for authenticated client
router.get('/client/my-quotes', async (req, res) => {
  try {
    const { clientId, customerEmail, customerPhone, customerName } = req.query;

    let quotes = [];
    try {
      let filterParts = [];
      if (clientId) filterParts.push(`client_id = "${clientId}"`);
      if (customerEmail) filterParts.push(`customer_email = "${customerEmail}"`);
      if (customerPhone) filterParts.push(`customer_phone = "${customerPhone}"`);
      if (customerName) filterParts.push(`customer_name ~ "${customerName}"`);

      const filterStr = filterParts.length > 0 ? filterParts.join(' || ') : '';

      quotes = await pb.collection('quotes').getFullList({
        filter: filterStr || undefined,
        sort: '-created',
        $autoCancel: false
      });
    } catch (err) {
      logger.warn('[ClientMyQuotes] PocketBase fetch error: ' + err.message);
      quotes = [];
    }

    res.json({ success: true, quotes });
  } catch (err) {
    logger.error('[ClientMyQuotes Error] ' + err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Client Accept Quote & Confirm Booking
router.post('/client/accept', async (req, res) => {
  try {
    const { quoteId, clientNotes = '', actorName = 'Client' } = req.body;

    if (!quoteId) {
      return res.status(400).json({ success: false, error: 'quoteId is required.' });
    }

    let quote = null;
    try {
      quote = await pb.collection('quotes').getOne(quoteId, { $autoCancel: false });
    } catch (e) {}

    const updatedNotes = (quote?.notes ? quote.notes + '\n\n' : '') +
      `[Client Accepted on ${new Date().toLocaleString('en-IN')}] Confirmed by ${actorName}. ${clientNotes ? 'Notes: ' + clientNotes : ''}`;

    try {
      await pb.collection('quotes').update(quoteId, {
        status: 'Accepted',
        notes: updatedNotes
      }, { $autoCancel: false });
    } catch (e) {}

    // Create immediate conversion alert task for operations
    try {
      await pb.collection('operations_tasks').create({
        task_title: `BOOKING CONFIRMED: Quote #${quote?.quote_number || quoteId} Ready for Dispatch 🚚`,
        task_description: `Client confirmed booking for quote ${quote?.quote_number || quoteId} (${quote?.origin || 'Origin'} ➡️ ${quote?.destination || 'Destination'}). Convert to Trip in /quotes-manager now!`,
        department: 'Operations',
        priority: 'High',
        status: 'To Do',
        due_date: new Date().toISOString(),
        related_entity_type: 'quotes',
        related_entity_id: quoteId
      }, { $autoCancel: false });
    } catch (e) {}

    logger.info(`[ClientQuoteAccept] Quote ${quoteId} accepted by client ${actorName}`);

    res.json({
      success: true,
      message: 'Booking confirmed successfully! Our operations team has been notified and is assigning your vehicle.',
      quoteId
    });
  } catch (err) {
    logger.error('[ClientQuoteAccept Error] ' + err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
