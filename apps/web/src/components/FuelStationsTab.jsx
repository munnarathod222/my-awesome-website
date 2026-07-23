import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Fuel, Plus, Search, MapPin, Phone, User, Building2, CreditCard, 
  IndianRupee, Wallet, Edit, Trash2, CheckCircle2, MessageSquare, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchFuelStations, deleteFuelStation } from '@/lib/fuelStationUtils.js';
import { formatMapUrl } from '@/lib/locationUtils.js';
import FuelStationModal from './FuelStationModal.jsx';
import FuelStationCreditPaymentModal from './FuelStationCreditPaymentModal.jsx';

export default function FuelStationsTab({ onRefreshRefills }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payStationId, setPayStationId] = useState(null);

  const loadStations = async () => {
    setLoading(true);
    try {
      const data = await fetchFuelStations();
      setStations(data);
    } catch (err) {
      console.error('Error fetching fuel stations:', err);
      toast.error('Failed to load fuel stations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  const handleAdd = () => {
    setEditingStation(null);
    setIsStationModalOpen(true);
  };

  const handleEdit = (station) => {
    setEditingStation(station);
    setIsStationModalOpen(true);
  };

  const handlePayCredit = (stationId) => {
    setPayStationId(stationId);
    setIsPaymentModalOpen(true);
  };

  const handleDelete = async (station) => {
    if (window.confirm(`Are you sure you want to delete ${station.station_name}?`)) {
      try {
        await deleteFuelStation(station.id);
        toast.success('Fuel station deleted successfully');
        loadStations();
      } catch (err) {
        console.error('Failed to delete fuel station:', err);
        toast.error('Failed to delete fuel station');
      }
    }
  };

  const filteredStations = stations.filter(s => {
    const q = search.toLowerCase();
    return (
      (s.station_name || '').toLowerCase().includes(q) ||
      (s.station_code || '').toLowerCase().includes(q) ||
      (s.brand || '').toLowerCase().includes(q) ||
      (s.location || '').toLowerCase().includes(q) ||
      (s.contact_person || '').toLowerCase().includes(q)
    );
  });

  const totalCreditOwed = stations.reduce((acc, s) => acc + (Number(s.credit_balance) || 0), 0);
  const totalPaid = stations.reduce((acc, s) => acc + (Number(s.total_paid) || 0), 0);

  const getBrandBadge = (brand) => {
    switch (brand) {
      case 'BPCL': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'IOCL': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'HPCL': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'Reliance': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'Nayara': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'Shell': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/60 p-4 rounded-2xl border border-border/50 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold font-heading flex items-center gap-2 text-foreground">
            <Fuel className="w-5 h-5 text-primary" />
            Fuel Station Directory & Credit Master
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage partner petrol bunks, track fuel credit dues (Udhar), and record credit settlements.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button onClick={() => setIsPaymentModalOpen(true)} variant="outline" className="flex-1 sm:flex-initial rounded-xl border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
            <Wallet className="w-4 h-4 mr-2" /> Pay Credit Balance
          </Button>
          <Button onClick={handleAdd} className="flex-1 sm:flex-initial rounded-xl shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Add Fuel Station
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/60 border-border/50 p-4 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Registered Bunks</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{loading ? <Skeleton className="h-8 w-12" /> : stations.length}</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-card/60 border-border/50 p-4 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Credit Owed (Udhar)</p>
              <h3 className="text-2xl font-bold text-amber-400 font-mono mt-1">
                {loading ? <Skeleton className="h-8 w-24" /> : `₹${totalCreditOwed.toLocaleString('en-IN')}`}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-card/60 border-border/50 p-4 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Payments Cleared</p>
              <h3 className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                {loading ? <Skeleton className="h-8 w-24" /> : `₹${totalPaid.toLocaleString('en-IN')}`}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search fuel station, code, brand, manager..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-background rounded-xl border-border/50"
        />
      </div>

      {/* Fuel Stations Table */}
      <Card className="bg-card/60 border border-border/50 overflow-hidden backdrop-blur-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b-border/40">
                <TableHead className="font-semibold text-muted-foreground pl-6 py-4">Station & Brand</TableHead>
                <TableHead className="font-semibold text-muted-foreground py-4">Contact Info</TableHead>
                <TableHead className="font-semibold text-muted-foreground py-4">Location</TableHead>
                <TableHead className="font-semibold text-muted-foreground py-4 text-right">Outstanding Udhar (₹)</TableHead>
                <TableHead className="font-semibold text-muted-foreground py-4 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-b-border/30">
                    <TableCell className="pl-6 py-4"><Skeleton className="h-5 w-40 mb-1" /><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="py-4"><Skeleton className="h-4 w-32 mb-1" /><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="py-4"><Skeleton className="h-4 w-44" /></TableCell>
                    <TableCell className="py-4 text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                    <TableCell className="py-4 text-right pr-6"><Skeleton className="h-8 w-24 ml-auto rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : filteredStations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <Fuel className="w-10 h-10 opacity-30 mx-auto mb-2" />
                    No fuel stations registered yet. Click <strong>+ Add Fuel Station</strong> to register one.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStations.map(s => {
                  const credit = Number(s.credit_balance) || 0;
                  const mapUrl = formatMapUrl(s.google_maps_url, s.location || s.station_name);

                  return (
                    <TableRow key={s.id} className="hover:bg-muted/20 transition-colors border-b-border/30">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`rounded-md font-extrabold text-[11px] ${getBrandBadge(s.brand)}`}>
                            {s.brand || 'Fuel'}
                          </Badge>
                          {s.station_code && (
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-secondary/30 text-secondary-foreground rounded border border-border/40">
                              {s.station_code}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-sm text-foreground mt-1.5">{s.station_name}</p>
                      </TableCell>

                      <TableCell className="py-4">
                        {s.contact_person && <p className="text-xs font-medium text-foreground">{s.contact_person}</p>}
                        {s.phone_number ? (
                          <div className="flex items-center gap-2 mt-1">
                            <a href={`tel:${s.phone_number}`} className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
                              <Phone className="w-3 h-3" /> {s.phone_number}
                            </a>
                            <a 
                              href={`https://wa.me/${s.phone_number.replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10px] text-green-400 hover:bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 flex items-center gap-1"
                            >
                              <MessageSquare className="w-2.5 h-2.5" /> WA
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs text-muted-foreground truncate max-w-[220px]" title={s.location}>
                            {s.location || '—'}
                          </p>
                          {mapUrl && (
                            <a 
                              href={mapUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-rose-500 hover:text-rose-600 shrink-0 p-0.5 hover:bg-rose-500/10 rounded"
                              title="Open in Google Maps GPS Navigation"
                            >
                              <MapPin className="w-3.5 h-3.5 fill-rose-500/10" />
                            </a>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-4 text-right">
                        <span className={`font-mono text-base font-extrabold px-2.5 py-1 rounded-md border ${
                          credit > 0 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          ₹{credit.toLocaleString('en-IN')}
                        </span>
                      </TableCell>

                      <TableCell className="py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handlePayCredit(s.id)}
                            className="h-8 px-2.5 text-xs rounded-lg border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            title="Pay Credit Dues"
                          >
                            <Wallet className="w-3.5 h-3.5 mr-1" /> Pay Udhar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(s)}
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
                            title="Edit Station"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(s)}
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                            title="Delete Station"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <FuelStationModal 
        isOpen={isStationModalOpen}
        onClose={() => setIsStationModalOpen(false)}
        station={editingStation}
        onSuccess={() => {
          loadStations();
          if (onRefreshRefills) onRefreshRefills();
        }}
      />

      <FuelStationCreditPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        selectedStationId={payStationId}
        onSuccess={() => {
          loadStations();
          if (onRefreshRefills) onRefreshRefills();
        }}
      />
    </div>
  );
}
