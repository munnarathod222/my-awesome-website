import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { 
  Wrench, Bell, AlertTriangle, ClipboardList, Trash2, Edit2, 
  CalendarRange, Filter, Search, Package, DollarSign, CheckCircle, 
  Truck, Plus, X, User, Calendar, FileText, Check, AlertCircle, 
  Sliders, ShieldCheck, History, UploadCloud, Wind, Droplets, RefreshCw 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { cn } from '@/lib/utils.js';

const CHECKLIST_ITEMS = [
  { key: 'engine_oil', label: 'Engine Oil', actionType: 'topup' },
  { key: 'coolant', label: 'Coolant', actionType: 'topup' },
  { key: 'power_steering_fluid', label: 'Power Steering Fluid', actionType: 'topup' },
  { key: 'tyres', label: 'Tyres', actionType: 'repair' },
  { key: 'tyre_depth', label: 'Tyre Depth', type: 'text', placeholder: 'e.g. 8mm' },
  { key: 'battery_terminals', label: 'Battery Terminals', actionType: 'repair' },
  { key: 'all_lights', label: 'All Lights', actionType: 'repair' },
  { key: 'dashboard_alerts', label: 'Dashboard Alerts', actionType: 'repair' },
  { key: 'air_filter_clean_1', label: 'Air Filter Clean 1 (Bi-weekly)', actionType: 'clean' },
  { key: 'air_filter_clean_2', label: 'Air Filter Clean 2 (Bi-weekly)', actionType: 'clean' },
  { key: 'greasing', label: 'Greasing (Monthly Once)', actionType: 'grease' }
];

const getChecklistBadgeClass = (val) => {
  switch (val) {
    case 'pass':
      return 'bg-success/10 text-success border-success/20';
    case 'fail':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'topped_up':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'repaired':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    case 'cleaned':
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    case 'done':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    default:
      if (val === true) return 'bg-success/10 text-success border-success/20';
      if (val === false) return 'bg-destructive/10 text-destructive border-destructive/20';
      return 'bg-secondary text-secondary-foreground';
  }
};

const getChecklistLabel = (key, val) => {
  const cleanKey = key.replace(/_/g, ' ');
  let valLabel = val;
  if (val === true) valLabel = 'Pass';
  if (val === false) valLabel = 'Fail';
  if (val === 'topped_up') valLabel = 'Topped Up';
  if (val === 'repaired') valLabel = 'Repaired';
  if (val === 'cleaned') valLabel = 'Cleaned';
  if (val === 'done') valLabel = 'Done';
  return `${cleanKey}: ${valLabel}`;
};


export default function MaintenancePage() {
  const [searchParams] = useSearchParams();
  const truckIdParam = searchParams.get('truckId');

  // Core data states
  const [trucks, setTrucks] = useState([]);
  const [tripLogs, setTripLogs] = useState([]);
  const [intervals, setIntervals] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [serviceLogs, setServiceLogs] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [problems, setProblems] = useState([]);
  const [monthlyReminders, setMonthlyReminders] = useState([]);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [activeTab, setActiveTab] = useState('vehicles');
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [drawerTab, setDrawerTab] = useState('intervals');
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  // Form states for workspace drawer
  const [newInterval, setNewInterval] = useState({ component_name: '', target_interval_kms: '', last_serviced_odometer: '' });
  const [newInspection, setNewInspection] = useState({
    inspector_name: '',
    inspection_date: format(new Date(), 'yyyy-MM-dd'),
    checklist: {
      engine_oil: 'pass',
      coolant: 'pass',
      power_steering_fluid: 'pass',
      tyres: 'pass',
      tyre_depth: '',
      battery_terminals: 'pass',
      all_lights: 'pass',
      dashboard_alerts: 'pass',
      air_filter_clean_1: 'pass',
      air_filter_clean_2: 'pass',
      greasing: 'pass'
    },
    inspector_notes: ''
  });
  const [newServiceLog, setNewServiceLog] = useState({ maintenance_date: format(new Date(), 'yyyy-MM-dd'), odometer_at_service: '', work_description_text: '', parts_replaced_input: '', cost_amount: '' });
  const [serviceLogFile, setServiceLogFile] = useState(null);

  // Global filters (still used for inventory/problems tabs)
  const [filters, setFilters] = useState({
    truck_id: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    problemStatus: 'all'
  });

  // Local filters for inventory
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('all');

  // Fetch monthly reminders (current month)
  const fetchMonthlyReminders = async () => {
    setRemindersLoading(true);
    try {
      const now = new Date();
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const records = await pb.collection('maintenance_reminders').getFullList({
        filter: `month_label = "${monthStr}"`,
        sort: 'truck_id,maintenance_type',
        $autoCancel: false
      });
      setMonthlyReminders(records);
    } catch (err) {
      // month_label field might not exist yet — fall back to reminder_date range
      try {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const records = await pb.collection('maintenance_reminders').getFullList({
          filter: `reminder_date >= "${y}-${m}-01 00:00:00" && reminder_date <= "${y}-${m}-31 23:59:59"`,
          sort: 'truck_id,maintenance_type',
          $autoCancel: false
        });
        setMonthlyReminders(records);
      } catch (e) {
        console.error('Failed to load monthly reminders:', e);
      }
    } finally {
      setRemindersLoading(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [trucksRes, tripLogsRes, intervalsRes, inspectionsRes, serviceLogsRes, inventoryRes, problemsRes] = await Promise.all([
        pb.collection('trucks').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('trip_logs').getFullList({ sort: '-date', $autoCancel: false }),
        pb.collection('service_intervals').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('monthly_inspections').getFullList({ sort: '-inspection_date', $autoCancel: false }),
        pb.collection('service_logs').getFullList({ sort: '-maintenance_date', $autoCancel: false }),
        pb.collection('inventory_items').getFullList({ sort: 'item_name', $autoCancel: false }),
        pb.collection('maintenance_problems').getFullList({ sort: '-date_reported', $autoCancel: false })
      ]);

      setTrucks(trucksRes);
      setTripLogs(tripLogsRes);
      setIntervals(intervalsRes);
      setInspections(inspectionsRes);
      setServiceLogs(serviceLogsRes);
      setInventory(inventoryRes);
      setProblems(problemsRes);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load fleet maintenance data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMonthlyReminders();
  }, []);

  // Handle deep link truck ID parameter
  useEffect(() => {
    if (truckIdParam && trucks.length > 0) {
      const found = trucks.find(t => t.id === truckIdParam);
      if (found) {
        setSelectedTruck(found);
        setActiveTab('vehicles');
      }
    }
  }, [truckIdParam, trucks]);

  // Dynamic Odometer Aggregation logic
  const getLiveOdometer = (truck) => {
    const baseOdo = truck.base_odometer || 0;
    const completedTrips = tripLogs.filter(
      log => log.truck_number === truck.truck_number && log.trip_status === 'Completed'
    );
    const tripKms = completedTrips.reduce((sum, log) => sum + (log.kms || 0), 0);
    return baseOdo + tripKms;
  };

  // Service Interval Countdown calculations
  const getIntervalStatus = (truck, liveOdo) => {
    const truckIntervals = intervals.filter(i => i.truck_id === truck.id);
    if (truckIntervals.length === 0) {
      return { text: 'No intervals set', variant: 'secondary', kms: Infinity };
    }

    const calculated = truckIntervals.map(interval => {
      const kmsRemaining = (interval.last_serviced_odometer + interval.target_interval_kms) - liveOdo;
      return { interval, kmsRemaining };
    });

    // Find the one closest to due (minimum kmsRemaining)
    calculated.sort((a, b) => a.kmsRemaining - b.kmsRemaining);
    const closest = calculated[0];

    if (closest.kmsRemaining < 0) {
      return { 
        text: `${closest.interval.component_name} overdue by ${Math.abs(closest.kmsRemaining).toLocaleString()} KMs`, 
        variant: 'destructive',
        kms: closest.kmsRemaining
      };
    } else if (closest.kmsRemaining <= 2000) {
      return { 
        text: `${closest.interval.component_name} due in ${closest.kmsRemaining.toLocaleString()} KMs`, 
        variant: 'warning',
        kms: closest.kmsRemaining
      };
    } else {
      return { 
        text: `${closest.interval.component_name} due in ${closest.kmsRemaining.toLocaleString()} KMs`, 
        variant: 'success',
        kms: closest.kmsRemaining
      };
    }
  };

  // Form Submissions inside the Workspace Drawer
  const handleAddInterval = async (e) => {
    e.preventDefault();
    if (!selectedTruck) return;
    try {
      await pb.collection('service_intervals').create({
        truck_id: selectedTruck.id,
        component_name: newInterval.component_name,
        target_interval_kms: parseInt(newInterval.target_interval_kms) || 0,
        last_serviced_odometer: parseInt(newInterval.last_serviced_odometer) || getLiveOdometer(selectedTruck)
      }, { $autoCancel: false });
      toast.success('Service interval added successfully');
      setNewInterval({ component_name: '', target_interval_kms: '', last_serviced_odometer: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to add service interval');
    }
  };

  const handleAddInspection = async (e) => {
    e.preventDefault();
    if (!selectedTruck) return;
    try {
      await pb.collection('monthly_inspections').create({
        truck_id: selectedTruck.id,
        inspection_date: new Date(newInspection.inspection_date).toISOString(),
        inspector_name: newInspection.inspector_name,
        pass_fail_toggles: newInspection.checklist,
        inspector_notes: newInspection.inspector_notes
      }, { $autoCancel: false });
      toast.success('Inspection record logged');
      setNewInspection({
        inspector_name: '',
        inspection_date: format(new Date(), 'yyyy-MM-dd'),
        checklist: {
          engine_oil: 'pass',
          coolant: 'pass',
          power_steering_fluid: 'pass',
          tyres: 'pass',
          tyre_depth: '',
          battery_terminals: 'pass',
          all_lights: 'pass',
          dashboard_alerts: 'pass',
          air_filter_clean_1: 'pass',
          air_filter_clean_2: 'pass',
          greasing: 'pass'
        },
        inspector_notes: ''
      });
      fetchData();
    } catch (err) {
      toast.error('Failed to log inspection');
    }
  };

  const handleAddServiceLog = async (e) => {
    e.preventDefault();
    if (!selectedTruck) return;
    try {
      const formData = new FormData();
      formData.append('truck_id', selectedTruck.id);
      formData.append('maintenance_date', new Date(newServiceLog.maintenance_date).toISOString());
      formData.append('odometer_at_service', String(newServiceLog.odometer_at_service || getLiveOdometer(selectedTruck)));
      formData.append('work_description_text', newServiceLog.work_description_text);
      formData.append('cost_amount', String(newServiceLog.cost_amount || 0));

      const partsArray = newServiceLog.parts_replaced_input
        ? newServiceLog.parts_replaced_input.split(',').map(p => p.trim()).filter(Boolean)
        : [];
      formData.append('parts_replaced_array', JSON.stringify(partsArray));

      if (serviceLogFile) {
        formData.append('invoice_file', serviceLogFile);
      }

      await pb.collection('service_logs').create(formData, { $autoCancel: false });
      toast.success('Service log recorded');
      setNewServiceLog({ maintenance_date: format(new Date(), 'yyyy-MM-dd'), odometer_at_service: '', work_description_text: '', parts_replaced_input: '', cost_amount: '' });
      setServiceLogFile(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to record service log');
    }
  };

  // Deletion helper for Drawer collections
  const handleDeleteDrawerItem = async (collection, id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await pb.collection(collection).delete(id, { $autoCancel: false });
      toast.success('Record deleted');
      fetchData();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  // Top level stats & data mapping for inventory / problems (Old tabs fallback)
  const uniqueTrucks = useMemo(() => {
    const tSet = new Set();
    problems.forEach(p => p.truck_id && tSet.add(p.truck_id));
    return Array.from(tSet).sort();
  }, [problems]);

  const uniqueCategories = useMemo(() => {
    const cSet = new Set();
    problems.forEach(p => p.category && cSet.add(p.category));
    return Array.from(cSet).sort();
  }, [problems]);

  const filterByDateRange = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    if (filters.dateFrom && date < new Date(filters.dateFrom)) return false;
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (date > toDate) return false;
    }
    return true;
  };

  const filteredProblems = useMemo(() => {
    const filtered = problems.filter(prob => {
      const matchTruck = filters.truck_id === 'all' || prob.truck_id === filters.truck_id;
      const matchCategory = filters.category === 'all' || prob.category === filters.category;
      const matchStatus = filters.problemStatus === 'all' || prob.status === filters.problemStatus;
      return matchTruck && matchCategory && matchStatus && filterByDateRange(prob.date_reported);
    });
    return filtered.sort((a, b) => new Date(b.date_reported || 0) - new Date(a.date_reported || 0));
  }, [problems, filters]);

  const filteredInventory = useMemo(() => inventory.filter(item => {
    const matchSearch = item.item_name.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchCategory = inventoryCategory === 'all' || item.category === inventoryCategory;
    return matchSearch && matchCategory;
  }), [inventory, inventorySearch, inventoryCategory]);

  const inventoryStats = useMemo(() => {
    const totalItems = inventory.length;
    const lowStock = inventory.filter(i => i.current_stock <= i.reorder_level).length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.current_stock * (item.unit_cost || 0)), 0);
    return { totalItems, lowStock, totalValue };
  }, [inventory]);

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      return format(new Date(isoString), 'MMM dd, yyyy');
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <Helmet>
        <title>Fleet Maintenance | Dashboard</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card p-6 rounded-2xl shadow-sm border border-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>
            Fleet Maintenance & Diagnostics
          </h1>
          <p className="text-muted-foreground mt-2">Monitor dynamically calculated live odometers, inspect vehicles, and track part intervals.</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-6 flex flex-wrap h-auto rounded-xl max-w-fit">
          <TabsTrigger value="vehicles" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm">
            <Truck className="w-4 h-4" /> Vehicles Roster
            <Badge variant="secondary" className="ml-1.5 opacity-70 bg-background">{trucks.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="monthly_reminders" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm relative">
            <Bell className="w-4 h-4" /> Monthly Reminders
            {monthlyReminders.filter(r => r.status === 'Pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {monthlyReminders.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm">
            <Package className="w-4 h-4" /> Inventory
            <Badge variant="secondary" className="ml-1.5 opacity-70 bg-background">{filteredInventory.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="problems" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm">
            <AlertTriangle className="w-4 h-4" /> Reported Problems
            <Badge variant="secondary" className="ml-1.5 opacity-70 bg-background">{filteredProblems.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Vehicles Roster Grid */}
        <TabsContent value="vehicles" className="m-0 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border border-border/60 rounded-2xl p-5 space-y-4">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-6 w-full" />
                </Card>
              ))}
            </div>
          ) : trucks.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-12 text-center text-muted-foreground">
              <Truck className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No trucks found in the fleet database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trucks.map(truck => {
                const liveOdometer = getLiveOdometer(truck);
                const status = getIntervalStatus(truck, liveOdometer);

                return (
                  <div 
                    key={truck.id} 
                    onClick={() => { setSelectedTruck(truck); setDrawerTab('intervals'); }}
                    className="group bg-card border border-border/60 hover:border-primary/30 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-0.5"
                  >
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Nickname & Icon */}
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground group-hover:text-primary transition-colors">
                          <Truck className="w-4 h-4" />
                          <span className="text-xs font-semibold uppercase tracking-wider">{truck.truck_name || 'Unnamed Vehicle'}</span>
                        </div>

                        {/* Bold Registration Plate */}
                        <h3 className="font-heading font-extrabold text-2xl text-foreground tracking-wide font-mono">
                          {truck.truck_number}
                        </h3>

                        {/* Live Odometer */}
                        <div className="mt-3 flex items-baseline gap-1.5">
                          <span className="text-xs text-muted-foreground font-medium">Accumulated Odometer:</span>
                          <span className="text-lg font-bold text-foreground tabular-nums">
                            {liveOdometer.toLocaleString()} <span className="text-xs font-semibold text-muted-foreground">KMs</span>
                          </span>
                        </div>
                      </div>

                      {/* Service Status Due Badge */}
                      <div className="border-t border-border/50 pt-4 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">Diagnostics:</span>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "px-2.5 py-0.5 rounded-lg text-xs font-bold border-0",
                            status.variant === 'destructive' && 'bg-destructive/15 text-destructive',
                            status.variant === 'warning' && 'bg-warning/15 text-warning',
                            status.variant === 'success' && 'bg-success/15 text-success',
                            status.variant === 'secondary' && 'bg-secondary text-secondary-foreground'
                          )}
                        >
                          {status.text}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB: Monthly Reminders (Air Filter & Greasing) */}
        <TabsContent value="monthly_reminders" className="m-0 space-y-6">
          {/* Header strip */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-amber-500/10 via-orange-400/8 to-transparent border border-amber-500/20 rounded-2xl p-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bell className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-foreground">Monthly Service Reminders</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Recurring checks auto-generated on the 1st of every month for every truck in the fleet.
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/20">
                  <Wind className="w-3.5 h-3.5" /> Air Filter Cleaning
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  <Droplets className="w-3.5 h-3.5" /> Chassis Greasing
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">Current Month</p>
                <p className="text-sm font-bold text-foreground">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
              </div>
              <button
                onClick={fetchMonthlyReminders}
                className="p-2 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Refresh reminders"
              >
                <RefreshCw className={`w-4 h-4 ${remindersLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Summary KPI row */}
          {(() => {
            const total     = monthlyReminders.length;
            const pending   = monthlyReminders.filter(r => r.status === 'Pending').length;
            const completed = monthlyReminders.filter(r => r.status === 'Completed').length;
            const overdue   = monthlyReminders.filter(r => r.status === 'Overdue').length;
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Tasks',  val: total,     color: 'bg-primary/10 text-primary',          icon: <Bell className="w-4 h-4" /> },
                  { label: 'Pending',      val: pending,   color: 'bg-amber-500/10 text-amber-500',      icon: <AlertCircle className="w-4 h-4" /> },
                  { label: 'Completed',    val: completed, color: 'bg-emerald-500/10 text-emerald-500',  icon: <CheckCircle className="w-4 h-4" /> },
                  { label: 'Overdue',      val: overdue,   color: 'bg-destructive/10 text-destructive',  icon: <AlertTriangle className="w-4 h-4" /> },
                ].map(kpi => (
                  <Card key={kpi.label} className="border-border bg-card rounded-2xl shadow-sm">
                    <CardContent className="p-5 flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${kpi.color}`}>{kpi.icon}</div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                        <p className="text-2xl font-bold tabular-nums">{kpi.val}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })()}

          {/* Per-truck reminder cards grid */}
          {remindersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border border-border/60 rounded-2xl p-5 space-y-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-7 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </div>
          ) : monthlyReminders.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-14 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">No reminders for this month yet.</p>
              <p className="text-xs text-muted-foreground mt-1">They are auto-created on the 1st of each month.<br />You can also trigger them manually via the API.</p>
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/custom/maintenance/generate-monthly-reminders', { method: 'POST' });
                    toast.success('Monthly reminders generated!');
                    fetchMonthlyReminders();
                  } catch (err) {
                    toast.error('Failed to generate reminders. Check that PocketBase is running.');
                  }
                }}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Generate Now
              </button>
            </div>
          ) : (
            (() => {
              // Group reminders by truck_id
              const byTruck = {};
              monthlyReminders.forEach(r => {
                if (!byTruck[r.truck_id]) byTruck[r.truck_id] = [];
                byTruck[r.truck_id].push(r);
              });

              const truckMap = {};
              trucks.forEach(t => { truckMap[t.id] = t; });

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Object.entries(byTruck).map(([truckId, reminders]) => {
                    const truck = truckMap[truckId];
                    const truckLabel = truck ? truck.truck_number : truckId;
                    const truckName  = truck?.truck_name || '';
                    const allDone    = reminders.every(r => r.status === 'Completed');

                    return (
                      <div
                        key={truckId}
                        className={`bg-card border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${
                          allDone ? 'border-emerald-500/30 ring-1 ring-emerald-500/10' : 'border-border/60 hover:border-primary/20'
                        }`}
                      >
                        {/* Card header */}
                        <div className={`px-5 py-4 flex items-center justify-between ${
                          allDone ? 'bg-emerald-500/8' : 'bg-muted/30'
                        }`}>
                          <div>
                            {truckName && (
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{truckName}</p>
                            )}
                            <h3 className="font-mono font-extrabold text-xl text-foreground tracking-wide">{truckLabel}</h3>
                          </div>
                          {allDone ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              <Check className="w-3 h-3" /> All Done
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                              <AlertCircle className="w-3 h-3" /> {reminders.filter(r => r.status !== 'Completed').length} Pending
                            </span>
                          )}
                        </div>

                        {/* Reminder rows */}
                        <div className="divide-y divide-border/30">
                          {reminders.map(rem => {
                            const isAirFilter = rem.maintenance_type?.toLowerCase().includes('air filter');
                            const isDone      = rem.status === 'Completed';
                            const isOverdue   = rem.status === 'Overdue';

                            return (
                              <div key={rem.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`p-2 rounded-lg shrink-0 ${
                                    isAirFilter ? 'bg-sky-500/12 text-sky-400' : 'bg-emerald-500/12 text-emerald-400'
                                  }`}>
                                    {isAirFilter ? <Wind className="w-3.5 h-3.5" /> : <Droplets className="w-3.5 h-3.5" />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className={`text-sm font-semibold truncate ${
                                      isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                                    }`}>
                                      {rem.maintenance_type}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                      {new Date(rem.reminder_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    isDone    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                                    isOverdue ? 'bg-destructive/15 text-destructive border-destructive/20' :
                                                'bg-amber-500/15 text-amber-400 border-amber-500/20'
                                  }`}>
                                    {rem.status}
                                  </span>
                                  {!isDone && (
                                    <button
                                      title="Mark as Completed"
                                      onClick={async () => {
                                        try {
                                          await pb.collection('maintenance_reminders').update(rem.id, { status: 'Completed' }, { $autoCancel: false });
                                          toast.success(`${rem.maintenance_type} marked complete for ${truckLabel}`);
                                          fetchMonthlyReminders();
                                        } catch (e) {
                                          toast.error('Failed to update reminder');
                                        }
                                      }}
                                      className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors border border-transparent hover:border-emerald-500/20"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Notes strip (if available) */}
                        {reminders[0]?.notes && !allDone && (
                          <div className="px-5 py-3 bg-muted/20 border-t border-border/30">
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              <span className="font-semibold text-foreground/60">Tip: </span>
                              {reminders[0].notes}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </TabsContent>

        {/* TAB 2: Inventory Fallback */}
        <TabsContent value="inventory" className="m-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border bg-card rounded-2xl shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl"><Package className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-3xl font-bold tabular-nums">{inventoryStats.totalItems}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card rounded-2xl shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-destructive/10 text-destructive rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                  <p className="text-3xl font-bold tabular-nums">{inventoryStats.lowStock}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card rounded-2xl shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-success/10 text-success rounded-xl"><DollarSign className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                  <p className="text-3xl font-bold tabular-nums">₹{inventoryStats.totalValue.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl shadow-sm overflow-hidden border-border bg-card">
            <div className="p-4 border-b border-border bg-muted/20 flex flex-wrap gap-4 items-center">
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search item name..." 
                  value={inventorySearch} 
                  onChange={(e) => setInventorySearch(e.target.value)} 
                  className="pl-9 h-10 rounded-xl bg-background shadow-sm border-border"
                />
              </div>
              <Select value={inventoryCategory} onValueChange={setInventoryCategory}>
                <SelectTrigger className="w-[200px] h-10 rounded-xl bg-background shadow-sm border-border">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Truck Parts">Truck Parts</SelectItem>
                  <SelectItem value="Oils & Fluids">Oils & Fluids</SelectItem>
                  <SelectItem value="Ad Blue">Ad Blue</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Reorder Level</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}><Skeleton className="h-5 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredInventory.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8">No inventory items found.</TableCell></TableRow>
                  ) : (
                    filteredInventory.map(item => {
                      const isLow = item.current_stock <= item.reorder_level;
                      return (
                        <TableRow key={item.id} className={isLow ? 'bg-destructive/5 hover:bg-destructive/10' : ''}>
                          <TableCell className="font-medium">
                            {item.item_name}
                            {isLow && <Badge variant="destructive" className="ml-2 text-[10px]">Low Stock</Badge>}
                          </TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className={`text-right font-bold ${isLow ? 'text-destructive' : ''}`}>{item.current_stock}</TableCell>
                          <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{item.reorder_level}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(item.updated)}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 3: Problems Fallback */}
        <TabsContent value="problems" className="m-0">
          <Card className="rounded-2xl shadow-sm overflow-hidden border-border bg-card">
            <div className="p-4 border-b border-border bg-muted/20 flex flex-wrap gap-4 items-center">
              <Select value={filters.truck_id} onValueChange={(v) => setFilters(p => ({...p, truck_id: v}))}>
                <SelectTrigger className="w-[180px] h-10 rounded-xl bg-background shadow-sm border-border">
                  <SelectValue placeholder="All Trucks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trucks</SelectItem>
                  {uniqueTrucks.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.problemStatus} onValueChange={(v) => setFilters(p => ({...p, problemStatus: v}))}>
                <SelectTrigger className="w-[180px] h-10 rounded-xl bg-background shadow-sm border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Date Reported</TableHead>
                    <TableHead>Truck</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}><Skeleton className="h-5 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredProblems.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8">No reported problems matching filters.</TableCell></TableRow>
                  ) : (
                    filteredProblems.map(prob => (
                      <TableRow key={prob.id}>
                        <TableCell className="font-medium whitespace-nowrap">{formatDate(prob.date_reported)}</TableCell>
                        <TableCell><Badge variant="outline">{prob.truck_id}</Badge></TableCell>
                        <TableCell>{prob.category}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={
                            prob.severity === 'Critical' ? 'bg-destructive text-destructive-foreground' :
                            prob.severity === 'High' ? 'bg-destructive/20 text-destructive' :
                            'bg-muted text-muted-foreground'
                          }>
                            {prob.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={prob.status === 'Open' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}>
                            {prob.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">{prob.description}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DETAILED WORKSPACE DRAWER (SLIDE-OUT SHEET) */}
      {selectedTruck && (
        <Sheet open={!!selectedTruck} onOpenChange={(open) => !open && setSelectedTruck(null)}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-card border-l border-border shadow-2xl p-6">
            <SheetHeader className="mb-6 pb-4 border-b border-border/50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">
                    <Truck className="w-4 h-4 text-primary" />
                    <span>{selectedTruck.truck_name || 'Unnamed Vehicle'}</span>
                  </div>
                  <SheetTitle className="text-3xl font-mono font-extrabold text-foreground">
                    {selectedTruck.truck_number}
                  </SheetTitle>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Live Odometer</span>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {getLiveOdometer(selectedTruck).toLocaleString()} <span className="text-sm font-semibold text-muted-foreground">KMs</span>
                  </p>
                </div>
              </div>
            </SheetHeader>

            <Tabs value={drawerTab} onValueChange={setDrawerTab} className="w-full space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-muted/40 p-1 rounded-xl">
                <TabsTrigger value="intervals" className="gap-1.5 py-2.5 rounded-lg text-sm">
                  <Sliders className="w-4 h-4" /> Intervals
                </TabsTrigger>
                <TabsTrigger value="inspections" className="gap-1.5 py-2.5 rounded-lg text-sm">
                  <ShieldCheck className="w-4 h-4" /> Inspections
                </TabsTrigger>
                <TabsTrigger value="logs" className="gap-1.5 py-2.5 rounded-lg text-sm">
                  <History className="w-4 h-4" /> Service Logs
                </TabsTrigger>
              </TabsList>

              {/* DRAWER TAB 1: Service Intervals Engine */}
              <TabsContent value="intervals" className="m-0 space-y-6">
                <div className="bg-secondary/5 border border-border/40 p-5 rounded-2xl space-y-4">
                  <h3 className="font-heading font-bold text-lg flex items-center gap-2 text-primary">
                    <Sliders className="w-5 h-5" /> Service Intervals Config
                  </h3>
                  <form onSubmit={handleAddInterval} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Component</label>
                      <Input 
                        placeholder="e.g. Engine Oil" 
                        value={newInterval.component_name} 
                        onChange={e => setNewInterval({...newInterval, component_name: e.target.value})}
                        required
                        className="h-9 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Interval (KMs)</label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 40000" 
                        value={newInterval.target_interval_kms} 
                        onChange={e => setNewInterval({...newInterval, target_interval_kms: e.target.value})}
                        required
                        className="h-9 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Last Serviced Odo (KMs)</label>
                      <Input 
                        type="number" 
                        placeholder={String(getLiveOdometer(selectedTruck))}
                        value={newInterval.last_serviced_odometer} 
                        onChange={e => setNewInterval({...newInterval, last_serviced_odometer: e.target.value})}
                        className="h-9 rounded-lg"
                      />
                    </div>
                    <Button type="submit" size="sm" className="sm:col-span-3 mt-2 h-9 rounded-lg shadow-sm">
                      <Plus className="w-4 h-4 mr-2" /> Add Active Interval
                    </Button>
                  </form>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm uppercase font-bold text-muted-foreground tracking-wider">Active Intervals Roster</h4>
                  {intervals.filter(i => i.truck_id === selectedTruck.id).length === 0 ? (
                    <p className="text-sm italic text-muted-foreground/60 text-center py-6 border border-dashed border-border/40 rounded-2xl bg-muted/5">
                      No active component intervals configured for this vehicle.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {intervals.filter(i => i.truck_id === selectedTruck.id).map(i => {
                        const liveOdo = getLiveOdometer(selectedTruck);
                        const kmsRemaining = (i.last_serviced_odometer + i.target_interval_kms) - liveOdo;
                        const kmsDriven = liveOdo - i.last_serviced_odometer;
                        const percent = Math.min(100, Math.max(0, (kmsDriven / i.target_interval_kms) * 100));
                        const isOverdue = kmsRemaining < 0;

                        return (
                          <div key={i.id} className="p-4 rounded-xl border border-border bg-card/40 space-y-2 relative group/item">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-bold text-foreground">{i.component_name}</h5>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  Config: Every {i.target_interval_kms.toLocaleString()} KMs (Last Serviced: {i.last_serviced_odometer.toLocaleString()} KMs)
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className={cn(
                                  "border-0 text-xs font-bold px-2 py-0.5 rounded",
                                  isOverdue ? 'bg-destructive/15 text-destructive' :
                                  kmsRemaining <= 2000 ? 'bg-warning/15 text-warning' :
                                  'bg-success/15 text-success'
                                )}>
                                  {isOverdue 
                                    ? `Overdue by ${Math.abs(kmsRemaining).toLocaleString()} KMs` 
                                    : `${kmsRemaining.toLocaleString()} KMs left`
                                  }
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="space-y-1">
                              <Progress value={percent} className={cn("h-1.5", isOverdue ? "bg-destructive/10" : "bg-primary/10")} />
                              <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>{kmsDriven.toLocaleString()} KMs driven</span>
                                <span>{percent.toFixed(0)}% worn</span>
                              </div>
                            </div>

                            <Button 
                              type="button"
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteDrawerItem('service_intervals', i.id)}
                              className="absolute top-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* DRAWER TAB 2: Monthly Inspections Checklist */}
              <TabsContent value="inspections" className="m-0 space-y-6">
                <div className="bg-secondary/5 border border-border/40 p-5 rounded-2xl space-y-4">
                  <h3 className="font-heading font-bold text-lg flex items-center gap-2 text-primary">
                    <ShieldCheck className="w-5 h-5" /> Monthly Shop Checklist
                  </h3>
                  <form onSubmit={handleAddInspection} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Inspector Name</label>
                        <Input 
                          placeholder="e.g. Ramesh Kumar" 
                          value={newInspection.inspector_name} 
                          onChange={e => setNewInspection({...newInspection, inspector_name: e.target.value})}
                          required
                          className="h-9 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Inspection Date</label>
                        <Input 
                          type="date" 
                          value={newInspection.inspection_date} 
                          onChange={e => setNewInspection({...newInspection, inspection_date: e.target.value})}
                          required
                          className="h-9 rounded-lg"
                        />
                      </div>
                    </div>

                     {/* Pass/Fail Toggles */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block border-b border-border/40 pb-2">
                        Monthly Inspection Checklist
                      </label>
                      <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                        {CHECKLIST_ITEMS.map((item) => {
                          const currentVal = newInspection.checklist[item.key];
                          if (item.type === 'text') {
                            return (
                              <div key={item.key} className="flex flex-col gap-1.5 p-3 rounded-xl border border-border bg-background/50">
                                <span className="text-xs font-bold text-foreground capitalize">{item.label}</span>
                                <Input
                                  placeholder={item.placeholder}
                                  value={currentVal || ''}
                                  onChange={e => {
                                    const nextChecklist = { ...newInspection.checklist, [item.key]: e.target.value };
                                    setNewInspection({ ...newInspection, checklist: nextChecklist });
                                  }}
                                  className="h-8 rounded-lg text-xs"
                                />
                              </div>
                            );
                          }

                          return (
                            <div key={item.key} className="flex flex-col gap-2 p-3 rounded-xl border border-border bg-background/50">
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-xs font-bold text-foreground capitalize">{item.label}</span>
                                <div className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextChecklist = { ...newInspection.checklist, [item.key]: 'pass' };
                                      setNewInspection({ ...newInspection, checklist: nextChecklist });
                                    }}
                                    className={cn(
                                      "px-3 py-1 rounded-lg text-[10px] font-bold transition-all border",
                                      currentVal === 'pass'
                                        ? "bg-success/20 border-success text-success"
                                        : "bg-background border-border text-muted-foreground hover:bg-muted/30"
                                    )}
                                  >
                                    Pass
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextChecklist = { ...newInspection.checklist, [item.key]: 'fail' };
                                      setNewInspection({ ...newInspection, checklist: nextChecklist });
                                    }}
                                    className={cn(
                                      "px-3 py-1 rounded-lg text-[10px] font-bold transition-all border",
                                      (currentVal === 'fail' || currentVal === 'topped_up' || currentVal === 'repaired' || currentVal === 'cleaned' || currentVal === 'done')
                                        ? "bg-destructive/20 border-destructive text-destructive"
                                        : "bg-background border-border text-muted-foreground hover:bg-muted/30"
                                    )}
                                  >
                                    Fail
                                  </button>
                                </div>
                              </div>

                              {/* If fail was clicked, show topup/repair/clean/grease actions */}
                              {(currentVal === 'fail' || currentVal === 'topped_up' || currentVal === 'repaired' || currentVal === 'cleaned' || currentVal === 'done') && (
                                <div className="flex flex-wrap items-center gap-2 mt-1 pt-2 border-t border-border/30 animate-in slide-in-from-top-2 duration-200">
                                  <span className="text-[10px] text-muted-foreground font-semibold">Action Taken:</span>
                                  {item.actionType === 'topup' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextChecklist = { ...newInspection.checklist, [item.key]: 'topped_up' };
                                          setNewInspection({ ...newInspection, checklist: nextChecklist });
                                        }}
                                        className={cn(
                                          "px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all",
                                          currentVal === 'topped_up'
                                            ? "bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400"
                                            : "bg-background border-border text-muted-foreground hover:bg-muted/30"
                                        )}
                                      >
                                        🔧 Top-Up
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextChecklist = { ...newInspection.checklist, [item.key]: 'repaired' };
                                          setNewInspection({ ...newInspection, checklist: nextChecklist });
                                        }}
                                        className={cn(
                                          "px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all",
                                          currentVal === 'repaired'
                                            ? "bg-purple-500/20 border-purple-500 text-purple-600 dark:text-purple-400"
                                            : "bg-background border-border text-muted-foreground hover:bg-muted/30"
                                        )}
                                      >
                                        🛠️ Repair
                                      </button>
                                    </>
                                  )}
                                  {item.actionType === 'repair' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextChecklist = { ...newInspection.checklist, [item.key]: 'repaired' };
                                        setNewInspection({ ...newInspection, checklist: nextChecklist });
                                      }}
                                      className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all",
                                        currentVal === 'repaired'
                                          ? "bg-purple-500/20 border-purple-500 text-purple-600 dark:text-purple-400"
                                          : "bg-background border-border text-muted-foreground hover:bg-muted/30"
                                      )}
                                    >
                                      🛠️ Repair
                                    </button>
                                  )}
                                  {item.actionType === 'clean' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextChecklist = { ...newInspection.checklist, [item.key]: 'cleaned' };
                                        setNewInspection({ ...newInspection, checklist: nextChecklist });
                                      }}
                                      className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all",
                                        currentVal === 'cleaned'
                                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                          : "bg-background border-border text-muted-foreground hover:bg-muted/30"
                                      )}
                                    >
                                      🧼 Clean
                                    </button>
                                  )}
                                  {item.actionType === 'grease' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextChecklist = { ...newInspection.checklist, [item.key]: 'done' };
                                        setNewInspection({ ...newInspection, checklist: nextChecklist });
                                      }}
                                      className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all",
                                        currentVal === 'done'
                                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                          : "bg-background border-border text-muted-foreground hover:bg-muted/30"
                                      )}
                                    >
                                      🛢️ Do Greasing
                                    </button>
                                  )}

                                  {/* Status indicator */}
                                  <span className="text-[10px] ml-auto font-bold capitalize">
                                    {currentVal === 'fail' ? (
                                      <span className="text-destructive">Needs Action</span>
                                    ) : (
                                      <span className="text-success flex items-center gap-1">
                                        ✔️ {currentVal === 'topped_up' ? 'Topped Up' : currentVal === 'repaired' ? 'Repaired' : currentVal === 'cleaned' ? 'Cleaned' : 'Greased'}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Inspector Notes</label>
                      <Input 
                        placeholder="e.g. Brakes checked, pads at 60% thickness..." 
                        value={newInspection.inspector_notes} 
                        onChange={e => setNewInspection({...newInspection, inspector_notes: e.target.value})}
                        className="h-9 rounded-lg"
                      />
                    </div>

                    <Button type="submit" size="sm" className="w-full h-9 rounded-lg shadow-sm">
                      <Check className="w-4 h-4 mr-2" /> Log Checklist Record
                    </Button>
                  </form>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm uppercase font-bold text-muted-foreground tracking-wider">Inspection Logs History</h4>
                  {inspections.filter(i => i.truck_id === selectedTruck.id).length === 0 ? (
                    <p className="text-sm italic text-muted-foreground/60 text-center py-6 border border-dashed border-border/40 rounded-2xl bg-muted/5">
                      No inspection history recorded.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {inspections.filter(i => i.truck_id === selectedTruck.id).map(i => {
                        const toggles = i.pass_fail_toggles || {};
                        return (
                          <div key={i.id} className="p-4 rounded-xl border border-border bg-card/40 space-y-3 relative group/item">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Inspector</span>
                                <p className="font-bold text-foreground text-sm">{i.inspector_name}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Date Checked</span>
                                <p className="text-xs font-semibold font-mono text-muted-foreground">{formatDate(i.inspection_date)}</p>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Status</span>
                              <div className="flex gap-2 flex-wrap">
                                {Object.entries(toggles).map(([k, v]) => (
                                  <Badge 
                                    key={k} 
                                    variant="outline" 
                                    className={cn(
                                      "capitalize font-bold text-[10px]",
                                      getChecklistBadgeClass(v)
                                    )}
                                  >
                                    {getChecklistLabel(k, v)}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {i.inspector_notes && (
                              <p className="text-xs text-muted-foreground italic border-t border-border/50 pt-2 bg-muted/5 p-2 rounded-lg">
                                {i.inspector_notes}
                              </p>
                            )}

                            <Button 
                              type="button"
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteDrawerItem('monthly_inspections', i.id)}
                              className="absolute top-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* DRAWER TAB 3: Historical Service Logs Ledger */}
              <TabsContent value="logs" className="m-0 space-y-6">
                <div className="bg-secondary/5 border border-border/40 p-5 rounded-2xl space-y-4">
                  <h3 className="font-heading font-bold text-lg flex items-center gap-2 text-primary">
                    <History className="w-5 h-5" /> Record Service Log
                  </h3>
                  <form onSubmit={handleAddServiceLog} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Service Date</label>
                        <Input 
                          type="date" 
                          value={newServiceLog.maintenance_date} 
                          onChange={e => setNewServiceLog({...newServiceLog, maintenance_date: e.target.value})}
                          required
                          className="h-9 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Odometer (KM)</label>
                        <Input 
                          type="number" 
                          placeholder={String(getLiveOdometer(selectedTruck))}
                          value={newServiceLog.odometer_at_service} 
                          onChange={e => setNewServiceLog({...newServiceLog, odometer_at_service: e.target.value})}
                          className="h-9 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Cost Amount (₹)</label>
                        <Input 
                          type="number" 
                          placeholder="e.g. 5500" 
                          value={newServiceLog.cost_amount} 
                          onChange={e => setNewServiceLog({...newServiceLog, cost_amount: e.target.value})}
                          required
                          className="h-9 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Replaced Parts (comma-separated)</label>
                      <Input 
                        placeholder="e.g. Engine Oil, Air Filter, Front Brake Pads" 
                        value={newServiceLog.parts_replaced_input} 
                        onChange={e => setNewServiceLog({...newServiceLog, parts_replaced_input: e.target.value})}
                        className="h-9 rounded-lg"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Work Description</label>
                      <Input 
                        placeholder="e.g. Standard engine oil service and filters replacement..." 
                        value={newServiceLog.work_description_text} 
                        onChange={e => setNewServiceLog({...newServiceLog, work_description_text: e.target.value})}
                        required
                        className="h-9 rounded-lg"
                      />
                    </div>

                    {/* Invoice Upload */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Upload Invoice (PDF/Image)</label>
                      <div className="flex items-center gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="h-9 border-dashed rounded-lg bg-background"
                          onClick={() => document.getElementById('log-file-input').click()}
                        >
                          <UploadCloud className="w-4 h-4 mr-2" /> 
                          {serviceLogFile ? 'Change File' : 'Browse File'}
                        </Button>
                        <input 
                          type="file" 
                          id="log-file-input" 
                          className="hidden" 
                          onChange={e => setServiceLogFile(e.target.files?.[0] || null)}
                          accept="image/*,application/pdf"
                        />
                        {serviceLogFile && (
                          <span className="text-xs text-muted-foreground font-mono truncate max-w-xs bg-muted px-2 py-1 rounded">
                            {serviceLogFile.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button type="submit" size="sm" className="w-full h-9 rounded-lg shadow-sm">
                      <ClipboardList className="w-4 h-4 mr-2" /> Save Service Log
                    </Button>
                  </form>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm uppercase font-bold text-muted-foreground tracking-wider">Historical Logs Ledger</h4>
                  {serviceLogs.filter(s => s.truck_id === selectedTruck.id).length === 0 ? (
                    <p className="text-sm italic text-muted-foreground/60 text-center py-6 border border-dashed border-border/40 rounded-2xl bg-muted/5">
                      No service logs timeline found.
                    </p>
                  ) : (
                    <div className="relative border-l border-border/50 ml-3 pl-6 space-y-6">
                      {serviceLogs.filter(s => s.truck_id === selectedTruck.id).map(s => {
                        const parts = s.parts_replaced_array || [];
                        const invoiceUrl = s.invoice_file ? pb.files.getUrl(s, s.invoice_file) : null;

                        return (
                          <div key={s.id} className="relative group/item">
                            {/* Bullet indicator */}
                            <span className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-background bg-primary ring-2 ring-primary/20 shrink-0" />
                            
                            <div className="p-4 rounded-xl border border-border bg-card/40 space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-xs font-semibold font-mono text-muted-foreground">{formatDate(s.maintenance_date)}</p>
                                  <h5 className="font-bold text-foreground mt-0.5">{s.work_description_text}</h5>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-foreground">₹{s.cost_amount?.toLocaleString()}</p>
                                  <p className="text-[10px] text-muted-foreground font-mono">at {s.odometer_at_service?.toLocaleString()} KMs</p>
                                </div>
                              </div>

                              {parts.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {parts.map((p, idx) => (
                                    <Badge key={idx} variant="secondary" className="px-2 py-0.5 text-[10px] font-semibold bg-muted rounded-full">
                                      {p}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {invoiceUrl && (
                                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="p-0 text-primary hover:underline h-auto font-semibold flex items-center gap-1.5"
                                    onClick={() => {
                                      if (s.invoice_file.endsWith('.pdf')) {
                                        window.open(invoiceUrl, '_blank');
                                      } else {
                                        setActiveLightboxImage(invoiceUrl);
                                      }
                                    }}
                                  >
                                    <FileText className="w-3.5 h-3.5" /> View Invoice Attachment
                                  </Button>
                                </div>
                              )}

                              <Button 
                                type="button"
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteDrawerItem('service_logs', s.id)}
                                className="absolute top-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      )}

      {/* Invoice Lightbox Dialog */}
      {activeLightboxImage && (
        <Dialog open={!!activeLightboxImage} onOpenChange={() => setActiveLightboxImage(null)}>
          <DialogContent className="max-w-3xl border-none bg-black/90 p-0 overflow-hidden flex items-center justify-center rounded-2xl animate-in fade-in zoom-in duration-200">
            <div className="relative w-full h-[80vh] flex items-center justify-center p-4">
              <img src={activeLightboxImage} alt="high-res" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
              <button 
                onClick={() => setActiveLightboxImage(null)} 
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white rounded-full p-2 text-sm w-8 h-8 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}