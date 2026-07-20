import { toast } from 'sonner';

/**
 * Extract explicit Google Maps URL from contact record or fields.
 */
export function extractGoogleMapsUrl(contact) {
  if (!contact) return '';

  // 1. Check explicit fields
  const explicit = contact.google_maps_url || contact.google_map_link || contact.maps_url || contact.location_url || contact.map_url;
  if (explicit && explicit.trim().startsWith('http')) {
    return explicit.trim();
  }

  // 2. Check if user pasted a URL inside physical_address or notes
  const urlRegex = /(https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.[a-z]+\/maps|maps\.google\.[a-z]+)\/[^\s]+)/i;

  if (contact.physical_address) {
    const match = contact.physical_address.match(urlRegex);
    if (match) return match[1];
  }
  if (contact.notes) {
    const match = contact.notes.match(urlRegex);
    if (match) return match[1];
  }

  // 3. Fallback to search query link if physical address is plain text
  if (contact.physical_address && !contact.physical_address.startsWith('http')) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.physical_address)}`;
  }

  return '';
}

/**
 * Format complete contact details with location & Google Maps navigation link for sharing with drivers/team.
 */
export function formatContactShareText(contact) {
  if (!contact) return '';

  const mapsUrl = extractGoogleMapsUrl(contact);

  const lines = [
    `📍 *${contact.company_name || 'Contact Info'}* (${contact.contact_type || 'Contact'})`,
    ``,
    contact.phone_number ? `📞 *Phone:* ${contact.phone_number}` : null,
    contact.email ? `✉️ *Email:* ${contact.email}` : null,
    contact.gstin ? `📄 *GSTIN:* ${contact.gstin}` : null,
    contact.truck_brand ? `🔧 *Brands Serviced:* ${contact.truck_brand}` : null,
    ``,
    contact.physical_address && !contact.physical_address.startsWith('http') ? `🏢 *Address:* ${contact.physical_address}` : null,
    mapsUrl ? `🗺️ *Google Maps GPS Navigation:* ${mapsUrl}` : null,
    ``,
    contact.notes ? `📝 *Notes:* ${contact.notes}` : null,
    ``,
    `Shared via Jai Bhavani Cargo`
  ].filter(line => line !== null);

  return lines.join('\n');
}

/**
 * Share contact details via Web Share API or open WhatsApp Web / App directly.
 */
export async function shareContact(contact) {
  if (!contact) return;
  const shareText = formatContactShareText(contact);

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${contact.company_name} Contact Details`,
        text: shareText
      });
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Web share failed:', err);
      }
    }
  }

  // Fallback to WhatsApp share
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  window.open(whatsappUrl, '_blank');
  toast.success('Contact info & Google Maps URL shared via WhatsApp');
}

/**
 * Copy formatted contact text to clipboard.
 */
export function copyContactDetails(contact) {
  if (!contact) return;
  const text = formatContactShareText(contact);
  navigator.clipboard.writeText(text);
  toast.success('Contact details & Google Maps URL copied to clipboard');
}
