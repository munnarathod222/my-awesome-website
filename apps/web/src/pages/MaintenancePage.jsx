import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { 
  Wrench, Bell, AlertTriangle, ClipboardList, Trash2, Edit2, 
  CalendarRange, Filter, Search, Package, DollarSign, CheckCircle, 
  Truck, Plus, X, User, Calendar, FileText, Check, AlertCircle, 
  Sliders, ShieldCheck, History, UploadCloud, Wind, Droplets, RefreshCw,
  TrendingUp, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
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
  const cleanKey = String(key || '').replace(/_/g, ' ');
  let valLabel = String(val !== undefined && val !== null ? val : '');
  if (val === true) valLabel = 'Pass';
  if (val === false) valLabel = 'Fail';
  if (val === 'pass') valLabel = 'Pass';
  if (val === 'fail') valLabel = 'Fail';
  if (val === 'topped_up') valLabel = 'Topped Up';
  if (val === 'repaired') valLabel = 'Repaired';
  if (val === 'cleaned') valLabel = 'Cleaned';
  if (val === 'done') valLabel = 'Done';
  return `${cleanKey}: ${valLabel}`;
};

const parseJsonField = (field, fallback = []) => {
  if (!field) return fallback;
  if (typeof field === 'object' && field !== null) return field;
  try {
    const val = JSON.parse(field);
    return (val === null || val === undefined) ? fallback : val;
  } catch (e) {
    return fallback;
  }
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

  // Local filters for Service Logs Ledger and Inspections
  const [serviceLogSearch, setServiceLogSearch] = useState('');
  const [serviceLogTruckFilter, setServiceLogTruckFilter] = useState('all');
  const [inspectionSearch, setInspectionSearch] = useState('');
  const [inspectionTruckFilter, setInspectionTruckFilter] = useState('all');

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
    if (!truck) return 0;
    const baseOdo = Number(truck.base_odometer) || 0;
    const completedTrips = tripLogs.filter(
      log => log.truck_number === truck.truck_number && log.trip_status === 'Completed'
    );
    const tripKms = completedTrips.reduce((sum, log) => sum + (Number(log.kms) || 0), 0);
    return baseOdo + tripKms;
  };

  // Service Interval Countdown calculations
  const getIntervalStatus = (truck, liveOdo) => {
    const truckIntervals = intervals.filter(i => i.truck_id === truck.id);
    if (truckIntervals.length === 0) {
      return { text: 'No intervals set', variant: 'secondary', kms: Infinity };
    }

    const calculated = truckIntervals.map(interval => {
      const lastServiced = Number(interval.last_serviced_odometer) || 0;
      const targetInt = Number(interval.target_interval_kms) || 0;
      const kmsRemaining = (lastServiced + targetInt) - liveOdo;
      return { interval, kmsRemaining };
    });

    // Find the one closest to due (minimum kmsRemaining)
    calculated.sort((a, b) => a.kmsRemaining - b.kmsRemaining);
    const closest = calculated[0];

    const kmsRem = closest.kmsRemaining || 0;
    const compName = closest.interval?.component_name || 'Component';

    if (kmsRem < 0) {
      return { 
        text: `${compName} overdue by ${Math.abs(kmsRem).toLocaleString()} KMs`, 
        variant: 'destructive',
        kms: kmsRem
      };
    } else if (kmsRem <= 2000) {
      return { 
        text: `${compName} due in ${kmsRem.toLocaleString()} KMs`, 
        variant: 'warning',
        kms: kmsRem
      };
    } else {
      return { 
        text: `${compName} due in ${kmsRem.toLocaleString()} KMs`, 
        variant: 'success',
        kms: kmsRem
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
    const lowStock = inventory.filter(item => (item.current_stock || 0) <= (item.reorder_level || 0)).length;
    const totalValue = inventory.reduce((sum, item) => sum + ((item.current_stock || 0) * (item.unit_cost || 0)), 0);
    return { totalItems, lowStock, totalValue };
  }, [inventory]);

  const statsSummary = useMemo(() => {
    const totalSpent = serviceLogs.reduce((sum, s) => sum + (Number(s.cost_amount) || 0), 0);
    const activeIssues = problems.filter(p => p.status !== 'Resolved').length;
    const overdueCount = trucks.reduce((count, truck) => {
      const liveOdo = getLiveOdometer(truck);
      const status = getIntervalStatus(truck, liveOdo);
      return status.variant === 'destructive' ? count + 1 : count;
    }, 0);
    const healthyTrucks = trucks.length === 0 ? 0 : Math.round(
      (trucks.filter(truck => {
        const liveOdo = getLiveOdometer(truck);
        const truckIntervals = intervals.filter(i => i.truck_id === truck.id);
        const overdue = truckIntervals.filter(i => {
          const lastServiced = Number(i.last_serviced_odometer) || 0;
          const targetInt = Number(i.target_interval_kms) || 0;
          return (lastServiced + targetInt) - liveOdo < 0;
        });
        return overdue.length === 0 && truckIntervals.length > 0;
      }).length / trucks.length) * 100
    );
    return { totalSpent, activeIssues, overdueCount, healthyTrucks };
  }, [serviceLogs, problems, trucks, intervals, tripLogs]);

  // Dynamic Daily KMs calculation from Trip Logs
  const getAverageDailyKms = (truckNumber) => {
    const logs = tripLogs.filter(l => l.truck_number === truckNumber && l.date);
    if (logs.length === 0) return 100; // default fallback 100 kms/day
    
    // Sort logs by date descending
    const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get last 10 logs
    const limitLogs = sorted.slice(0, 10);
    const totalKms = limitLogs.reduce((sum, l) => sum + (Number(l.kms) || 0), 0);
    
    if (limitLogs.length <= 1) return 100;
    const newestDate = new Date(limitLogs[0].date);
    const oldestDate = new Date(limitLogs[limitLogs.length - 1].date);
    
    if (isNaN(newestDate.getTime()) || isNaN(oldestDate.getTime())) return 100;
    
    const dayDiff = Math.max(1, Math.round((newestDate - oldestDate) / (1000 * 60 * 60 * 24)));
    const avg = Math.round(totalKms / dayDiff);
    return isNaN(avg) || avg <= 0 ? 100 : avg;
  };

  // Recharts Data Aggregations
  const monthlyCostData = useMemo(() => {
    const monthlyMap = {};
    serviceLogs.forEach(s => {
      if (!s.maintenance_date) return;
      const d = new Date(s.maintenance_date);
      if (isNaN(d.getTime())) return; // skip invalid dates
      const label = format(d, 'MMM yyyy');
      const cost = Number(s.cost_amount) || 0;
      
      if (!monthlyMap[label]) {
        monthlyMap[label] = { dateObj: d, cost: 0 };
      }
      monthlyMap[label].cost += cost;
    });
    
    return Object.entries(monthlyMap)
      .map(([label, info]) => ({ label, cost: info.cost, dateObj: info.dateObj }))
      .sort((a, b) => a.dateObj - b.dateObj)
      .map(item => ({ name: item.label, Amount: item.cost }));
  }, [serviceLogs]);

  const truckCostData = useMemo(() => {
    const truckMap = {};
    serviceLogs.forEach(s => {
      const truckObj = trucks.find(t => t.id === s.truck_id);
      const label = truckObj ? truckObj.truck_number : 'Unknown';
      const cost = Number(s.cost_amount) || 0;
      
      if (!truckMap[label]) truckMap[label] = 0;
      truckMap[label] += cost;
    });
    
    return Object.entries(truckMap)
      .map(([name, cost]) => ({ name, Amount: cost }))
      .sort((a, b) => b.Amount - a.Amount)
      .slice(0, 10); // top 10 trucks
  }, [serviceLogs, trucks]);

  const healthBreakdownData = useMemo(() => {
    let healthy = 0;
    let caution = 0;
    let critical = 0;
    
    trucks.forEach(truck => {
      const liveOdo = getLiveOdometer(truck);
      const status = getIntervalStatus(truck, liveOdo);
      
      if (status.variant === 'destructive') {
        critical++;
      } else if (status.variant === 'warning') {
        caution++;
      } else {
        healthy++;
      }
    });
    
    return [
      { name: 'Healthy', value: healthy, color: '#10b981' },
      { name: 'Due Soon', value: caution, color: '#f59e0b' },
      { name: 'Overdue', value: critical, color: '#f43f5e' }
    ].filter(item => item.value > 0);
  }, [trucks, intervals, tripLogs]);

  const predictiveForecasts = useMemo(() => {
    const forecasts = [];
    
    trucks.forEach(truck => {
      const liveOdo = getLiveOdometer(truck);
      const truckIntervals = intervals.filter(i => i.truck_id === truck.id);
      
      truckIntervals.forEach(interval => {
        const lastServiced = Number(interval.last_serviced_odometer) || 0;
        const targetInt = Number(interval.target_interval_kms) || 0;
        const kmsRemaining = (lastServiced + targetInt) - liveOdo;
        
        const dailyKms = getAverageDailyKms(truck.truck_number);
        const daysRemaining = dailyKms > 0 ? kmsRemaining / dailyKms : Infinity;
        
        let estDueDate = null;
        if (daysRemaining !== Infinity && !isNaN(daysRemaining) && daysRemaining < 1000) { // filter realistic range
          estDueDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);
        }
        
        forecasts.push({
          id: interval.id,
          truckNumber: truck.truck_number,
          truckName: truck.truck_name || 'Unnamed Vehicle',
          component: interval.component_name,
          kmsRemaining,
          daysRemaining: daysRemaining !== Infinity && !isNaN(daysRemaining) ? Math.round(daysRemaining) : null,
          estDueDate,
          dailyKms
        });
      });
    });
    
    return forecasts.sort((a, b) => a.kmsRemaining - b.kmsRemaining);
  }, [trucks, intervals, tripLogs]);

  const filteredServiceLogs = useMemo(() => {
    return serviceLogs.filter(s => {
      const truckObj = trucks.find(t => t.id === s.truck_id);
      const truckNum = truckObj ? truckObj.truck_number : '';
      
      const parts = parseJsonField(s.parts_replaced_array, []);
      const matchSearch = 
        (s.work_description_text || '').toLowerCase().includes(serviceLogSearch.toLowerCase()) ||
        truckNum.toLowerCase().includes(serviceLogSearch.toLowerCase()) ||
        parts.some(p => p.toLowerCase().includes(serviceLogSearch.toLowerCase()));

      const matchTruck = serviceLogTruckFilter === 'all' || s.truck_id === serviceLogTruckFilter;

      return matchSearch && matchTruck;
    });
  }, [serviceLogs, trucks, serviceLogSearch, serviceLogTruckFilter]);

  const filteredInspectionLogs = useMemo(() => {
    return inspections.filter(i => {
      const truckObj = trucks.find(t => t.id === i.truck_id);
      const truckNum = truckObj ? truckObj.truck_number : '';
      
      const matchSearch = 
        (i.inspector_name || '').toLowerCase().includes(inspectionSearch.toLowerCase()) ||
        truckNum.toLowerCase().includes(inspectionSearch.toLowerCase()) ||
        (i.inspector_notes || '').toLowerCase().includes(inspectionSearch.toLowerCase());

      const matchTruck = inspectionTruckFilter === 'all' || i.truck_id === inspectionTruckFilter;

      return matchSearch && matchTruck;
    });
  }, [inspections, trucks, inspectionSearch, inspectionTruckFilter]);

  const exportServiceLogsToCSV = () => {
    const headers = ['Date', 'Truck Number', 'Work Description', 'Odometer (KM)', 'Cost (INR)', 'Parts Replaced'];
    const rows = filteredServiceLogs.map(s => {
      const truckObj = trucks.find(t => t.id === s.truck_id);
      const parts = parseJsonField(s.parts_replaced_array, []);
      const partsStr = parts.join('; ');
      return [
        s.maintenance_date ? format(new Date(s.maintenance_date), 'yyyy-MM-dd') : '-',
        truckObj ? truckObj.truck_number : 'N/A',
        s.work_description_text || '-',
        s.odometer_at_service || 0,
        s.cost_amount || 0,
        partsStr || '-'
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fleet_service_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Service logs exported to CSV!');
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    try {
      return format(d, 'MMM dd, yyyy');
    } catch (e) {
      return String(isoString);
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

      {/* Advanced Diagnostics Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-border/60 shadow-sm bg-card hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fleet Health</p>
              <p className="text-2xl font-black mt-1 text-foreground">{statsSummary.healthyTrucks}% <span className="text-xs font-medium text-emerald-600">Healthy</span></p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-border/60 shadow-sm bg-card hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-destructive/10 text-destructive rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Breakdown Issues</p>
              <p className="text-2xl font-black mt-1 text-foreground">{statsSummary.activeIssues} <span className="text-xs font-medium text-destructive">Open Tickets</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm bg-card hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-success/10 text-success rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Maintenance Spent</p>
              <p className="text-2xl font-black mt-1 text-foreground">₹{statsSummary.totalSpent.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm bg-card hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-warning/10 text-warning rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overdue Alerts</p>
              <p className="text-2xl font-black mt-1 text-foreground">{statsSummary.overdueCount} <span className="text-xs font-medium text-warning">Trucks Overdue</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-6 flex items-center justify-start overflow-x-auto w-full md:w-auto h-auto rounded-xl max-w-fit scrollbar-none flex-nowrap md:flex-wrap space-x-1">
          <TabsTrigger value="vehicles" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm shrink-0">
            <Truck className="w-4 h-4" /> Vehicles Roster
            <Badge variant="secondary" className="ml-1.5 opacity-70 bg-background">{trucks.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm shrink-0">
            <TrendingUp className="w-4 h-4" /> Diagnostics & Analytics
          </TabsTrigger>
          <TabsTrigger value="monthly_reminders" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm relative shrink-0">
            <Bell className="w-4 h-4" /> Monthly Reminders
            {monthlyReminders.filter(r => r.status === 'Pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {monthlyReminders.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="service_logs" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm shrink-0">
            <History className="w-4 h-4" /> Service Logs Ledger
            <Badge variant="secondary" className="ml-1.5 opacity-70 bg-background">{serviceLogs.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inspections" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm shrink-0">
            <ClipboardList className="w-4 h-4" /> Checklist Inspections
            <Badge variant="secondary" className="ml-1.5 opacity-70 bg-background">{inspections.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="problems" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm shrink-0">
            <AlertTriangle className="w-4 h-4" /> Reported Problems
            <Badge variant="secondary" className="ml-1.5 opacity-70 bg-background">{filteredProblems.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm shrink-0">
            <Package className="w-4 h-4" /> Inventory
            <Badge variant="secondary" className="ml-1.5 opacity-70 bg-background">{filteredInventory.length}</Badge>
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

                // Health Score calculation
                const truckIntervals = intervals.filter(i => i.truck_id === truck.id);
                const overdueIntervals = truckIntervals.filter(i => {
                  const lastServiced = Number(i.last_serviced_odometer) || 0;
                  const targetInt = Number(i.target_interval_kms) || 0;
                  return (lastServiced + targetInt) - liveOdometer < 0;
                });
                const healthScore = truckIntervals.length === 0 ? 100 : Math.round(((truckIntervals.length - overdueIntervals.length) / truckIntervals.length) * 100);

                return (
                  <div 
                    key={truck.id} 
                    onClick={() => { setSelectedTruck(truck); setDrawerTab('intervals'); }}
                    className="group bg-card border border-border/60 hover:border-primary/40 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1 relative"
                  >
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Nickname & Icon */}
                        <div className="flex items-center justify-between mb-2 text-muted-foreground">
                          <div className="flex items-center gap-2 group-hover:text-primary transition-colors text-xs font-semibold uppercase tracking-wider">
                            <Truck className="w-4 h-4" />
                            <span>{truck.truck_name || 'Unnamed Vehicle'}</span>
                          </div>
                          <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider",
                            healthScore === 100 ? "bg-emerald-500/10 text-emerald-400" :
                            healthScore >= 75 ? "bg-amber-500/10 text-amber-400" :
                            "bg-rose-500/10 text-rose-400"
                          )}>
                            Health: {healthScore}%
                          </span>
                        </div>

                        {/* Bold Registration Plate */}
                        <h3 className="font-heading font-extrabold text-2xl text-foreground tracking-wide font-mono">
                          {truck.truck_number}
                        </h3>

                        {/* Live Odometer */}
                        <div className="mt-3 flex items-baseline gap-1.5 justify-between">
                          <span className="text-xs text-muted-foreground font-medium">Live Odometer:</span>
                          <span className="text-sm font-bold text-foreground tabular-nums">
                            {liveOdometer.toLocaleString()} <span className="text-[10px] font-semibold text-muted-foreground">KMs</span>
                          </span>
                        </div>

                        {/* Health Progress bar */}
                        <div className="mt-3.5 space-y-1">
                          <div className="w-full bg-secondary/50 rounded-full h-1.25 overflow-hidden">
                            <div 
                              className={cn(
                                "h-1.25 rounded-full transition-all duration-500",
                                healthScore === 100 ? "bg-emerald-500" :
                                healthScore >= 75 ? "bg-amber-500" :
                                "bg-rose-500"
                              )} 
                              style={{ width: `${healthScore}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Service Status Due Badge */}
                      <div className="border-t border-border/30 pt-3.5 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Diagnostics</span>
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

        {/* TAB: Diagnostics & Analytics (Advanced) */}
        <TabsContent value="analytics" className="m-0 space-y-6">
          {/* Top Level Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-border/60 bg-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Predictive Security</p>
                  <p className="text-2xl font-black text-foreground mt-1">
                    {predictiveForecasts.filter(f => f.kmsRemaining < 0).length} Critical
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Overdue components needing immediate service.
                  </p>
                </div>
                <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-2xl">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
              </div>
            </Card>

            <Card className="border border-border/60 bg-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average Fleet Usage</p>
                  <p className="text-2xl font-black text-foreground mt-1">
                    {Math.round(trucks.reduce((sum, t) => sum + getAverageDailyKms(t.truck_number), 0) / (trucks.length || 1))} KM/day
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Daily aggregate running distance per vehicle.
                  </p>
                </div>
                <div className="p-3.5 bg-sky-500/10 text-sky-500 rounded-2xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="border border-border/60 bg-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next 30 Days Forecast</p>
                  <p className="text-2xl font-black text-foreground mt-1">
                    {predictiveForecasts.filter(f => f.daysRemaining !== null && f.daysRemaining >= 0 && f.daysRemaining <= 30).length} Tasks
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Service events predicted to fall due.
                  </p>
                </div>
                <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* Recharts Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Expenditure Trend */}
            <Card className="border border-border/60 bg-card rounded-2xl p-5 space-y-4">
              <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" /> Maintenance Cost Trend
              </h3>
              <div className="h-72 w-full">
                {monthlyCostData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                    No cost history recorded yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyCostData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="Amount" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCost)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* Chart 2: Fleet Health Status */}
            <Card className="border border-border/60 bg-card rounded-2xl p-5 space-y-4">
              <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Fleet Health Status
              </h3>
              <div className="h-72 flex flex-col sm:flex-row items-center justify-around gap-4">
                {healthBreakdownData.length === 0 ? (
                  <div className="text-muted-foreground text-sm italic">No health status available.</div>
                ) : (
                  <>
                    <div className="h-56 w-56 relative shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={healthBreakdownData}
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {healthBreakdownData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-foreground">
                          {statsSummary.healthyTrucks}%
                        </span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-0.5">
                          Health Index
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {healthBreakdownData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <div>
                            <span className="text-sm font-semibold text-foreground">{item.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({item.value} {item.value === 1 ? 'Truck' : 'Trucks'})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Chart 3: Cost by Vehicle */}
            <Card className="border border-border/60 bg-card rounded-2xl p-5 space-y-4 lg:col-span-2">
              <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> Top Maintenance Costs by Vehicle Registration
              </h3>
              <div className="h-72 w-full">
                {truckCostData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                    No vehicle expenditures logs.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={truckCostData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      />
                      <Bar dataKey="Amount" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>

          {/* Predictive Maintenance & Forecast Schedule */}
          <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="p-5 border-b border-border bg-muted/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-primary" /> Predictive Maintenance Forecast Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Component / Task</TableHead>
                      <TableHead className="text-right">Usage (Daily Run)</TableHead>
                      <TableHead className="text-right">KMs Remaining</TableHead>
                      <TableHead className="text-right">Estimated Days Left</TableHead>
                      <TableHead className="text-right">Forecasted Due Date</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictiveForecasts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground italic">
                          No service interval configurations found. Set them up inside the Vehicles Roster.
                        </TableCell>
                      </TableRow>
                    ) : (
                      predictiveForecasts.map(f => {
                        const isOverdue = f.kmsRemaining < 0;
                        const isSoon = f.daysRemaining !== null && f.daysRemaining >= 0 && f.daysRemaining <= 15;
                        
                        return (
                          <TableRow key={f.id} className="hover:bg-muted/5 transition-colors">
                            <TableCell className="font-bold text-foreground">{f.truckNumber}</TableCell>
                            <TableCell className="font-semibold">{f.component}</TableCell>
                            <TableCell className="text-right font-mono text-xs text-muted-foreground">{f.dailyKms} KM/day</TableCell>
                            <TableCell className={`text-right font-bold tabular-nums ${
                              isOverdue ? 'text-rose-500' : isSoon ? 'text-amber-500' : 'text-emerald-500'
                            }`}>
                              {isOverdue 
                                ? `-${Math.abs(f.kmsRemaining).toLocaleString()}` 
                                : f.kmsRemaining.toLocaleString()
                              } KMs
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {isOverdue ? (
                                <span className="text-rose-500 font-bold">Overdue</span>
                              ) : f.daysRemaining !== null ? (
                                `${f.daysRemaining} days`
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {isOverdue ? (
                                <span className="text-rose-500 font-bold">Immediate</span>
                              ) : (f.estDueDate && !isNaN(f.estDueDate.getTime())) ? (
                                format(f.estDueDate, 'MMM dd, yyyy')
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "capitalize font-bold text-[9px] px-2 py-0.5 rounded-full border-0",
                                  isOverdue ? 'bg-rose-500/15 text-rose-400' :
                                  isSoon ? 'bg-amber-500/15 text-amber-400' :
                                  'bg-emerald-500/15 text-emerald-400'
                                )}
                              >
                                {isOverdue ? 'Critical' : isSoon ? 'Caution' : 'Healthy'}
                              </Badge>
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
                              <div key={rem.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                                      {rem.reminder_date && !isNaN(new Date(rem.reminder_date).getTime()) 
                                        ? new Date(rem.reminder_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                                        : '—'
                                      }
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/20">
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

        {/* TAB 1.5: Service Logs Ledger */}
        <TabsContent value="service_logs" className="m-0 space-y-6 animate-in fade-in duration-300">
          <Card className="shadow-sm border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border/40 flex flex-wrap gap-4 items-center justify-between bg-muted/10">
              <div className="flex flex-wrap gap-4 items-center flex-1">
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search description or parts..." 
                    value={serviceLogSearch} 
                    onChange={e => setServiceLogSearch(e.target.value)} 
                    className="pl-9 h-10 rounded-xl bg-background border-border" 
                  />
                </div>
                <Select value={serviceLogTruckFilter} onValueChange={setServiceLogTruckFilter}>
                  <SelectTrigger className="w-[200px] h-10 rounded-xl bg-background border-border">
                    <SelectValue placeholder="All Trucks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vehicles</SelectItem>
                    {trucks.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.truck_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-2 hidden sm:block">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Spent (Filtered)</p>
                  <p className="text-lg font-black text-foreground">₹{filteredServiceLogs.reduce((sum, s) => sum + (s.cost_amount || 0), 0).toLocaleString()}</p>
                </div>
                <Button onClick={exportServiceLogsToCSV} variant="outline" className="h-10 rounded-xl shadow-sm hover:bg-muted font-bold text-xs gap-2">
                  <UploadCloud className="w-4 h-4" /> Export CSV
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Work Description</TableHead>
                    <TableHead>Parts Replaced</TableHead>
                    <TableHead className="text-right">Odometer</TableHead>
                    <TableHead className="text-right">Cost (INR)</TableHead>
                    <TableHead className="text-center">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServiceLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground italic">
                        No service logs match the filter criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServiceLogs.map(s => {
                      const truckObj = trucks.find(t => t.id === s.truck_id);
                      const parts = parseJsonField(s.parts_replaced_array, []);
                      const invoiceUrl = s.invoice_file ? pb.files.getUrl(s, s.invoice_file) : null;
                      
                      return (
                        <TableRow key={s.id} className="hover:bg-muted/5">
                          <TableCell className="font-mono text-xs">{formatDate(s.maintenance_date)}</TableCell>
                          <TableCell className="font-bold text-foreground">
                            {truckObj ? (
                              <button 
                                onClick={() => { setSelectedTruck(truckObj); setDrawerTab('logs'); }} 
                                className="hover:underline text-primary text-left"
                              >
                                {truckObj.truck_number}
                              </button>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell className="font-medium max-w-xs truncate" title={s.work_description_text}>{s.work_description_text}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {parts.length === 0 ? <span className="text-muted-foreground text-xs">—</span> : 
                                parts.map((p, idx) => (
                                  <Badge key={idx} variant="secondary" className="px-1.5 py-0 text-[9px] font-semibold bg-muted rounded-full">
                                    {p}
                                  </Badge>
                                ))
                              }
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">{s.odometer_at_service?.toLocaleString()} km</TableCell>
                          <TableCell className="text-right font-black tabular-nums text-foreground">₹{s.cost_amount?.toLocaleString()}</TableCell>
                          <TableCell className="text-center">
                            {invoiceUrl ? (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-primary hover:bg-primary/10 rounded-lg"
                                onClick={() => {
                                  if (s.invoice_file.endsWith('.pdf')) {
                                    window.open(invoiceUrl, '_blank');
                                  } else {
                                    setActiveLightboxImage(invoiceUrl);
                                  }
                                }}
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            ) : <span className="text-muted-foreground/30 text-xs">—</span>}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 1.6: Checklist Inspections */}
        <TabsContent value="inspections" className="m-0 space-y-6 animate-in fade-in duration-300">
          <Card className="shadow-sm border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border/40 flex flex-wrap gap-4 items-center justify-between bg-muted/10">
              <div className="flex flex-wrap gap-4 items-center flex-1">
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search inspector or notes..." 
                    value={inspectionSearch} 
                    onChange={e => setInspectionSearch(e.target.value)} 
                    className="pl-9 h-10 rounded-xl bg-background border-border" 
                  />
                </div>
                <Select value={inspectionTruckFilter} onValueChange={setInspectionTruckFilter}>
                  <SelectTrigger className="w-[200px] h-10 rounded-xl bg-background border-border">
                    <SelectValue placeholder="All Trucks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vehicles</SelectItem>
                    {trucks.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.truck_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Status Checks Summary</TableHead>
                    <TableHead>Inspector Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInspectionLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                        No inspection logs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInspectionLogs.map(i => {
                      const truckObj = trucks.find(t => t.id === i.truck_id);
                      const toggles = parseJsonField(i.pass_fail_toggles, {});
                      
                      return (
                        <TableRow key={i.id} className="hover:bg-muted/5">
                          <TableCell className="font-mono text-xs">{formatDate(i.inspection_date)}</TableCell>
                          <TableCell className="font-bold text-foreground">
                            {truckObj ? (
                              <button 
                                onClick={() => { setSelectedTruck(truckObj); setDrawerTab('inspections'); }} 
                                className="hover:underline text-primary text-left"
                              >
                                {truckObj.truck_number}
                              </button>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell className="font-semibold">{i.inspector_name}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-sm">
                              {Object.entries(toggles).slice(0, 4).map(([k, v]) => (
                                <Badge 
                                  key={k} 
                                  variant="outline" 
                                  className={cn(
                                    "capitalize font-bold text-[9px] px-1.5 py-0.5",
                                    getChecklistBadgeClass(v)
                                  )}
                                >
                                  {getChecklistLabel(k, v)}
                                </Badge>
                              ))}
                              {Object.keys(toggles).length > 4 && (
                                <Badge variant="outline" className="text-[9px] bg-secondary text-secondary-foreground font-bold px-1.5 py-0.5">
                                  +{Object.keys(toggles).length - 4} More
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground italic max-w-xs truncate" title={i.inspector_notes}>
                            {i.inspector_notes || '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
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
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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

            {/* Mobile Card Stack View */}
            <div className="block md:hidden divide-y divide-border/30">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : filteredInventory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">No inventory items found.</div>
              ) : (
                filteredInventory.map(item => {
                  const isLow = item.current_stock <= item.reorder_level;
                  return (
                    <div key={item.id} className={cn("p-4 space-y-2.5", isLow ? "bg-destructive/5" : "")}>
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{item.item_name}</h4>
                          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">{item.category}</span>
                        </div>
                        {isLow && <Badge variant="destructive" className="text-[9px] uppercase font-bold">Low Stock</Badge>}
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-border/20 pt-2 text-muted-foreground">
                        <div>
                          <span className="text-[10px]">Current Stock</span>
                          <p className={cn("text-sm font-extrabold mt-0.5", isLow ? "text-rose-400" : "text-foreground")}>
                            {item.current_stock} <span className="text-[10px] font-normal text-muted-foreground">{item.unit}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px]">Reorder Min</span>
                          <p className="text-sm font-bold text-foreground mt-0.5">{item.reorder_level}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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

            {/* Mobile Card Stack View */}
            <div className="block md:hidden divide-y divide-border/30">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : filteredProblems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">No reported problems matching filters.</div>
              ) : (
                filteredProblems.map(prob => (
                  <div key={prob.id} className="p-4 space-y-2.5">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="font-mono font-bold text-[10px]">{prob.truck_id}</Badge>
                          <span className="text-[10px] text-muted-foreground">({prob.category})</span>
                        </div>
                        <p className="text-xs text-foreground mt-1.5 font-medium leading-normal">{prob.description}</p>
                      </div>
                      <Badge className={prob.status === 'Open' ? 'bg-warning/20 text-warning border-0 text-[9px] font-bold' : 'bg-success/20 text-success border-0 text-[9px] font-bold'}>
                        {prob.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-border/20 pt-2">
                      <span>Reported: {formatDate(prob.date_reported)}</span>
                      <Badge variant="secondary" className={cn(
                        "text-[9px] font-bold uppercase tracking-wider",
                        prob.severity === 'Critical' || prob.severity === 'High' ? 'bg-destructive/20 text-destructive border-0' : 'bg-muted text-muted-foreground border-0'
                      )}>
                        {prob.severity}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DETAILED WORKSPACE DRAWER (SLIDE-OUT SHEET) */}
      {selectedTruck && (() => {
        const lifetimeCost = serviceLogs.filter(s => s.truck_id === selectedTruck.id).reduce((sum, s) => sum + (s.cost_amount || 0), 0);
        const logsCount = serviceLogs.filter(s => s.truck_id === selectedTruck.id).length;
        const activeBreakdowns = problems.filter(p => p.truck_id === selectedTruck.truck_number && p.status === 'Open').length;

        return (
          <Sheet open={!!selectedTruck} onOpenChange={(open) => !open && setSelectedTruck(null)}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-card border-l border-border shadow-2xl p-6">
              <SheetHeader className="mb-4 pb-4 border-b border-border/50">
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

                {/* Lifetime Financial Snapshot */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/30">
                  <div className="bg-muted/10 border border-border/20 rounded-xl p-3 text-center">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Maintenance Cost</span>
                    <span className="text-sm font-black text-foreground mt-1 block">₹{lifetimeCost.toLocaleString()}</span>
                  </div>
                  <div className="bg-muted/10 border border-border/20 rounded-xl p-3 text-center">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Service Events</span>
                    <span className="text-sm font-black text-foreground mt-1 block">{logsCount} logs</span>
                  </div>
                  <div className="bg-muted/10 border border-border/20 rounded-xl p-3 text-center">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Active Breakdowns</span>
                    <span className={cn("text-sm font-black mt-1 block", activeBreakdowns > 0 ? "text-rose-400" : "text-emerald-400")}>
                      {activeBreakdowns} unresolved
                    </span>
                  </div>
                </div>
              </SheetHeader>

              <Tabs value={drawerTab} onValueChange={setDrawerTab} className="w-full space-y-6">
                <TabsList className="flex items-center justify-start overflow-x-auto w-full h-auto bg-muted/40 p-1 rounded-xl scrollbar-none flex-nowrap space-x-1">
                  <TabsTrigger value="intervals" className="gap-1.5 py-2 px-3.5 rounded-lg text-xs shrink-0 data-[state=active]:shadow-sm">
                    <Sliders className="w-3.5 h-3.5" /> Intervals
                  </TabsTrigger>
                  <TabsTrigger value="inspections" className="gap-1.5 py-2 px-3.5 rounded-lg text-xs shrink-0 data-[state=active]:shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" /> Inspections
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="gap-1.5 py-2 px-3.5 rounded-lg text-xs shrink-0 data-[state=active]:shadow-sm">
                    <History className="w-3.5 h-3.5" /> Logs
                  </TabsTrigger>
                  <TabsTrigger value="problems" className="gap-1.5 py-2 px-3.5 rounded-lg text-xs shrink-0 relative data-[state=active]:shadow-sm">
                    <AlertTriangle className="w-3.5 h-3.5" /> Issues
                    {activeBreakdowns > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center">
                        {activeBreakdowns}
                      </span>
                    )}
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
                        const lastServiced = Number(i.last_serviced_odometer) || 0;
                        const targetInt = Number(i.target_interval_kms) || 0;

                        const kmsRemaining = (lastServiced + targetInt) - liveOdo;
                        const kmsDriven = liveOdo - lastServiced;
                        const percent = targetInt === 0 ? 0 : Math.min(100, Math.max(0, (kmsDriven / targetInt) * 100));
                        const isOverdue = kmsRemaining < 0;

                        return (
                          <div key={i.id} className="p-4 rounded-xl border border-border bg-card/40 space-y-2 relative group/item">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-bold text-foreground">{i.component_name}</h5>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  Config: Every {targetInt.toLocaleString()} KMs (Last Serviced: {lastServiced.toLocaleString()} KMs)
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            <div key={item.key} className="flex flex-col gap-2 p-3 rounded-xl border border-border bg-background/50 animate-in fade-in duration-200">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <span className="text-xs font-bold text-foreground capitalize">{item.label}</span>
                                <div className="flex gap-1.5 w-full sm:w-auto">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextChecklist = { ...newInspection.checklist, [item.key]: 'pass' };
                                      setNewInspection({ ...newInspection, checklist: nextChecklist });
                                    }}
                                    className={cn(
                                      "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border text-center",
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
                                      "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border text-center",
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
                        const toggles = parseJsonField(i.pass_fail_toggles, {});
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
                        const parts = parseJsonField(s.parts_replaced_array, []);
                        const invoiceUrl = s.invoice_file ? pb.files.getUrl(s, s.invoice_file) : null;

                        return (
                          <div key={s.id} className="relative group/item">
                            {/* Bullet indicator */}
                            <span className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-background bg-primary ring-2 ring-primary/20 shrink-0" />
                            
                            <div className="p-4 rounded-xl border border-border bg-card/40 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2.5">
                                <div className="space-y-0.5">
                                  <p className="text-xs font-semibold font-mono text-muted-foreground">{formatDate(s.maintenance_date)}</p>
                                  <h5 className="font-bold text-foreground leading-snug">{s.work_description_text}</h5>
                                </div>
                                <div className="text-left sm:text-right shrink-0">
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

              {/* DRAWER TAB 4: Active vehicle problems specific to selected truck */}
              <TabsContent value="problems" className="m-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm uppercase font-bold text-muted-foreground tracking-wider">Reported Issues Ledger</h4>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedTruck(null);
                        setActiveTab('problems');
                        setFilters(prev => ({ ...prev, truck_id: selectedTruck.truck_number, problemStatus: 'Open' }));
                      }}
                      className="rounded-lg text-xs h-8"
                    >
                      Manage Tickets
                    </Button>
                  </div>
                  {problems.filter(p => p.truck_id === selectedTruck.truck_number).length === 0 ? (
                    <p className="text-sm italic text-muted-foreground/60 text-center py-6 border border-dashed border-border/40 rounded-2xl bg-muted/5">
                      No problems reported for this truck registration.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {problems.filter(p => p.truck_id === selectedTruck.truck_number).map(prob => {
                        const isDone = prob.status === 'Resolved';
                        const isHigh = prob.severity === 'High' || prob.severity === 'Critical';

                        return (
                          <div key={prob.id} className="p-4 rounded-xl border border-border bg-card/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group/item relative">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "capitalize font-bold text-[9px]",
                                    isDone ? 'bg-success/10 text-success border-0' :
                                    isHigh ? 'bg-destructive/10 text-destructive border-0' :
                                    'bg-amber-500/10 text-amber-500 border-0'
                                  )}
                                >
                                  {prob.severity}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground font-semibold">({prob.category})</span>
                              </div>
                              <p className={`text-sm font-semibold leading-normal ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {prob.description}
                              </p>
                              <p className="text-[10px] text-muted-foreground/60">Reported: {formatDate(prob.date_reported)}</p>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                                isDone ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' : 'bg-amber-500/10 text-amber-400 border-amber-500/10'
                              }`}>
                                {prob.status}
                              </span>
                              {!isDone && (
                                <Button 
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      await pb.collection('maintenance_problems').update(prob.id, { status: 'Resolved' }, { $autoCancel: false });
                                      toast.success('Ticket marked as resolved');
                                      fetchData();
                                    } catch (e) {
                                      toast.error('Failed to resolve ticket');
                                    }
                                  }}
                                  className="h-7 px-2.5 text-[10px] rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                                >
                                  Resolve
                                </Button>
                              )}
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
      )})()}

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