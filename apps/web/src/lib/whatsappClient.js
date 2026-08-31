/**
 * Frontend client helper for Aisensy WhatsApp API integration
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Check if Aisensy API Key is configured on the backend
 */
export async function getWhatsAppApiStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/whatsapp/status`);
    if (!res.ok) return { configured: false, provider: 'aisensy' };
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Failed to fetch WhatsApp API status:', err);
    return { configured: false, provider: 'aisensy', error: err.message };
  }
}

/**
 * Send WhatsApp notification via Aisensy API
 */
export async function sendWhatsAppNotification(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error dispatching WhatsApp API request:', err);
    return { success: false, error: err.message || 'Network error sending WhatsApp message' };
  }
}
