import React, { useState, useEffect } from 'react';
import { Wallet, Edit, ArrowUpRight, ArrowDownRight, Plus, CheckCircle, X, Camera } from 'lucide-react';
import { cashbookService } from '../services/cashbookService';
import { dbtabeses } from '../db/store';
import { CashbookTransaction } from '../types';
import { CaptureExpenseModal } from '../components/expenses/CaptureExpenseModal';

export const LiveCashbookPage: React.FC = () => {
  const [summary, setSummary] = useState(cashbookService.getSummary());
  const [txns, setTxns] = useState<CashbookTransaction[]>(dbtabeses.getCashbook());
  const [modalOpen, setModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [newOpeningInput, setNewOpeningInput] = useState(summary.openingBalance.toString());
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Income' | 'Expense'>('All');
  const [notif, setNotif] = useState('');

  // Expense form state
  const [expCategory, setExpCategory] = useState<'Fuel' | 'Maintenance' | 'Payroll' | 'Toll' | 'Driver Allowance' | 'Driver Advance' | 'Credit Card Settlement' | 'Other'>('Maintenance');
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState(0);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expAccount, setExpAccount] = useState<'Cash' | 'Bank' | 'UPI' | 'Credit Card'>('Cash');

  // Income form state
  const [incCategory, setIncCategory] = useState<'Trip Payment' | 'Other'>('Trip Payment');
  const [incDescription, setIncDescription] = useState('');
  const [incAmount, setIncAmount] = useState(0);
  const [incDate, setIncDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    cashbookService.syncAllPaidTrips();
    setSummary(cashbookService.getSummary());
    setTxns(dbtabeses.getCashbook());

    const handle = () => {
      setSummary(cashbookService.getSummary());
      setTxns(dbtabeses.getCashbook());
    };
    window.addEventListener('jc-store-update', handle);
    return () => window.removeEventListener('jc-store-update', handle);
  }, []);

  const handleSaveOpening = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newOpeningInput) || 0;
    cashbookService.setOpeningBalance(val);
    setModalOpen(false);
    setNotif('Opening balance updated!');
    setTimeout(() => setNotif(''), 3000);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || expAmount <= 0) return;

    const currentTxns = dbtabeses.getCashbook();
    const newTxn: CashbookTransaction = {
      id: 'txn-exp-' + Date.now(),
      date: expDate,
      type: 'EXPENSE',
      category: expCategory,
      amount: Number(expAmount),
      account: expAccount,
      description: expDescription || `${expCategory} Outflow`,
      created_at: new Date().toISOString()
    };

    dbtabeses.setCashbook([newTxn, ...currentTxns]);
    setExpenseModalOpen(false);
    setExpDescription('');
    setExpAmount(0);
    setNotif(`Expense of ₹${Number(expAmount).toLocaleString('en-IN')} saved to ledger!`);
    setTimeout(() => setNotif(''), 3500);
  };

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incAmount || incAmount <= 0) return;

    const currentTxns = dbtabeses.getCashbook();
    const newTxn: CashbookTransaction = {
      id: 'txn-inc-' + Date.now(),
      date: incDate,
      type: 'INCOME',
      category: incCategory,
      amount: Number(incAmount),
      account: 'Bank',
      description: incDescription || `${incCategory} Inflow`,
      created_at: new Date().toISOString()
    };

    dbtabeses.setCashbook([newTxn, ...currentTxns]);
    setIncomeModalOpen(false);
    setIncDescription('');
    setIncAmount(0);
    setNotif(`Income entry of ₹${Number(incAmount).toLocaleString('en-IN')} recorded!`);
    setTimeout(() => setNotif(''), 3500);
  };

  const filteredTxns = categoryFilter === 'All' ? txns : txns.filter(t => (categoryFilter === 'Income' ? ((t.type as string) === 'INCOME' || (t.type as string) === 'Income') : ((t.type as string) === 'EXPENSE' || (t.type as string) === 'Expense')));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Wallet className="w-7 h-7 text-emerald-400" /> Live Cashbook Ledger
          </h1>
          <p className="text-sm text-slate-400">Real-time running balance with permanent expense logging &amp; debit integration</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsCaptureOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold rounded-xl flex items-center gap-2 shadow-lg shadow-orange-950/40 transition text-sm cursor-pointer"
          >
            <Camera className="w-4 h-4" /> 📷 AI Scan Bill
          </button>
          <button
            onClick={() => setExpenseModalOpen(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-red-900/30 transition text-sm"
          >
            <Plus className="w-4 h-4" /> Record Expense Log
          </button>
          <button
            onClick={() => setIncomeModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition text-sm"
          >
            <Plus className="w-4 h-4" /> Record Income
          </button>
          <button
            onClick={() => { setNewOpeningInput(summary.openingBalance.toString()); setModalOpen(true); }}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition text-sm"
          >
            <Edit className="w-4 h-4 text-orange-400" /> Set Opening Balance
          </button>
        </div>
      </div>

      {notif && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl flex items-center gap-2 font-medium text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> {notif}
        </div>
      )}

      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 border-2 border-slate-800 rounded-2xl space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Cashbook Balance Formula</p>
        <div className="flex flex-wrap items-center gap-4 text-lg font-bold">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
            <span className="text-xs font-normal text-slate-400 block">Opening Balance</span>
            <span className="text-white">₹{summary.openingBalance.toLocaleString('in-IN')}</span>
          </div>
          <span className="text-slate-500">+</span>
          <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl">
            <span className="text-xs font-normal text-emerald-400 block">Total Income</span>
            <span className="text-emerald-400">₹{summary.totalIncome.toLocaleString('in-IN')}</span>
          </div>
          <span className="text-slate-500">-</span>
          <div className="p-3 bg-red-950/30 border border-red-800/50 rounded-xl">
            <span className="text-xs font-normal text-red-400 block">Total Outflow</span>
            <span className="text-red-400">₹{summary.totalOutflow.toLocaleString('in-IN')}</span>
          </div>
          <span className="text-slate-500">=</span>
          <div className="p-3 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-xl">
            <span className="text-xs font-normal text-emerald-400 block">CURRENT CASHBOOK BALANCE</span>
            <span className="text-2xl text-emerald-400 font-extrabold">₹{summary.currentBalance.toLocaleString('in-IN')}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 border-2 border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCategoryFilter('All')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${categoryFilter === 'All' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              All Transactions ({txns.length})
            </button>
            <button
              onClick={() => setCategoryFilter('Income')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${categoryFilter === 'Income' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Income Only
            </button>
            <button
              onClick={() => setCategoryFilter('Expense')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${categoryFilter === 'Expense' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Expenses Only
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Category &amp; Description</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTxns.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-xs text-slate-400">{t.date}</td>
                  <td className="p-3.5">
                    <p className="font-bold text-white">{t.category}</p>
                    <p className="text-xs text-slate-400">{t.description}</p>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 w-fit ${((t.type as string) === 'INCOME' || (t.type as string) === 'Income') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {((t.type as string) === 'INCOME' || (t.type as string) === 'Income') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {t.type}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-xs text-slate-300">{t.account || 'Cash'}</td>
                  <td className={`p-3.5 font-bold ${((t.type as string) === 'INCOME' || (t.type as string) === 'Income') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {((t.type as string) === 'INCOME' || (t.type as string) === 'Income') ? '+' : '-'}₹{t.amount.toLocaleString('in-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD EXPENSE MODAL */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-red-400" /> Record Expense Transaction
              </h3>
              <button onClick={() => setExpenseModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Category</label>
                <select value={expCategory} onChange={e => setExpCategory(e.target.value as any)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white">
                  <option value="Maintenance">Maintenance &amp; Repairs</option>
                  <option value="Fuel">Fuel / Diesel Expense</option>
                  <option value="Payroll">Driver Bata / Salary</option>
                  <option value="Driver Advance">Driver Cash Advance</option>
                  <option value="Toll">Toll Expense</option>
                  <option value="Credit Card Settlement">Credit Card Settlement</option>
                  <option value="Other">Office / Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Description / Notes</label>
                <input type="text" placeholder="e.g. Engine oil change for TG12U2637" value={expDescription} onChange={e => setExpDescription(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Amount (₹)</label>
                  <input type="number" value={expAmount || ''} onChange={e => setExpAmount(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                  <select value={expAccount} onChange={e => setExpAccount(e.target.value as any)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white">
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="UPI">UPI Payment</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Transaction Date</label>
                <input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setExpenseModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/30">
                  Save Expense Outflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD INCOME MODAL */}
      {incomeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-400" /> Record Income Entry
              </h3>
              <button onClick={() => setIncomeModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddIncome} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Income Description / Source</label>
                <input type="text" placeholder="e.g. Amazon Trip TRIP-201 Payment Received" value={incDescription} onChange={e => setIncDescription(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Income Amount (₹)</label>
                  <input type="number" value={incAmount || ''} onChange={e => setIncAmount(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date Received</label>
                  <input type="date" value={incDate} onChange={e => setIncDate(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIncomeModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30">
                  Save Income Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST OPENING BALANCE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Adjust Live Opening Balance</h3>
            <form onSubmit={handleSaveOpening} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Opening Cash Balance (₹)</label>
                <input type="number" value={newOpeningInput} onChange={e => setNewOpeningInput(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl">Update Opening Balance</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI EXPENSE SCAN MODAL */}
      {isCaptureOpen && (
        <CaptureExpenseModal
          isOpen={isCaptureOpen}
          initialMode="camera"
          onClose={() => setIsCaptureOpen(false)}
          onSuccess={(saved) => {
            setIsCaptureOpen(false);
            setNotif(`Expense ${saved.expense_number} (₹${Number(saved.amount).toLocaleString('en-IN')}) saved & debited to Cashbook!`);
            setTimeout(() => setNotif(''), 4000);
          }}
        />
      )}
    </div>
  );
};