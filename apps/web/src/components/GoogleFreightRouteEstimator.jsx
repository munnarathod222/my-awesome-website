import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, Navigation, Truck, Calculator, Clock, MessageSquare, 
  ExternalLink, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';
import { loadGoogleMapsScript, calculateGoogleRoute, GOOGLE_MAPS_API_KEY } from '@/lib/googleMapsLoader.js';
import { openMapLocation } from '@/lib/locationUtils.js';

const TRUCK_TYPES = [
  { id: '32ft_mxl', name: '32ft MXL Container (14 Ton)', ratePerKm: 46 },
  { id: '32ft_sxl', name: '32ft SXL Container (7 Ton)', ratePerKm: 38 },
  { id: '24ft_open', name: '24ft Open Body Truck (10 Ton)', ratePerKm: 42 },
  { id: '14ft_eicher', name: '14ft Eicher City (4 Ton)', ratePerKm: 28 },
  { id: '40ft_trailer', name: '40ft Flatbed Trailer (25 Ton)', ratePerKm: 68 },
];

const POPULAR_ROUTES = [
  { origin: 'Mumbai, Maharashtra', destination: 'Hyderabad, Telangana' },
  { origin: 'Delhi, NCR', destination: 'Bangalore, Karnataka' },
  { origin: 'Chennai, Tamil Nadu', destination: 'Pune, Maharashtra' },
  { origin: 'Hyderabad, Telangana', destination: 'Vijayawada, Andhra Pradesh' },
];

