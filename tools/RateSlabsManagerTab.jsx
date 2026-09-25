import React, { useState, useEffect, useMemo } from 'react';

export const DEFAULT_SLABS_DATA = {
  pricing_mode: "progressive", // "progressive" or "flat_min"
  slabs_definition: [
    { id: "below_100", label: "0 - 100 km", min_km: 0, max_km: 100, is_base: true },
    { id: "100_200", label: "100 - 200 km", min_km: 100, max_km: 200, is_base: false },
    { id: "200_300", label: "200 - 300 km", min_km: 200, max_km: 300, is_base: false },
    { id: "300_400", label: "300 - 400 km", min_km: 300, max_km: 400, is_base: false },
    { id: "above_400", label: "400+ km", min_km: 400, max_km: 99999, is_base: false }
  ],
  trip_types: {
    one_way: {
      id: "one_way",
      label: "One-Way Trip",
      short: "One-Way",
      multiplier: 1.0,
      discount_percent: 0,
      badge: "Standard Trip"
    },
    round_trip: {
      id: "round_trip",
      label: "Two-Way / Round Trip",
      short: "Two-Way",
      multiplier: 1.85,
      discount_percent: 15,
      badge: "15% Return Leg Off",
      description: "Round trip freight with return haulage discount"
    }
  },
  contract_tenures: {
    spot: {
      id: "spot",
      label: "Adhoc / Spot Load",
      short: "Adhoc / Spot",
      multiplier: 1.0,
      discount_percent: 0,
      badge: "Instant Market Rate",
      description: "Single-indent on-demand market rate"
    },
    contract_1m: {
      id: "contract_1m",
      label: "1 Month Contract",
      short: "1 Month",
      multiplier: 0.95,
      discount_percent: 5,
      badge: "5% Volume Discount",
      description: "Monthly commitment (5% volume discount)"
    },
    contract_3m: {
      id: "contract_3m",
      label: "3 Months Contract",
      short: "3 Months",
      multiplier: 0.92,
      discount_percent: 8,
      badge: "8% Quarterly Discount",
      description: "Quarterly agreement (8% volume discount)"
    },
    contract_6m: {
      id: "contract_6m",
      label: "6 Months Contract",
      short: "6 Months",
      multiplier: 0.88,
      discount_percent: 12,
      badge: "12% Half-Yearly Discount",
      description: "Half-yearly contract (12% volume discount)"
    },
    contract_1y: {
      id: "contract_1y",
      label: "1 Year Contract",
      short: "1 Year",
      multiplier: 0.85,
      discount_percent: 15,
      badge: "15% Annual Enterprise Discount",
      description: "Annual enterprise contract (15% volume discount)"
    }
  },
  weight_payload_rules: {
    standard: {
      id: "standard",
      label: "Standard Payload (Up to 75% Capacity)",
      short: "Standard Payload",
      multiplier: 1.0,
      surcharge_percent: 0,
      description: "Normal rated payload within standard capacity limits"
    },
    full_payload: {
      id: "full_payload",
      label: "Full Payload / Max Rated Capacity",
      short: "Full Payload",
      multiplier: 1.10,
      surcharge_percent: 10,
      badge: "+10% Heavy Tonnage",
      description: "Full capacity / maximum gross weight load (heavy axle & fuel consumption surcharge)"
    }
  },
  vehicles: [
    {
      id: "32ftsxl",
      name: "32 FT SXL Single Axle Container",
      short: "32 FT SXL",
      capacity: "6 - 9 MT",
      maxMT: 9,
      base_rate_under_100: 10000,
      rate_100_200: 60,
      rate_200_300: 54,
      rate_300_400: 50,
      rate_above_400: 48,
      description: "Flagship 32ft SXL high-cube container for corporate logistics (6 to 9 Tons)."
    },
    {
      id: "32ft_single_axle",
      name: "32 FT Single Axle High Cube",
      short: "32 FT Single Axle",
      capacity: "7 - 9 MT",
      maxMT: 9,
      base_rate_under_100: 10000,
      rate_100_200: 60,
      rate_200_300: 54,
      rate_300_400: 50,
      rate_above_400: 48,
      description: "Single-axle high volume 32ft freight container (7 to 9 Tons)."
    },
    {
      id: "32ft_multi_axle",
      name: "32 FT Multi Axle Container (MXL)",
      short: "32 FT Multi Axle",
      capacity: "14 - 18 MT",
      maxMT: 18,
      base_rate_under_100: 12000,
      rate_100_200: 70,
      rate_200_300: 64,
      rate_300_400: 58,
      rate_above_400: 56,
      description: "Multi-axle heavy container for maximum tonnage transport (14 to 18 Tons)."
    },
    {
      id: "24ftsxl",
      name: "24 FT SXL Single Axle Container",
      short: "24 FT SXL",
      capacity: "7 - 10 MT",
      maxMT: 10,
      base_rate_under_100: 8500,
      rate_100_200: 55,
      rate_200_300: 50,
      rate_300_400: 48,
      rate_above_400: 46,
      description: "Single-axle 24ft container for heavy industrial loads (7 to 10 Tons)."
    },
    {
      id: "22ftsxl",
      name: "22 FT SXL Single Axle Container",
      short: "22 FT SXL",
      capacity: "7 - 9.5 MT",
      maxMT: 9.5,
      base_rate_under_100: 8000,
      rate_100_200: 52,
      rate_200_300: 48,
      rate_300_400: 45,
      rate_above_400: 44,
      description: "Single-axle 22ft container for volumetric goods (7 to 9.5 Tons)."
    },
    {
      id: "20ftsxl",
      name: "20 FT SXL Single Axle Container",
      short: "20 FT SXL",
      capacity: "6 - 8.5 MT",
      maxMT: 8.5,
      base_rate_under_100: 7500,
      rate_100_200: 50,
      rate_200_300: 46,
      rate_300_400: 43,
      rate_above_400: 42,
      description: "Single-axle 20ft container for industrial freight (6 to 8.5 Tons)."
    },
    {
      id: "17ft",
      name: "17 FT Closed Container / Open Body",
      short: "17 FT",
      capacity: "4 - 5.5 MT",
      maxMT: 5.5,
      base_rate_under_100: 6000,
      rate_100_200: 44,
      rate_200_300: 40,
      rate_300_400: 38,
      rate_above_400: 36,
      description: "Commercial cargo vehicle for regional light cargo (4 to 5.5 Tons)."
    },
    {
      id: "14ft",
      name: "14 FT Closed Container / Open Body",
      short: "14 FT",
      capacity: "3 - 4.5 MT",
      maxMT: 4.5,
      base_rate_under_100: 5000,
      rate_100_200: 40,
      rate_200_300: 36,
      rate_300_400: 34,
      rate_above_400: 32,
      description: "Suitable for intra-city and express consignments (3 to 4.5 Tons)."
    },
    {
      id: "other",
      name: "Other / Not Sure (Custom Vehicle Requirement)",
      short: "Other / Not Sure",
      capacity: "Custom Capacity",
      maxMT: 25,
      base_rate_under_100: 10000,
      rate_100_200: 58,
      rate_200_300: 52,
      rate_300_400: 48,
      rate_above_400: 46,
      description: "Custom vehicle specification or expert vehicle placement assistance."
    }
  ]
};

