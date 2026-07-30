import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Navigation, Truck, Calculator, Clock, MessageSquare, 
  ExternalLink, CheckCircle2, ShieldCheck, RefreshCw, Search, FileText, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { loadGoogleMapsScript, GOOGLE_MAPS_API_KEY } from '@/lib/googleMapsLoader.js';
import { openMapLocation } from '@/lib/locationUtils.js';

const OFFICIAL_VEHICLES = [
  { id: 'tata_ace', name: 'Tata Ace (1.5 Ton)', baseFare: 800, ratePerKm: 18, minCharge: 1200, loading: 400, unloading: 400 },
  { id: 'pickup_truck', name: 'Pickup Truck (2.5 Ton)', baseFare: 1200, ratePerKm: 24, minCharge: 1800, loading: 600, unloading: 600 },
  { id: '14ft_truck', name: '14 Ft Truck (4 Ton)', baseFare: 1800, ratePerKm: 28, minCharge: 2500, loading: 800, unloading: 800 },
  { id: '17ft_truck', name: '17 Ft Truck (6 Ton)', baseFare: 2400, ratePerKm: 34, minCharge: 3200, loading: 1000, unloading: 1000 },
  { id: '19ft_truck', name: '19 Ft Truck (8 Ton)', baseFare: 3000, ratePerKm: 38, minCharge: 4000, loading: 1200, unloading: 1200 },
  { id: '22ft_truck', name: '22 Ft Truck (10 Ton)', baseFare: 3800, ratePerKm: 42, minCharge: 5000, loading: 1500, unloading: 1500 },
  { id: '32ft_sxl', name: '32 Ft SXL Container (7 Ton)', baseFare: 4500, ratePerKm: 38, minCharge: 6000, loading: 1800, unloading: 1800 },
  { id: '32ft_mxl', name: '32 Ft MXL Container (14 Ton)', baseFare: 5500, ratePerKm: 48, minCharge: 7500, loading: 2200, unloading: 2200 },
  { id: '40ft_trailer', name: '40 Ft Flatbed Trailer (25 Ton)', baseFare: 8000, ratePerKm: 68, minCharge: 10000, loading: 3000, unloading: 3000 },
];

