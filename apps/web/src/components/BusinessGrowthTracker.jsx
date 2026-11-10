import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, TrendingDown, Target, Zap, Truck, Users, 
  MapPin, Share2, Check, Download, Settings, FileSpreadsheet,
  AlertTriangle, ArrowUpRight, Calendar, DollarSign
} from 'lucide-react';
import { calculateGrowthMetrics, generateGrowthWhatsAppSnapshot } from '@/lib/growthAnalyticsEngine.js';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export default function BusinessGrowthTracker({ 
  trips = [], 
  expenses = [], 
  trucks = [] 
}) {
  const [copied, setCopied] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  // Load saved target from localStorage
  const [currentTarget, setCurrentTarget] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jbc_monthly_growth_target');
      if (saved && !isNaN(Number(saved))) return Number(saved);
    }
    return 2500000; // default ₹25 Lakhs
  });

  const growth = calculateGrowthMetrics(trips, expenses, trucks, currentTarget);
  const {
    currentMonth,
    prevMonth,
    target,
    daysElapsed,
    daysInCurrentMonth,
    daysRemaining,
    dailyRunRate,
    projectedMonthRevenue,
    targetPctAchieved,
    pacingStatus,
    fleetCount,
    yieldPerTruckPerDay,
    tripsPerTruck,
    scalePotentialOneTruck,
    history,
    topLanes,
    topClients
  } = growth;

  useEffect(() => {
    setTargetInput(target.toString());
  }, [target]);

  const handleSaveTarget = (val) => {
    const num = Number(val);
    if (!num || num < 50000) {
      toast.error('Please enter a valid target amount (min ₹50,000)');
      return;
    }
    setCurrentTarget(num);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jbc_monthly_growth_target', num.toString());
    }
    setIsEditingTarget(false);
    toast.success(`Target updated to ₹${num.toLocaleString('en-IN')}`);
  };

  const handleCopyWhatsApp = () => {
    const text = generateGrowthWhatsAppSnapshot(growth);
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Executive Growth Snapshot copied! Ready to paste into WhatsApp.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportExcel = () => {
    try {
      const dataRows = history.map(h => ({
        'Month': h.label,
        'Dispatches (Trips)': h.tripCount,
        'Gross Revenue (INR)': h.revenue,
        'Total Expenses (INR)': h.expenses,
        'Net Profit (INR)': h.profit,
        'Net Margin (%)': `${h.margin}%`,
        'Avg Rate / Trip (INR)': h.arpt,
        'MoM Growth (%)': `${h.momRevGrowth >= 0 ? '+' : ''}${h.momRevGrowth}%`
      }));

      const ws = XLSX.utils.json_to_sheet(dataRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Growth_Historical_P&L');
      XLSX.writeFile(wb, `Jai_Bhavani_Cargo_Growth_Report_${currentMonth.key}.xlsx`);
      toast.success('Excel growth report exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export growth report');
    }
  };

  // Safe preset multipliers
  const prevRev = prevMonth.revenue > 0 ? prevMonth.revenue : (currentMonth.revenue > 0 ? currentMonth.revenue : 2000000);
  const preset10 = Math.round(prevRev * 1.10);
  const preset20 = Math.round(prevRev * 1.20);
  const preset35 = Math.round(prevRev * 1.35);

  const remainingToTarget = Math.max(target - currentMonth.revenue, 0);
  const dailyNeeded = daysRemaining > 0 ? Math.round(remainingToTarget / daysRemaining) : 0;

  // Max value for visual mini-chart
  const maxHistRev = Math.max(...history.map(h => h.revenue), 100000);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/25 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                Business Growth Command Center
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentMonth.label}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Financial Velocity · Target Pacing · Asset Yield · Corridor Expansion
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditingTarget(!isEditingTarget)}
            className="h-9 text-xs border-indigo-500/30 bg-slate-900/60 hover:bg-indigo-950/40 text-indigo-300 gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Set Target</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportExcel}
            className="h-9 text-xs border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Excel</span>
          </Button>

          <Button
            size="sm"
            onClick={handleCopyWhatsApp}
            className="h-9 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-md shadow-emerald-600/20"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Snapshot Copied!' : 'WhatsApp Growth Pulse'}</span>
          </Button>
        </div>
      </div>

      {/* Target Setting Drawer (Conditional) */}
      {isEditingTarget && (
        <Card className="border border-indigo-500/30 bg-slate-900/90 rounded-2xl p-5 shadow-xl animate-in fade-in duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" /> Configure Monthly Revenue Target
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set your growth milestone for {currentMonth.label}. Pacing bars and forecast indicators will adjust instantly.
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setIsEditingTarget(false)} className="text-xs text-slate-400">
                Cancel
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Quick Growth Presets:</span>
              <button
                onClick={() => setTargetInput(preset10.toString())}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                +10% Conservative (₹{preset10.toLocaleString('en-IN')})
              </button>
              <button
                onClick={() => setTargetInput(preset20.toString())}
                className="px-2.5 py-1 text-xs rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40"
              >
                +20% Healthy (₹{preset20.toLocaleString('en-IN')})
              </button>
              <button
                onClick={() => setTargetInput(preset35.toString())}
                className="px-2.5 py-1 text-xs rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40"
              >
                +35% Aggressive (₹{preset35.toLocaleString('en-IN')})
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <Input
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="e.g. 2500000"
                  className="pl-8 bg-slate-950 border-slate-700 text-slate-100 font-semibold"
                />
              </div>
              <Button onClick={() => handleSaveTarget(targetInput)} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                Save Target
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Top 5 Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* 1. Target Progress */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-border/40 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Target Achieved</span>
            <Target className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">
            {targetPctAchieved}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ₹{(currentMonth.revenue || 0).toLocaleString('en-IN')} / ₹{target.toLocaleString('en-IN')}
          </div>
        </div>

        {/* 2. MoM Growth */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-border/40 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>MoM Revenue Velocity</span>
            {currentMonth.momRevGrowth >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
          <div className={`text-2xl font-bold mt-1 ${currentMonth.momRevGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {currentMonth.momRevGrowth >= 0 ? '+' : ''}{currentMonth.momRevGrowth}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Prev: ₹{(prevMonth.revenue || 0).toLocaleString('en-IN')}
          </div>
        </div>

        {/* 3. Run-rate Forecast */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-border/40 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Month-End Run Rate</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 mt-1">
            ₹{projectedMonthRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Daily: ₹{dailyRunRate.toLocaleString('en-IN')}/day
          </div>
        </div>

        {/* 4. Net Margin */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-border/40 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Operating Margin</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {currentMonth.margin}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Profit: ₹{(currentMonth.profit || 0).toLocaleString('en-IN')}
          </div>
        </div>

        {/* 5. Fleet Yield */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-border/40 hover:border-indigo-500/40 transition-all col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Fleet Yield / Day</span>
            <Truck className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-300 mt-1">
            ₹{yieldPerTruckPerDay.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {tripsPerTruck} trips / {fleetCount} trucks
          </div>
        </div>
      </div>

      {/* Pacing Progress Card */}
      <Card className="border border-indigo-500/20 bg-slate-900/60 rounded-2xl p-5 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Run-Rate Pacing & Month-End Countdown
            </h3>
            <p className="text-xs text-slate-400">
              Day {daysElapsed} elapsed · {daysRemaining} days remaining in November cycle
            </p>
          </div>
          <div>
            {pacingStatus === 'ahead' && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                🚀 Pacing Ahead: Run-rate exceeds target!
              </span>
            )}
            {pacingStatus === 'on_track' && (
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/30">
                🟢 On Track: Projected to achieve ~₹{projectedMonthRevenue.toLocaleString('en-IN')}
              </span>
            )}
            {pacingStatus === 'lagging' && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30">
                ⚠️ Acceleration Needed: ₹{dailyNeeded.toLocaleString('en-IN')}/day to hit ₹{target.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 mb-2">
          <div 
            className={`h-full transition-all duration-700 ${
              pacingStatus === 'ahead' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
              pacingStatus === 'on_track' ? 'bg-gradient-to-r from-indigo-500 to-blue-400' :
              'bg-gradient-to-r from-amber-500 to-rose-400'
            }`}
            style={{ width: `${Math.min(targetPctAchieved, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>₹{(currentMonth.revenue || 0).toLocaleString('en-IN')} achieved ({targetPctAchieved}%)</span>
          <span>Target: ₹{target.toLocaleString('en-IN')}</span>
        </div>
      </Card>

      {/* Historical MoM Trend & Visual Bar Graph */}
      <Card className="border border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden">
        <CardHeader className="p-5 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" /> 6-Month Historical Revenue & Margin Velocity
              </CardTitle>
              <CardDescription className="text-xs">
                Month-over-month trajectory of billing, operating margins, and trip counts
              </CardDescription>
            </div>
            <span className="text-xs text-slate-400">
              Avg Trip Rate: <strong className="text-indigo-300">₹{currentMonth.arpt.toLocaleString('en-IN')}</strong>
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-6">
          {/* Visual Mini Chart */}
          <div className="grid grid-cols-6 gap-2 h-36 items-end pt-4 pb-2 border-b border-border/20">
            {history.map((m) => {
              const heightPct = Math.max(Math.round((m.revenue / maxHistRev) * 100), 12);
              return (
                <div key={m.key} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="text-[10px] font-semibold text-slate-300">
                    ₹{Math.round(m.revenue / 1000)}k
                  </div>
                  <div 
                    className={`w-full max-w-[42px] rounded-t-lg transition-all ${
                      m.isCurrent 
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 border-t-2 border-indigo-300 shadow-lg shadow-indigo-600/30' 
                        : 'bg-slate-700/70 hover:bg-slate-600/80'
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${m.label}: ₹${m.revenue.toLocaleString('en-IN')} (${m.tripCount} trips)`}
                  />
                  <div className="text-[10px] text-slate-400 font-medium">
                    {m.label.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Historical Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/30 text-slate-400">
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Trips</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">Expenses</th>
                  <th className="py-2.5 px-3 text-right">Net Profit</th>
                  <th className="py-2.5 px-3 text-right">Margin %</th>
                  <th className="py-2.5 px-3 text-right">ARPT</th>
                  <th className="py-2.5 px-3 text-right">MoM Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {history.map((h) => (
                  <tr key={h.key} className={h.isCurrent ? 'bg-indigo-500/10 font-semibold' : 'hover:bg-muted/20'}>
                    <td className="py-3 px-3 flex items-center gap-1.5">
                      <span>{h.label}</span>
                      {h.isCurrent && (
                        <span className="px-1.5 py-0.5 text-[9px] rounded bg-indigo-500/20 text-indigo-300 font-medium">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{h.tripCount} dispatches</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-100">
                      ₹{h.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      ₹{h.expenses.toLocaleString('en-IN')}
                    </td>
                    <td className={`py-3 px-3 text-right font-medium ${h.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {h.profit < 0 ? '-' : ''}₹{Math.abs(h.profit).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {h.margin}%
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      ₹{h.arpt.toLocaleString('en-IN')}
                    </td>
                    <td className={`py-3 px-3 text-right font-semibold ${h.momRevGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {h.momRevGrowth >= 0 ? '+' : ''}{h.momRevGrowth}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Grids: Top Corridors & Client Expansion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Freight Corridors */}
        <Card className="border border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-slate-200">Top Growth Freight Corridors</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Most active transit routes generating consistent cash flow this month
          </p>

          <div className="space-y-2.5">
            {topLanes.length > 0 ? (
              topLanes.map((lane, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-border/30 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-200">{lane.lane}</span>
                  <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-xs font-semibold">
                    {lane.count} trip{lane.count > 1 ? 's' : ''}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">
                Corridor analytics will populate upon logging active trips for this month.
              </div>
            )}
          </div>
        </Card>

        {/* Client Expansion & Concentration Watchdog */}
        <Card className="border border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200">Client Concentration & Growth</h3>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Revenue contribution across major B2B shippers and market accounts
          </p>

          <div className="space-y-2.5">
            {topClients.length > 0 ? (
              topClients.map((client, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-border/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-slate-200">{client.name}</div>
                    <div className="text-[11px] text-slate-400">
                      ₹{client.revenue.toLocaleString('en-IN')} billed
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">
                      {client.sharePct}%
                    </span>
                    {client.sharePct > 40 && (
                      <span title="Client accounts for >40% of fleet revenue" className="text-amber-400 text-xs">
                        ⚠️
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">
                Client billing distribution will populate upon active dispatches.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
