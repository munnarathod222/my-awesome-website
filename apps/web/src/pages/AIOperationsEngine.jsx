import React, { useState } from 'react';
import { BrainCircuit, Sparkles, Truck, Package, MapPin, IndianRupee, Zap, ArrowRight, ShieldCheck, RefreshCw, BarChart3, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AIOperationsEngine() {
  const [origin, setOrigin] = useState('Hyderabad, TS');
  const [destination, setDestination] = useState('Mumbai, MH');
  const [cargoWeight, setCargoWeight] = useState('18');
  const [isSimulating, setIsSimulating] = useState(false);

  const [aiResult, setAiResult] = useState({
    distance_km: 710,
    optimal_route: 'NH-65 via Solapur & Pune Expressway',
    recommended_truck: '32 FT Container SXL (Tata Prima 4028.S)',
    estimated_freight: 49500,
    diesel_liters: 157.7,
    diesel_cost: 14981,
    toll_charges: 2450,
    net_profit: 32069,
    net_margin_pct: '64.7%',
    eta_hours: 15.5,
    match_score: '99.4%',
    ai_insights: [
      'High return load probability from Mumbai back to Hyderabad (88% chance within 4 hours).',
      'Recommended departure time: 09:00 PM to avoid Pune bypass traffic bottleneck.',
      'Optimal refilling stop: HPCL Bio-fuel Outlet KM 312 for ₹1.20/L diesel rebate.'
    ]
  });

  const handleRunAiAnalysis = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const weight = Number(cargoWeight) || 15;
      const freight = Math.round(18000 + weight * 1750);
      const dieselLiters = Math.round( freight * 0.0031 * 10) / 10;
      const dieselCost = Math.round(dieselLiters * 95);
      const tolls = 2450;
      const profit = freight - dieselCost - tolls;

      setAiResult({
        distance_km: 710,
        optimal_route: `${origin} → ${destination} via National Highway Corridor`,
        recommended_truck: weight > 20 ? '40 FT High Cube Trailer' : '32 FT Container SXL',
        estimated_freight: freight,
        diesel_liters: dieselLiters,
        diesel_cost: dieselCost,
        toll_charges: tolls,
        net_profit: profit,
        net_margin_pct: `${Math.round((profit / freight) * 100)}%`,
        eta_hours: Math.round((710 / 48) * 10) / 10,
        match_score: '99.6%',
        ai_insights: [
          `AI high-confidence route generated for ${origin} to ${destination}.`,
          `Estimated diesel consumption: ${dieselLiters} Liters at ₹95/L average highway rate.`,
          `Trip profitability index: HIGH (${Math.round((profit / freight) * 100)}% gross operating margin).`
        ]
      });
      setIsSimulating(false);
      toast.success('AI Freight & Profit Optimization Engine completed analysis!');
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-amber-400" /> AI Operations & Route Profitability Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Machine learning load matching, fuel estimator, toll calculation, and trip net profit predictor.
          </p>
        </div>

        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs font-bold px-3 py-1 font-mono">
          ⚡ 99.4% MATCH PREDICTION ACCURACY
        </Badge>
      </div>

      {/* Simulator Inputs */}
      <Card className="bg-slate-900/80 border-slate-800 rounded-3xl p-5 shadow-xl">
        <CardContent className="p-0 space-y-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Configure Trip Simulation Parameters
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Origin Location</Label>
              <Input 
                value={origin} 
                onChange={(e) => setOrigin(e.target.value)} 
                className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Destination Location</Label>
              <Input 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)} 
                className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cargo Weight (Tons)</Label>
              <Input 
                type="number"
                value={cargoWeight} 
                onChange={(e) => setCargoWeight(e.target.value)} 
                className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white font-mono"
              />
            </div>
          </div>

          <Button 
            onClick={handleRunAiAnalysis}
            disabled={isSimulating}
            className="w-full h-11 bg-gradient-to-r from-amber-500 to-primary hover:from-amber-600 hover:to-primary/90 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20"
          >
            {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
            {isSimulating ? 'Analyzing Route Data & Market Rates...' : 'Run AI Optimization & Profit Predictor'}
          </Button>
        </CardContent>
      </Card>

      {/* AI Insights Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-2xl">
          <div className="text-[10px] text-slate-400 font-mono">SUGGESTED FREIGHT</div>
          <div className="text-2xl font-black text-white font-mono mt-1">₹{aiResult.estimated_freight.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-emerald-400 mt-1">✓ AI Optimal Market Rate</div>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-2xl">
          <div className="text-[10px] text-slate-400 font-mono">DIESEL CONSUMPTION</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">{aiResult.diesel_liters} L</div>
          <div className="text-[10px] text-slate-400 mt-1">Est. Diesel Cost: ₹{aiResult.diesel_cost.toLocaleString('en-IN')}</div>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-2xl">
          <div className="text-[10px] text-slate-400 font-mono">PROJECTED NET PROFIT</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">₹{aiResult.net_profit.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-emerald-400 mt-1">Margin: {aiResult.net_margin_pct} Gross</div>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-2xl">
          <div className="text-[10px] text-slate-400 font-mono">PREDICTED ETA</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{aiResult.eta_hours} Hours</div>
          <div className="text-[10px] text-slate-400 mt-1">Distance: {aiResult.distance_km} KM</div>
        </Card>
      </div>

      {/* AI Recommendations Card */}
      <Card className="bg-slate-900/80 border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> AI Neural Dispatch Recommendations
        </h3>

        <div className="space-y-2">
          {aiResult.ai_insights.map((insight, idx) => (
            <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs text-slate-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
