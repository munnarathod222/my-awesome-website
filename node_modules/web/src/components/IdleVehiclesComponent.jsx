import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Truck, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, MapPin, Eye } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import AssignTripModal from './AssignTripModal.jsx';

export default function IdleVehiclesComponent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data sets
  const [allTrucks, setAllTrucks] = useState([]);
  const [todayTrips, setTodayTrips] = useState([]);
  const [idleVehicles, setIdleVehicles] = useState([]);

  // Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Filters & Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'truck_number', direction: 'asc' });

  const fetchData = async () => {
    try {
      // 1. Fetch all trucks
      const trucksRes = await pb.collection('trucks').getFullList({
        sort: 'truck_number',
        $autoCancel: false
      });

      // 2. Fetch today's trips
      // Using date range to handle UTC timestamps safely
      const today = format(new Date(), 'yyyy-MM-dd');
      const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
      const tripsRes = await pb.collection('trip_logs').getFullList({
        filter: `date >= "${today}" && date < "${tomorrow}"`,
        $autoCancel: false
      });

      setAllTrucks(trucksRes);
      setTodayTrips(tripsRes);
      calculateIdle(trucksRes, tripsRes);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch idle vehicles data:', err);
      setError('Unable to load idle vehicles data.');
    } finally {
      setLoading(false);
    }
  };

  const calculateIdle = (trucks, trips) => {
    // Trucks are idle if they don't appear in today's trips
    const activeTruckNumbers = trips.map(t => t.truck_number);
    const idle = trucks.filter(t => !activeTruckNumbers.includes(t.truck_number));
    setIdleVehicles(idle);
  };

  useEffect(() => {
    fetchData();

    // Subscribe to trip_logs to keep idle status updated in real-time
    pb.collection('trip_logs').subscribe('*', function (e) {
      fetchData(); // Simplest approach: refetch data to recalculate
    });

    return () => {
      pb.collection('trip_logs').unsubscribe('*');
    };
  }, []);

  // Filter & Sort Logic
  const filteredIdle = idleVehicles.filter(truck => {
    if (typeFilter !== 'all' && truck.vehicle_class !== typeFilter) return false;
    if (statusFilter !== 'all' && (truck.fastag_status || 'Unknown').toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchTerm && !truck.truck_number.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const sortedIdle = [...filteredIdle].sort((a, b) => {
    let aVal = a[sortConfig.key] || '';
    let bVal = b[sortConfig.key] || '';

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
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
  const activeCount = totalCount - idleCount;
  const idlePercentage = totalCount > 0 ? Math.round((idleCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-card bg-card/60">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Fleet</p>
          <div className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {loading ? <Skeleton className="h-8 w-16" /> : totalCount}
          </div>
        </div>
        <div className="metric-card bg-success/5 border-success/10">
          <p className="text-sm font-medium text-success/80 mb-1">Active Today</p>
          <div className="text-3xl font-bold tracking-tight text-success flex items-center gap-2">
            {loading ? <Skeleton className="h-8 w-16" /> : activeCount}
          </div>
        </div>
        <div className="metric-card bg-destructive/5 border-destructive/10">
          <p className="text-sm font-medium text-destructive/80 mb-1">Idle Vehicles</p>
          <div className="text-3xl font-bold tracking-tight text-destructive flex items-center gap-2">
            {loading ? <Skeleton className="h-8 w-16" /> : idleCount}
          </div>
        </div>
        <div className="metric-card bg-card/60">
          <p className="text-sm font-medium text-muted-foreground mb-1">Idle Percentage</p>
          <div className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {loading ? <Skeleton className="h-8 w-16" /> : `${idlePercentage}%`}
          </div>
        </div>
      </div>

      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="bg-muted/20 border-b border-border pb-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Unassigned Vehicles</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Vehicles without active trip logs for today.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search truck number..." 
                  className="pl-9 h-9 bg-background min-w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] h-9 bg-background text-foreground">
                  <SelectValue placeholder="Vehicle Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="2">Class 2</SelectItem>
                  <SelectItem value="3">Class 3</SelectItem>
                  <SelectItem value="4">Class 4</SelectItem>
                  <SelectItem value="5">Class 5</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 bg-background text-foreground">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active FASTag</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mb-2 text-destructive opacity-80" />
              <p>{error}</p>
              <Button variant="outline" onClick={fetchData} className="mt-4">Retry</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead onClick={() => handleSort('truck_number')} className="cursor-pointer hover:bg-muted/50 transition-colors pl-6">
                      Vehicle No. <SortIcon columnKey="truck_number" />
                    </TableHead>
                    <TableHead onClick={() => handleSort('manufacturer')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      Manufacturer <SortIcon columnKey="manufacturer" />
                    </TableHead>
                    <TableHead onClick={() => handleSort('vehicle_class')} className="cursor-pointer hover:bg-muted/50 transition-colors text-center">
                      Class <SortIcon columnKey="vehicle_class" />
                    </TableHead>
                    <TableHead className="text-center">FASTag Status</TableHead>
                    <TableHead className="text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="pl-6"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                        <TableCell className="text-right pr-6"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : sortedIdle.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center">
                          <Truck className="w-10 h-10 mb-3 opacity-20" />
                          <p>No idle vehicles found.</p>
                          {idleVehicles.length > 0 && <p className="text-sm mt-1">Try clearing your filters.</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedIdle.map((truck) => (
                      <TableRow key={truck.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-semibold text-sm pl-6">
                          {truck.truck_number}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {truck.manufacturer || 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-mono text-xs px-2 py-1 bg-secondary/20 text-secondary-foreground rounded border border-border/50">
                            {truck.vehicle_class || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`font-medium ${getStatusColor(truck.fastag_status)}`}>
                            {truck.fastag_status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => navigate(`/truck-manager?search=${truck.truck_number}`)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="w-4 h-4 mr-1.5" /> View
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedVehicle(truck);
                                setIsAssignModalOpen(true);
                              }}
                            >
                              Assign Trip
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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