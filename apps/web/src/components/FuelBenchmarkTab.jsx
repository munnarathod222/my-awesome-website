import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Fuel, TrendingUp, TrendingDown, Award, Target, Zap, 
  IndianRupee, ArrowUpRight, ArrowDownRight, ShieldCheck, Scale, 
  CheckCircle2, AlertTriangle, HelpCircle, BarChart3, PieChartIcon, RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Cell, ReferenceLine, Legend, ComposedChart, Line
} from 'recharts';

const DIESEL_PRICE_PER_LITER = 94.5; // Average Indian Diesel Rate in INR

export default function FuelBenchmarkTab({ fuelLogs = [], trucks = {}, loading = false }) {
  // Target benchmark mileage slider state (default 4.5 km/L)
  const [targetBenchmark, setTargetBenchmark] = useState(4.5);
  const [dieselPrice, setDieselPrice] = useState(DIESEL_PRICE_PER_LITER);
  const [searchTruck, setSearchTruck] = useState('');

  // Process Truck Level Statistics
  const truckStats = useMemo(() => {
    const map = {};

    fuelLogs.forEach(log => {
      const truckId = log.truck_id || 'unknown';
      const name = log.vehicle_name || trucks[truckId] || 'Unknown Truck';
      const distance = Number(log.distance || log.distance_driven || 0);
      const liters = Number(log.liters || 0);
      const cost = Number(log.total_cost || log.fuel_cost || 0);

      if (!map[truckId]) {
        map[truckId] = {
          id: truckId,
          name,
          totalDistance: 0,
          totalLiters: 0,
          totalCost: 0,
          logCount: 0,
        };
      }

      map[truckId].totalDistance += distance;
      map[truckId].totalLiters += liters;
      map[truckId].totalCost += cost;
      map[truckId].logCount += 1;
    });

    return Object.values(map).map(t => {
      const avgMileage = t.totalLiters > 0 ? (t.totalDistance / t.totalLiters) : 0;
      const costPerKm = t.totalDistance > 0 ? (t.totalCost / t.totalDistance) : 0;
      
      // Calculate liters needed if running at target benchmark
      const benchmarkLitersNeeded = avgMileage > 0 ? (t.totalDistance / targetBenchmark) : 0;
      const excessLiters = Math.max(0, t.totalLiters - benchmarkLitersNeeded);
      const potentialCostSavings = excessLiters * dieselPrice;
      const mileageVariance = avgMileage - targetBenchmark; // Positive = better, Negative = worse

      return {
        ...t,
        avgMileage: Number(avgMileage.toFixed(2)),
        costPerKm: Number(costPerKm.toFixed(2)),
        excessLiters: Number(excessLiters.toFixed(1)),
        potentialCostSavings: Number(potentialCostSavings.toFixed(0)),
        mileageVariance: Number(mileageVariance.toFixed(2)),
        status: avgMileage >= targetBenchmark ? 'efficient' : avgMileage >= targetBenchmark * 0.85 ? 'moderate' : 'inefficient'
      };
    }).sort((a, b) => b.avgMileage - a.avgMileage);
  }, [fuelLogs, trucks, targetBenchmark, dieselPrice]);

  // Fleet Level Summary
  const fleetSummary = useMemo(() => {
    const totalDist = truckStats.reduce((s, t) => s + t.totalDistance, 0);
    const totalLit = truckStats.reduce((s, t) => s + t.totalLiters, 0);
    const totalSpend = truckStats.reduce((s, t) => s + t.totalCost, 0);
    const fleetAvgMileage = totalLit > 0 ? totalDist / totalLit : 0;

    const totalPotentialSavings = truckStats.reduce((s, t) => s + t.potentialCostSavings, 0);
    const totalExcessLiters = truckStats.reduce((s, t) => s + t.excessLiters, 0);

    const efficientCount = truckStats.filter(t => t.status === 'efficient').length;
    const inefficientCount = truckStats.filter(t => t.status === 'inefficient').length;

    const topPerformer = truckStats.length > 0 ? truckStats[0] : null;
    const worstPerformer = truckStats.length > 0 ? truckStats[truckStats.length - 1] : null;

    return {
      totalDist,
      totalLit,
      totalSpend,
      fleetAvgMileage: Number(fleetAvgMileage.toFixed(2)),
      totalPotentialSavings,
      totalExcessLiters,
      efficientCount,
      inefficientCount,
      topPerformer,
      worstPerformer,
    };
  }, [truckStats]);

  // Filtered trucks list for search
  const filteredTrucks = useMemo(() => {
    if (!searchTruck) return truckStats;
    const q = searchTruck.toLowerCase();
    return truckStats.filter(t => t.name.toLowerCase().includes(q));
  }, [truckStats, searchTruck]);

  // Chart Data for comparison
  const chartData = useMemo(() => {
    return truckStats.map(t => ({
      name: t.name.split(' ')[0], // short name
      fullName: t.name,
      mileage: t.avgMileage,
      benchmark: targetBenchmark,
      costPerKm: t.costPerKm,
      excessLiters: t.excessLiters,
      savings: t.potentialCostSavings,
    }));
  }, [truckStats, targetBenchmark]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Dynamic Slider Controls */}
      <Card className="rounded-3xl border border-primary/20 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
              <Zap className="w-3.5 h-3.5" /> Real-time Fleet Performance Intelligence
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Fuel Mileage Benchmark & Savings Calculator</h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Compare individual truck efficiencies against target benchmarks to identify driver mileage gaps and calculate potential monthly fuel cost savings.
            </p>
          </div>

          {/* Interactive Controls Card */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 p-4 rounded-2xl w-full lg:w-80 space-y-4 shadow-lg">
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-blue-400" /> Target Benchmark Mileage:</span>
                <span className="text-sm font-mono text-emerald-400 font-black">{targetBenchmark} km/L</span>
              </div>
              <input 
                type="range" 
                min="3.0" 
                max="7.0" 
                step="0.1" 
                value={targetBenchmark}
                onChange={e => setTargetBenchmark(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>3.0 km/L</span>
                <span>Fleet Avg: {fleetSummary.fleetAvgMileage} km/L</span>
                <span>7.0 km/L</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700 text-xs">
              <span className="text-slate-400">Diesel Price (₹/L):</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-mono">₹</span>
                <Input 
                  type="number" 
                  value={dieselPrice}
                  onChange={e => setDieselPrice(Number(e.target.value) || 0)}
                  className="w-20 h-7 text-xs bg-slate-900 border-slate-700 text-white font-mono rounded-lg text-right"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fleet Average Mileage */}
        <Card className="rounded-2xl border-border/60 bg-card p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fleet Avg Mileage</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Fuel className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-black font-mono text-foreground">{fleetSummary.fleetAvgMileage} <span className="text-xs font-normal text-muted-foreground">km/L</span></div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
            <span>Target: <strong className="text-primary font-mono">{targetBenchmark} km/L</strong></span>
            <Badge variant="outline" className={`ml-auto font-mono text-[10px] ${fleetSummary.fleetAvgMileage >= targetBenchmark ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/10 text-rose-500 border-rose-500/30'}`}>
              {fleetSummary.fleetAvgMileage >= targetBenchmark ? 'On Target' : `${(targetBenchmark - fleetSummary.fleetAvgMileage).toFixed(2)} km/L Below`}
            </Badge>
          </div>
        </Card>

        {/* Potential Savings Opportunity */}
        <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Potential Fuel Savings</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500"><IndianRupee className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            ₹{fleetSummary.totalPotentialSavings.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-2 font-medium flex items-center justify-between">
            <span>Excess Fuel: <strong className="font-mono">{fleetSummary.totalExcessLiters.toLocaleString()} L</strong></span>
            <span className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">If benchmark met</span>
          </div>
        </Card>

        {/* Top Performer Truck */}
        <Card className="rounded-2xl border-border/60 bg-card p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Performing Truck</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><Award className="w-4 h-4" /></div>
          </div>
          <div className="text-lg font-black text-foreground truncate">{fleetSummary.topPerformer ? fleetSummary.topPerformer.name : 'N/A'}</div>
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="font-mono text-emerald-500 font-extrabold text-sm">{fleetSummary.topPerformer ? fleetSummary.topPerformer.avgMileage : 0} km/L</span>
            <span className="text-muted-foreground font-mono">₹{fleetSummary.topPerformer ? fleetSummary.topPerformer.costPerKm : 0}/km</span>
          </div>
        </Card>

        {/* Inefficient Trucks Flagged */}
        <Card className="rounded-2xl border-border/60 bg-card p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Below Benchmark Trucks</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500"><AlertTriangle className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-500">
            {fleetSummary.inefficientCount} <span className="text-xs font-normal text-muted-foreground">/ {truckStats.length} Trucks</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">
            Requires driver training & maintenance check
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Truck Mileage Comparison Chart */}
        <Card className="lg:col-span-2 rounded-3xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Truck Mileage vs Benchmark Comparison
              </CardTitle>
              <CardDescription className="text-xs">
                Visualizing mileage (km/L) per truck against target benchmark ({targetBenchmark} km/L)
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
              {truckStats.length} Trucks Active
            </Badge>
          </div>

          <div className="h-72 w-full pt-2">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No fuel logs recorded yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} unit=" km/l" />
                  <Tooltip 
                    formatter={(val, name) => [
                      name === 'mileage' ? `${val} km/L` : name === 'savings' ? `₹${val.toLocaleString()}` : val,
                      name === 'mileage' ? 'Avg Mileage' : name === 'benchmark' ? 'Benchmark' : name
                    ]}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  />
                  <ReferenceLine y={targetBenchmark} stroke="#10B981" strokeDasharray="4 4" label={{ value: `Target ${targetBenchmark} km/L`, fill: '#10B981', fontSize: 11, position: 'top' }} />
                  <Bar dataKey="mileage" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.mileage >= targetBenchmark ? '#10B981' : entry.mileage >= targetBenchmark * 0.85 ? '#F59E0B' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Potential Savings Breakdown */}
        <Card className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Potential Savings Impact
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Estimated savings if underperforming vehicles achieve target mileage of {targetBenchmark} km/L.
            </CardDescription>

            <div className="mt-5 space-y-3">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                <div className="text-xs text-muted-foreground font-semibold">Total Excess Fuel Wasted</div>
                <div className="text-2xl font-black font-mono text-rose-500">
                  {fleetSummary.totalExcessLiters.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">Liters</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">Estimated Financial Savings</div>
                <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{fleetSummary.totalPotentialSavings.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
                  Calculated at ₹{dieselPrice}/Liter diesel cost
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2 mt-4">
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            <span>Driver eco-driving training & tire pressure checks typically recover 10-15% of lost mileage.</span>
          </div>
        </Card>
      </div>

      {/* Detailed Truck & Driver Comparison Table */}
      <Card className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-md space-y-4 p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" /> Truck Mileage & Savings Breakdown
            </CardTitle>
            <CardDescription className="text-xs">
              Detailed fuel efficiency matrix comparing distance driven, total liters consumed, and mileage variance
            </CardDescription>
          </div>
          <Input 
            placeholder="Search truck number..." 
            value={searchTruck} 
            onChange={e => setSearchTruck(e.target.value)}
            className="w-full sm:w-64 h-9 text-xs rounded-xl"
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border/50">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-bold py-3.5 pl-4">Truck / Vehicle</TableHead>
                <TableHead className="text-xs font-bold">Total Dist (KM)</TableHead>
                <TableHead className="text-xs font-bold">Fuel Used (L)</TableHead>
                <TableHead className="text-xs font-bold text-center">Avg Mileage (km/L)</TableHead>
                <TableHead className="text-xs font-bold text-center">Variance vs Target</TableHead>
                <TableHead className="text-xs font-bold">Cost / KM (₹)</TableHead>
                <TableHead className="text-xs font-bold text-right pr-4">Potential Savings (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">Loading benchmark analysis...</TableCell>
                </TableRow>
              ) : filteredTrucks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">No trucks matching criteria</TableCell>
                </TableRow>
              ) : (
                filteredTrucks.map(t => (
                  <TableRow key={t.id} className="hover:bg-muted/20 text-xs">
                    <TableCell className="pl-4 py-3 font-extrabold text-foreground flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${t.status === 'efficient' ? 'bg-emerald-500' : t.status === 'moderate' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      {t.name}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">{t.totalDistance.toLocaleString()} km</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{t.totalLiters.toLocaleString()} L</TableCell>
                    <TableCell className="text-center font-mono font-black text-sm">
                      <span className={t.avgMileage >= targetBenchmark ? 'text-emerald-500' : t.avgMileage >= targetBenchmark * 0.85 ? 'text-amber-500' : 'text-rose-500'}>
                        {t.avgMileage} km/L
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`font-mono text-[10px] font-bold ${t.mileageVariance >= 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/10 text-rose-500 border-rose-500/30'}`}>
                        {t.mileageVariance >= 0 ? `+${t.mileageVariance}` : t.mileageVariance} km/L
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-foreground">₹{t.costPerKm}</TableCell>
                    <TableCell className="text-right pr-4 font-mono font-black text-emerald-600 dark:text-emerald-400">
                      {t.potentialCostSavings > 0 ? `₹${t.potentialCostSavings.toLocaleString('en-IN')}` : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
