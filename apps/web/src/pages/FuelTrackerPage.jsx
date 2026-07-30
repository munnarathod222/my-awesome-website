import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Plus, AlertCircle, Fuel, TrendingUp, TrendingDown, Filter, 
  Car, Activity, Trash2, CreditCard, Search, Pencil, 
  DollarSign, Wallet, AlertTriangle, Calendar, RefreshCw, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import LogFuelModal from '@/components/LogFuelModal.jsx';
import FuelPaymentModal from '@/components/FuelPaymentModal.jsx';
import FuelStationsTab from '@/components/FuelStationsTab.jsx';
import FuelBenchmarkTab from '@/components/FuelBenchmarkTab.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, Legend, PieChart, Pie, ComposedChart 
} from 'recharts';

import { useSearchParams } from 'react-router-dom';

const PIE_COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const FuelTrackerPage = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Data State
  const [fuelLogs, setFuelLogs] = useState([]);
  const [trucks, setTrucks] = useState({});
  const [creditCards, setCreditCards] = useState([]);
  const [payments, setPayments] = useState([]);
  
  // UI Loading State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingRefill, setEditingRefill] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  // Tab 1 Filters (Refills)
  const [vehicleFilter, setVehicleFilter] = useState('all');

  useEffect(() => {
    const qParam = searchParams.get('truck') || searchParams.get('truck_number') || searchParams.get('truckId');
    if (qParam) {
      setVehicleFilter(qParam);
    }
  }, [searchParams]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minCost, setMinCost] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // Tab 2 Filters (Payments)
  const [payFilters, setPayFilters] = useState({
    search: '',
    cardId: 'All',
    status: 'All',
    sortBy: '-date'
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching fuel tracker data...');
      const [logsRes, vehiclesRes, cardsRes, paymentsRes] = await Promise.all([
        pb.collection('fuel_tracker').getFullList({
          sort: '-date',
          $autoCancel: false
        }),
        pb.collection('trucks').getFullList({
          $autoCancel: false
        }),
        pb.collection('credit_cards').getFullList({
          $autoCancel: false
        }).catch(() => []),
        pb.collection('fuel_payments').getFullList({
          filter: `user_id = "${currentUser?.id || ''}"`,
          sort: payFilters.sortBy,
          $autoCancel: false
        }).catch(() => [])
      ]);

      const cardMap = {};
      cardsRes.forEach(c => {
        cardMap[c.id] = c;
      });
      setCreditCards(cardsRes);

      const truckMap = {};
      vehiclesRes.forEach(v => {
        truckMap[v.id] = `${v.truck_name || 'Unknown'} (${v.truck_number || ''})`;
      });
      setTrucks(truckMap);

      // Process refills logs
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

      setFuelLogs(processedLogs);
      setPayments(paymentsRes);
    } catch (err) {
      console.error('Error fetching fuel data:', err);
      setError('Failed to load fuel tracking data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger, payFilters.sortBy]);

  // Tab 1 Actions (Delete Refill)
  const handleDeleteRefill = async (id) => {
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

  // Tab 2 Actions (Delete Payment)
  const handleDeletePayment = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment log?')) {
      try {
        await pb.collection('fuel_payments').delete(id, { $autoCancel: false });
        toast.success('Payment log deleted successfully.');
        setRefreshTrigger(p => p + 1);
      } catch (err) {
        console.error('Error deleting payment:', err);
        toast.error('Failed to delete payment log.');
      }
    }
  };

  const getCardName = (cardId) => {
    const card = creditCards.find(c => c.id === cardId);
    return card ? `${card.card_name} (..${card.card_number_last4})` : 'Unknown Card';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <Badge className="bg-success/15 text-success border-success/30 hover:bg-success/20">Paid</Badge>;
      case 'Pending': return <Badge className="bg-warning/15 text-warning border-warning/30 hover:bg-warning/20">Pending</Badge>;
      case 'Failed': return <Badge className="bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20">Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Sorting Handler Tab 1
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportRefillsToCSV = () => {
    try {
      const headers = ['Vehicle', 'Date', 'Distance (KMs)', 'Liters', 'Cost (₹)', 'Efficiency (km/l)', 'Payment Method', 'Notes'];
      const rows = filteredAndSortedLogs.map(log => [
        log.vehicle_name,
        log.date ? format(new Date(log.date), 'yyyy-MM-dd') : '',
        log.distance || 0,
        log.liters || 0,
        log.total_cost || 0,
        log.efficiency ? log.efficiency.toFixed(2) : 0,
        log.payment_method || 'Cash',
        (log.notes || '').replace(/"/g, '""')
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Fuel_Refills_Export_${new Date().toISOString().substring(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Refill logs exported to CSV');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV');
    }
  };

  const exportPaymentsToCSV = () => {
    try {
      const headers = ['Date', 'Card Used', 'Fuel Amount (₹)', 'Surcharge (₹)', 'Waived (₹)', 'Total Bill (₹)', 'Status', 'Notes'];
      const rows = filteredPayments.map(p => {
        const fuelAmt = p.fuel_amount || 0;
        const surAmt = p.surcharge_amount || 0;
        const waivedAmt = p.waived_amount || 0;
        const billTotal = fuelAmt + surAmt - waivedAmt;
        return [
          p.date ? format(new Date(p.date), 'yyyy-MM-dd') : '',
          getCardName(p.card_id),
          fuelAmt,
          surAmt,
          waivedAmt,
          billTotal,
          p.payment_status || 'Pending',
          (p.notes || '').replace(/"/g, '""')
        ];
      });

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Card_Payments_Export_${new Date().toISOString().substring(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Card payments exported to CSV');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV');
    }
  };

  // Memoized Filters - Tab 1 Refills
  const filteredAndSortedLogs = useMemo(() => {
    let result = [...fuelLogs];

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

  // Overall metrics calculation - Tab 1
  const refillMetrics = useMemo(() => {
    const totalDistance = filteredAndSortedLogs.reduce((sum, log) => sum + (log.distance || 0), 0);
    const totalLiters = filteredAndSortedLogs.reduce((sum, log) => sum + (log.liters || 0), 0);
    const avgEfficiency = totalLiters > 0 ? (totalDistance / totalLiters).toFixed(2) : 0;
    
    const efficiencies = filteredAndSortedLogs.filter(l => l.efficiency > 0).map(l => l.efficiency);
    const highestEff = efficiencies.length > 0 ? Math.max(...efficiencies).toFixed(2) : 0;
    const lowestEff = efficiencies.length > 0 ? Math.min(...efficiencies).toFixed(2) : 0;

    return { totalDistance, totalLiters, avgEfficiency, highestEff, lowestEff };
  }, [filteredAndSortedLogs]);

  // Vehicle Summaries - Tab 1
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

  // Chart data - Tab 1
  const refillChartData = useMemo(() => {
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

  // Memoized Filters - Tab 2 Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const cardNameStr = getCardName(p.card_id).toLowerCase();
      const notesStr = (p.notes || '').toLowerCase();
      const searchStr = payFilters.search.toLowerCase();
      
      const matchSearch = notesStr.includes(searchStr) || cardNameStr.includes(searchStr);
      const matchCard = payFilters.cardId === 'All' || p.card_id === payFilters.cardId;
      const matchStatus = payFilters.status === 'All' || p.payment_status === payFilters.status;
      
      return matchSearch && matchCard && matchStatus;
    });
  }, [payments, payFilters, creditCards]);

  // Metrics - Tab 2
  const paymentMetrics = useMemo(() => {
    const totalFuelAmount = filteredPayments.reduce((sum, p) => sum + (p.fuel_amount || 0), 0);
    const totalSurcharge = filteredPayments.reduce((sum, p) => sum + (p.surcharge_amount || 0), 0);
    const totalWaived = filteredPayments.reduce((sum, p) => sum + (p.waived_amount || 0), 0);
    const grandTotal = totalFuelAmount + totalSurcharge - totalWaived;

    return { totalFuelAmount, totalSurcharge, totalWaived, grandTotal };
  }, [filteredPayments]);

  // Tab 3: Advanced Analytics Computations
  const advancedStats = useMemo(() => {
    // Total spent on fuel refills
    const totalSpend = fuelLogs.reduce((sum, log) => sum + (log.total_cost || 0), 0);
    const totalDistance = fuelLogs.reduce((sum, log) => sum + (log.distance_driven || 0), 0);
    const avgCostPerKm = totalDistance > 0 ? (totalSpend / totalDistance) : 0;
    
    // Surcharges from payments
    const totalSurcharges = payments.reduce((sum, p) => sum + (p.surcharge_amount || 0), 0);
    const totalWaived = payments.reduce((sum, p) => sum + (p.waived_amount || 0), 0);

    // Compute anomalies
    // Calculate vehicle average efficiencies first
    const vehicleAverages = {};
    const vehicleCounts = {};
    fuelLogs.forEach(log => {
      if (log.efficiency > 0 && log.truck_id) {
        if (!vehicleAverages[log.truck_id]) {
          vehicleAverages[log.truck_id] = 0;
          vehicleCounts[log.truck_id] = 0;
        }
        vehicleAverages[log.truck_id] += log.efficiency;
        vehicleCounts[log.truck_id]++;
      }
    });

    Object.keys(vehicleAverages).forEach(id => {
      vehicleAverages[id] = vehicleAverages[id] / vehicleCounts[id];
    });

    const flaggedAnomalies = [];
    fuelLogs.forEach(log => {
      if (log.efficiency > 0 && log.truck_id) {
        const vehicleAvg = vehicleAverages[log.truck_id] || 0;
        // Threshold: 30% below historical vehicle average or efficiency is physically unrealistic for a truck (< 2.0 km/l)
        const percentDrop = vehicleAvg > 0 ? ((vehicleAvg - log.efficiency) / vehicleAvg) * 100 : 0;
        if (percentDrop >= 30 || log.efficiency < 2.0) {
          flaggedAnomalies.push({
            ...log,
            avgEfficiency: vehicleAvg,
            dropPercentage: percentDrop
          });
        }
      }
    });

    return {
      totalSpend,
      avgCostPerKm,
      totalSurcharges,
      totalWaived,
      anomalies: flaggedAnomalies
    };
  }, [fuelLogs, payments]);

  // Tab 3 Chart Data: Cost per KM by Vehicle
  const costPerKmChartData = useMemo(() => {
    const stats = {};
    fuelLogs.forEach(log => {
      if (log.truck_id && log.distance_driven > 0) {
        if (!stats[log.truck_id]) {
          stats[log.truck_id] = {
            name: log.vehicle_name,
            totalCost: 0,
            totalDistance: 0
          };
        }
        stats[log.truck_id].totalCost += log.total_cost || 0;
        stats[log.truck_id].totalDistance += log.distance_driven;
      }
    });

    return Object.values(stats)
      .map(s => ({
        name: s.name.split(' ')[0], // short name
        costPerKm: parseFloat((s.totalCost / s.totalDistance).toFixed(2))
      }))
      .filter(s => s.costPerKm > 0)
      .sort((a, b) => b.costPerKm - a.costPerKm);
  }, [fuelLogs]);

  // Tab 3 Chart Data: Monthly Cost & Liters Trend
  const monthlyTrendData = useMemo(() => {
    const stats = {};
    fuelLogs.forEach(log => {
      if (log.date) {
        const dateObj = new Date(log.date);
        const monthKey = format(dateObj, 'yyyy-MM');
        const monthName = format(dateObj, 'MMM yyyy');
        if (!stats[monthKey]) {
          stats[monthKey] = {
            key: monthKey,
            name: monthName,
            cost: 0,
            liters: 0
          };
        }
        stats[monthKey].cost += log.total_cost || 0;
        stats[monthKey].liters += log.liters || 0;
      }
    });

    return Object.values(stats)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(m => ({
        name: m.name,
        cost: parseFloat(m.cost.toFixed(0)),
        liters: parseFloat(m.liters.toFixed(0))
      }))
      .slice(-6); // Last 6 months
  }, [fuelLogs]);

  // Tab 3 Chart Data: Payment Method Share
  const paymentMethodShareData = useMemo(() => {
    const stats = {};
    fuelLogs.forEach(log => {
      const method = log.payment_method || 'Cash';
      if (!stats[method]) {
        stats[method] = 0;
      }
      stats[method] += log.total_cost || 0;
    });

    return Object.entries(stats)
      .map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(0))
      }))
      .sort((a, b) => b.value - a.value);
  }, [fuelLogs]);

  if (error) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-80" />
        <h2 className="text-2xl font-bold mb-2 text-foreground">Failed to load data</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={() => setRefreshTrigger(p => p+1)} size="lg" className="rounded-xl shadow-sm">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans">
      <Helmet>
        <title>Fuel Manager & Analytics | Dashboard</title>
      </Helmet>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5" style={{letterSpacing: '-0.02em'}}>
            <Fuel className="w-8 h-8 text-primary" /> Fuel Tracker
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitor distance driven, fuel efficiency trends, and credit card payments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setRefreshTrigger(p => p+1)} className="rounded-xl border-border/80 text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refresh
          </Button>
          <Button onClick={() => setIsLogModalOpen(true)} className="shadow-sm rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Log Refill
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="benchmark" className="space-y-6">
        <TabsList className="bg-muted/65 p-1 rounded-xl w-full sm:w-auto grid grid-cols-2 sm:grid-cols-5 max-w-[800px]">
          <TabsTrigger value="benchmark" className="rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all">🎯 Benchmark & Savings</TabsTrigger>
          <TabsTrigger value="refills" className="rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all font-sans">Refills & Efficiency</TabsTrigger>
          <TabsTrigger value="stations" className="rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all">⛽ Fuel Stations</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all">Card Payments</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all">Advanced Analytics</TabsTrigger>
        </TabsList>

        {/* Tab 0: Fuel Benchmark & Savings */}
        <TabsContent value="benchmark" className="space-y-6 outline-none animate-in fade-in-50 duration-200">
          <FuelBenchmarkTab fuelLogs={fuelLogs} trucks={trucks} loading={loading} />
        </TabsContent>

        {/* Tab 1: Refills & Efficiency */}
        <TabsContent value="refills" className="space-y-6 outline-none animate-in fade-in-50 duration-200">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md hover:border-blue-500/20 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Distance Driven</CardTitle>
                <Car className="w-4 h-4 text-blue-500 opacity-80" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="text-3xl font-extrabold tabular-nums text-blue-500">{refillMetrics.totalDistance.toLocaleString(undefined, {maximumFractionDigits: 1})} <span className="text-sm font-normal text-muted-foreground">km</span></div>
                )}
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md hover:border-violet-500/20 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-purple-500" />
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Fuel Consumed</CardTitle>
                <Fuel className="w-4 h-4 text-violet-500 opacity-80" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="text-3xl font-extrabold tabular-nums text-violet-500">{refillMetrics.totalLiters.toLocaleString(undefined, {maximumFractionDigits: 1})} <span className="text-sm font-normal text-muted-foreground">L</span></div>
                )}
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md hover:border-emerald-500/20 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Avg Efficiency</CardTitle>
                <Activity className="w-4 h-4 text-emerald-500 opacity-80" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="text-3xl font-extrabold tabular-nums text-emerald-500">{refillMetrics.avgEfficiency} <span className="text-sm font-normal text-muted-foreground">km/l</span></div>
                )}
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md hover:border-amber-500/20 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Efficiency Range</CardTitle>
                <TrendingUp className="w-4 h-4 text-amber-500 opacity-80" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase font-semibold">Lowest</span>
                      <div className="flex items-center text-warning font-bold text-lg tabular-nums">
                        <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                        <span>{refillMetrics.lowestEff}</span>
                      </div>
                    </div>
                    <div className="w-[1px] h-8 bg-border/60" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase font-semibold">Highest</span>
                      <div className="flex items-center text-success font-bold text-lg tabular-nums">
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                        <span>{refillMetrics.highestEff}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <Card className="shadow-sm border-border/60 bg-card lg:col-span-2">
              <CardHeader className="border-b border-border/30 pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Fuel Efficiency Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : refillChartData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={refillChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
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
                          dot={{ r: 4, fill: 'white', stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
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
            <Card className="shadow-sm border-border/60 bg-card lg:col-span-1">
              <CardHeader className="border-b border-border/30 pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Car className="w-4 h-4 text-primary" /> Vehicle Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-y-auto max-h-[320px] px-6 py-6 space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : vehicleSummaries.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No summary data available.
                    </div>
                  ) : (
                    vehicleSummaries.map((v, i) => (
                      <div key={i} className="flex flex-col p-4 rounded-xl border border-border/60 bg-muted/15 hover:bg-muted/30 transition-colors">
                        <div className="font-semibold text-foreground mb-3 flex items-center justify-between">
                          <span>{v.vehicle_name}</span>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold">
                            {v.avgEfficiency} km/l
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-[10px]">Distance</span>
                            <span className="font-medium tabular-nums mt-0.5">{v.totalDistance.toLocaleString()} km</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-[10px]">Total Fuel</span>
                            <span className="font-medium tabular-nums mt-0.5">{v.totalLiters.toLocaleString()} L</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-[10px]">Total Spend</span>
                            <span className="font-medium tabular-nums mt-0.5">₹{v.totalCost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Table */}
          <Card className="shadow-sm border-border/60 bg-card overflow-hidden">
            <CardHeader className="p-4 border-b border-border/50 bg-muted/10">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Filter className="w-4 h-4 text-primary" /> Filter Refill Logs
                  </div>
                  <Button onClick={exportRefillsToCSV} variant="outline" size="sm" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 h-8">
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full lg:w-auto">
                  <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                    <SelectTrigger className="bg-background h-9 rounded-xl border-border/80">
                      <SelectValue placeholder="All Vehicles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vehicles</SelectItem>
                      {Object.entries(trucks).map(([id, name]) => (
                        <SelectItem key={id} value={id}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-background h-9 rounded-xl border-border/80" placeholder="From Date" />
                  <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-background h-9 rounded-xl border-border/80" placeholder="To Date" />
                  <Input type="number" value={minCost} onChange={e => setMinCost(e.target.value)} className="bg-background h-9 rounded-xl border-border/80" placeholder="Min Cost (₹)" />
                  <Input type="number" value={maxCost} onChange={e => setMaxCost(e.target.value)} className="bg-background h-9 rounded-xl border-border/80" placeholder="Max Cost (₹)" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('vehicle_name')}>Vehicle</TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('date')}>Date</TableHead>
                      <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('distance')}>Distance (KMs)</TableHead>
                      <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('liters')}>Liters</TableHead>
                      <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('total_cost')}>Cost</TableHead>
                      <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('efficiency')}>Efficiency (km/l)</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredAndSortedLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                          <Fuel className="w-10 h-10 mb-3 opacity-20 mx-auto text-primary" />
                          <p>No fuel records found matching your criteria.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-semibold text-foreground">{log.vehicle_name}</TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                            {format(new Date(log.date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {log.distance ? log.distance.toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {log.liters ? log.liters.toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums text-foreground">
                            ₹{log.total_cost?.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {log.efficiency > 0 ? (
                              <Badge variant="outline" className={log.efficiency > refillMetrics.avgEfficiency ? 'text-success border-success/30 bg-success/5 font-bold' : 'text-warning border-warning/30 bg-warning/5 font-bold'}>
                                {log.efficiency.toFixed(2)}
                              </Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium border border-border/80">
                              {log.payment_method || 'Cash'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                  setEditingRefill(log);
                                  setIsLogModalOpen(true);
                                }}
                                className="text-muted-foreground hover:bg-primary/10 hover:text-primary h-8 w-8 rounded-lg"
                                title="Edit Fuel Record"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteRefill(log.id)}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 rounded-lg"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden divide-y divide-border/40">
                {loading ? (
                  <div className="space-y-4 p-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : filteredAndSortedLogs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <Fuel className="w-10 h-10 mb-3 opacity-20 mx-auto text-primary" />
                    <p>No fuel records found.</p>
                  </div>
                ) : (
                  filteredAndSortedLogs.map((log) => (
                    <div key={log.id} className="p-4 space-y-3 hover:bg-muted/5 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-foreground">{log.vehicle_name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(log.date), 'MMM dd, yyyy')}</p>
                        </div>
                        {log.efficiency > 0 ? (
                          <Badge variant="outline" className={log.efficiency > refillMetrics.avgEfficiency ? 'text-success border-success/30 bg-success/5 font-bold text-xs' : 'text-warning border-warning/30 bg-warning/5 font-bold text-xs'}>
                            {log.efficiency.toFixed(2)} km/l
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">-</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-border/20 text-xs">
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase font-semibold">Distance</p>
                          <p className="font-bold text-foreground mt-0.5">{log.distance ? `${log.distance.toLocaleString()} km` : '-'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase font-semibold">Liters</p>
                          <p className="font-bold text-foreground mt-0.5">{log.liters ? `${log.liters.toLocaleString()} L` : '-'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase font-semibold">Cost</p>
                          <p className="font-extrabold text-foreground mt-0.5">₹{log.total_cost?.toLocaleString()}</p>
                        </div>
                      </div>

                      {log.notes && (
                        <div className="text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/30 whitespace-pre-line">
                          {log.notes}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2.5 border-t border-border/20">
                        <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px]">
                          {log.payment_method || 'Cash'}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setEditingRefill(log);
                              setIsLogModalOpen(true);
                            }}
                            className="h-7 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary flex items-center gap-1.5 font-bold rounded-lg"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteRefill(log.id)}
                            className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-1.5 font-bold rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Card Payments */}
        <TabsContent value="payments" className="space-y-6 outline-none animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Credit Card Fuel Transactions
              </h3>
              <p className="text-xs text-muted-foreground">Log and audit your business credit card fuel expenses.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={exportPaymentsToCSV} variant="outline" size="sm" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5">
                <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
              </Button>
              <Button onClick={() => { setEditingPayment(null); setIsPaymentModalOpen(true); }} size="sm" className="rounded-xl bg-primary text-primary-foreground font-semibold">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Payment Log
              </Button>
            </div>
          </div>

          {/* Payments Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <Card className="shadow-sm border-border/60 bg-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Fuel Amount</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground opacity-55" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="text-2xl font-bold tabular-nums text-foreground">₹{paymentMetrics.totalFuelAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/60 bg-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Surcharge</CardTitle>
                <Plus className="w-4 h-4 text-warning opacity-70" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="text-2xl font-bold tabular-nums text-foreground">₹{paymentMetrics.totalSurcharge.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/60 bg-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Surcharge Waived</CardTitle>
                <TrendingDown className="w-4 h-4 text-success opacity-70" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="text-2xl font-bold tabular-nums text-success">₹{paymentMetrics.totalWaived.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-primary/5 border-primary/20">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-primary">Grand Total Bill</CardTitle>
                <Wallet className="w-4 h-4 text-primary opacity-80" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="text-2xl font-black tabular-nums text-primary">₹{paymentMetrics.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border border-border/60 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes or cards..."
                className="pl-9 bg-input text-foreground rounded-xl border-border/80 h-10"
                value={payFilters.search}
                onChange={(e) => setPayFilters({ ...payFilters, search: e.target.value })}
              />
            </div>
            
            <Select value={payFilters.cardId} onValueChange={(val) => setPayFilters({ ...payFilters, cardId: val })}>
              <SelectTrigger className="w-full md:w-[200px] bg-input text-foreground rounded-xl border-border/80 h-10">
                <SelectValue placeholder="All Cards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Cards</SelectItem>
                {creditCards.map(c => <SelectItem key={c.id} value={c.id}>{c.card_name} (..{c.card_number_last4})</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={payFilters.status} onValueChange={(val) => setPayFilters({ ...payFilters, status: val })}>
              <SelectTrigger className="w-full md:w-[140px] bg-input text-foreground rounded-xl border-border/80 h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={payFilters.sortBy} onValueChange={(val) => setPayFilters({ ...payFilters, sortBy: val })}>
              <SelectTrigger className="w-full md:w-[150px] bg-input text-foreground rounded-xl border-border/80 h-10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-date">Date (Newest)</SelectItem>
                <SelectItem value="date">Date (Oldest)</SelectItem>
                <SelectItem value="-fuel_amount">Amount (High)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments Table */}
          <Card className="rounded-xl overflow-hidden shadow-sm border border-border/60">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Card Used</TableHead>
                      <TableHead className="text-right">Fuel Amount</TableHead>
                      <TableHead className="text-right">Surcharge</TableHead>
                      <TableHead className="text-right">Waived</TableHead>
                      <TableHead className="text-right">Total Bill</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground"><Activity className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /> Loading payments...</TableCell></TableRow>
                    ) : filteredPayments.length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">No transaction logs found.</TableCell></TableRow>
                    ) : (
                      filteredPayments.map(p => {
                        const fuelAmt = p.fuel_amount || 0;
                        const surAmt = p.surcharge_amount || 0;
                        const waivedAmt = p.waived_amount || 0;
                        const billTotal = fuelAmt + surAmt - waivedAmt;
                        return (
                          <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-semibold text-foreground whitespace-nowrap text-xs">
                              {p.date ? format(new Date(p.date), 'dd MMM yyyy') : '-'}
                            </TableCell>
                            <TableCell className="text-sm font-medium">{getCardName(p.card_id)}</TableCell>
                            <TableCell className="text-right tabular-nums">₹{fuelAmt.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                            <TableCell className="text-right text-muted-foreground tabular-nums">
                              ₹{surAmt.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                              {p.surcharge_percentage > 0 && <span className="text-[10px] ml-1 block opacity-75">({p.surcharge_percentage}%)</span>}
                            </TableCell>
                            <TableCell className="text-right text-success tabular-nums">₹{waivedAmt.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                            <TableCell className="text-right font-bold tabular-nums">₹{billTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                            <TableCell className="text-center">{getStatusBadge(p.payment_status)}</TableCell>
                            <TableCell className="text-muted-foreground text-xs max-w-[150px] truncate" title={p.notes}>{p.notes || '-'}</TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => { setEditingPayment(p); setIsPaymentModalOpen(true); }} className="hover:bg-primary/10 hover:text-primary h-8 w-8 rounded-lg">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeletePayment(p.id)} className="hover:bg-destructive/10 hover:text-destructive text-destructive h-8 w-8 rounded-lg">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Advanced Analytics */}
        <TabsContent value="analytics" className="space-y-6 outline-none animate-in fade-in-50 duration-200">
          
          {/* Advanced Stats KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Refill Cost (All-Time)</CardTitle>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-foreground tabular-nums">₹{advancedStats.totalSpend.toLocaleString('en-IN', {maximumFractionDigits: 0})}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Total spend recorded on refills</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Cost per KM (Avg)</CardTitle>
                <Activity className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-foreground tabular-nums">₹{advancedStats.avgCostPerKm.toFixed(2)} <span className="text-xs font-medium text-muted-foreground">/km</span></div>
                <p className="text-[10px] text-muted-foreground mt-1">Average running cost for fuel</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Surcharges Paid</CardTitle>
                <Plus className="w-4 h-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-foreground tabular-nums">₹{advancedStats.totalSurcharges.toLocaleString('en-IN', {maximumFractionDigits: 0})}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Total bank surcharge card fees</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Surcharges Waived</CardTitle>
                <TrendingDown className="w-4 h-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-success tabular-nums">₹{advancedStats.totalWaived.toLocaleString('en-IN', {maximumFractionDigits: 0})}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Total money saved / waived</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border bg-destructive/5 border-destructive/20">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-destructive uppercase">Fuel Alerts</CardTitle>
                <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-destructive tabular-nums">{advancedStats.anomalies.length}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Refills with anomalous efficiency</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Cost per KM Chart */}
            <Card className="shadow-sm border-border bg-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-primary" /> Running Cost per KM (₹/KM)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {costPerKmChartData.length > 0 ? (
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={costPerKmChartData} margin={{ top: 15, right: 10, bottom: 5, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="readonly" vertical={false} />
                        <XAxis dataKey="name" fontSize={11} stroke="hsl(var(--muted-foreground))" tickLine={false} />
                        <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} label={{ value: '₹/km', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' } }} />
                        <Tooltip 
                          formatter={(value) => [`₹${value}/km`, 'Fuel Cost per KM']}
                          contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                        />
                        <Bar dataKey="costPerKm" radius={[6, 6, 0, 0]}>
                          {costPerKmChartData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.costPerKm > advancedStats.avgCostPerKm ? '#F59E0B' : '#10B981'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground border border-dashed rounded-xl border-border/50">
                    Not enough distance data to calculate Running Cost per KM.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method Share Chart */}
            <Card className="shadow-sm border-border bg-card lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base font-bold">Spend Share by Payment Mode</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 flex flex-col items-center">
                {paymentMethodShareData.length > 0 ? (
                  <>
                    <div className="h-[220px] w-full flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentMethodShareData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {paymentMethodShareData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Custom Legend */}
                    <div className="grid grid-cols-2 gap-3 w-full text-xs mt-3 pt-3 border-t border-border/50">
                      {paymentMethodShareData.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                          <span className="text-muted-foreground truncate">{entry.name}:</span>
                          <span className="font-semibold text-foreground ml-auto tabular-nums">₹{entry.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                    No payment data recorded.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trend composed chart */}
            <Card className="shadow-sm border-border bg-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Monthly Cost & Liter Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {monthlyTrendData.length > 0 ? (
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={monthlyTrendData} margin={{ top: 15, right: -5, bottom: 5, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="name" fontSize={11} stroke="hsl(var(--muted-foreground))" tickLine={false} />
                        <YAxis yAxisId="left" fontSize={11} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} label={{ value: 'Cost (₹)', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' } }} />
                        <YAxis yAxisId="right" orientation="right" fontSize={11} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} label={{ value: 'Volume (L)', angle: 90, position: 'insideRight', offset: 0, style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' } }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                          formatter={(value, name) => name === 'cost' ? [`₹${value.toLocaleString()}`, 'Spent (₹)'] : [`${value.toLocaleString()} L`, 'Volume (Liters)'] }
                        />
                        <Legend verticalAlign="top" height={36} iconSize={10} fontSize={11} />
                        <Bar yAxisId="left" dataKey="cost" name="cost" fill="hsl(var(--primary))" opacity={0.8} radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" dataKey="liters" name="liters" stroke="#EC4899" strokeWidth={3} dot={{ r: 4, fill: 'white', stroke: '#EC4899', strokeWidth: 2 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground border border-dashed rounded-xl border-border/50">
                    Not enough monthly historical records.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Abnormal Fuel Usage / Anomalies list */}
            <Card className="shadow-sm border-border bg-card lg:col-span-1">
              <CardHeader className="pb-3 border-b border-border/30">
                <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" /> Anomalous Fuel Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-y-auto max-h-[300px] px-6 py-6 space-y-4">
                  {advancedStats.anomalies.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12 flex flex-col items-center justify-center h-full min-h-[150px]">
                      <Activity className="w-8 h-8 mx-auto mb-3 opacity-20 text-success" />
                      <p className="text-xs">No efficiency anomalies detected.</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Fleet is performing optimally!</p>
                    </div>
                  ) : (
                    advancedStats.anomalies.map((anom, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-2 hover:bg-destructive/10 transition-colors">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-foreground">{anom.vehicle_name}</span>
                          <span className="text-[10px] text-muted-foreground">{format(new Date(anom.date), 'dd MMM yyyy')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-muted-foreground">Fuel Efficiency</p>
                            <p className="text-sm font-bold text-destructive tabular-nums">{anom.efficiency.toFixed(2)} km/l</p>
                          </div>
                          <div className="text-right space-y-0.5">
                            <p className="text-[10px] text-muted-foreground">Avg for Vehicle</p>
                            <p className="text-sm font-bold text-foreground tabular-nums">{anom.avgEfficiency.toFixed(2)} km/l</p>
                          </div>
                        </div>
                        <div className="text-[10px] bg-destructive/10 text-destructive font-medium p-1.5 rounded border border-destructive/10 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                          <span>Efficiency is {anom.dropPercentage.toFixed(0)}% below average!</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 4: Fuel Stations & Credit Master */}
        <TabsContent value="stations" className="space-y-6 outline-none animate-in fade-in-50 duration-200">
          <FuelStationsTab onRefreshRefills={() => setRefreshTrigger(p => p + 1)} />
        </TabsContent>
      </Tabs>

      {/* Log Fuel Refill Modal (Tab 1) */}
      <LogFuelModal 
        isOpen={isLogModalOpen} 
        onClose={() => {
          setIsLogModalOpen(false);
          setEditingRefill(null);
        }} 
        onSuccess={() => setRefreshTrigger(p => p + 1)}
        savedCards={creditCards}
        editLog={editingRefill}
      />

      {/* Fuel Payment Modal (Tab 2) */}
      <FuelPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        transaction={editingPayment}
        cards={creditCards}
        onSuccess={() => setRefreshTrigger(p => p + 1)}
      />
    </div>
  );
};

export default FuelTrackerPage;