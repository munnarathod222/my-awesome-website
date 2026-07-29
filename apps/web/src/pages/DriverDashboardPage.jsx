import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Pause, CheckCircle2, AlertTriangle, Navigation, MapPin, 
  Camera, Fuel, Wrench, Shield, Phone, Hotel, Disc, Radio 
} from 'lucide-react';
import { toast } from 'sonner';
import { openMapLocation } from '@/lib/locationUtils.js';
import { motion } from 'framer-motion';

const NEARBY_CATEGORIES = [
  { id: 'fuel', name: 'Fuel Stations', icon: Fuel, query: 'Fuel Station near me' },
  { id: 'tyre', name: 'Puncture & Tyre Shop', icon: Disc, query: 'Tyre repair shop near me' },
  { id: 'mechanic', name: 'Mechanic & Garage', icon: Wrench, query: 'Truck mechanic near me' },
  { id: 'hospital', name: 'Hospital & Emergency', icon: Shield, query: 'Hospital near me' },
  { id: 'police', name: 'Police Station', icon: Phone, query: 'Police station near me' },
  { id: 'hotel', name: 'Dhaba & Hotels', icon: Hotel, query: 'Dhaba hotel near me' },
];

export default function DriverDashboardPage() {
  const [tripStatus, setTripStatus] = useState('In Transit');
  const [tripData] = useState({
    id: 'TRIP-9041',
    truckNumber: 'TS 09 UB 7890',
    origin: 'Mumbai, Maharashtra',
    destination: 'Hyderabad, Telangana',
    customerName: 'Reliance Retail Logistics',
    destinationAddress: 'Kukatpally Industrial Corridor, Hyderabad'
  });

  const handleStartTrip = () => {
    setTripStatus('In Transit');
    toast.success('Trip Started! GPS Location Broadcast Active.');
  };

  const handlePauseTrip = () => {
    setTripStatus('Paused');
    toast.warning('Trip Paused (Rest Stop / Fueling).');
  };

  const handleCompleteTrip = () => {
    setTripStatus('Delivered');
    toast.success('Trip Completed! Please upload POD document.');
  };

  const handleEmergencySOS = () => {
    toast.error('EMERGENCY SOS TRIGGERED! Location broadcasted to Jai Bhavani Admin Hotline.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-5 font-sans"
    >
      <Helmet>
        <title>Driver Mobile Dispatch Portal | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Driver Mobile Header */}
      <Card className="rounded-3xl border border-primary/30 bg-slate-950 text-slate-100 p-5 shadow-2xl space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-mono font-bold">
              🟢 {tripStatus}
            </Badge>
            <h1 className="text-xl font-black text-white mt-1">{tripData.truckNumber}</h1>
            <p className="text-xs text-slate-400">Waybill: #{tripData.id} • {tripData.customerName}</p>
          </div>

          <Button
            size="sm"
            onClick={handleEmergencySOS}
            className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg animate-pulse"
          >
            <AlertTriangle className="w-4 h-4 mr-1" /> SOS
          </Button>
        </div>

        {/* Route Details */}
        <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-white">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Origin: {tripData.origin}</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-white">
            <Navigation className="w-4 h-4 text-primary shrink-0" />
            <span>Destination: {tripData.destinationAddress}</span>
          </div>
        </div>

        {/* Driver Trip Controls */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <Button
            onClick={handleStartTrip}
            disabled={tripStatus === 'In Transit'}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl h-10"
          >
            <Play className="w-4 h-4 mr-1" /> Start
          </Button>

          <Button
            onClick={handlePauseTrip}
            disabled={tripStatus === 'Paused'}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl h-10"
          >
            <Pause className="w-4 h-4 mr-1" /> Pause
          </Button>

          <Button
            onClick={handleCompleteTrip}
            disabled={tripStatus === 'Delivered'}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl h-10"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
          </Button>
        </div>

        <Button
          onClick={() => openMapLocation(tripData.destinationAddress)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs rounded-2xl h-11 shadow-lg"
        >
          <Navigation className="w-4 h-4 mr-2" /> Open Google Maps Turn-by-Turn Navigation
        </Button>
      </Card>

      {/* Nearby Driver Services Finder */}
      <Card className="rounded-3xl border border-slate-800 bg-card p-5 space-y-3 shadow-md">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" /> Locate Nearby Highway Services
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {NEARBY_CATEGORIES.map(cat => {
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => openMapLocation(cat.query)}
                className="p-3 bg-muted/20 hover:bg-muted/50 border border-border/40 rounded-2xl flex flex-col items-center text-center space-y-1.5 transition-colors"
              >
                <CatIcon className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold text-foreground">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
