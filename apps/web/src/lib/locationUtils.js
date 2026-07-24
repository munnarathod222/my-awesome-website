/**
 * Utility functions for handling location links and Google Maps URLs across Jai Bhavani Cargo app.
 */

/**
 * Normalizes any pasted map URL, short link, coordinate, or address text into a 100% valid external Google Maps URL.
 * Fixes dead Firebase Dynamic Links (goo.gl/app/maps/...) and prevents relative routing errors.
 * 
 * @param {string} urlOrAddress - The map URL, short link, coordinates, or location address.
 * @param {string} [fallbackLocationName=''] - Fallback location name if urlOrAddress is empty or invalid.
 * @returns {string} Fully qualified external https:// Google Maps URL.
 */
export function formatMapUrl(urlOrAddress, fallbackLocationName = '') {
  const raw = (urlOrAddress || '').trim();
  const fallback = (fallbackLocationName || '').trim();

  if (!raw && !fallback) return '';

  // 1. Detect dead Firebase Dynamic Links (e.g. goo.gl/app/maps/...)
  const isLegacyFirebaseDynamicLink = /goo\.gl\/app\/maps/i.test(raw) || /goo\.gl\/maps/i.test(raw) || /page\.link\/maps/i.test(raw);

  if (isLegacyFirebaseDynamicLink) {
    // If fallback company name or address is available, convert to clean Google Maps search query
    if (fallback) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallback)}`;
    }
    
    // Otherwise, strip dynamic params (?_nr=1 etc) and format as direct query
    const cleanRaw = raw.replace(/\?.*$/, '').replace(/https?:\/\//i, '');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanRaw)}`;
  }

  // 2. If it's already a valid HTTP/HTTPS URL (and not a broken legacy link):
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  // 3. If it starts with common map domains missing https://:
  if (/^(maps\.app\.goo\.gl|maps\.google|www\.google\.com\/maps|google\.com\/maps|waze\.com|maps\.apple\.com)/i.test(raw)) {
    return `https://${raw}`;
  }

  // 4. If it looks like latitude,longitude coordinates (e.g. "17.445,78.685"):
  if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(raw)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(raw)}`;
  }

  // 5. If it looks like a domain url missing http/https:
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\/.*/.test(raw)) {
    return `https://${raw}`;
  }

  // 6. Otherwise, treat as location query (e.g. address or company name):
  const query = raw || fallback;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
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
