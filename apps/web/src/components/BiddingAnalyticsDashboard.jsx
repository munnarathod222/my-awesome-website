import React, { useMemo } from 'react';
import { 
  TrendingUp, Award, DollarSign, Target, BarChart3, 
  Truck, MapPin, Building2, AlertTriangle, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { 
  calculateBiddingSummary, 
  getVehicleTypeBreakdown, 
  getRouteCorridorAnalytics, 
  getClientBiddingAnalytics 
} from '@/lib/biddingEngine.js';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import { cn } from '@/lib/utils.js';

const PIE_COLORS = {
  Won: '#10B981',
  Lost: '#EF4444',
  'Under Review': '#F59E0B',
  'Not bidded': '#64748B',
  Bidded: '#3B82F6'
};

export default function BiddingAnalyticsDashboard({
  bids = [],
  activeClientFilter = 'all',
  activeTypeFilter = 'all'
}) {
  const filteredBids = useMemo(() => {
    return bids.filter(b => {
      const matchClient = activeClientFilter === 'all' || (b.client_name || b.counterparty || '').toLowerCase() === activeClientFilter.toLowerCase();
      const matchType = activeTypeFilter === 'all' || (b.bidding_type || 'Contract').toLowerCase() === activeTypeFilter.toLowerCase();
      return matchClient && matchType;
    });
  }, [bids, activeClientFilter, activeTypeFilter]);

  const summary = useMemo(() => calculateBiddingSummary(filteredBids), [filteredBids]);
  const vehicleBreakdown = useMemo(() => getVehicleTypeBreakdown(filteredBids), [filteredBids]);
  const routeAnalytics = useMemo(() => getRouteCorridorAnalytics(filteredBids), [filteredBids]);
  const clientAnalytics = useMemo(() => getClientBiddingAnalytics(filteredBids), [filteredBids]);

  const statusPieData = useMemo(() => {
    return [
      { name: 'Won', value: summary.wonCount, color: PIE_COLORS.Won },
      { name: 'Lost', value: summary.lostCount, color: PIE_COLORS.Lost },
      { name: 'Under Review', value: summary.underReviewCount, color: PIE_COLORS['Under Review'] },
      { name: 'Not bidded', value: summary.notBiddedCount, color: PIE_COLORS['Not bidded'] }
    ].filter(d => d.value > 0);
  }, [summary]);

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Win Rate */}
        <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Win Rate</p>
                <h3 className="text-3xl font-black text-emerald-400 mt-1 tabular-nums">
                  {summary.winRatePct}%
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {summary.wonCount} won out of {summary.decisiveBids} completed bids
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Bidded Value */}
        <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Quoted Value</p>
                <h3 className="text-3xl font-black text-cyan-400 mt-1 tabular-nums">
                  {formatCurrency(summary.totalBiddedAmount)}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Across {summary.totalBids} lane opportunities
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Won Value */}
        <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Revenue Won</p>
                <h3 className="text-3xl font-black text-purple-400 mt-1 tabular-nums">
                  {formatCurrency(summary.totalWonAmount)}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Active contracted & spot freight volume
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Competitor Price Gap */}
        <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg Lost-At Price Gap</p>
                <h3 className="text-3xl font-black text-rose-400 mt-1 tabular-nums">
                  {summary.avgLostPriceGap > 0 ? `+₹${summary.avgLostPriceGap.toLocaleString('en-IN')}` : '₹0'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Average amount undercut by competitors
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Target className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Pie */}
        <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" /> Bid Outcome Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px' }}
                    itemStyle={{ color: '#E2E8F0', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Type Win Rate Bar Chart */}
        <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-400" /> Vehicle Type Win Rate % & Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="vehicle_type" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px' }}
                    itemStyle={{ color: '#E2E8F0', fontSize: '12px' }}
                  />
                  <Legend />
                  <Bar dataKey="winRate" name="Win Rate %" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="total" name="Total Bids" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Corridor Table & Client Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Corridors Analysis */}
        <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> Top Corridors & Pricing Benchmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Route Corridor</th>
                    <th className="py-2 px-2 text-center">Stops</th>
                    <th className="py-2 px-2 text-right">Avg Bid</th>
                    <th className="py-2 px-2 text-right">Win Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {routeAnalytics.slice(0, 6).map(r => (
                    <tr key={r.route} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-slate-200 truncate max-w-[200px]" title={r.route}>
                        {r.route}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-400">
                        {r.avgStops}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-cyan-400">
                        {formatCurrency(r.avgBid)}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <Badge className={cn(
                          "text-[10px] font-bold",
                          r.winRate >= 50 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        )}>
                          {r.winRate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Client Comparison (Contract vs Spot) */}
        <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" /> Client Bidding Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Client</th>
                    <th className="py-2 px-2 text-center">Contract</th>
                    <th className="py-2 px-2 text-center">Spot</th>
                    <th className="py-2 px-2 text-right">Won Value</th>
                    <th className="py-2 px-2 text-right">Win Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {clientAnalytics.slice(0, 6).map(c => (
                    <tr key={c.client_name} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {c.client_name}
                      </td>
                      <td className="py-2.5 px-2 text-center text-purple-400 font-bold">
                        {c.contractCount}
                      </td>
                      <td className="py-2.5 px-2 text-center text-emerald-400 font-bold">
                        {c.spotCount}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-cyan-400">
                        {formatCurrency(c.totalWon)}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <Badge className={cn(
                          "text-[10px] font-bold",
                          c.winRate >= 50 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-slate-700/40 text-slate-300 border-slate-600"
                        )}>
                          {c.winRate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
