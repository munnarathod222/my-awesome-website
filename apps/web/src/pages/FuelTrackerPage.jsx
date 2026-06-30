import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, AlertCircle, Fuel, TrendingUp, TrendingDown, Filter, Car, Activity, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import LogFuelModal from '@/components/LogFuelModal.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FuelTrackerPage = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [trucks, setTrucks] = useState({});
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fuel record?')) {
      try {
        await pb.collection('fuel_tracker').delete(id, { $autoCancel: false });
        toast.success('Fuel log deleted successfully.');
        setRefreshTrigger(p => p + 1);
      } catch (err) {
        console.error('Error deleting fuel log:', err);
        toast.error('Failed to delete fuel log.');
      }
    }
  };

  // Filters
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minCost, setMinCost] = useState('');
  const [maxCost, setMaxCost] = useState('');

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching fuel_tracker records...');
      const [logsRes, vehiclesRes, cardsRes] = await Promise.all([
        pb.collection('fuel_tracker').getFullList({
          sort: '-date',
          $autoCancel: false
        }),
        pb.collection('trucks').getFullList({
          $autoCancel: false
        }),
        pb.collection('credit_cards').getList(1, 200, {
          filter: 'status="Active"',
          $autoCancel: false
        }).catch(() => ({ items: [] }))
      ]);

      console.log('Fuel tracker records fetched:', logsRes);
      console.log('Trucks fetched:', vehiclesRes);
      console.log('Credit cards fetched:', cardsRes);

      setCreditCards(cardsRes.items || []);

      const truckMap = {};
      vehiclesRes.forEach(v => {
        truckMap[v.id] = `${v.truck_name || 'Unknown'} (${v.truck_number || ''})`;
      });
      setTrucks(truckMap);

      // Process logs using correct field names from fuel_tracker schema
      const processedLogs = logsRes.map(log => {
        const distance = log.distance_driven || 0;
        const liters = log.liters || 0;
        const efficiency = liters > 0 ? (distance / liters) : 0;

        return {
          ...log,
          vehicle_name: truckMap[log.truck_id] || log.truck_number || 'Unknown',
          distance,
          efficiency,
          liters
        };
      });

      console.log('Processed logs:', processedLogs);
      setFuelLogs(processedLogs);
    } catch (err) {
      console.error('Error fetching fuel data:', err);
      setError('Failed to load fuel tracking data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedLogs = useMemo(() => {
    let result = [...fuelLogs];

    // Filters
    if (vehicleFilter !== 'all') {
      result = result.filter(log => log.truck_id === vehicleFilter);
    }
    if (dateFrom) {
      result = result.filter(log => !isBefore(parseISO(log.date), parseISO(dateFrom)));
    }
    if (dateTo) {
      result = result.filter(log => !isAfter(parseISO(log.date), parseISO(dateTo)));
    }
    if (minCost) {
      result = result.filter(log => log.total_cost >= parseFloat(minCost));
    }
    if (maxCost) {
      result = result.filter(log => log.total_cost <= parseFloat(maxCost));
    }

    // Sorting
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [fuelLogs, vehicleFilter, dateFrom, dateTo, minCost, maxCost, sortConfig]);

  // Overall Metrics Calculation
  const metrics = useMemo(() => {
    const totalDistance = filteredAndSortedLogs.reduce((sum, log) => sum + (log.distance || 0), 0);
    const totalLiters = filteredAndSortedLogs.reduce((sum, log) => sum + (log.liters || 0), 0);
    const avgEfficiency = totalLiters > 0 ? (totalDistance / totalLiters).toFixed(2) : 0;
    
    const efficiencies = filteredAndSortedLogs.filter(l => l.efficiency > 0).map(l => l.efficiency);
    const highestEff = efficiencies.length > 0 ? Math.max(...efficiencies).toFixed(2) : 0;
    const lowestEff = efficiencies.length > 0 ? Math.min(...efficiencies).toFixed(2) : 0;

    return { totalDistance, totalLiters, avgEfficiency, highestEff, lowestEff };
  }, [filteredAndSortedLogs]);

  // Per-Vehicle Summary
  const vehicleSummaries = useMemo(() => {
    const stats = {};
    filteredAndSortedLogs.forEach(log => {
      if (!stats[log.truck_id]) {
        stats[log.truck_id] = {
          vehicle_name: log.vehicle_name,
          totalDistance: 0,
          totalLiters: 0,
          totalCost: 0,
        };
      }
      stats[log.truck_id].totalDistance += (log.distance || 0);
      stats[log.truck_id].totalLiters += (log.liters || 0);
      stats[log.truck_id].totalCost += (log.total_cost || 0);
    });

    return Object.values(stats)
      .map(stat => ({
        ...stat,
        avgEfficiency: stat.totalLiters > 0 ? (stat.totalDistance / stat.totalLiters).toFixed(2) : 0
      }))
      .sort((a, b) => b.totalDistance - a.totalDistance);
  }, [filteredAndSortedLogs]);

  // Chart Data
  const chartData = useMemo(() => {
    return filteredAndSortedLogs
      .filter(log => log.efficiency > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(log => ({
        date: format(new Date(log.date), 'MMM dd'),
        efficiency: parseFloat(log.efficiency.toFixed(2)),
        vehicle: log.vehicle_name,
        liters: log.liters,
        distance: log.distance
      }));
  }, [filteredAndSortedLogs]);

  if (error) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-80" />
        <h2 className="text-2xl font-bold mb-2 text-foreground">Failed to load data</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={() => setRefreshTrigger(p => p+1)} size="lg">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Helmet>
        <title>Fuel Tracker & Efficiency | Dashboard</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{letterSpacing: '-0.02em'}}>Fuel Tracker</h1>
          <p className="text-muted-foreground mt-1">Monitor distance driven, fuel consumption, and efficiency trends.</p>
        </div>
        <Button onClick={() => setIsLogModalOpen(true)} className="shadow-sm rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Log Fuel Refill
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Distance Driven</CardTitle>
            <Car className="w-4 h-4 text-muted-foreground opacity-50" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-3xl font-bold tabular-nums text-foreground">{metrics.totalDistance.toLocaleString(undefined, {maximumFractionDigits: 1})} <span className="text-lg font-normal text-muted-foreground">km</span></div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Liters Consumed</CardTitle>
            <Fuel className="w-4 h-4 text-muted-foreground opacity-50" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-3xl font-bold tabular-nums text-foreground">{metrics.totalLiters.toLocaleString(undefined, {maximumFractionDigits: 1})} <span className="text-lg font-normal text-muted-foreground">L</span></div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Efficiency</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground opacity-50" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-3xl font-bold tabular-nums text-foreground">{metrics.avgEfficiency} <span className="text-lg font-normal text-muted-foreground">km/l</span></div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Efficiency Range</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground opacity-50" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Lowest</span>
                  <div className="flex items-center text-warning">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    <span className="font-bold tabular-nums">{metrics.lowestEff}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Highest</span>
                  <div className="flex items-center text-success">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span className="font-bold tabular-nums">{metrics.highestEff}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <Card className="shadow-sm border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Fuel Efficiency Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : chartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value, name, props) => [
                        `${value} km/l`, 
                        `Efficiency (${props.payload.vehicle})`
                      ]}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground border border-dashed rounded-xl border-border/50">
                Not enough data to display trend chart.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Per-Vehicle Summary */}
        <Card className="shadow-sm border-border bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Vehicle Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto max-h-[300px] px-6 pb-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : vehicleSummaries.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No summary data available.
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicleSummaries.map((v, i) => (
                    <div key={i} className="flex flex-col p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="font-semibold text-foreground mb-3">{v.vehicle_name}</div>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-xs">Distance Driven</span>
                          <span className="font-medium tabular-nums">{v.totalDistance.toLocaleString()} km</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-xs">Avg Efficiency</span>
                          <span className="font-medium tabular-nums">{v.avgEfficiency} km/l</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-xs">Total Liters</span>
                          <span className="font-medium tabular-nums">{v.totalLiters.toLocaleString()} L</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-xs">Total Cost</span>
                          <span className="font-medium tabular-nums">₹{v.totalCost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="p-4 border-b border-border/50 bg-muted/10">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="w-4 h-4 text-muted-foreground" /> Log Filters
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full lg:w-auto">
              <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                <SelectTrigger className="bg-background h-9">
                  <SelectValue placeholder="All Vehicles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  {Object.entries(trucks).map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-background h-9 text-foreground" placeholder="From Date" />
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-background h-9 text-foreground" placeholder="To Date" />
              <Input type="number" value={minCost} onChange={e => setMinCost(e.target.value)} className="bg-background h-9 text-foreground" placeholder="Min Cost" />
              <Input type="number" value={maxCost} onChange={e => setMaxCost(e.target.value)} className="bg-background h-9 text-foreground" placeholder="Max Cost" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('vehicle_name')}>Vehicle</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('date')}>Date</TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('distance')}>Distance Driven (KMs)</TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('liters')}>Liters</TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('total_cost')}>Cost</TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('efficiency')}>Fuel Efficiency (KMs/L)</TableHead>
                  <TableHead>Notes & Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredAndSortedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                      <Fuel className="w-10 h-10 mb-3 opacity-20 mx-auto" />
                      <p>No fuel records found matching your criteria.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">{log.vehicle_name}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {format(new Date(log.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {log.distance ? log.distance.toLocaleString() : '-'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {log.liters ? log.liters.toLocaleString() : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        ₹{log.total_cost?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {log.efficiency > 0 ? (
                          <Badge variant="outline" className={log.efficiency > metrics.avgEfficiency ? 'text-success border-success/30 bg-success/10' : 'text-warning border-warning/30 bg-warning/10'}>
                            {log.efficiency.toFixed(2)}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate" title={log.notes}>
                        {log.notes || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(log.id)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <LogFuelModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        onSuccess={() => setRefreshTrigger(p => p+1)}
        savedCards={creditCards}
      />
    </div>
  );
};

export default FuelTrackerPage;