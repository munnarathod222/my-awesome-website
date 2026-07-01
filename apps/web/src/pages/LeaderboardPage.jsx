import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Fuel, TrendingUp, Star, Crown, Award, ChevronDown, Calendar, RefreshCw, Users, Zap, Target, BadgeCheck } from 'lucide-react';
import { format, subMonths, getMonth, getYear } from 'date-fns';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = '/api/leaderboard';
const PRIZE_AMOUNT = '₹10,000';
const BASE_TRIPS = 15;
const BASE_PAY = 35000;
const EXTRA_BONUS = 1000;

const RANK_STYLES = [
  {
    border: 'border-yellow-400/60',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.25)]',
    badge: 'bg-gradient-to-br from-yellow-300 to-amber-500',
    ring: 'ring-2 ring-yellow-400/70',
    accent: 'text-yellow-300',
    bg: 'from-yellow-500/10 via-amber-500/5 to-transparent',
    label: 'bg-gradient-to-r from-yellow-400 to-amber-400 text-slate-900',
    rankText: '#FFD700',
  },
  {
    border: 'border-slate-400/50',
    glow: 'shadow-[0_0_20px_rgba(148,163,184,0.15)]',
    badge: 'bg-gradient-to-br from-slate-300 to-slate-500',
    ring: 'ring-2 ring-slate-400/40',
    accent: 'text-slate-300',
    bg: 'from-slate-500/10 via-slate-400/5 to-transparent',
    label: 'bg-gradient-to-r from-slate-300 to-slate-500 text-slate-900',
    rankText: '#94a3b8',
  },
  {
    border: 'border-amber-700/50',
    glow: 'shadow-[0_0_20px_rgba(180,83,9,0.15)]',
    badge: 'bg-gradient-to-br from-amber-600 to-amber-800',
    ring: 'ring-2 ring-amber-700/40',
    accent: 'text-amber-600',
    bg: 'from-amber-800/10 via-amber-700/5 to-transparent',
    label: 'bg-gradient-to-r from-amber-600 to-amber-800 text-white',
    rankText: '#b45309',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function KmplGauge({ value, max = 8 }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct > 70 ? '#22c55e' : pct > 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="26" fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle
          cx="32" cy="32" r="26" fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 163.36} 163.36`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-[11px] font-black leading-none" style={{ color }}>{value.toFixed(1)}</span>
        <span className="text-[7px] text-slate-500 font-medium leading-none mt-0.5">KMPL</span>
      </div>
    </div>
  );
}

function DriverCard({ rank, driver, style, animate = false }) {
  const isWinner = rank === 1;
  const delay = `${(rank - 1) * 120}ms`;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border ${style.border} ${style.glow}
        bg-gradient-to-b ${style.bg} backdrop-blur-sm
        transition-all duration-500 hover:scale-[1.02] hover:translate-y-[-2px]
        ${animate ? 'opacity-0 translate-y-4 animate-fade-in-up' : ''}
      `}
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}
    >
      {/* Winner glow pulse */}
      {isWinner && (
        <div className="absolute inset-0 rounded-2xl bg-yellow-400/5 animate-pulse pointer-events-none" />
      )}

      {/* Rank badge */}
      <div className={`absolute top-3 right-3 w-8 h-8 rounded-full ${style.badge} flex items-center justify-center shadow-lg`}>
        {isWinner
          ? <Crown className="w-4 h-4 text-slate-900" />
          : <span className="text-xs font-black text-white">#{rank}</span>
        }
      </div>

      <div className="p-5">
        {/* Profile row */}
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <div className={`relative shrink-0 ${style.ring} rounded-full`}>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
              <span className="text-xl font-black text-white/90">
                {(driver.driver_name || 'D').charAt(0).toUpperCase()}
              </span>
            </div>
            {isWinner && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-slate-900">
                <Trophy className="w-2.5 h-2.5 text-slate-900" />
              </div>
            )}
          </div>

          {/* Name + stats */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white text-sm truncate">{driver.driver_name}</h3>
              {isWinner && (
                <span className={`shrink-0 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${style.label}`}>
                  WINNER
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Target className="w-3 h-3" />
              <span>{driver.total_trips} trips completed</span>
            </div>
            {isWinner && (
              <div className="mt-1.5 flex items-center gap-1 text-xs font-bold text-yellow-400">
                <Zap className="w-3 h-3" />
                <span>Wins {PRIZE_AMOUNT} Cash Bonus!</span>
              </div>
            )}
          </div>
        </div>

        {/* KMPL Gauge */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">Fuel Efficiency</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black ${style.accent}`}>{(driver.avg_kmpl || 0).toFixed(2)}</span>
              <span className="text-xs text-slate-400">KM/L</span>
            </div>
          </div>
          <KmplGauge value={driver.avg_kmpl || 0} />
        </div>

        {/* Payroll preview */}
        <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Base Pay', val: `₹${BASE_PAY.toLocaleString('en-IN')}` },
            {
              label: 'Extra Trips',
              val: driver.total_trips > BASE_TRIPS
                ? `+₹${((driver.total_trips - BASE_TRIPS) * EXTRA_BONUS).toLocaleString('en-IN')}`
                : '—'
            },
            {
              label: 'Prize',
              val: isWinner ? PRIZE_AMOUNT : '—',
              highlight: isWinner
            },
          ].map((item) => (
            <div key={item.label} className="bg-white/5 rounded-lg p-1.5">
              <p className="text-[8px] text-slate-500 uppercase tracking-wider leading-tight">{item.label}</p>
              <p className={`text-[11px] font-bold mt-0.5 ${item.highlight ? 'text-yellow-400' : 'text-slate-200'}`}>
                {item.val}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthSelector({ value, onChange }) {
  const options = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(new Date(), i);
    return { label: format(d, 'MMMM yyyy'), month: getMonth(d) + 1, year: getYear(d) };
  });

  return (
    <div className="relative">
      <select
        value={`${value.month}-${value.year}`}
        onChange={e => {
          const [m, y] = e.target.value.split('-').map(Number);
          onChange({ month: m, year: y });
        }}
        className="appearance-none bg-slate-800/80 border border-white/10 text-slate-200 text-sm rounded-xl pl-4 pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
      >
        {options.map(o => (
          <option key={`${o.month}-${o.year}`} value={`${o.month}-${o.year}`}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
}

function PayrollFormulaPanel({ winner }) {
  if (!winner) return null;
  const extra = Math.max(0, winner.total_trips - BASE_TRIPS);
  const basePay = winner.total_trips >= BASE_TRIPS ? BASE_PAY : 0;
  const extraPay = extra * EXTRA_BONUS;
  const prize = 10000;
  const gross = basePay + extraPay + prize;

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Winner Payroll Breakdown</h3>
          <p className="text-xs text-slate-400">{winner.driver_name}</p>
        </div>
      </div>

      <div className="space-y-2.5 text-sm font-mono">
        {[
          { label: 'Base Pay (15+ trips)', val: basePay, prefix: '₹', color: 'text-slate-200' },
          { label: `Extra Trips (${extra} × ₹1,000)`, val: extraPay, prefix: '+₹', color: 'text-blue-400' },
          { label: 'Fuel Champion Prize', val: prize, prefix: '+₹', color: 'text-yellow-400' },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400 text-xs">{row.label}</span>
            <span className={`font-bold ${row.color}`}>{row.prefix}{row.val.toLocaleString('en-IN')}</span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Gross Monthly Payout</span>
          <span className="text-lg font-black text-emerald-400">₹{gross.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="mt-3 bg-slate-900/40 rounded-xl p-2.5 border border-white/5">
        <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
          {`{ base_pay: ${basePay}, extra_trips_pay: ${extraPay}, efficiency_grand_prize: ${prize}, gross_monthly_payout: ${gross} }`}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const now = new Date();
  const [period, setPeriod] = useState({ month: getMonth(now) + 1, year: getYear(now) });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeMsg, setFinalizeMsg] = useState(null);
  const [animate, setAnimate] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnimate(false);
    try {
      const res = await fetch(`${API_BASE}?month=${period.month}&year=${period.year}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      setData(json);
      setTimeout(() => setAnimate(true), 50);
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const handleFinalize = async () => {
    if (!window.confirm(`Lock and finalize the ${format(new Date(period.year, period.month - 1), 'MMMM yyyy')} leaderboard? This will:\n• Award ₹10,000 bonus to the winner\n• Inject payroll record\n• Grant Fuel Champion Badge\n\nThis cannot be undone.`)) return;
    setFinalizing(true);
    setFinalizeMsg(null);
    try {
      const res = await fetch(`${API_BASE}/finalize`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: period.month, year: period.year }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Finalization failed');
      setFinalizeMsg({ type: 'success', text: `✅ Finalized! Winner: ${json.winner?.name} | Badge: ${json.winner?.badge_id}` });
      await fetchLeaderboard();
    } catch (err) {
      setFinalizeMsg({ type: 'error', text: `❌ ${err.message}` });
    } finally {
      setFinalizing(false);
    }
  };

  const winner = data?.top3?.[0];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-4 md:p-6">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border border-white/10 shadow-2xl mb-6 p-6 md:p-8">
        {/* Decorative glows */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium">Jai Bhavani Cargo</p>
                <h1 className="text-lg md:text-2xl font-black text-white leading-tight">DRIVER LEADERBOARD</h1>
              </div>
            </div>

            {/* Prize banner */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-400/30 rounded-xl px-4 py-2 mt-2">
              <Fuel className="w-4 h-4 text-yellow-400 shrink-0" />
              <p className="text-xs md:text-sm font-bold text-yellow-300 tracking-wide">
                EFFICIENCY LEADER: {PRIZE_AMOUNT} CASH BONUS
              </p>
            </div>

            <p className="text-xs text-slate-400 mt-2 max-w-sm">
              Ranked purely by monthly average fuel economy (KM/L). Minimum {BASE_TRIPS} trips required to qualify.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center min-w-[80px]">
              <p className="text-2xl font-black text-yellow-400">{PRIZE_AMOUNT}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">1st Prize</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center min-w-[80px]">
              <p className="text-2xl font-black text-blue-400">{data?.total_eligible ?? '—'}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">Eligible</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center min-w-[80px]">
              <p className="text-2xl font-black text-emerald-400">{data?.total_drivers ?? '—'}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">Total</p>
            </div>
          </div>
        </div>

        {/* Finalized badge */}
        {data?.is_finalized && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Locked</span>
          </div>
        )}
      </div>

      {/* ── Controls ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-slate-400" />
          <MonthSelector value={period} onChange={p => { setPeriod(p); }} />
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="p-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {data && !data.is_finalized && (
          <button
            onClick={handleFinalize}
            disabled={finalizing}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-900 font-bold text-xs rounded-xl transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-60"
          >
            {finalizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
            {finalizing ? 'Finalizing...' : 'Lock & Finalize Month'}
          </button>
        )}
      </div>

      {/* Finalize message */}
      {finalizeMsg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium border ${finalizeMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
          {finalizeMsg.text}
        </div>
      )}

      {/* ── Content ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-2xl shimmer" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <Fuel className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Failed to Load Leaderboard</h2>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button onClick={fetchLeaderboard} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors">
            Try Again
          </button>
        </div>
      ) : !data?.top3?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">No Eligible Drivers Yet</h2>
          <p className="text-slate-400 text-sm max-w-xs">
            Drivers need to complete at least {BASE_TRIPS} trips this month to qualify for the leaderboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Top 3 cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Top {data.top3.length} Drivers — {format(new Date(period.year, period.month - 1), 'MMMM yyyy')}
              </h2>
              {data.source === 'live' && (
                <span className="ml-auto text-[9px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                  Live
                </span>
              )}
              {data.source === 'snapshot' && (
                <span className="ml-auto text-[9px] uppercase tracking-widest font-bold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full">
                  Archived
                </span>
              )}
            </div>

            {data.top3.map((driver, idx) => (
              <DriverCard
                key={driver.driver_name}
                rank={idx + 1}
                driver={driver}
                style={RANK_STYLES[idx] || RANK_STYLES[2]}
                animate={animate}
              />
            ))}
          </div>

          {/* Right — Formula + Info */}
          <div className="space-y-4">
            {/* Winner payroll breakdown */}
            <PayrollFormulaPanel winner={winner} />

            {/* Eligibility rules */}
            <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-indigo-400" /> Eligibility Rules
              </h3>
              <ul className="space-y-2.5">
                {[
                  { icon: '✅', text: `Minimum ${BASE_TRIPS} trips completed this month` },
                  { icon: '📊', text: 'Ranked purely by average KM per Litre' },
                  { icon: '🏆', text: `#1 highest KMPL wins ${PRIZE_AMOUNT} bonus` },
                  { icon: '🏅', text: 'Fuel Champion Badge awarded permanently' },
                  { icon: '💰', text: `Base: ₹${BASE_PAY.toLocaleString('en-IN')} + ₹${EXTRA_BONUS.toLocaleString('en-IN')}/extra trip` },
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-400">
                    <span className="shrink-0 mt-0.5">{rule.icon}</span>
                    <span>{rule.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payroll formula */}
            <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Payroll Formula
              </h3>
              <div className="font-mono text-[10px] text-slate-400 space-y-1.5 leading-relaxed">
                <p className="text-slate-500">// per driver per month</p>
                <p><span className="text-blue-400">base_pay</span> = trips ≥ {BASE_TRIPS} ? <span className="text-emerald-400">₹{BASE_PAY.toLocaleString('en-IN')}</span> : 0</p>
                <p><span className="text-blue-400">extra_pay</span> = (trips − {BASE_TRIPS}) × <span className="text-yellow-400">₹{EXTRA_BONUS}</span></p>
                <p><span className="text-blue-400">prize</span> = winner ? <span className="text-yellow-400">₹10,000</span> : 0</p>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <p className="text-white font-bold">gross = base + extra + prize</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
