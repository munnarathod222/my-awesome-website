import { toast } from 'sonner';

/**
 * Get the exact pasted map URL from a contact record.
 * Never constructs artificial search queries that fail on Google Maps.
 */
export function getPastedMapUrl(contact) {
  if (!contact) return '';

  // 1. Explicit map URL fields
  const explicitFields = [
    contact.google_maps_url,
    contact.google_map_link,
    contact.maps_url,
    contact.location_url,
    contact.map_url,
    contact.google_map,
    contact.maps_link,
    contact.link,
    contact.url
  ];

  for (const field of explicitFields) {
    if (field && typeof field === 'string' && (field.trim().startsWith('http://') || field.trim().startsWith('https://'))) {
      return field.trim();
    }
  }

  // 2. Scan all string properties on contact for any http/https URL
  for (const key of Object.keys(contact)) {
    const val = contact[key];
    if (typeof val === 'string' && (val.trim().startsWith('http://') || val.trim().startsWith('https://'))) {
      return val.trim();
    }
  }

  // 3. Scan physical_address or notes for an embedded URL link
  const urlRegex = /(https?:\/\/[^\s]+)/i;
  if (contact.physical_address) {
    const match = contact.physical_address.match(urlRegex);
    if (match) return match[1].trim();
  }
  if (contact.notes) {
    const match = contact.notes.match(urlRegex);
    if (match) return match[1].trim();
  }

  return '';
}

/**
 * Format complete contact details including exact pasted Google Maps URL.
 */
export function formatContactShareText(contact) {
  if (!contact) return '';

  const mapsUrl = getPastedMapUrl(contact);

  const lines = [
    `📍 *${contact.company_name || 'Contact Info'}* (${contact.contact_type || 'Contact'})`,
    ``,
    contact.phone_number ? `📞 *Phone:* ${contact.phone_number}` : null,
    contact.email ? `✉️ *Email:* ${contact.email}` : null,
    contact.gstin ? `📄 *GSTIN:* ${contact.gstin}` : null,
    contact.truck_brand ? `🔧 *Brands Serviced:* ${contact.truck_brand}` : null,
    ``,
    contact.physical_address && !contact.physical_address.startsWith('http') ? `🏢 *Address:* ${contact.physical_address}` : null,
    mapsUrl ? `🗺️ *Google Maps Location:* ${mapsUrl}` : null,
    ``,
    contact.notes && !contact.notes.startsWith('http') ? `📝 *Notes:* ${contact.notes}` : null,
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
  toast.success('Contact details & Google Maps URL shared via WhatsApp');
}

/**
 * Copy formatted contact details & map URL to clipboard.
 */
export function copyContactDetails(contact) {
  if (!contact) return;
  const text = formatContactShareText(contact);
  navigator.clipboard.writeText(text);
  toast.success('Contact details & Google Maps URL copied to clipboard');
}
