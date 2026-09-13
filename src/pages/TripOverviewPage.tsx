import React, { useState } from 'react';
import { Calculator, Save, Disc, CheckCircle, ArrowRightLeft, Check } from 'lucide-react';
import { tripCalculationService } from '../services/tripCalculationService';
import { ORR_INTERCHANGES, ORR_VEHICLE_CATEGORIES, calculateOrrToll } from '../data/orrTollRates';

export const TripOverviewPage: React.FC = () => {
  const [distance, setDistance] = useState(150);
  const [revenue, setRevenue] = useState(7029);
  const [fuelCost, setFuelCost] = useState(2300);
  const [tollCost, setTollCost] = useState(550);
  const [driverAllowance, setDriverAllowance] = useState(1000);
  const [tyreDepreciationRate, setTyreDepreciationRate] = useState(3);
  const [saveModal, setSaveModal] = useState(false);
  const [routeName, setRouteName] = useState('HYD-WAR-01 (FORWARD)');
  const [vehicleNumber, setVehicleNumber] = useState('TG12U2637');
  const [savedNotif, setSavedNotif] = useState(false);

  // ORR Toll Fare Calculator State
  const [orrOrigin, setOrrOrigin] = useState('1');
  const [orrDestination, setOrrDestination] = useState('16');
  const [orrVehicle, setOrrVehicle] = useState('bus_2axle');
  const [orrTripType, setOrrTripType] = useState<'single' | 'return24h'>('single');
  const [orrApplied, setOrrApplied] = useState(false);

  const orrResult = calculateOrrToll(orrOrigin, orrDestination, orrVehicle, orrTripType);

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

  const result = tripCalculationService.calculateTrip({
    distance_kms: distance,
    revenue,
    fuel_cost: fuelCost,
    toll_cost: tollCost,
    driver_allowance: driverAllowance,
    tyre_depreciation_rate_per_km: tyreDepreciationRate
  });

  const handleSaveCalculation = (e: React.FormEvent) => {
    e.preventDefault();
    tripCalculationService.saveCalculation({
      distance_kms: distance,
      revenue,
      fuel_cost: fuelCost,
      toll_cost: tollCost,
      driver_allowance: driverAllowance,
      tyre_depreciation_rate_per_km: tyreDepreciationRate,
      route_name: routeName,
      vehicle_number: vehicleNumber
    });
    setSaveModal(false);
    setSavedNotif(true);
    setTimeout(() => setSavedNotif(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Calculator className="w-7 h-7 text-orange-400" /> Trip Overview &amp; Profitability Calculator
          </h1>
          <p className="text-sm text-slate-400">Dynamic trip parameter modeling including Tyre Depreciation Cost (₹/KM)</p>
        </div>
        <button
          onClick={() => setSaveModal(true)}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-orange-900/30 transition"
        >
          <Save className="w-4 h-4" /> Save Trip Calculation
        </button>
      </div>

      {savedNotif && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> Trip calculation successfully saved to active logs!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white">Trip Operational Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Distance (KMs)</label>
              <input type="number" value={distance} onChange={e => setDistance(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Client Contract Revenue (₹)</label>
              <input type="number" value={revenue} onChange={e => setRevenue(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Fuel Expense (₹)</label>
              <input type="number" value={fuelCost} onChange={e => setFuelCost(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Toll Expenses (₹)</label>
              <input type="number" value={tollCost} onChange={e => setTollCost(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Driver Bata &amp; Allowance</label>
              <input type="number" value={driverAllowance} onChange={e => setDriverAllowance(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" />
            </div>
          </div>

          {/* Hyderabad ORR Toll Fare Calculator Widget */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3.5 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                  ORR
                </span>
                <span className="text-sm font-bold text-white">
                  Hyderabad ORR Toll Calculator
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">2024-25 Rate Matrix</span>
            </div>

            {/* Origin & Destination Selectors with Swap */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-slate-400">Origin Interchange</label>
                <select
                  value={orrOrigin}
                  onChange={(e) => setOrrOrigin(e.target.value)}
                  className="w-full h-9 text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 text-white font-medium focus:outline-none focus:border-orange-500"
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
                  title="Swap Origin & Destination"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition active:scale-95 flex items-center justify-center"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-slate-400">Destination Interchange</label>
                <select
                  value={orrDestination}
                  onChange={(e) => setOrrDestination(e.target.value)}
                  className="w-full h-9 text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 text-white font-medium focus:outline-none focus:border-orange-500"
                >
                  {ORR_INTERCHANGES.map(ic => (
                    <option key={`dest-${ic.id}`} value={ic.id} className="bg-slate-900 text-white">
                      IC {ic.code} - {ic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vehicle Category Selector */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Vehicle Category</label>
              <select
                value={orrVehicle}
                onChange={(e) => setOrrVehicle(e.target.value)}
                className="w-full h-9 text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 text-white font-medium focus:outline-none focus:border-orange-500"
              >
                {ORR_VEHICLE_CATEGORIES.map(v => (
                  <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Trip Type Buttons: 1-Way vs 2-Way 24h */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-medium text-slate-400">
                <span>Trip Duration / Type</span>
                {orrTripType === 'return24h' && (
                  <span className="text-emerald-400 font-semibold text-[11px]">24h Return Pass (1.5× Rate)</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrrTripType('single')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    orrTripType === 'single'
                      ? 'bg-orange-600 text-white shadow'
                      : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>1-Way Single</span>
                  <span className="text-[11px] opacity-80 font-mono">₹{orrResult?.singleFare || 0}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrrTripType('return24h')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    orrTripType === 'return24h'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>2-Way (24 Hours)</span>
                  <span className="text-[11px] opacity-80 font-mono">₹{orrResult?.returnFare24h || 0}</span>
                </button>
              </div>
            </div>

            {/* Result Display & Apply Button */}
            <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {orrTripType === 'return24h' ? '2-Way Toll (within 24h):' : 'One-Way Toll:'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-white font-mono">
                    ₹{orrResult?.selectedFare || 0}
                  </span>
                  {orrTripType === 'return24h' && orrResult?.savings > 0 && (
                    <span className="text-xs text-emerald-400 font-bold">
                      (Saves ₹{orrResult.savings})
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplyOrrToll}
                className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  orrApplied
                    ? 'bg-emerald-600 text-white scale-105'
                    : 'bg-orange-600 hover:bg-orange-500 text-white shadow'
                }`}
              >
                {orrApplied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Applied to Tolls
                  </>
                ) : (
                  <>Apply to Tolls →</>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border-2 border-orange-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-orange-400 flex items-center gap-2">
                <Disc className="w-4 h-4" /> Tyre Depreciation Cost (per KM)
              </label>
              <span className="px-2.5 py-1 bg-orange-500/20 text-orange-400 font-bold text-sm rounded-full">₹{tyreDepreciationRate} / KM</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={tyreDepreciationRate}
              onChange={e => setTyreDepreciationRate(parseFloat(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <p className="text-xs text-slate-400">Calculated Tyre Wear Expense: {distance} KMs × ₹{tyreDepreciationRate} = <b>₹{result.tyreDepreciationExpense}</b></p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white">Output Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total Revenue:</span>
              <span className="font-bold text-white">₹{revenue.toLocaleString('in-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Fuel + Tolls + Bata:</span>
              <span className="font-semibold text-slate-200">₹{(fuelCost + tollCost + driverAllowance).toLocaleString('in-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Tyre Depreciation:</span>
              <span className="font-semibold text-orange-400">₹{result.tyreDepreciationExpense.toLocaleString('in-IN')}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-300">TOTAL EXPENSES:</span>
              <span className="font-bold text-red-400">₹{result.totalExpenses.toLocaleString('in-IN')}</span>
            </div>
            <div className="p-3 bg-emerald-950/40 border-2 border-emerald-800/50 rounded-xl space-y-1">
              <span className="text-xs text-emerald-400 block">NET PROFIT</span>
              <h2 className="text-2xl font-extrabold text-emerald-400">₹{result.netProfit.toLocaleString('in-IN')}</h2>
              <p className="text-xs text-emerald-500">Profit Margin: {result.profitMargin}%</p>
            </div>
          </div>
        </div>
      </div>

      {saveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Save Trip Calculation Metadata</h3>
            <form onSubmit={handleSaveCalculation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Route / Trip Name</label>
                <input type="text" value={routeName} onChange={e => setRouteName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Vehicle Registration Number</label>
                <input type="text" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setSaveModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl">Save to Database</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};