// ── COMPREHENSIVE PRICE CALCULATION ENGINE ──
export function calculateQuotePrice(vehicle, distance, options = {}) {
  const mode = typeof options === 'string' ? options : (options.mode || "progressive");
  const tripType = options.trip_type || "one_way";
  const contractTenure = options.contract_tenure || "spot";
  const payloadType = options.payload_type || (options.weight && vehicle?.maxMT && (options.weight / 1000 >= vehicle.maxMT * 0.8 || options.weight >= vehicle.maxMT * 0.8) ? "full_payload" : "standard");
  const config = options.ratesData || DEFAULT_SLABS_DATA;

  if (!vehicle || !distance || distance <= 0) {
    return {
      total: 0,
      baseDistanceCost: 0,
      appliedSlab: "N/A",
      slabRate: "N/A",
      breakdown: "",
      multipliers: { trip: 1.0, payload: 1.0, tenure: 1.0 }
    };
  }

  const isContract = contractTenure && contractTenure !== "spot" && contractTenure !== "adhoc";
  let baseRate, r100_200, r200_300, r300_400, rAbove400;
  let rateTypeLabel = "";

  if (isContract) {
    baseRate = Number(vehicle.contract_base_rate_under_100 || Math.round((vehicle.base_rate_under_100 || 10000) * 0.85));
    r100_200 = Number(vehicle.contract_rate_100_200 || Math.round((vehicle.rate_100_200 || 60) * 0.88));
    r200_300 = Number(vehicle.contract_rate_200_300 || Math.round((vehicle.rate_200_300 || 54) * 0.88));
    r300_400 = Number(vehicle.contract_rate_300_400 || Math.round((vehicle.rate_300_400 || 50) * 0.88));
    rAbove400 = Number(vehicle.contract_rate_above_400 || Math.round((vehicle.rate_above_400 || 48) * 0.88));
    rateTypeLabel = "Contract";
  } else {
    baseRate = Number(vehicle.adhoc_base_rate_under_100 || vehicle.base_rate_under_100 || 10000);
    r100_200 = Number(vehicle.adhoc_rate_100_200 || vehicle.rate_100_200 || 60);
    r200_300 = Number(vehicle.adhoc_rate_200_300 || vehicle.rate_200_300 || 54);
    r300_400 = Number(vehicle.adhoc_rate_300_400 || vehicle.rate_300_400 || 50);
    rAbove400 = Number(vehicle.adhoc_rate_above_400 || vehicle.rate_above_400 || 48);
    rateTypeLabel = "Adhoc";
  }

  let baseDistanceCost = 0;
  let activeSlab = "";
  let slabRateStr = "";
  let isBase = false;
  let breakdownParts = [];

  // Distance Slab Calculation:
  // If distance <= 100 km, flat base rate applies.
  // If distance > 100 km, the applicable slab rate applies to the WHOLE distance (all kms).
  if (distance <= 100) {
    baseDistanceCost = baseRate;
    activeSlab = `Below 100 km (${rateTypeLabel} Flat Base ₹${baseRate.toLocaleString('en-IN')})`;
    slabRateStr = `₹${baseRate.toLocaleString('en-IN')} Base`;
    isBase = true;
    breakdownParts.push(`Distance ${distance} km <= 100 km -> Flat ${rateTypeLabel} base ₹${baseRate.toLocaleString('en-IN')}`);
  } else {
    let rate = rAbove400;
    let slabLabel = "400+ km Long Haul";
    if (distance <= 200) { rate = r100_200; slabLabel = "100 - 200 km Slab"; }
    else if (distance <= 300) { rate = r200_300; slabLabel = "200 - 300 km Slab"; }
    else if (distance <= 400) { rate = r300_400; slabLabel = "300 - 400 km Slab"; }

    const raw = distance * rate;
    baseDistanceCost = Math.round(raw);
    activeSlab = `${slabLabel} (${rateTypeLabel} ₹${rate}/km)`;
    slabRateStr = `₹${rate}/km`;
    isBase = false;
    breakdownParts.push(`${distance} km × ₹${rate}/km (${slabLabel} ${rateTypeLabel} applies to whole kms) = ₹${baseDistanceCost.toLocaleString('en-IN')}`);
  }

  // 1. Trip Type Multiplier
  const tripCfg = config?.trip_types?.[tripType] || (tripType === 'round_trip' ? { multiplier: 1.85, label: "Two-Way / Round Trip" } : { multiplier: 1.0, label: "One-Way" });
  const tripMultiplier = Number(tripCfg.multiplier) || 1.0;
  const tripSubtotal = Math.round(baseDistanceCost * tripMultiplier);

  // 2. Payload / Weight Multiplier
  const payloadCfg = config?.weight_payload_rules?.[payloadType] || (payloadType === 'full_payload' ? { multiplier: 1.10, label: "Full Payload" } : { multiplier: 1.0, label: "Standard Payload" });
  const payloadMultiplier = Number(payloadCfg.multiplier) || 1.0;
  const payloadSubtotal = Math.round(tripSubtotal * payloadMultiplier);

  // 3. Contract Tenure Discount Multiplier
  const tenureCfg = config?.contract_tenures?.[contractTenure] || { multiplier: 1.0, label: "Spot / Adhoc" };
  const tenureMultiplier = Number(tenureCfg.multiplier) || 1.0;
  const finalTotal = Math.round(payloadSubtotal * tenureMultiplier);

  return {
    total: finalTotal,
    baseDistanceCost: Math.round(baseDistanceCost),
    appliedSlab: activeSlab,
    slabRate: slabRateStr,
    isBaseRate: isBase,
    breakdown: breakdownParts.join(" "),
    multipliers: {
      trip: tripMultiplier,
      tripLabel: tripCfg.label,
      payload: payloadMultiplier,
      payloadLabel: payloadCfg.label,
      tenure: tenureMultiplier,
      tenureLabel: tenureCfg.label
    }
  };
}

