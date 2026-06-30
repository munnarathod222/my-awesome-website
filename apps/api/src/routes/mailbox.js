import express from 'express';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper to get SMTP/IMAP configuration from environment
const getMailConfig = () => {
  return {
    imapHost: process.env.MAIL_IMAP_HOST || 'imap.hostinger.com',
    imapPort: parseInt(process.env.MAIL_IMAP_PORT || '993'),
    smtpHost: process.env.MAIL_HOST || 'smtp.hostinger.com',
    smtpPort: parseInt(process.env.MAIL_PORT || '465'),
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    fromName: process.env.MAIL_FROM_NAME || 'Jaibhavani Cargo'
  };
};

/**
 * GET /api/mailbox/folders
 * Fetch mail folders (Inbox, Sent, Drafts, etc.)
 */
router.get('/folders', async (req, res) => {
  const config = getMailConfig();
  
  if (!config.user || !config.pass) {
    return res.status(400).json({ error: 'Mail credentials are not configured in environment variables' });
  }

  // Attempt connection using IMAP library if available, else fall back to simulated response
  try {
    const Imap = (await import('imap')).default;
    
    const imap = new Imap({
      user: config.user,
      password: config.pass,
      host: config.imapHost,
      port: config.imapPort,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });

    imap.once('ready', () => {
      imap.getBoxes((err, boxes) => {
        imap.end();
        if (err) {
          logger.error('IMAP folders fetch error:', err);
          return res.status(500).json({ error: err.message });
        }

        // Map box keys to folder names
        const folders = Object.keys(boxes).map(name => ({
          id: name,
          name: name,
          count: boxes[name].attribs.includes('\\HasChildren') ? 0 : (boxes[name].messages?.total || 0)
        }));

        return res.json({ success: true, folders });
      });
    });

    imap.once('error', (err) => {
      logger.error('IMAP connection error:', err);
      if (!res.headersSent) {
        return res.status(500).json({ error: `IMAP Connection failed: ${err.message}` });
      }
    });

    imap.connect();
  } catch (err) {
    logger.warn('imap npm package is not installed. Falling back to simulated folder structure.');
    
    // Fallback simulated folders for Hostinger IMAP mail service
    return res.json({
      success: true,
      simulated: true,
      folders: [
        { id: 'INBOX', name: 'Inbox', count: 3 },
        { id: 'Sent', name: 'Sent Items', count: 12 },
        { id: 'Drafts', name: 'Drafts', count: 0 },
        { id: 'Trash', name: 'Trash', count: 1 }
      ]
    });
  }
});

/**
 * GET /api/mailbox/messages
 * Fetch messages for a specific folder
 */
router.get('/messages', async (req, res) => {
  const { folder = 'INBOX' } = req.query;
  const config = getMailConfig();

  if (!config.user || !config.pass) {
    return res.status(400).json({ error: 'Mail credentials are not configured in environment variables' });
  }

  try {
    const Imap = (await import('imap')).default;
    const { simpleParser } = await import('mailparser');

    const imap = new Imap({
      user: config.user,
      password: config.pass,
      host: config.imapHost,
      port: config.imapPort,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });

    imap.once('ready', () => {
      imap.openBox(folder, true, (err, box) => {
        if (err) {
          imap.end();
          return res.status(500).json({ error: err.message });
        }

        const totalMessages = box.messages.total;
        if (totalMessages === 0) {
          imap.end();
          return res.json({ success: true, messages: [] });
        }

        // Fetch last 10 messages
        const fetchRange = `${Math.max(1, totalMessages - 9)}:${totalMessages}`;
        const f = imap.fetch(fetchRange, { bodies: '' });
        const messages = [];

        f.on('message', (msg, seqno) => {
          let buffer = '';
          msg.on('body', (stream, info) => {
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
          });
          msg.once('end', async () => {
            try {
              const parsed = await simpleParser(buffer);
              messages.push({
                id: seqno.toString(),
                uid: seqno,
                subject: parsed.subject || 'No Subject',
                from: parsed.from?.text || 'Unknown',
                date: parsed.date || new Date(),
                body: parsed.text || parsed.html || '',
                snippet: (parsed.text || '').substring(0, 100) + '...'
              });
            } catch (parseErr) {
              logger.error('Error parsing email body:', parseErr);
            }
          });
        });

        f.once('error', (err) => {
          logger.error('Fetch error:', err);
        });

        f.once('end', () => {
          imap.end();
          // Sort messages in descending order (newest first)
          messages.sort((a, b) => new Date(b.date) - new Date(a.date));
          return res.json({ success: true, messages });
        });
      });
    });

    imap.connect();
  } catch (err) {
    logger.warn('imap or mailparser npm packages are not installed. Returning fallback emails.');
    
    // Return sample emails
    return res.json({
      success: true,
      simulated: true,
      messages: [
        {
          id: '1',
          uid: 1,
          subject: 'Welcome to Jaibhavani Cargo System',
          from: 'system@jaibhavanicargo.com',
          date: new Date(Date.now() - 3600000 * 2).toISOString(),
          snippet: 'Your company mail configuration is successfully verified on Hostinger mail servers...',
          body: 'Hello Team,\n\nYour company mail configuration is successfully verified on Hostinger mail servers.\n\nBest Regards,\nAdmin'
        },
        {
          id: '2',
          uid: 2,
          subject: 'Weekly Operations Report',
          from: 'manager@jaibhavanicargo.com',
          date: new Date(Date.now() - 3600000 * 24).toISOString(),
          snippet: 'Please find attached the weekly trip operations ledger for trucks operating on HYD-BLR route...',
          body: 'Dear Team,\n\nPlease find attached the weekly trip operations ledger for trucks operating on HYD-BLR route.\n\nThanks,\nOperations Team'
        }
      ]
    });
  }
});

/**
 * POST /api/mailbox/send
 * Send email from business account
 */
router.post('/send', async (req, res) => {
  const { to, subject, html } = req.body;
  const config = getMailConfig();

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'to, subject, and html fields are required' });
  }

  if (!config.user || !config.pass) {
    return res.status(400).json({ error: 'Mail credentials are not configured in environment variables' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.user,
        pass: config.pass
      }
    });

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.user}>`,
      to,
      subject,
      html
    });

    logger.info(`Business mail sent to ${to} from ${config.user}`);
    return res.json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    logger.error('Failed to send business mail:', err);
    return res.status(500).json({ error: err.message || 'Failed to send email via SMTP' });
  }
});

export default router;
