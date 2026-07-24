/**
 * Utility functions for handling location links and Google Maps URLs across Jai Bhavani Cargo app.
 */

/**
 * Normalizes any pasted map URL, short link, coordinate, or address text into a 100% valid external Google Maps URL.
 * Completely eliminates dead Firebase Dynamic Links (goo.gl/app/maps/..., goo.gl/maps/..., etc.) which throw "Invalid Dynamic Link".
 * 
 * @param {string} urlOrAddress - The map URL, short link, coordinates, or location address.
 * @param {string} [fallbackLocationName=''] - Fallback location name if urlOrAddress is empty or a legacy dead shortlink.
 * @returns {string} Fully qualified external https:// Google Maps URL.
 */
export function formatMapUrl(urlOrAddress, fallbackLocationName = '') {
  let raw = (urlOrAddress || '').trim();
  let fallback = (fallbackLocationName || '').trim();

  // 1. Detect ALL shortlinks & legacy Firebase Dynamic Links (goo.gl/app/maps, goo.gl/maps, goo.gl, page.link, etc.)
  const isShortlinkOrDynamicLink = 
    /goo\.gl/i.test(raw) || 
    /page\.link/i.test(raw) || 
    /g\.co\/maps/i.test(raw);

  if (isShortlinkOrDynamicLink) {
    // CRITICAL: Never pass or open goo.gl / shortlinks directly because Firebase Dynamic Links service was shut down by Google and returns "Invalid Dynamic Link".
    // Convert to direct Google Maps search query URL using fallback location name or clean text.
    let searchQuery = fallback;

    if (!searchQuery) {
      const cleanRaw = raw
        .replace(/https?:\/\/[^\s]+/i, '')
        .replace(/[^\w\s,.-]/gi, ' ')
        .trim();
      searchQuery = cleanRaw || 'Jai Bhavani Cargo Location';
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
  }

  if (!raw && !fallback) return '';

  // 2. Full valid HTTP/HTTPS URLs (e.g. https://www.google.com/maps/place/... or https://maps.google.com/...):
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  // 3. Common map domains missing https://:
  if (/^(maps\.google|www\.google\.com\/maps|google\.com\/maps|waze\.com|maps\.apple\.com)/i.test(raw)) {
    return `https://${raw}`;
  }

  // 4. Latitude,Longitude coordinates (e.g. "17.445, 78.685"):
  if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(raw)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(raw)}`;
  }

  // 5. Generic address or location name:
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
