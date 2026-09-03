import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

const AISENSY_BASE_URL = 'https://backend.aisensy.com/campaign/t1/api/v2';

/**
 * Clean phone number to format expected by WhatsApp/Aisensy:
 * E.g., "+91 81067 29777" -> "918106729777"
 */
function cleanPhoneNumber(rawPhone) {
  if (!rawPhone) return '';
  let digits = String(rawPhone).replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    digits = '91' + digits;
  }
  return digits;
}

/**
 * GET /api/whatsapp/status
 * Check configuration status of Aisensy WhatsApp integration
 */
router.get(['/status', '/api/status'], (req, res) => {
  const apiKey = process.env.AISENSY_API_KEY || '';
  const campaignName = process.env.AISENSY_CAMPAIGN_NAME || '';
  const defaultPhone = process.env.WHATSAPP_PHONE_NUMBER || '+917794072244';

  res.json({
    configured: Boolean(apiKey && apiKey.length > 5),
    provider: 'aisensy',
    campaignName: campaignName || 'default',
    defaultPhone,
    hasApiKey: Boolean(apiKey)
  });
});

/**
 * POST /api/whatsapp/send
 * Dispatch message via Aisensy WhatsApp API
 */
router.post(['/send', '/message', '/dispatch'], async (req, res) => {
  try {
    const apiKey = req.body.apiKey || process.env.AISENSY_API_KEY;

    if (!apiKey) {
      logger.warn('⚠️ Aisensy WhatsApp dispatch failed: AISENSY_API_KEY not configured in environment variables');
      return res.status(400).json({
        success: false,
        error: 'AISENSY_API_KEY is not configured. Please add AISENSY_API_KEY to your Render environment variables.',
        provider: 'aisensy'
      });
    }

    const {
      campaignName = process.env.AISENSY_CAMPAIGN_NAME || 'default',
      destination,
      phone,
      recipient,
      userName,
      name,
      templateParams = [],
      tags = [],
      attributes = {},
      media = null,
      buttons = []
    } = req.body;

    const targetPhone = destination || phone || recipient;
    const cleanPhone = cleanPhoneNumber(targetPhone);

    if (!cleanPhone) {
      return res.status(400).json({
        success: false,
        error: 'Recipient destination phone number is required.'
      });
    }

    // Build payload for Aisensy v2 API
    const aisensyPayload = {
      apiKey: apiKey.trim(),
      campaignName: String(campaignName || '').trim(),
      destination: cleanPhone,
      userName: String(userName || name || 'Valued Customer').trim(),
      templateParams: Array.isArray(templateParams) ? templateParams : [],
      source: 'api',
      media: media || undefined,
      buttons: Array.isArray(buttons) && buttons.length > 0 ? buttons : undefined,
      tags: Array.isArray(tags) ? tags : undefined,
      attributes: attributes && typeof attributes === 'object' ? attributes : undefined
    };

    logger.info(`📤 Forwarding WhatsApp message to Aisensy: Campaign="${aisensyPayload.campaignName}", Destination=${cleanPhone}`);

    const response = await fetch(AISENSY_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(aisensyPayload)
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      logger.error(`❌ Aisensy API returned HTTP ${response.status}:`, responseData);
      return res.status(response.status >= 400 && response.status < 500 ? response.status : 502).json({
        success: false,
        error: responseData.message || responseData.error || `Aisensy API returned status ${response.status}`,
        details: responseData
      });
    }

    logger.info(`✅ Aisensy WhatsApp message dispatched successfully to ${cleanPhone}:`, responseData);

    return res.json({
      success: true,
      message: 'WhatsApp notification dispatched via Aisensy',
      data: responseData
    });
  } catch (err) {
    logger.error('❌ Unexpected error in /api/whatsapp/send:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error processing WhatsApp message'
    });
  }
});

export default router;
