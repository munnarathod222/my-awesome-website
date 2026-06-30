import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Truck, Search, Plus, MapPin, MoreHorizontal, Edit, Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown, Route as RouteIcon, AlertCircle } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData.js';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import pb from '@/lib/pocketbaseClient.js';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import { cn } from '@/lib/utils.js';
import { TRIP_STATUS_OPTIONS, getTripStatusLabel, getTripStatusColor } from '@/lib/tripStatusUtils.js';
import AddTripModal from '@/components/AddTripModal.jsx';
import AddRecurringTripModal from '@/components/AddRecurringTripModal.jsx';
import RouteModal from '@/components/RouteModal.jsx';

const TripManagerPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  
  // Fetch all trips for main tabs
  const { data: trips, loading: tripsLoading, error: tripsError, retry: retryTrips } = usePageData('trip_logs', { sort: '-date' });

  // Routes Data State
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routesError, setRoutesError] = useState(null);
  
  // Route Activity Tab State
  const [routeSortConfig, setRouteSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [routeFilters, setRouteFilters] = useState({
    name: '',
    code: '',
    minAmount: '',
    maxAmount: '',
    minKm: '',
    maxKm: ''
  });

  // Route Master Tab State
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [selectedRouteForEdit, setSelectedRouteForEdit] = useState(null);
  const [routeToDelete, setRouteToDelete] = useState(null);
  const [isDeletingRoute, setIsDeletingRoute] = useState(false);
  const [routeMasterSearchTerm, setRouteMasterSearchTerm] = useState('');
  const [routeMasterFilters, setRouteMasterFilters] = useState({
    minAmount: '', maxAmount: '', minKm: '', maxKm: ''
  });
  const [routeMasterSortConfig, setRouteMasterSortConfig] = useState({ key: 'route_name', direction: 'asc' });

  // Status Change Modal State
  const [statusChangeTrip, setStatusChangeTrip] = useState(null);
  const [newTripStatus, setNewTripStatus] = useState('');
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  // Fetch Routes Data
  const fetchRoutesData = async () => {
    setLoadingRoutes(true);
    setRoutesError(null);
    try {
      const res = await pb.collection('routes').getList(1, 500, { $autoCancel: false, sort: '-created' });
      setRoutes(res.items);
    } catch (err) {
      console.error('Failed to load routes:', err);
      setRoutesError('Failed to load comprehensive route data. Please try again.');
    } finally {
      setLoadingRoutes(false);
    }
  };

  useEffect(() => {
    fetchRoutesData();
  }, []);

  // --- TRIP LOGIC ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip record?')) return;
    try {
      await pb.collection('trip_logs').delete(id, { $autoCancel: false });
      toast.success('Trip deleted successfully');
      retryTrips();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete trip');
    }
  };

  const handleEdit = (id) => {
    toast.info('Redirecting to Trip Logs for detailed editing');
    navigate('/trip-logs');
  };

  const handleBadgeClick = (trip) => {
    setStatusChangeTrip(trip);
    setNewTripStatus(trip.trip_status || 'Upcoming');
  };

  const saveStatusChange = async () => {
    if (!statusChangeTrip) return;
    
    if (statusChangeTrip.trip_status === newTripStatus) {
      setStatusChangeTrip(null);
      return;
    }

    setIsStatusUpdating(true);
    try {
      await pb.collection('trip_logs').update(statusChangeTrip.id, {
        trip_status: newTripStatus
      }, { $autoCancel: false });
      
      try {
        const relatedTx = await pb.collection('cashbook_transactions').getFullList({
          filter: `source_record_id = "${statusChangeTrip.id}"`,
          $autoCancel: false
        });
        
        for (const tx of relatedTx) {
          const cleanDesc = tx.description.replace(/ \(Trip Status: .*?\)/, '');
          await pb.collection('cashbook_transactions').update(tx.id, {
            description: `${cleanDesc} (Trip Status: ${newTripStatus})`
          }, { $autoCancel: false });
        }
      } catch (txErr) {
        console.warn('Failed to sync with cashbook transactions (non-critical):', txErr);
      }

      toast.success(`Trip status updated to ${newTripStatus}`);
      retryTrips();
    } catch (err) {
      console.error('Update err:', err);
      toast.error('Failed to update status');
    } finally {
      setIsStatusUpdating(false);
      setStatusChangeTrip(null);
    }
  };

  // --- ROUTE MASTER LOGIC ---
  const handleAddRoute = () => {
    setSelectedRouteForEdit(null);
    setIsRouteModalOpen(true);
  };

  const handleEditRoute = (route) => {
    setSelectedRouteForEdit(route);
    setIsRouteModalOpen(true);
  };

  const confirmDeleteRoute = (route) => {
    setRouteToDelete(route);
  };

  const executeDeleteRoute = async () => {
    if (!routeToDelete) return;
    setIsDeletingRoute(true);
    try {
      await pb.collection('routes').delete(routeToDelete.id, { $autoCancel: false });
      toast.success('Route deleted successfully');
      setRouteToDelete(null);
      fetchRoutesData();
    } catch (error) {
      console.error('Failed to delete route:', error);
      toast.error('Failed to delete route');
    } finally {
      setIsDeletingRoute(false);
    }
  };

  const handleRouteMasterSort = (key) => {
    let direction = 'asc';
    if (routeMasterSortConfig.key === key && routeMasterSortConfig.direction === 'asc') direction = 'desc';
    setRouteMasterSortConfig({ key, direction });
  };

  const RouteMasterSortIcon = ({ columnKey }) => {
    if (routeMasterSortConfig.key !== columnKey) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 ml-1" />;
    return routeMasterSortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-primary" /> 
      : <ArrowDown className="w-3.5 h-3.5 ml-1 text-primary" />;
  };

  if (tripsLoading) return (
    <div className="min-h-[100dvh] bg-background">
      <Header />
      <LoadingSpinner text="Loading fleet data..." />
    </div>
  );

  if (tripsError) return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center">
      <Header />
      <div className="text-center p-8 max-w-md">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Error Loading Trips</h2>
        <p className="text-muted-foreground mb-6">{tripsError}</p>
        <Button onClick={retryTrips}>Try Again</Button>
      </div>
    </div>
  );

  // Trips Filtering
  const filteredTrips = trips.filter(trip => 
    (trip.route?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (trip.truck_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (trip.driver_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const activeTrips = filteredTrips.filter(t => t.client_payment_status !== 'received');
  const completedTrips = filteredTrips.filter(t => t.client_payment_status === 'received');

  // Process Routes Data for Route Activity Tab
  let processedActivityRoutes = routes.map(r => {
    const matchingTrips = trips.filter(t => 
      t.route?.toLowerCase() === r.route_name?.toLowerCase() || 
      t.route?.toLowerCase() === r.route_code?.toLowerCase() ||
      t.route?.toLowerCase().includes(r.route_name?.toLowerCase())
    );
    const avgAmount = matchingTrips.length > 0 
      ? matchingTrips.reduce((acc, t) => acc + (t.revenue || 0), 0) / matchingTrips.length 
      : r.amount_per_trip || 0;
    
    return { 
      ...r, 
      avgAmount,
      tripCount: matchingTrips.length
    };
  });

  processedActivityRoutes = processedActivityRoutes.filter(r => {
    if (routeFilters.name && !r.route_name?.toLowerCase().includes(routeFilters.name.toLowerCase())) return false;
    if (routeFilters.code && !r.route_code?.toLowerCase().includes(routeFilters.code.toLowerCase())) return false;
    if (routeFilters.minAmount && r.amount_per_trip < Number(routeFilters.minAmount)) return false;
    if (routeFilters.maxAmount && r.amount_per_trip > Number(routeFilters.maxAmount)) return false;
    if (routeFilters.minKm && r.distance_km < Number(routeFilters.minKm)) return false;
    if (routeFilters.maxKm && r.distance_km > Number(routeFilters.maxKm)) return false;
    return true;
  });

  processedActivityRoutes.sort((a, b) => {
    let valA = a[routeSortConfig.key];
    let valB = b[routeSortConfig.key];

    if (routeSortConfig.key === 'name') { valA = a.route_name; valB = b.route_name; }
    if (routeSortConfig.key === 'code') { valA = a.route_code; valB = b.route_code; }
    if (routeSortConfig.key === 'amount') { valA = a.amount_per_trip; valB = b.amount_per_trip; }
    if (routeSortConfig.key === 'kms') { valA = a.distance_km; valB = b.distance_km; }

    if (valA < valB) return routeSortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return routeSortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Process Routes Data for Route Master Tab
  const filteredMasterRoutes = routes.filter(route => {
    if (routeMasterSearchTerm) {
      const term = routeMasterSearchTerm.toLowerCase();
      const matchesName = (route.route_name || '').toLowerCase().includes(term);
      const matchesCode = (route.route_code || '').toLowerCase().includes(term);
      if (!matchesName && !matchesCode) return false;
    }
    if (routeMasterFilters.minAmount && route.amount_per_trip < Number(routeMasterFilters.minAmount)) return false;
    if (routeMasterFilters.maxAmount && route.amount_per_trip > Number(routeMasterFilters.maxAmount)) return false;
    if (routeMasterFilters.minKm && route.distance_km < Number(routeMasterFilters.minKm)) return false;
    if (routeMasterFilters.maxKm && route.distance_km > Number(routeMasterFilters.maxKm)) return false;
    return true;
  });

  const sortedMasterRoutes = [...filteredMasterRoutes].sort((a, b) => {
    let aVal = a[routeMasterSortConfig.key];
    let bVal = b[routeMasterSortConfig.key];
    
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return routeMasterSortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return routeMasterSortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleRouteSort = (key) => {
    let direction = 'asc';
    if (routeSortConfig.key === key && routeSortConfig.direction === 'asc') direction = 'desc';
    setRouteSortConfig({ key, direction });
  };

  const RouteSortIcon = ({ columnKey }) => {
    if (routeSortConfig.key !== columnKey) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 ml-1" />;
    return routeSortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-primary" /> 
      : <ArrowDown className="w-3.5 h-3.5 ml-1 text-primary" />;
  };

  const renderTripTable = (tripData, emptyMessage) => (
    <Card className="border-border shadow-sm rounded-xl overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Route Details</TableHead>
              <TableHead>Vehicle & Driver</TableHead>
              <TableHead className="text-right">Distance</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-center">Trip Status</TableHead>
              <TableHead className="text-center">Payment Status</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tripData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Truck className="w-10 h-10 mb-3 opacity-20" />
                    <p>{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tripData.map(trip => (
                <TableRow key={trip.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="whitespace-nowrap font-medium text-sm">
                    {format(new Date(trip.date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium max-w-[150px] truncate text-sm" title={trip.route}>{trip.route}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{trip.truck_number}</span>
                      <span className="text-xs text-muted-foreground">{trip.driver_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {trip.kms ? `${trip.kms} km` : '-'}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    {formatCurrency(trip.revenue || 0)}
                  </TableCell>
                  <TableCell className="text-center">
                    <button 
                      onClick={() => handleBadgeClick(trip)}
                      className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider transition-opacity hover:opacity-80 border",
                        getTripStatusColor(trip.trip_status)
                      )}
                    >
                      {getTripStatusLabel(trip.trip_status)}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium border uppercase tracking-wider",
                      trip.client_payment_status === 'received' ? 'bg-success/10 text-success border-success/20' : 
                      trip.client_payment_status === 'pending' ? 'bg-warning/10 text-warning border-warning/20' : 
                      'bg-muted text-muted-foreground border-border'
                    )}>
                      {trip.client_payment_status || 'Blank'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(trip.id)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit Trip
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(trip.id)} className="text-destructive focus:bg-destructive/10">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <Helmet>
        <title>Trip Manager - Jai Bhavani Cargo</title>
      </Helmet>
      <Header />
      
      <main className="flex-1 pt-8 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Trip Manager</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Comprehensive overview and management of all fleet shipments and routes.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button variant="outline" onClick={() => navigate('/bulk-upload')} className="bg-background flex-1 md:flex-none">
                Bulk Import
              </Button>
              <Button onClick={() => setIsRecurringModalOpen(true)} variant="outline" className="bg-background flex-1 md:flex-none gap-2 shadow-sm">
                <RouteIcon className="w-4 h-4" /> Add Recurring Trips
              </Button>
              <Button onClick={() => setIsAddTripModalOpen(true)} className="flex-1 md:flex-none gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> Create Trip
              </Button>
            </div>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
              <TabsList className="bg-muted/50 p-1 rounded-xl flex-wrap h-auto xl:h-10">
                <TabsTrigger value="active" className="rounded-lg px-4">Active Trips</TabsTrigger>
                <TabsTrigger value="completed" className="rounded-lg px-4">Completed</TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg px-4">All History</TabsTrigger>
                <TabsTrigger value="routes" className="rounded-lg px-4 gap-2"><RouteIcon className="w-4 h-4" /> Route Activity</TabsTrigger>
                <TabsTrigger value="route-master" className="rounded-lg px-4 gap-2"><MapPin className="w-4 h-4" /> Route Master</TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-lg px-4 hidden sm:flex">Analytics</TabsTrigger>
              </TabsList>

              <div className="relative w-full xl:max-w-xs xl:ml-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trips (route, truck, driver)..."
                  className="pl-9 bg-card border-border shadow-sm rounded-lg w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value="active" className="m-0 animate-in fade-in duration-300">
              {renderTripTable(activeTrips, "No active trips found matching your criteria.")}
            </TabsContent>

            <TabsContent value="completed" className="m-0 animate-in fade-in duration-300">
              {renderTripTable(completedTrips, "No completed trips found.")}
            </TabsContent>

            <TabsContent value="history" className="m-0 animate-in fade-in duration-300">
              {renderTripTable(filteredTrips, "No trips recorded in history.")}
            </TabsContent>
            
            <TabsContent value="routes" className="m-0 animate-in fade-in duration-300">
              <Card className="border-border shadow-sm rounded-xl overflow-hidden bg-card">
                <CardHeader className="bg-muted/30 border-b border-border pb-4 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Route Analysis</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Review average revenues and distances across established routes.</p>
                    </div>
                    <div className="flex gap-2 self-start sm:self-center">
                      <Button variant="outline" size="sm" onClick={fetchRoutesData} disabled={loadingRoutes} className="bg-background">
                        {loadingRoutes ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Refresh
                      </Button>
                    </div>
                  </div>
                  
                  {/* Filters for Route Activity */}
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Route Name</label>
                      <Input placeholder="Filter name" value={routeFilters.name} onChange={e => setRouteFilters({...routeFilters, name: e.target.value})} className="h-9 bg-background" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Route Code</label>
                      <Input placeholder="Filter code" value={routeFilters.code} onChange={e => setRouteFilters({...routeFilters, code: e.target.value})} className="h-9 bg-background" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Min Amount (₹)</label>
                      <Input type="number" placeholder="Min" value={routeFilters.minAmount} onChange={e => setRouteFilters({...routeFilters, minAmount: e.target.value})} className="h-9 bg-background" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Max Amount (₹)</label>
                      <Input type="number" placeholder="Max" value={routeFilters.maxAmount} onChange={e => setRouteFilters({...routeFilters, maxAmount: e.target.value})} className="h-9 bg-background" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Min Distance</label>
                      <Input type="number" placeholder="Min KM" value={routeFilters.minKm} onChange={e => setRouteFilters({...routeFilters, minKm: e.target.value})} className="h-9 bg-background" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Max Distance</label>
                      <Input type="number" placeholder="Max KM" value={routeFilters.maxKm} onChange={e => setRouteFilters({...routeFilters, maxKm: e.target.value})} className="h-9 bg-background" />
                    </div>
                  </div>
                </CardHeader>
                
                <div className="overflow-x-auto">
                  {loadingRoutes ? (
                    <div className="flex justify-center items-center h-48">
                      <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                    </div>
                  ) : routesError ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mb-2 text-destructive opacity-50" />
                      <p>{routesError}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-muted/10">
                        <TableRow>
                          <TableHead onClick={() => handleRouteSort('name')} className="cursor-pointer hover:bg-muted/50 transition-colors w-[35%]">
                            <div className="flex items-center font-semibold">
                              Route Name/Code <RouteSortIcon columnKey="name" />
                            </div>
                          </TableHead>
                          <TableHead onClick={() => handleRouteSort('code')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center font-semibold">
                              Route Code <RouteSortIcon columnKey="code" />
                            </div>
                          </TableHead>
                          <TableHead onClick={() => handleRouteSort('amount')} className="cursor-pointer hover:bg-muted/50 transition-colors text-right">
                            <div className="flex items-center justify-end font-semibold">
                              Amount / Trip <RouteSortIcon columnKey="amount" />
                            </div>
                          </TableHead>
                          <TableHead onClick={() => handleRouteSort('kms')} className="cursor-pointer hover:bg-muted/50 transition-colors text-right pr-6">
                            <div className="flex items-center justify-end font-semibold">
                              KMs <RouteSortIcon columnKey="kms" />
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedActivityRoutes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                              <div className="flex flex-col items-center justify-center">
                                <RouteIcon className="w-10 h-10 mb-3 opacity-20" />
                                <p>No routes found matching your criteria.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          processedActivityRoutes.map(route => (
                            <TableRow key={route.id} className="hover:bg-muted/30 transition-colors group">
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium text-[15px]">{route.route_name}</span>
                                  <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                    <span className="bg-secondary/20 text-secondary-foreground px-1.5 py-0.5 rounded font-mono text-[10px]">
                                      {route.route_code}
                                    </span>
                                    <span>• {route.tripCount} active/past trip{route.tripCount !== 1 ? 's' : ''}</span>
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-sm tracking-tight px-2 py-1 bg-muted rounded border border-border/50 text-foreground">
                                  {route.route_code}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-semibold text-sm">
                                  {route.amount_per_trip > 0 ? formatCurrency(route.amount_per_trip) : <span className="text-muted-foreground font-normal">No data</span>}
                                </span>
                              </TableCell>
                              <TableCell className="text-right pr-6">
                                <span className="text-sm font-medium">
                                  {route.distance_km ? `${route.distance_km.toLocaleString()} km` : <span className="text-muted-foreground font-normal">N/A</span>}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="route-master" className="m-0 animate-in fade-in duration-300">
              <Card className="shadow-sm border-border bg-card rounded-xl overflow-hidden">
                <CardHeader className="flex flex-col space-y-4 pb-4 bg-muted/30 border-b border-border">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-lg">Route Master</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Manage standard fleet routes, pricing, and distances.</p>
                    </div>
                    <Button onClick={handleAddRoute} className="shadow-sm">
                      <Plus className="w-4 h-4 mr-2" /> Add Route
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="space-y-1 col-span-2 lg:col-span-1">
                      <label className="text-xs font-medium text-muted-foreground">Search</label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input 
                          placeholder="Name or code..." 
                          value={routeMasterSearchTerm} 
                          onChange={e => setRouteMasterSearchTerm(e.target.value)} 
                          className="h-9 pl-8 bg-background" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Min Amount (₹)</label>
                      <Input type="number" placeholder="Min" value={routeMasterFilters.minAmount} onChange={e => setRouteMasterFilters({...routeMasterFilters, minAmount: e.target.value})} className="h-9 bg-background" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Max Amount (₹)</label>
                      <Input type="number" placeholder="Max" value={routeMasterFilters.maxAmount} onChange={e => setRouteMasterFilters({...routeMasterFilters, maxAmount: e.target.value})} className="h-9 bg-background" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Min Distance (KM)</label>
                      <Input type="number" placeholder="Min" value={routeMasterFilters.minKm} onChange={e => setRouteMasterFilters({...routeMasterFilters, minKm: e.target.value})} className="h-9 bg-background" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Max Distance (KM)</label>
                      <Input type="number" placeholder="Max" value={routeMasterFilters.maxKm} onChange={e => setRouteMasterFilters({...routeMasterFilters, maxKm: e.target.value})} className="h-9 bg-background" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    {loadingRoutes ? (
                      <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                      </div>
                    ) : routesError ? (
                      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                        <AlertCircle className="w-8 h-8 mb-2 text-destructive opacity-50" />
                        <p>{routesError}</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader className="bg-muted/10">
                          <TableRow>
                            <TableHead onClick={() => handleRouteMasterSort('route_code')} className="cursor-pointer w-[120px] hover:bg-muted/50 transition-colors">
                              <div className="flex items-center font-semibold">Route Code <RouteMasterSortIcon columnKey="route_code" /></div>
                            </TableHead>
                            <TableHead onClick={() => handleRouteMasterSort('route_name')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                              <div className="flex items-center font-semibold">Route Name <RouteMasterSortIcon columnKey="route_name" /></div>
                            </TableHead>
                            <TableHead onClick={() => handleRouteMasterSort('distance_km')} className="cursor-pointer text-right hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-end font-semibold">Distance (KM) <RouteMasterSortIcon columnKey="distance_km" /></div>
                            </TableHead>
                            <TableHead onClick={() => handleRouteMasterSort('amount_per_trip')} className="cursor-pointer text-right hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-end font-semibold">Amount <RouteMasterSortIcon columnKey="amount_per_trip" /></div>
                            </TableHead>
                            <TableHead className="hidden md:table-cell w-[25%] font-semibold">Description</TableHead>
                            <TableHead className="text-right pr-6 font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedMasterRoutes.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                <div className="flex flex-col items-center justify-center">
                                  <MapPin className="w-10 h-10 mb-3 opacity-20" />
                                  <p>No routes found.</p>
                                  {routes.length === 0 && (
                                    <Button variant="link" onClick={handleAddRoute} className="mt-2 text-primary">
                                      Create your first route
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            sortedMasterRoutes.map(route => (
                              <TableRow key={route.id} className="hover:bg-muted/30 transition-colors">
                                <TableCell>
                                  <span className="font-mono text-xs font-semibold px-2 py-1 bg-secondary/10 text-secondary-foreground rounded border border-secondary/20">
                                    {route.route_code}
                                  </span>
                                </TableCell>
                                <TableCell className="font-medium text-sm">{route.route_name}</TableCell>
                                <TableCell className="text-right text-sm text-muted-foreground">
                                  {route.distance_km ? `${route.distance_km} km` : '-'}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-sm">
                                  {formatCurrency(route.amount_per_trip || 0)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-[200px]" title={route.description}>
                                  {route.description || '-'}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditRoute(route)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => confirmDeleteRoute(route)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="m-0 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground font-medium">Total Distance Covered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold tracking-tight">
                      {trips.reduce((acc, t) => acc + (t.kms || 0), 0).toLocaleString()} <span className="text-lg text-muted-foreground font-normal">km</span>
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground font-medium">Total Generated Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold tracking-tight text-success">
                      {formatCurrency(trips.reduce((acc, t) => acc + (t.revenue || 0), 0))}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground font-medium">Active vs Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-bold tracking-tight">{activeTrips.length}</p>
                      <p className="text-muted-foreground mb-1">active / {completedTrips.length} done</p>
                    </div>
                    <div className="w-full h-2 bg-success/20 rounded-full mt-4 overflow-hidden flex">
                      <div 
                        className="h-full bg-warning" 
                        style={{ width: `${(activeTrips.length / (trips.length || 1)) * 100}%` }}
                      />
                      <div 
                        className="h-full bg-success" 
                        style={{ width: `${(completedTrips.length / (trips.length || 1)) * 100}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </main>

      {/* Individual Trip Status Change Modal */}
      <Dialog open={!!statusChangeTrip} onOpenChange={(open) => !open && setStatusChangeTrip(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Trip Status</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a new status for trip <span className="font-semibold text-foreground">{statusChangeTrip?.route}</span> 
              ({format(new Date(statusChangeTrip?.date || new Date()), 'dd MMM')})
            </p>
            <Select value={newTripStatus} onValueChange={setNewTripStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIP_STATUS_OPTIONS.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setStatusChangeTrip(null)} disabled={isStatusUpdating}>Cancel</Button>
            <Button onClick={saveStatusChange} disabled={isStatusUpdating}>
              {isStatusUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AddTripModal 
        isOpen={isAddTripModalOpen}
        onClose={() => setIsAddTripModalOpen(false)}
        onSuccess={retryTrips}
      />

      <AddRecurringTripModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onSuccess={retryTrips}
      />

      {/* Route Master Modals */}
      <RouteModal 
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        route={selectedRouteForEdit}
        onSuccess={fetchRoutesData}
      />

      <AlertDialog open={!!routeToDelete} onOpenChange={(open) => !open && !isDeletingRoute && setRouteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete route <strong>{routeToDelete?.route_code}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingRoute}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteRoute} disabled={isDeletingRoute} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeletingRoute ? 'Deleting...' : 'Delete Route'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TripManagerPage;