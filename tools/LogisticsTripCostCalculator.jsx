// LogisticsTripCostCalculator.jsx
// Professional Heavy Commercial Vehicle (32ft Container / Multi-Axle) Trip Cost & Freight Rate Calculator
// Featuring explicit [A + B] Cost Architecture:
// [A] Fixed Fleet Overhead (Allocated by Monthly Trip Frequency: 4, 15, 30 trips/mo or Trip Days)
// [B] Variable Running Costs (Distance, Fuel, Tolls, Tyre wear, Maintenance, Loading, Batta)

export function LogisticsTripCostCalculator({
  initialDistance = 650,
  initialMileage = 4.5,
  initialFuelPrice = 92.5,
  initialTolls = 1400,
  onSaveToDatabase,
  savedReportsCount = 0,
  onOpenReports
}) {
  // --- SECTION A: FIXED FLEET COSTS (Monthly / Annual Pool) ---
  const [emiMonthly, setEmiMonthly] = a.useState(42000);
  const [driverSalaryMonthly, setDriverSalaryMonthly] = a.useState(22000);
  const [insuranceAnnual, setInsuranceAnnual] = a.useState(65000);
  const [roadTaxAnnual, setRoadTaxAnnual] = a.useState(28000);
  const [permitsAnnual, setPermitsAnnual] = a.useState(18000);
  const [workingDaysMonthly, setWorkingDaysMonthly] = a.useState(25);

  // Allocation Setting: 'trips_frequency' | 'trip_days'
  const [allocationMode, setAllocationMode] = a.useState("trips_frequency");
  // Frequency presets: 4 (Long-Haul), 15 (Regional), 30 (Local Express), or Custom
  const [tripsPerMonth, setTripsPerMonth] = a.useState(15);
  // Trip Duration in Days (for trip_days allocation mode)
  const [tripDays, setTripDays] = a.useState(2);

  // --- SECTION B: VARIABLE RUNNING COSTS ---
  const [distanceKm, setDistanceKm] = a.useState(initialDistance);
  const [mileageKmpl, setMileageKmpl] = a.useState(initialMileage);
  const [fuelPricePerLitre, setFuelPricePerLitre] = a.useState(initialFuelPrice);
  const [tollCost, setTollCost] = a.useState(initialTolls);
  const [tyreWearPerKm, setTyreWearPerKm] = a.useState(2.50);
  const [maintenancePerKm, setMaintenancePerKm] = a.useState(1.80);
  const [loadingUnloadingCost, setLoadingUnloadingCost] = a.useState(1200);
  const [driverBattaPerTrip, setDriverBattaPerTrip] = a.useState(800);

  // --- TARGET PROFIT MARGIN & QUOTATION ---
  const [targetMarginPct, setTargetMarginPct] = a.useState(15);
  // Optional: Client's Proposed Revenue to compare against
  const [clientOfferRevenue, setClientOfferRevenue] = a.useState(38000);
  const [showClientOfferCompare, setShowClientOfferCompare] = a.useState(false);

  // ORR Widget Toll Integration
  const [orrOrigin, setOrrOrigin] = a.useState("1");
  const [orrDestination, setOrrDestination] = a.useState("16");
  const [orrVehicle, setOrrVehicle] = a.useState("bus_2axle");
  const [orrTripType, setOrrTripType] = a.useState("single");
  const [orrApplied, setOrrApplied] = a.useState(false);

  const orrRes = calcOrrToll(orrOrigin, orrDestination, orrVehicle, orrTripType);

  const handleApplyOrrToll = () => {
    setTollCost(orrRes.selectedFare);
    setOrrApplied(true);
    setTimeout(() => setOrrApplied(false), 2000);
    i.success(`Applied ORR Toll: ₹${orrRes.selectedFare} (${orrTripType === "return24h" ? "2-Way Return" : "1-Way Single"})`);
  };

  const handleSwapOrr = () => {
    const tmp = orrOrigin;
    setOrrOrigin(orrDestination);
    setOrrDestination(tmp);
  };

  // --- MATHEMATICAL ENGINE [A + B] ---
  const calc = a.useMemo(() => {
    // 1. Part A: Monthly Fixed Pool
    const insuranceMonthly = (parseFloat(insuranceAnnual) || 0) / 12;
    const roadTaxMonthly = (parseFloat(roadTaxAnnual) || 0) / 12;
    const permitsMonthly = (parseFloat(permitsAnnual) || 0) / 12;
    const totalMonthlyFixed = (parseFloat(emiMonthly) || 0) +
      (parseFloat(driverSalaryMonthly) || 0) +
      insuranceMonthly +
      roadTaxMonthly +
      permitsMonthly;

    // Allocated Fixed Cost for this Single Trip [A]
    let allocatedFixedCost = 0;
    if (allocationMode === "trips_frequency") {
      const freq = Math.max(1, parseFloat(tripsPerMonth) || 1);
      allocatedFixedCost = totalMonthlyFixed / freq;
    } else {
      const workingDays = Math.max(1, parseFloat(workingDaysMonthly) || 25);
      const days = Math.max(0.5, parseFloat(tripDays) || 1);
      const fixedPerDay = totalMonthlyFixed / workingDays;
      allocatedFixedCost = fixedPerDay * days;
    }

    // 2. Part B: Variable Running Costs
    const dist = Math.max(0, parseFloat(distanceKm) || 0);
    const mileage = Math.max(0.1, parseFloat(mileageKmpl) || 1);
    const fuelPrice = Math.max(0, parseFloat(fuelPricePerLitre) || 0);

    const fuelLitres = dist / mileage;
    const fuelCost = fuelLitres * fuelPrice;
    const toll = parseFloat(tollCost) || 0;
    const tyreCost = dist * (parseFloat(tyreWearPerKm) || 0);
    const maintCost = dist * (parseFloat(maintenancePerKm) || 0);
    const loadingCost = parseFloat(loadingUnloadingCost) || 0;
    const battaCost = parseFloat(driverBattaPerTrip) || 0;

    const totalVariableCost = fuelCost + toll + tyreCost + maintCost + loadingCost + battaCost;

    // 3. Combined [A + B] Total Cost
    const totalTripCost = allocatedFixedCost + totalVariableCost;
    const costPerKm = dist > 0 ? totalTripCost / dist : 0;
    const variableCostPerKm = dist > 0 ? totalVariableCost / dist : 0;
    const fixedCostPerKm = dist > 0 ? allocatedFixedCost / dist : 0;

    // 4. Break-Even & Recommended Freight Quote
    const breakEvenRate = totalTripCost;
    const marginPct = parseFloat(targetMarginPct) || 0;
    const recommendedQuote = totalTripCost * (1 + marginPct / 100);
    const expectedProfit = recommendedQuote - totalTripCost;
    const quotePerKm = dist > 0 ? recommendedQuote / dist : 0;

    // 5. Three-Tier Bidding Amounts: Minimum, Medium, Maximum
    const minBidMarginPct = 6; // 6% floor margin (backhauls / aggressive tenders)
    const minBidAmount = totalTripCost * (1 + minBidMarginPct / 100);
    const minBidProfit = minBidAmount - totalTripCost;
    const minBidRatePerKm = dist > 0 ? minBidAmount / dist : 0;

    const medBidMarginPct = 15; // 15% standard margin (balanced enterprise target)
    const medBidAmount = totalTripCost * (1 + medBidMarginPct / 100);
    const medBidProfit = medBidAmount - totalTripCost;
    const medBidRatePerKm = dist > 0 ? medBidAmount / dist : 0;

    const maxBidMarginPct = 28; // 28% peak/urgent margin (premium dispatch)
    const maxBidAmount = totalTripCost * (1 + maxBidMarginPct / 100);
    const maxBidProfit = maxBidAmount - totalTripCost;
    const maxBidRatePerKm = dist > 0 ? maxBidAmount / dist : 0;

    // 6. Client Offer Comparison
    const clientOffer = parseFloat(clientOfferRevenue) || 0;
    const clientNetProfit = clientOffer - totalTripCost;
    const clientMarginPct = clientOffer > 0 ? (clientNetProfit / clientOffer) * 100 : 0;

    return {
      totalMonthlyFixed,
      insuranceMonthly,
      roadTaxMonthly,
      permitsMonthly,
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
      clientMarginPct
    };
  }, [
    emiMonthly, driverSalaryMonthly, insuranceAnnual, roadTaxAnnual, permitsAnnual,
    workingDaysMonthly, allocationMode, tripsPerMonth, tripDays,
    distanceKm, mileageKmpl, fuelPricePerLitre, tollCost, tyreWearPerKm, maintenancePerKm,
    loadingUnloadingCost, driverBattaPerTrip, targetMarginPct, clientOfferRevenue
  ]);

  // Format currency helper
  const inr = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(Math.round(val || 0));

  // Reset form to heavy vehicle defaults
  const handleReset = () => {
    setEmiMonthly(42000);
    setDriverSalaryMonthly(22000);
    setInsuranceAnnual(65000);
    setRoadTaxAnnual(28000);
    setPermitsAnnual(18000);
    setWorkingDaysMonthly(25);
    setAllocationMode("trips_frequency");
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
    i.success("Reset calculator to heavy commercial 32ft truck standards");
  };

  // Copy WhatsApp summary quote
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
    i.success("Copied 3-Tier Freight Quote to Clipboard!");
  };

  // Print summary
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Visual Frequency Scenario Switcher (The 4 vs 15 vs 30 Trips Solution) */}
      <div className="p-4 sm:p-5 bg-card border border-border/80 rounded-3xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <span>⚡ OPERATIONAL FREQUENCY SCENARIOS</span>
            </span>
            <h3 className="text-base font-bold text-foreground mt-0.5">
              How many trips does this truck complete per month?
            </h3>
            <p className="text-xs text-muted-foreground">
              A 4-trip long haul must absorb 1/4th of the monthly EMI &amp; salary, while a 30-trip local route absorbs 1/30th.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Allocation Model:</span>
            <div className="p-0.5 bg-muted rounded-xl flex">
              <button
                type="button"
                onClick={() => setAllocationMode("trips_frequency")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  allocationMode === "trips_frequency"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                By Trips / Mo
              </button>
              <button
                type="button"
                onClick={() => setAllocationMode("trip_days")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  allocationMode === "trip_days"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                By Trip Days
              </button>
            </div>
          </div>
        </div>

        {allocationMode === "trips_frequency" ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {[
              {
                trips: 4,
                title: "4 Trips / Month",
                type: "Long-Haul Line-Haul",
                desc: "1,500-2,500 KM (Hyd-Del/Mum), ~7 days",
                badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30"
              },
              {
                trips: 15,
                title: "15 Trips / Month",
                type: "Regional Inter-State",
                desc: "500-800 KM (Hyd-Blr/Chn), ~2 days",
                badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30"
              },
              {
                trips: 30,
                title: "30 Trips / Month",
                type: "Daily Express / Local",
                desc: "150-300 KM (Warangal/VJA), 1 day",
                badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              },
              {
                trips: "custom",
                title: "Custom Frequency",
                type: "Flexible Allocation",
                desc: "Specify exact monthly trips",
                badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }
            ].map((scenario) => {
              const isSelected = scenario.trips === "custom"
                ? (tripsPerMonth !== 4 && tripsPerMonth !== 15 && tripsPerMonth !== 30)
                : tripsPerMonth === scenario.trips;

              return (
                <button
                  key={scenario.title}
                  type="button"
                  onClick={() => {
                    if (scenario.trips !== "custom") setTripsPerMonth(scenario.trips);
                    else if (tripsPerMonth === 4 || tripsPerMonth === 15 || tripsPerMonth === 30) {
                      setTripsPerMonth(10);
                    }
                  }}
                  className={`p-3.5 rounded-2xl text-left border transition flex flex-col justify-between ${
                    isSelected
                      ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary"
                      : "bg-card hover:bg-muted/30 border-border/60"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {scenario.title}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${scenario.badgeColor}`}>
                        {scenario.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {scenario.desc}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-border/30 flex items-baseline justify-between">
                    <span className="text-[10px] text-muted-foreground">Fixed Burden [A]:</span>
                    <span className="text-xs font-bold font-mono text-primary">
                      {scenario.trips === "custom"
                        ? inr(calc.allocatedFixedCost)
                        : inr(calc.totalMonthlyFixed / scenario.trips)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-3 bg-muted/20 border border-border/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground">Trip Duration Based Allocation</span>
              <p className="text-[11px] text-muted-foreground">
                Monthly fixed cost ({inr(calc.totalMonthlyFixed)}) is divided across {workingDaysMonthly} working days = {inr(calc.totalMonthlyFixed / workingDaysMonthly)} / day.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Trip Days:</span>
                <input
                  type="number"
                  min="0.5"
                  max="30"
                  step="0.5"
                  value={tripDays}
                  onChange={(e) => setTripDays(parseFloat(e.target.value) || 1)}
                  className="w-20 h-9 px-2 text-center text-xs font-mono font-bold bg-background border border-border rounded-xl"
                />
              </div>
              <span className="text-xs font-bold text-primary font-mono bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                [A] Burden: {inr(calc.allocatedFixedCost)}
              </span>
            </div>
          </div>
        )}

        {/* Custom Trips Input (if custom selected) */}
        {allocationMode === "trips_frequency" && tripsPerMonth !== 4 && tripsPerMonth !== 15 && tripsPerMonth !== 30 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500">
              Enter Custom Trips Completed Per Month:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={tripsPerMonth}
                onChange={(e) => setTripsPerMonth(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 h-8 px-2 text-center text-xs font-mono font-bold bg-background border border-amber-500/40 rounded-xl text-foreground"
              />
              <span className="text-xs font-semibold text-muted-foreground">trips/month</span>
            </div>
          </div>
        )}
      </div>

      {/* --- MASTER EXECUTIVE SUMMARY BANNER [A + B] --- */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-card via-card to-primary/[0.04] border-2 border-primary/30 rounded-3xl shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-primary text-primary-foreground uppercase">
                FORMULA: [A] + [B]
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                32ft Container / Commercial Fleet Cost Structure
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-foreground">
              Total Trip Cost = {inr(calc.allocatedFixedCost)} <span className="text-primary font-bold text-sm">[A]</span> + {inr(calc.totalVariableCost)} <span className="text-emerald-500 font-bold text-sm">[B]</span>
            </h2>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyWhatsAppQuote}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition active:scale-95"
            >
              <span>📋 Copy WhatsApp Quote</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border/60 transition"
            >
              🖨️ Print
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 transition"
              title="Reset to 32ft commercial standards"
            >
              ↺ Reset
            </button>
          </div>
        </div>

        {/* 4 Summary Highlight Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Net Cost */}
          <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
              TOTAL NET TRIP COST
            </span>
            <p className="text-2xl font-black font-mono text-foreground">
              {inr(calc.totalTripCost)}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">
              ₹{calc.costPerKm.toFixed(2)} / KM over {distanceKm} KMs
            </p>
          </div>

          {/* Card 2: Break-Even Rate */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 block">
              BREAK-EVEN FREIGHT RATE
            </span>
            <p className="text-2xl font-black font-mono text-amber-500">
              {inr(calc.breakEvenRate)}
            </p>
            <p className="text-[11px] text-amber-500/80 font-medium">
              Zero-profit booking threshold
            </p>
          </div>

          {/* Card 3: Recommended Booking Rate */}
          <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                RECOMMENDED QUOTE
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                +{targetMarginPct}%
              </span>
            </div>
            <p className="text-2xl font-black font-mono text-emerald-400">
              {inr(calc.recommendedQuote)}
            </p>
            <p className="text-[11px] text-emerald-400/80 font-medium">
              Rate: ₹{calc.quotePerKm.toFixed(2)}/KM • Net: +{inr(calc.expectedProfit)}
            </p>
          </div>

          {/* Card 4: Fuel Ratio & Burn */}
          <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
              FUEL EXPENSE BURDEN
            </span>
            <p className="text-2xl font-black font-mono text-primary">
              {inr(calc.fuelCost)}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">
              {calc.fuelLitres.toFixed(1)} L diesel ({Math.round((calc.fuelCost / (calc.totalTripCost || 1)) * 100)}% of total trip cost)
            </p>
          </div>
        </div>

        {/* Target Profit Margin Slider */}
        <div className="p-4 bg-card/60 border border-border/50 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <span>Target Net Profit Margin:</span>
              <span className="text-emerald-500 font-extrabold font-mono text-sm">
                {targetMarginPct}%
              </span>
            </span>
            <div className="flex items-center gap-1">
              {[10, 15, 20, 25].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setTargetMarginPct(pct)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition ${
                    targetMarginPct === pct
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/40"
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

        {/* --- THREE-TIER BIDDING INTELLIGENCE: MINIMUM, MEDIUM, MAXIMUM BID AMOUNTS --- */}
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
            {/* TIER 1: MINIMUM BID AMOUNT */}
            <div className={`p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${
              targetMarginPct === calc.minBidMarginPct
                ? "bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/30"
                : "bg-muted/20 border-amber-500/30 hover:border-amber-500/60"
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
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30"
                }`}
              >
                {targetMarginPct === calc.minBidMarginPct ? "✓ Active Bid Selected" : "Select Minimum Bid"}
              </button>
            </div>

            {/* TIER 2: MEDIUM BID AMOUNT */}
            <div className={`p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${
              targetMarginPct === calc.medBidMarginPct
                ? "bg-blue-500/10 border-blue-500 shadow-md ring-1 ring-blue-500/30"
                : "bg-muted/20 border-blue-500/30 hover:border-blue-500/60"
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
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30"
                }`}
              >
                {targetMarginPct === calc.medBidMarginPct ? "✓ Active Bid Selected" : "Select Medium Bid"}
              </button>
            </div>

            {/* TIER 3: MAXIMUM BID AMOUNT */}
            <div className={`p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${
              targetMarginPct === calc.maxBidMarginPct
                ? "bg-purple-500/10 border-purple-500 shadow-md ring-1 ring-purple-500/30"
                : "bg-muted/20 border-purple-500/30 hover:border-purple-500/60"
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
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30"
                }`}
              >
                {targetMarginPct === calc.maxBidMarginPct ? "✓ Active Bid Selected" : "Select Maximum Bid"}
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
                  calc.clientNetProfit >= 0 ? "text-emerald-400" : "text-rose-500"
                }`}>
                  {calc.clientMarginPct.toFixed(1)}% ({calc.clientNetProfit >= 0 ? `+${inr(calc.clientNetProfit)}` : `-${inr(Math.abs(calc.clientNetProfit))}`})
                </span>
              </div>

              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                calc.clientOffer >= calc.maxBidAmount
                  ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                  : calc.clientOffer >= calc.medBidAmount
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : calc.clientOffer >= calc.minBidAmount
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
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

      {/* --- TWO COLUMNS: PART A (FIXED) & PART B (VARIABLE) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ============================================================== */}
        {/* SECTION A: FIXED COSTS (Monthly Base Pool)                      */}
        {/* ============================================================== */}
        <div className="p-5 sm:p-6 bg-card border border-border/70 rounded-3xl shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Xe className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
                  PART [A]
                </span>
                <h3 className="text-base font-bold text-foreground">
                  Fixed Fleet Overhead (Monthly Base)
                </h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">Monthly Pool:</span>
              <span className="text-sm font-black font-mono text-purple-400">
                {inr(calc.totalMonthlyFixed)}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Expenses that remain constant regardless of running KMs. These are divided by your expected trip frequency to calculate the fixed overhead this trip must absorb.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* EMI / Loan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Vehicle EMI / Loan</span>
                <span className="font-mono text-foreground font-bold">{inr(emiMonthly)}/mo</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={emiMonthly}
                  onChange={(e) => setEmiMonthly(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-purple-500"
                />
              </div>
            </div>

            {/* Driver Salary */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Driver Monthly Salary</span>
                <span className="font-mono text-foreground font-bold">{inr(driverSalaryMonthly)}/mo</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={driverSalaryMonthly}
                  onChange={(e) => setDriverSalaryMonthly(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-purple-500"
                />
              </div>
            </div>

            {/* Annual Insurance */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Annual Comprehensive Insurance</span>
                <span className="text-[10px] text-muted-foreground">({inr(calc.insuranceMonthly)}/mo)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={insuranceAnnual}
                  onChange={(e) => setInsuranceAnnual(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-purple-500"
                />
              </div>
            </div>

            {/* Annual Road Tax */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Road Tax (Annual Equivalent)</span>
                <span className="text-[10px] text-muted-foreground">({inr(calc.roadTaxMonthly)}/mo)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={roadTaxAnnual}
                  onChange={(e) => setRoadTaxAnnual(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-purple-500"
                />
              </div>
            </div>

            {/* Permits & Fitness */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>National Permits &amp; Fitness</span>
                <span className="text-[10px] text-muted-foreground">({inr(calc.permitsMonthly)}/mo)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={permitsAnnual}
                  onChange={(e) => setPermitsAnnual(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-purple-500"
                />
              </div>
            </div>

            {/* Working Days Standard */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Working Days Per Month</span>
                <span className="text-[10px] text-muted-foreground">Default 25 days</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={workingDaysMonthly}
                  onChange={(e) => setWorkingDaysMonthly(parseInt(e.target.value) || 25)}
                  className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Allocation Calculation Summary Box */}
          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                Allocated Fixed Cost For This Trip [A]:
              </span>
              <span className="text-base font-black font-mono text-purple-400">
                {inr(calc.allocatedFixedCost)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Calculation: Total monthly fixed overhead of <strong>{inr(calc.totalMonthlyFixed)}</strong> divided by{" "}
              <strong>
                {allocationMode === "trips_frequency"
                  ? `${tripsPerMonth} trips/month`
                  : `${workingDaysMonthly} working days × ${tripDays} trip days`}
              </strong>{" "}
              = <strong>{inr(calc.allocatedFixedCost)}</strong> (₹{calc.fixedCostPerKm.toFixed(2)}/KM).
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION B: VARIABLE RUNNING COSTS (Trip-Specific)              */}
        {/* ============================================================== */}
        <div className="p-5 sm:p-6 bg-card border border-border/70 rounded-3xl shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Ge className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                  PART [B]
                </span>
                <h3 className="text-base font-bold text-foreground">
                  Variable Trip-Specific Costs
                </h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">Total Variable:</span>
              <span className="text-sm font-black font-mono text-emerald-400">
                {inr(calc.totalVariableCost)}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Direct operational expenses incurred solely for this journey (Diesel, Fastag tolls, Tyre and Maintenance wear per KM, Batta, and Loading).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Trip Distance (KM) */}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-foreground">Trip Distance (KM)</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDistanceKm(prev => Math.round(prev * 2))}
                    className="text-[10px] px-2 py-0.5 bg-muted rounded border border-border hover:bg-muted/80 text-muted-foreground"
                    title="Convert to Round Trip"
                  >
                    ⇄ 2-Way Round Trip
                  </button>
                  <span className="font-mono text-foreground font-black text-sm">{distanceKm} KM</span>
                </div>
              </div>
              <input
                type="number"
                min="10"
                max="5000"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
              />
            </div>

            {/* Vehicle Mileage */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Vehicle Mileage (KM/L)</span>
                <span className="font-mono text-foreground font-bold">{mileageKmpl} KMPL</span>
              </label>
              <input
                type="number"
                min="1.0"
                max="15.0"
                step="0.1"
                value={mileageKmpl}
                onChange={(e) => setMileageKmpl(parseFloat(e.target.value) || 4.5)}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
              />
            </div>

            {/* Diesel Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Diesel Price (₹/Litre)</span>
                <span className="font-mono text-foreground font-bold">₹{fuelPricePerLitre}/L</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">₹</span>
                <input
                  type="number"
                  min="50"
                  max="150"
                  step="0.5"
                  value={fuelPricePerLitre}
                  onChange={(e) => setFuelPricePerLitre(parseFloat(e.target.value) || 92.5)}
                  className="w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Toll Charges */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Highway Toll Charges (₹)</span>
                <span className="font-mono text-foreground font-bold">{inr(tollCost)}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={tollCost}
                  onChange={(e) => setTollCost(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Driver Batta */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Driver Batta / Allowance</span>
                <span className="font-mono text-foreground font-bold">{inr(driverBattaPerTrip)}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={driverBattaPerTrip}
                  onChange={(e) => setDriverBattaPerTrip(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Tyre Wear (per KM) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Tyre Wear Cost (₹/KM)</span>
                <span className="text-[10px] text-muted-foreground">({inr(calc.tyreCost)})</span>
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={tyreWearPerKm}
                onChange={(e) => setTyreWearPerKm(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
              />
            </div>

            {/* Maintenance Cost (per KM) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Maintenance / Servicing (₹/KM)</span>
                <span className="text-[10px] text-muted-foreground">({inr(calc.maintCost)})</span>
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={maintenancePerKm}
                onChange={(e) => setMaintenancePerKm(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
              />
            </div>

            {/* Loading / Unloading */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Loading / Unloading / Hamali Charges (Fixed per trip)</span>
                <span className="font-mono text-foreground font-bold">{inr(loadingUnloadingCost)}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={loadingUnloadingCost}
                  onChange={(e) => setLoadingUnloadingCost(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Integrated Hyderabad ORR Toll Calculator Widget */}
          <div className="p-3.5 bg-slate-950/70 border border-border/80 rounded-2xl space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                  ORR
                </span>
                <span className="text-xs font-bold text-slate-200">
                  Hyderabad ORR Toll Calculator
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">2024-25 Matrix</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Origin</label>
                <select
                  value={orrOrigin}
                  onChange={(e) => setOrrOrigin(e.target.value)}
                  className="w-full h-8 text-xs bg-muted/40 border border-border/80 rounded-lg px-2 text-white font-medium focus:outline-none focus:border-primary"
                >
                  {ORR_IC.map(ic => (
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
                  title="Swap Origin & Destination"
                  className="p-1.5 rounded-lg bg-muted/30 hover:bg-muted border border-border/60 text-slate-300 hover:text-white transition active:scale-95"
                >
                  ⇄
                </button>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Destination</label>
                <select
                  value={orrDestination}
                  onChange={(e) => setOrrDestination(e.target.value)}
                  className="w-full h-8 text-xs bg-muted/40 border border-border/80 rounded-lg px-2 text-white font-medium focus:outline-none focus:border-primary"
                >
                  {ORR_IC.map(ic => (
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
                onClick={() => setOrrTripType("single")}
                className={`py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  orrTripType === "single"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/30 text-slate-400 border border-border/50"
                }`}
              >
                <span>1-Way Single: ₹{orrRes.singleFare}</span>
              </button>
              <button
                type="button"
                onClick={() => setOrrTripType("return24h")}
                className={`py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  orrTripType === "return24h"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-muted/30 text-slate-400 border border-border/50"
                }`}
              >
                <span>2-Way 24h: ₹{orrRes.returnFare24h}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono">
                Calculated Toll: ₹{orrRes.selectedFare}
              </span>
              <button
                type="button"
                onClick={handleApplyOrrToll}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-sm transition"
              >
                {orrApplied ? "✓ Applied to Tolls" : "Apply to Tolls →"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: SAVE CALCULATION & CLIENT OFFER COMPARISON --- */}
      <div className="p-5 bg-card border border-border/70 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-foreground">
            Save or Export This Trip Simulation
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Store this [A + B] breakdown to track route margins and client bidding trends over time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenReports && (
            <button
              type="button"
              onClick={onOpenReports}
              className="px-3.5 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border/60 rounded-xl text-xs font-bold transition"
            >
              Saved Reports ({savedReportsCount})
            </button>
          )}

          <button
            type="button"
            onClick={() => onSaveToDatabase && onSaveToDatabase({
              distance: distanceKm,
              mileage: mileageKmpl,
              fuel_price: fuelPricePerLitre,
              tolls: tollCost,
              total_fixed_allocated: calc.allocatedFixedCost,
              total_variable: calc.totalVariableCost,
              total_expenses: calc.totalTripCost,
              break_even_rate: calc.breakEvenRate,
              recommended_quote: calc.recommendedQuote,
              target_margin_pct: targetMarginPct,
              trips_per_month: tripsPerMonth
            })}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <U className="w-4 h-4" />
            <span>Save Calculation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
