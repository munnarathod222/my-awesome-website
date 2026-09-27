import React, { useState, useMemo } from 'react';
import { Calculator, Save, Disc, CheckCircle, ArrowRightLeft, Check, Copy, Printer, RotateCcw, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { tripCalculationService } from '../services/tripCalculationService';
import { ORR_INTERCHANGES, calculateOrrToll } from '../data/orrTollRates';

export const TripOverviewPage: React.FC = () => {
  // Operational Frequency & Allocation Mode
  const [allocationMode, setAllocationMode] = useState<'trips_frequency' | 'working_days'>('trips_frequency');
  const [tripsPerMonth, setTripsPerMonth] = useState(15);
  const [tripDays, setTripDays] = useState(2);
  const [workingDaysMonthly, setWorkingDaysMonthly] = useState(25);

  // Part [A]: Fixed Base Fleet Costs
  const [emiMonthly, setEmiMonthly] = useState(42000);
  const [driverSalaryMonthly, setDriverSalaryMonthly] = useState(22000);
  const [insuranceAnnual, setInsuranceAnnual] = useState(65000);
  const [roadTaxAnnual, setRoadTaxAnnual] = useState(28000);
  const [permitsAnnual, setPermitsAnnual] = useState(18000);

  // Part [B]: Variable Running Costs
  const [distanceKm, setDistanceKm] = useState(650);
  const [mileageKmpl, setMileageKmpl] = useState(4.5);
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState(92.5);
  const [tollCost, setTollCost] = useState(1400);
  const [tyreWearPerKm, setTyreWearPerKm] = useState(2.50);
  const [maintenancePerKm, setMaintenancePerKm] = useState(1.80);
  const [loadingUnloadingCost, setLoadingUnloadingCost] = useState(1200);
  const [driverBattaPerTrip, setDriverBattaPerTrip] = useState(800);

  // Bidding & Target Margin
  const [targetMarginPct, setTargetMarginPct] = useState(15);
  const [clientOfferRevenue, setClientOfferRevenue] = useState(38000);

  // Save Modal & Status
  const [saveModal, setSaveModal] = useState(false);
  const [routeName, setRouteName] = useState('HYD-WAR-01 (FORWARD)');
  const [vehicleNumber, setVehicleNumber] = useState('TG12U2637');
  const [savedNotif, setSavedNotif] = useState(false);

  // Hyderabad ORR Toll Widget State
  const [orrOrigin, setOrrOrigin] = useState('1');
  const [orrDestination, setOrrDestination] = useState('16');
  const [orrTripType, setOrrTripType] = useState<'single' | 'return24h'>('single');
  const [orrApplied, setOrrApplied] = useState(false);

  const orrResult = calculateOrrToll(orrOrigin, orrDestination, 'truck_3axle', orrTripType);

  const handleApplyOrrToll = () => {
    if (!orrResult || !orrResult.success) return;
    setTollCost(orrResult.selectedFare);
    setOrrApplied(true);
    setTimeout(() => setOrrApplied(false), 2000);
  };

  const handleSwapOrr = () => {
    const prevO = orrOrigin;
    setOrrOrigin(orrDestination);
    setOrrDestination(prevO);
  };

  // Mathematical Cost Engine [A + B]
  const calc = useMemo(() => {
    // 1. Part [A] Monthly Base Fixed Costs
    const insuranceMonthly = (parseFloat(insuranceAnnual as any) || 0) / 12;
    const roadTaxMonthly = (parseFloat(roadTaxAnnual as any) || 0) / 12;
    const permitsMonthly = (parseFloat(permitsAnnual as any) || 0) / 12;
    const totalMonthlyFixed =
      (parseFloat(emiMonthly as any) || 0) +
      (parseFloat(driverSalaryMonthly as any) || 0) +
      insuranceMonthly +
      roadTaxMonthly +
      permitsMonthly;

    // Allocated Fixed Cost Per Trip [A]
    let allocatedFixedCost = 0;
    if (allocationMode === 'trips_frequency') {
      const freq = Math.max(1, parseFloat(tripsPerMonth as any) || 1);
      allocatedFixedCost = totalMonthlyFixed / freq;
    } else {
      const daysInMonth = Math.max(1, parseFloat(workingDaysMonthly as any) || 25);
      const fixedPerDay = totalMonthlyFixed / daysInMonth;
      allocatedFixedCost = fixedPerDay * (parseFloat(tripDays as any) || 1);
    }

    // 2. Part [B] Variable Trip Costs
    const dist = Math.max(0, parseFloat(distanceKm as any) || 0);
    const kmpl = Math.max(0.1, parseFloat(mileageKmpl as any) || 4.5);
    const fuelPrice = parseFloat(fuelPricePerLitre as any) || 0;
    const fuelLitres = dist / kmpl;
    const fuelCost = fuelLitres * fuelPrice;

    const toll = parseFloat(tollCost as any) || 0;
    const tyreCost = dist * (parseFloat(tyreWearPerKm as any) || 0);
    const maintCost = dist * (parseFloat(maintenancePerKm as any) || 0);
    const loadingCost = parseFloat(loadingUnloadingCost as any) || 0;
    const battaCost = parseFloat(driverBattaPerTrip as any) || 0;

    const totalVariableCost = fuelCost + toll + tyreCost + maintCost + loadingCost + battaCost;

    // 3. Total Trip Net Cost = [A] + [B]
    const totalTripCost = allocatedFixedCost + totalVariableCost;
    const costPerKm = dist > 0 ? totalTripCost / dist : 0;
    const variableCostPerKm = dist > 0 ? totalVariableCost / dist : 0;
    const fixedCostPerKm = dist > 0 ? allocatedFixedCost / dist : 0;

    // 4. Break-Even Rate
    const breakEvenRate = totalTripCost;

    // 5. Target Recommended Freight Quote
    const marginPct = parseFloat(targetMarginPct as any) || 0;
    const recommendedQuote = totalTripCost * (1 + marginPct / 100);
    const expectedProfit = recommendedQuote - totalTripCost;
    const quotePerKm = dist > 0 ? recommendedQuote / dist : 0;

    // 6. Three-Tier Bidding Amounts: Minimum, Medium, Maximum
    const minBidMarginPct = 6;
    const minBidAmount = totalTripCost * (1 + minBidMarginPct / 100);
    const minBidProfit = minBidAmount - totalTripCost;
    const minBidRatePerKm = dist > 0 ? minBidAmount / dist : 0;

    const medBidMarginPct = 15;
    const medBidAmount = totalTripCost * (1 + medBidMarginPct / 100);
    const medBidProfit = medBidAmount - totalTripCost;
    const medBidRatePerKm = dist > 0 ? medBidAmount / dist : 0;

    const maxBidMarginPct = 28;
    const maxBidAmount = totalTripCost * (1 + maxBidMarginPct / 100);
    const maxBidProfit = maxBidAmount - totalTripCost;
    const maxBidRatePerKm = dist > 0 ? maxBidAmount / dist : 0;

    // 7. Client Offer Comparison
    const clientOffer = parseFloat(clientOfferRevenue as any) || 0;
    const clientNetProfit = clientOffer - totalTripCost;
    const clientMarginPct = clientOffer > 0 ? (clientNetProfit / clientOffer) * 100 : 0;

    // 8. Monthly Fleet Profit Intel (Based on selected trips per month)
    const effectiveMonthlyTrips = allocationMode === 'trips_frequency'
      ? Math.max(1, tripsPerMonth || 1)
      : Math.max(1, Math.round((workingDaysMonthly || 25) / (tripDays || 1)));

    const monthlyGrossRevenue = recommendedQuote * effectiveMonthlyTrips;
    const monthlyVariableCost = totalVariableCost * effectiveMonthlyTrips;
    const monthlyTotalExpenses = totalMonthlyFixed + monthlyVariableCost;
    const monthlyNetProfit = expectedProfit * effectiveMonthlyTrips;
    const monthlyNetProfitMarginPct = monthlyGrossRevenue > 0 ? (monthlyNetProfit / monthlyGrossRevenue) * 100 : 0;
    const annualNetProfitRunRate = monthlyNetProfit * 12;

    const monthlyMinBidProfit = minBidProfit * effectiveMonthlyTrips;
    const monthlyMedBidProfit = medBidProfit * effectiveMonthlyTrips;
    const monthlyMaxBidProfit = maxBidProfit * effectiveMonthlyTrips;

    return {
      totalMonthlyFixed,
      allocatedFixedCost,
      fuelLitres,
      fuelCost,
      toll,
      tyreCost,
      maintCost,
      loadingCost,
      battaCost,
      totalVariableCost,
      totalTripCost,
      costPerKm,
      variableCostPerKm,
      fixedCostPerKm,
      breakEvenRate,
      recommendedQuote,
      expectedProfit,
      quotePerKm,
      minBidMarginPct,
      minBidAmount,
      minBidProfit,
      minBidRatePerKm,
      medBidMarginPct,
      medBidAmount,
      medBidProfit,
      medBidRatePerKm,
      maxBidMarginPct,
      maxBidAmount,
      maxBidProfit,
      maxBidRatePerKm,
      clientOffer,
      clientNetProfit,
      clientMarginPct,
      effectiveMonthlyTrips,
      monthlyGrossRevenue,
      monthlyVariableCost,
      monthlyTotalExpenses,
      monthlyNetProfit,
      monthlyNetProfitMarginPct,
      annualNetProfitRunRate,
      monthlyMinBidProfit,
      monthlyMedBidProfit,
      monthlyMaxBidProfit
    };
  }, [
    emiMonthly, driverSalaryMonthly, insuranceAnnual, roadTaxAnnual, permitsAnnual,
    workingDaysMonthly, allocationMode, tripsPerMonth, tripDays,
    distanceKm, mileageKmpl, fuelPricePerLitre, tollCost, tyreWearPerKm, maintenancePerKm,
    loadingUnloadingCost, driverBattaPerTrip, targetMarginPct, clientOfferRevenue
  ]);

  const inr = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.round(val || 0));

  const handleReset = () => {
    setEmiMonthly(42000);
    setDriverSalaryMonthly(22000);
    setInsuranceAnnual(65000);
    setRoadTaxAnnual(28000);
    setPermitsAnnual(18000);
    setWorkingDaysMonthly(25);
    setAllocationMode('trips_frequency');
    setTripsPerMonth(15);
    setTripDays(2);
    setDistanceKm(650);
    setMileageKmpl(4.5);
    setFuelPricePerLitre(92.5);
    setTollCost(1400);
    setTyreWearPerKm(2.50);
    setMaintenancePerKm(1.80);
    setLoadingUnloadingCost(1200);
    setDriverBattaPerTrip(800);
    setTargetMarginPct(15);
    setClientOfferRevenue(38000);
  };

  const handleCopyWhatsAppQuote = () => {
    const text = `🚚 *JAI BHAVANI CARGO - TRIP FREIGHT QUOTATION*
──────────────────────────────
📍 *Trip Distance:* ${distanceKm} KM
🗓️ *Operating Frequency:* ${tripsPerMonth} Trips/Month

*COST STRUCTURE [A + B]:*
• *[A] Allocated Fixed Overhead:* ${inr(calc.allocatedFixedCost)}
• *[B] Variable Running Costs:* ${inr(calc.totalVariableCost)}
  _(Fuel: ${inr(calc.fuelCost)} | Tolls: ${inr(calc.toll)} | Tyre: ${inr(calc.tyreCost)} | Maint: ${inr(calc.maintCost)} | Labour/Batta: ${inr(calc.loadingCost + calc.battaCost)})_

*TOTAL NET TRIP COST:* ${inr(calc.totalTripCost)} (₹${calc.costPerKm.toFixed(2)}/KM)
*BREAK-EVEN RATE:* ${inr(calc.breakEvenRate)}
──────────────────────────────
🎯 *THREE-TIER BIDDING RATES:*
• 🟢 *MINIMUM BID (Floor / Backhaul):* ${inr(calc.minBidAmount)} (₹${calc.minBidRatePerKm.toFixed(2)}/KM • +${calc.minBidMarginPct}%)
• 🔵 *MEDIUM BID (Standard Target):* ${inr(calc.medBidAmount)} (₹${calc.medBidRatePerKm.toFixed(2)}/KM • +${calc.medBidMarginPct}%)
• 🟣 *MAXIMUM BID (Peak / Urgent):* ${inr(calc.maxBidAmount)} (₹${calc.maxBidRatePerKm.toFixed(2)}/KM • +${calc.maxBidMarginPct}%)
──────────────────────────────
⭐ *CURRENT QUOTE SELECTED:* ${inr(calc.recommendedQuote)}
_Generated via Jai Bhavani Cargo Fleet Intelligence_`;

    navigator.clipboard.writeText(text);
    alert('Copied 3-Tier Freight Quote to Clipboard!');
  };

  const handleSaveCalculation = (e: React.FormEvent) => {
    e.preventDefault();
    tripCalculationService.saveCalculation({
      distance_kms: distanceKm,
      revenue: calc.recommendedQuote,
      fuel_cost: calc.fuelCost,
      toll_cost: calc.toll,
      driver_allowance: calc.battaCost,
      tyre_depreciation_rate_per_km: tyreWearPerKm,
      route_name: routeName,
      vehicle_number: vehicleNumber
    });
    setSaveModal(false);
    setSavedNotif(true);
    setTimeout(() => setSavedNotif(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black font-heading text-foreground">
              Commercial Trip Cost Calculator
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-primary/20 text-primary border border-primary/30">
              [A + B] Architecture
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Exact fixed overhead absorption + variable running expense simulator with 3-tier bidding intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyWhatsAppQuote}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Quote</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {savedNotif && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-emerald-400 text-xs font-bold">
          <CheckCircle className="w-4 h-4" />
          <span>Trip simulation saved to database successfully!</span>
        </div>
      )}

      {/* Operational Frequency Switcher */}
      <div className="p-4 sm:p-5 bg-card border border-border rounded-3xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
              ⚡ OPERATIONAL FREQUENCY SCENARIOS
            </span>
            <h3 className="text-base font-bold text-foreground mt-0.5">
              How many trips does this truck complete per month?
            </h3>
            <p className="text-xs text-muted-foreground">
              A 4-trip long haul absorbs 1/4th of monthly fixed EMI &amp; salaries, whereas a 30-trip local shuttle absorbs 1/30th.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Allocation Model:</span>
            <div className="p-0.5 bg-muted rounded-xl flex">
              <button
                type="button"
                onClick={() => setAllocationMode('trips_frequency')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  allocationMode === 'trips_frequency' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                By Trips / Mo
              </button>
              <button
                type="button"
                onClick={() => setAllocationMode('working_days')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  allocationMode === 'working_days' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                By Trip Days
              </button>
            </div>
          </div>
        </div>

        {allocationMode === 'trips_frequency' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 4 Trips */}
            <div
              onClick={() => setTripsPerMonth(4)}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                tripsPerMonth === 4 ? 'bg-primary/10 border-primary shadow-sm' : 'bg-muted/20 border-border/60 hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-foreground">Long-Haul (4 Trips)</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">High Fixed Burden</span>
              </div>
              <p className="text-lg font-black font-mono text-foreground mt-1">{inr(calc.totalMonthlyFixed / 4)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Fixed cost absorbed per trip</p>
            </div>

            {/* 15 Trips */}
            <div
              onClick={() => setTripsPerMonth(15)}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                tripsPerMonth === 15 ? 'bg-primary/10 border-primary shadow-sm' : 'bg-muted/20 border-border/60 hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-foreground">Regional (15 Trips)</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Standard Fleet</span>
              </div>
              <p className="text-lg font-black font-mono text-foreground mt-1">{inr(calc.totalMonthlyFixed / 15)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Fixed cost absorbed per trip</p>
            </div>

            {/* 30 Trips */}
            <div
              onClick={() => setTripsPerMonth(30)}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                tripsPerMonth === 30 ? 'bg-primary/10 border-primary shadow-sm' : 'bg-muted/20 border-border/60 hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-foreground">Daily Shuttle (30 Trips)</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">Low Burden</span>
              </div>
              <p className="text-lg font-black font-mono text-foreground mt-1">{inr(calc.totalMonthlyFixed / 30)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Fixed cost absorbed per trip</p>
            </div>
          </div>
        )}
      </div>

      {/* Executive Summary Banner [A + B] */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-card via-card to-primary/[0.04] border-2 border-primary/30 rounded-3xl shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-primary text-primary-foreground uppercase">
                FORMULA: [A] + [B]
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                32ft Container / Commercial Heavy Vehicle Fleet
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-foreground">
              Total Trip Cost = {inr(calc.allocatedFixedCost)} <span className="text-primary font-bold text-sm">[A]</span> + {inr(calc.totalVariableCost)} <span className="text-emerald-500 font-bold text-sm">[B]</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSaveModal(true)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Simulation</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Highlight Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
              TOTAL NET TRIP COST
            </span>
            <p className="text-2xl font-black font-mono text-foreground">{inr(calc.totalTripCost)}</p>
            <p className="text-[11px] text-muted-foreground font-medium">₹{calc.costPerKm.toFixed(2)} / KM over {distanceKm} KMs</p>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 block">
              BREAK-EVEN FREIGHT RATE
            </span>
            <p className="text-2xl font-black font-mono text-amber-500">{inr(calc.breakEvenRate)}</p>
            <p className="text-[11px] text-amber-500/80 font-medium">Zero-profit booking threshold</p>
          </div>

          <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                RECOMMENDED QUOTE
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                +{targetMarginPct}%
              </span>
            </div>
            <p className="text-2xl font-black font-mono text-emerald-400">{inr(calc.recommendedQuote)}</p>
            <p className="text-[11px] text-emerald-400/80 font-medium">
              Rate: ₹{calc.quotePerKm.toFixed(2)}/KM • Net: +{inr(calc.expectedProfit)}
            </p>
          </div>

          <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
              FUEL EXPENSE BURDEN
            </span>
            <p className="text-2xl font-black font-mono text-primary">{inr(calc.fuelCost)}</p>
            <p className="text-[11px] text-muted-foreground font-medium">
              {calc.fuelLitres.toFixed(1)} L diesel ({Math.round((calc.fuelCost / (calc.totalTripCost || 1)) * 100)}% of total trip cost)
            </p>
          </div>
        </div>

        {/* MONTHLY FLEET PROFIT INTEL PANEL */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/40 via-card to-emerald-950/25 border-2 border-emerald-500/40 rounded-2xl shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-sm">
                💰 MONTHLY PROFIT INTEL
              </span>
              <span className="text-sm font-black text-foreground">
                Fleet Earnings Projection ({calc.effectiveMonthlyTrips} Trips / Month)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
              <span>Net in-hand profit after paying full monthly EMI ({inr(emiMonthly)}) + all running costs</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-card/90 border-2 border-emerald-500/40 rounded-xl space-y-0.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">
                  MONTHLY NET PROFIT
                </span>
                <span className="text-[10px] font-bold text-emerald-400/80">
                  +{calc.monthlyNetProfitMarginPct.toFixed(1)}%
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                +{inr(calc.monthlyNetProfit)}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                +{inr(calc.expectedProfit)} / trip × {calc.effectiveMonthlyTrips} trips
              </p>
            </div>

            <div className="p-3.5 bg-card/90 border border-border/70 rounded-xl space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                MONTHLY GROSS FREIGHT
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-foreground">
                {inr(calc.monthlyGrossRevenue)}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {inr(calc.recommendedQuote)} × {calc.effectiveMonthlyTrips} trips
              </p>
            </div>

            <div className="p-3.5 bg-card/90 border border-border/70 rounded-xl space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                TOTAL MONTHLY EXPENSES
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-foreground">
                {inr(calc.monthlyTotalExpenses)}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {inr(calc.totalMonthlyFixed)} [A] + {inr(calc.monthlyVariableCost)} [B]
              </p>
            </div>

            <div className="p-3.5 bg-card/90 border border-primary/30 rounded-xl space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider block">
                ANNUAL PROFIT RUN-RATE
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-primary">
                +{inr(calc.annualNetProfitRunRate)}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                Full-year net earnings forecast
              </p>
            </div>
          </div>
        </div>

        {/* Target Profit Margin Slider */}
        <div className="p-4 bg-card/60 border border-border/50 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <span>Target Net Profit Margin:</span>
              <span className="text-emerald-500 font-extrabold font-mono text-sm">{targetMarginPct}%</span>
            </span>
            <div className="flex items-center gap-1">
              {[10, 15, 20, 25].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setTargetMarginPct(pct)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition ${
                    targetMarginPct === pct
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                      : 'bg-muted/40 text-muted-foreground hover:text-foreground border-border/40'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="35"
            step="1"
            value={targetMarginPct}
            onChange={(e) => setTargetMarginPct(parseFloat(e.target.value) || 0)}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-muted rounded-lg"
          />
        </div>

        {/* THREE-TIER BIDDING INTELLIGENCE: MINIMUM, MEDIUM, MAXIMUM */}
        <div className="pt-3 border-t border-border/50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                🎯 BIDDING INTELLIGENCE
              </span>
              <span className="text-xs font-bold text-foreground">
                Three Strategic Quotation Benchmarks
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Click any tier to auto-apply its margin to your quote
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* TIER 1: MINIMUM BID */}
            <div className={`p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${
              targetMarginPct === calc.minBidMarginPct
                ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                : 'bg-muted/20 border-amber-500/30 hover:border-amber-500/60'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-amber-500/20 text-amber-500 border border-amber-500/30">
                    🟢 Minimum Bid
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-500">
                    +{calc.minBidMarginPct}% Margin
                  </span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">Floor / Backhaul / Tender</div>
                  <div className="text-2xl font-black font-mono text-foreground mt-0.5">
                    {inr(calc.minBidAmount)}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground space-y-0.5 font-medium">
                  <div>Rate: <span className="font-bold text-foreground">₹{calc.minBidRatePerKm.toFixed(2)}/KM</span></div>
                  <div>Net Profit: <span className="font-bold text-emerald-400">+{inr(calc.minBidProfit)}</span></div>
                </div>
                <p className="text-[10px] text-muted-foreground/90 leading-tight pt-1.5 border-t border-border/40">
                  Floor pricing for return loads, empty backhauls, or highly contested tenders. Covers all costs with a safety buffer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTargetMarginPct(calc.minBidMarginPct)}
                className={`mt-3 w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  targetMarginPct === calc.minBidMarginPct
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30'
                }`}
              >
                {targetMarginPct === calc.minBidMarginPct ? '✓ Active Bid Selected' : 'Select Minimum Bid'}
              </button>
            </div>

            {/* TIER 2: MEDIUM BID */}
            <div className={`p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${
              targetMarginPct === calc.medBidMarginPct
                ? 'bg-blue-500/10 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                : 'bg-muted/20 border-blue-500/30 hover:border-blue-500/60'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    🔵 Medium Bid
                  </span>
                  <span className="text-[11px] font-mono font-bold text-blue-400">
                    +{calc.medBidMarginPct}% Margin
                  </span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">Standard Commercial Target</div>
                  <div className="text-2xl font-black font-mono text-foreground mt-0.5">
                    {inr(calc.medBidAmount)}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground space-y-0.5 font-medium">
                  <div>Rate: <span className="font-bold text-foreground">₹{calc.medBidRatePerKm.toFixed(2)}/KM</span></div>
                  <div>Net Profit: <span className="font-bold text-emerald-400">+{inr(calc.medBidProfit)}</span></div>
                </div>
                <p className="text-[10px] text-muted-foreground/90 leading-tight pt-1.5 border-t border-border/40">
                  Standard market rate for regular contracts and dedicated trips. Generates solid enterprise profit while staying competitive.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTargetMarginPct(calc.medBidMarginPct)}
                className={`mt-3 w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  targetMarginPct === calc.medBidMarginPct
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30'
                }`}
              >
                {targetMarginPct === calc.medBidMarginPct ? '✓ Active Bid Selected' : 'Select Medium Bid'}
              </button>
            </div>

            {/* TIER 3: MAXIMUM BID */}
            <div className={`p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${
              targetMarginPct === calc.maxBidMarginPct
                ? 'bg-purple-500/10 border-purple-500 shadow-md ring-1 ring-purple-500/30'
                : 'bg-muted/20 border-purple-500/30 hover:border-purple-500/60'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    🟣 Maximum Bid
                  </span>
                  <span className="text-[11px] font-mono font-bold text-purple-400">
                    +{calc.maxBidMarginPct}% Margin
                  </span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">Peak Demand / Urgent / Premium</div>
                  <div className="text-2xl font-black font-mono text-foreground mt-0.5">
                    {inr(calc.maxBidAmount)}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground space-y-0.5 font-medium">
                  <div>Rate: <span className="font-bold text-foreground">₹{calc.maxBidRatePerKm.toFixed(2)}/KM</span></div>
                  <div>Net Profit: <span className="font-bold text-emerald-400">+{inr(calc.maxBidProfit)}</span></div>
                </div>
                <p className="text-[10px] text-muted-foreground/90 leading-tight pt-1.5 border-t border-border/40">
                  Premium quotation for urgent express dispatches, festive peak seasons, fragile freight, or difficult terrain routes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTargetMarginPct(calc.maxBidMarginPct)}
                className={`mt-3 w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  targetMarginPct === calc.maxBidMarginPct
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30'
                }`}
              >
                {targetMarginPct === calc.maxBidMarginPct ? '✓ Active Bid Selected' : 'Select Maximum Bid'}
              </button>
            </div>
          </div>

          {/* Real-Time Client Counter-Offer Verification */}
          <div className="p-3.5 bg-card/80 border border-border/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                CLIENT OFFER STRESS TEST
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">Client's Proposed Freight:</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-muted-foreground font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={clientOfferRevenue}
                    onChange={(e) => setClientOfferRevenue(parseFloat(e.target.value) || 0)}
                    className="w-32 h-7 pl-6 pr-2 text-xs font-mono font-bold bg-background border border-border rounded-lg text-foreground"
                    placeholder="Enter offer"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">Margin on Offer:</span>
                <span className={`text-xs font-mono font-black ${
                  calc.clientNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'
                }`}>
                  {calc.clientMarginPct.toFixed(1)}% ({calc.clientNetProfit >= 0 ? `+${inr(calc.clientNetProfit)}` : `-${inr(Math.abs(calc.clientNetProfit))}`})
                </span>
              </div>

              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                calc.clientOffer >= calc.maxBidAmount
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  : calc.clientOffer >= calc.medBidAmount
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : calc.clientOffer >= calc.minBidAmount
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {calc.clientOffer >= calc.maxBidAmount && <span>🟣 Premium Win</span>}
                {calc.clientOffer >= calc.medBidAmount && calc.clientOffer < calc.maxBidAmount && <span>🟢 Highly Profitable</span>}
                {calc.clientOffer >= calc.minBidAmount && calc.clientOffer < calc.medBidAmount && <span>🟡 Acceptable Backhaul</span>}
                {calc.clientOffer < calc.minBidAmount && calc.clientOffer >= calc.breakEvenRate && <span>⚠️ Zero Profit Buffer</span>}
                {calc.clientOffer < calc.breakEvenRate && <span>🔴 Direct Loss (Reject)</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Part A (Fixed) & Part B (Variable) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION A: FIXED COSTS */}
        <div className="p-5 sm:p-6 bg-card border border-border rounded-3xl shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">PART [A]</span>
              <h3 className="text-base font-bold text-foreground">Fixed Fleet Overhead (Monthly Base)</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">Monthly Pool:</span>
              <span className="text-sm font-black font-mono text-purple-400">{inr(calc.totalMonthlyFixed)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Vehicle EMI / Loan (₹/mo)</label>
              <input
                type="number"
                value={emiMonthly}
                onChange={(e) => setEmiMonthly(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Driver Salary (₹/mo)</label>
              <input
                type="number"
                value={driverSalaryMonthly}
                onChange={(e) => setDriverSalaryMonthly(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Annual Insurance (₹)</label>
              <input
                type="number"
                value={insuranceAnnual}
                onChange={(e) => setInsuranceAnnual(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Annual Road Tax (₹)</label>
              <input
                type="number"
                value={roadTaxAnnual}
                onChange={(e) => setRoadTaxAnnual(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Permits &amp; Fitness (₹/yr)</label>
              <input
                type="number"
                value={permitsAnnual}
                onChange={(e) => setPermitsAnnual(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Working Days / Month</label>
              <input
                type="number"
                value={workingDaysMonthly}
                onChange={(e) => setWorkingDaysMonthly(parseInt(e.target.value) || 25)}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border rounded-xl"
              />
            </div>
          </div>

          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Allocated Fixed Cost For This Trip [A]:</span>
            <span className="text-base font-black font-mono text-purple-400">{inr(calc.allocatedFixedCost)}</span>
          </div>
        </div>

        {/* SECTION B: VARIABLE RUNNING COSTS */}
        <div className="p-5 sm:p-6 bg-card border border-border rounded-3xl shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">PART [B]</span>
              <h3 className="text-base font-bold text-foreground">Variable Trip-Specific Costs</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">Total Variable:</span>
              <span className="text-sm font-black font-mono text-emerald-400">{inr(calc.totalVariableCost)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground">Trip Distance (KM)</label>
              <input
                type="number"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Mileage (KM/L)</label>
              <input
                type="number"
                step="0.1"
                value={mileageKmpl}
                onChange={(e) => setMileageKmpl(parseFloat(e.target.value) || 4.5)}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Diesel Price (₹/L)</label>
              <input
                type="number"
                step="0.5"
                value={fuelPricePerLitre}
                onChange={(e) => setFuelPricePerLitre(parseFloat(e.target.value) || 92.5)}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Tolls (₹)</label>
              <input
                type="number"
                value={tollCost}
                onChange={(e) => setTollCost(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Driver Batta (₹)</label>
              <input
                type="number"
                value={driverBattaPerTrip}
                onChange={(e) => setDriverBattaPerTrip(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Tyre Wear (₹/KM)</label>
              <input
                type="number"
                step="0.1"
                value={tyreWearPerKm}
                onChange={(e) => setTyreWearPerKm(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Maintenance (₹/KM)</label>
              <input
                type="number"
                step="0.1"
                value={maintenancePerKm}
                onChange={(e) => setMaintenancePerKm(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border rounded-xl"
              />
            </div>
          </div>

          {/* Integrated Hyderabad ORR Toll Widget */}
          <div className="p-3.5 bg-slate-950/70 border border-border/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                  ORR
                </span>
                <span className="text-xs font-bold text-slate-200">Hyderabad ORR Toll Calculator</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">3-Axle Truck Rates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Origin</label>
                <select
                  value={orrOrigin}
                  onChange={(e) => setOrrOrigin(e.target.value)}
                  className="w-full h-8 text-xs bg-muted/40 border border-border/80 rounded-lg px-2 text-white font-medium"
                >
                  {ORR_INTERCHANGES.map(ic => (
                    <option key={`orig-${ic.id}`} value={ic.id} className="bg-slate-900 text-white">
                      IC {ic.code} - {ic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1 flex justify-center pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={handleSwapOrr}
                  className="p-1.5 rounded-lg bg-muted/30 hover:bg-muted border border-border/60 text-slate-300 hover:text-white transition"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Destination</label>
                <select
                  value={orrDestination}
                  onChange={(e) => setOrrDestination(e.target.value)}
                  className="w-full h-8 text-xs bg-muted/40 border border-border/80 rounded-lg px-2 text-white font-medium"
                >
                  {ORR_INTERCHANGES.map(ic => (
                    <option key={`dest-${ic.id}`} value={ic.id} className="bg-slate-900 text-white">
                      IC {ic.code} - {ic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrrTripType('single')}
                className={`py-1 px-2 rounded-lg text-xs font-bold transition ${
                  orrTripType === 'single' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/30 text-slate-400 border border-border/50'
                }`}
              >
                1-Way Single: ₹{orrResult.singleFare}
              </button>
              <button
                type="button"
                onClick={() => setOrrTripType('return24h')}
                className={`py-1 px-2 rounded-lg text-xs font-bold transition ${
                  orrTripType === 'return24h' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-muted/30 text-slate-400 border border-border/50'
                }`}
              >
                2-Way 24h: ₹{orrResult.returnFare24h}
              </button>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono">Calculated Toll: ₹{orrResult.selectedFare}</span>
              <button
                type="button"
                onClick={handleApplyOrrToll}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-sm transition"
              >
                {orrApplied ? '✓ Applied to Tolls' : 'Apply to Tolls →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {saveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 bg-card border border-border rounded-3xl shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Save Trip Simulation</h3>
            <form onSubmit={handleSaveCalculation} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Route Name</label>
                <input
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-muted/40 border border-border rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Vehicle Number</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-muted/40 border border-border rounded-xl"
                  required
                />
              </div>

              <div className="p-3 bg-muted/30 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Trip Net Cost:</span>
                  <span className="font-bold text-foreground">{inr(calc.totalTripCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Freight Quote (+{targetMarginPct}%):</span>
                  <span className="font-bold text-emerald-400">{inr(calc.recommendedQuote)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSaveModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TripOverviewPage;