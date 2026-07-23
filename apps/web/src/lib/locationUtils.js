/**
 * Utility functions for handling location links and Google Maps URLs across Jai Bhavani Cargo app.
 */

/**
 * Normalizes any pasted map URL, short link, coordinate, or address text into a 100% valid external Google Maps URL.
 * Prevents relative URL routing errors (e.g. /contacts/maps.app.goo.gl) and invalid dynamic links.
 * 
 * @param {string} urlOrAddress - The map URL, short link, coordinates, or location address.
 * @param {string} [fallbackLocationName=''] - Fallback location name if urlOrAddress is empty.
 * @returns {string} Fully qualified external https:// Google Maps URL.
 */
export function formatMapUrl(urlOrAddress, fallbackLocationName = '') {
  const raw = (urlOrAddress || '').trim();
  const fallback = (fallbackLocationName || '').trim();
  const str = raw || fallback;

  if (!str) return '';

  // 1. If it's already a full valid HTTP/HTTPS URL:
  if (/^https?:\/\//i.test(str)) {
    return str;
  }

  // 2. If it starts with a common map domain missing https://:
  if (/^(maps\.app\.goo\.gl|goo\.gl|maps\.google|www\.google\.com\/maps|google\.com\/maps|waze\.com|maps\.apple\.com)/i.test(str)) {
    return `https://${str}`;
  }

  // 3. If it looks like latitude,longitude coordinates (e.g. "17.445,78.685" or "17.445, 78.685"):
  if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(str)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(str)}`;
  }

  // 4. If it contains a domain pattern (e.g. "goo.gl/xyz", "page.link/xyz"):
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\/.*/.test(str)) {
    return `https://${str}`;
  }

  // 5. Otherwise, treat it as a location name / address (e.g. "Ghatkesar BPCL" or "Patel Nagar, Hyderabad"):
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(str)}`;
}

/**
 * Open a location safely in a new browser tab.
 */
export function openMapLocation(urlOrAddress, fallbackLocationName = '') {
  const validUrl = formatMapUrl(urlOrAddress, fallbackLocationName);
  if (validUrl) {
    window.open(validUrl, '_blank', 'noopener,noreferrer');
  }
}
