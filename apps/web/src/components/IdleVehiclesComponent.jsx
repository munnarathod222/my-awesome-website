import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, Truck, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, MapPin, Eye, 
  Activity, Clock, ShieldAlert, Sparkles, FileWarning, IndianRupee, Play, CheckCircle2, ChevronRight
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import AssignTripModal from './AssignTripModal.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

export default function IdleVehiclesComponent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data sets
  const [allTrucks, setAllTrucks] = useState([]);
  const [todayTrips, setTodayTrips] = useState([]);
  const [idleVehicles, setIdleVehicles] = useState([]);
  const [activeVehicles, setActiveVehicles] = useState([]);
  
  // Alerts Telemetry
  const [lowFastagVehicles, setLowFastagVehicles] = useState([]);
  const [expiryWarnings, setExpiryWarnings] = useState([]);

  // Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Filters & Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'daysIdle', direction: 'desc' });

  // Tab State
  const [activeTab, setActiveTab] = useState('unassigned');

  const fetchData = async () => {
    try {
      // 1. Fetch all trucks
      const trucksRes = await pb.collection('trucks').getFullList({
        sort: 'truck_number',
        $autoCancel: false
      });

      // 2. Fetch all trips sorted by date descending to extract latest info
      const allTripsRes = await pb.collection('trip_logs').getFullList({
        sort: '-date',
        $autoCancel: false
      });

      // Filter today's trips
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const todayTripsRes = allTripsRes.filter(t => t.date === todayStr);

      // 3. Fetch active documents
      const docsRes = await pb.collection('truck_documents').getFullList({
        filter: 'status = "Active"',
        $autoCancel: false
      });

      setAllTrucks(trucksRes);
      setTodayTrips(todayTripsRes);
      
      // Calculate Active & Idle lists based on ongoing trip status
      const activeTruckNumbers = allTripsRes
        .filter(t => ['Pending', 'Dispatched', 'In Transit'].includes(t.trip_status))
        .map(t => t.truck_number);
      
      // Enrich idle vehicles with telemetry
      const enrichedIdle = trucksRes
        .filter(t => !activeTruckNumbers.includes(t.truck_number))
        .map(truck => {
          // Find the last completed or delivered trip log for this truck to show its last activity
          const lastTrip = allTripsRes.find(trip => trip.truck_number === truck.truck_number);
          let daysIdle = 999; // Never dispatched
          let lastDriver = 'None';
          let lastRoute = 'N/A';
          let lastDate = null;
          
          if (lastTrip && lastTrip.date) {
            lastDate = lastTrip.date;
            lastDriver = lastTrip.driver_name || 'Unknown';
            lastRoute = lastTrip.route || 'N/A';
            daysIdle = Math.max(0, differenceInDays(new Date(), new Date(lastTrip.date)));
          }
          
          return {
            ...truck,
            daysIdle,
            lastDriver,
            lastRoute,
            lastDate
          };
        });
      setIdleVehicles(enrichedIdle);

      const activeList = [];
      allTripsRes
        .filter(trip => ['Pending', 'Dispatched', 'In Transit'].includes(trip.trip_status))
        .forEach(trip => {
          const truck = trucksRes.find(t => t.truck_number === trip.truck_number);
          activeList.push({
            id: trip.id,
            truck_number: trip.truck_number,
            driver_name: trip.driver_name,
            route: trip.route,
            trip_status: trip.trip_status,
            revenue: trip.revenue,
            date: trip.date,
            truck_id: truck ? truck.id : null
          });
        });
      setActiveVehicles(activeList);

      // Low Fastag balance telemetry
      const lowFastag = trucksRes.filter(t => t.current_fastag_balance !== undefined && t.current_fastag_balance !== null && t.current_fastag_balance < 2000);
      setLowFastagVehicles(lowFastag);

      // Expiring documents telemetry
      const warnings = [];
      const todayDate = new Date();
      docsRes.forEach(doc => {
        if (!doc.expiry_date) return;
        const expDate = new Date(doc.expiry_date);
        const daysLeft = differenceInDays(expDate, todayDate);
        if (daysLeft <= 30) {
          const truck = trucksRes.find(t => t.id === doc.truck_id);
          warnings.push({
            id: doc.id,
            truck_number: truck ? truck.truck_number : 'Unknown',
            truck_id: doc.truck_id,
            document_type: doc.document_type,
            expiry_date: doc.expiry_date,
            daysLeft,
            isExpired: daysLeft <= 0
          });
        }
      });
      setExpiryWarnings(warnings);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch fleet status data:', err);
      setError('Unable to load fleet status data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Real-time synchronization
    pb.collection('trip_logs').subscribe('*', () => fetchData());
    pb.collection('trucks').subscribe('*', () => fetchData());
    pb.collection('truck_documents').subscribe('*', () => fetchData());

    return () => {
      pb.collection('trip_logs').unsubscribe('*');
      pb.collection('trucks').unsubscribe('*');
      pb.collection('truck_documents').unsubscribe('*');
    };
  }, []);

  const filteredIdle = idleVehicles.filter(truck => {
    const truckClass = truck.vehicle_class || (
      truck.truck_axle === 'SXL' || truck.truck_axle === '2XL' ? '2' :
      truck.truck_axle === '3XL' ? '3' :
      truck.truck_axle === '4XL' ? '4' :
      truck.truck_axle === '5XL' ? '5' : ''
    );
    if (typeFilter !== 'all' && truckClass !== typeFilter) return false;
    if (statusFilter !== 'all' && (truck.fastag_status || 'Unknown').toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchTerm && !truck.truck_number.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const sortedIdle = [...filteredIdle].sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    if (sortConfig.key === 'daysIdle') {
      const aNum = Number(aVal) || 0;
      const bNum = Number(bVal) || 0;
      return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
    }

    aVal = aVal || '';
    bVal = bVal || '';
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter Active Today
  const filteredActive = activeVehicles.filter(trip => {
    if (searchTerm && !trip.truck_number.toLowerCase().includes(searchTerm.toLowerCase()) && !trip.driver_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-40 inline" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-primary inline" /> 
      : <ArrowDown className="w-3.5 h-3.5 ml-1 text-primary inline" />;
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'bg-success/10 text-success border-success/20';
    if (s === 'inactive') return 'bg-warning/10 text-warning border-warning/20';
    if (s === 'expired') return 'bg-destructive/10 text-destructive border-destructive/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  const totalCount = allTrucks.length;
  const idleCount = idleVehicles.length;
  const activeCount = activeVehicles.length;
  const idlePercentage = totalCount > 0 ? Math.round((idleCount / totalCount) * 100) : 0;
  
  const totalAlertsCount = lowFastagVehicles.length + expiryWarnings.length;

  return (
    <div className="space-y-6">
      {/* Premium KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Total Fleet */}
        <motion.div 
          whileHover={{ y: -2 }} 
          className="relative overflow-hidden p-5 rounded-2xl border border-white/5 bg-card/45 backdrop-blur-md shadow-md transition-all duration-300"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Fleet</p>
              <h3 className="text-3xl font-extrabold tracking-tight mt-1.5 text-foreground">
                {loading ? <Skeleton className="h-9 w-16 rounded-md" /> : totalCount}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/10">
              <Truck className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">Registered cargo vehicles</p>
        </motion.div>

        {/* KPI: Active Today */}
        <motion.div 
          whileHover={{ y: -2 }} 
          className="relative overflow-hidden p-5 rounded-2xl border border-white/5 bg-card/45 backdrop-blur-md shadow-md transition-all duration-300"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Fleet</p>
              <h3 className="text-3xl font-extrabold tracking-tight mt-1.5 text-emerald-400 flex items-baseline gap-2">
                {loading ? <Skeleton className="h-9 w-16 rounded-md" /> : activeCount}
                {!loading && activeCount > 0 && (
                  <span className="relative flex h-2.5 w-2.5 inline-block ml-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/10">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">Vehicles currently on route</p>
        </motion.div>

        {/* KPI: Unassigned / Idle */}
        <motion.div 
          whileHover={{ y: -2 }} 
          className="relative overflow-hidden p-5 rounded-2xl border border-white/5 bg-card/45 backdrop-blur-md shadow-md transition-all duration-300"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unassigned / Idle</p>
              <h3 className="text-3xl font-extrabold tracking-tight mt-1.5 text-amber-400">
                {loading ? <Skeleton className="h-9 w-16 rounded-md" /> : idleCount}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/10">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">Ready for trip dispatch</p>
        </motion.div>

        {/* KPI: Idle Percentage */}
        <motion.div 
          whileHover={{ y: -2 }} 
          className="relative overflow-hidden p-5 rounded-2xl border border-white/5 bg-card/45 backdrop-blur-md shadow-md transition-all duration-300"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Idle Percentage</p>
              <h3 className="text-3xl font-extrabold tracking-tight mt-1.5 text-foreground">
                {loading ? <Skeleton className="h-9 w-16 rounded-md" /> : `${idlePercentage}%`}
              </h3>
            </div>
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/10">
              <Clock className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">Ratio of unutilized vehicles</p>
        </motion.div>
      </div>

      {/* Main Hub Card */}
      <Card className="shadow-lg border-border/40 bg-card overflow-hidden rounded-2xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="bg-muted/10 border-b border-border/30 pb-3 space-y-4 px-6 pt-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-heading tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Fleet Status & Dispatch Hub
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Real-time telemetry and resource controller</CardDescription>
              </div>

              {/* Tabs list inside header */}
              <TabsList className="bg-secondary/40 p-1 border border-border/20 rounded-xl flex h-10 w-full md:w-auto shrink-0">
                <TabsTrigger value="unassigned" className="flex-1 md:flex-none text-xs rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Unassigned ({loading ? '...' : idleCount})
                </TabsTrigger>
                <TabsTrigger value="active" className="flex-1 md:flex-none text-xs rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  Active Fleet ({loading ? '...' : activeCount})
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex-1 md:flex-none text-xs rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  Alerts {totalAlertsCount > 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5 text-[9px] min-w-5 justify-center flex animate-pulse">{totalAlertsCount}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>

          {/* Unassigned / Idle Tab Content */}
          <TabsContent value="unassigned" className="m-0 outline-none">
            <div className="p-4 border-b border-border/20 bg-muted/5 flex flex-wrap items-center gap-2 justify-end">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Search truck number..." 
                  className="pl-8 h-9 bg-background/50 min-w-[200px] text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px] h-9 bg-background/50 text-foreground text-xs rounded-xl border border-border/25">
                  <SelectValue placeholder="Vehicle Class" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="2">Class 2</SelectItem>
                  <SelectItem value="3">Class 3</SelectItem>
                  <SelectItem value="4">Class 4</SelectItem>
                  <SelectItem value="5">Class 5</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-9 bg-background/50 text-foreground text-xs rounded-xl border border-border/25">
                  <SelectValue placeholder="FASTag Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active FASTag</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead onClick={() => handleSort('truck_number')} className="cursor-pointer hover:bg-muted/50 transition-colors pl-6">
                      Vehicle No. <SortIcon columnKey="truck_number" />
                    </TableHead>
                    <TableHead onClick={() => handleSort('daysIdle')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      Idle Duration <SortIcon columnKey="daysIdle" />
                    </TableHead>
                    <TableHead>Last Activity (Driver / Route)</TableHead>
                    <TableHead className="text-center">FASTag Status</TableHead>
                    <TableHead className="text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="pl-6"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-9 w-36" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                        <TableCell className="text-right pr-6"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : sortedIdle.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center">
                          <Truck className="w-9 h-9 mb-2 opacity-25" />
                          <p className="font-semibold text-sm">No idle vehicles found.</p>
                          {idleVehicles.length > 0 && <p className="text-xs mt-1 text-muted-foreground">Try clearing your filters.</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedIdle.map((truck) => (
                      <TableRow key={truck.id} className="hover:bg-muted/30 transition-all duration-200">
                        <TableCell className="font-semibold text-sm pl-6">
                          {truck.truck_number}
                        </TableCell>
                        <TableCell>
                          {truck.daysIdle === 999 ? (
                            <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold text-[10px] uppercase tracking-wide">
                              New / No Trips
                            </Badge>
                          ) : truck.daysIdle >= 5 ? (
                            <Badge className="bg-destructive/15 text-destructive border border-destructive/20 font-bold text-[10px] uppercase tracking-wide animate-pulse">
                              {truck.daysIdle} Days Idle
                            </Badge>
                          ) : truck.daysIdle >= 2 ? (
                            <Badge className="bg-warning/15 text-warning border border-warning/20 font-bold text-[10px] uppercase tracking-wide">
                              {truck.daysIdle} Days Idle
                            </Badge>
                          ) : (
                            <Badge className="bg-success/15 text-success border border-success/20 font-bold text-[10px] uppercase tracking-wide">
                              {truck.daysIdle === 0 ? 'Just Returned' : '1 Day Idle'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          <p className="font-bold text-foreground">{truck.lastDriver}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{truck.lastRoute}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`font-semibold text-[10px] uppercase tracking-wider ${getStatusColor(truck.fastag_status)}`}>
                            {truck.fastag_status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => navigate(`/fleet-maintenance?truckId=${truck.id}`)}
                              className="text-muted-foreground hover:text-foreground text-xs rounded-xl"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
                            </Button>
                            <Button 
                              size="sm" 
                              className="rounded-xl text-xs gap-1 shadow-sm"
                              onClick={() => {
                                setSelectedVehicle(truck);
                                setIsAssignModalOpen(true);
                              }}
                            >
                              <Play className="w-3 h-3" /> Assign Trip
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Active Fleet Tab Content */}
          <TabsContent value="active" className="m-0 outline-none">
            <div className="p-4 border-b border-border/20 bg-muted/5 flex justify-end">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Search active truck or driver..." 
                  className="pl-8 h-9 bg-background/50 min-w-[250px] text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="pl-6">Vehicle No.</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Active Route</TableHead>
                    <TableHead className="text-center">Trip Status</TableHead>
                    <TableHead className="text-right">Today's Revenue</TableHead>
                    <TableHead className="text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="pl-6"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                        <TableCell className="text-right pr-6"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredActive.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center">
                          <Activity className="w-9 h-9 mb-2 opacity-25" />
                          <p className="font-semibold text-sm">No active dispatches today.</p>
                          {activeVehicles.length > 0 && <p className="text-xs mt-1 text-muted-foreground">Try clearing your filters.</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActive.map((trip) => {
                      const statusColors = {
                        Dispatched: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                        'In Transit': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
                        Delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                        Cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
                      };
                      const statusCls = statusColors[trip.trip_status] || 'bg-secondary text-muted-foreground border-border/40';

                      return (
                        <TableRow key={trip.id} className="hover:bg-muted/30 transition-all duration-200">
                          <TableCell className="font-semibold text-sm pl-6">
                            {trip.truck_number}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {trip.driver_name || 'N/A'}
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-foreground/80 max-w-[200px] truncate">
                            {trip.route || '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${statusCls}`}>
                              {trip.trip_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-sm tabular-nums text-foreground">
                            ₹{(trip.revenue || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-xl text-xs gap-1 border-border/50 hover:bg-secondary/40"
                              onClick={() => navigate('/trip-logs')}
                            >
                              View Logs <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Alerts & Expiries Tab Content */}
          <TabsContent value="alerts" className="m-0 outline-none">
            <div className="p-6 space-y-6">
              {/* No Alerts State */}
              {!loading && totalAlertsCount === 0 && (
                <div className="py-12 text-center text-muted-foreground max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-full bg-success/15 border border-success/20 flex items-center justify-center mx-auto mb-4 text-success shadow-glow-success">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-foreground text-sm">All Systems Compliant</p>
                  <p className="text-xs text-muted-foreground mt-1">There are no expiring documents or low balance FASTags currently flagged for your fleet.</p>
                </div>
              )}

              {/* Expiring Documents Block */}
              {expiryWarnings.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500/80 flex items-center gap-1.5">
                    <FileWarning className="w-4 h-4" /> expiring or expired documents ({expiryWarnings.length})
                  </h4>
                  <div className="rounded-xl border border-border/30 overflow-hidden bg-card/20">
                    <Table>
                      <TableHeader className="bg-muted/10">
                        <TableRow>
                          <TableHead className="pl-4">Vehicle No.</TableHead>
                          <TableHead>Document Type</TableHead>
                          <TableHead>Expiry Date</TableHead>
                          <TableHead className="text-right pr-4">Days Left</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expiryWarnings.map(warn => (
                          <TableRow key={warn.id} className="hover:bg-muted/20">
                            <TableCell className="font-semibold text-sm pl-4">{warn.truck_number}</TableCell>
                            <TableCell className="text-sm font-medium text-foreground/80">{warn.document_type}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{format(new Date(warn.expiry_date), 'dd MMM yyyy')}</TableCell>
                            <TableCell className="text-right pr-4">
                              {warn.isExpired ? (
                                <Badge variant="destructive" className="font-bold text-[9px] uppercase tracking-wider animate-pulse">
                                  Expired {Math.abs(warn.daysLeft)}d ago
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 font-bold text-[9px] uppercase tracking-wider">
                                  {warn.daysLeft} days left
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Low FASTag Balances Block */}
              {lowFastagVehicles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500/80 flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4" /> low fastag balance warning ({lowFastagVehicles.length})
                  </h4>
                  <div className="rounded-xl border border-border/30 overflow-hidden bg-card/20">
                    <Table>
                      <TableHeader className="bg-muted/10">
                        <TableRow>
                          <TableHead className="pl-4">Vehicle No.</TableHead>
                          <TableHead>FASTag Provider</TableHead>
                          <TableHead>FASTag ID</TableHead>
                          <TableHead className="text-right pr-4">Current Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lowFastagVehicles.map(truck => (
                          <TableRow key={truck.id} className="hover:bg-muted/20">
                            <TableCell className="font-semibold text-sm pl-4">{truck.truck_number}</TableCell>
                            <TableCell className="text-xs font-semibold uppercase text-muted-foreground">{truck.fastag_provider || 'Other'}</TableCell>
                            <TableCell className="text-xs font-mono text-muted-foreground">{truck.fastag_id || '—'}</TableCell>
                            <TableCell className="text-right pr-4 font-bold text-sm tabular-nums text-rose-500">
                              ₹{(truck.current_fastag_balance || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Assign Modal Trigger */}
      {selectedVehicle && (
        <AssignTripModal 
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedVehicle(null);
          }}
          vehicleId={selectedVehicle.id}
          vehicleName={selectedVehicle.truck_number}
        />
      )}
    </div>
  );
}