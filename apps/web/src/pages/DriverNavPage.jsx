import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { MapPin, Navigation, Phone, Truck, Clock, AlertTriangle, CheckCircle2, Shield, ChevronRight, Building2, Map, UserCheck } from 'lucide-react';
import pb from '../lib/pocketbaseClient.js';

// Resolve Staff Hierarchy: Dispatcher -> Operations Manager -> Managing Director / Super Admin
async function resolveSupportContact(trip, searchParams) {
  let companyContact = {
    name: 'Vinod Kumar Rathod',
    role: 'Managing Director',
    phone: '+91 7794072244'
  };

  try {
    const compRecord = await pb.collection('company_settings').getOne('companysettings', { $autoCancel: false }).catch(() => null);
    if (compRecord) {
      companyContact = {
        name: compRecord.signatory_name || 'Vinod Kumar Rathod',
        role: compRecord.signatory_title || 'Managing Director',
        phone: compRecord.company_phone || '+91 7794072244'
      };
    }
  } catch (e) {
    console.warn('Company settings fetch warning:', e);
  }

  const isValidRealPhone = (ph) => {
    if (!ph) return false;
    const clean = String(ph).replace(/[^0-9]/g, '');
    return clean.length >= 10 && !clean.includes('9876543210') && !clean.includes('9876543211') && !clean.includes('6281618046');
  };

  try {
    const dispatcherId = trip?.dispatcher_id || trip?.created_by;
    if (dispatcherId) {
      const u = await pb.collection('users').getOne(dispatcherId, { $autoCancel: false }).catch(() => null);
      if (u && u.status !== 'Terminated' && u.status !== 'Inactive' && u.role === 'dispatcher') {
        const p = u.phone || u.mobile;
        if (isValidRealPhone(p)) {
          return { name: u.name || 'Assigned Dispatcher', role: 'Fleet Dispatcher', phone: String(p).trim() };
        }
      }
    }
  } catch (err) {
    console.warn('Dispatcher lookup notice:', err);
  }

  return companyContact;
}

// Universal Native Android Intent & iOS Map Launcher (Works in Chrome, WebViews & WhatsApp)
const openMapNavigation = (mapUrl, e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  if (!mapUrl) return;

  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const convertToAppScheme = (urlStr, os) => {
    try {
      const decodedUrlStr = urlStr.replace(/&amp;/g, '&');
      const urlObj = new URL(decodedUrlStr);
      const origin = urlObj.searchParams.get('origin');
      const destination = urlObj.searchParams.get('destination');
      const waypoints = urlObj.searchParams.get('waypoints');

      if (os === 'ios') {
        if (origin && destination) {
          let daddr = destination;
          if (waypoints) {
            const waypointList = waypoints.split('|');
            daddr = waypointList.join('+to:') + '+to:' + destination;
          }
          return `comgooglemaps://?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(daddr)}&directionsmode=driving`;
        }

        const query = urlObj.searchParams.get('query');
        if (query) {
          return `comgooglemaps://?q=${encodeURIComponent(query)}`;
        }

        return urlStr.replace(/^https?:\/\/(www\.)?google\.com\/maps\/?/, 'comgooglemaps://');
      } else if (os === 'android') {
        const cleanPath = urlStr.replace(/^https?:\/\/(www\.)?google\.com\/maps\/?/, '');
        return `intent://www.google.com/maps/${cleanPath}#Intent;scheme=https;package=com.google.android.apps.maps;end;`;
      }
    } catch (err) {
      if (os === 'ios') {
        return urlStr.replace(/^https?:\/\/(www\.)?google\.com\/maps\/?/, 'comgooglemaps://');
      }
    }
    return urlStr;
  };

  if (isAndroid) {
    if (mapUrl.includes('google.com/maps')) {
      const androidIntentUrl = convertToAppScheme(mapUrl, 'android');
      try {
        window.location.href = androidIntentUrl;
        return;
      } catch (err) {
        console.warn('Android Intent trigger failed:', err);
      }
    }
    window.location.href = mapUrl;
  } else if (isIOS) {
    const iosUrl = convertToAppScheme(mapUrl, 'ios');
    const start = Date.now();
    
    // Set fallback timeout if Google Maps app is not installed
    const fallbackTimeout = setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.location.href = mapUrl;
      }
    }, 1200);

    window.location.href = iosUrl;
  } else {
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  }
};

