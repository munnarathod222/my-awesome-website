import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, Info, HardDrive, ArrowUpRight, RefreshCw, Server, ShieldAlert, Pencil, Save, Database, Layers } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const BandwidthTrackerCard = () => {
  const [showDetails, setShowDetails] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  // Editable per-GB overage rate state
  const [ratePerGBUSD, setRatePerGBUSD] = useState(() => {
    const saved = localStorage.getItem('jbc_bandwidth_rate_usd');
    return saved !== null ? parseFloat(saved) || 0.10 : 0.10;
  });

  const [isEditingRate, setIsEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState(ratePerGBUSD.toString());

  const fetchRealBandwidthMetrics = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await apiServerClient.fetch('/bandwidth');
      if (!res.ok) throw new Error('Failed to fetch bandwidth metrics');
      const data = await res.json();
      if (data.success) {
        setMetrics(data);
      }
    } catch (err) {
      console.error('Error loading real bandwidth data:', err);
      if (isManual) toast.error('Failed to update live metrics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRealBandwidthMetrics();
    // Auto-refresh metrics every 60 seconds
    const interval = setInterval(() => {
      fetchRealBandwidthMetrics();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchRealBandwidthMetrics]);

  // Dynamic values from backend or fallback
  const currentMonthUsageGB = metrics?.bandwidth?.monthlyOutboundGB ?? 0;
  const freeTierLimitGB = metrics?.bandwidth?.freeTierLimitGB ?? 5.00;
  const overageGB = Math.max(0, currentMonthUsageGB - freeTierLimitGB);
  const percentageUsed = Math.min(100, Math.round((currentMonthUsageGB / freeTierLimitGB) * 100));

  // Hourly chart data
  const chartData = metrics?.bandwidth?.hourlyChart || [];
  
  // Peak rate computation
  const peakHourlyMB = chartData.length > 0 
    ? Math.max(...chartData.map(d => d.outbound || 0))
    : 0;

  // Dynamic overage calculation based on user's custom rate
  const activeRateUSD = parseFloat(rateInput) >= 0 ? parseFloat(rateInput) : ratePerGBUSD;
  const estimatedOverageCostUSD = (overageGB * activeRateUSD).toFixed(2);
  const estimatedOverageCostINR = Math.round(overageGB * activeRateUSD * 83);

  const handleSaveRate = () => {
    const val = parseFloat(rateInput);
    if (!isNaN(val) && val >= 0) {
      setRatePerGBUSD(val);
      localStorage.setItem('jbc_bandwidth_rate_usd', val.toString());
      setIsEditingRate(false);
      toast.success(`Custom rate updated to $${val.toFixed(2)}/GB`);
    }
  };

  const handleRefresh = () => {
    fetchRealBandwidthMetrics(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border/50 shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Outbound</p>
                <h3 className="text-2xl font-black mt-1 text-purple-600 dark:text-purple-400 tabular-nums">
                  {isLoading ? '...' : `${currentMonthUsageGB} GB`}
                </h3>
              </div>
              <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-medium flex items-center gap-1">
              <span>Data transferred to clients</span>
              {metrics?.source === 'render' && (
                <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-1 py-0 ml-auto font-mono">
                  Render API
                </Badge>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Database Records & Storage</p>
                <h3 className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {isLoading ? '...' : `${metrics?.storage?.totalRecords ?? 0} Recs`}
                </h3>
              </div>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-medium">
              ~{metrics?.storage?.estimatedUsedMB ?? 0} MB database attachments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-sm rounded-2xl border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chargeable Overage</p>
                <h3 className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400 tabular-nums">
                  +{overageGB.toFixed(3)} GB
                </h3>
              </div>
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-amber-500 font-bold mt-3">
              {overageGB > 0 ? 'Above 5 GB threshold limit' : 'Within complimentary 5 GB quota'}
            </p>
          </CardContent>
        </Card>

        {/* Editable Est. Overage Charge Card */}
        <Card className="bg-card border-border/50 shadow-sm rounded-2xl relative group">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Est. Overage Charge</p>
                  <button 
                    onClick={() => {
                      setRateInput(ratePerGBUSD.toString());
                      setIsEditingRate(!isEditingRate);
                    }}
                    title="Edit per-GB rate"
                    className="p-0.5 text-muted-foreground hover:text-primary rounded transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="text-2xl font-black mt-1 text-foreground tabular-nums">
                  ₹{estimatedOverageCostINR} <span className="text-xs font-normal text-muted-foreground">(${estimatedOverageCostUSD})</span>
                </h3>
              </div>
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                <Server className="w-5 h-5" />
              </div>
            </div>

            {/* Editable Rate Form or Display */}
            {isEditingRate ? (
              <div className="mt-3 pt-2 border-t border-border/40 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-muted-foreground">$</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={rateInput} 
                    onChange={e => setRateInput(e.target.value)}
                    placeholder="0.10"
                    className="w-20 h-7 px-2 text-xs font-bold font-mono bg-background border border-primary/40 focus:border-primary rounded-lg focus:outline-none"
                  />
                  <span className="text-xs text-muted-foreground font-semibold">/ GB</span>
                  <Button 
                    type="button" 
                    size="sm"
                    onClick={handleSaveRate}
                    className="h-7 px-2.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg ml-auto"
                  >
                    <Save className="w-3 h-3 mr-1" /> Save
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  <span className="text-muted-foreground">Presets:</span>
                  <button onClick={() => { setRateInput('0.10'); setRatePerGBUSD(0.10); localStorage.setItem('jbc_bandwidth_rate_usd', '0.10'); setIsEditingRate(false); }} className="px-1.5 py-0.5 rounded bg-muted/60 hover:bg-primary/20 hover:text-primary font-mono">$0.10</button>
                  <button onClick={() => { setRateInput('0.15'); setRatePerGBUSD(0.15); localStorage.setItem('jbc_bandwidth_rate_usd', '0.15'); setIsEditingRate(false); }} className="px-1.5 py-0.5 rounded bg-muted/60 hover:bg-primary/20 hover:text-primary font-mono">$0.15</button>
                  <button onClick={() => { setRateInput('0.20'); setRatePerGBUSD(0.20); localStorage.setItem('jbc_bandwidth_rate_usd', '0.20'); setIsEditingRate(false); }} className="px-1.5 py-0.5 rounded bg-muted/60 hover:bg-primary/20 hover:text-primary font-mono">$0.20</button>
                </div>
              </div>
            ) : (
              <p 
                onClick={() => {
                  setRateInput(ratePerGBUSD.toString());
                  setIsEditingRate(true);
                }}
                className="text-xs text-muted-foreground mt-3 font-medium cursor-pointer hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>Custom rate: <strong className="text-foreground font-mono">${ratePerGBUSD.toFixed(2)} / GB</strong></span>
                <Pencil className="w-2.5 h-2.5 opacity-60" />
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Dark Outbound Bandwidth Chart Card */}
      <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white rounded-2xl shadow-xl overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-[#1f1f23]">
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              Outbound Traffic & Activity
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px] uppercase tracking-wider font-mono">
                {metrics?.source === 'render' ? 'Live Render API' : 'Real-time PocketBase Sync'}
              </Badge>
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              Real-time traffic throughput updated automatically every 60s.
            </p>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-[#18181b] border-[#27272a] text-zinc-300 hover:text-white hover:bg-[#27272a] rounded-xl text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Metrics
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {/* Chart Container */}
          <div className="h-72 w-full pt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 25, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="outboundGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="inboundGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#27272a' }}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  unit=" MB"
                />

                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-xl shadow-xl text-xs text-white space-y-1">
                          <p className="font-bold text-zinc-400">{label}</p>
                          <p className="text-purple-400 font-semibold">
                            Outbound: <span className="font-mono text-white">{payload[0]?.value} MB</span>
                          </p>
                          {payload[1] && (
                            <p className="text-emerald-400 font-semibold">
                              Inbound: <span className="font-mono text-white">{payload[1]?.value} MB</span>
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area 
                  type="monotone" 
                  dataKey="outbound" 
                  name="Outbound (MB)" 
                  stroke="#c084fc" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#outboundGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="inbound" 
                  name="Inbound (MB)" 
                  stroke="#4ade80" 
                  strokeWidth={1.5}
                  fillOpacity={1} 
                  fill="url(#inboundGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-[#1f1f23] text-xs">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-400 inline-block shadow-sm"></span>
                <span className="text-zinc-300 font-medium">Outbound Traffic (API Responses & Media)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-sm"></span>
                <span className="text-zinc-300 font-medium">Inbound Traffic (Uploads & Requests)</span>
              </div>
            </div>

            <span className="text-zinc-400 font-mono text-[11px]">
              Peak Hourly Rate: {peakHourlyMB > 0 ? `${peakHourlyMB.toFixed(2)} MB/hr` : 'N/A'}
            </span>
          </div>

          {/* Usage This Month Drawer / Progress Box */}
          <div className="mt-6 bg-[#141417] border border-[#27272a] rounded-2xl p-4 transition-all">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-left font-bold text-sm text-white hover:text-purple-400 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90 text-purple-400' : 'text-zinc-400'}`} />
                <span>Usage & Database Statistics</span>
              </div>
              <span className="font-mono text-base font-black text-purple-300">
                {currentMonthUsageGB} GB
              </span>
            </button>

            {showDetails && (
              <div className="mt-4 pt-4 border-t border-[#27272a] space-y-4 animate-in fade-in duration-200">
                {/* Visual Bandwidth Usage Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-zinc-300">
                    <span>Monthly Quota Used ({percentageUsed}% of Included Free Tier)</span>
                    <span className="font-mono text-amber-400">
                      {currentMonthUsageGB} GB / {freeTierLimitGB.toFixed(2)} GB
                    </span>
                  </div>

                  <div className="w-full h-3 bg-[#27272a] rounded-full overflow-hidden relative">
                    {/* Free tier section */}
                    <div 
                      className="h-full bg-emerald-500 transition-all" 
                      style={{ width: `${Math.min(100, percentageUsed)}%` }}
                    ></div>
                    {/* Overage section if > 100% */}
                    {percentageUsed > 100 && (
                      <div 
                        className="h-full bg-amber-500 absolute top-0 left-0 transition-all opacity-80" 
                        style={{ width: '100%' }}
                      ></div>
                    )}
                  </div>
                </div>

                {/* Warning Alert Banner */}
                {currentMonthUsageGB > freeTierLimitGB && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-amber-300 text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <strong className="font-bold">Bandwidth Allowance Threshold Reached:</strong>
                      <p className="mt-0.5 text-amber-300/90 leading-relaxed">
                        Outbound bandwidth has exceeded the complimentary <strong>5.00 GB</strong> free limit by <strong>{overageGB.toFixed(3)} GB</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {/* Real Collection Breakdown */}
                {metrics?.storage?.collections && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" /> Live Database Record Counts:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {Object.entries(metrics.storage.collections).map(([col, count]) => (
                        <div key={col} className="p-2 bg-[#1c1c20] rounded-lg border border-[#27272a] flex justify-between items-center">
                          <span className="text-zinc-400 capitalize truncate text-[11px]">{col.replace(/_/g, ' ')}</span>
                          <span className="font-mono font-bold text-white text-[11px]">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ChevronRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default BandwidthTrackerCard;
