import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Fuel, TrendingUp, TrendingDown, Award, Target, Zap, 
  IndianRupee, ArrowUpRight, ArrowDownRight, ShieldCheck, Scale, 
  CheckCircle2, AlertTriangle, HelpCircle, BarChart3, PieChartIcon, RefreshCw, Save
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Cell, ReferenceLine, Legend, ComposedChart, Line
} from 'recharts';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const DIESEL_PRICE_PER_LITER = 94.5; // Default Indian Diesel Rate in INR

export default function FuelBenchmarkTab({ fuelLogs = [], trucks = {}, loading = false }) {
  // Target benchmark mileage slider state (default 4.5 km/L) - load from localStorage first
  const [targetBenchmark, setTargetBenchmark] = useState(() => {
    const saved = localStorage.getItem('target_benchmark_mileage');
    return saved ? parseFloat(saved) : 4.5;
  });

  const [dieselPrice, setDieselPrice] = useState(() => {
    const saved = localStorage.getItem('fuel_diesel_price');
    return saved ? parseFloat(saved) : DIESEL_PRICE_PER_LITER;
  });

  const [searchTruck, setSearchTruck] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load from PocketBase company_settings if available
  useEffect(() => {
    async function loadCompanySettings() {
      try {
        const records = await pb.collection('company_settings').getFullList({ $autoCancel: false });
        if (records.length > 0) {
          const setting = records[0];
          if (setting.target_mileage) {
            setTargetBenchmark(Number(setting.target_mileage));
            localStorage.setItem('target_benchmark_mileage', setting.target_mileage.toString());
          }
          if (setting.diesel_price) {
            setDieselPrice(Number(setting.diesel_price));
            localStorage.setItem('fuel_diesel_price', setting.diesel_price.toString());
          }
        }
      } catch (err) {
        console.log('Company settings load note:', err);
      }
    }
    loadCompanySettings();
  }, []);

  // Save Benchmark Settings Handler
  const handleSaveSettings = async (mileageVal, priceVal) => {
    const m = mileageVal !== undefined ? mileageVal : targetBenchmark;
    const p = priceVal !== undefined ? priceVal : dieselPrice;

    // 1. Immediately save to localStorage
    localStorage.setItem('target_benchmark_mileage', m.toString());
    localStorage.setItem('fuel_diesel_price', p.toString());

    // 2. Persist to PocketBase
    setIsSaving(true);
    try {
      const records = await pb.collection('company_settings').getFullList({ $autoCancel: false }).catch(() => []);
      if (records.length > 0) {
        await pb.collection('company_settings').update(records[0].id, {
          target_mileage: m,
          diesel_price: p
        }, { $autoCancel: false });
      } else {
        await pb.collection('company_settings').create({
          company_name: 'Jai Bhavani Cargo',
          target_mileage: m,
          diesel_price: p
        }, { $autoCancel: false });
      }
      toast.success(`Saved! Target: ${m} km/L • Diesel Price: ₹${p}/L`);
    } catch (err) {
      console.warn('Saved to local storage:', err);
      toast.success(`Benchmark saved to browser storage (${m} km/L, ₹${p}/L)`);
    } finally {
      setIsSaving(false);
    }
  };

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
      worstPerformer
    };
  }, [truckStats]);

  const filteredTruckStats = useMemo(() => {
    if (!searchTruck.trim()) return truckStats;
    return truckStats.filter(t => t.name.toLowerCase().includes(searchTruck.toLowerCase()));
  }, [truckStats, searchTruck]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Benchmark Selector */}
      <Card className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/80 border-slate-800 text-slate-100 p-6 rounded-3xl shadow-xl relative overflow-hidden">
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
          <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 p-4 rounded-2xl w-full lg:w-80 space-y-4 shadow-xl">
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
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setTargetBenchmark(val);
                  localStorage.setItem('target_benchmark_mileage', val.toString());
                }}
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
                  onChange={e => {
                    const val = Number(e.target.value) || 0;
                    setDieselPrice(val);
                    localStorage.setItem('fuel_diesel_price', val.toString());
                  }}
                  className="w-20 h-7 text-xs bg-slate-900 border-slate-700 text-white font-mono rounded-lg text-right font-bold"
                />
              </div>
            </div>

            {/* Save Button */}
            <Button 
              onClick={() => handleSaveSettings()}
              disabled={isSaving}
              className="w-full h-8 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Benchmark Settings'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-slate-100 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-xs text-slate-400 uppercase font-mono font-extrabold tracking-wider">Fleet Avg Mileage</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white flex items-baseline gap-1">
                {fleetSummary.fleetAvgMileage} <span className="text-xs font-normal text-slate-400">km/L</span>
              </div>
              <div className="text-[11px] font-medium flex items-center gap-1 mt-1">
                <span>Target: <strong className="text-blue-400 font-mono">{targetBenchmark} km/L</strong></span>
                {fleetSummary.fleetAvgMileage >= targetBenchmark ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">On Target</Badge>
                ) : (
                  <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[10px]">Below Target</Badge>
                )}
              </div>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <Fuel className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-xs text-emerald-400 uppercase font-mono font-extrabold tracking-wider">Potential Fuel Savings</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 flex items-baseline gap-0.5">
                ₹{fleetSummary.totalPotentialSavings.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-mono">
                <span>Excess Fuel: <strong>{fleetSummary.totalExcessLiters.toLocaleString('en-IN')} L</strong></span>
              </div>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-xs text-amber-400 uppercase font-mono font-extrabold tracking-wider">Top Performing Truck</div>
              {fleetSummary.topPerformer ? (
                <>
                  <div className="text-lg font-bold text-white truncate max-w-[170px]" title={fleetSummary.topPerformer.name}>
                    {fleetSummary.topPerformer.name}
                  </div>
                  <div className="text-xs font-mono font-extrabold text-emerald-400">
                    {fleetSummary.topPerformer.avgMileage} km/L <span className="text-[10px] text-slate-400 font-normal">({fleetSummary.topPerformer.costPerKm ? `₹${fleetSummary.topPerformer.costPerKm}/km` : ''})</span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500">No truck data</div>
              )}
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-xs text-rose-400 uppercase font-mono font-extrabold tracking-wider">Below Benchmark Trucks</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
                {fleetSummary.inefficientCount} <span className="text-xs text-slate-400 font-normal">/ {truckStats.length} Trucks</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Requires driver training & maintenance check
              </div>
            </div>
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Truck Benchmark Efficiency Table */}
      <Card className="bg-slate-900 border-slate-800 text-slate-100 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" /> Individual Vehicle Mileage vs Target Benchmark ({targetBenchmark} km/L)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time audit comparing actual mileage against target benchmark.</p>
          </div>

          <div className="w-full sm:w-64">
            <Input 
              placeholder="Search truck..."
              value={searchTruck}
              onChange={e => setSearchTruck(e.target.value)}
              className="h-9 bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-xs text-slate-400 font-mono">TRUCK NAME</TableHead>
                <TableHead className="text-xs text-slate-400 font-mono text-center">TOTAL DISTANCE</TableHead>
                <TableHead className="text-xs text-slate-400 font-mono text-center">TOTAL DIESEL</TableHead>
                <TableHead className="text-xs text-slate-400 font-mono text-center">ACTUAL MILEAGE</TableHead>
                <TableHead className="text-xs text-slate-400 font-mono text-center">TARGET VARIANCE</TableHead>
                <TableHead className="text-xs text-slate-400 font-mono text-right">EXCESS FUEL COST</TableHead>
                <TableHead className="text-xs text-slate-400 font-mono text-center">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTruckStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-xs text-slate-500 py-8">
                    No fuel logs found matching truck search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTruckStats.map(t => (
                  <TableRow key={t.id} className="border-slate-800/60 hover:bg-slate-800/40 text-xs">
                    <TableCell className="font-extrabold text-white font-mono">{t.name}</TableCell>
                    <TableCell className="text-center font-mono text-slate-300">{t.totalDistance.toLocaleString()} km</TableCell>
                    <TableCell className="text-center font-mono text-slate-300">{t.totalLiters.toLocaleString()} L</TableCell>
                    <TableCell className="text-center font-mono font-black text-sm text-white">
                      {t.avgMileage} <span className="text-[10px] text-slate-400 font-normal">km/L</span>
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {t.mileageVariance >= 0 ? (
                        <span className="text-emerald-400 font-bold">+{t.mileageVariance} km/L</span>
                      ) : (
                        <span className="text-rose-400 font-bold">{t.mileageVariance} km/L</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {t.potentialCostSavings > 0 ? (
                        <span className="text-rose-400">₹{t.potentialCostSavings.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-emerald-400">₹0 (On Target)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {t.status === 'efficient' && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">Optimal</Badge>
                      )}
                      {t.status === 'moderate' && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Acceptable</Badge>
                      )}
                      {t.status === 'inefficient' && (
                        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[10px]">Below Target</Badge>
                      )}
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
