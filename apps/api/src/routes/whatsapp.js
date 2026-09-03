import { Router } from 'express';
import { 
  sendAisensyNotification, 
  isAisensyConfigured, 
  formatWhatsAppPhone, 
  APPROVED_TEMPLATES, 
  normalizeCampaignName 
} from '../services/whatsappService.js';

const router = Router();

/**
 * GET /api/whatsapp/status & /api/aisensy/status
 * Check if Aisensy API Key is set in backend environment
 */
router.get(['/status', '/api/status'], (req, res) => {
  const configured = isAisensyConfigured();
  return res.json({
    success: true,
    provider: 'aisensy',
    configured: configured,
    templates: APPROVED_TEMPLATES,
    message: configured 
      ? 'Aisensy API key is active and configured in backend environment.' 
      : 'Aisensy API key is not set yet in Render environment variables. You can add AISENSY_API_KEY in Render or use the instant wa.me button.'
  });
});

/**
 * GET /api/whatsapp/templates
 * List all pre-approved templates
 */
router.get(['/templates', '/api/templates'], (req, res) => {
  return res.json({
    success: true,
    templates: APPROVED_TEMPLATES
  });
});

/**
 * GET /api/whatsapp/diagnostics
 * Return latest request and response payloads sent to Aisensy
 */
router.get(['/diagnostics', '/api/diagnostics'], (req, res) => {
  return res.json({
    success: true,
    logs: global._whatsappLogs || [],
    count: (global._whatsappLogs || []).length
  });
});

/**
 * POST /api/whatsapp/send & /api/aisensy/send
 * Dispatch WhatsApp notification via Aisensy API
 */
router.post(['/send', '/api/send', '/message', '/dispatch'], async (req, res) => {
  try {
    const destination = req.body.destination || req.body.phone || req.body.recipientPhone || req.body.recipient || '';
    const rawCampaign = req.body.campaignName || req.body.templateName || req.body.campaign || 'loading_dock_locations';
    const campaignName = normalizeCampaignName(rawCampaign);
    const userName = req.body.userName || req.body.recipientName || req.body.clientName || 'Customer';
    const templateParams = req.body.templateParams || [];
    
    let media = req.body.media || null;
    if (!media && req.body.invoiceUrl) {
      media = {
        url: req.body.invoiceUrl,
        filename: req.body.invoiceFilename || 'Invoice.pdf'
      };
    }
    const clientRecord = req.body.clientRecord || null;
    const rawText = req.body.rawText || req.body.messageText || req.body.text || '';

    if (!destination) {
      return res.status(400).json({ 
        success: false, 
        error: 'Destination phone number is required.' 
      });
    }

    const result = await sendAisensyNotification({
      campaignName,
      destination,
      userName,
      templateParams,
      media,
      clientRecord,
      rawText
    });

    // Return 200 with result payload so frontend handles errors gracefully without crashing
    return res.status(200).json(result);
  } catch (error) {
    console.error('[WhatsApp Route Error]', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal error processing WhatsApp message' 
    });
  }
});

export default router;
