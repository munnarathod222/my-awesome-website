import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertTriangle, Info, HardDrive, ArrowUpRight, ArrowDownLeft, RefreshCw, ChevronDown, ChevronUp, Server, ShieldAlert, Pencil, Save, Check } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

const hourlyBandwidthData = [
  { time: '12:45pm', outbound: 52, inbound: 2, peaks: 32 },
  { time: '2:15pm', outbound: 36, inbound: 11, peaks: null },
  { time: '4:00pm', outbound: 10, inbound: 1, peaks: null },
  { time: '5:30pm', outbound: 18, inbound: 2, peaks: null },
  { time: '7:15pm', outbound: 48, inbound: 6, peaks: 16 },
  { time: '9:00pm', outbound: 32, inbound: 1, peaks: null },
  { time: '10:45pm', outbound: 27, inbound: 2, peaks: null },
  { time: '7/24, 1am', outbound: 51, inbound: 11, peaks: 30 },
  { time: '3:00am', outbound: 14, inbound: 2, peaks: null },
  { time: '4:45am', outbound: 8, inbound: 1, peaks: null },
  { time: '6:30am', outbound: 14, inbound: 2, peaks: null },
  { time: '8:15am', outbound: 21, inbound: 1, peaks: null },
  { time: '10:00am', outbound: 17, inbound: 1, peaks: null },
  { time: '11:45am', outbound: 24, inbound: 2, peaks: null },
  { time: '1:30pm', outbound: 33, inbound: 6, peaks: 18 },
  { time: '2:45pm', outbound: 47, inbound: 5, peaks: 10 },
  { time: '4:30pm', outbound: 10, inbound: 1, peaks: null },
  { time: '6:15pm', outbound: 21, inbound: 2, peaks: null },
  { time: '8:00pm', outbound: 11, inbound: 1, peaks: null },
  { time: '9:16pm', outbound: 46, inbound: 5, peaks: 12 },
  { time: '11:00pm', outbound: 6, inbound: 1, peaks: null },
  { time: '7/25, 1am', outbound: 7, inbound: 1, peaks: null },
  { time: '3:00am', outbound: 16, inbound: 1, peaks: null },
  { time: '4:30am', outbound: 14, inbound: 1, peaks: null },
  { time: '6:00am', outbound: 3, inbound: 1, peaks: null },
  { time: '7:30am', outbound: 12, inbound: 1, peaks: null },
  { time: '9:00am', outbound: 6, inbound: 1, peaks: null },
  { time: '10:15am', outbound: 8, inbound: 2, peaks: null },
  { time: '11:30am', outbound: 22, inbound: 4, peaks: 16 }
];

const BandwidthTrackerCard = () => {
  const [showDetails, setShowDetails] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Editable per-GB overage rate state
  const [ratePerGBUSD, setRatePerGBUSD] = useState(() => {
    const saved = localStorage.getItem('jbc_bandwidth_rate_usd');
    return saved !== null ? parseFloat(saved) || 0.10 : 0.10;
  });

  const [isEditingRate, setIsEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState(ratePerGBUSD.toString());

  const currentMonthUsageGB = 8.91;
  const freeTierLimitGB = 5.00;
  const overageGB = Math.max(0, currentMonthUsageGB - freeTierLimitGB);
  const percentageUsed = Math.min(100, Math.round((currentMonthUsageGB / freeTierLimitGB) * 100));
  
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
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
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
                <h3 className="text-2xl font-black mt-1 text-purple-600 dark:text-purple-400">
                  {currentMonthUsageGB} GB
                </h3>
              </div>
              <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-medium">
              Data transferred to clients & users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Free Included Bandwidth</p>
                <h3 className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
                  {freeTierLimitGB.toFixed(2)} GB
                </h3>
              </div>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <HardDrive className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-medium">
              Complimentary monthly allowance
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-sm rounded-2xl border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chargeable Overage</p>
                <h3 className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">
                  +{overageGB.toFixed(2)} GB
                </h3>
              </div>
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-amber-500 font-bold mt-3">
              Above 5 GB threshold limit
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
                <h3 className="text-2xl font-black mt-1 text-foreground">
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
                  <button onClick={() => { setRateInput('0.50'); setRatePerGBUSD(0.50); localStorage.setItem('jbc_bandwidth_rate_usd', '0.50'); setIsEditingRate(false); }} className="px-1.5 py-0.5 rounded bg-muted/60 hover:bg-primary/20 hover:text-primary font-mono">$0.50</button>
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
              Outbound Bandwidth
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px] uppercase tracking-wider">
                Live Server Metrics
              </Badge>
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              This graph's resolution is fixed at one data point per hour.
            </p>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            className="bg-[#18181b] border-[#27272a] text-zinc-300 hover:text-white hover:bg-[#27272a] rounded-xl text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Metrics
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {/* Chart Container */}
          <div className="h-72 w-full pt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyBandwidthData} margin={{ top: 25, right: 15, left: -10, bottom: 0 }}>
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
                  domain={[0, 60]}
                  ticks={[0, 10, 20, 30, 40, 50]}
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
                          <p className="text-emerald-400 font-semibold">
                            Inbound: <span className="font-mono text-white">{payload[1]?.value} MB</span>
                          </p>
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
                <span className="text-zinc-300 font-medium">Outbound Traffic (Downloads / API Responses)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-sm"></span>
                <span className="text-zinc-300 font-medium">Inbound Traffic (Uploads / API Requests)</span>
              </div>
            </div>

            <span className="text-zinc-400 font-mono text-[11px]">
              Peak Hourly Rate: 52 MB/hr
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
                <span>Usage this month</span>
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
                    {/* Free tier 5GB section */}
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: '56%' }}></div>
                    {/* Overage section */}
                    <div className="h-full bg-amber-500 absolute top-0 left-[56%] transition-all" style={{ width: '44%' }}></div>
                  </div>
                </div>

                {/* Warning Alert Banner */}
                {currentMonthUsageGB > freeTierLimitGB && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-amber-300 text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <strong className="font-bold">Bandwidth Allowance Threshold Reached:</strong>
                      <p className="mt-0.5 text-amber-300/90 leading-relaxed">
                        Outbound bandwidth has exceeded the complimentary <strong>5.00 GB</strong> free limit by <strong>{overageGB.toFixed(2)} GB</strong>. Subsequent outbound data transfer is billed at standard cloud host rates ($0.10 / GB).
                      </p>
                    </div>
                  </div>
                )}

                {/* Optimization Tips */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-[#1c1c20] rounded-xl border border-[#27272a]">
                    <p className="font-semibold text-white">⚡ Image Optimization</p>
                    <p className="text-zinc-400 text-[11px] mt-1">Compress logo and e-signature image uploads to WebP format to reduce response size.</p>
                  </div>

                  <div className="p-3 bg-[#1c1c20] rounded-xl border border-[#27272a]">
                    <p className="font-semibold text-white">📄 PDF Caching</p>
                    <p className="text-zinc-400 text-[11px] mt-1">Generate PDF statements directly on client browsers to minimize server outbound data.</p>
                  </div>

                  <div className="p-3 bg-[#1c1c20] rounded-xl border border-[#27272a]">
                    <p className="font-semibold text-white">📊 Automatic Reset</p>
                    <p className="text-zinc-400 text-[11px] mt-1">Bandwidth counters automatically reset to 0.00 GB on the 1st of every calendar month.</p>
                  </div>
                </div>
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
