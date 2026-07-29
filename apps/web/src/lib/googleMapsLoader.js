/**
 * Google Maps SDK Loader & Directions Helper
 * Key: AIzaSyBXRQlXqTPEntI_207Epi3PkTm4FamduR8
 */

export const GOOGLE_MAPS_API_KEY = 'AIzaSyBXRQlXqTPEntI_207Epi3PkTm4FamduR8';

let mapsPromise = null;

export function loadGoogleMapsScript() {
  if (typeof window === 'undefined') return Promise.reject('Window undefined');
  if (window.google && window.google.maps) return Promise.resolve(window.google.maps);

  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve, reject) => {
    // Check if script element already exists
    const existingScript = document.getElementById('google-maps-js-sdk');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google.maps));
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-js-sdk';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps SDK loaded but google.maps undefined'));
      }
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return mapsPromise;
}

/**
 * Calculates driving route distance and duration via Google Maps Directions API
 */
export async function calculateGoogleRoute(origin, destination) {
  const maps = await loadGoogleMapsScript();
  const directionsService = new maps.DirectionsService();

  return new Promise((resolve, reject) => {
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: maps.TravelMode.DRIVING,
        unitSystem: maps.UnitSystem.METRIC,
      },
      (result, status) => {
        if (status === maps.DirectionsStatus.OK && result.routes.length > 0) {
          const route = result.routes[0];
          const leg = route.legs[0];
          resolve({
            distanceKm: Math.round(leg.distance.value / 1000),
            distanceText: leg.distance.text,
            durationText: leg.duration.text,
            durationMins: Math.round(leg.duration.value / 60),
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            startLocation: leg.start_location,
            endLocation: leg.end_location,
            rawDirections: result
          });
        } else {
          reject(new Error(`Google Maps Directions failed: ${status}`));
        }
      }
    );
  });
}