export default function RateSlabsManagerTab() {
  const [ratesData, setRatesData] = useState(() => {
    try {
      const saved = localStorage.getItem('jbc_quotation_rate_slabs');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_SLABS_DATA;
  });

  const [activeSubTab, setActiveSubTab] = useState("vehicles"); // "vehicles", "trip_types", "contracts", "payload", "tester"
  const [ratePricingView, setRatePricingView] = useState("adhoc"); // "adhoc" | "contract"
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success' | 'error', msg: '' }

  // Interactive Live Price Tester State
  const [testVehicleId, setTestVehicleId] = useState("32ftsxl");
  const [testDistance, setTestDistance] = useState(150);
  const [testTripType, setTestTripType] = useState("one_way");
  const [testTenure, setTestTenure] = useState("spot");
  const [testPayload, setTestPayload] = useState("standard");

  // Load from API on mount
  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await fetch('/api/quotation/rates?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates && Array.isArray(data.rates.vehicles)) {
            setRatesData(prev => ({
              ...prev,
              ...data.rates,
              trip_types: data.rates.trip_types || prev.trip_types,
              contract_tenures: data.rates.contract_tenures || prev.contract_tenures,
              weight_payload_rules: data.rates.weight_payload_rules || prev.weight_payload_rules
            }));
            localStorage.setItem('jbc_quotation_rate_slabs', JSON.stringify(data.rates));
          }
        }
      } catch (err) {
        console.warn('Using local rates cache:', err.message);
      }
    };
    fetchLive();
  }, []);

  // Save changes live to backend & sync
  const handleSaveAll = async (overrideData) => {
    setSaving(true);
    setSaveStatus(null);
    const payload = overrideData || ratesData;
    payload.updated_at = new Date().toISOString();

    try {
      const res = await fetch('/api/quotation/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSaveStatus({ type: 'success', msg: 'All pricing rules & slabs saved & synced live!' });
        localStorage.setItem('jbc_quotation_rate_slabs', JSON.stringify(payload));
        window.__JBC_RATE_SLABS = payload;

        try {
          const bc = new BroadcastChannel('jbc_rate_slabs_channel');
          bc.postMessage({ rates: payload });
          bc.close();
        } catch (_) {}

        window.dispatchEvent(new CustomEvent('jbc_rate_slabs_updated', { detail: payload }));
      } else {
        setSaveStatus({ type: 'error', msg: data.error || 'Failed to save rates to server' });
      }
    } catch (err) {
      setSaveStatus({ type: 'error', msg: 'Network error saving rates: ' + err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(null), 6000);
    }
  };

  // Helper updates
  const updateTripType = (typeKey, field, val) => {
    setRatesData(prev => {
      const updated = {
        ...prev,
        trip_types: {
          ...prev.trip_types,
          [typeKey]: {
            ...prev.trip_types[typeKey],
            [field]: val
          }
        }
      };
      if (field === 'discount_percent') {
        const disc = parseFloat(val) || 0;
        updated.trip_types[typeKey].multiplier = parseFloat((2 - (disc / 100)).toFixed(2));
      } else if (field === 'multiplier') {
        const mult = parseFloat(val) || 1.0;
        if (typeKey === 'round_trip') {
          updated.trip_types[typeKey].discount_percent = Math.max(0, Math.round((2 - mult) * 100));
        }
      }
      return updated;
    });
  };

  const updateContractTenure = (tenureKey, field, val) => {
    setRatesData(prev => {
      const updated = {
        ...prev,
        contract_tenures: {
          ...prev.contract_tenures,
          [tenureKey]: {
            ...prev.contract_tenures[tenureKey],
            [field]: val
          }
        }
      };
      if (field === 'discount_percent') {
        const disc = parseFloat(val) || 0;
        updated.contract_tenures[tenureKey].multiplier = parseFloat((1 - (disc / 100)).toFixed(2));
      } else if (field === 'multiplier') {
        const mult = parseFloat(val) || 1.0;
        updated.contract_tenures[tenureKey].discount_percent = Math.max(0, Math.round((1 - mult) * 100));
      }
      return updated;
    });
  };

  const updatePayloadRule = (ruleKey, field, val) => {
    setRatesData(prev => {
      const updated = {
        ...prev,
        weight_payload_rules: {
          ...prev.weight_payload_rules,
          [ruleKey]: {
            ...prev.weight_payload_rules[ruleKey],
            [field]: val
          }
        }
      };
      if (field === 'surcharge_percent') {
        const sur = parseFloat(val) || 0;
        updated.weight_payload_rules[ruleKey].multiplier = parseFloat((1 + (sur / 100)).toFixed(2));
      } else if (field === 'multiplier') {
        const mult = parseFloat(val) || 1.0;
        updated.weight_payload_rules[ruleKey].surcharge_percent = Math.max(0, Math.round((mult - 1) * 100));
      }
      return updated;
    });
  };

  const handleUpdateVehicle = (updated) => {
    const nextVehicles = ratesData.vehicles.map(v => v.id === updated.id ? updated : v);
    const nextData = { ...ratesData, vehicles: nextVehicles };
    setRatesData(nextData);
    setEditingVehicle(null);
  };

  const handleAddVehicle = (newVeh) => {
    const nextData = { ...ratesData, vehicles: [...ratesData.vehicles, newVeh] };
    setRatesData(nextData);
    setIsNewCategoryOpen(false);
  };

  const handleDeleteVehicle = (vehId) => {
    if (!window.confirm("Are you sure you want to remove this vehicle category?")) return;
    const nextData = { ...ratesData, vehicles: ratesData.vehicles.filter(v => v.id !== vehId) };
    setRatesData(nextData);
  };

  // Test simulation
  const testVehicle = useMemo(() => {
    return ratesData.vehicles.find(v => v.id === testVehicleId) || ratesData.vehicles[0];
  }, [ratesData.vehicles, testVehicleId]);

  const testResult = useMemo(() => {
    return calculateQuotePrice(testVehicle, Number(testDistance) || 0, {
      trip_type: testTripType,
      contract_tenure: testTenure,
      payload_type: testPayload,
      mode: ratesData.pricing_mode,
      ratesData
    });
  }, [testVehicle, testDistance, testTripType, testTenure, testPayload, ratesData]);

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER & ACTIONS BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
              Quotation Pricing Matrix & Super Admin Rate Engine
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 uppercase">
              Super Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Control distance slabs (&lt;100km base ₹10k for 32ft), one-way vs round trip, contract tenures, and full payload weight surcharges. All changes sync live to the Welcome Page customer calculator.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-center">
          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={saving}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 shadow-lg ${saving ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 active:scale-95 shadow-amber-500/25"}`}
          >
            <span>{saving ? "⏳" : "💾"}</span>
            <span>{saving ? "Saving & Syncing..." : "Save & Sync Live"}</span>
          </button>
        </div>
      </div>

      {/* Save Notification Alert */}
      {saveStatus && (
        <div className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2.5 animate-in fade-in duration-200 ${saveStatus.type === "success" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" : "bg-rose-500/10 text-rose-300 border-rose-500/30"}`}>
          <span>{saveStatus.type === "success" ? "✅" : "❌"}</span>
          <span>{saveStatus.msg}</span>
        </div>
      )}

      {/* ── SUB-TABS NAVIGATION ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "vehicles", label: "🚚 Vehicle Distance Slabs", desc: "0-100km Base ₹10k & progressive tiers" },
          { id: "trip_types", label: "🔄 Trip Type (1-Way / 2-Way)", desc: "Round trip return leg discount" },
          { id: "contracts", label: "📄 Contract Tenures", desc: "Spot, 1M, 3M, 6M, 1Y discounts" },
          { id: "payload", label: "⚖️ Weight & Full Payload", desc: "Heavy tonnage surcharge" },
          { id: "tester", label: "🧮 Live Pricing Simulator", desc: "Test real-time calculation" }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeSubTab === tab.id ? "bg-amber-500 text-slate-950 shadow-md font-black" : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: VEHICLE DISTANCE RATE SLABS ── */}
      {activeSubTab === "vehicles" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Distance Rate Slabs by Vehicle Category</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {ratesData.vehicles.length} Categories
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure distinct rates per km for Adhoc / Spot loads vs Corporate Contracts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRatePricingView("adhoc")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${ratePricingView === "adhoc" ? "bg-amber-500 text-slate-950 font-black shadow" : "text-slate-400 hover:text-white"}`}
                >
                  <span>⚡ Adhoc / Spot Slabs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRatePricingView("contract")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${ratePricingView === "contract" ? "bg-amber-400/20 text-amber-300 font-black border border-amber-500/40 shadow" : "text-slate-400 hover:text-white"}`}
                >
                  <span>📜 Contract Slabs</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsNewCategoryOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>➕</span> Add Vehicle
              </button>
            </div>
          </div>

          {/* Slabs Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Vehicle Category</th>
                    <th className={`py-3 px-3 text-center border-x font-black ${ratePricingView === 'adhoc' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-400/10 border-amber-400/20 text-amber-300'}`}>
                      0 - 100 KM<br/><span className="text-[9px] font-normal opacity-90">{ratePricingView === 'adhoc' ? '⚡ Adhoc Base Flat' : '📜 Contract Base Flat'}</span>
                    </th>
                    <th className="py-3 px-3 text-center">100 - 200 KM<br/><span className="text-[9px] font-normal text-slate-500">{ratePricingView === 'adhoc' ? '⚡ Adhoc Rate' : '📜 Contract Rate'}</span></th>
                    <th className="py-3 px-3 text-center">200 - 300 KM<br/><span className="text-[9px] font-normal text-slate-500">{ratePricingView === 'adhoc' ? '⚡ Adhoc Rate' : '📜 Contract Rate'}</span></th>
                    <th className="py-3 px-3 text-center">300 - 400 KM<br/><span className="text-[9px] font-normal text-slate-500">{ratePricingView === 'adhoc' ? '⚡ Adhoc Rate' : '📜 Contract Rate'}</span></th>
                    <th className="py-3 px-3 text-center">400+ KM<br/><span className="text-[9px] font-normal text-slate-500">{ratePricingView === 'adhoc' ? '⚡ Adhoc Rate' : '📜 Contract Rate'}</span></th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ratesData.vehicles.map((v) => {
                    const isAdhoc = ratePricingView === 'adhoc';
                    const baseVal = isAdhoc ? (v.adhoc_base_rate_under_100 ?? v.base_rate_under_100) : (v.contract_base_rate_under_100 ?? Math.round((v.base_rate_under_100||10000)*0.85));
                    const r1 = isAdhoc ? (v.adhoc_rate_100_200 ?? v.rate_100_200) : (v.contract_rate_100_200 ?? Math.round((v.rate_100_200||60)*0.88));
                    const r2 = isAdhoc ? (v.adhoc_rate_200_300 ?? v.rate_200_300) : (v.contract_rate_200_300 ?? Math.round((v.rate_200_300||54)*0.88));
                    const r3 = isAdhoc ? (v.adhoc_rate_300_400 ?? v.rate_300_400) : (v.contract_rate_300_400 ?? Math.round((v.rate_300_400||50)*0.88));
                    const r4 = isAdhoc ? (v.adhoc_rate_above_400 ?? v.rate_above_400) : (v.contract_rate_above_400 ?? Math.round((v.rate_above_400||48)*0.88));
                    
                    return (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs sm:text-sm">{v.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-amber-400">{v.short || v.id}</span>
                          <button
                            type="button"
                            onClick={() => setEditingVehicle(v)}
                            className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/20 font-mono text-[10px] flex items-center gap-1 transition-colors"
                            title="Click to edit payload capacity"
                          >
                            <span>⚖️ Payload:</span>
                            <span className="underline decoration-dashed">{v.capacity || `${v.maxMT} MT`}</span>
                            <span className="text-[9px] text-emerald-500">✏️</span>
                          </button>
                        </div>
                      </td>

                      <td className={`py-3 px-3 text-center border-x ${isAdhoc ? 'bg-amber-500/5 border-amber-500/15' : 'bg-amber-400/5 border-amber-400/15'}`}>
                        <div className="font-black text-amber-300 text-sm">
                          ₹{Number(baseVal || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">{isAdhoc ? '⚡ Adhoc Base' : '📜 Contract Base'}</div>
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-200">
                        ₹{r1}/km
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-200">
                        ₹{r2}/km
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-200">
                        ₹{r3}/km
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-400">
                        ₹{r4}/km
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingVehicle(v)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition-colors"
                          >
                            ✏️ Edit Slabs
                          </button>
                          {ratesData.vehicles.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteVehicle(v.id)}
                              className="px-2 py-1 rounded-lg hover:bg-rose-500/20 text-rose-400 text-xs transition-colors"
                              title="Delete vehicle category"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TRIP TYPE PRICING (ONE-WAY VS ROUND TRIP) ── */}
      {activeSubTab === "trip_types" && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>🔄 Trip Type Directionality Pricing</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">Live Synced</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure multipliers and return leg discounts when a client books a One-Way vs Two-Way (Round Trip). Round trip pricing automatically applies the return discount.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* One Way Card */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>➡️</span> One-Way Trip
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">Standard Baseline</span>
                </div>
                <p className="text-xs text-slate-400">Single leg destination drop point. Standard calculated rate.</p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Pricing Multiplier</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="2"
                    value={ratesData.trip_types?.one_way?.multiplier ?? 1.0}
                    onChange={(e) => updateTripType("one_way", "multiplier", e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">1.0 = 100% of single leg distance slab</span>
                </div>
              </div>

              {/* Round Trip Card */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 bg-amber-500/5 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-amber-300 text-sm flex items-center gap-2">
                    <span>🔄</span> Two-Way / Round Trip
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">Return Leg Discount</span>
                </div>
                <p className="text-xs text-slate-400">Includes return journey with backhaul / return freight savings.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Return Leg Discount %</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={ratesData.trip_types?.round_trip?.discount_percent ?? 15}
                        onChange={(e) => updateTripType("round_trip", "discount_percent", e.target.value)}
                        className="w-full h-9 px-3 pr-7 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold"
                      />
                      <span className="absolute right-2.5 top-2 text-xs text-slate-500 font-bold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Total Trip Multiplier</label>
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="2.5"
                      value={ratesData.trip_types?.round_trip?.multiplier ?? 1.85}
                      onChange={(e) => updateTripType("round_trip", "multiplier", e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 text-[11px] text-slate-300 flex items-center justify-between border border-slate-800">
                  <span>Effective Formula:</span>
                  <span className="font-mono text-amber-300 font-bold">
                    Total = Single Leg Rate × {ratesData.trip_types?.round_trip?.multiplier ?? 1.85}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: CONTRACT TENURE DISCOUNTS ── */}
      {activeSubTab === "contracts" && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>📄 Contract Tenure & Commitment Volume Discounts</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Clients committing to 1-Month, 3-Month, 6-Month, or 1-Year agreements receive dedicated volume discounts over Adhoc / Spot loads.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {[
                { key: "spot", label: "Adhoc / Spot Load", defaultDisc: 0, badge: "No Discount (Spot)", color: "border-slate-800" },
                { key: "contract_1m", label: "1 Month Contract", defaultDisc: 5, badge: "Monthly Tenure", color: "border-emerald-500/30" },
                { key: "contract_3m", label: "3 Months Contract", defaultDisc: 8, badge: "Quarterly Tenure", color: "border-emerald-500/40" },
                { key: "contract_6m", label: "6 Months Contract", defaultDisc: 12, badge: "Half-Yearly Tenure", color: "border-amber-500/40" },
                { key: "contract_1y", label: "1 Year Contract", defaultDisc: 15, badge: "Annual Enterprise", color: "border-purple-500/40" }
              ].map(item => {
                const cfg = ratesData.contract_tenures?.[item.key] || { discount_percent: item.defaultDisc, multiplier: (1 - item.defaultDisc/100) };
                return (
                  <div key={item.key} className={`p-4 rounded-xl bg-slate-950/70 border ${item.color} space-y-3`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-xs">{item.label}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{item.badge}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-semibold mb-1">Discount %</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="40"
                            value={cfg.discount_percent ?? item.defaultDisc}
                            onChange={(e) => updateContractTenure(item.key, "discount_percent", e.target.value)}
                            className="w-full h-8 px-2 text-xs rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold font-mono"
                          />
                          <span className="absolute right-2 top-1.5 text-xs text-slate-500">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-semibold mb-1">Multiplier</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.5"
                          max="1.0"
                          value={cfg.multiplier ?? (1 - (cfg.discount_percent || 0)/100)}
                          onChange={(e) => updateContractTenure(item.key, "multiplier", e.target.value)}
                          className="w-full h-8 px-2 text-xs rounded bg-slate-900 border border-slate-700 text-white font-bold font-mono"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: WEIGHT & FULL PAYLOAD RULES ── */}
      {activeSubTab === "payload" && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>⚖️ Weight & Full Payload Utilization Surcharges</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                When a vehicle operates under maximum gross payload (e.g. 9 MT for 32ft SXL or 18 MT for MXL), diesel fuel consumption and axle stress increase. Configure the full-payload pricing premium.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Standard Payload */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-white text-sm">⚖️ Standard Payload (Partial / Average)</div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">Up to 75% Capacity</span>
                </div>
                <p className="text-xs text-slate-400">Regular freight density within vehicle's comfortable operating tonnage.</p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Pricing Multiplier</label>
                  <input
                    type="number"
                    step="0.05"
                    value={ratesData.weight_payload_rules?.standard?.multiplier ?? 1.0}
                    onChange={(e) => updatePayloadRule("standard", "multiplier", e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">1.0 = standard rate (0% surcharge)</span>
                </div>
              </div>

              {/* Full Payload */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-rose-500/30 bg-rose-500/5 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-rose-300 text-sm">🏋️ Full Payload / Maximum Capacity</div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">100% Rated Tonnage</span>
                </div>
                <p className="text-xs text-slate-400">Full vehicle weight capacity utilization with high diesel consumption.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Heavy Load Surcharge %</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={ratesData.weight_payload_rules?.full_payload?.surcharge_percent ?? 10}
                        onChange={(e) => updatePayloadRule("full_payload", "surcharge_percent", e.target.value)}
                        className="w-full h-9 px-3 pr-7 rounded-lg bg-slate-900 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold"
                      />
                      <span className="absolute right-2.5 top-2 text-xs text-slate-500 font-bold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Multiplier</label>
                    <input
                      type="number"
                      step="0.01"
                      value={ratesData.weight_payload_rules?.full_payload?.multiplier ?? 1.10}
                      onChange={(e) => updatePayloadRule("full_payload", "multiplier", e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: INTERACTIVE LIVE PRICING SIMULATOR ── */}
      {activeSubTab === "tester" && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 shadow-2xl space-y-5">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>🧮 Super Admin Real-Time Dynamic Price Simulator</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">Instant Evaluation</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select any vehicle, distance, trip type, contract tenure, and payload weight to test the exact pricing engine calculations in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input Controls */}
            <div className="md:col-span-2 space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Select Vehicle Category</label>
                  <select
                    value={testVehicleId}
                    onChange={(e) => setTestVehicleId(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                  >
                    {ratesData.vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Trip Distance: {testDistance} KM</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="10"
                      max="1500"
                      step="10"
                      value={testDistance}
                      onChange={(e) => setTestDistance(Number(e.target.value))}
                      className="flex-1 accent-amber-500"
                    />
                    <input
                      type="number"
                      min="1"
                      max="3000"
                      value={testDistance}
                      onChange={(e) => setTestDistance(Number(e.target.value))}
                      className="w-20 h-9 px-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white font-mono font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Trip Type Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Trip Directionality</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTestTripType("one_way")}
                    className={`p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${testTripType === "one_way" ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-950 text-slate-400 border border-slate-800"}`}
                  >
                    <span>➡️</span> One-Way Trip (1.0x)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestTripType("round_trip")}
                    className={`p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${testTripType === "round_trip" ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-950 text-slate-400 border border-slate-800"}`}
                  >
                    <span>🔄</span> Two-Way / Round Trip ({ratesData.trip_types?.round_trip?.multiplier ?? 1.85}x)
                  </button>
                </div>
              </div>

              {/* Contract Tenure Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Contract / Engagement Tenure</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {[
                    { id: "spot", label: "Spot / Adhoc" },
                    { id: "contract_1m", label: "1 Month" },
                    { id: "contract_3m", label: "3 Months" },
                    { id: "contract_6m", label: "6 Months" },
                    { id: "contract_1y", label: "1 Year" }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTestTenure(t.id)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${testTenure === t.id ? "bg-primary text-primary-foreground font-black" : "bg-slate-950 text-slate-400 border border-slate-800"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payload Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Cargo Weight & Payload</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTestPayload("standard")}
                    className={`p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${testPayload === "standard" ? "bg-emerald-600 text-white font-black" : "bg-slate-950 text-slate-400 border border-slate-800"}`}
                  >
                    <span>⚖️</span> Standard Payload (1.0x)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestPayload("full_payload")}
                    className={`p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${testPayload === "full_payload" ? "bg-rose-600 text-white font-black" : "bg-slate-950 text-slate-400 border border-slate-800"}`}
                  >
                    <span>🏋️</span> Full Payload (+{ratesData.weight_payload_rules?.full_payload?.surcharge_percent ?? 10}%)
                  </button>
                </div>
              </div>
            </div>

            {/* Live Output Card */}
            <div className="bg-slate-950 p-5 rounded-xl border border-amber-500/40 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Total Calculated Estimate</span>
                <div className="text-3xl sm:text-4xl font-black text-amber-300 mt-1 font-mono">
                  ₹{testResult.total.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <span>{testVehicle?.short || testVehicle?.name}</span>
                  <span>•</span>
                  <span>{testDistance} km</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-3 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Base Distance Cost:</span>
                  <span className="font-mono font-bold">₹{testResult.baseDistanceCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Applied Slab:</span>
                  <span className="text-amber-300 font-bold">{testResult.appliedSlab}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Trip Direction:</span>
                  <span className="font-mono">{testResult.multipliers.tripLabel} ({testResult.multipliers.trip}x)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Payload:</span>
                  <span className="font-mono">{testResult.multipliers.payloadLabel} ({testResult.multipliers.payload}x)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tenure Discount:</span>
                  <span className="font-mono text-emerald-400">{testResult.multipliers.tenureLabel} ({testResult.multipliers.tenure}x)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400 leading-relaxed font-mono">
                {testResult.breakdown}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS: EDIT VEHICLE SLABS ── */}
      {editingVehicle && (
        <VehicleSlabsEditModal
          vehicle={editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onSave={handleUpdateVehicle}
        />
      )}

      {/* ── MODALS: ADD NEW CATEGORY ── */}
      {isNewCategoryOpen && (
        <NewVehicleModal
          onClose={() => setIsNewCategoryOpen(false)}
          onAdd={handleAddVehicle}
        />
      )}
    </div>
  );
}

function VehicleSlabsEditModal({ vehicle, onClose, onSave }) {
  const [form, setForm] = useState({
    ...vehicle,
    adhoc_base_rate_under_100: vehicle.adhoc_base_rate_under_100 ?? vehicle.base_rate_under_100 ?? 10000,
    adhoc_rate_100_200: vehicle.adhoc_rate_100_200 ?? vehicle.rate_100_200 ?? 60,
    adhoc_rate_200_300: vehicle.adhoc_rate_200_300 ?? vehicle.rate_200_300 ?? 54,
    adhoc_rate_300_400: vehicle.adhoc_rate_300_400 ?? vehicle.rate_300_400 ?? 50,
    adhoc_rate_above_400: vehicle.adhoc_rate_above_400 ?? vehicle.rate_above_400 ?? 48,
    contract_base_rate_under_100: vehicle.contract_base_rate_under_100 ?? Math.round((vehicle.base_rate_under_100 || 10000) * 0.85),
    contract_rate_100_200: vehicle.contract_rate_100_200 ?? Math.round((vehicle.rate_100_200 || 60) * 0.88),
    contract_rate_200_300: vehicle.contract_rate_200_300 ?? Math.round((vehicle.rate_200_300 || 54) * 0.88),
    contract_rate_300_400: vehicle.contract_rate_300_400 ?? Math.round((vehicle.rate_300_400 || 50) * 0.88),
    contract_rate_above_400: vehicle.contract_rate_above_400 ?? Math.round((vehicle.rate_above_400 || 48) * 0.88)
  });
  const [rateTab, setRateTab] = useState("adhoc"); // "adhoc" | "contract"

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      base_rate_under_100: Number(form.adhoc_base_rate_under_100),
      rate_100_200: Number(form.adhoc_rate_100_200),
      rate_200_300: Number(form.adhoc_rate_200_300),
      rate_300_400: Number(form.adhoc_rate_300_400),
      rate_above_400: Number(form.adhoc_rate_above_400),
      adhoc_base_rate_under_100: Number(form.adhoc_base_rate_under_100),
      adhoc_rate_100_200: Number(form.adhoc_rate_100_200),
      adhoc_rate_200_300: Number(form.adhoc_rate_200_300),
      adhoc_rate_300_400: Number(form.adhoc_rate_300_400),
      adhoc_rate_above_400: Number(form.adhoc_rate_above_400),
      contract_base_rate_under_100: Number(form.contract_base_rate_under_100),
      contract_rate_100_200: Number(form.contract_rate_100_200),
      contract_rate_200_300: Number(form.contract_rate_200_300),
      contract_rate_300_400: Number(form.contract_rate_300_400),
      contract_rate_above_400: Number(form.contract_rate_above_400)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 my-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>✏️</span> Edit Slabs: {form.name}
          </h3>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Vehicle Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Max Capacity (Tons)</label>
              <input
                type="number"
                step="0.5"
                value={form.maxMT || 9}
                onChange={e => setForm({ ...form, maxMT: parseFloat(e.target.value) || 0 })}
                className="w-full h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold text-amber-300">
                Payload Range (Capacity Display) *
              </label>
              <span className="text-[10px] text-slate-500 font-mono">e.g. 6 - 9 MT or 7 - 8.5 MT</span>
            </div>
            <input
              type="text"
              required
              value={form.capacity || ""}
              onChange={e => setForm({ ...form, capacity: e.target.value })}
              placeholder="e.g. 6 - 9 MT, 7 - 10 MT, 14 - 18 MT"
              className="w-full h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["2.5 - 3.5 MT", "3 - 4.5 MT", "4 - 5.5 MT", "6 - 8.5 MT", "7 - 9.5 MT", "7 - 10 MT", "6 - 9 MT", "7 - 9 MT", "14 - 18 MT", "18 - 25 MT", "25 - 32 MT"].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setForm({ ...form, capacity: preset })}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${form.capacity === preset ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Adhoc vs Contract Switcher inside Modal */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setRateTab("adhoc")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${rateTab === "adhoc" ? "bg-amber-500 text-slate-950 font-black shadow" : "text-slate-400 hover:text-white"}`}
            >
              <span>⚡ Adhoc / Spot Load Slabs</span>
            </button>
            <button
              type="button"
              onClick={() => setRateTab("contract")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${rateTab === "contract" ? "bg-amber-400/20 text-amber-300 font-black border border-amber-500/40 shadow" : "text-slate-400 hover:text-white"}`}
            >
              <span>📜 Contract Slabs</span>
            </button>
          </div>

          {rateTab === "adhoc" ? (
            <div className="space-y-3 p-3 rounded-xl bg-slate-950/60 border border-amber-500/30">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-amber-300">
                  0 - 100 KM Adhoc Flat Base Rate (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={form.adhoc_base_rate_under_100}
                  onChange={e => setForm({ ...form, adhoc_base_rate_under_100: Number(e.target.value) })}
                  className="w-full h-8 px-3 rounded-lg bg-slate-900 border border-amber-500/50 text-amber-300 font-bold font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">100 - 200 KM Adhoc (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.adhoc_rate_100_200}
                    onChange={e => setForm({ ...form, adhoc_rate_100_200: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">200 - 300 KM Adhoc (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.adhoc_rate_200_300}
                    onChange={e => setForm({ ...form, adhoc_rate_200_300: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">300 - 400 KM Adhoc (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.adhoc_rate_300_400}
                    onChange={e => setForm({ ...form, adhoc_rate_300_400: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">400+ KM Adhoc (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.adhoc_rate_above_400}
                    onChange={e => setForm({ ...form, adhoc_rate_above_400: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-3 rounded-xl bg-slate-950/60 border border-amber-400/30">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-amber-300">
                  0 - 100 KM Contract Flat Base Rate (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={form.contract_base_rate_under_100}
                  onChange={e => setForm({ ...form, contract_base_rate_under_100: Number(e.target.value) })}
                  className="w-full h-8 px-3 rounded-lg bg-slate-900 border border-amber-400/50 text-amber-300 font-bold font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">100 - 200 KM Contract (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.contract_rate_100_200}
                    onChange={e => setForm({ ...form, contract_rate_100_200: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">200 - 300 KM Contract (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.contract_rate_200_300}
                    onChange={e => setForm({ ...form, contract_rate_200_300: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">300 - 400 KM Contract (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.contract_rate_300_400}
                    onChange={e => setForm({ ...form, contract_rate_300_400: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">400+ KM Contract (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.contract_rate_above_400}
                    onChange={e => setForm({ ...form, contract_rate_above_400: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black">Save Slabs</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewVehicleModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    id: "custom_" + Date.now().toString(36),
    name: "",
    short: "",
    capacity: "8 - 12 MT",
    maxMT: 10,
    base_rate_under_100: 9000,
    rate_100_200: 55,
    rate_200_300: 50,
    rate_300_400: 46,
    rate_above_400: 44,
    adhoc_base_rate_under_100: 9000,
    adhoc_rate_100_200: 55,
    adhoc_rate_200_300: 50,
    adhoc_rate_300_400: 46,
    adhoc_rate_above_400: 44,
    contract_base_rate_under_100: 7600,
    contract_rate_100_200: 48,
    contract_rate_200_300: 44,
    contract_rate_300_400: 40,
    contract_rate_above_400: 38,
    description: "Custom commercial transport vehicle"
  });
  const [rateTab, setRateTab] = useState("adhoc");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...form,
      base_rate_under_100: Number(form.adhoc_base_rate_under_100),
      rate_100_200: Number(form.adhoc_rate_100_200),
      rate_200_300: Number(form.adhoc_rate_200_300),
      rate_300_400: Number(form.adhoc_rate_300_400),
      rate_above_400: Number(form.adhoc_rate_above_400),
      adhoc_base_rate_under_100: Number(form.adhoc_base_rate_under_100),
      adhoc_rate_100_200: Number(form.adhoc_rate_100_200),
      adhoc_rate_200_300: Number(form.adhoc_rate_200_300),
      adhoc_rate_300_400: Number(form.adhoc_rate_300_400),
      adhoc_rate_above_400: Number(form.adhoc_rate_above_400),
      contract_base_rate_under_100: Number(form.contract_base_rate_under_100),
      contract_rate_100_200: Number(form.contract_rate_100_200),
      contract_rate_200_300: Number(form.contract_rate_200_300),
      contract_rate_300_400: Number(form.contract_rate_300_400),
      contract_rate_above_400: Number(form.contract_rate_above_400)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 my-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>➕</span> Add New Vehicle Category
          </h3>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Vehicle Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. 28 FT Container"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Short Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. 28 FT"
                value={form.short}
                onChange={e => setForm({ ...form, short: e.target.value })}
                className="w-full h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold text-amber-300">
                Payload Range (Capacity Display) *
              </label>
              <span className="text-[10px] text-slate-500 font-mono">e.g. 6 - 9 MT or 7 - 10 MT</span>
            </div>
            <input
              type="text"
              required
              value={form.capacity || ""}
              onChange={e => setForm({ ...form, capacity: e.target.value })}
              placeholder="e.g. 6 - 9 MT"
              className="w-full h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["2.5 - 3.5 MT", "3 - 4.5 MT", "4 - 5.5 MT", "6 - 8.5 MT", "7 - 9.5 MT", "7 - 10 MT", "6 - 9 MT", "7 - 9 MT", "14 - 18 MT", "18 - 25 MT"].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setForm({ ...form, capacity: preset })}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${form.capacity === preset ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Adhoc vs Contract Switcher inside Modal */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setRateTab("adhoc")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${rateTab === "adhoc" ? "bg-amber-500 text-slate-950 font-black shadow" : "text-slate-400 hover:text-white"}`}
            >
              <span>⚡ Adhoc / Spot Load Slabs</span>
            </button>
            <button
              type="button"
              onClick={() => setRateTab("contract")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${rateTab === "contract" ? "bg-amber-400/20 text-amber-300 font-black border border-amber-500/40 shadow" : "text-slate-400 hover:text-white"}`}
            >
              <span>📜 Contract Slabs</span>
            </button>
          </div>

          {rateTab === "adhoc" ? (
            <div className="space-y-3 p-3 rounded-xl bg-slate-950/60 border border-amber-500/30">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-amber-300">
                  0 - 100 KM Adhoc Flat Base Rate (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={form.adhoc_base_rate_under_100}
                  onChange={e => setForm({ ...form, adhoc_base_rate_under_100: Number(e.target.value) })}
                  className="w-full h-8 px-3 rounded-lg bg-slate-900 border border-amber-500/50 text-amber-300 font-bold font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">100 - 200 KM Adhoc (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.adhoc_rate_100_200}
                    onChange={e => setForm({ ...form, adhoc_rate_100_200: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">200 - 300 KM Adhoc (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.adhoc_rate_200_300}
                    onChange={e => setForm({ ...form, adhoc_rate_200_300: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">300 - 400 KM Adhoc (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.adhoc_rate_300_400}
                    onChange={e => setForm({ ...form, adhoc_rate_300_400: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">400+ KM Adhoc (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.adhoc_rate_above_400}
                    onChange={e => setForm({ ...form, adhoc_rate_above_400: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-3 rounded-xl bg-slate-950/60 border border-amber-400/30">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-amber-300">
                  0 - 100 KM Contract Flat Base Rate (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={form.contract_base_rate_under_100}
                  onChange={e => setForm({ ...form, contract_base_rate_under_100: Number(e.target.value) })}
                  className="w-full h-8 px-3 rounded-lg bg-slate-900 border border-amber-400/50 text-amber-300 font-bold font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">100 - 200 KM Contract (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.contract_rate_100_200}
                    onChange={e => setForm({ ...form, contract_rate_100_200: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">200 - 300 KM Contract (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.contract_rate_200_300}
                    onChange={e => setForm({ ...form, contract_rate_200_300: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">300 - 400 KM Contract (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.contract_rate_300_400}
                    onChange={e => setForm({ ...form, contract_rate_300_400: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">400+ KM Contract (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={form.contract_rate_above_400}
                    onChange={e => setForm({ ...form, contract_rate_above_400: Number(e.target.value) })}
                    className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black">Add Vehicle</button>
          </div>
        </form>
      </div>
    </div>
  );
}