export default function DriverNavPage() {
  const [searchParams] = useSearchParams();
  const routeParams = useParams();
  const tripParam = routeParams?.tripId || searchParams.get('trip') || searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);
  const [routeObj, setRouteObj] = useState(null);
  const [error, setError] = useState(null);
  const [supportContact, setSupportContact] = useState({ name: 'Vinod Kumar Rathod', role: 'Managing Director', phone: '+91 7794072244' });

  useEffect(() => {
    async function fetchTripDetails() {
      if (!tripParam) {
        setLoading(false);
        setError('No trip reference provided in link.');
        return;
      }

      try {
        setLoading(true);
        let record = null;

        // Attempt 1: Fetch by exact PocketBase record ID
        try {
          record = await pb.collection('trip_logs').getOne(tripParam, { $autoCancel: false });
        } catch (e1) {
          // Attempt 2: Search by id / lr_number / trip_id
          try {
            const list = await pb.collection('trip_logs').getList(1, 1, {
              filter: `id = "${tripParam}" || lr_number = "${tripParam}" || trip_id = "${tripParam}"`,
              $autoCancel: false
            });
            if (list.items && list.items.length > 0) {
              record = list.items[0];
            }
          } catch (e2) {
            console.warn('PocketBase unauthenticated search fallback:', e2);
          }
        }

        // Fetch associated route record if route_id exists
        if (record && record.route_id) {
          try {
            const rData = await pb.collection('routes').getOne(record.route_id, { $autoCancel: false });
            if (rData) setRouteObj(rData);
          } catch (rErr) {
            console.warn('Route record fetch warning:', rErr);
          }
        }

        // Fail-safe fallback to URL query parameters
        const urlTruck = searchParams.get('truck');
        const urlOrigin = searchParams.get('origin');
        const urlDest = searchParams.get('dest');
        const urlLr = searchParams.get('lr');
        const urlDriver = searchParams.get('driver');

        if (!record && (urlTruck || urlOrigin || urlDest || urlLr)) {
          record = {
            id: tripParam,
            trip_id: urlLr || tripParam,
            lr_number: urlLr || tripParam,
            truck_number: urlTruck || 'TRUCK DISPATCH',
            driver_name: urlDriver || 'Assigned Driver',
            start_location: urlOrigin || 'Loading Dock',
            end_location: urlDest || 'Delivery Dock',
            start_location_map_link: searchParams.get('start_map') || '',
            end_location_map_link: searchParams.get('end_map') || '',
            loading_supervisor_phone: searchParams.get('start_phone') || '',
            unloading_supervisor_phone: searchParams.get('end_phone') || '',
            trip_status: 'Active Dispatch'
          };
        }

        if (record) {
          setTrip(record);
          setError(null);
          const contact = await resolveSupportContact(record, searchParams);
          setSupportContact(contact);
        } else {
          setError('Trip details not found. Please contact your dispatcher.');
        }
      } catch (err) {
        console.error('Failed to load driver trip:', err);
        setError('Unable to load trip location details.');
      } finally {
        setLoading(false);
      }
    }

    fetchTripDetails();
  }, [tripParam, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <Truck className="w-6 h-6 text-emerald-400 absolute top-5 left-5" />
        </div>
        <p className="font-extrabold text-sm text-slate-200 tracking-wide">Loading Driver GPS Navigation Portal...</p>
        <p className="text-xs text-slate-500 mt-1">Jai Bhavani Cargo & Logistics</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl max-w-sm shadow-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-extrabold text-white">Trip Link Notice</h2>
          <p className="text-xs text-slate-400">{error || 'Invalid or expired dispatch link.'}</p>
        </div>
      </div>
    );
  }

  // Determine stops list with full URL query fallback
  let stopsList = [];
  if (routeObj && routeObj.stops) {
    const raw = typeof routeObj.stops === 'string' ? JSON.parse(routeObj.stops) : routeObj.stops;
    if (Array.isArray(raw) && raw.length > 0) stopsList = raw;
  }
  if (stopsList.length === 0 && trip.stops) {
    const raw = typeof trip.stops === 'string' ? JSON.parse(trip.stops) : trip.stops;
    if (Array.isArray(raw) && raw.length > 0) stopsList = raw;
  }
  if (stopsList.length === 0 && searchParams.get('stops')) {
    try {
      const raw = JSON.parse(searchParams.get('stops'));
      if (Array.isArray(raw) && raw.length > 0) {
        stopsList = raw.map(s => ({
          stop_name: s.name,
          village_name: s.villageName || '',
          map_link: s.mapLink || s.map_link || '',
          contact_phone: s.contactPhone || s.contact_phone || '',
          dockLabel: s.dockLabel || ''
        }));
      }
    } catch (e) {
      console.warn('Failed to parse URL stops parameter:', e);
    }
  }

  const originName = trip.origin_village || trip.start_location || trip.origin || (routeObj && (routeObj.origin_village || routeObj.start_location)) || 'Loading Warehouse';
  const destName = trip.destination_village || trip.end_location || trip.destination || (routeObj && (routeObj.destination_village || routeObj.end_location)) || 'Unloading Dock';
  
  const loadingMapUrl = trip.start_location_map_link || (routeObj && routeObj.start_location_map_link) || (stopsList[0] && (stopsList[0].map_link || stopsList[0].mapLink)) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(originName)}`;
  const destMapUrl = trip.end_location_map_link || (routeObj && routeObj.end_location_map_link) || (stopsList[stopsList.length - 1] && (stopsList[stopsList.length - 1].map_link || stopsList[stopsList.length - 1].mapLink)) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destName)}`;
  // Build multi-stop Google Maps URL including all intermediate middle drops as waypoints
  const buildGoogleMapsMultiStopUrl = () => {
    if (trip.google_map_link) return trip.google_map_link;
    if (routeObj && routeObj.google_map_link) return routeObj.google_map_link;

    if (Array.isArray(stopsList) && stopsList.length >= 2) {
      const originStop = stopsList[0];
      const destStop = stopsList[stopsList.length - 1];
      const middleStops = stopsList.slice(1, -1);

      const originQuery = originStop.map_link || originStop.mapLink || originStop.village_name || originStop.villageName || originStop.stop_name || originStop.name || originName;
      const destQuery = destStop.map_link || destStop.mapLink || destStop.village_name || destStop.villageName || destStop.stop_name || destStop.name || destName;

      let waypointsParam = '';
      if (middleStops.length > 0) {
        const waypointsList = middleStops.map(s => {
          return s.map_link || s.mapLink || s.village_name || s.villageName || s.stop_name || s.name || '';
        }).filter(Boolean);

        if (waypointsList.length > 0) {
          waypointsParam = `&waypoints=${encodeURIComponent(waypointsList.join('|'))}`;
        }
      }

      return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originQuery)}&destination=${encodeURIComponent(destQuery)}${waypointsParam}`;
    }

    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originName)}&destination=${encodeURIComponent(destName)}`;
  };

  const multiStopUrl = buildGoogleMapsMultiStopUrl();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 select-none">
      {/* Container Box */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-screen sm:min-h-0">
        
        {/* Top Branding Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 border-b border-slate-800 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block">
                  JAI BHAVANI CARGO • DRIVER NAV
                </span>
                <h1 className="text-lg font-black text-white leading-tight font-mono">
                  {trip.truck_number || 'TG12U2637'}
                </h1>
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              {trip.trip_status || 'UPCOMING'}
            </span>
          </div>

          {/* Quick Details Subcard */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">LR / Trip ID</span>
              <span className="font-mono font-extrabold text-white text-xs block truncate">{trip.lr_number || trip.trip_id || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Assigned Driver</span>
              <span className="font-bold text-white text-xs block truncate">{trip.driver_name || 'Driver'}</span>
            </div>
          </div>
        </div>

        {/* Dispatcher / Control Room Contact Banner */}
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/90 border border-indigo-500/40 p-3.5 rounded-2xl flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                <UserCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest block">
                  DISPATCHER / CONTROL ROOM SUPPORT
                </span>
                <h4 className="font-extrabold text-xs text-white">
                  {supportContact.name} <span className="text-[10px] text-indigo-300 font-normal">({supportContact.role})</span>
                </h4>
                <span className="font-mono text-xs font-bold text-emerald-400 block">
                  📞 +91 {supportContact.phone}
                </span>
              </div>
            </div>

            <a
              href={`tel:${supportContact.phone}`}
              className="py-2.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0 border border-indigo-400/30"
            >
              <Phone className="w-3.5 h-3.5 fill-white" /> Call Support
            </a>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-4 flex-1">
          
          {/* Main 1-Tap Google Maps Launch Banner */}
          <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 p-4 rounded-3xl space-y-3 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" /> GPS Turn-by-Turn Directions
              </span>
              <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                Google Maps
              </span>
            </div>

            <a
              href={multiStopUrl}
              onClick={(e) => openMapNavigation(multiStopUrl, e)}
              className="w-full py-4 px-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Navigation className="w-5 h-5 fill-slate-950" /> START FULL ROUTE NAVIGATION
            </a>
            <p className="text-[10px] text-slate-400 text-center">Opens Google Maps app with live voice-guided GPS directions</p>
          </div>

          {/* Route Dock Locations List */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" /> Route Docks & Drop Points
              </span>
              {stopsList.length > 0 && (
                <span className="text-[10px] font-mono text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  {stopsList.length} Docks
                </span>
              )}
            </div>

            {stopsList.length > 0 ? (
              // Multi-Stop Array Rendering
              stopsList.map((stop, sIdx) => {
                const isFirst = sIdx === 0;
                const isLast = sIdx === stopsList.length - 1;
                const placeTitle = stop.village_name || stop.stop_name || (isFirst ? originName : (isLast ? destName : `Stop ${sIdx + 1}`));
                const dockBadge = isFirst ? '🏭 STOP 1: LOADING DOCK GATE' : (isLast ? `📦 STOP ${sIdx + 1}: FINAL DELIVERY DOCK` : `📦 STOP ${sIdx + 1}: DROP POINT`);
                const mapLink = stop.map_link || stop.mapLink || (isFirst ? loadingMapUrl : (isLast ? destMapUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeTitle)}`));
                const supervisorPhone = stop.contact_phone || stop.contactPhone || (isFirst ? (trip.loading_supervisor_phone || (routeObj && routeObj.loading_supervisor_phone)) : (isLast ? (trip.unloading_supervisor_phone || (routeObj && routeObj.unloading_supervisor_phone)) : ''));

                return (
                  <div key={sIdx} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 relative overflow-hidden shadow-md">
                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isFirst ? 'bg-sky-500' : (isLast ? 'bg-emerald-500' : 'bg-amber-500')}`} />
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border ${
                        isFirst ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : (isLast ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30')
                      }`}>
                        {dockBadge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-white">{placeTitle}</h3>
                      {stop.stop_name && stop.stop_name !== placeTitle && (
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">{stop.stop_name}</p>
                      )}
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                        <span className="text-slate-400 font-bold text-[11px]">Supervisor Phone:</span>
                        <span className="font-mono font-extrabold text-emerald-400 text-xs">
                          {supervisorPhone || '7794072244'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={mapLink}
                        onClick={(e) => openMapNavigation(mapLink, e)}
                        className={`flex-1 py-3 px-3 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer ${
                          isFirst ? 'bg-sky-600 hover:bg-sky-500' : (isLast ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500')
                        }`}
                      >
                        <MapPin className="w-4 h-4" /> Navigate Gate
                      </a>
                      <a
                        href={`tel:${supervisorPhone || '7794072244'}`}
                        className="py-3 px-3.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-emerald-500/40 active:scale-95 shrink-0 shadow-sm"
                        title="Call Dock Supervisor"
                      >
                        <Phone className="w-4 h-4 text-emerald-400 fill-emerald-400/20" /> Call Supervisor
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              // Standard 2-Stop Fallback Rendering
              <>
                {/* Stop 1: Loading Dock */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 relative overflow-hidden shadow-md">
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-sky-500" />
                  <div className="flex items-center justify-between">
                    <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                      🏭 STOP 1: LOADING DOCK GATE
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-white">{originName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Exact warehouse gate & loading bay location</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={loadingMapUrl}
                      onClick={(e) => openMapNavigation(loadingMapUrl, e)}
                      className="flex-1 py-3 px-3 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" /> Navigate to Loading Gate
                    </a>
                    {trip.loading_supervisor_phone && (
                      <a
                        href={`tel:${trip.loading_supervisor_phone}`}
                        className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 shrink-0"
                        title="Call Loading Supervisor"
                      >
                        <Phone className="w-4 h-4 text-emerald-400" /> Call Supervisor
                      </a>
                    )}
                  </div>
                </div>

                {/* Stop 2: Delivery Dock */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 relative overflow-hidden shadow-md">
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500" />
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                      📦 STOP 2: FINAL UNLOADING DOCK
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-white">{destName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Destination customer unloading dock</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={destMapUrl}
                      onClick={(e) => openMapNavigation(destMapUrl, e)}
                      className="flex-1 py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" /> Navigate to Delivery Dock
                    </a>
                    {trip.unloading_supervisor_phone && (
                      <a
                        href={`tel:${trip.unloading_supervisor_phone}`}
                        className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 shrink-0"
                        title="Call Delivery Supervisor"
                      >
                        <Phone className="w-4 h-4 text-emerald-400" /> Call Receiver
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            Jai Bhavani Cargo & Logistics Control Room Desk • Safe Driving!
          </p>
        </div>
      </div>
    </div>
  );
}
