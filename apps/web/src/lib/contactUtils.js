import { toast } from 'sonner';
import { formatMapUrl } from './locationUtils.js';

/**
 * Extract and normalize Google Maps URL from contact record.
 */
export function getPastedMapUrl(contact) {
  if (!contact) return '';

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
      const formatted = formatMapUrl(val, contact.physical_address || contact.company_name);
      if (formatted) return formatted;
    }
  }

  // Scan all fields for any url containing maps or goo.gl
  for (const key of Object.keys(contact)) {
    const val = contact[key];
    if (typeof val === 'string' && val.trim()) {
      if (val.includes('maps') || val.includes('goo.gl')) {
        const urlMatch = val.match(/(https?:\/\/[^\s]+|maps\.app\.goo\.gl[^\s]+|goo\.gl\/maps[^\s]+|google\.com\/maps[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\/[^\s]+)/i);
        if (urlMatch) {
          return formatMapUrl(urlMatch[1], contact.physical_address || contact.company_name);
        }
      }
    }
  }

  // Fallback scan on physical_address or notes
  if (contact.physical_address) {
    return formatMapUrl(contact.physical_address, contact.company_name);
  }
  if (contact.company_name) {
    return formatMapUrl('', contact.company_name);
  }

  return '';
}

/**
 * Format contact details for sharing.
 */
export function formatContactShareText(contact) {
  if (!contact) return '';

  let mapsUrl = getPastedMapUrl(contact);

  // If no explicit map URL was pasted in record, generate a direct Google Maps search link from company & address
  if (!mapsUrl && (contact.physical_address || contact.company_name)) {
    const queryParts = [contact.company_name, contact.physical_address].filter(Boolean).join(', ');
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryParts)}`;
  }

  const cleanNotes = contact.notes 
    ? contact.notes.replace(/\[Location:\s*https?:\/\/[^\]]+\]/gi, '').trim() 
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
}

/**
 * Copy contact details formatted text to clipboard.
 */
export async function copyContactDetails(contact) {
  if (!contact) return;
  const shareText = formatContactShareText(contact);

  try {
    await navigator.clipboard.writeText(shareText);
    toast.success('Contact details copied to clipboard');
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    toast.error('Failed to copy to clipboard');
  }
}
