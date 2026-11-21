import React, { useState, useEffect } from 'react';
import { 
  Repeat, Truck, MapPin, DollarSign, ArrowRight, ShieldCheck, 
  Sparkles, RefreshCw, CheckCircle2, TrendingUp, AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { reservationClient } from '@/lib/reservationClient.js';

export default function ReturnLoadPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const res = await reservationClient.getReturnLoads();
      setOpportunities(res.opportunities || []);
    } catch (err) {
      toast.error('Failed to load return-load opportunities: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const handleAssignBackhaul = (opp) => {
    toast.success(`Assigned return load for truck ${opp.truck_number}! Opening trip configuration...`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Module 8: Backhaul Revenue Maximizer
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Empty-Running & Deadhead Kilometer Reduction
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3">
            <Repeat className="w-7 h-7 text-emerald-400" />
            Return-Load Opportunity Engine
          </h1>
          <p className="text-sm text-slate-400">
            Automatically pairs trucks terminating in outer terminals with matching return loads heading back to base.
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadOpportunities}
          className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Scan Backhauls
        </Button>
      </div>

      {/* ── Opportunities Grid ──────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-emerald-400" />
          <p className="text-sm font-semibold">Scanning return corridors, quotes, and contract backhauls...</p>
        </div>
      ) : opportunities.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 p-12 text-center shadow-xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Zero Empty Running Detected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All active fleet units are currently scheduled on round-trip corridors or stationed at primary operating depots.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <Card key={opp.id} className="bg-slate-900 border-slate-800 p-5 shadow-2xl hover:border-emerald-500/40 transition-all space-y-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-white">{opp.truck_number}</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] border-emerald-500/30">
                      {opp.opportunity_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Finishing at: <strong className="text-cyan-400">{opp.current_terminal}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold block">Net Margin</span>
                  <span className="text-lg font-extrabold text-emerald-400">
                    +₹{opp.net_margin?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Corridor details */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="text-slate-400 text-[10px]">Return Route</p>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    {opp.origin} <ArrowRight className="w-3.5 h-3.5 text-emerald-400" /> {opp.destination}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px]">Deadhead Haulage</p>
                  <p className="font-bold text-emerald-400">~{opp.deadhead_km} km</p>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-950 rounded border border-slate-850">
                  <span className="text-[10px] text-slate-400 block">Gross Freight</span>
                  <span className="font-extrabold text-white">₹{opp.indicative_revenue?.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-850">
                  <span className="text-[10px] text-slate-400 block">Fuel & Toll</span>
                  <span className="font-extrabold text-rose-400">₹{opp.estimated_operating_cost?.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-850">
                  <span className="text-[10px] text-slate-400 block">Cargo Payload</span>
                  <span className="font-extrabold text-slate-200">{opp.cargo_weight} MT</span>
                </div>
              </div>

              <Button 
                onClick={() => handleAssignBackhaul(opp)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9"
              >
                Assign Return Load & Lock Corridor
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
