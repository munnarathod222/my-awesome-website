import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Truck, Search, Download, Eye, Wrench, 
  CheckCircle2, AlertTriangle, Clock, RefreshCw, FileText, Plus, Shield
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import VehicleHealthPassportModal from '@/components/VehicleHealthPassportModal.jsx';
import { enhanceTrucksWithNumbers } from '@/lib/truckUtils.js';
import apiServerClient from '@/lib/apiServerClient.js';

export default function VehicleHealthPassportsPage() {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPassportTruck, setSelectedPassportTruck] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      let fetchedTrucks = [];
      try {
        const res = await apiServerClient.fetch('/trucks/list');
        if (res.ok) {
          const data = await res.json();
          fetchedTrucks = data.trucks || data.items || [];
        }
      } catch (e) {
        console.warn('API fetch truck notice:', e);
      }

      if (fetchedTrucks.length === 0) {
        fetchedTrucks = await pb.collection('trucks').getFullList({
          sort: 'truck_number',
          $autoCancel: false
        }).catch(() => []);
      }

      // Fetch maintenance and overhaul records
      const logs = await pb.collection('maintenance_logs').getFullList({
        sort: '-date',
        $autoCancel: false
      }).catch(async () => {
        return await pb.collection('expenses').getFullList({
          filter: 'category = "Maintenance" || subcategory = "Maintenance"',
          sort: '-date',
          $autoCancel: false
        }).catch(() => []);
      });

      setTrucks(enhanceTrucksWithNumbers(fetchedTrucks));
      setMaintenanceLogs(logs);
    } catch (err) {
      console.error('Error loading health passport data:', err);
      toast.error('Failed to load vehicle health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute fleet health stats
  const fleetStats = useMemo(() => {
    const totalVehicles = trucks.length;
    let totalFleetMaintenance = 0;
    let totalServices = 0;

    trucks.forEach(t => {
      const tLogs = maintenanceLogs.filter(l => l.truck_id === t.truck_number || l.truck_number === t.truck_number || l.truck_id === t.id);
      const spend = tLogs.reduce((sum, l) => sum + (Number(l.cost || l.amount || 0)), 0);
      totalFleetMaintenance += spend;
      totalServices += tLogs.length;
    });

    return {
      totalVehicles,
      totalFleetMaintenance,
      totalServices,
      avgSpendPerTruck: totalVehicles > 0 ? Math.round(totalFleetMaintenance / totalVehicles) : 0
    };
  }, [trucks, maintenanceLogs]);

  // Filter trucks by search
  const filteredTrucks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return trucks;
    return trucks.filter(t => 
      (t.truck_number || '').toLowerCase().includes(q) ||
      (t.truck_name || '').toLowerCase().includes(q) ||
      (t.model || '').toLowerCase().includes(q) ||
      (t.driver_name || '').toLowerCase().includes(q)
    );
  }, [trucks, searchQuery]);

  const handleOpenPassport = (truck) => {
    setSelectedPassportTruck(truck);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-12">
        <LoadingSpinner text="Loading Vehicle Health Passports..." />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Vehicle Health Passports - Jai Bhavani Cargo</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-36 md:pb-8 font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 bg-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-foreground">
                  Vehicle Health Passports
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Official service histories, overhaul ledgers, and digital fitness certificates for your fleet.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchData} 
              className="rounded-xl border-border text-muted-foreground hover:text-foreground h-9 px-3"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
            </Button>
            <Button 
              onClick={() => navigate('/fleet-maintenance')} 
              size="sm" 
              className="rounded-xl bg-primary text-primary-foreground font-bold text-xs h-9 px-3.5"
            >
              <Wrench className="w-3.5 h-3.5 mr-1.5" /> Log Service / Repair
            </Button>
          </div>
        </div>

        {/* Fleet Health KPI Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <Card className="rounded-2xl border-border/60 bg-card/80 p-4 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Fleet Size</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-extrabold text-foreground">{fleetStats.totalVehicles}</span>
              <Truck className="w-4 h-4 text-primary opacity-80" />
            </div>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">100% Certified Passports</span>
          </Card>

          <Card className="rounded-2xl border-border/60 bg-card/80 p-4 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Service Events</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-extrabold text-blue-500">{fleetStats.totalServices}</span>
              <Wrench className="w-4 h-4 text-blue-500 opacity-80" />
            </div>
            <span className="text-[11px] text-muted-foreground font-medium mt-1 block">Overhauls & Repairs</span>
          </Card>

          <Card className="rounded-2xl border-border/60 bg-card/80 p-4 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Lifetime Maintenance</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-extrabold text-amber-500 tabular-nums">
                ₹{fleetStats.totalFleetMaintenance.toLocaleString('en-IN')}
              </span>
              <Shield className="w-4 h-4 text-amber-500 opacity-80" />
            </div>
            <span className="text-[11px] text-muted-foreground font-medium mt-1 block">Total Fleet Investment</span>
          </Card>

          <Card className="rounded-2xl border-border/60 bg-card/80 p-4 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Avg Spend / Vehicle</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-extrabold text-emerald-500 tabular-nums">
                ₹{fleetStats.avgSpendPerTruck.toLocaleString('en-IN')}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-80" />
            </div>
            <span className="text-[11px] text-muted-foreground font-medium mt-1 block">Per Truck Average</span>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-3 rounded-2xl border border-border/60">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by truck number, model, or driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-background border-border/80"
            />
          </div>
          <span className="text-xs text-muted-foreground font-semibold shrink-0">
            Showing <strong className="text-foreground">{filteredTrucks.length}</strong> of {trucks.length} Vehicles
          </span>
        </div>

        {/* Vehicle Health Passports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrucks.map(truck => {
            const tLogs = maintenanceLogs.filter(l => l.truck_id === truck.truck_number || l.truck_number === truck.truck_number || l.truck_id === truck.id);
            const totalSpend = tLogs.reduce((sum, l) => sum + (Number(l.cost || l.amount || 0)), 0);
            const totalRepairs = tLogs.length;
            const lastService = tLogs.length > 0 ? tLogs[0] : null;

            return (
              <Card 
                key={truck.id} 
                className="rounded-2xl sm:rounded-3xl border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all flex flex-col justify-between"
              >
                <div className="p-4 sm:p-5 space-y-3.5">
                  {/* Top Badge & Truck Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Active Passport
                        </Badge>
                        {truck.ownership_type && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            {truck.ownership_type}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-foreground font-mono mt-1.5">
                        {truck.truck_number}
                      </h3>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {truck.truck_name || truck.model || '32 FT Multi-Axle'}
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary font-black shrink-0 border border-border/50">
                      <Truck className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Key Health Metrics */}
                  <div className="grid grid-cols-2 gap-2 bg-secondary/25 p-3 rounded-2xl border border-border/40 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase block">Total Maintenance</span>
                      <span className="font-extrabold text-foreground tabular-nums">
                        ₹{totalSpend.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase block">Service Events</span>
                      <span className="font-bold text-foreground">
                        {totalRepairs} {totalRepairs === 1 ? 'Event' : 'Events'}
                      </span>
                    </div>
                  </div>

                  {/* Last Service Info */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider block">Latest Service:</span>
                    {lastService ? (
                      <p className="text-xs font-medium text-foreground bg-muted/30 p-2 rounded-xl border border-border/30 truncate">
                        🗓️ {lastService.date ? new Date(lastService.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'} — {lastService.service_type || lastService.category || 'Workshop Repair'}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic bg-muted/20 p-2 rounded-xl border border-border/20">
                        ✨ Regular Inspection & Healthy Status
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 border-t border-border/40 bg-secondary/15 flex items-center gap-2">
                  <Button 
                    onClick={() => handleOpenPassport(truck)}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> View Health Passport
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredTrucks.length === 0 && (
          <div className="text-center py-16 bg-card rounded-3xl border border-border/60 p-6">
            <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-base font-bold text-foreground">No Vehicles Match Your Search</h3>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search keywords.</p>
          </div>
        )}
      </div>

      {/* Official Health Passport Preview & PDF Modal */}
      {selectedPassportTruck && (
        <VehicleHealthPassportModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPassportTruck(null);
          }}
          truckNumber={selectedPassportTruck.truck_number}
          truckDetails={selectedPassportTruck}
          maintenanceLogs={maintenanceLogs}
        />
      )}
    </>
  );
}
