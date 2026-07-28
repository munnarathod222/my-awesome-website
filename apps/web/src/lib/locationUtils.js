/**
 * Utility functions for handling location links and Google Maps URLs across Jai Bhavani Cargo app.
 */

/**
 * Normalizes any pasted map URL, short link, coordinate, or address text into a valid external Google Maps URL.
 * Preserves exact pasted URLs (maps.app.goo.gl, google.com/maps, etc.) as requested by the user, while fixing dead legacy goo.gl/app/maps links.
 * 
 * @param {string} urlOrAddress - The map URL, short link, coordinates, or location address.
 * @param {string} [fallbackLocationName=''] - Fallback location name if urlOrAddress is an empty text string.
 * @returns {string} Fully qualified external https:// Google Maps URL.
 */
export function formatMapUrl(urlOrAddress, fallbackLocationName = '') {
  let raw = (urlOrAddress || '').trim();
  let fallback = (fallbackLocationName || '').trim();

  // Strip any trailing brackets, parentheses, quotes, punctuation or invalid end characters
  raw = raw.replace(/[\]\)\}>\s.,;'"]+$/, '').trim();

  if (!raw && !fallback) return '';

  // 1. If it's already a full HTTP/HTTPS URL, open the EXACT pasted link directly!
  if (/^https?:\/\//i.test(raw)) {
    // Only fix legacy broken "goo.gl/app/maps/" links that trigger Firebase errors
    if (/goo\.gl\/app\/maps/i.test(raw)) {
      if (fallback) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallback)}`;
      }
      return raw.replace(/goo\.gl\/app\/maps/i, 'maps.google.com/maps');
    }
    return raw;
  }

  // 2. If it starts with common map domains missing https:// (e.g. maps.app.goo.gl/..., goo.gl/maps/..., google.com/maps/...)
  if (/^(maps\.app\.goo\.gl|goo\.gl|maps\.google|www\.google\.com\/maps|google\.com\/maps|waze\.com|maps\.apple\.com)/i.test(raw)) {
    if (/goo\.gl\/app\/maps/i.test(raw)) {
      if (fallback) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallback)}`;
      }
      return `https://${raw.replace(/goo\.gl\/app\/maps/i, 'maps.google.com/maps')}`;
    }
    return `https://${raw}`;
  }

  // 3. Latitude,Longitude coordinates (e.g. "17.445, 78.685"):
  if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(raw)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(raw)}`;
  }

  // 4. Plain text address or location name:
  const query = raw || fallback;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Open a location smoothly on 1-click across Desktop, Android, and Apple iOS.
 * On mobile devices, direct window.location.href assignment triggers native Google Maps or Apple Maps apps seamlessly without popup blocking.
 */
export function openMapLocation(urlOrAddress, fallbackLocationName = '') {
  const validUrl = formatMapUrl(urlOrAddress, fallbackLocationName);
  if (!validUrl) return;

  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');

  if (isMobile) {
    // Mobile Chrome (Android) & Safari (iOS) launch Google Maps / Apple Maps app directly via location assignment
    window.location.href = validUrl;
  } else {
    // Desktop browser: open in new tab via dynamic anchor element
    try {
      const link = document.createElement('a');
      link.href = validUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(validUrl, '_blank', 'noopener,noreferrer');
    }
  }
}
