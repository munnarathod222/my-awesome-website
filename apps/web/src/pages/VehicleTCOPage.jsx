import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Truck, DollarSign, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle2, RefreshCw, Download, Filter, Search, Info, 
  HelpCircle, Calculator, PieChart as PieIcon, LineChart as LineIcon,
  Layers, ShieldAlert, ArrowRight, Printer, Sparkles, Building2, Wrench, Fuel, Pencil
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { calculateVehicleTCO, calculateFleetTCOSummary } from '@/lib/tcoUtils.js';
import EditTruckTCOModal from '@/components/EditTruckTCOModal.jsx';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Area
} from 'recharts';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EF4444'];

export default function VehicleTCOPage() {
  const [trucks, setTrucks] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [tripLogs, setTripLogs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedTruckId, setSelectedTruckId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSignal, setFilterSignal] = useState('ALL'); // 'ALL' | 'REPLACE_NOW' | 'PLAN' | 'MAINTAIN'

  // Edit TCO Modal State
  const [editingTCO, setEditingTCO] = useState(null);
  const [isEditTCOModalOpen, setIsEditTCOModalOpen] = useState(false);

  // Interactive Simulator State
  const [simPurchasePrice, setSimPurchasePrice] = useState(3200000);
  const [simSalvageValue, setSimSalvageValue] = useState(650000);
  const [simBreakdownDays, setSimBreakdownDays] = useState(12);
  const [simDailyRevenue, setSimDailyRevenue] = useState(5000);
  const [simAnnualMaint, setSimAnnualMaint] = useState(120000);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [trucksRes, fuelRes, maintRes, expRes, tripsRes] = await Promise.all([
        pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false }),
        pb.collection('fuel_tracker').getFullList({ $autoCancel: false }),
        pb.collection('maintenance_logs').getFullList({ $autoCancel: false }).catch(() => []),
        pb.collection('expenses').getFullList({ $autoCancel: false }).catch(() => []),
        pb.collection('trip_logs').getFullList({ $autoCancel: false }).catch(() => [])
      ]);

      setTrucks(trucksRes || []);
      setFuelLogs(fuelRes || []);
      setMaintenanceLogs(maintRes || []);
      setExpenses(expRes || []);
      setTripLogs(tripsRes || []);

      if (trucksRes && trucksRes.length > 0) {
        setSelectedTruckId(trucksRes[0].id);
      }
    } catch (err) {
      console.error('Failed to load TCO & ROI analytics data:', err);
      toast.error('Failed to load fleet TCO & ROI data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute TCO & ROI for all trucks
  const vehicleTCOList = useMemo(() => {
    return trucks.map(truck => calculateVehicleTCO(truck, fuelLogs, maintenanceLogs, expenses, tripLogs));
  }, [trucks, fuelLogs, maintenanceLogs, expenses, tripLogs]);

  // Compute Fleet Aggregates
  const fleetSummary = useMemo(() => {
    return calculateFleetTCOSummary(vehicleTCOList);
  }, [vehicleTCOList]);

  // Filtered Vehicle TCO List
  const filteredTCOList = useMemo(() => {
    return vehicleTCOList.filter(v => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (v.truckNumber || '').toLowerCase().includes(q) || (v.manufacturer || '').toLowerCase().includes(q);
      const matchesSignal = filterSignal === 'ALL' || v.replacementSignal === filterSignal;
      return matchesSearch && matchesSignal;
    });
  }, [vehicleTCOList, searchQuery, filterSignal]);

  // Selected Truck TCO for Deep Dive
  const selectedVehicleTCO = useMemo(() => {
    if (selectedTruckId === 'all') return vehicleTCOList[0] || null;
    return vehicleTCOList.find(v => v.truckId === selectedTruckId) || vehicleTCOList[0] || null;
  }, [vehicleTCOList, selectedTruckId]);

  // Donut Chart Data for Selected Truck
  const costBreakdownChartData = useMemo(() => {
    if (!selectedVehicleTCO) return [];
    return [
      { name: 'Initial Purchase (CapEx)', value: selectedVehicleTCO.totalCapEx },
      { name: 'Fuel Expenses', value: selectedVehicleTCO.totalFuelCost },
      { name: 'Maintenance & Repairs', value: selectedVehicleTCO.totalMaintenanceCost },
      { name: 'Insurance & RTO Taxes', value: selectedVehicleTCO.totalInsuranceCost },
      { name: 'Downtime Loss Revenue', value: selectedVehicleTCO.totalDowntimeCost }
    ];
  }, [selectedVehicleTCO]);

  // Simulator TCO Result
  const simulatorResult = useMemo(() => {
    const totalCapEx = simPurchasePrice;
    const estAgeYears = 5;
    const estDistance = 300000;
    const fuelCost = estDistance * 18; // ~₹18/km
    const maintCost = simAnnualMaint * estAgeYears;
    const insuranceCost = 45000 * estAgeYears;
    const downtimeCost = simBreakdownDays * simDailyRevenue * estAgeYears;
    
    const opEx = fuelCost + maintCost + insuranceCost + downtimeCost;
    const netTCO = totalCapEx + opEx - simSalvageValue;
    const cpkm = Number((netTCO / estDistance).toFixed(2));

    const annualMaintDowntime = (maintCost + downtimeCost) / estAgeYears;
    const maintRatio = annualMaintDowntime / simSalvageValue;

    let signal = 'MAINTAIN';
    let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    let title = '🟢 Keep & Maintain';
    if (maintRatio >= 0.40) {
      signal = 'REPLACE_NOW';
      badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      title = '🔴 Sell / Replace Now';
    } else if (maintRatio >= 0.25) {
      signal = 'PLAN';
      badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      title = '🟡 Plan Replacement (6-12 Months)';
    }

    return {
      netTCO,
      cpkm,
      maintRatio: (maintRatio * 100).toFixed(1),
      signal,
      badgeColor,
      title,
      opEx,
      fuelCost,
      maintCost,
      downtimeCost
    };
  }, [simPurchasePrice, simSalvageValue, simBreakdownDays, simDailyRevenue, simAnnualMaint]);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans print:p-0 print:max-w-none">
      <Helmet>
        <title>Vehicle TCO & ROI Analytics | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-6 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5" style={{letterSpacing: '-0.02em'}}>
            <Calculator className="w-8 h-8 text-primary" /> Vehicle TCO & ROI Analytics
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono">
              📊 Profitability & Payback
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Total Cost of Ownership (CapEx + Fuel + Maint) vs Trip Revenue Yield & Return on Investment (ROI).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} className="rounded-xl border-border/80 text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refresh Analytics
          </Button>
          <Button onClick={handlePrintReport} className="rounded-xl shadow-md">
            <Printer className="w-4 h-4 mr-2" /> Print TCO & ROI Report
          </Button>
        </div>
      </div>

      {/* Top Fleet Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 print:grid-cols-5">
        <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fleet Trip Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-400 opacity-80" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-28" /> : (
              <div className="text-2xl font-extrabold font-mono text-emerald-400">
                ₹{fleetSummary.totalFleetRevenue.toLocaleString('en-IN')}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">Total completed trip earnings</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fleet Net TCO</CardTitle>
            <DollarSign className="w-4 h-4 text-blue-500 opacity-80" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-28" /> : (
              <div className="text-2xl font-extrabold font-mono text-blue-400">
                ₹{fleetSummary.totalFleetTCO.toLocaleString('en-IN')}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">CapEx + Fuel + Maint - Salvage</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-violet-500" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fleet Net Profit & ROI</CardTitle>
            <Sparkles className="w-4 h-4 text-purple-400 opacity-80" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-28" /> : (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold font-mono text-purple-400">
                  ₹{(fleetSummary.totalFleetNetProfit / 100000).toFixed(1)}L
                </span>
                <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30 font-mono font-bold">
                  +{fleetSummary.avgFleetROI}% ROI
                </Badge>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">Net profit after total operating costs</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit Economics (RPKM / CPKM)</CardTitle>
            <Calculator className="w-4 h-4 text-cyan-400 opacity-80" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-xl font-extrabold font-mono text-cyan-400">
                ₹{fleetSummary.avgFleetRPKM} <span className="text-xs font-normal text-muted-foreground">vs ₹{fleetSummary.avgFleetCPKM}</span>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">Revenue per KM vs Net Cost per KM</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Replace Signal & Equity</CardTitle>
            <ShieldAlert className="w-4 h-4 text-rose-500 opacity-80" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-rose-400">{fleetSummary.replaceNowCount}</span>
                <span className="text-xs text-amber-400 font-semibold">({fleetSummary.planCount} Plan)</span>
                <span className="text-[11px] font-mono text-muted-foreground ml-auto">₹{(fleetSummary.totalFleetSalvageValue / 100000).toFixed(1)}L Resale</span>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">Vehicles past economic tipping point</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Layout */}
      <Tabs defaultValue="fleet" className="space-y-6">
        <TabsList className="bg-muted/65 p-1 rounded-xl w-full sm:w-auto grid grid-cols-3 max-w-[500px] print:hidden">
          <TabsTrigger value="fleet" className="rounded-lg py-2 text-xs sm:text-sm font-semibold">Fleet TCO Comparison</TabsTrigger>
          <TabsTrigger value="deepdive" className="rounded-lg py-2 text-xs sm:text-sm font-semibold">Vehicle Deep-Dive</TabsTrigger>
          <TabsTrigger value="simulator" className="rounded-lg py-2 text-xs sm:text-sm font-semibold">What-If TCO Simulator</TabsTrigger>
        </TabsList>

        {/* Tab 1: Fleet TCO Comparison Grid */}
        <TabsContent value="fleet" className="space-y-6 outline-none animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/60 p-4 rounded-2xl border border-border/50 backdrop-blur-md print:hidden">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search vehicle number or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Filter Signal:</span>
              <Select value={filterSignal} onValueChange={setFilterSignal}>
                <SelectTrigger className="w-[180px] bg-background h-9 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Signals ({vehicleTCOList.length})</SelectItem>
                  <SelectItem value="REPLACE_NOW">🔴 Sell / Replace Now ({fleetSummary.replaceNowCount})</SelectItem>
                  <SelectItem value="PLAN">🟡 Plan Replacement ({fleetSummary.planCount})</SelectItem>
                  <SelectItem value="MAINTAIN">🟢 Keep & Maintain ({fleetSummary.maintainCount})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="bg-card/60 border border-border/50 overflow-hidden backdrop-blur-md">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-b-border/40">
                    <TableHead className="font-semibold text-muted-foreground pl-6 py-4">Vehicle & Model</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4">Age & Mileage</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4 text-right">CapEx (₹)</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4 text-right">Net TCO (₹)</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4 text-right">Trip Revenue (₹)</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4 text-right text-amber-500">Op Expenses (₹)</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4 text-right text-emerald-500">Net Profit (₹)</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4 text-right">ROI (%)</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4 text-right">RPKM vs Op-CPKM</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4 text-right">Tipping Signal</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4 text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="pl-6 py-4"><Skeleton className="h-5 w-28 mb-1" /><Skeleton className="h-3 w-20" /></TableCell>
                        <TableCell className="py-4"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="py-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                        <TableCell className="py-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                        <TableCell className="py-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                        <TableCell className="py-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                        <TableCell className="py-4 text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                        <TableCell className="py-4 text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        <TableCell className="py-4 text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        <TableCell className="py-4 text-right"><Skeleton className="h-7 w-32 ml-auto rounded-md" /></TableCell>
                        <TableCell className="py-4 text-right pr-6"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredTCOList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-48 text-center text-muted-foreground">
                        <Truck className="w-10 h-10 opacity-30 mx-auto mb-2" />
                        No vehicles found matching criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTCOList.map(v => (
                      <TableRow key={v.truckId} className="hover:bg-muted/20 transition-colors border-b-border/30">
                        <TableCell className="pl-6 py-4">
                          <div className="font-bold text-base text-foreground flex items-center gap-1.5">
                            {v.truckNumber}
                          </div>
                          <div className="text-xs text-muted-foreground">{v.manufacturer} • {v.model}</div>
                        </TableCell>

                        <TableCell className="py-4 text-xs">
                          <div className="font-semibold text-foreground">{v.vehicleAgeYears} Yrs Old</div>
                          <div className="text-muted-foreground font-mono">{v.totalDistanceKm.toLocaleString()} KMs</div>
                        </TableCell>

                        <TableCell className="py-4 text-right font-mono text-xs text-muted-foreground">
                          ₹{(v.totalCapEx / 100000).toFixed(2)}L
                        </TableCell>

                        <TableCell className="py-4 text-right font-mono font-bold text-sm text-blue-400">
                          ₹{(v.netTCO / 100000).toFixed(2)}L
                        </TableCell>

                        <TableCell className="py-4 text-right font-mono font-bold text-sm text-emerald-400">
                          ₹{(v.totalTripRevenue / 100000).toFixed(2)}L
                          <span className="block text-[10px] text-muted-foreground font-normal">{v.totalTripsCount} trips</span>
                        </TableCell>

                        <TableCell className="py-4 text-right font-mono font-bold text-sm text-amber-500">
                          ₹{(v.totalOperatingCost / 100000).toFixed(2)}L
                        </TableCell>

                        <TableCell className="py-4 text-right font-mono font-extrabold text-sm text-emerald-500">
                          {v.netProfit >= 0 ? `+₹${(v.netProfit / 100000).toFixed(2)}L` : `-₹${(Math.abs(v.netProfit) / 100000).toFixed(2)}L`}
                        </TableCell>

                        <TableCell className="py-4 text-right">
                          <Badge variant="outline" className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg border ${v.roiBadgeColor}`}>
                            {v.roiPercent >= 0 ? `+${v.roiPercent}%` : `${v.roiPercent}%`}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-4 text-right font-mono text-xs">
                          <div className="font-bold text-emerald-400">₹{v.revenuePerKm}/km</div>
                          <div className="text-amber-500 font-medium">vs ₹{v.operatingCostPerKm}/km</div>
                        </TableCell>

                        <TableCell className="py-4 text-right">
                          <Badge variant="outline" className={`font-bold px-2.5 py-0.5 text-xs rounded-lg border ${v.signalBadgeColor}`}>
                            {(v?.signalTitle || '').split(' ')[0]} {v.replacementSignal}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-4 text-right pr-6">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingTCO(v);
                              setIsEditTCOModalOpen(true);
                            }}
                            className="h-8 px-2 text-xs rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                            title="Edit TCO / Revenue Values"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Vehicle Deep-Dive & Visual Curves */}
        <TabsContent value="deepdive" className="space-y-6 outline-none animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/60 p-4 rounded-2xl border border-border/50 backdrop-blur-md">
            <div className="space-y-1">
              <Label className="font-bold text-sm">Select Vehicle for TCO Deep-Dive:</Label>
              <Select value={selectedTruckId} onValueChange={setSelectedTruckId}>
                <SelectTrigger className="w-[280px] bg-background h-11 font-bold text-base rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTCOList.map(v => (
                    <SelectItem key={v.truckId} value={v.truckId}>
                      <div className="flex items-center justify-between w-full gap-3">
                        <span className="font-bold">{v.truckNumber}</span>
                        <span className="text-xs text-muted-foreground">{(v?.signalTitle || '').split(' ')[0]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedVehicleTCO && (
              <div className="flex flex-wrap items-center gap-3">
                <Button 
                  onClick={() => {
                    setEditingTCO(selectedVehicleTCO);
                    setIsEditTCOModalOpen(true);
                  }}
                  className="rounded-xl shadow-sm"
                >
                  <Pencil className="w-4 h-4 mr-2" /> Edit TCO Values
                </Button>
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${selectedVehicleTCO.signalBadgeColor}`}>
                  <div>
                    <div className="font-extrabold text-sm flex items-center gap-1.5">
                      {selectedVehicleTCO.signalTitle}
                    </div>
                    <div className="text-xs opacity-90 max-w-md mt-0.5">
                      {selectedVehicleTCO.signalReason}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedVehicleTCO && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cost Breakdown Donut Chart */}
              <Card className="bg-card/60 border border-border/50 p-4 backdrop-blur-md lg:col-span-1">
                <CardHeader className="p-2 pb-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-primary" /> Cost Share Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs">
                    CapEx vs OpEx distribution for {selectedVehicleTCO.truckNumber}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costBreakdownChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {costBreakdownChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Cost']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 pt-2 text-xs border-t border-border/40">
                    {costBreakdownChartData.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                          {item.name}
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          ₹{item.value.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* TCO & Economic Tipping Point Curve Chart */}
              <Card className="bg-card/60 border border-border/50 p-4 backdrop-blur-md lg:col-span-2">
                <CardHeader className="p-2 pb-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <LineIcon className="w-4 h-4 text-emerald-400" /> Economic Tipping Point & Operating Cost Curve
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Cumulative OpEx growth vs Vehicle Resale Asset Depreciation over 10-Year lifecycle
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={selectedVehicleTCO.yearlyTrend} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
                        <Tooltip 
                          formatter={(val, name) => [`₹${Number(val).toLocaleString('en-IN')}`, name]}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Area type="monotone" dataKey="cumulativeOpEx" name="Cum. Operating Cost (₹)" fill="#3B82F6" fillOpacity={0.15} stroke="#3B82F6" />
                        <Bar dataKey="maintenanceCost" name="Annual Maintenance & Downtime (₹)" fill="#F59E0B" barSize={16} radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="resaleValue" name="Asset Resale Market Value (₹)" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 p-3 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>
                        Current CPKM: <strong className="font-mono text-primary text-sm">₹{selectedVehicleTCO.costPerKm} / km</strong> | 
                        Maintenance Equity Ratio: <strong className="font-mono text-amber-400 text-sm">{selectedVehicleTCO.maintenanceRatio}%</strong>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Interactive What-If TCO Simulator */}
        <TabsContent value="simulator" className="space-y-6 outline-none animate-in fade-in-50 duration-200">
          <Card className="bg-card/60 border border-border/50 p-6 backdrop-blur-md">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Interactive TCO & Replacement Signal What-If Simulator
              </CardTitle>
              <CardDescription className="text-xs">
                Adjust purchase cost, annual maintenance escalation, breakdown downtime, and resale value to simulate vehicle replacement tipping points in real-time.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/20 rounded-2xl border border-border/50">
                {/* Sliders / Inputs */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Vehicle Purchase Price (CapEx ₹):</span>
                      <span className="font-mono font-bold text-primary">₹{simPurchasePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <Slider 
                      value={[simPurchasePrice]} 
                      min={1000000} 
                      max={6000000} 
                      step={50000}
                      onValueChange={([val]) => setSimPurchasePrice(val)} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Estimated Resale / Salvage Value (₹):</span>
                      <span className="font-mono font-bold text-emerald-400">₹{simSalvageValue.toLocaleString('en-IN')}</span>
                    </div>
                    <Slider 
                      value={[simSalvageValue]} 
                      min={200000} 
                      max={2500000} 
                      step={25000}
                      onValueChange={([val]) => setSimSalvageValue(val)} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Annual Planned Maintenance & Repairs (₹):</span>
                      <span className="font-mono font-bold text-amber-400">₹{simAnnualMaint.toLocaleString('en-IN')}</span>
                    </div>
                    <Slider 
                      value={[simAnnualMaint]} 
                      min={30000} 
                      max={400000} 
                      step={5000}
                      onValueChange={([val]) => setSimAnnualMaint(val)} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Breakdown Days / Year</Label>
                      <Input 
                        type="number"
                        min="0"
                        max="60"
                        value={simBreakdownDays}
                        onChange={(e) => setSimBreakdownDays(Number(e.target.value))}
                        className="bg-background font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Lost Trip Revenue / Day (₹)</Label>
                      <Input 
                        type="number"
                        min="0"
                        step="500"
                        value={simDailyRevenue}
                        onChange={(e) => setSimDailyRevenue(Number(e.target.value))}
                        className="bg-background font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Simulation Output Box */}
                <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
                  <div>
                    <Badge variant="outline" className={`font-bold px-3 py-1 text-sm rounded-lg border ${simulatorResult.badgeColor}`}>
                      {simulatorResult.title}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Maintenance & Downtime Equity Ratio: <strong className="font-mono text-foreground text-sm">{simulatorResult.maintRatio}%</strong>
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Simulated Net TCO:</span>
                      <span className="font-mono font-extrabold text-xl text-foreground">₹{simulatorResult.netTCO.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Simulated CPKM:</span>
                      <span className="font-mono font-bold text-lg text-primary">₹{simulatorResult.cpkm} / km</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Total Operating Costs:</span>
                      <span className="font-mono font-semibold text-foreground">₹{simulatorResult.opEx.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-xl border border-border/40 text-[11px] text-muted-foreground">
                    💡 <em>When maintenance ratio surpasses 40% of asset resale equity, capital replacement financing costs less than continuing repairs.</em>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Truck TCO Modal */}
      <EditTruckTCOModal 
        isOpen={isEditTCOModalOpen}
        onClose={() => setIsEditTCOModalOpen(false)}
        truckTCO={editingTCO}
        onSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
}
