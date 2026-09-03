/**
 * Aisensy WhatsApp Business API Service
 * Official Documentation: https://backend.aisensy.com/campaign/t1/api/v2
 */

// Helper to clean and format Indian mobile numbers into standard 12-digit format (e.g. 919876543210)
export function formatWhatsAppPhone(phoneStr) {
  if (!phoneStr) return '';
  const digits = String(phoneStr).replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

// User pre-approved Aisensy campaign templates
export const APPROVED_TEMPLATES = [
  'loading_dock_locations',
  'payment_reminder_document',
  'driver_dispatch',
  'pod_with_invoice',
  'pod_notification',
  'driver_salary',
  'driver_advance',
  'payment_reminder'
];

// Normalize campaign names (e.g. "loading dock locations" -> "loading_dock_locations")
export function normalizeCampaignName(rawName) {
  if (!rawName) return 'loading_dock_locations';
  const clean = String(rawName).trim().toLowerCase().replace(/[\s-]+/g, '_');

  const aliases = {
    'loading_dock_locations': 'loading_dock_locations',
    'loading_dock': 'loading_dock_locations',
    'dock_locations': 'loading_dock_locations',
    'driver_dispatch': 'driver_dispatch',
    'dispatch': 'driver_dispatch',
    'payment_reminder_document': 'payment_reminder_document',
    'payment_reminder_invoice': 'payment_reminder_document',
    'payment_reminder': 'payment_reminder',
    'payment_due': 'payment_reminder',
    'pod_with_invoice': 'pod_with_invoice',
    'pod_invoice': 'pod_with_invoice',
    'pod_notification': 'pod_notification',
    'pod_proof': 'pod_notification',
    'driver_salary': 'driver_salary',
    'salary': 'driver_salary',
    'driver_advance': 'driver_advance',
    'advance': 'driver_advance'
  };

  return aliases[clean] || (APPROVED_TEMPLATES.includes(clean) ? clean : clean);
}

/**
 * Check if Aisensy API Key is configured in environment
 */
export function isAisensyConfigured() {
  const key = process.env.AISENSY_API_KEY || process.env.WHATSAPP_API_KEY || '';
  return Boolean(key && key.trim().length > 10);
}

/**
 * Core function to send WhatsApp campaign message via Aisensy API
 */
export async function sendAisensyNotification({
  campaignName = 'loading_dock_locations',
  destination = '',
  userName = 'Customer',
  templateParams = [],
  media = null,
  clientRecord = null,
  rawText = ''
}) {
  const cleanPhone = formatWhatsAppPhone(destination);
  if (!cleanPhone) {
    return {
      success: false,
      error: 'Invalid recipient phone number. Please enter a valid 10-digit mobile number.'
    };
  }

  const normalizedCampaign = normalizeCampaignName(campaignName);
  const apiKey = (process.env.AISENSY_API_KEY || process.env.WHATSAPP_API_KEY || '').trim();

  // If API key is not configured in Render environment variables
  if (!apiKey) {
    console.warn(`[Aisensy] ⚠️ AISENSY_API_KEY is not configured in Render environment. Destination: +${cleanPhone}, Campaign: ${normalizedCampaign}`);
    return {
      success: false,
      needsApiKey: true,
      error: 'Aisensy API Key is not configured yet. Please find your API key in app.aisensy.com (Manage -> API Key) and add it as AISENSY_API_KEY in Render. Or use the "Open wa.me" button to send via WhatsApp Web instantly for free.',
      campaignName: normalizedCampaign,
      phone: cleanPhone
    };
  }

  // Build payload for official Aisensy Cloud API
  const payload = {
    apiKey: apiKey,
    campaignName: normalizedCampaign,
    destination: cleanPhone,
    userName: userName || 'Customer',
    templateParams: Array.isArray(templateParams) ? templateParams : [],
    source: 'jaibhavanicargo-portal'
  };

  if (media && media.url) {
    payload.media = {
      url: media.url,
      filename: media.filename || 'Document.pdf'
    };
  }

  console.log(`[Aisensy API Request] Dispatching campaign "${normalizedCampaign}" to +${cleanPhone}...`);

  try {
    const res = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    console.log(`[Aisensy API Response] Status: ${res.status}`, JSON.stringify(data));

    if (!global._whatsappLogs) global._whatsappLogs = [];
    global._whatsappLogs.push({
      timestamp: new Date().toISOString(),
      campaignName: normalizedCampaign,
      destination: cleanPhone,
      statusCode: res.status,
      response: data
    });
    if (global._whatsappLogs.length > 50) global._whatsappLogs.shift();

    if (res.ok && (data.status === 'success' || data.success === true || data.submitted_message_id || data.messageId)) {
      return {
        success: true,
        provider: 'aisensy',
        phone: cleanPhone,
        campaignName: normalizedCampaign,
        messageId: data.submitted_message_id || data.messageId || 'sent',
        data
      };
    }

    const errMsg = data.message || data.error || `Aisensy API returned status ${res.status}`;
    return {
      success: false,
      error: `Aisensy: ${errMsg}`,
      campaignName: normalizedCampaign,
      details: data
    };
  } catch (err) {
    console.error('[Aisensy Exception]', err);
    return {
      success: false,
      error: `Network error connecting to Aisensy API: ${err.message}`
    };
  }
}
