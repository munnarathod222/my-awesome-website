import { toast } from 'sonner';
import { formatMapUrl } from './locationUtils.js';

/**
 * Extract and normalize Google Maps URL from contact record.
 * Handles explicit map fields, notes scanning, and fallback address/company generation.
 */
export function getPastedMapUrl(contact) {
  if (!contact) return '';

  const fallbackLocation = [
    contact.company_name,
    contact.physical_address,
    contact.warehouse_name,
    contact.designation
  ].filter(Boolean).join(', ');

  const explicitFields = [
    contact.google_maps_url,
    contact.google_map_link,
    contact.maps_url,
    contact.location_url,
    contact.map_url,
    contact.google_map,
    contact.maps_link,
    contact.location,
    contact.link,
    contact.url
  ];

  for (const val of explicitFields) {
    if (val && typeof val === 'string' && val.trim()) {
      const formatted = formatMapUrl(val, fallbackLocation);
      if (formatted) return formatted;
    }
  }

  // Scan all fields for any url containing maps or goo.gl
  for (const key of Object.keys(contact)) {
    const val = contact[key];
    if (typeof val === 'string' && val.trim()) {
      if (val.includes('maps') || val.includes('goo.gl')) {
        const urlMatch = val.match(/(https?:\/\/[^\s\]\)>"']+|maps\.app\.goo\.gl[^\s\]\)>"']+|goo\.gl\/maps[^\s\]\)>"']+|google\.com\/maps[^\s\]\)>"']+|[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\/[^\s\]\)>"']+)/i);
        if (urlMatch) {
          const rawUrl = urlMatch[1].replace(/[\]\)\}>\s.,;'"]+$/, '').trim();
          return formatMapUrl(rawUrl, fallbackLocation);
        }
      }
    }
  }

  // Fallback scan on physical_address or company_name
  if (fallbackLocation) {
    return formatMapUrl('', fallbackLocation);
  }

  return '';
}

/**
 * Format contact details for sharing via WhatsApp or Web Share.
 */
export function formatContactShareText(contact) {
  if (!contact) return '';

  let mapsUrl = getPastedMapUrl(contact);

  if (!mapsUrl && (contact.physical_address || contact.company_name)) {
    const queryParts = [contact.company_name, contact.physical_address].filter(Boolean).join(', ');
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryParts)}`;
  }

  const cleanNotes = contact.notes 
    ? contact.notes
        .replace(/\[?Location:\s*https?:\/\/[^\]\s\n]+\]?/gi, '')
        .replace(/Location:\s*https?:\/\/[^\s\n]+/gi, '')
        .trim() 
    : '';

  const lines = [
    `📍 *${contact.company_name || 'Contact Info'}* (${contact.contact_type || 'Contact'})`,
    ``,
    contact.phone_number ? `📞 *Phone:* ${contact.phone_number}` : null,
    contact.email ? `✉️ *Email:* ${contact.email}` : null,
    contact.gstin ? `📄 *GSTIN:* ${contact.gstin}` : null,
    contact.truck_brand ? `🔧 *Brands Serviced:* ${contact.truck_brand}` : null,
    ``,
    contact.physical_address && !contact.physical_address.startsWith('http') ? `🏢 *Address:* ${contact.physical_address}` : null,
    mapsUrl ? `🗺️ *Location:* ${mapsUrl}` : null,
    ``,
    cleanNotes && !cleanNotes.startsWith('http') ? `📝 *Notes:* ${cleanNotes}` : null,
    ``,
    `Shared via Jai Bhavani Cargo`
  ].filter(line => line !== null);

  return lines.join('\n');
}

/**
 * Share contact details via Web Share API or WhatsApp.
 */
export async function shareContact(contact) {
  if (!contact) return;
  const shareText = formatContactShareText(contact);

  if (navigator.share) {
    try {
      await navigator.share({
        title: contact.company_name || 'Contact Info',
        text: shareText,
      });
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Web Share API failed, falling back to WhatsApp:', err);
      } else {
        return;
      }
    }
  }

  // Fallback to WhatsApp link
  const encodedText = encodeURIComponent(shareText);
  window.open(`https://wa.me/?text=${encodedText}`, '_blank');
}

/**
 * Copy contact details to clipboard.
 */
export async function copyContactDetails(contact) {
  if (!contact) return;
  const text = formatContactShareText(contact);
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Contact details copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy contact details:', err);
    toast.error('Failed to copy contact details.');
  }
}
