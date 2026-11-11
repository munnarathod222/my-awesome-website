import React, { useState, useMemo } from 'react';
import { 
  Truck, Calculator, TrendingUp, TrendingDown, Target, 
  HelpCircle, Sparkles, Filter, Search, ChevronRight, AlertCircle, CheckCircle2,
  Sliders, ShieldCheck, DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { calculateTruckBreakEven, calculateFleetBreakEvenSummary } from '@/lib/breakEvenUtils.js';

export default function TruckBreakEvenCalculator({ trucks = [], tripLogs = [], expenses = [] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Simulation State for Selected Truck
  const [selectedTruckId, setSelectedTruckId] = useState(trucks[0]?.id || '');
  const [simEmi, setSimEmi] = useState(33410);
  const [simDriverSalary, setSimDriverSalary] = useState(20000);
  const [simTripRevenue, setSimTripRevenue] = useState(25000);
  const [simVariableCost, setSimVariableCost] = useState(14500);
  const [simTargetProfit, setSimTargetProfit] = useState(0);

  // Compute break-even metrics for all vehicles
  const truckBreakEvenList = useMemo(() => {
    return trucks.map(truck => calculateTruckBreakEven(truck, tripLogs, expenses));
  }, [trucks, tripLogs, expenses]);

  // Compute fleet-level summary
  const fleetSummary = useMemo(() => {
    return calculateFleetBreakEvenSummary(truckBreakEvenList);
  }, [truckBreakEvenList]);

  // Filtered vehicles
  const filteredList = useMemo(() => {
    return truckBreakEvenList.filter(item => {
      const matchSearch = !search || 
        item.truckNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.driverName.toLowerCase().includes(search.toLowerCase()) ||
        item.truckType.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || item.statusKey === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [truckBreakEvenList, search, statusFilter]);

  // Current selected vehicle for what-if simulation
  const selectedTruck = useMemo(() => {
    return trucks.find(t => t.id === selectedTruckId) || trucks[0];
  }, [trucks, selectedTruckId]);

  // Simulated metrics for selected vehicle
  const simulatedBreakEven = useMemo(() => {
    if (!selectedTruck) return null;
    return calculateTruckBreakEven(selectedTruck, tripLogs, expenses, {
      monthlyEmi: simEmi,
      driverSalary: simDriverSalary,
      avgTripRevenue: simTripRevenue,
      avgTripVariableCost: simVariableCost,
      targetProfit: simTargetProfit
    });
  }, [selectedTruck, tripLogs, expenses, simEmi, simDriverSalary, simTripRevenue, simVariableCost, simTargetProfit]);

  // Sync simulator defaults when selected truck changes
  const handleSelectTruckForSim = (truckId) => {
    setSelectedTruckId(truckId);
    const target = trucks.find(t => t.id === truckId);
    if (target) {
      setSimEmi(Number(target.monthly_emi || target.emi_amount || 33410));
      setSimDriverSalary(Number(target.driver_salary || 20000));
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Top KPI Summary Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/60 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fleet Fixed Overhead</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-foreground font-mono">
                ₹{fleetSummary.totalFleetFixedCost.toLocaleString('en-IN')}
              </span>
              <p className="text-[11px] text-muted-foreground mt-1">
                Monthly EMI, salaries, taxes & insurance for {fleetSummary.totalTrucks} vehicles
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monthly Target Trips</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground font-mono">
                {fleetSummary.totalTargetTrips}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                trips to 100% break even
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Avg {fleetSummary.totalTrucks > 0 ? (fleetSummary.totalTargetTrips / fleetSummary.totalTrucks).toFixed(1) : 0} trips required per truck
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed This Month</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {fleetSummary.totalCompletedTrips}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                ({fleetSummary.totalRemainingTrips} trips remaining)
              </span>
            </div>
            <div className="mt-2 w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${fleetSummary.overallProgressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fleet Status Pulse</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                🟢 {fleetSummary.profitableTrucks} Profitable
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/15 text-amber-400 border-amber-500/30">
                🟡 {fleetSummary.breakEvenTrucks} Near Target
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/15 text-rose-400 border-rose-500/30">
                🔴 {fleetSummary.redTrucks} In Red
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {fleetSummary.overallProgressPercent}% of total monthly fixed burden covered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── 2. Truck-Wise Break-Even Table & Matrix ─────────────────────── */}
      <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 border-b border-border/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" /> Truck-Wise Break-Even & Profit Target Matrix
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Exact number of monthly freight trips each truck must execute to fully recover EMI, insurance, driver wage, and overhead.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter truck number..."
                  className="pl-8 bg-background h-9 rounded-xl text-xs"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-background border border-border text-foreground text-xs rounded-xl px-2.5 h-9"
              >
                <option value="all">All Statuses</option>
                <option value="PROFITABLE">🟢 Profitable</option>
                <option value="NEAR_BREAK_EVEN">🟡 Near Break-Even</option>
                <option value="IN_THE_RED">🔴 In the Red</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/60">
                <tr>
                  <th className="py-3 px-4">Vehicle Details</th>
                  <th className="py-3 px-4">Monthly Fixed Burden</th>
                  <th className="py-3 px-4">Trip Margin (CM)</th>
                  <th className="py-3 px-4 text-center">Target Trips</th>
                  <th className="py-3 px-4 text-center">Completed</th>
                  <th className="py-3 px-4 text-center">Remaining</th>
                  <th className="py-3 px-4">Progress to Break-Even</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground text-xs">
                      No vehicles matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredList.map(item => (
                    <tr key={item.truckId} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground font-mono text-sm">{item.truckNumber}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{item.truckType}</span>
                          <span>•</span>
                          <span>{item.driverName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-foreground">
                          ₹{item.totalMonthlyFixedCost.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-muted-foreground" title="EMI + Salary + Ins + Tax">
                          EMI: ₹{item.fixedCostBreakdown.emi.toLocaleString('en-IN')} | Sal: ₹{item.fixedCostBreakdown.driverSalary.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-emerald-400">
                          +₹{item.contributionMargin.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Rev ₹{item.avgTripRevenue.toLocaleString('en-IN')} - Cost ₹{item.avgTripVariableCost.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="font-extrabold text-sm text-foreground">
                          {item.targetTrips}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">trips/mo</span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="font-extrabold text-sm text-emerald-400">
                          {item.completedTripsThisMonth}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">done</span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className={`font-extrabold text-sm ${item.remainingTrips === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.remainingTrips}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {item.remainingTrips === 0 ? 'Achieved 🏁' : 'needed'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 font-bold ${item.statusBadge}`}>
                            {item.statusLabel}
                          </Badge>
                          <span className="text-muted-foreground font-bold">{item.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-muted/70 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              item.progressPercent >= 100 
                                ? 'bg-emerald-500' 
                                : item.progressPercent >= 60 
                                ? 'bg-amber-500' 
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${item.progressPercent}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectTruckForSim(item.truckId)}
                          className="h-7 text-[11px] rounded-lg border-primary/20 hover:bg-primary/10 text-primary font-semibold"
                        >
                          Simulate
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Interactive What-If Simulator Drawer ───────────────────────── */}
      {selectedTruck && simulatedBreakEven && (
        <Card className="bg-card border-border/80 shadow-md rounded-2xl overflow-hidden animate-in fade-in-50 duration-200">
          <CardHeader className="p-4 sm:p-6 bg-muted/20 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" /> What-If Profitability Simulator: {selectedTruck.truck_number}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Tweak fuel rates, driver compensation, freight billing, and target net profit to see exact trip targets dynamically.
                </CardDescription>
              </div>

              <Badge variant="outline" className="text-xs font-mono font-bold text-primary border-primary/30 bg-primary/5">
                {selectedTruck.truck_type || '32ft Container'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Sliders */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <Label>Monthly Loan EMI (₹)</Label>
                  <span className="font-mono text-primary font-bold">₹{simEmi.toLocaleString('en-IN')}</span>
                </div>
                <Slider
                  min={10000}
                  max={75000}
                  step={1000}
                  value={[simEmi]}
                  onValueChange={([v]) => setSimEmi(v)}
                />
                <span className="text-[10px] text-muted-foreground block">Baseline: ₹33,410</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <Label>Allocated Driver Salary (₹)</Label>
                  <span className="font-mono text-primary font-bold">₹{simDriverSalary.toLocaleString('en-IN')}</span>
                </div>
                <Slider
                  min={12000}
                  max={45000}
                  step={1000}
                  value={[simDriverSalary]}
                  onValueChange={([v]) => setSimDriverSalary(v)}
                />
                <span className="text-[10px] text-muted-foreground block">Baseline: ₹20,000/mo</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <Label>Avg Freight Rate / Trip (₹)</Label>
                  <span className="font-mono text-emerald-400 font-bold">₹{simTripRevenue.toLocaleString('en-IN')}</span>
                </div>
                <Slider
                  min={15000}
                  max={60000}
                  step={1000}
                  value={[simTripRevenue]}
                  onValueChange={([v]) => setSimTripRevenue(v)}
                />
                <span className="text-[10px] text-muted-foreground block">Client contract billing</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <Label>Desired Net Profit / Mo (₹)</Label>
                  <span className="font-mono text-amber-400 font-bold">₹{simTargetProfit.toLocaleString('en-IN')}</span>
                </div>
                <Slider
                  min={0}
                  max={100000}
                  step={5000}
                  value={[simTargetProfit]}
                  onValueChange={([v]) => setSimTargetProfit(v)}
                />
                <span className="text-[10px] text-muted-foreground block">Profit goal above fixed costs</span>
              </div>
            </div>

            {/* Simulation Result Callout */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Simulated Contribution Margin / Trip</div>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  +₹{simulatedBreakEven.contributionMargin.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  (₹{simTripRevenue.toLocaleString('en-IN')} freight − ₹{simVariableCost.toLocaleString('en-IN')} variable trip costs)
                </p>
              </div>

              <div className="h-10 w-px bg-border hidden sm:block" />

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Total Monthly Fixed Target</div>
                <div className="text-xl font-black text-foreground font-mono">
                  ₹{(simulatedBreakEven.totalMonthlyFixedCost + simTargetProfit).toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Fixed Burden + ₹{simTargetProfit.toLocaleString('en-IN')} Target Profit
                </p>
              </div>

              <div className="h-10 w-px bg-border hidden sm:block" />

              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center sm:text-right">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Required Monthly Trips</span>
                <span className="text-3xl font-black text-primary font-mono block">
                  {simulatedBreakEven.targetTrips} Trips
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ({(simulatedBreakEven.targetTrips / 4).toFixed(1)} dispatches / week)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
