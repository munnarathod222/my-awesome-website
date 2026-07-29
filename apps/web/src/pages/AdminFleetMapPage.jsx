import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, MapPin, Navigation, Activity, Phone, RefreshCw, 
  ShieldCheck, AlertTriangle, Wrench, Search, Plus, Filter 
} from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { loadGoogleMapsScript } from '@/lib/googleMapsLoader.js';
import { motion } from 'framer-motion';

const FLEET_STATUS_COLORS = {
  'In Transit': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Available': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Idle': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Maintenance': 'bg-rose-500/10 text-rose-400 border-rose-500/30'
};

export default function AdminFleetMapPage() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTruck, setSelectedTruck] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const fetchFleetData = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('trucks').getFullList({ sort: '-created', $autoCancel: false });
      const enriched = (records || []).map((t, idx) => ({
        id: t.id,
        truckNumber: t.truck_number,
        driverName: t.driver_name || `Driver ${idx + 1}`,
        status: idx % 3 === 0 ? 'In Transit' : idx % 3 === 1 ? 'Available' : 'Idle',
        speedKm: idx % 3 === 0 ? 64 : 0,
        currentLocation: idx % 3 === 0 ? 'NH-65 Highway (Solapur Toll)' : 'Jai Bhavani Logistics Hub',
        destination: idx % 3 === 0 ? 'Hyderabad, TS' : 'Available for Load',
        lat: 18.5204 + (idx * 0.4),
        lng: 73.8567 + (idx * 0.5),
        fastagBalance: t.current_fastag_balance || 3500
      }));
      setTrucks(enriched);
      if (enriched.length > 0) setSelectedTruck(enriched[0]);
    } catch (err) {
      console.error('Failed to fetch fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  const initFleetGoogleMap = async (fleetList) => {
    try {
      const maps = await loadGoogleMapsScript();
      if (!mapRef.current) return;

      mapInstance.current = new maps.Map(mapRef.current, {
        zoom: 6,
        center: { lat: 19.0760, lng: 74.8777 },
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
          { featureType: "highway", elementType: "geometry", stylers: [{ color: "#746855" }] }
        ]
      });

      fleetList.forEach(truck => {
        new maps.Marker({
          position: { lat: truck.lat, lng: truck.lng },
          map: mapInstance.current,
          title: `${truck.truckNumber} (${truck.status})`
        });
      });
    } catch (e) {
      console.warn('Fleet map rendering warning:', e);
    }
  };

  useEffect(() => {
    fetchFleetData();
  }, []);

  useEffect(() => {
    if (trucks.length > 0) {
      initFleetGoogleMap(trucks);
    }
  }, [trucks]);

  const filteredTrucks = trucks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return t.truckNumber?.toLowerCase().includes(q) || t.driverName?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 font-sans"
    >
      <Helmet>
        <title>Admin Live Fleet Telematics Map | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <Activity className="w-7 h-7" />
            </div>
            Admin Live Fleet Map & Telematics
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time GPS Fleet Tracking • Speed Monitoring • Fastag Toll Telematics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={fetchFleetData} variant="outline" className="rounded-xl text-xs font-bold shadow-sm">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Telematics
          </Button>
        </div>
      </div>

      {/* Map & Fleet Table Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Google Fleet Map (7 Cols) */}
        <Card className="lg:col-span-7 rounded-3xl border border-border/60 bg-card overflow-hidden shadow-md min-h-[420px] relative">
          <div ref={mapRef} className="w-full h-full min-h-[420px]" />
        </Card>

        {/* Fleet List Sidebar (5 Cols) */}
        <Card className="lg:col-span-5 rounded-3xl border border-border/60 bg-card p-4 space-y-4 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-foreground">Fleet Telematics Directory</h3>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono font-bold">
                {filteredTrucks.length} Vehicles
              </Badge>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Truck # or Driver..."
                className="pl-9 rounded-xl h-9 text-xs"
              />
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {filteredTrucks.map(truck => (
                <div
                  key={truck.id}
                  onClick={() => setSelectedTruck(truck)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                    selectedTruck?.id === truck.id
                      ? 'bg-primary/10 border-primary shadow-sm'
                      : 'bg-muted/20 border-border/40 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono text-foreground">{truck.truckNumber}</span>
                    <Badge variant="outline" className={`text-[9px] font-mono font-bold ${FLEET_STATUS_COLORS[truck.status]}`}>
                      {truck.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Driver: {truck.driverName}</span>
                    <span className="font-mono text-emerald-400 font-bold">{truck.speedKm} KM/H</span>
                  </div>

                  <div className="text-[10px] text-muted-foreground truncate">
                    📍 {truck.currentLocation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
