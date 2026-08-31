import React, { useMemo } from 'react';
import { 
  Trophy, TrendingUp, TrendingDown, Percent, Zap, AlertTriangle, 
  MapPin, Compass, IndianRupee, ShieldCheck, ArrowRight, BarChart3, Truck, Clock, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { computeRouteCorridorMetrics } from '@/lib/routeAnalyticsEngine.js';
import { formatCurrency } from '@/lib/analyticsUtils.js';

export default function RouteMasterAnalyticsDashboard({ routes = [], tripLogs = [] }) {
  const metrics = useMemo(() => {
    return computeRouteCorridorMetrics(routes, tripLogs);
  }, [routes, tripLogs]);

  return (
    <div className="space-y-6">
      
      {/* Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Corridor Revenue */}
        <Card className="bg-slate-900/90 border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 text-emerald-400">
            <IndianRupee className="w-16 h-16" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">TOTAL CORRIDOR REVENUE</span>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <p className="text-xs text-slate-400 font-medium pt-1">
              Executed across <span className="text-white font-bold">{metrics.totalTripCount}</span> trips
            </p>
          </div>
        </Card>

        {/* Net Profit Margin */}
        <Card className="bg-slate-900/90 border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 text-sky-400">
            <TrendingUp className="w-16 h-16" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">NET PROFIT MARGIN</span>
            <div className="text-2xl font-black font-mono text-sky-400">
              {metrics.overallMarginPercent.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-400 font-medium pt-1">
              Net Profit: <span className="text-emerald-400 font-bold">{formatCurrency(metrics.totalProfit)}</span>
            </p>
          </div>
        </Card>

        {/* Expense Variance Alerts */}
        <Card className="bg-slate-900/90 border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 text-amber-400">
            <AlertTriangle className="w-16 h-16" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">EXPENSE VARIANCE ALERTS</span>
            <div className="text-2xl font-black font-mono text-amber-400">
              {metrics.varianceAlerts.length}
            </div>
            <p className="text-xs text-slate-400 font-medium pt-1">
              FASTag toll &amp; fuel budget overruns
            </p>
          </div>
        </Card>

        {/* Active Route Corridors */}
        <Card className="bg-slate-900/90 border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 text-purple-400">
            <Compass className="w-16 h-16" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">ACTIVE ROUTE CORRIDORS</span>
            <div className="text-2xl font-black font-mono text-purple-400">
              {routes.length}
            </div>
            <p className="text-xs text-slate-400 font-medium pt-1">
              Paired Up &amp; Down freight corridors
            </p>
          </div>
        </Card>
      </div>

      {/* Main Section: Corridor Profitability Leaderboard & Variance Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Corridor Profitability Leaderboard Table */}
        <Card className="lg:col-span-2 bg-slate-900/90 border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">Corridor Profitability Leaderboard</h3>
                <p className="text-xs text-slate-400">Ranked by Net Margin &amp; Total Profit Generated</p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
              LIVE DATABASE RANKINGS
            </Badge>
          </div>

          <div className="space-y-3">
            {metrics.corridors.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/60 rounded-2xl border border-slate-800">
                No route corridors logged yet.
              </div>
            ) : (
              metrics.corridors.map((c, rankIdx) => (
                <div 
                  key={c.id} 
                  className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl space-y-3 transition-all shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center font-mono shrink-0 ${
                        rankIdx === 0 ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' : 
                        rankIdx === 1 ? 'bg-slate-300 text-slate-950' : 
                        rankIdx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{rankIdx + 1}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-white flex items-center gap-2">
                          <span>{c.routeName}</span>
                          <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                            {c.routeCode}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {c.distanceKm} KM • {c.stopsCount} Intermediate Dock{c.stopsCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <Badge className={`font-extrabold text-xs px-3 py-1 rounded-xl w-fit ${
                      c.tier === 'gold' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                      c.tier === 'standard' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' :
                      'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}>
                      {c.tierLabel}
                    </Badge>
                  </div>

                  {/* Financial Breakdown Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Standard Rate</span>
                      <span className="font-mono font-bold text-white">{formatCurrency(c.standardRate)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Revenue</span>
                      <span className="font-mono font-bold text-emerald-400">{formatCurrency(c.totalRevenue)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Profit</span>
                      <span className="font-mono font-bold text-sky-400">{formatCurrency(c.netProfit)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Margin %</span>
                      <span className="font-mono font-black text-amber-400">{c.profitMarginPercent.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right Column: Variance Alerts & Return Load Balance */}
        <div className="space-y-6">
          
          {/* FASTag Toll & Fuel Variance Alerts */}
          <Card className="bg-slate-900/90 border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">Expense Variance Alerts</h3>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-amber-400 border-amber-500/30">
                {metrics.varianceAlerts.length} Flagged
              </Badge>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {metrics.varianceAlerts.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs bg-slate-950/60 rounded-2xl border border-slate-800">
                  ✅ All trip tolls &amp; fuel expenses match Route Master benchmarks perfectly!
                </div>
              ) : (
                metrics.varianceAlerts.map((v, vIdx) => (
                  <div key={vIdx} className="bg-slate-950 border border-slate-800/90 p-3 rounded-2xl space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-white">{v.corridorCode}</span>
                      <span className="font-mono text-[10px] text-slate-400">Trip: {v.tripId}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono flex items-center justify-between">
                      <span>Truck: <strong className="text-amber-400">{v.truckNo}</strong></span>
                      <span className="text-rose-400 font-bold">
                        Variance: +₹{Math.abs(v.variance)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Actual Toll: ₹{v.actualToll} (Standard Expected: ₹{v.expectedToll})
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Route Health Summary */}
          <Card className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 p-5 rounded-3xl shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">Route Intelligence Summary</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              All route tariffs, intermediate stops (`WARK`, `WARG`), and FASTag toll budgets are synced live between Route Master and live Trip Logs.
            </p>
          </Card>

        </div>
      </div>

    </div>
  );
}
