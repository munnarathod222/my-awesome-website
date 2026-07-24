/**
 * Utility functions for handling location links and Google Maps URLs across Jai Bhavani Cargo app.
 */

/**
 * Normalizes any pasted map URL, short link, coordinate, or address text into a 100% valid external Google Maps URL.
 * Completely eliminates dead Firebase Dynamic Links (goo.gl/app/maps/...) which throw "Invalid Dynamic Link".
 * 
 * @param {string} urlOrAddress - The map URL, short link, coordinates, or location address.
 * @param {string} [fallbackLocationName=''] - Fallback location name if urlOrAddress is empty or a legacy dead link.
 * @returns {string} Fully qualified external https:// Google Maps URL.
 */
export function formatMapUrl(urlOrAddress, fallbackLocationName = '') {
  let raw = (urlOrAddress || '').trim();
  let fallback = (fallbackLocationName || '').trim();

  // 1. Detect dead Firebase Dynamic Links (e.g. goo.gl/app/maps/... or goo.gl/maps/...)
  const isLegacyFirebaseDynamicLink = /goo\.gl\/app\/maps/i.test(raw) || /goo\.gl\/maps/i.test(raw) || /page\.link\/maps/i.test(raw);

  if (isLegacyFirebaseDynamicLink) {
    // CRITICAL: Never redirect or pass goo.gl/app/maps to Google Maps search as Google Maps will resolve the shortlink and hit Firebase's dead "Invalid Dynamic Link" page.
    const searchQuery = fallback || 'Jai Bhavani Cargo Location';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
  }

  if (!raw && !fallback) return '';

  // 2. Modern valid Google Maps app share links (e.g. maps.app.goo.gl/XYZ):
  if (/^https?:\/\/maps\.app\.goo\.gl/i.test(raw)) {
    return raw;
  }
  if (/^maps\.app\.goo\.gl/i.test(raw)) {
    return `https://${raw}`;
  }

  // 3. Full valid HTTP/HTTPS URLs (excluding dead goo.gl links):
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  // 4. Common map domains missing https://:
  if (/^(maps\.google|www\.google\.com\/maps|google\.com\/maps|waze\.com|maps\.apple\.com)/i.test(raw)) {
    return `https://${raw}`;
  }

  // 5. Latitude,Longitude coordinates (e.g. "17.445, 78.685"):
  if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(raw)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(raw)}`;
  }

  // 6. Generic address or location name:
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
