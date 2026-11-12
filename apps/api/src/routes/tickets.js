import express from 'express';
import fs from 'fs';
import path from 'path';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

const DATA_DIR = path.resolve(process.cwd(), 'data');
const TICKETS_FILE = path.join(DATA_DIR, 'customer_tickets.json');

// Ensure data directory and fallback store exist
function ensureTicketsFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(TICKETS_FILE)) {
      fs.writeFileSync(TICKETS_FILE, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (e) {
    logger.warn('[Tickets] Could not initialize fallback tickets file: ' + e.message);
  }
}

function readLocalTickets() {
  ensureTicketsFile();
  try {
    const raw = fs.readFileSync(TICKETS_FILE, 'utf8');
    return JSON.parse(raw) || [];
  } catch (e) {
    return [];
  }
}

function writeLocalTickets(tickets) {
  ensureTicketsFile();
  try {
    fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2), 'utf8');
  } catch (e) {
    logger.error('[Tickets] Failed writing local tickets: ' + e.message);
  }
}

// 1. GET /api/tickets/client/my-tickets - Fetch all tickets for a client
router.get('/client/my-tickets', async (req, res) => {
  try {
    const { clientId, email, clientName } = req.query;
    const localTickets = readLocalTickets();

    let filtered = localTickets;
    if (clientId || email || clientName) {
      const cId = (clientId || '').toLowerCase().trim();
      const em = (email || '').toLowerCase().trim();
      const cn = (clientName || '').toLowerCase().trim();

      filtered = localTickets.filter(t => {
        const tClientId = (t.client_id || '').toLowerCase().trim();
        const tEmail = (t.client_email || t.email || '').toLowerCase().trim();
        const tName = (t.client_name || '').toLowerCase().trim();

        if (cId && tClientId === cId) return true;
        if (em && tEmail === em) return true;
        if (cn && (tName.includes(cn) || cn.includes(tName))) return true;
        return false;
      });
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.created_at || b.created || 0) - new Date(a.created_at || a.created || 0));

    return res.json({
      success: true,
      count: filtered.length,
      tickets: filtered
    });
  } catch (err) {
    logger.error('[Tickets] Error fetching client tickets: ' + err.message);
    return res.status(500).json({ success: false, error: err.message, tickets: [] });
  }
});

// 2. POST /api/tickets/create - Raise a Delivery or Billing Issue Ticket
router.post('/create', async (req, res) => {
  try {
    const {
      clientId,
      clientName = 'Valued Client',
      clientEmail = '',
      clientPhone = '',
      category = 'delivery', // 'delivery' or 'billing'
      issueType = 'Transit Delay',
      priority = 'High', // 'Urgent', 'High', 'Medium', 'Low'
      tripId = '',
      tripNumber = '',
      lrNumber = '',
      truckNumber = '',
      invoiceNumber = '',
      disputedAmount = 0,
      subject = '',
      description = '',
      evidenceUrl = ''
    } = req.body;

    if (!description && !subject) {
      return res.status(400).json({ success: false, error: 'Subject or description is required.' });
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `JBC-TKT-${dateStr}-${rand}`;

    const newTicket = {
      id: `tkt-${Date.now()}-${rand}`,
      ticket_number: ticketNumber,
      client_id: clientId || 'client-portal',
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      category: category.toLowerCase().includes('bill') ? 'Billing' : 'Delivery',
      issue_type: issueType || (category.toLowerCase().includes('bill') ? 'Invoice Discrepancy' : 'Delivery Delay'),
      priority: priority || 'High',
      trip_id: tripId || '',
      trip_number: tripNumber || tripId || '',
      lr_number: lrNumber || '',
      truck_number: truckNumber || '',
      invoice_number: invoiceNumber || '',
      disputed_amount: Number(disputedAmount) || 0,
      subject: subject || `${issueType} on ${tripNumber || truckNumber || 'Shipment'}`,
      description: description || '',
      evidence_url: evidenceUrl || '',
      status: 'Open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      timeline: [
        {
          timestamp: new Date().toISOString(),
          author: clientName,
          role: 'Client',
          message: `Ticket raised: ${subject || issueType}. ${description}`
        }
      ]
    };

    // Save to persistent file storage
    const all = readLocalTickets();
    all.unshift(newTicket);
    writeLocalTickets(all);

    // Also attempt saving to PocketBase todos / audit_logs for system visibility
    try {
      await pb.collection('todos').create({
        title: `🚨 [${newTicket.category}] ${newTicket.ticket_number}: ${newTicket.issue_type} - ${clientName}`,
        description: `Customer ${clientName} raised ${newTicket.category} issue for Trip ${tripNumber || truckNumber || 'N/A'}.\n\nDetails: ${description}\nDisputed Amount: ₹${disputedAmount}\nPriority: ${priority}`,
        status: 'pending',
        priority: priority.toLowerCase() === 'urgent' ? 'high' : 'medium',
        due_date: new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 10) // 4 hours SLA
      }, { $autoCancel: false });
    } catch (pbErr) {
      logger.warn('[Tickets] PocketBase todo notification warning: ' + pbErr.message);
    }

    return res.status(201).json({
      success: true,
      message: `Support Ticket ${ticketNumber} raised successfully. Operations team has been notified.`,
      ticket: newTicket
    });
  } catch (err) {
    logger.error('[Tickets] Error creating ticket: ' + err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/tickets/client/reply - Client adds message/evidence to ticket
router.post('/client/reply', async (req, res) => {
  try {
    const { ticketId, ticketNumber, message, author = 'Client', evidenceUrl = '' } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Reply message cannot be empty.' });
    }

    const all = readLocalTickets();
    const ticket = all.find(t => t.id === ticketId || t.ticket_number === ticketNumber);

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found.' });
    }

    if (!ticket.timeline) ticket.timeline = [];
    ticket.timeline.push({
      timestamp: new Date().toISOString(),
      author: author,
      role: 'Client',
      message: message,
      evidence_url: evidenceUrl || undefined
    });
    ticket.updated_at = new Date().toISOString();

    writeLocalTickets(all);

    return res.json({
      success: true,
      message: 'Reply added successfully.',
      ticket
    });
  } catch (err) {
    logger.error('[Tickets] Error adding reply: ' + err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/tickets/client/resolve - Client confirms resolution
router.post('/client/resolve', async (req, res) => {
  try {
    const { ticketId, ticketNumber, rating = 5, feedback = '' } = req.body;
    const all = readLocalTickets();
    const ticket = all.find(t => t.id === ticketId || t.ticket_number === ticketNumber);

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found.' });
    }

    ticket.status = 'Resolved';
    ticket.rating = rating;
    ticket.feedback = feedback;
    ticket.resolved_at = new Date().toISOString();
    ticket.updated_at = new Date().toISOString();
    if (!ticket.timeline) ticket.timeline = [];
    ticket.timeline.push({
      timestamp: new Date().toISOString(),
      author: ticket.client_name || 'Client',
      role: 'Client',
      message: `Ticket closed by customer with ${rating}-star rating: ${feedback || 'Issue confirmed resolved.'}`
    });

    writeLocalTickets(all);

    return res.json({
      success: true,
      message: `Ticket ${ticket.ticket_number} marked as Resolved. Thank you for your feedback!`,
      ticket
    });
  } catch (err) {
    logger.error('[Tickets] Error resolving ticket: ' + err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
