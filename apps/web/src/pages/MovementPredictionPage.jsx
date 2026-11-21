import React, { useState, useEffect } from 'react';
import { 
  Compass, MapPin, Clock, ShieldCheck, ArrowRight, RefreshCw, 
  Filter, Calendar, Info, Layers, CheckCircle, Navigation, Radio
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { reservationClient } from '@/lib/reservationClient.js';

const STATE_COORDINATES = {
  'All': { center: [17.3850, 78.4867], zoom: 5 },
  'Telangana': { center: [17.8496, 79.1152], zoom: 7 },
  'Andhra Pradesh': { center: [15.9129, 79.7400], zoom: 7 },
  'Karnataka': { center: [15.3173, 75.7139], zoom: 7 },
  'Maharashtra': { center: [19.7515, 75.7139], zoom: 7 },
  'Tamil Nadu': { center: [11.1271, 78.6569], zoom: 7 },
};

const CITY_COORDINATES = {
  'hyderabad': { lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  'hubli': { lat: 15.3647, lng: 75.1240, state: 'Karnataka' },
  'pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  'bangalore': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  'vijayawada': { lat: 16.5062, lng: 80.6480, state: 'Andhra Pradesh' },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh' },
  'belgaum': { lat: 15.8497, lng: 74.4977, state: 'Karnataka' },
  'mumbai': { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' }
};

function getCityCoords(locName) {
  const clean = (locName || '').toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (clean.includes(key)) return coords;
  }
  return { lat: 17.3850, lng: 78.4867, state: 'Telangana' };
}

export default function MovementPredictionPage() {
  const [horizonDays, setHorizonDays] = useState(0); // 0 = today, 1, 2, 3, 7, 15, 30
  const [selectedState, setSelectedState] = useState('All');
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTruck, setSelectedTruck] = useState(null);

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + horizonDays);

  const loadForecasts = async () => {
    try {
      setLoading(true);
      const res = await reservationClient.getForecasts(targetDate.toISOString());
      setForecasts(res.forecasts || []);
    } catch (err) {
      toast.error('Failed to load movement forecasts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecasts();
  }, [horizonDays]);

  const filteredForecasts = forecasts.filter(f => {
    if (selectedState === 'All') return true;
    const loc = (f.predicted_location || f.current_location || '').toLowerCase();
    const cityCoords = getCityCoords(loc);
    return cityCoords.state === selectedState;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Module 2 & 7: Intelligent Movement Engine & Map
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              Real Route Corridors & Unloading SLAs
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3">
            <Navigation className="w-7 h-7 text-cyan-400" />
            Predictive Fleet Movement & Distribution
          </h1>
          <p className="text-sm text-slate-400">
            Intelligent forecasts of future truck locations across India. Visualise fleet distribution over 7, 15, and 30-day horizons.
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadForecasts}
          className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Recalculate Movement
        </Button>
      </div>

      {/* ── Future Date Timeline Scrubber / Slider ───────────────────── */}
      <Card className="bg-slate-900 border-slate-800 p-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Prediction Target Horizon: <span className="text-cyan-400 font-extrabold">{targetDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                {horizonDays === 0 ? 'Current real-time positioning' : `Forecasting fleet positions ${horizonDays} day(s) into the future`}
              </p>
            </div>
          </div>

          {/* Quick Horizon Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { days: 0, label: 'Today' },
              { days: 1, label: '+1 Day' },
              { days: 2, label: '+2 Days' },
              { days: 3, label: '+3 Days' },
              { days: 7, label: '+7 Days' },
              { days: 15, label: '+15 Days' },
              { days: 30, label: '+30 Days' }
            ].map(p => (
              <button
                key={p.days}
                onClick={() => setHorizonDays(p.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  horizonDays === p.days 
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Regional State Filter Strip ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filter by State Corridor:
        </span>
        {Object.keys(STATE_COORDINATES).map(stateName => (
          <Badge
            key={stateName}
            onClick={() => setSelectedState(stateName)}
            variant="outline"
            className={`cursor-pointer px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              selectedState === stateName
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {stateName}
          </Badge>
        ))}
      </div>

      {/* ── Interactive Movement Map Preview Card ───────────────────── */}
      <Card className="bg-slate-950 border-slate-800 overflow-hidden shadow-2xl relative">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Geographic Fleet Distribution Map</h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Actual Verified GPS
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-cyan-400 bg-cyan-400/30 animate-ping inline-block" />
              Predicted Future Position
            </span>
          </div>
        </div>

        {/* Visual Map Canvas Representation */}
        <div className="p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-[280px] flex flex-col justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {filteredForecasts.map(truck => {
              const coords = getCityCoords(truck.predicted_location);
              return (
                <div 
                  key={truck.truck_id || truck.truck_number}
                  onClick={() => setSelectedTruck(truck)}
                  className="p-4 rounded-xl border border-cyan-500/30 bg-slate-900/90 hover:border-cyan-400 hover:bg-slate-850 transition-all cursor-pointer shadow-lg space-y-2.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-white group-hover:text-cyan-400 transition-colors">
                      {truck.truck_number}
                    </span>
                    <Badge className="bg-cyan-500/20 text-cyan-300 text-[10px] border-cyan-500/30">
                      {truck.prediction_confidence}% Conf.
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold">{truck.predicted_location || 'Hyderabad Hub'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Region: {coords.state}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Status: <strong className="text-white">{truck.prediction_status}</strong></span>
                    <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">Details →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── Movement Predictions Forecast Table ─────────────────────── */}
      <Card className="bg-slate-950 border-slate-800 overflow-hidden shadow-2xl">
        <CardHeader className="bg-slate-900/90 border-b border-slate-800 py-3.5 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            Detailed Movement Forecast Matrix ({filteredForecasts.length} Trucks)
          </CardTitle>
          <span className="text-xs text-slate-400">
            Confidence evaluated across 10 operational parameters
          </span>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Truck Number</th>
                <th className="py-3 px-4">Vehicle Category</th>
                <th className="py-3 px-4">Current / Stationed Location</th>
                <th className="py-3 px-4">Predicted Location ({horizonDays}d)</th>
                <th className="py-3 px-4">Expected Arrival & SLA</th>
                <th className="py-3 px-4">Next Available Departure</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredForecasts.map(truck => (
                <tr 
                  key={truck.truck_id || truck.truck_number}
                  className="hover:bg-slate-900/60 transition-colors cursor-pointer"
                  onClick={() => setSelectedTruck(truck)}
                >
                  <td className="py-3 px-4 font-black text-white">{truck.truck_number}</td>
                  <td className="py-3 px-4 text-slate-300">{truck.vehicle_category}</td>
                  <td className="py-3 px-4 text-slate-400">{truck.current_location || 'Hyderabad Hub'}</td>
                  <td className="py-3 px-4 font-bold text-cyan-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {truck.predicted_location || 'Hyderabad Hub'}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {truck.estimated_arrival ? new Date(truck.estimated_arrival).toLocaleString('en-IN') : 'At Depot'}
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">
                    {truck.earliest_next_departure ? new Date(truck.earliest_next_departure).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Immediate'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-bold">
                      {truck.prediction_confidence}%
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="border-slate-700 bg-slate-900 text-slate-300">
                      {truck.prediction_status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