export default function GoogleFreightRouteEstimator() {
  const [origin, setOrigin] = useState('Mumbai, Maharashtra');
  const [destination, setDestination] = useState('Hyderabad, Telangana');
  const [selectedTruckId, setSelectedTruckId] = useState('32ft_mxl');
  const [loading, setLoading] = useState(false);

  // Calculated Google Maps Route Data
  const [routeInfo, setRouteInfo] = useState({
    distanceKm: 708,
    distanceText: '708 km',
    durationText: '12 hours 45 mins',
    durationMins: 765,
    startAddress: 'Mumbai, Maharashtra, India',
    endAddress: 'Hyderabad, Telangana, India'
  });

  const mapRef = useRef(null);
  const googleMapInstance = useRef(null);
  const directionsRendererRef = useRef(null);

  const selectedTruck = TRUCK_TYPES.find(t => t.id === selectedTruckId) || TRUCK_TYPES[0];

  // Financial Estimation Math
  const baseFreight = routeInfo.distanceKm * selectedTruck.ratePerKm;
  const estimatedToll = Math.round(routeInfo.distanceKm * 2.2); // ~₹2.2/km highway tolls
  const gstAmount = Math.round(baseFreight * 0.05); // 5% GST
  const totalEstimatedCost = baseFreight + estimatedToll + gstAmount;

  // Initialize and Render Google Map Canvas
  const renderGoogleMap = async (routeData) => {
    try {
      const maps = await loadGoogleMapsScript();
      if (!mapRef.current) return;

      if (!googleMapInstance.current) {
        googleMapInstance.current = new maps.Map(mapRef.current, {
          zoom: 6,
          center: { lat: 19.0760, lng: 72.8777 }, // Default India center
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
            { featureType: "highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
            { featureType: "highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
          ]
        });

        directionsRendererRef.current = new maps.DirectionsRenderer({
          map: googleMapInstance.current,
          polylineOptions: {
            strokeColor: '#3b82f6',
            strokeWeight: 5,
            strokeOpacity: 0.8
          }
        });
      }

      if (routeData && routeData.rawDirections) {
        directionsRendererRef.current.setDirections(routeData.rawDirections);
      }
    } catch (err) {
      console.warn('Google Map rendering warning:', err);
    }
  };

  const handleCalculateRoute = async (orig = origin, dest = destination) => {
    if (!orig.trim() || !dest.trim()) {
      toast.error('Please enter both Pickup Origin and Delivery Destination cities.');
      return;
    }

    setLoading(true);
    try {
      const res = await calculateGoogleRoute(orig, dest);
      setRouteInfo(res);
      await renderGoogleMap(res);
      toast.success(`Route Distance Calculated: ${res.distanceText} • ${res.durationText}`);
    } catch (err) {
      console.warn('Route calculation warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculateRoute('Mumbai, Maharashtra', 'Hyderabad, Telangana');
  }, []);

  const handleSelectPopularRoute = (pop) => {
    setOrigin(pop.origin);
    setDestination(pop.destination);
    handleCalculateRoute(pop.origin, pop.destination);
  };

  const handleShareWhatsAppQuote = () => {
    const text = `*JAI BHAVANI CARGO - FREIGHT ESTIMATION* 🚚\n\n` +
      `📍 *Route*: ${origin} ➔ ${destination}\n` +
      `📏 *Distance*: ${routeInfo.distanceText}\n` +
      `⏱️ *Transit Time*: ${routeInfo.durationText}\n` +
      `🚛 *Vehicle*: ${selectedTruck.name}\n` +
      `💰 *Estimated Freight Fare*: ₹${totalEstimatedCost.toLocaleString()} (Incl. Tolls & GST)\n\n` +
      `Book Now: https://www.jaibhavanicargo.com`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <Card className="rounded-3xl border border-primary/30 bg-slate-950 text-slate-100 shadow-2xl p-5 sm:p-6 font-sans space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] font-mono font-bold">
              GOOGLE MAPS PLATFORM INTEGRATED
            </Badge>
            <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live Geocoding API Active
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-primary animate-pulse" /> Live Google Maps Freight Estimator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Instant driving distance, travel duration, and transparent freight fare calculation for your transport cargo.
          </p>
        </div>

        <Button
          onClick={handleShareWhatsAppQuote}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shrink-0"
        >
          <MessageSquare className="w-4 h-4 mr-1.5" /> Share Quote on WhatsApp
        </Button>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Pickup Origin City
          </label>
          <Input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g. Mumbai, Maharashtra"
            className="bg-slate-900 border-slate-800 text-xs h-10 mt-1 rounded-xl text-white font-medium"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" /> Delivery Destination City
          </label>
          <Input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Hyderabad, Telangana"
            className="bg-slate-900 border-slate-800 text-xs h-10 mt-1 rounded-xl text-white font-medium"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-amber-400" /> Truck Fleet Category
          </label>
          <select
            value={selectedTruckId}
            onChange={(e) => setSelectedTruckId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs h-10 mt-1 rounded-xl text-white font-medium px-3 focus:outline-none focus:border-primary"
          >
            {TRUCK_TYPES.map(truck => (
              <option key={truck.id} value={truck.id}>
                {truck.name} (₹{truck.ratePerKm}/km)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Popular Fast Routes Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Popular Lanes:</span>
        {POPULAR_ROUTES.map((pop, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectPopularRoute(pop)}
            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-[11px] font-semibold border border-slate-800 shrink-0 transition-colors"
          >
            {pop.origin.split(',')[0]} ➔ {pop.destination.split(',')[0]}
          </button>
        ))}
      </div>

      <Button
        onClick={() => handleCalculateRoute(origin, destination)}
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm rounded-2xl h-11 shadow-lg"
      >
        <Calculator className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Calculating Google Maps Route...' : 'Calculate Google Route & Freight Fare'}
      </Button>

      {/* Interactive Google Maps & Route Breakdown Container */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pt-2">
        {/* Interactive Google Map Canvas (3 Columns) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden relative min-h-[280px]">
          <div ref={mapRef} className="w-full h-full min-h-[280px]" />
          
          <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-800 backdrop-blur rounded-xl p-2.5 shadow-xl text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-white">
              <Navigation className="w-3.5 h-3.5 text-primary" /> Google Route Corridor
            </div>
            <div className="text-[11px] text-slate-300 font-mono">
              {routeInfo.distanceText} • {routeInfo.durationText}
            </div>
          </div>
        </div>

        {/* Financial Breakdown & Fare Card (2 Columns) */}
        <div className="lg:col-span-2 space-y-3 flex flex-col justify-between">
          <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
              Route Estimation Summary
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Exact Driving Distance</span>
                <span className="font-mono font-bold text-white text-sm">{routeInfo.distanceText}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Estimated Transit Duration</span>
                <span className="font-mono font-bold text-amber-400">{routeInfo.durationText}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Vehicle Class</span>
                <span className="font-mono font-bold text-slate-200">{selectedTruck.name}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Base Rate / KM</span>
                <span className="font-mono font-bold text-slate-200">₹ {selectedTruck.ratePerKm} / km</span>
              </div>

              <div className="border-t border-slate-800 pt-2 space-y-1.5">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Base Freight Charge</span>
                  <span className="font-mono">₹ {baseFreight.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Est. Highway Tolls</span>
                  <span className="font-mono">₹ {estimatedToll.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>GST (5%)</span>
                  <span className="font-mono">₹ {gstAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-white block">Total Estimated Fare</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Incl. Tolls & Taxes</span>
                </div>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ₹ {totalEstimatedCost.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => openMapLocation(`${origin} to ${destination}`)}
              variant="outline"
              className="flex-1 rounded-xl text-xs font-bold border-slate-800 text-slate-300 hover:text-white bg-slate-900"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1 text-rose-400" /> Open in Google Maps
            </Button>

            <Button
              onClick={handleShareWhatsAppQuote}
              className="flex-1 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1" /> Book Load
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
