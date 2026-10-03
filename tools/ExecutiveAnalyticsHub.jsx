import React, { useState, useMemo } from 'react';

export default function ExecutiveAnalyticsHub() {
  const [selectedRange, setSelectedRange] = useState('30D'); // '7D' | '30D' | '3M' | '6M' | '1Y' | 'Custom'
  const [startDate, setStartDate] = useState('2024-03-01');
  const [endDate, setEndDate] = useState('2024-03-31');
  const [viewType, setViewType] = useState('Monthly View');
  const [selectedClient, setSelectedClient] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTooltipDay, setActiveTooltipDay] = useState(18); // Default peak Mar 18 tooltip

  // Client profiles for filter
  const clientsList = [
    { id: 'all', name: 'All Clients (Fleet Wide)' },
    { id: 'cli_ultratech', name: 'UltraTech Cement Ltd' },
    { id: 'cli_amazon', name: 'Amazon India Fulfillment' },
    { id: 'cli_reliance', name: 'Reliance Logistics & Retail' },
    { id: 'cli_tata', name: 'Tata Steel Tubes Division' },
    { id: 'cli_spot', name: 'Ad-hoc Spot Market Loads' }
  ];

  // Daily trip volumes for March (31 days)
  const tripVolumeData = [
    12, 18, 14, 22, 28, 19, 15, 24, 31, 26,
    18, 29, 35, 27, 21, 33, 38, 42, 34, 28,
    22, 19, 27, 31, 25, 18, 23, 29, 32, 20, 16
  ];

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300 pb-12 font-sans text-slate-100">
      {/* ─────────────────────────────────────────────────────────────
          1. EXECUTIVE HEADER
      ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span>Analytics Hub</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Fleet Command
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Financial and operational performance overview for your logistics business.
          </p>
        </div>

        {/* Header Right Actions: Search, Notifications, Profile, Export */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Global Search Bar */}
          <div className="relative min-w-[260px] sm:min-w-[300px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trips, drivers, vehicles..."
              className="w-full pl-9 pr-14 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition shadow-inner"
            />
            <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
                ⌘K
              </kbd>
            </span>
          </div>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => alert('3 Active Fleet Alerts: 1 vehicle maintenance due, 1 license renewal, 1 fuel telematics anomaly.')}
            className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
          >
            <span>🔔</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center shadow-xs">
              3
            </span>
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2.5 pl-1 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              JB
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight">John B.</div>
              <div className="text-[10px] text-slate-400 leading-tight">Fleet Manager</div>
            </div>
          </div>

          {/* Export Report Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                const text = 'Logistics Executive Report generated for March 2024. Revenue: Rs. 2,229,400 | Net Profit: Rs. 166,870.44 | Trips: 314';
                navigator.clipboard.writeText(text);
                alert('Executive Analytics Summary copied to clipboard & downloaded!');
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer"
            >
              <span>📥</span>
              <span>Export Report</span>
              <span className="text-[10px] opacity-70">▼</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTER & TIME-RANGE CONTROL BAR
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 px-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Start Date */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-500">START</span>
            <span className="text-slate-400">📅</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-hidden cursor-pointer"
            />
          </div>

          <span className="text-slate-600 font-bold">➔</span>

          {/* End Date */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-500">END</span>
            <span className="text-slate-400">📅</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-hidden cursor-pointer"
            />
          </div>

          {/* View Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-500">VIEW</span>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="Daily View" className="bg-slate-900">Daily View</option>
              <option value="Weekly View" className="bg-slate-900">Weekly View</option>
              <option value="Monthly View" className="bg-slate-900">Monthly View</option>
              <option value="Quarterly View" className="bg-slate-900">Quarterly View</option>
            </select>
          </div>

          {/* Client Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-emerald-400">CLIENT</span>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs focus:outline-hidden cursor-pointer max-w-[180px] truncate"
            >
              {clientsList.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Range Pills + Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Range Buttons */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            {['7D', '30D', '3M', '6M', '1Y', 'Custom'].map(pill => (
              <button
                key={pill}
                type="button"
                onClick={() => setSelectedRange(pill)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedRange === pill
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedRange('30D');
              setStartDate('2024-03-01');
              setEndDate('2024-03-31');
              setSelectedClient('all');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>🔄</span> Reset
          </button>

          {/* Apply Filters */}
          <button
            type="button"
            onClick={() => {
              alert(`Filters Applied: Range ${selectedRange} (${startDate} to ${endDate}) for Client: ${clientsList.find(c => c.id === selectedClient)?.name}`);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <span>⚡</span> Apply Filters
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. TOP 8 METRIC / KPI CARDS (2 ROWS × 4 COLUMNS)
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: TOTAL REVENUE */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-emerald-500/30 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-sm font-black">
                ₹
              </div>
              <span className="text-xs font-bold text-slate-400">Total Revenue</span>
            </div>
            <span className="text-slate-600 hover:text-slate-400 cursor-pointer text-xs">···</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">₹2,229,400</div>
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <span>↗ +18.4%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            {/* Glowing Emerald Sparkline SVG */}
            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path
                  d="M0,28 Q15,35 30,22 T60,18 T85,8 T100,5"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="5" r="3" fill="#10b981" />
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 2: TOTAL EXPENSES */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-rose-500/30 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center text-sm font-black">
                💳
              </div>
              <span className="text-xs font-bold text-slate-400">Total Expenses</span>
            </div>
            <span className="text-slate-600 hover:text-slate-400 cursor-pointer text-xs">···</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">₹2,062,529.56</div>
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <span>↘ -6.2%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            {/* Crimson Sparkline SVG */}
            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path
                  d="M0,15 Q20,10 40,25 T70,18 T90,30 T100,28"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="28" r="3" fill="#f43f5e" />
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 3: NET PROFIT */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-cyan-500/30 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-sm font-black">
                📊
              </div>
              <span className="text-xs font-bold text-slate-400">Net Profit</span>
            </div>
            <span className="text-slate-600 hover:text-slate-400 cursor-pointer text-xs">···</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">₹166,870.44</div>
              <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1 mt-1">
                <span>↗ +42.7%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            {/* Cyan Sparkline SVG */}
            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path
                  d="M0,32 Q25,30 45,22 T75,15 T90,8 T100,4"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="4" r="3" fill="#06b6d4" />
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 4: PROFIT MARGIN */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-purple-500/30 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-sm font-black">
                %
              </div>
              <span className="text-xs font-bold text-slate-400">Profit Margin</span>
            </div>
            <span className="text-slate-600 hover:text-slate-400 cursor-pointer text-xs">···</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">7.5%</div>
              <div className="text-[11px] font-bold text-purple-400 flex items-center gap-1 mt-1">
                <span>↗ +2.1%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            {/* Purple Sparkline SVG */}
            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path
                  d="M0,28 Q30,22 55,20 T80,12 T100,8"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="8" r="3" fill="#a855f7" />
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 5: TOTAL TRIPS */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-blue-500/30 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center text-sm font-black">
                🚛
              </div>
              <span className="text-xs font-bold text-slate-400">Total Trips</span>
            </div>
            <span className="text-slate-600 hover:text-slate-400 cursor-pointer text-xs">···</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">314</div>
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <span>↗ +12.5%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            {/* Blue Sparkline SVG */}
            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path
                  d="M0,30 Q20,32 40,20 T70,16 T90,10 T100,6"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="6" r="3" fill="#3b82f6" />
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 6: TOTAL KMS DRIVEN */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-amber-500/30 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-sm font-black">
                🛣️
              </div>
              <span className="text-xs font-bold text-slate-400">Total KMs Driven</span>
            </div>
            <span className="text-slate-600 hover:text-slate-400 cursor-pointer text-xs">···</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">64,775.355</div>
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <span>↗ +9.8%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            {/* Amber Sparkline SVG */}
            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path
                  d="M0,25 Q25,28 50,18 T80,14 T100,9"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="9" r="3" fill="#f59e0b" />
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 7: FLEET UTILIZATION */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-teal-500/30 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center text-sm font-black">
                ⏱️
              </div>
              <span className="text-xs font-bold text-slate-400">Fleet Utilization</span>
            </div>
            <span className="text-slate-600 hover:text-slate-400 cursor-pointer text-xs">···</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">78%</div>
              <div className="text-[11px] font-bold text-teal-400 flex items-center gap-1 mt-1">
                <span>↗ +6.3%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            {/* Teal Sparkline SVG */}
            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path
                  d="M0,28 Q30,30 55,20 T80,15 T100,10"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="10" r="3" fill="#14b8a6" />
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 8: ACTIVE DRIVERS */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-indigo-500/30 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-sm font-black">
                👥
              </div>
              <span className="text-xs font-bold text-slate-400">Active Drivers</span>
            </div>
            <span className="text-slate-600 hover:text-slate-400 cursor-pointer text-xs">···</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">5</div>
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                <span>→ 0%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            {/* Indigo Sparkline SVG */}
            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path
                  d="M0,20 Q30,18 60,20 T100,20"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="20" r="3" fill="#6366f1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MIDDLE ROW: 4 ADVANCED VISUALIZATION PANELS
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* PANEL 1: REVENUE VS EXPENSES (5 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 text-sm">📈</span>
                <h3 className="font-bold text-white text-sm">Revenue vs Expenses</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  Monthly ⌄
                </span>
                <span className="text-slate-600 hover:text-slate-400 cursor-pointer text-xs">···</span>
              </div>
            </div>

            {/* Sub-Legend */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400" />
                <span className="text-slate-400">Revenue</span>
                <span className="font-bold text-white font-mono">₹2,229,400</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-purple-500 shadow-xs shadow-purple-500" />
                <span className="text-slate-400">Expenses</span>
                <span className="font-bold text-white font-mono">₹2,062,529.56</span>
              </div>
            </div>
          </div>

          {/* Dual Spline Curved SVG Area Chart */}
          <div className="w-full h-56 mt-4 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cyanRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="purpleExpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="400" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="400" y2="120" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="160" x2="400" y2="160" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Revenue Area (Cyan) */}
              <path
                d="M0,130 C60,150 100,90 150,85 C200,80 230,120 280,70 C330,20 370,50 400,30 L400,200 L0,200 Z"
                fill="url(#cyanRevGrad)"
              />
              <path
                d="M0,130 C60,150 100,90 150,85 C200,80 230,120 280,70 C330,20 370,50 400,30"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
              />

              {/* Expenses Area (Purple) */}
              <path
                d="M0,145 C60,160 100,115 150,105 C200,98 230,135 280,95 C330,55 370,75 400,60 L400,200 L0,200 Z"
                fill="url(#purpleExpGrad)"
              />
              <path
                d="M0,145 C60,160 100,115 150,105 C200,98 230,135 280,95 C330,55 370,75 400,60"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
              />

              {/* Key Nodes */}
              <circle cx="150" cy="85" r="4" fill="#06b6d4" />
              <circle cx="280" cy="70" r="4" fill="#06b6d4" />
              <circle cx="400" cy="30" r="4" fill="#06b6d4" />
            </svg>

            {/* X-Axis Dates */}
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
              <span>Mar 1</span>
              <span>Mar 5</span>
              <span>Mar 10</span>
              <span>Mar 15</span>
              <span>Mar 20</span>
              <span>Mar 25</span>
              <span>Mar 31</span>
            </div>
          </div>
        </div>

        {/* PANEL 2: TRIP VOLUME (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 text-sm">📊</span>
                <h3 className="font-bold text-white text-sm">Trip Volume</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  Daily ⌄
                </span>
                <span className="text-slate-600 hover:text-slate-400 cursor-pointer text-xs">···</span>
              </div>
            </div>
          </div>

          {/* Interactive Bar Chart */}
          <div className="w-full h-56 mt-3 relative flex flex-col justify-end">
            {/* Tooltip Overlay for Active Day */}
            <div
              className="absolute z-20 bg-slate-950/95 border border-blue-500/50 rounded-lg px-2.5 py-1 text-center shadow-xl pointer-events-none transition-all duration-200"
              style={{
                left: `${(activeTooltipDay / 31) * 85}%`,
                top: '15%'
              }}
            >
              <div className="text-[10px] text-slate-400 font-mono">Mar {activeTooltipDay}, 2024</div>
              <div className="text-xs font-black text-cyan-400 font-mono">
                {tripVolumeData[activeTooltipDay - 1]} trips
              </div>
            </div>

            {/* Bars Container */}
            <div className="flex items-end justify-between h-44 gap-1 px-1">
              {tripVolumeData.map((val, idx) => {
                const day = idx + 1;
                const isSelected = day === activeTooltipDay;
                const heightPct = Math.round((val / 45) * 100);
                return (
                  <div
                    key={day}
                    onMouseEnter={() => setActiveTooltipDay(day)}
                    className="flex-1 flex flex-col items-center group cursor-pointer h-full justify-end"
                  >
                    <div
                      className={`w-full rounded-t-sm transition-all duration-150 ${
                        isSelected
                          ? 'bg-cyan-400 shadow-md shadow-cyan-500/50 scale-y-105'
                          : 'bg-blue-600 hover:bg-blue-400 opacity-80'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis */}
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-800">
              <span>Mar 1</span>
              <span>Mar 5</span>
              <span>Mar 10</span>
              <span>Mar 15</span>
              <span>Mar 20</span>
              <span>Mar 25</span>
              <span>Mar 31</span>
            </div>
          </div>
        </div>

        {/* PANEL 3: EXPENSE BREAKDOWN (DONUT) (2.5 cols -> lg:col-span-3) */}
        <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 text-sm">🍩</span>
                <h3 className="font-bold text-white text-sm">Expense Breakdown</h3>
              </div>
              <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                This Month ⌄
              </span>
            </div>
          </div>

          {/* Donut Chart with Center Text */}
          <div className="flex flex-col items-center justify-center my-3 relative">
            <div className="w-32 h-32 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Fuel: 42.3% (stroke-dasharray: 42.3 57.7) */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#06b6d4" strokeWidth="16" strokeDasharray="101 138" strokeDashoffset="0" />
                {/* Tolls: 18.6% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#a855f7" strokeWidth="16" strokeDasharray="44 195" strokeDashoffset="-101" />
                {/* Maintenance: 12.1% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="16" strokeDasharray="29 210" strokeDashoffset="-145" />
                {/* Salaries: 11.5% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="16" strokeDasharray="27 212" strokeDashoffset="-174" />
                {/* Insurance: 8.4% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#ec4899" strokeWidth="16" strokeDasharray="20 219" strokeDashoffset="-201" />
                {/* Others: 7.1% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#64748b" strokeWidth="16" strokeDasharray="17 222" strokeDashoffset="-221" />
              </svg>
              {/* Donut Hole Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-black text-white font-mono">₹2.06M</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-tighter">Total Exp</span>
              </div>
            </div>
          </div>

          {/* Categorized Slices Legend */}
          <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Fuel (42.3%)
              </span>
              <span className="font-mono text-white font-bold">₹872,410</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Tolls (18.6%)
              </span>
              <span className="font-mono text-white font-bold">₹383,120</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Maintenance (12.1%)
              </span>
              <span className="font-mono text-white font-bold">₹249,350</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Driver Salary (11.5%)
              </span>
              <span className="font-mono text-white font-bold">₹236,620</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-pink-500" /> Insurance (8.4%)
              </span>
              <span className="font-mono text-slate-400">₹173,860</span>
            </div>
          </div>
        </div>

        {/* PANEL 4: OPERATIONS OVERVIEW (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-teal-400 text-sm">⚙️</span>
              <h3 className="font-bold text-white text-sm">Operations</h3>
            </div>
          </div>

          <div className="space-y-3.5 my-2 text-xs">
            {/* On-Time Delivery */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400">On-Time Delivery</span>
                <span className="font-bold text-emerald-400 font-mono">92%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            {/* Active Routes */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400">Active Routes</span>
                <span className="font-bold text-blue-400 font-mono">12</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            {/* Top Driver */}
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Top Driver</span>
                <span className="font-bold text-white text-xs">Ravi Kumar</span>
              </div>
              <span className="text-amber-400 text-sm">⭐</span>
            </div>

            {/* Avg Distance */}
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Avg Trip Distance</span>
                <span className="font-bold text-cyan-400 font-mono text-xs">206 km</span>
              </div>
              <span className="text-xs text-slate-500">Per Trip</span>
            </div>

            {/* Badges: Top Route, Delays, Healthy */}
            <div className="pt-1 flex flex-col gap-1.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Top Route:</span>
                <span className="font-bold text-white">Delhi ➔ Mumbai 🏆</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Delayed Trips:</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">7 Trips</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Healthy Trucks:</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">4 / 12</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. BOTTOM ROW: 3 PANELS
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* PANEL 5: ROUTE PERFORMANCE TABLE (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 text-sm">📍</span>
              <h3 className="font-bold text-white text-sm">Route Performance</h3>
            </div>
            <button
              type="button"
              onClick={() => alert('Opening full route profitability master list...')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              View All &gt;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">
                <tr>
                  <th className="py-2">#</th>
                  <th className="py-2">Route</th>
                  <th className="py-2 text-right">Trips</th>
                  <th className="py-2 text-right">Dist (km)</th>
                  <th className="py-2 text-right">Revenue</th>
                  <th className="py-2 text-right">Profit Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                <tr>
                  <td className="py-2.5 text-slate-500 font-mono">1</td>
                  <td className="py-2.5 font-bold text-white">Delhi ➔ Mumbai</td>
                  <td className="py-2.5 text-right font-mono text-slate-300">48</td>
                  <td className="py-2.5 text-right font-mono text-slate-400">7,112</td>
                  <td className="py-2.5 text-right font-mono font-bold text-white">₹612,400</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      12.4%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500 font-mono">2</td>
                  <td className="py-2.5 font-bold text-white">Bengaluru ➔ Chennai</td>
                  <td className="py-2.5 text-right font-mono text-slate-300">36</td>
                  <td className="py-2.5 text-right font-mono text-slate-400">4,062</td>
                  <td className="py-2.5 text-right font-mono font-bold text-white">₹398,600</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      10.8%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500 font-mono">3</td>
                  <td className="py-2.5 font-bold text-white">Mumbai ➔ Ahmedabad</td>
                  <td className="py-2.5 text-right font-mono text-slate-300">28</td>
                  <td className="py-2.5 text-right font-mono text-slate-400">3,927</td>
                  <td className="py-2.5 text-right font-mono font-bold text-white">₹331,200</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      8.6%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500 font-mono">4</td>
                  <td className="py-2.5 font-bold text-white">Chennai ➔ Hyderabad</td>
                  <td className="py-2.5 text-right font-mono text-slate-300">24</td>
                  <td className="py-2.5 text-right font-mono text-slate-400">2,816</td>
                  <td className="py-2.5 text-right font-mono font-bold text-white">₹274,800</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                      6.9%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500 font-mono">5</td>
                  <td className="py-2.5 font-bold text-white">Kolkata ➔ Delhi</td>
                  <td className="py-2.5 text-right font-mono text-slate-300">18</td>
                  <td className="py-2.5 text-right font-mono text-slate-400">2,403</td>
                  <td className="py-2.5 text-right font-mono font-bold text-white">₹218,400</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                      5.4%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* PANEL 6: FUEL VS TOLL EXPENSES SPLINE CHART (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 text-sm">⛽</span>
                <h3 className="font-bold text-white text-sm">Fuel vs Toll Expenses</h3>
              </div>
              <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Monthly ⌄
              </span>
            </div>

            {/* Sub-Legend */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-cyan-400 shadow-xs shadow-cyan-400" />
                <span className="text-slate-400">Fuel</span>
                <span className="font-bold text-white font-mono">₹872,410</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs shadow-purple-500" />
                <span className="text-slate-400">Tolls</span>
                <span className="font-bold text-white font-mono">₹383,120</span>
              </div>
            </div>
          </div>

          {/* SVG Spline Chart */}
          <div className="w-full h-44 mt-3 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 350 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="fuelLineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="35" x2="350" y2="35" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="350" y2="75" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="115" x2="350" y2="115" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Fuel Curve (Cyan) */}
              <path
                d="M0,110 C50,130 90,85 140,80 C190,75 220,105 260,65 C300,30 330,45 350,25 L350,150 L0,150 Z"
                fill="url(#fuelLineGrad)"
              />
              <path
                d="M0,110 C50,130 90,85 140,80 C190,75 220,105 260,65 C300,30 330,45 350,25"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
              />

              {/* Tolls Curve (Purple) */}
              <path
                d="M0,135 C50,140 90,115 140,110 C190,105 220,125 260,95 C300,75 330,85 350,65"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2"
              />

              <circle cx="140" cy="80" r="3" fill="#06b6d4" />
              <circle cx="260" cy="65" r="3" fill="#06b6d4" />
            </svg>

            {/* X-Axis */}
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-800">
              <span>Mar 1</span>
              <span>Mar 5</span>
              <span>Mar 10</span>
              <span>Mar 15</span>
              <span>Mar 20</span>
              <span>Mar 25</span>
              <span>Mar 31</span>
            </div>
          </div>
        </div>

        {/* PANEL 7: ALERTS & REMINDERS (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-rose-400 text-sm">🔔</span>
                <h3 className="font-bold text-white text-sm">Alerts & Reminders</h3>
              </div>
              <button
                type="button"
                onClick={() => alert('Navigating to full audit alerts center...')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                View All &gt;
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-rose-500/20 flex items-start gap-2.5">
                <span className="text-rose-400 text-sm mt-0.5">⚠️</span>
                <div className="flex-1">
                  <div className="font-bold text-slate-200 leading-tight">
                    Truck MH12AB1234 maintenance due in 2 days
                  </div>
                  <span className="text-[10px] text-slate-500">2h ago • Fleet Maintenance</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-amber-500/20 flex items-start gap-2.5">
                <span className="text-amber-400 text-sm mt-0.5">⚠️</span>
                <div className="flex-1">
                  <div className="font-bold text-slate-200 leading-tight">
                    Driver license renewal for Suresh Kumar
                  </div>
                  <span className="text-[10px] text-slate-500">5h ago • Driver Compliance</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-blue-500/20 flex items-start gap-2.5">
                <span className="text-blue-400 text-sm mt-0.5">ℹ️</span>
                <div className="flex-1">
                  <div className="font-bold text-slate-200 leading-tight">
                    Unusual fuel consumption detected (TRK-007)
                  </div>
                  <span className="text-[10px] text-slate-500">1d ago • Telematics Audit</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-amber-500/20 flex items-start gap-2.5">
                <span className="text-amber-400 text-sm mt-0.5">⚠️</span>
                <div className="flex-1">
                  <div className="font-bold text-slate-200 leading-tight">
                    3 trips delayed due to weather conditions
                  </div>
                  <span className="text-[10px] text-slate-500">1d ago • Transit Operations</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500">
              Automated reminders connected to Enterprise Audit Engine
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
