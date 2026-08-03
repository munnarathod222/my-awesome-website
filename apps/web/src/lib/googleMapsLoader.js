/**
 * Clean Google Maps Loader - No External Script Loading
 */

export const GOOGLE_MAPS_API_KEY = '';

export function loadGoogleMapsScript() {
  return Promise.resolve(null);
}

export function getIndianRouteDistance(origin, destination) {
  return {
    distanceKm: 708,
    durationText: '12 hours 45 mins',
    exact: false
  };
}

export const calculateGoogleRoute = getIndianRouteDistance;
