import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Plus, MapPin, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, 
  Grid, List, Copy, Check, Truck, Navigation, Compass, IndianRupee, 
  Map, Route as RouteIcon, Info, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import RouteModal from '@/components/RouteModal.jsx';
import { formatCurrency } from '@/lib/analyticsUtils.js';

const getRates = (route) => {
  const rate = route.amount_per_trip || 0;
  if (route.is_round_trip_rate) {
    return {
      legRate: rate / 2,
      roundTripRate: rate
    };
  } else {
    return {
      legRate: rate,
      roundTripRate: rate * 2
    };
  }
};

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [distanceFilter, setDistanceFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [copiedId, setCopiedId] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  
  // Delete states
  const [routeToDelete, setRouteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'route_name', direction: 'asc' });

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('routes').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setRoutes(records);
    } catch (error) {
      console.error('Failed to fetch routes:', error);
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAdd = () => {
    setSelectedRoute(null);
    setIsModalOpen(true);
  };

  const handleEdit = (route) => {
    setSelectedRoute(route);
    setIsModalOpen(true);
  };

  const confirmDelete = (route) => {
    setRouteToDelete(route);
  };

  const executeDelete = async () => {
    if (!routeToDelete) return;
    setIsDeleting(true);
    try {
      await pb.collection('routes').delete(routeToDelete.id, { $autoCancel: false });
      toast.success('Route deleted successfully');
      setRouteToDelete(null);
      fetchRoutes();
    } catch (error) {
      console.error('Failed to delete route:', error);
      toast.error('Failed to delete route');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyCode = (route, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(route.route_code || '');
    setCopiedId(route.id);
    toast.success(`Copied route code: ${route.route_code}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to parse route station names
  const parseRouteStations = (routeName) => {
    if (!routeName) return { start: 'N/A', end: 'N/A' };
    const parts = routeName.split(/(?:\s+to\s+|\s*-\s*|\s*➔\s*|\s*->\s*)/i);
    if (parts.length >= 2) {
      return { start: parts[0].trim(), end: parts[parts.length - 1].trim() };
    }
    return { start: routeName, end: '' };
  };

  // Helper to determine route category style based on distance
  const getRouteTierStyles = (distance) => {
    if (!distance) {
      return {
        border: 'border-t-slate-400 dark:border-t-slate-600',
        badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        text: 'Unknown Distance'
      };
    }
    if (distance < 100) {
      return {
        border: 'border-t-sky-500 dark:border-t-sky-400',
        badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
        text: 'Short (<100 km)'
      };
    }
    if (distance <= 300) {
      return {
        border: 'border-t-amber-500 dark:border-t-amber-400',
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        text: 'Medium (100-300 km)'
      };
    }
    return {
      border: 'border-t-indigo-500 dark:border-t-indigo-400',
      badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      text: 'Long (>300 km)'
    };
  };

  // Calculate KPIs
  const totalRoutesCount = routes.length;
  const totalDistance = routes.reduce((acc, r) => acc + (r.distance_km || 0), 0);
  const averageDistance = totalRoutesCount ? Math.round(totalDistance / totalRoutesCount) : 0;
  const averageRate = totalRoutesCount ? Math.round(routes.reduce((acc, r) => acc + (r.amount_per_trip || 0), 0) / totalRoutesCount) : 0;
  const longestRoute = totalRoutesCount ? Math.max(...routes.map(r => r.distance_km || 0)) : 0;

  // Filter and Sort Logic
  const filteredRoutes = routes.filter(route => {
    const matchesSearch = 
      (route.route_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (route.route_code || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDistance = true;
    if (distanceFilter === 'short') {
      matchesDistance = (route.distance_km || 0) < 100;
    } else if (distanceFilter === 'medium') {
      matchesDistance = (route.distance_km || 0) >= 100 && (route.distance_km || 0) <= 300;
    } else if (distanceFilter === 'long') {
      matchesDistance = (route.distance_km || 0) > 300;
    }

    let matchesPrice = true;
    const price = route.amount_per_trip || 0;
    if (priceFilter === 'budget') {
      matchesPrice = price < 10000;
    } else if (priceFilter === 'standard') {
      matchesPrice = price >= 10000 && price <= 25000;
    } else if (priceFilter === 'premium') {
      matchesPrice = price > 25000;
    }

    return matchesSearch && matchesDistance && matchesPrice;
  });

  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-40" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 ml-1 text-primary" />;
  };

  return (
    <>
      <Helmet>
        <title>Route Master - Jai Bhavani Cargo</title>
      </Helmet>
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-card to-card/50 p-6 rounded-2xl border border-border/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-primary/10 text-primary rounded-xl">
                <RouteIcon className="w-6 h-6" />
              </span>
              <h1 className="text-3xl font-bold tracking-tight font-heading text-foreground">Route Master</h1>
            </div>
            <p className="text-muted-foreground">Manage and optimize standard fleet routes, pricing models, and templates.</p>
          </div>
          <Button onClick={handleAdd} className="shadow-md rounded-xl px-5 hover:scale-[1.02] active:scale-95 transition-all">
            <Plus className="w-4 h-4 mr-2" /> Add Route Template
          </Button>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Routes</p>
                <h3 className="text-3xl font-bold tracking-tight text-foreground">{loading ? <Skeleton className="h-9 w-16" /> : totalRoutesCount}</h3>
              </div>
              <div className="p-3 bg-primary/5 text-primary rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <RouteIcon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Average Distance</p>
                <h3 className="text-3xl font-bold tracking-tight text-foreground">{loading ? <Skeleton className="h-9 w-20" /> : `${averageDistance} km`}</h3>
              </div>
              <div className="p-3 bg-amber-500/5 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Compass className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Average Trip Fare</p>
                <h3 className="text-3xl font-bold tracking-tight text-foreground">{loading ? <Skeleton className="h-9 w-24" /> : formatCurrency(averageRate)}</h3>
              </div>
              <div className="p-3 bg-emerald-500/5 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <IndianRupee className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Longest Route</p>
                <h3 className="text-3xl font-bold tracking-tight text-foreground">{loading ? <Skeleton className="h-9 w-20" /> : `${longestRoute} km`}</h3>
              </div>
              <div className="p-3 bg-indigo-500/5 text-indigo-500 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Navigation className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Toggle Controls */}
        <div className="bg-card/40 backdrop-blur-sm p-4 rounded-2xl border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search route code/name..."
                className="pl-9 bg-background/50 border-border/65 rounded-xl h-10 shadow-none focus-visible:ring-primary/30 text-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Distance Filter */}
            <Select value={distanceFilter} onValueChange={setDistanceFilter}>
              <SelectTrigger className="bg-background/50 border-border/65 rounded-xl h-10 shadow-none focus:ring-primary/30 text-foreground">
                <SelectValue placeholder="Filter by Distance" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Distances</SelectItem>
                <SelectItem value="short">Short (&lt; 100 km)</SelectItem>
                <SelectItem value="medium">Medium (100 - 300 km)</SelectItem>
                <SelectItem value="long">Long (&gt; 300 km)</SelectItem>
              </SelectContent>
            </Select>

            {/* Pricing Filter */}
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="bg-background/50 border-border/65 rounded-xl h-10 shadow-none focus:ring-primary/30 text-foreground">
                <SelectValue placeholder="Filter by Price" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Pricing</SelectItem>
                <SelectItem value="budget">Budget (&lt; ₹10,000)</SelectItem>
                <SelectItem value="standard">Standard (₹10,000 - ₹25,000)</SelectItem>
                <SelectItem value="premium">Premium (&gt; ₹25,000)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-2 border border-border/60 p-1 rounded-xl bg-background/40 self-end md:self-auto shrink-0 shadow-inner">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className={`rounded-lg h-8 px-3 ${viewMode === 'grid' ? 'shadow-sm text-foreground bg-card' : 'text-muted-foreground'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4 mr-1.5" /> Card Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              className={`rounded-lg h-8 px-3 ${viewMode === 'table' ? 'shadow-sm text-foreground bg-card' : 'text-muted-foreground'}`}
              onClick={() => setViewMode('table')}
            >
              <List className="w-4 h-4 mr-1.5" /> Table View
            </Button>
          </div>
        </div>

        {/* Routes Content Area */}
        {loading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Card key={idx} className="h-64 border border-border/50 bg-card/60 backdrop-blur-md">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-5 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-8 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-border/50 bg-card/60 backdrop-blur-md overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                    <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )
        ) : sortedRoutes.length === 0 ? (
          <Card className="border-2 border-dashed border-border/60 bg-card/10 p-16 text-center max-w-xl mx-auto rounded-3xl backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-muted rounded-full">
                <MapPin className="w-10 h-10 text-muted-foreground/60" />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground">No Routes Found</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                We couldn't find any routes matching your current search and filter criteria. Adjust the toggles or create a new template.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setDistanceFilter('all'); setPriceFilter('all'); }} className="rounded-xl text-foreground">
                  Clear Filters
                </Button>
                {routes.length === 0 && (
                  <Button size="sm" onClick={handleAdd} className="rounded-xl shadow-sm">
                    Create Route Template
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          // GRID VIEW
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {sortedRoutes.map(route => {
              const { start, end } = parseRouteStations(route.route_name);
              const styles = getRouteTierStyles(route.distance_km);
              const { legRate, roundTripRate } = getRates(route);
              
              return (
                <Card 
                  key={route.id} 
                  className={`border border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between group border-t-4 ${styles.border}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      {route.is_round_trip ? (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(route.route_code || '');
                              setCopiedId(`${route.id}-up`);
                              toast.success(`Copied Up Leg: ${route.route_code}`);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            title="Copy Up Leg Code"
                            className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg border border-sky-500/20 hover:bg-sky-500/25 transition-all cursor-pointer flex items-center gap-1"
                          >
                            UP: {route.route_code}
                            {copiedId === `${route.id}-up` ? (
                              <Check className="w-2.5 h-2.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-sky-500 opacity-60" />
                            )}
                          </span>

                          {route.down_route_code && (
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(route.down_route_code || '');
                                setCopiedId(`${route.id}-down`);
                                toast.success(`Copied Down Leg: ${route.down_route_code}`);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              title="Copy Down Leg Code"
                              className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/20 hover:bg-amber-500/25 transition-all cursor-pointer flex items-center gap-1"
                            >
                              DN: {route.down_route_code}
                              {copiedId === `${route.id}-down` ? (
                                <Check className="w-2.5 h-2.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-2.5 h-2.5 text-amber-500 opacity-60" />
                              )}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span 
                            onClick={(e) => handleCopyCode(route, e)}
                            title="Copy Route Code"
                            className="font-mono text-xs font-semibold px-2 py-0.5 bg-secondary/30 text-secondary-foreground rounded-lg border border-secondary/40 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all cursor-pointer flex items-center gap-1"
                          >
                            {route.route_code}
                            {copiedId === route.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3 text-muted-foreground opacity-60" />
                            )}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(route)} 
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => confirmDelete(route)} 
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border self-start mt-2 block w-fit ${styles.badge}`}>
                      {styles.text}
                    </span>
                  </CardHeader>

                  <CardContent className="py-2 flex-1 flex flex-col justify-center">
                    {route.is_round_trip ? (
                      <div className="space-y-3 my-2">
                        {/* Up Leg schematic */}
                        <div className="flex items-center justify-between px-2 py-1.5 bg-secondary/5 rounded-lg border border-border/40">
                          <div className="text-left w-[40%]">
                            <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Up Origin</div>
                            <div className="font-semibold text-xs truncate text-foreground" title={route.start_location}>
                              {route.start_location}
                            </div>
                          </div>
                          
                          <div className="flex-1 flex flex-col items-center justify-center px-1 relative">
                            <div className="w-full border-t border-dashed border-border/80 relative flex items-center justify-center">
                              <span className="text-[8px] bg-background border px-1 rounded absolute -top-2.5 font-bold text-sky-600 dark:text-sky-400 scale-95 uppercase tracking-wide">UP</span>
                            </div>
                          </div>
                          
                          <div className="text-right w-[40%]">
                            <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Up Dest</div>
                            <div className="font-semibold text-xs truncate text-foreground" title={route.end_location}>
                              {route.end_location}
                            </div>
                          </div>
                        </div>

                        {/* Down Leg schematic */}
                        <div className="flex items-center justify-between px-2 py-1.5 bg-secondary/5 rounded-lg border border-border/40">
                          <div className="text-left w-[40%]">
                            <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Down Origin</div>
                            <div className="font-semibold text-xs truncate text-foreground" title={route.down_start_location}>
                              {route.down_start_location}
                            </div>
                          </div>
                          
                          <div className="flex-1 flex flex-col items-center justify-center px-1 relative">
                            <div className="w-full border-t border-dashed border-border/80 relative flex items-center justify-center">
                              <span className="text-[8px] bg-background border px-1 rounded absolute -top-2.5 font-bold text-amber-600 dark:text-amber-400 scale-95 uppercase tracking-wide">DOWN</span>
                            </div>
                          </div>
                          
                          <div className="text-right w-[40%]">
                            <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Down Dest</div>
                            <div className="font-semibold text-xs truncate text-foreground" title={route.down_end_location}>
                              {route.down_end_location}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Schematic Connection Visualizer */
                      <div className="flex items-center justify-between my-4 relative px-2">
                        <div className="text-left w-[40%]">
                          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Origin</div>
                          <div className="font-semibold text-sm truncate text-foreground dark:text-foreground" title={start}>
                            {start}
                          </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center justify-center px-2 relative">
                          <div className="w-full border-t-2 border-dashed border-border/80 relative flex items-center justify-center">
                            <div className="absolute bg-background dark:bg-card p-1 rounded-full border border-border shadow-sm group-hover:scale-110 transition-transform duration-300">
                              <Truck className="w-3.5 h-3.5 text-primary group-hover:animate-pulse" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right w-[40%]">
                          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Destination</div>
                          <div className="font-semibold text-sm truncate text-foreground dark:text-foreground" title={end || 'N/A'}>
                            {end || 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Short Description */}
                    {route.description && (
                      <p className="text-xs text-muted-foreground/90 bg-muted/30 p-2 rounded-lg border border-border/30 line-clamp-2 mt-2 leading-relaxed" title={route.description}>
                        {route.description}
                      </p>
                    )}
                  </CardContent>

                  {/* Card Bottom Stats */}
                  <div className="border-t border-border/40 px-4 py-3 bg-muted/20 grid grid-cols-3 gap-2 divide-x divide-border/30 rounded-b-2xl">
                    <div className="flex items-center gap-1.5 justify-center">
                      <Navigation className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="text-center sm:text-left">
                        <span className="text-[9px] text-muted-foreground block leading-tight font-medium">Distance</span>
                        <span className="font-bold text-xs tracking-tight text-foreground">{route.distance_km ? `${route.distance_km} km` : '-'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 justify-center pl-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="text-center sm:text-left">
                        <span className="text-[9px] text-muted-foreground block leading-tight font-medium">Leg Rate</span>
                        <span className="font-bold text-xs tracking-tight text-foreground">
                          {formatCurrency(legRate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 justify-center pl-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-primary shrink-0" />
                      <div className="text-center sm:text-left">
                        <span className="text-[9px] text-primary block leading-tight font-medium">Round Trip</span>
                        <span className="font-bold text-xs tracking-tight text-primary dark:text-primary-foreground">
                          {formatCurrency(roundTripRate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          // TABLE VIEW
          <Card className="border border-border/50 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead onClick={() => handleSort('route_code')} className="cursor-pointer w-[140px] hover:bg-muted/60 transition-colors">
                      <div className="flex items-center font-heading text-xs uppercase font-bold tracking-wider py-1 text-foreground">
                        Route Code <SortIcon columnKey="route_code" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('route_name')} className="cursor-pointer hover:bg-muted/60 transition-colors">
                      <div className="flex items-center font-heading text-xs uppercase font-bold tracking-wider py-1 text-foreground">
                        Route Name <SortIcon columnKey="route_name" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('distance_km')} className="cursor-pointer text-right hover:bg-muted/60 transition-colors w-[150px]">
                      <div className="flex items-center justify-end font-heading text-xs uppercase font-bold tracking-wider py-1 text-foreground">
                        Distance (KM) <SortIcon columnKey="distance_km" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('amount_per_trip')} className="cursor-pointer text-right hover:bg-muted/60 transition-colors w-[130px]">
                      <div className="flex items-center justify-end font-heading text-xs uppercase font-bold tracking-wider py-1 text-foreground">
                        Leg Rate <SortIcon columnKey="amount_per_trip" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right w-[130px]">
                      <div className="flex items-center justify-end font-heading text-xs uppercase font-bold tracking-wider py-1 text-foreground">
                        Round Trip
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell w-[20%] font-heading text-xs uppercase font-bold tracking-wider text-foreground">Description</TableHead>
                    <TableHead className="text-right pr-6 font-heading text-xs uppercase font-bold tracking-wider w-[120px] text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRoutes.map(route => {
                    const { legRate, roundTripRate } = getRates(route);
                    return (
                      <TableRow key={route.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="py-3">
                          {route.is_round_trip ? (
                            <div className="flex flex-col gap-1">
                              <span 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(route.route_code || '');
                                  setCopiedId(`${route.id}-up`);
                                  toast.success(`Copied Up Leg: ${route.route_code}`);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                title="Click to copy Up Leg Code"
                                className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded border border-sky-500/20 hover:bg-sky-500/20 transition-all cursor-pointer flex items-center gap-1 w-fit"
                              >
                                UP: {route.route_code}
                                {copiedId === `${route.id}-up` ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5 text-sky-500 opacity-50" />
                                )}
                              </span>
                              {route.down_route_code && (
                                <span 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(route.down_route_code || '');
                                    setCopiedId(`${route.id}-down`);
                                    toast.success(`Copied Down Leg: ${route.down_route_code}`);
                                    setTimeout(() => setCopiedId(null), 2000);
                                  }}
                                  title="Click to copy Down Leg Code"
                                  className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-1 w-fit"
                                >
                                  DN: {route.down_route_code}
                                  {copiedId === `${route.id}-down` ? (
                                    <Check className="w-2.5 h-2.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5 text-amber-500 opacity-50" />
                                  )}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span 
                              onClick={(e) => handleCopyCode(route, e)}
                              title="Click to copy route code"
                              className="font-mono text-xs font-semibold px-2.5 py-1 bg-secondary/30 text-secondary-foreground rounded-lg border border-secondary/40 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all cursor-pointer flex items-center justify-between gap-1 w-fit"
                            >
                              {route.route_code}
                              {copiedId === route.id ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3 text-muted-foreground opacity-50" />
                              )}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-sm text-foreground py-3">{route.route_name}</TableCell>
                        <TableCell className="text-right font-medium text-sm text-muted-foreground py-3">
                          {route.distance_km ? `${route.distance_km} km` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm text-muted-foreground py-3">
                          {formatCurrency(legRate)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-sm text-primary py-3">
                          {formatCurrency(roundTripRate)}
                        </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground truncate max-w-[220px] py-3" title={route.description}>
                        {route.description || '-'}
                      </TableCell>
                      <TableCell className="text-right pr-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(route)} 
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5"
                            title="Edit Route"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => confirmDelete(route)} 
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                            title="Delete Route"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      {/* Modal overlays */}
      <RouteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        route={selectedRoute}
        onSuccess={fetchRoutes}
      />

      <AlertDialog open={!!routeToDelete} onOpenChange={(open) => !open && !isDeleting && setRouteToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-foreground">Delete Route Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete route <strong>{routeToDelete?.route_code}</strong>? This template will no longer be available for fast-filling new trip records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl text-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDelete} 
              disabled={isDeleting} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              {isDeleting ? 'Deleting...' : 'Delete Route'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}