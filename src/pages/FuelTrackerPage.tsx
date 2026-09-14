import React, { useState, useEffect, useRef } from 'react';
import { Fuel, Plus, CheckCircle, X, Camera, Upload, Loader2, Sparkles } from 'lucide-react';
import { dbtabeses } from '../db/store';
import { cashbookService } from '../services/cashbookService';
import { FuelLog } from '../types';
import { optimizeDocumentImage, runOcrEngine, parseDocumentText } from '../services/ocrDocumentService';

import { CreditCard, ShieldCheck } from 'lucide-react';

export const FuelTrackerPage: React.FC = () => {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(dbtabeses.getFuelLogs());
  const [activeTab, setActiveTab] = useState<'logs' | 'waiver'>('logs');
  const [creditCards, setCreditCards] = useState<any[]>([
    { id: '1', card_name: 'RBL IOCL XTRA', bank_name: 'RBL BANK', card_number_last4: '4120', monthly_waiver_limit: 20000, current_month_waiver_used: 0, max_waiver_per_transaction: 5000 },
    { id: '2', card_name: 'HDFC TATA NEU', bank_name: 'HDFC BANK', card_number_last4: '8831', monthly_waiver_limit: 20000, current_month_waiver_used: 0, max_waiver_per_transaction: 5000 },
    { id: '3', card_name: 'SBI BLACK', bank_name: 'SBI BANK', card_number_last4: '1904', monthly_waiver_limit: 20000, current_month_waiver_used: 0, max_waiver_per_transaction: 5000 },
    { id: '4', card_name: 'ICICI AMAZON PAY', bank_name: 'ICICI BANK', card_number_last4: '5562', monthly_waiver_limit: 20000, current_month_waiver_used: 0, max_waiver_per_transaction: 5000 },
    { id: '5', card_name: 'YES BANK SELECT', bank_name: 'YES BANK', card_number_last4: '3092', monthly_waiver_limit: 20000, current_month_waiver_used: 0, max_waiver_per_transaction: 5000 },
    { id: '6', card_name: 'IDFC SELECT', bank_name: 'IDFC BANK', card_number_last4: '7721', monthly_waiver_limit: 20000, current_month_waiver_used: 0, max_waiver_per_transaction: 5000 }
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [notif, setNotif] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const fuelCameraRef = useRef<HTMLInputElement>(null);
  const fuelFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    vehicle_number: 'TG12U2637',
    date: new Date().toISOString().split('T')[0],
    distance_kms: 150,
    liters: 50,
    cost: 4750,
    odometer: 145830,
    payment_method: 'Cash' as 'Cash' | 'Credit Card' | 'UPI',
    credit_card_id: ''
  });

  const handleScanFuelBill = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanStatus('Reading fuel receipt image...');
    try {
      const optimized = await optimizeDocumentImage(file);
      setScanStatus('Analyzing fuel receipt... Extracting liters, rate & vehicle');
      const rawText = await runOcrEngine(optimized.dataUrl);
      const parsed = parseDocumentText(rawText, 'fuel_bill');

      setForm((prev) => ({
        ...prev,
        vehicle_number: parsed.vehicle_number || prev.vehicle_number,
        liters: parsed.liters || prev.liters,
        cost: parsed.amount || prev.cost,
        date: parsed.bill_date || prev.date,
        payment_method: (parsed.payment_method === 'Credit Card' || parsed.payment_method === 'UPI' ? parsed.payment_method : 'Cash') as any
      }));

      setModalOpen(true);
      setNotif(`Diesel bill parsed! Extracted ${parsed.liters || ''}L, ₹${parsed.amount || ''} for ${parsed.vehicle_number || 'vehicle'}`);
      setTimeout(() => setNotif(''), 4000);
    } catch (err) {
      console.error('Fuel scan error:', err);
      setNotif('Could not read fuel receipt automatically. Please enter details manually.');
      setModalOpen(true);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    const handle = () => setFuelLogs(dbtabeses.getFuelLogs());
    window.addEventListener('jc-store-update', handle);
    return () => window.removeEventListener('jc-store-update', handle);
  }, []);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const current = dbtabeses.getFuelLogs();
    const selectedCard = creditCards.find(c => c.id === form.credit_card_id);
    const notes = form.payment_method === 'Credit Card' && selectedCard
      ? `Credit Card: ****${selectedCard.card_number_last4}, Name: ${selectedCard.card_name}`
      : undefined;

    const newLog: FuelLog = {
      id: 'fuel-' + Date.now(),
      vehicle_id: 'truck-001',
      ...form,
      notes
    };

    const updated = [newLog, ...current];
    dbtabeses.setFuelLogs(updated);

    // Sync fuel expense automatically with Live Cashbook Ledger!
    cashbookService.recordFuelDebit(newLog);

    setModalOpen(false);
    const waiverMsg = form.payment_method === 'Credit Card' ? ' (Waiver limit tracking updated!)' : '';
    setNotif(`Fuel fill-up log of ₹${form.cost.toLocaleString('en-IN')} saved & debited to Cashbook!${waiverMsg}`);
    setTimeout(() => setNotif(''), 3500);
  };

  const totalSpent = fuelLogs.reduce((sum, f) => sum + (f.cost || 0), 0);
  const totalLiters = fuelLogs.reduce((sum, f) => sum + (f.liters || 0), 0);

  // Dynamic current month surcharge waiver limit tracking based on fuelLogs (1st to month end)
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonthIdx = now.getMonth();
  const curMonthStr = `${curYear}-${String(curMonthIdx + 1).padStart(2, '0')}`;

  const isCurrentMonth = (dateVal?: string) => {
    if (!dateVal) return false;
    const s = String(dateVal).trim();
    if (s.length >= 7 && s.slice(0, 7) === curMonthStr) return true;
    const dt = new Date(s);
    return !isNaN(dt.getTime()) && dt.getFullYear() === curYear && dt.getMonth() === curMonthIdx;
  };

  // 1. De-duplicate fuel bills for the current calendar month
  const seenDayAmount = new Set<string>();
  const canonicalFuelBills: typeof fuelLogs = [];

  for (const f of fuelLogs) {
    if (!isCurrentMonth(f.date)) continue;
    const isCC = f.payment_method === 'Credit Card' || (f as any).payment_method === 'Credit' || Boolean(f.credit_card_id);
    if (!isCC) continue;

    const dayStr = String(f.date || '').slice(0, 10);
    const amtRound = Math.round(f.cost || 0);
    const key = `${dayStr}_${amtRound}`;
    if (dayStr && amtRound > 0 && seenDayAmount.has(key)) continue;

    if (dayStr && amtRound > 0) seenDayAmount.add(key);
    canonicalFuelBills.push(f);
  }

  // 2. Assign each physical bill to at most ONE card
  const cardBillsMap = new Map<string, typeof fuelLogs>();
  creditCards.forEach(c => cardBillsMap.set(c.id, []));

  canonicalFuelBills.forEach(bill => {
    let matchedCard = creditCards.find(c => c.id === bill.credit_card_id);

    if (!matchedCard) {
      const notes = String(bill.notes || '').toLowerCase();
      matchedCard = creditCards.find(c => {
        const cardName = String(c.card_name || '').toLowerCase().trim();
        const last4 = String(c.card_number_last4 || '').trim();
        if (cardName && cardName.length > 5 && notes.includes(cardName)) return true;
        if (last4 && last4.length === 4 && notes.includes(last4)) {
          if (c.card_name.toLowerCase().includes('phonepe') && !notes.includes('phonepe')) return false;
          return true;
        }
        return false;
      });
    }

    if (matchedCard && cardBillsMap.has(matchedCard.id)) {
      cardBillsMap.get(matchedCard.id)!.push(bill);
    }
  });

  const enrichedCreditCards = creditCards.map(c => {
    const limit = c.monthly_waiver_limit || 20000;
    const matchingLogs = cardBillsMap.get(c.id) || [];
    matchingLogs.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

    const totalSpend = matchingLogs.reduce((sum, f) => sum + (f.cost || 0), 0);
    const surchargeSaved = Math.round(totalSpend * 0.01);
    const used = totalSpend; // Strict calendar month spend, resets to 0 on 1st of month
    const avail = Math.max(0, limit - used);
    const pct = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;

    return {
      ...c,
      monthly_waiver_limit: limit,
      current_month_waiver_used: used,
      surcharge_saved: surchargeSaved,
      available: avail,
      pct,
      bills_count: matchingLogs.length,
      matching_logs: matchingLogs.slice(0, 3)
    };
  });

  const totalMonthlyLimit = enrichedCreditCards.reduce((acc, c) => acc + c.monthly_waiver_limit, 0);
  const totalMonthlyUsed = enrichedCreditCards.reduce((acc, c) => acc + c.current_month_waiver_used, 0);
  const totalSurchargeSaved = enrichedCreditCards.reduce((acc, c) => acc + c.surcharge_saved, 0);
  const totalAvailableQuota = Math.max(0, totalMonthlyLimit - totalMonthlyUsed);

  return (
    <div className="space-y-6">
      {/* Hidden Inputs for Fuel Receipt Scan */}
      <input type="file" accept="image/*" capture="environment" ref={fuelCameraRef} onChange={handleScanFuelBill} className="hidden" />
      <input type="file" accept="image/*,application/pdf" ref={fuelFileRef} onChange={handleScanFuelBill} className="hidden" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Fuel className="w-7 h-7 text-orange-400" /> Fleet Fuel Consumption &amp; Expense Tracker
          </h1>
          <p className="text-sm text-slate-400">Track diesel fill-ups, fuel efficiency, and instant cashbook debit integration</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fuelCameraRef.current?.click()}
            disabled={isScanning}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition text-xs sm:text-sm cursor-pointer"
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            {isScanning ? scanStatus || 'Scanning...' : '📷 Scan Diesel Bill'}
          </button>
          <button onClick={() => setModalOpen(true)} className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-orange-900/30 transition text-xs sm:text-sm">
            <Plus className="w-4 h-4" /> Record Fuel Fill-Up
          </button>
        </div>
      </div>

      {notif && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl flex items-center gap-2 font-medium text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> {notif}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Fuel className="w-4 h-4" /> Diesel Fill-Ups &amp; Logs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('waiver')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'waiver'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4 text-amber-400" /> Waiver Limit
        </button>
      </div>

      {activeTab === 'logs' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 border-2 border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 block font-semibold">TOTAL DIESEL EXPENDITURE</span>
              <span className="text-2xl font-extrabold text-orange-400">₹{totalSpent.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-4 bg-slate-900 border-2 border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 block font-semibold">TOTAL VOLUME DISPENSED</span>
              <span className="text-2xl font-extrabold text-emerald-400">{totalLiters.toLocaleString('en-IN')} Liters</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border-2 border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Vehicle #</th>
                    <th className="p-3.5">Volume (L)</th>
                    <th className="p-3.5">Total Cost</th>
                    <th className="p-3.5">Odometer</th>
                    <th className="p-3.5">Payment Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {fuelLogs.map(f => (
                    <tr key={f.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono text-xs text-slate-400">{f.date}</td>
                      <td className="p-3.5 font-bold text-white">{f.vehicle_number}</td>
                      <td className="p-3.5 text-emerald-400 font-bold">{f.liters} L</td>
                      <td className="p-3.5 text-orange-400 font-bold">₹{f.cost.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 text-slate-300 font-mono">{f.odometer} KM</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded-full">{f.payment_method}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Surcharge Waiver Limit Tracking View */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900/50 to-slate-900 p-5 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" /> Monthly Fuel Surcharge Waiver Limit Tracking
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Monitor monthly surcharge waiver utilization across cards to avoid bank surcharge fees on diesel refills.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> {creditCards.length} Corporate Cards Configured
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 border-2 border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 block font-semibold uppercase">TOTAL MONTHLY WAIVER LIMIT</span>
              <span className="text-2xl font-black text-white">
                ₹{totalMonthlyLimit.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Combined monthly quota across cards</span>
            </div>
            <div className="p-4 bg-slate-900 border-2 border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 block font-semibold uppercase">MONTHLY SPEND UTILIZED</span>
              <span className="text-2xl font-black text-amber-400">
                ₹{totalMonthlyUsed.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Diesel bills on cards this month</span>
            </div>
            <div className="p-4 bg-slate-900 border-2 border-slate-800 rounded-2xl">
              <span className="text-xs text-emerald-400 block font-semibold uppercase">SURCHARGE WAIVED / SAVED</span>
              <span className="text-2xl font-black text-emerald-400">
                ₹{totalSurchargeSaved.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">1% bank surcharge fee savings</span>
            </div>
            <div className="p-4 bg-slate-900 border-2 border-slate-800 rounded-2xl">
              <span className="text-xs text-cyan-400 block font-semibold uppercase">AVAILABLE WAIVER QUOTA</span>
              <span className="text-2xl font-black text-cyan-400">
                ₹{totalAvailableQuota.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Remaining fee-free headroom</span>
            </div>
          </div>

          {/* Cards Utilization Breakdown */}
          <div className="bg-slate-900/80 border-2 border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" /> Per-Card Waiver Limit Utilization
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrichedCreditCards.map(c => {
                const limit = c.monthly_waiver_limit;
                const used = c.current_month_waiver_used;
                const avail = c.available;
                const pct = c.pct;
                const isNear = pct >= 80;
                const isMax = pct >= 100;
                const badgeColor = isMax ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : isNear ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                const badgeText = isMax ? 'Limit Reached' : isNear ? 'Near Limit' : 'Available';

                return (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-sm text-white block">{c.card_name}</span>
                        <span className="text-[11px] text-slate-400">{c.bank_name} •• {c.card_number_last4}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${badgeColor}`}>
                        {badgeText}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Monthly Utilized ({c.bills_count} {c.bills_count === 1 ? 'bill' : 'bills'})</span>
                        <span className="font-semibold text-white">{pct.toFixed(0)}% (₹{used.toLocaleString('en-IN')})</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${isMax ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Available Waiver</span>
                        <span className={`font-bold ${isMax ? 'text-rose-400' : 'text-emerald-400'}`}>
                          ₹{avail.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Surcharge Saved</span>
                        <span className="font-bold text-amber-400 font-mono">
                          ₹{c.surcharge_saved.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {c.matching_logs && c.matching_logs.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Recent Fuel Bills on Card:</span>
                        {c.matching_logs.map(log => (
                          <div key={log.id} className="flex justify-between items-center text-[11px] bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800/40">
                            <span className="text-slate-300 truncate max-w-[130px]">{log.date?.slice(5, 10)} • {log.vehicle_number}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-emerald-400">+₹{Math.round(log.cost * 0.01)}</span>
                              <span className="font-bold text-amber-400 font-mono">₹{log.cost.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RECORD FUEL MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Fuel className="w-5 h-5 text-orange-400" /> Record Diesel Fill-Up Expense
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Registration #</label>
                <input type="text" value={form.vehicle_number} onChange={e => setForm({ ...form, vehicle_number: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Diesel Liters</label>
                  <input type="number" value={form.liters} onChange={e => setForm({ ...form, liters: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Cost (₹)</label>
                  <input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Odometer Reading (KM)</label>
                  <input type="number" value={form.odometer} onChange={e => setForm({ ...form, odometer: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                  <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value as any })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white">
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              {form.payment_method === 'Credit Card' && (
                <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/30 space-y-1.5">
                  <label className="block text-xs font-bold text-amber-300">
                    Select Credit Card (Fuel Surcharge Waiver Tracked)
                  </label>
                  <select
                    value={form.credit_card_id}
                    onChange={e => setForm({ ...form, credit_card_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-white font-medium text-xs sm:text-sm"
                    required
                  >
                    <option value="">-- Choose Corporate Credit Card --</option>
                    {creditCards.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.card_name} ({c.bank_name} •• {c.card_number_last4})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-amber-400/80">
                    1% surcharge waiver limit will be automatically tracked for this card!
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fill-Up Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/30">
                  Save &amp; Debit Cashbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
