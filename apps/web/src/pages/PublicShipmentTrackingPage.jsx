import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, Search, Navigation, AlertCircle, ArrowRight, Check, Share2, 
  Download, CheckCircle2, Clock, ShieldCheck, MapPin, Phone, MessageCircle, 
  FileCheck, Loader2, Lock, Timer
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import { calculateTripDetention } from '@/lib/tripStatusUtils.js';

const SHIPMENT_STAGES = [
  { key: 'Trip Scheduled', label: 'Trip Scheduled', desc: 'Order created & scheduled' },
  { key: 'Vehicle Assigned', label: 'Vehicle Assigned', desc: 'Truck & driver allotted' },
  { key: 'Arrived at Dock', label: 'At Loading Dock', desc: 'Arrived at origin dock' },
  { key: 'Dispatched', label: 'Dispatched', desc: 'Loaded & departed origin' },
  { key: 'In Transit', label: 'In Transit', desc: 'En route on highway corridor' },
  { key: 'Reached Delivery Docket', label: 'At Delivery Docket', desc: 'Gate-in at consignee dock - Detention Timer Active' },
  { key: 'Delivered', label: 'Delivered (POD)', desc: 'Unloaded & POD verified' }
];

export default function PublicShipmentTrackingPage() {
  const { isAuthenticated: isAuthed, user: currentUser } = useAuth() || {};
  const userRole = currentUser?.role || pb.authStore?.model?.role || '';
  const isStaff = isAuthed && ['super_admin', 'admin', 'dispatcher', 'manager'].includes(userRole);
  const isClient = isAuthed && userRole === 'client';
  const userClientId = currentUser?.client_id || pb.authStore?.model?.client_id || '';

  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('trip') || searchParams.get('lr') || searchParams.get('id') || searchParams.get('waybill') || searchParams.get('t') || searchParams.get('client_trip_id');
  const urlKey = (searchParams.get('key') || searchParams.get('token') || '').trim();
  const initialSearch = id || queryParam || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [lrInput, setLrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState(null);
  const [driver, setDriver] = useState(null);
  const [truck, setTruck] = useState(null);
  const [proof, setProof] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch recent shipments if logged in (staff sees all, client sees ONLY their own company's trips)
  const fetchRecent = async () => {
    if (!isAuthed) {
      setRecentTrips([]);
      return;
    }
    try {
      const filterStr = isClient && userClientId ? `client_id = "${userClientId}"` : '';
      const res = await pb.collection('trip_logs').getList(1, 10, {
        sort: '-created',
        filter: filterStr,
        expand: 'client_id,route_id',
        $autoCancel: false
      });
      setRecentTrips(res.items || []);
    } catch (err) {
      console.warn('Could not fetch recent trips:', err);
    }
  };

  useEffect(() => {
    if (isAuthed) fetchRecent();
  }, [isAuthed, isClient, userClientId]);

  // Load driver, truck, and POD proof auxiliary records
  const loadAuxiliaryData = async (t) => {
    if (!t) {
      setDriver(null);
      setTruck(null);
      setProof(null);
      return;
    }

    if (t.driver_name && t.driver_name !== 'Temporary Driver') {
      try {
        const cleanName = t.driver_name.replace(/["'\\]/g, '').trim();
        const empRes = await pb.collection('employees').getList(1, 1, {
          filter: `name ~ "${cleanName}"`,
          $autoCancel: false
        });
        setDriver(empRes.items.length > 0 ? empRes.items[0] : null);
      } catch {
        setDriver(null);
      }
    } else {
      setDriver(null);
    }

    if (t.truck_number) {
      try {
        const cleanTruck = t.truck_number.replace(/["'\\]/g, '').trim();
        const truckRes = await pb.collection('trucks').getList(1, 1, {
          filter: `truck_number ~ "${cleanTruck}"`,
          $autoCancel: false
        });
        setTruck(truckRes.items.length > 0 ? truckRes.items[0] : null);
      } catch {
        setTruck(null);
      }
    } else {
      setTruck(null);
    }

    // Strict POD proof fetching: only if no pod_file is present on the trip
    const hasTripPod = Array.isArray(t.pod_file) 
      ? t.pod_file.length > 0 && String(t.pod_file[0]).trim() 
      : (typeof t.pod_file === 'string' && t.pod_file.trim());
      
    if (!hasTripPod && !t.pod_link) {
      try {
        const proofRes = await pb.collection('delivery_proofs').getList(1, 1, {
          filter: `trip_id = "${t.id}" || trip_number = "${t.trip_id}"`,
          $autoCancel: false
        });
        setProof(proofRes.items.length > 0 ? proofRes.items[0] : null);
      } catch {
        setProof(null);
      }
    } else {
      setProof(null);
    }
  };

  const handleSearch = async (termToSearch, overrideLr) => {
    const term = (termToSearch !== undefined ? termToSearch : searchQuery || '').trim();
    const lrToCheck = (overrideLr !== undefined ? overrideLr : lrInput || '').trim();

    if (!term) {
      setTrip(null);
      setErrorMsg(null);
      return;
    }

    // 🛡️ SECURITY CHECK: Non-staff public viewers must provide either a valid URL token key OR a matching LR Number
    const hasValidTokenParam = Boolean(urlKey);

    if (!isStaff && !isClient && !hasValidTokenParam && !lrToCheck) {
      setErrorMsg('🔒 Security Verification Required: Please enter your Consignment Note / LR Number below along with your Trip ID to track this shipment.');
      setTrip(null);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const cleanTerm = term.replace(/["'\\]/g, '');
      let foundTrip = null;

      if (/^[a-z0-9]{15}$/i.test(cleanTerm)) {
        try {
          foundTrip = await pb.collection('trip_logs').getOne(cleanTerm, {
            expand: 'client_id,route_id',
            $autoCancel: false
          });
        } catch {}
      }

      if (!foundTrip) {
        try {
          const filterStr = `trip_id ~ "${cleanTerm}" || client_trip_id ~ "${cleanTerm}" || lr_number ~ "${cleanTerm}" || truck_number ~ "${cleanTerm}" || driver_name ~ "${cleanTerm}" || route ~ "${cleanTerm}"`;
          const res = await pb.collection('trip_logs').getList(1, 1, {
            filter: filterStr,
            expand: 'client_id,route_id',
            sort: '-created',
            $autoCancel: false
          });
          if (res.items.length > 0) foundTrip = res.items[0];
        } catch (filterErr) {
          console.warn('Trip logs filter search notice:', filterErr);
        }
      }

      if (!foundTrip) {
        try {
          const listRes = await pb.collection('trip_logs').getList(1, 100, {
            sort: '-created',
            expand: 'client_id,route_id',
            $autoCancel: false
          });
          const termLower = cleanTerm.toLowerCase();
          const termNoSpaces = termLower.replace(/\s+/g, '');
          const match = (listRes.items || []).find(item => {
            const tripId = String(item.trip_id || '').toLowerCase();
            const clientTripId = String(item.client_trip_id || '').toLowerCase();
            const lrNo = String(item.lr_number || '').toLowerCase();
            const truckNo = String(item.truck_number || '').toLowerCase().replace(/\s+/g, '');
            const driverName = String(item.driver_name || '').toLowerCase();
            const routeStr = String(item.route || '').toLowerCase();
            const clientName = String(item?.expand?.client_id?.client_name || item?.expand?.client_id?.company_name || '').toLowerCase();
            return tripId.includes(termLower) || clientTripId.includes(termLower) || lrNo.includes(termLower) || truckNo.includes(termNoSpaces) || driverName.includes(termLower) || routeStr.includes(termLower) || clientName.includes(termLower) || item.id === cleanTerm;
          });
          if (match) foundTrip = match;
        } catch {}
      }

      if (!foundTrip) {
        setTrip(null);
        setErrorMsg(`No consignment found matching "${term}". Please check your Reference / Trip ID.`);
        return;
      }

      // 🛡️ SECURITY RULE 1: Logged-in Client User Access Scoping
      if (isClient && userClientId) {
        const tripClientId = foundTrip.client_id || foundTrip?.expand?.client_id?.id || '';
        if (tripClientId && tripClientId !== userClientId) {
          setTrip(null);
          setErrorMsg('🚫 Access Restricted: This consignment is not assigned to your client account.');
          return;
        }
      }

      // 🛡️ SECURITY RULE 2: External Link Token Key Validation
      if (!isStaff && !isClient) {
        if (hasValidTokenParam) {
          const tripToken = (foundTrip.tracking_token || '').trim();
          if (tripToken && urlKey.toLowerCase() !== tripToken.toLowerCase()) {
            setTrip(null);
            setErrorMsg('🚫 Access Denied: The security key in your tracking link is invalid or expired. Please contact Jai Bhavani Cargo for an updated tracking link.');
            return;
          }
        } else {
          // Two-Factor Consignment Verification (Reference + LR#)
          const tripLr = String(foundTrip.lr_number || '').toLowerCase().trim();
          const inputLrClean = lrToCheck.toLowerCase().trim();
          if (!tripLr || !tripLr.includes(inputLrClean)) {
            setTrip(null);
            setErrorMsg('🔒 Verification Failed: The Consignment Note / LR Number does not match this shipment reference. Please check both numbers.');
            return;
          }
        }
      }

      setTrip(foundTrip);
      setSearchQuery(foundTrip.trip_id || foundTrip.client_trip_id || foundTrip.lr_number || foundTrip.truck_number || foundTrip.id);
      setErrorMsg(null);
      await loadAuxiliaryData(foundTrip);
    } catch (err) {
      console.error('Tracking query error:', err);
      setErrorMsg('Error communicating with tracking server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const target = id || queryParam;
    if (target) {
      setSearchQuery(target);
      handleSearch(target, lrInput);
    } else if (isStaff) {
      (async () => {
        try {
          const res = await pb.collection('trip_logs').getList(1, 1, {
            sort: '-created',
            expand: 'client_id,route_id',
            $autoCancel: false
          });
          if (res.items.length > 0) {
            const first = res.items[0];
            setSearchQuery(first.trip_id || first.id);
            setTrip(first);
            await loadAuxiliaryData(first);
          }
        } catch {}
      })();
    } else if (isClient && userClientId) {
      (async () => {
        try {
          const res = await pb.collection('trip_logs').getList(1, 1, {
            filter: `client_id = "${userClientId}"`,
            sort: '-created',
            expand: 'client_id,route_id',
            $autoCancel: false
          });
          if (res.items.length > 0) {
            const first = res.items[0];
            setSearchQuery(first.trip_id || first.id);
            setTrip(first);
            await loadAuxiliaryData(first);
          }
        } catch {}
      })();
    } else {
      setTrip(null);
    }
  }, [id, queryParam, isStaff, isClient, userClientId]);

  // Real-time live updates
  useEffect(() => {
    if (!trip?.id) return;
    const unsub = pb.collection('trip_logs').subscribe(trip.id, async (e) => {
      if (e.action === 'update' || e.action === 'patch') {
        try {
          const updated = await pb.collection('trip_logs').getOne(trip.id, {
            expand: 'client_id,route_id',
            $autoCancel: false
          });
          setTrip(updated);
          await loadAuxiliaryData(updated);
          toast.info('Live tracking updated with latest milestone data!');
        } catch {}
      }
    });
    return () => {
      pb.collection('trip_logs').unsubscribe(trip.id).catch(() => {});
    };
  }, [trip?.id]);

  // Current stage index (0 to 6)
  const currentStageIdx = useMemo(() => {
    if (!trip) return 0;
    const s = (trip.trip_status || trip.status || '').toLowerCase();
    if (s.includes('deliver') || s.includes('complete') || s.includes('closed')) return 6;
    if (s.includes('reach') || s.includes('docket') || s.includes('unload') || s.includes('hub') || trip.delivery_dock_arrival_time) return 5;
    if (s.includes('transit') || s.includes('progress') || s.includes('running') || s.includes('en route')) return 4;
    if (s.includes('dispatch') || s.includes('depart')) return 3;
    if (s.includes('dock') || s.includes('load') || s.includes('arrived')) return 2;
    if (trip.truck_number && trip.driver_name) return 1;
    return 0;
  }, [trip]);

  // Gate stops / dock milestones
  const dockStops = useMemo(() => {
    if (!trip) return [];
    if (Array.isArray(trip.trip_stops) && trip.trip_stops.length > 0) {
      return trip.trip_stops.map((stop, idx) => ({
        dockLabel: idx === 0 ? 'LOADING DOCK GATE' : idx === trip.trip_stops.length - 1 ? 'FINAL DELIVERY DOCK' : `DROP DOCK ${idx}`,
        name: stop.stop_name || stop.name || stop.village_name || `Dock ${idx + 1}`,
        villageName: stop.village_name || stop.villageName || '',
        mapLink: stop.map_link || stop.mapLink || '',
        contactPhone: stop.contact_phone || stop.contactPhone || '',
        status: (idx === 0 && currentStageIdx >= 2) || (idx === trip.trip_stops.length - 1 && currentStageIdx >= 6) || currentStageIdx >= 6 ? 'Completed' : 'Pending'
      }));
    }
    if (Array.isArray(trip.milestones_schedule) && trip.milestones_schedule.length > 0) {
      return trip.milestones_schedule.map((stop, idx) => ({
        dockLabel: idx === 0 ? 'LOADING DOCK GATE' : idx === trip.milestones_schedule.length - 1 ? 'FINAL DELIVERY DOCK' : `DROP DOCK ${idx}`,
        name: stop.stop_name || stop.name || stop.village_name || `Dock ${idx + 1}`,
        villageName: stop.village_name || stop.villageName || '',
        mapLink: stop.map_link || stop.mapLink || '',
        contactPhone: stop.contact_phone || stop.contactPhone || '',
        status: stop.status === 'Completed' || (idx === 0 && currentStageIdx >= 2) || currentStageIdx >= 6 ? 'Completed' : 'Pending'
      }));
    }
    const origin = trip?.expand?.route_id?.start_location || (trip?.route ? trip.route.split('->')[0].split('→')[0].split('-')[0].trim() : '') || trip.origin || 'Origin Facility';
    const destination = trip?.expand?.route_id?.end_location || (trip?.route ? (trip.route.includes('->') ? trip.route.split('->')[1] : trip.route.includes('→') ? trip.route.split('→')[1] : trip.route.split('-')[1] || '').trim() : '') || trip.destination || 'Destination Hub';
    return [
      {
        dockLabel: 'LOADING DOCK GATE',
        name: origin,
        villageName: origin,
        contactPhone: driver?.phone || trip.driver_phone || '',
        status: currentStageIdx >= 2 ? 'Completed' : 'Pending'
      },
      {
        dockLabel: 'FINAL DELIVERY DOCK',
        name: destination,
        villageName: destination,
        contactPhone: '',
        status: currentStageIdx >= 6 ? 'Completed' : 'Pending'
      }
    ];
  }, [trip, currentStageIdx, driver]);

  // 🛡️ Secure Share Link Generator: automatically appends cryptographic tracking_token
  const copyShareLink = () => {
    const idToShare = trip?.trip_id || trip?.client_trip_id || trip?.id || '';
    const tokenParam = trip?.tracking_token ? `?key=${encodeURIComponent(trip.tracking_token)}` : '';
    const link = `${window.location.origin}/track/${encodeURIComponent(idToShare)}${tokenParam}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('🔒 Secure Single-Shipment Tracking Link copied!');
    setTimeout(() => setCopied(false), 2500);
  };

  const clientName = trip?.expand?.client_id?.client_name || trip?.expand?.client_id?.company_name || trip?.client_name || 'Client Shipment';
  const driverName = trip?.driver_name || driver?.name || 'Driver Assigned';
  const driverPhone = driver?.phone || driver?.mobile || driver?.contact_number || trip?.driver_phone || '';
  const truckNum = trip?.truck_number || truck?.truck_number || 'Vehicle Assigned';
  const tripIdentifier = trip?.trip_id || trip?.id || '';
  const clientTripId = trip?.client_trip_id || null;
  const lrNumber = trip?.lr_number || null;
  const dateFormatted = trip?.date ? format(new Date(trip.date), 'dd MMM yyyy') : (trip?.created ? format(new Date(trip.created), 'dd MMM yyyy') : '—');
  const routeOrigin = trip?.expand?.route_id?.start_location || (trip?.route ? trip.route.split('->')[0].split('→')[0].split('-')[0].trim() : '') || trip?.origin || 'Origin Terminal';
  const routeDestination = trip?.expand?.route_id?.end_location || (trip?.route ? (trip.route.includes('->') ? trip.route.split('->')[1] : trip.route.includes('→') ? trip.route.split('→')[1] : trip.route.split('-')[1] || '').trim() : '') || trip?.destination || 'Destination Hub';
  const distanceKm = trip?.kms || trip?.expand?.route_id?.distance_km || null;

  // 🛡️ Strict POD File Validation: returns valid URL only if actual document exists
  const podUrl = useMemo(() => {
    if (trip?.pod_file) {
      if (Array.isArray(trip.pod_file) && trip.pod_file.length > 0 && String(trip.pod_file[0]).trim()) {
        return pb.files.getURL(trip, trip.pod_file[0]);
      }
      if (typeof trip.pod_file === 'string' && trip.pod_file.trim()) {
        return pb.files.getURL(trip, trip.pod_file);
      }
    }
    if (trip?.pod_link && typeof trip.pod_link === 'string' && trip.pod_link.trim().startsWith('http')) {
      return trip.pod_link.trim();
    }
    if (proof?.file) {
      if (Array.isArray(proof.file) && proof.file.length > 0 && String(proof.file[0]).trim()) {
        return pb.files.getURL(proof, proof.file[0]);
      }
      if (typeof proof.file === 'string' && proof.file.trim()) {
        return pb.files.getURL(proof, proof.file);
      }
    }
    return null;
  }, [trip, proof]);

  const isDelivered = ['delivered', 'completed'].includes((trip?.trip_status || '').toLowerCase());
  const showSearchForm = isStaff || isClient || !urlKey;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-32 sm:pb-20">
      <Helmet>
        <title>{trip ? `Live Tracking: ${tripIdentifier} (${truckNum}) | Jai Bhavani Cargo` : 'Live Real-Time Shipment Tracking | Jai Bhavani Cargo'}</title>
      </Helmet>

      {/* Top Header & Search Bar */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-b border-slate-800/80 pt-6 sm:pt-8 pb-8 sm:pb-10 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px] font-mono font-bold px-2.5 py-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5 inline-block" />
                  {urlKey ? 'AUTHORIZED SECURE CONSIGNMENT VIEW' : 'REAL-TIME FLEET TELEMATICS'}
                </Badge>
                <span className="text-[11px] sm:text-xs text-slate-400">Jai Bhavani Cargo Live Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5 font-heading">
                <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 shrink-0" /> Live Shipment Tracking
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                {urlKey ? 'Secure verified consignment tracking with milestone progress and proof of delivery.' : 'Milestone timeline • Fleet pilot telematics • Direct vehicle GPS & verified POD'}
              </p>
            </div>

            {/* Search form: If visitor accessed via a secure token link, hide the open search to prevent snooping! */}
            {showSearchForm && (
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                className="w-full md:w-auto flex-1 max-w-lg"
              >
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <div className="relative flex items-center flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isStaff ? 'Trip ID, LR#, Truck...' : 'Enter Trip ID (e.g. TRIP-364)...'}
                      className="pl-10 pr-3 h-11 rounded-2xl bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 font-mono text-xs sm:text-sm focus-visible:ring-emerald-500 shadow-inner w-full"
                    />
                  </div>

                  {/* For non-staff, require LR Number as 2nd verification factor to prevent sequential guessing! */}
                  {!isStaff && (
                    <Input
                      value={lrInput}
                      onChange={(e) => setLrInput(e.target.value)}
                      placeholder="LR / Consignment #..."
                      className="h-11 rounded-2xl bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 font-mono text-xs sm:text-sm focus-visible:ring-emerald-500 shadow-inner sm:w-44"
                    />
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 shadow shrink-0"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Track'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Active Shipments Pill Strip: ONLY shown to staff or scoped to client company (never reveals other clients) */}
          {isAuthed && recentTrips.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none -mx-1 px-1">
              <span className="text-slate-500 whitespace-nowrap font-semibold text-[11px]">
                {isClient ? 'Your Active Shipments:' : 'Active Shipments:'}
              </span>
              {recentTrips.map(item => {
                const targetRef = item.trip_id || item.client_trip_id || item.lr_number || item.id;
                const isSelected = trip?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { 
                      setSearchQuery(targetRef); 
                      setLrInput(item.lr_number || '');
                      handleSearch(targetRef, item.lr_number || ''); 
                    }}
                    className={`px-3 py-1.5 rounded-xl border whitespace-nowrap font-mono text-xs transition-all flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm' 
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{item.trip_id || item.id}</span>
                    {item.client_trip_id && <span className="text-[10px] text-sky-400 font-normal">({item.client_trip_id})</span>}
                    {isStaff && <span className="text-[10px] text-slate-500">[{item.truck_number || 'Truck'}]</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Error Notification */}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleSearch()} 
              className="h-8 rounded-xl border-rose-500/40 text-rose-300 hover:bg-rose-500/20 text-xs"
            >
              Retry
            </Button>
          </motion.div>
        )}

        {/* Empty / Intro Card */}
        {!trip && !loading && !errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="py-6 max-w-3xl mx-auto"
          >
            <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur text-center space-y-6">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg">
                <Truck className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">Secure Consignment Tracking</h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  {isStaff 
                    ? 'Search by Trip ID, LR#, or vehicle number to view full real-time operational telematics.'
                    : 'Enter your Trip ID along with your Consignment Note / LR Number to securely access your shipment\'s live status.'
                  }
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-left">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Step 1</span>
                  <div className="font-bold text-slate-200">Enter Trip Reference</div>
                  <div className="text-[11px] text-slate-400">e.g. TRIP-364</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">Step 2</span>
                  <div className="font-bold text-slate-200">Verify LR Number</div>
                  <div className="text-[11px] text-slate-400">Your Consignment Note #</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Step 3</span>
                  <div className="font-bold text-slate-200">Protected Telematics</div>
                  <div className="text-[11px] text-slate-400">Milestones & verified POD</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Encrypted & Secure Telematics • Authorized Consignment Tracking Only</span>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Live Trip Loaded Details */}
        {trip && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* --- CARD 1: PRIMARY SHIPMENT OVERVIEW --- */}
            <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur space-y-5">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 border-b border-slate-800/80 pb-5">
                <div className="space-y-2.5 w-full lg:w-auto">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/40 text-xs font-mono font-black uppercase px-3 py-1">
                      🟢 {trip.trip_status || 'In Transit'}
                    </Badge>
                    <span className="text-xs font-mono text-slate-300 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700">
                      Trip ID: <strong className="text-white">{tripIdentifier}</strong>
                    </span>
                    {clientTripId && (
                      <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                        Client Ref: <strong>{clientTripId}</strong>
                      </span>
                    )}
                    {lrNumber && (
                      <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                        LR#: <strong>{lrNumber}</strong>
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-300 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700">
                      Client: <strong className="text-emerald-400">{clientName}</strong>
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-2xl font-black text-white flex flex-wrap items-center gap-2 sm:gap-3 break-words">
                    <span>{routeOrigin}</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                    <span>{routeDestination}</span>
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      📅 Scheduled: <strong className="text-slate-300">{dateFormatted}</strong>
                    </span>
                    {distanceKm && (
                      <span className="flex items-center gap-1">
                        🛣️ Distance: <strong className="text-emerald-400">{distanceKm} KM</strong>
                      </span>
                    )}
                    {trip.pickup_time && (
                      <span className="flex items-center gap-1">
                        ⏰ Pickup: <strong className="text-slate-300">{format(new Date(trip.pickup_time), 'dd MMM, hh:mm a')}</strong>
                      </span>
                    )}
                    {trip.delivery_eta && (
                      <span className="flex items-center gap-1">
                        🎯 ETA: <strong className="text-amber-400">{format(new Date(trip.delivery_eta), 'dd MMM, hh:mm a')}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile responsive action button stack */}
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                  {trip?.gps_tracking_link && !isDelivered && (
                    <Button
                      onClick={() => window.open(trip.gps_tracking_link, '_blank', 'noopener,noreferrer')}
                      className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs h-11 sm:h-10 px-4 gap-2 shadow animate-pulse inline-flex items-center justify-center"
                    >
                      <Truck className="w-4 h-4 shrink-0" /> Track Vehicle
                    </Button>
                  )}

                  {/* Share Secure Tracking Link: Generates unguessable token link */}
                  <Button
                    onClick={copyShareLink}
                    variant="outline"
                    className="rounded-xl border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs h-11 sm:h-10 px-4 gap-2 shadow inline-flex items-center justify-center"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Share2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {copied ? 'Link Copied!' : 'Share Tracking Link'}
                  </Button>

                  {/* 🛡️ Strict conditional POD download: ONLY renders if real POD file exists */}
                  {podUrl && (
                    <Button
                      asChild
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-11 sm:h-10 px-4 gap-2 shadow inline-flex items-center justify-center"
                    >
                      <a href={podUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 shrink-0" /> Download POD
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* --- MILESTONE PIPELINE (Mobile Swipeable / Desktop 7-Col) --- */}
              <div className="pt-2 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    Delivery Milestone Pipeline
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    Stage {currentStageIdx + 1} of {SHIPMENT_STAGES.length}: {SHIPMENT_STAGES[currentStageIdx]?.label}
                  </span>
                </div>

                <div className="flex overflow-x-auto snap-x scrollbar-none gap-2 pb-2 -mx-1 px-1 sm:grid sm:grid-cols-4 lg:grid-cols-7">
                  {SHIPMENT_STAGES.map((stage, idx) => {
                    const isPassed = idx < currentStageIdx;
                    const isCurrent = idx === currentStageIdx;
                    return (
                      <div
                        key={stage.key}
                        className={`p-3 rounded-2xl border text-center space-y-1 transition-all relative min-w-[130px] sm:min-w-0 flex-1 snap-start ${
                          isCurrent
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg ring-1 ring-emerald-500/50'
                            : isPassed
                            ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                            : 'bg-slate-900/40 border-slate-800/60 text-slate-600 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-bold uppercase tracking-wider">Step 0{idx + 1}</span>
                          {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          {isCurrent && <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin shrink-0" />}
                        </div>
                        <div className="text-xs font-black truncate">{stage.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">{stage.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* --- DOCK TURNAROUND & DETENTION MONITOR CARD --- */}
            {(currentStageIdx >= 5 || trip.delivery_dock_arrival_time) && (() => {
              const det = calculateTripDetention(trip);
              if (!det) return null;
              return (
                <Card className={`rounded-3xl border p-5 sm:p-6 shadow-xl transition-all ${
                  det.isOverdue
                    ? 'bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/30'
                    : det.isFrozen
                    ? 'bg-slate-900/90 border-emerald-500/40'
                    : 'bg-purple-950/20 border-purple-500/40 ring-1 ring-purple-500/30'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${det.isFrozen ? 'bg-emerald-400' : det.isOverdue ? 'bg-rose-400 animate-ping' : 'bg-purple-400 animate-pulse'}`} />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                          <Timer className="w-4 h-4 text-purple-400" />
                          Delivery Docket Turnaround & Detention Tracker
                        </h3>
                        <Badge className={`text-[10px] uppercase font-mono font-bold ${
                          det.isFrozen
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : det.isOverdue
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        }`}>
                          {det.isFrozen ? 'Unloading Finalized' : det.isOverdue ? 'Demurrage Active' : 'Within Free Grace SLA'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">
                        {det.isFrozen
                          ? `Consignment unloaded and acknowledged. Total dock turnaround time: ${det.totalDurationFormatted}.`
                          : det.isOverdue
                          ? `Free unloading SLA (${det.freeHours} hrs) has elapsed. Billable detention is accumulating.`
                          : `Vehicle reported at destination dock. Free unloading SLA remaining: ${det.remainingGraceFormatted}.`}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 self-stretch sm:self-auto justify-between sm:justify-start">
                      <div>
                        <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Dock Duration</div>
                        <div className="text-lg font-black font-mono text-emerald-400">{det.totalDurationFormatted}</div>
                      </div>
                      <div className="h-8 w-px bg-slate-800" />
                      <div>
                        <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Free Grace SLA</div>
                        <div className="text-sm font-bold font-mono text-slate-300">{det.freeHours} Hours</div>
                      </div>
                      {det.isOverdue && (
                        <>
                          <div className="h-8 w-px bg-slate-800" />
                          <div>
                            <div className="text-[10px] uppercase font-mono text-rose-400 font-bold">Overdue Demurrage</div>
                            <div className="text-lg font-black font-mono text-rose-400">₹{det.billableAmount.toLocaleString('en-IN')}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* --- BALANCED 2-COLUMN OPERATIONAL GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CARD A: Assigned Fleet Pilot & Vehicle Telematics */}
              <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Assigned Fleet Pilot & Vehicle
                    </h3>
                    {isStaff && (
                      <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px] font-mono">
                        {trip.ownership_type || 'Fleet Vehicle'}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">Driver Pilot</span>
                      <strong className="text-white text-sm font-semibold">{driverName}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">Truck Registration</span>
                      <span className="font-mono font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                        {truckNum}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">Total Distance</span>
                      <strong className="text-emerald-400 text-sm font-mono">{distanceKm ? `${distanceKm} KM` : '—'}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">Current Status</span>
                      <strong className="text-amber-400 text-sm font-mono uppercase">{trip.trip_status || 'In Transit'}</strong>
                    </div>

                    {/* 🛡️ SENSITIVE DATA PROTECTION: FASTag Balance only visible to Company Staff (hidden for clients) */}
                    {isStaff && truck?.current_fastag_balance !== undefined && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">FASTag Balance (Internal)</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {formatCurrency(truck.current_fastag_balance)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Shipment Ref</span>
                      <span className="font-mono font-bold text-emerald-400">{tripIdentifier}</span>
                    </div>
                  </div>
                </div>

                {driverPhone && (
                  <div className="pt-3 flex gap-2 border-t border-slate-800/60">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 rounded-xl border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs h-10 gap-1.5 shadow"
                    >
                      <a href={`tel:${driverPhone}`}>
                        <Phone className="w-4 h-4" /> Call Driver ({driverPhone})
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-xl border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs h-10 px-3.5 shadow"
                      title="Chat on WhatsApp"
                    >
                      <a href={`https://wa.me/${driverPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                      </a>
                    </Button>
                  </div>
                )}
              </Card>

              {/* CARD B: Dock Stops & Multi-Drop Gate Points */}
              <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" /> Dock Stops & Multi-Drop Gate Points
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono text-slate-400 border-slate-700">
                    {dockStops.length} Stops Configured
                  </Badge>
                </div>

                <div className="space-y-3">
                  {dockStops.map((stop, idx) => {
                    const displayName = stop.villageName ? `${stop.villageName} (${stop.name})` : stop.name;
                    const isDone = stop.status === 'Completed' || (idx === 0 && currentStageIdx >= 2) || (idx === dockStops.length - 1 && currentStageIdx >= 6);
                    return (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] border border-emerald-500/30">
                                {idx + 1}
                              </span>
                              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                                {stop.dockLabel || `STOP ${idx + 1}`}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-white">{displayName}</h4>
                          </div>
                          <Badge className={`text-[10px] font-mono ${
                            isDone ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}>
                            {isDone ? '🟢 Complete' : '⏳ Pending'}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                          {stop.mapLink ? (
                            <a 
                              href={stop.mapLink} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 text-xs"
                            >
                              <Navigation className="w-3.5 h-3.5" /> Open in Google Maps ➔
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-500">Route Waypoint</span>
                          )}

                          {stop.contactPhone && (
                            <a href={`tel:${stop.contactPhone}`} className="text-slate-300 hover:text-white flex items-center gap-1 font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-slate-400" /> {stop.contactPhone}
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* --- CARD 3: DOCUMENTS & POD VERIFICATION CARD --- */}
            <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" /> Shipment Documents & POD Verification
                  </h3>
                  <p className="text-xs text-slate-400">Access verified signed delivery slips for this shipment.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Proof of Delivery</span>
                    <h4 className="font-bold text-sm text-white">Signed POD Document</h4>
                    <p className="text-xs text-slate-400">
                      {podUrl ? 'Official verified signed copy available for download' : 'Awaiting physical slip upload upon delivery'}
                    </p>
                  </div>
                  {/* 🛡️ Strict conditional POD display: ONLY renders View POD button if real file exists */}
                  {podUrl ? (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1 shadow shrink-0"
                    >
                      <a href={podUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-3.5 h-3.5" /> View POD
                      </a>
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-xs font-mono text-slate-500 border-slate-700 bg-slate-800/40 px-2 py-0.5 shrink-0">
                      POD Pending
                    </Badge>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Trip Status Summary</span>
                    <h4 className="font-bold text-sm text-white">{trip.trip_status || 'In Transit'}</h4>
                    <p className="text-xs text-slate-400">
                      Payment Status: <strong className="text-slate-300 uppercase">{trip.client_payment_status || 'Pending'}</strong>
                    </p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-mono shrink-0">
                    {trip.trip_status || 'Active'}
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
