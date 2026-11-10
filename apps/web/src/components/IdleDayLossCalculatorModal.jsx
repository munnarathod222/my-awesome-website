import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingDown, AlertTriangle, IndianRupee, Truck, Calendar, 
  Clock, ShieldAlert, FileText, Share2, Copy, Check, ChevronRight, X, Sparkles, Building2
} from 'lucide-react';
import { toast } from 'sonner';

export default function IdleDayLossCalculatorModal({ 
  isOpen, 
  onClose, 
  truck, 
  allTrucks = [], 
  allLoanProfiles = [],
  allTrips = [] 
}) {
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'detention'
  const [selectedTruckId, setSelectedTruckId] = useState('');
  
  // Custom loss parameter states
  const [daysIdle, setDaysIdle] = useState(3);
  const [monthlyEmi, setMonthlyEmi] = useState(42000);
  const [driverDailyWage, setDriverDailyWage] = useState(700);
  const [insuranceTaxDaily, setInsuranceTaxDaily] = useState(250);
  const [parkingDaily, setParkingDaily] = useState(150);
  
  // Opportunity cost parameters
  const [dailyRevenue, setDailyRevenue] = useState(8000);
  const [profitMarginPct, setProfitMarginPct] = useState(25);

  // Detention Claim Form States
  const [consigneeName, setConsigneeName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [delayedHours, setDelayedHours] = useState(48);
  const [freeHoursAgreed, setFreeHoursAgreed] = useState(24);
  const [detentionRatePerDay, setDetentionRatePerDay] = useState(3000);
  const [copied, setCopied] = useState(false);

  // Sync selected truck when modal opens or truck prop changes
  useEffect(() => {
    if (truck) {
      setSelectedTruckId(truck.id || truck.truckId || '');
    } else if (allTrucks.length > 0) {
      setSelectedTruckId(allTrucks[0].id);
    }
  }, [truck, allTrucks, isOpen]);

  // Find active truck object
  const currentTruck = useMemo(() => {
    return allTrucks.find(t => t.id === selectedTruckId) || truck || allTrucks[0] || null;
  }, [selectedTruckId, allTrucks, truck]);

  // Auto-populate EMI from loan_profiles if linked
  useEffect(() => {
    if (!currentTruck) return;
    const linkedProfile = allLoanProfiles.find(p => p.truck_id === currentTruck.id);
    if (linkedProfile && linkedProfile.loanAmount && linkedProfile.loanTerm) {
      // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
      const P = Number(linkedProfile.loanAmount);
      const annualRate = Number(linkedProfile.interestRate) || 9.5;
      const r = annualRate / (12 * 100);
      const n = Number(linkedProfile.loanTerm) || 36;
      if (r > 0 && n > 0) {
        const emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
        setMonthlyEmi(emi);
      }
    } else {
      // Reasonable defaults based on vehicle type
      setMonthlyEmi(45000);
    }

    // Try to auto-estimate days idle from last trip
    const truckNumber = currentTruck.truck_number || currentTruck.truckNumber;
    if (truckNumber && allTrips.length > 0) {
      const lastTrip = allTrips.find(t => t.truck_number === truckNumber && t.date);
      if (lastTrip && lastTrip.date) {
        const diffDays = Math.max(0, Math.floor((new Date() - new Date(lastTrip.date)) / (1000 * 60 * 60 * 24)));
        if (diffDays > 0) {
          setDaysIdle(Math.min(diffDays, 30));
        }
      }
    }
  }, [currentTruck, allLoanProfiles, allTrips]);

  // ── Financial Math Computations ─────────────────────────────────────────────
  const dailyEmi = Math.round(monthlyEmi / 30);
  const totalDailyFixedBleed = dailyEmi + Number(driverDailyWage) + Number(insuranceTaxDaily) + Number(parkingDaily);
  const cumulativeFixedBleed = totalDailyFixedBleed * daysIdle;

  const foregoneGrossRevenue = Number(dailyRevenue) * daysIdle;
  const foregoneNetMargin = Math.round(foregoneGrossRevenue * (Number(profitMarginPct) / 100));
  const totalEconomicLoss = cumulativeFixedBleed + foregoneNetMargin;

  // Recovery trips: assuming avg trip profit = ~₹4,500
  const avgTripProfit = Math.round(Number(dailyRevenue) * 2 * (Number(profitMarginPct) / 100)) || 4000;
  const recoveryTripsNeeded = Math.ceil(totalEconomicLoss / avgTripProfit);

  // Detention Calculation
  const billableDetentionHours = Math.max(0, Number(delayedHours) - Number(freeHoursAgreed));
  const billableDetentionDays = (billableDetentionHours / 24).toFixed(1);
  const totalDetentionClaimAmount = Math.round(Math.max(1, Math.ceil(billableDetentionHours / 24)) * Number(detentionRatePerDay));

  // Generate WhatsApp Detention Claim Note
  const generateWhatsAppClaim = () => {
    const truckNo = currentTruck?.truck_number || currentTruck?.truckNumber || 'Commercial Truck';
    return `🚨 *OFFICIAL DETENTION CHARGE INVOICE CLAIM*
*JAI BHAVANI CARGO & TRANSPORT SOLUTIONS*
---------------------------------------------
📋 *Consignment / Vehicle Details:*
• Vehicle No: *${truckNo}*
• Consignee / Plant: *${consigneeName || 'Factory Warehouse'}*
• Halt Location: *${locationName || 'Unloading Yard'}*

⏱️ *Detention Breakdown:*
• Total Plant Halt: *${delayedHours} Hours*
• Free Unloading Time Allowed: *${freeHoursAgreed} Hours*
• Net Billable Detention: *${billableDetentionHours} Hours (${billableDetentionDays} Days)*
• Standard Detention Tariff: *₹${Number(detentionRatePerDay).toLocaleString('en-IN')} / 24 hrs*

💰 *TOTAL DETENTION PAYABLE:*
👉 *₹${totalDetentionClaimAmount.toLocaleString('en-IN')}*

⚠️ _Notice: As per All-India Motor Transport Congress (AIMTC) freight contract norms, detention beyond agreed free unloading window is payable immediately prior to final gate clearance._`;
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppClaim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Detention notice copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl bg-slate-950 border border-slate-800 text-white rounded-3xl p-4 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh] box-border min-w-0">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">Idle Day Loss Calculator</h3>
                <Badge variant="outline" className="border-rose-500/30 text-rose-400 bg-rose-500/10 text-[10px] font-mono">
                  LIVE ENGINE
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Quantify silent cash bleed and generate detention recovery claims
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl mt-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'calculator' 
                ? 'bg-rose-600 text-white shadow-md font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Idle Standing Bleed</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('detention')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'detention' 
                ? 'bg-amber-600 text-white shadow-md font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Client Detention Claimer</span>
          </button>
        </div>

        {/* TAB 1: IDLE STANDING LOSS CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="space-y-4 pt-3">
            {/* Truck Selector & Days Slider */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <Label className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Select Vehicle to Analyze:
                </Label>
                {allTrucks.length > 0 && (
                  <select
                    value={selectedTruckId}
                    onChange={e => setSelectedTruckId(e.target.value)}
                    className="h-8 text-xs font-mono font-bold bg-slate-950 border border-slate-700 text-amber-300 rounded-lg px-2.5 focus:outline-none focus:border-amber-500"
                  >
                    {allTrucks.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.truck_number || t.truckNumber} ({t.ownership_type || 'Fleet'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Days Idle Slider */}
              <div className="pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Days Vehicle Has Been Idle:</span>
                  <span className="text-base font-black font-mono text-rose-400 bg-rose-950/40 border border-rose-500/30 px-2.5 py-0.5 rounded-lg">
                    {daysIdle} {daysIdle === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={daysIdle}
                  onChange={e => setDaysIdle(parseInt(e.target.value, 10))}
                  className="w-full mt-2 accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>1 day</span>
                  <span>7 days</span>
                  <span>15 days</span>
                  <span>30 days</span>
                </div>
              </div>
            </div>

            {/* Hero Loss Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Daily Bleed Rate */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Daily Cash Bleed
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-rose-400 mt-1 block">
                  ₹{totalDailyFixedBleed.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500">Every 24 hrs truck sits</span>
              </div>

              {/* Cumulative Fixed Bleed */}
              <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-2xl">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                  Total Cash Lost ({daysIdle}d)
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-rose-300 mt-1 block">
                  ₹{cumulativeFixedBleed.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-rose-400/80">Direct out-of-pocket drain</span>
              </div>

              {/* Total Economic Loss (Inc Opportunity) */}
              <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-2xl">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Total Economic Loss
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-300 mt-1 block">
                  ₹{totalEconomicLoss.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-400/80">Bleed + Lost ₹{foregoneNetMargin.toLocaleString('en-IN')} margin</span>
              </div>
            </div>

            {/* Cost Breakdown Drill-down */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-2">
                Fixed Daily Cost Breakdown (Customizable)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {/* EMI */}
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Monthly EMI</span>
                  </div>
                  <input
                    type="number"
                    value={monthlyEmi}
                    onChange={e => setMonthlyEmi(Number(e.target.value) || 0)}
                    className="w-full mt-1 bg-transparent font-mono font-bold text-slate-200 border-b border-slate-700 text-xs py-0.5 focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">₹{dailyEmi}/day</span>
                </div>

                {/* Driver Salary */}
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Driver Daily Pay</span>
                  <input
                    type="number"
                    value={driverDailyWage}
                    onChange={e => setDriverDailyWage(Number(e.target.value) || 0)}
                    className="w-full mt-1 bg-transparent font-mono font-bold text-slate-200 border-b border-slate-700 text-xs py-0.5 focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Retainer wage</span>
                </div>

                {/* Insurance & Taxes */}
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Insurance / NP / Tax</span>
                  <input
                    type="number"
                    value={insuranceTaxDaily}
                    onChange={e => setInsuranceTaxDaily(Number(e.target.value) || 0)}
                    className="w-full mt-1 bg-transparent font-mono font-bold text-slate-200 border-b border-slate-700 text-xs py-0.5 focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Daily amortization</span>
                </div>

                {/* Parking */}
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Yard / Dhaba Halt</span>
                  <input
                    type="number"
                    value={parkingDaily}
                    onChange={e => setParkingDaily(Number(e.target.value) || 0)}
                    className="w-full mt-1 bg-transparent font-mono font-bold text-slate-200 border-b border-slate-700 text-xs py-0.5 focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Parking charges</span>
                </div>
              </div>
            </div>

            {/* Recovery Alert Box */}
            <div className="p-3.5 bg-blue-950/20 border border-blue-500/30 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-300 block">
                    Trips Needed to Recover Lost Money:
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Requires <strong className="text-blue-300">{recoveryTripsNeeded} successful trips</strong> just to break even from this {daysIdle}-day idle period!
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  onClose();
                  window.location.href = '/trip-logs';
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl px-3 h-8 shrink-0"
              >
                Assign Load →
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: DETENTION CLAIM GENERATOR */}
        {activeTab === 'detention' && (
          <div className="space-y-4 pt-3">
            <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Recover Detention from Delaying Clients
              </span>
              <p className="text-slate-400 text-[11px]">
                When your truck is stranded at a factory, consignor warehouse, or delivery site beyond free unloading hours, legally claim detention damages.
              </p>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Consignee / Client Name:</Label>
                <Input
                  placeholder="e.g. Reliance Logistics / Tata Steel"
                  value={consigneeName}
                  onChange={e => setConsigneeName(e.target.value)}
                  className="h-8 bg-slate-900 border-slate-700 text-xs text-white rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Plant / Warehouse Location:</Label>
                <Input
                  placeholder="e.g. Balanagar Depot / Nhava Sheva"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  className="h-8 bg-slate-900 border-slate-700 text-xs text-white rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Total Hours Vehicle Held at Plant:</Label>
                <Input
                  type="number"
                  value={delayedHours}
                  onChange={e => setDelayedHours(Number(e.target.value) || 0)}
                  className="h-8 bg-slate-900 border-slate-700 text-xs text-white rounded-lg font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Free Agreed Unloading Hours:</Label>
                <Input
                  type="number"
                  value={freeHoursAgreed}
                  onChange={e => setFreeHoursAgreed(Number(e.target.value) || 0)}
                  className="h-8 bg-slate-900 border-slate-700 text-xs text-white rounded-lg font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-[11px] text-slate-400">Detention Tariff Rate per 24 Hours (₹):</Label>
                <Input
                  type="number"
                  value={detentionRatePerDay}
                  onChange={e => setDetentionRatePerDay(Number(e.target.value) || 0)}
                  className="h-8 bg-slate-900 border-slate-700 text-xs text-amber-300 rounded-lg font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500">Standard All-India AIMTC rate: ₹2,500 – ₹3,500/day</span>
              </div>
            </div>

            {/* Detention Total Amount Banner */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Billable Detention ({billableDetentionHours} Hours)
                </span>
                <span className="text-2xl font-black font-mono text-emerald-400 mt-0.5 block">
                  ₹{totalDetentionClaimAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <Button
                onClick={handleCopyWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl px-4 h-9 gap-1.5 shadow-lg"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy WhatsApp Notice'}</span>
              </Button>
            </div>

            {/* Message Preview */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto select-all">
              {generateWhatsAppClaim()}
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
