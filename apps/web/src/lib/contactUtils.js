import { toast } from 'sonner';

/**
 * Format complete contact details with location & Google Maps navigation link for sharing with drivers/team.
 */
export function formatContactShareText(contact) {
  if (!contact) return '';

  const mapsUrl = contact.google_maps_url 
    ? contact.google_maps_url 
    : (contact.physical_address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.physical_address)}` : '');

  const lines = [
    `📍 *${contact.company_name || 'Contact Info'}* (${contact.contact_type || 'Contact'})`,
    ``,
    contact.phone_number ? `📞 *Phone:* ${contact.phone_number}` : null,
    contact.email ? `✉️ *Email:* ${contact.email}` : null,
    contact.gstin ? `📄 *GSTIN:* ${contact.gstin}` : null,
    contact.truck_brand ? `🔧 *Brands Serviced:* ${contact.truck_brand}` : null,
    ``,
    contact.physical_address ? `🏢 *Address:* ${contact.physical_address}` : null,
    mapsUrl ? `🗺️ *Google Maps Navigation:* ${mapsUrl}` : null,
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
  toast.success('Contact info shared via WhatsApp');
}

/**
 * Copy full formatted contact info to clipboard.
 */
export function copyContactDetails(contact) {
  if (!contact) return;
  const text = formatContactShareText(contact);
  navigator.clipboard.writeText(text);
  toast.success('Complete contact details & navigation link copied to clipboard');
}
