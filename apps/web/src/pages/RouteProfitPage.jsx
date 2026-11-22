import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Fuel, CreditCard, 
  UserCheck, AlertTriangle, ArrowRight, RefreshCw, Filter, 
  Search, ShieldCheck, BarChart3, Layers, Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { reservationClient } from '@/lib/reservationClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function RouteProfitPage() {
  let currentUser = null;
  try {
    const auth = useAuth();
    currentUser = auth?.currentUser;
  } catch (e) {
    try {
      currentUser = JSON.parse(localStorage.getItem('app_auth_user'));
    } catch (err) {}
  }

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedRoute, setSelectedRoute] = useState(null);

  const loadRouteProfitability = async () => {
    try {
      setLoading(true);
      const res = await reservationClient.getRouteProfitRanking();
      setRoutes(res.routes || []);
    } catch (err) {
      toast.error('Failed to load route profitability: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRouteProfitability();
  }, []);

  const filteredRoutes = routes.filter(r => {
    const matchesSearch = (r.route_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedFilter === 'High Yield') return matchesSearch && r.margin_pct >= 20;
    if (selectedFilter === 'Standard') return matchesSearch && r.margin_pct >= 12 && r.margin_pct < 20;
    if (selectedFilter === 'Underperforming') return matchesSearch && r.margin_pct < 12;
    return matchesSearch;
  });

  const totalGrossRevenue = routes.reduce((sum, r) => sum + (r.total_revenue || 0), 0);
  const totalNetProfit = routes.reduce((sum, r) => sum + (r.net_profit || 0), 0);
  const overallMargin = totalGrossRevenue > 0 ? ((totalNetProfit / totalGrossRevenue) * 100).toFixed(1) : 0;
  const bestRoute = routes[0];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="bg-slate-900/95 border border-slate-800 p-4 md:p-5 rounded-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
              MODULE 18: FINANCIAL LANE INTELLIGENCE
            </span>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Audited P&L Math
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-emerald-400" />
            Route Net Profitability & Lane Ranking
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Ranks every freight corridor by actual net profit, fuel slips, Fastag tolls, and driver bhatta. Identifies high-yield vs. deadhead drag lanes.
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadRouteProfitability}
          className="border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 text-xs h-10 rounded-xl"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Recalculate P&L
        </Button>
      </div>

      {/* ── Macro Financial KPI Summary Cards ───────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl border bg-slate-900 border-slate-800">
          <p className="text-[11px] font-bold text-slate-400">Total Corridor Revenue</p>
          <p className="text-2xl font-black text-white font-mono mt-0.5">₹{totalGrossRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500 mt-1">Across {routes.length} active lanes</p>
        </div>

        <div className="p-3.5 rounded-2xl border bg-emerald-500/10 border-emerald-500/20">
          <p className="text-[11px] font-bold text-emerald-400">Total Net Operating Profit</p>
          <p className="text-2xl font-black text-emerald-300 font-mono mt-0.5">₹{totalNetProfit.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-400/70 mt-1">Net after fuel, tolls & bhatta</p>
        </div>

        <div className="p-3.5 rounded-2xl border bg-cyan-500/10 border-cyan-500/20">
          <p className="text-[11px] font-bold text-cyan-400">Average Fleet Margin</p>
          <p className="text-2xl font-black text-cyan-300 font-mono mt-0.5">{overallMargin}%</p>
          <p className="text-[10px] text-cyan-400/70 mt-1">Target benchmark: &gt;18%</p>
        </div>

        <div className="p-3.5 rounded-2xl border bg-purple-500/10 border-purple-500/20">
          <p className="text-[11px] font-bold text-purple-400">#1 Top Ranked Corridor</p>
          <p className="text-base font-black text-purple-200 truncate mt-0.5">{bestRoute ? bestRoute.route_name : 'Hyderabad to Hubli'}</p>
          <p className="text-[10px] text-purple-300 mt-1">{bestRoute ? `${bestRoute.margin_pct}% Margin (₹${bestRoute.profit_per_km}/km)` : 'Evaluating...'}</p>
        </div>
      </div>

      {/* ── Filters & Search Strip ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <Input 
              placeholder="Search route (e.g. Hyderabad, Hubli, Pune, Bangalore)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border-slate-800 text-xs h-9 pl-9 text-white placeholder:text-slate-500 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-1">
            {['All', 'High Yield', 'Standard', 'Underperforming'].map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedFilter === filter 
                    ? 'bg-emerald-500 text-slate-950 font-black' 
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <strong className="text-emerald-400 font-mono">{filteredRoutes.length}</strong> Corridors
        </div>
      </div>

      {/* ── Route Ranking Leaderboard Table ─────────────────────────── */}
      <Card className="bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-900 text-slate-400 font-bold text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">RANK</th>
                <th className="py-3 px-4">FREIGHT CORRIDOR</th>
                <th className="py-3 px-4">TOTAL TRIPS</th>
                <th className="py-3 px-4 text-right">GROSS FREIGHT</th>
                <th className="py-3 px-4 text-right">DIESEL COST</th>
                <th className="py-3 px-4 text-right">TOLLS & FASTAG</th>
                <th className="py-3 px-4 text-right">DRIVER BHATTA</th>
                <th className="py-3 px-4 text-right">ACTUAL NET PROFIT</th>
                <th className="py-3 px-4 text-center">MARGIN %</th>
                <th className="py-3 px-4 text-right">PROFIT / KM</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-850">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-300">Auditing diesel invoices & Fastag plaza charges...</p>
                  </td>
                </tr>
              ) : filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center text-slate-500">
                    <p className="font-bold text-slate-300">No route financial data matching filters.</p>
                  </td>
                </tr>
              ) : (
                filteredRoutes.map((route, idx) => {
                  const isHighYield = route.margin_pct >= 20;
                  const isUnderperforming = route.margin_pct < 12;

                  return (
                    <tr 
                      key={route.route_name || idx}
                      onClick={() => setSelectedRoute(route)}
                      className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                    >
                      {/* Rank Badge */}
                      <td className="py-3.5 px-4 font-black">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-black ${
                          idx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          idx === 1 ? 'bg-slate-400/20 text-slate-200 border border-slate-500/40' :
                          idx === 2 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/40' :
                          'bg-slate-900 text-slate-400'
                        }`}>
                          #{idx + 1}
                        </span>
                      </td>

                      {/* Route Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                          <span>{route.route_name}</span>
                          {idx === 0 && <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        </div>
                      </td>

                      {/* Trips */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                        {route.total_trips} Trips
                      </td>

                      {/* Gross Freight */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                        ₹{route.total_revenue.toLocaleString('en-IN')}
                      </td>

                      {/* Diesel Cost */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        ₹{route.fuel_cost.toLocaleString('en-IN')}
                      </td>

                      {/* Tolls */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        ₹{route.toll_cost.toLocaleString('en-IN')}
                      </td>

                      {/* Bhatta */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        ₹{route.driver_bhatta.toLocaleString('en-IN')}
                      </td>

                      {/* Actual Net Profit */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-emerald-400">
                        ₹{route.net_profit.toLocaleString('en-IN')}
                      </td>

                      {/* Margin % */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono border ${
                          isHighYield 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : isUnderperforming 
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        }`}>
                          {route.margin_pct}%
                        </span>
                      </td>

                      {/* Profit / Km */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-300">
                        ₹{route.profit_per_km}/km
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Route Deep-Dive Modal ────────────────────────────────────── */}
      {selectedRoute && (
        <Dialog open={Boolean(selectedRoute)} onOpenChange={() => setSelectedRoute(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg rounded-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-white flex items-center justify-between">
                <span>Lane Financial Breakdown: {selectedRoute.route_name}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  selectedRoute.margin_pct >= 20 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
                }`}>
                  {selectedRoute.margin_pct}% Margin
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3.5 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Total Route Revenue</span>
                  <span className="text-white font-extrabold text-base font-mono">₹{selectedRoute.total_revenue.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Net Operating Profit</span>
                  <span className="text-emerald-400 font-extrabold text-base font-mono">₹{selectedRoute.net_profit.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <p className="font-bold text-slate-300 text-[11px] uppercase tracking-wide">Expense Deductions Breakdown</p>
                <div className="flex justify-between text-slate-400">
                  <span>Diesel Fuel Allocation:</span>
                  <strong className="text-white font-mono">₹{selectedRoute.fuel_cost.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Fastag / Toll Charges:</span>
                  <strong className="text-white font-mono">₹{selectedRoute.toll_cost.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Driver Advance & Bhatta:</span>
                  <strong className="text-white font-mono">₹{selectedRoute.driver_bhatta.toLocaleString('en-IN')}</strong>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-emerald-400">
                  <span>Operating Yield per Km:</span>
                  <span className="font-mono">₹{selectedRoute.profit_per_km} / km</span>
                </div>
              </div>

              {selectedRoute.margin_pct < 12 && (
                <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl flex items-start gap-2 text-rose-300 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Tariff Optimization Recommended</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      This corridor is operating below target margin (18%). Consider increasing base freight quotation by 8–10% or bundling with guaranteed return-load contracts.
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button onClick={() => setSelectedRoute(null)} className="bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs">
                  Close Breakdown
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
