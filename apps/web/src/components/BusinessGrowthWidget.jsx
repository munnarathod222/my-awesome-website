import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, Zap, ChevronRight, Share2, Check, ArrowUpRight } from 'lucide-react';
import { calculateGrowthMetrics, generateGrowthWhatsAppSnapshot } from '@/lib/growthAnalyticsEngine.js';
import { toast } from 'sonner';

export default function BusinessGrowthWidget({ 
  trips = [], 
  expenses = [], 
  trucks = [], 
  onOpenFullGrowth = null 
}) {
  const [copied, setCopied] = useState(false);
  
  // Stored target or default
  const storedTarget = typeof window !== 'undefined' ? Number(localStorage.getItem('jbc_monthly_growth_target')) : null;
  const growth = calculateGrowthMetrics(trips, expenses, trucks, storedTarget);

  const {
    currentMonth,
    target,
    daysElapsed,
    daysInCurrentMonth,
    daysRemaining,
    projectedMonthRevenue,
    targetPctAchieved,
    pacingStatus,
    yieldPerTruckPerDay,
    scalePotentialOneTruck
  } = growth;

  const handleCopyWhatsApp = () => {
    const text = generateGrowthWhatsAppSnapshot(growth);
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Executive Growth Snapshot copied! Ready to paste into WhatsApp.');
    setTimeout(() => setCopied(false), 2500);
  };

  const remainingToTarget = Math.max(target - currentMonth.revenue, 0);
  const dailyNeeded = daysRemaining > 0 ? Math.round(remainingToTarget / daysRemaining) : 0;

  return (
    <Card className="border border-indigo-500/25 bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-slate-950/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
      {/* Top Banner */}
      <div className="px-5 py-3.5 border-b border-indigo-500/15 flex flex-wrap items-center justify-between gap-3 bg-indigo-500/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100 tracking-tight">Business Growth Pulse & Target Pacing</h3>
              <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentMonth.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Day {daysElapsed} of {daysInCurrentMonth} · {daysRemaining} days remaining in billing cycle
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyWhatsApp}
            className="h-8 text-xs border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-300 gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{copied ? 'Copied Snapshot' : 'WhatsApp Snapshot'}</span>
          </Button>

          {onOpenFullGrowth && (
            <Button
              size="sm"
              onClick={onOpenFullGrowth}
              className="h-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1 shadow-md shadow-indigo-600/30"
            >
              <span>Full Growth Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Metric Quadrant */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Revenue vs Target */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border/40 hover:border-indigo-500/30 transition-all">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Month Revenue</span>
              <Target className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-lg font-bold text-slate-100 mt-1">
              ₹{(currentMonth.revenue || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Target: <span className="text-slate-300 font-medium">₹{target.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* 2. MoM Growth */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border/40 hover:border-indigo-500/30 transition-all">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>MoM Revenue Velocity</span>
              {currentMonth.momRevGrowth >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              )}
            </div>
            <div className={`text-lg font-bold mt-1 ${currentMonth.momRevGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currentMonth.momRevGrowth >= 0 ? '+' : ''}{currentMonth.momRevGrowth}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Net Margin: <span className="text-emerald-300 font-medium">{currentMonth.margin}%</span>
            </div>
          </div>

          {/* 3. Run-rate Forecast */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border/40 hover:border-indigo-500/30 transition-all">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Month-End Run Rate</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-amber-300 mt-1">
              ₹{projectedMonthRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Daily Pace: <span className="text-slate-300 font-medium">₹{growth.dailyRunRate.toLocaleString('en-IN')}/day</span>
            </div>
          </div>

          {/* 4. Fleet Asset Yield */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border/40 hover:border-indigo-500/30 transition-all">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Asset Yield / Truck</span>
              <span className="text-[10px] text-sky-400 font-medium">{growth.tripsPerTruck} trips/ea</span>
            </div>
            <div className="text-lg font-bold text-sky-300 mt-1">
              ₹{yieldPerTruckPerDay.toLocaleString('en-IN')}
              <span className="text-[10px] font-normal text-slate-400">/day</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              +1 Truck Potential: <span className="text-indigo-300 font-medium">~₹{Math.round(scalePotentialOneTruck / 1000)}k/mo</span>
            </div>
          </div>
        </div>

        {/* Target Progress Bar & Pacing Strip */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-indigo-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">Target Progress</span>
              <span className="text-indigo-400 font-bold">{targetPctAchieved}%</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              {pacingStatus === 'ahead' && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/30">
                  🚀 Ahead of Schedule
                </span>
              )}
              {pacingStatus === 'on_track' && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium border border-blue-500/30">
                  🟢 On Track with Run-Rate
                </span>
              )}
              {pacingStatus === 'lagging' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium border border-amber-500/30">
                  ⚠️ Pacing Needs ₹{dailyNeeded.toLocaleString('en-IN')}/day
                </span>
              )}
            </div>
          </div>

          {/* Bar */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700/50">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${
                pacingStatus === 'ahead' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                pacingStatus === 'on_track' ? 'bg-gradient-to-r from-indigo-500 to-blue-400' :
                'bg-gradient-to-r from-amber-500 to-rose-400'
              }`}
              style={{ width: `${Math.min(targetPctAchieved, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>₹{(currentMonth.revenue || 0).toLocaleString('en-IN')} achieved</span>
            <span>
              {remainingToTarget > 0 
                ? `₹${remainingToTarget.toLocaleString('en-IN')} needed in ${daysRemaining} days` 
                : '🎉 Monthly Target Achieved!'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