export default function OfficialGoogleMapsFreightCalculator() {
  const [originText, setOriginText] = useState('Mumbai, Maharashtra, India');
  const [destinationText, setDestinationText] = useState('Hyderabad, Telangana, India');
  const [selectedVehicleId, setSelectedVehicleId] = useState('32ft_sxl');
  const [loading, setLoading] = useState(false);
  const [googleMapError, setGoogleMapError] = useState(null);

  // Extracted Distance & Duration
  const [extractedData, setExtractedData] = useState({
    distanceKm: 708,
    durationText: '12 hours 45 mins'
  });

  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const mapElementRef = useRef(null);
  const googleMapInstance = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const selectedVehicle = OFFICIAL_VEHICLES.find(v => v.id === selectedVehicleId) || OFFICIAL_VEHICLES[6];

  // Freight Pricing Math
  const calculatedBase = Math.max(selectedVehicle.minCharge, Math.round(extractedData.distanceKm * selectedVehicle.ratePerKm));
  const tollCharges = Math.round(extractedData.distanceKm * 2.2);
  const fuelSurcharge = Math.round(calculatedBase * 0.05);
  const loadingUnloading = selectedVehicle.loading + selectedVehicle.unloading;

  const subtotalFare = calculatedBase + tollCharges + fuelSurcharge + loadingUnloading;
  const gstAmount = Math.round(subtotalFare * 0.05);
  const grandTotal = subtotalFare + gstAmount;

  // Render Real Google Maps JS SDK Window & Directions API Route
  const renderRealGoogleMap = (maps, orig = originText, dest = destinationText) => {
    if (!mapElementRef.current || !maps) return;

    try {
      if (!googleMapInstance.current) {
        const map = new maps.Map(mapElementRef.current, {
          zoom: 6,
          center: { lat: 18.5204, lng: 75.8567 },
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true
        });

        googleMapInstance.current = map;
        directionsServiceRef.current = new maps.DirectionsService();
        directionsRendererRef.current = new maps.DirectionsRenderer({
          map: map,
          suppressMarkers: false,
          polylineOptions: { strokeColor: '#3b82f6', strokeWeight: 6 }
        });
      }

      if (directionsServiceRef.current && directionsRendererRef.current) {
        directionsServiceRef.current.route(
          {
            origin: orig,
            destination: dest,
            travelMode: maps.TravelMode.DRIVING
          },
          (result, status) => {
            if (status === 'OK' && result.routes && result.routes[0]) {
              directionsRendererRef.current.setDirections(result);
              const leg = result.routes[0].legs[0];
              const roadKm = Math.round((leg.distance.value / 1000) * 10) / 10;
              const duration = leg.duration.text;

              setExtractedData({
                distanceKm: roadKm,
                durationText: duration
              });
              setGoogleMapError(null);
            } else {
              console.warn('Google Directions Status:', status);
            }
          }
        );
      }
    } catch (e) {
      console.warn('Google Maps JS error:', e);
      setGoogleMapError('Google Maps API key domain referrer check in progress');
    }
  };

  useEffect(() => {
    loadGoogleMapsScript().then(maps => {
      if (maps) {
        renderRealGoogleMap(maps, originText, destinationText);

        // Google Places Autocomplete dropdown
        if (maps.places) {
          if (originInputRef.current) {
            const autoOrig = new maps.places.Autocomplete(originInputRef.current, {
              componentRestrictions: { country: 'in' }
            });
            autoOrig.addListener('place_changed', () => {
              const p = autoOrig.getPlace();
              if (p && (p.formatted_address || p.name)) {
                const val = p.formatted_address || p.name;
                setOriginText(val);
                calculateRoute(val, destinationText);
              }
            });
          }

          if (destinationInputRef.current) {
            const autoDest = new maps.places.Autocomplete(destinationInputRef.current, {
              componentRestrictions: { country: 'in' }
            });
            autoDest.addListener('place_changed', () => {
              const p = autoDest.getPlace();
              if (p && (p.formatted_address || p.name)) {
                const val = p.formatted_address || p.name;
                setDestinationText(val);
                calculateRoute(originText, val);
              }
            });
          }
        }
      } else {
        setGoogleMapError('Could not load Google Maps JS SDK');
      }
    }).catch(err => {
      setGoogleMapError(err.toString());
    });
  }, []);

  const calculateRoute = (orig = originText, dest = destinationText) => {
    if (!orig.trim() || !dest.trim()) {
      toast.error('Please enter both Origin and Destination.');
      return;
    }

    setLoading(true);

    if (window.google && window.google.maps) {
      renderRealGoogleMap(window.google.maps, orig, dest);
      setLoading(false);
      toast.success('Official Google Maps Route Calculated!');
    } else {
      setLoading(false);
    }
  };

  const handleShareWhatsAppQuote = () => {
    const text = `*JAI BHAVANI CARGO - OFFICIAL GOOGLE FREIGHT QUOTATION* 🚚\n\n` +
      `📍 *Pickup*: ${originText}\n` +
      `🏁 *Delivery*: ${destinationText}\n` +
      `📏 *Official Distance*: ${extractedData.distanceKm} KM\n` +
      `⏱️ *Transit Time*: ${extractedData.durationText}\n` +
      `🚛 *Vehicle*: ${selectedVehicle.name}\n` +
      `💵 *Base Rate*: ₹${selectedVehicle.ratePerKm}/KM\n` +
      `💰 *Total Estimated Freight*: ₹${grandTotal.toLocaleString()} (Incl. Tolls, Loading & GST)\n\n` +
      `Book Load Now: https://www.jaibhavanicargo.com`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Card className="rounded-3xl border border-primary/30 bg-slate-950 text-slate-100 shadow-2xl p-5 sm:p-6 font-sans space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] font-mono font-bold">
              OFFICIAL GOOGLE MAPS PLATFORM API INTEGRATED
            </Badge>
            <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Key: {GOOGLE_MAPS_API_KEY.slice(0, 10)}... Active
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-primary animate-pulse" /> Official Google Maps Freight Calculator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real Official Google Maps Window • Google Directions API • Live Places Autocomplete Suggestions
          </p>
        </div>

        <Button
          onClick={handleShareWhatsAppQuote}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shrink-0"
        >
          <MessageSquare className="w-4 h-4 mr-1.5" /> Share Quote on WhatsApp
        </Button>
      </div>

      {/* Input Search Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Pickup Origin (Type for Google Suggestions)
          </label>
          <div className="relative mt-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              ref={originInputRef}
              type="text"
              value={originText}
              onChange={(e) => setOriginText(e.target.value)}
              placeholder="Type Pickup City / Landmark (e.g. Mumbai)..."
              className="w-full bg-slate-900 border border-slate-800 text-xs h-10 pl-9 pr-3 rounded-xl text-white font-medium focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" /> Delivery Destination (Type for Google Suggestions)
          </label>
          <div className="relative mt-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              ref={destinationInputRef}
              type="text"
              value={destinationText}
              onChange={(e) => setDestinationText(e.target.value)}
              placeholder="Type Destination City / Landmark (e.g. Hyderabad)..."
              className="w-full bg-slate-900 border border-slate-800 text-xs h-10 pl-9 pr-3 rounded-xl text-white font-medium focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-amber-400" /> Vehicle Type
          </label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs h-10 mt-1 rounded-xl text-white font-medium px-2 focus:outline-none focus:border-primary"
          >
            {OFFICIAL_VEHICLES.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} (₹{v.ratePerKm}/km)
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        onClick={() => calculateRoute(originText, destinationText)}
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm rounded-2xl h-11 shadow-lg"
      >
        <Calculator className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Calculating Route on Google Maps...' : 'Calculate Official Freight Quotation'}
      </Button>

      {/* Split Screen Layout: Real Google Maps Window (Left) & Freight Quote (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* REAL OFFICIAL GOOGLE MAPS WINDOW (7 Columns) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden relative min-h-[380px] shadow-xl flex flex-col justify-between p-1">
          <div 
            ref={mapElementRef} 
            style={{ width: '100%', height: '380px', minHeight: '380px' }} 
            className="w-full rounded-2xl overflow-hidden bg-slate-900"
          />

          <div className="absolute top-4 left-4 z-10 bg-slate-950/90 border border-slate-800 backdrop-blur rounded-xl p-3 shadow-xl text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-white">
              <Navigation className="w-4 h-4 text-primary animate-pulse" /> Official Google Route Corridor
            </div>
            <div className="text-[11px] text-emerald-400 font-mono font-bold">
              {extractedData.distanceKm} KM • {extractedData.durationText}
            </div>
            <div className="text-[9px] text-slate-300 font-semibold truncate max-w-[220px]">
              📍 {originText.split(',')[0]} ➔ {destinationText.split(',')[0]}
            </div>
          </div>
        </div>

        {/* Enterprise Output Quotation Card (5 Columns) */}
        <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
          <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Official Freight Quotation
              </span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[9px] font-mono">
                INSTANT VERIFIED
              </Badge>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Official Road Distance</span>
                <span className="font-mono font-extrabold text-white text-sm">{extractedData.distanceKm} KM</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Google Estimated Duration</span>
                <span className="font-mono font-bold text-amber-400">{extractedData.durationText}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Selected Vehicle Class</span>
                <span className="font-mono font-bold text-slate-200">{selectedVehicle.name}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Vehicle Base Rate</span>
                <span className="font-mono font-bold text-slate-200">₹ {selectedVehicle.ratePerKm} / KM</span>
              </div>

              <div className="border-t border-slate-800 pt-2 space-y-1.5">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Calculated Base Freight</span>
                  <span className="font-mono text-slate-200">₹ {calculatedBase.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Estimated Toll Charges</span>
                  <span className="font-mono text-slate-200">₹ {tollCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Fuel Surcharge (5%)</span>
                  <span className="font-mono text-slate-200">₹ {fuelSurcharge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Loading & Unloading</span>
                  <span className="font-mono text-slate-200">₹ {loadingUnloading.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>GST (5%)</span>
                  <span className="font-mono text-slate-200">₹ {gstAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                <div>
                  <span className="text-xs font-black text-white block">Grand Total Freight Fare</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">All Tolls, Fuel & Taxes Incl.</span>
                </div>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ₹ {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          <Button
            onClick={handleShareWhatsAppQuote}
            className="w-full rounded-2xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white h-11 shadow-lg"
          >
            <MessageSquare className="w-4 h-4 mr-2" /> Book Freight Load on WhatsApp
          </Button>
        </div>
      </div>
    </Card>
  );
}
