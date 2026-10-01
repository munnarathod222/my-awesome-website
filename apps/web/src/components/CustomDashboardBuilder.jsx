import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Edit3, Check, X, Sparkles, Move, Maximize2, Minimize2, 
  RotateCcw, Save, Trash2, ChevronLeft, ChevronRight, LayoutGrid,
  TrendingUp, Calendar, Truck, Receipt, CheckSquare, ShieldAlert,
  Fuel, CreditCard, DollarSign, Users, ArrowUpRight, ArrowDownRight,
  Clock, AlertTriangle, Eye, Wrench, ShieldCheck, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Predefined layout presets
const PRESET_LAYOUTS = {
  owner: {
    name: 'Owner Dashboard',
    icon: '👑',
    description: 'High-level financial yields, receivables, net margin, and risk compliance.',
    widgets: [
      { id: 'revenue', size: 'medium' },
      { id: 'contribution', size: 'medium' },
      { id: 'receivables', size: 'small' },
      { id: 'fleet_status', size: 'small' },
      { id: 'alerts', size: 'medium' },
      { id: 'calendar', size: 'medium' },
      { id: 'tasks', size: 'small' },
      { id: 'fastag', size: 'small' }
    ]
  },
  operations: {
    name: 'Operations Dashboard',
    icon: '🚛',
    description: 'Real-time dispatch, active highway trips, fuel logs, driver batas & maintenance.',
    widgets: [
      { id: 'active_trips', size: 'large' },
      { id: 'fleet_status', size: 'medium' },
      { id: 'fuel', size: 'small' },
      { id: 'fastag', size: 'small' },
      { id: 'tyres', size: 'small' },
      { id: 'attendance', size: 'small' },
      { id: 'alerts', size: 'medium' },
      { id: 'calendar', size: 'medium' }
    ]
  },
  finance: {
    name: 'Finance & Cashbook',
    icon: '💰',
    description: 'Cashflow health, pending client payments, trip freight collections & expenses.',
    widgets: [
      { id: 'revenue', size: 'medium' },
      { id: 'receivables', size: 'medium' },
      { id: 'contribution', size: 'large' },
      { id: 'fastag', size: 'small' },
      { id: 'fuel', size: 'small' },
      { id: 'tasks', size: 'medium' }
    ]
  }
};

// Full Master Catalog of all available widgets across system tabs
const WIDGET_CATALOG = [
  {
    id: 'revenue',
    title: 'Revenue & Net Margin',
    category: 'Finance',
    tabSource: 'Cashbook & P&L',
    icon: '💰',
    defaultSize: 'medium',
    description: 'Live billing, variable costs deduction, and gross operational profit.'
  },
  {
    id: 'active_trips',
    title: 'Active Trips & Live Dispatches',
    category: 'Operations',
    tabSource: 'Trip Logs',
    icon: '🛣️',
    defaultSize: 'large',
    description: 'En-route trucks, destinations, live ETA, and delay tracking.'
  },
  {
    id: 'contribution',
    title: 'Truck Contribution Ranking',
    category: 'Finance',
    tabSource: 'Truck Manager',
    icon: '📊',
    defaultSize: 'medium',
    description: '13. Financial diagnostic: Benchmark Truck A vs lagging Truck B.'
  },
  {
    id: 'receivables',
    title: 'Outstanding Receivables',
    category: 'Finance',
    tabSource: 'Billing & Invoices',
    icon: '📑',
    defaultSize: 'small',
    description: 'Pending payments from clients, overdue alerts, and uncollected freights.'
  },
  {
    id: 'fleet_status',
    title: 'Fleet Availability & Health',
    category: 'Fleet',
    tabSource: 'Truck Manager',
    icon: '🚛',
    defaultSize: 'small',
    description: 'Available vs In-transit vs Workshop trucks and utilization rate.'
  },
  {
    id: 'calendar',
    title: 'Calendar & Dispatch Schedule',
    category: 'Schedule',
    tabSource: 'Calendar',
    icon: '📅',
    defaultSize: 'medium',
    description: 'Scheduled pickups, deliveries, document renewals, and staff roster.'
  },
  {
    id: 'alerts',
    title: 'Compliance & Document Alerts',
    category: 'Compliance',
    tabSource: 'Truck Docs & Vault',
    icon: '⚠️',
    defaultSize: 'medium',
    description: 'Fitness, Insurance, Road Tax, National Permit, and PUC expiries.'
  },
  {
    id: 'tasks',
    title: 'Operations To-Do List',
    category: 'Management',
    tabSource: 'Tasks Hub',
    icon: '✅',
    defaultSize: 'small',
    description: 'Actionable items, driver advance approvals, and pending checklists.'
  },
  {
    id: 'fuel',
    title: 'Fuel Tracker & Economy',
    category: 'Fleet',
    tabSource: 'Fuel Tracker',
    icon: '⛽',
    defaultSize: 'small',
    description: 'Fleet average mileage (km/L), monthly diesel spend, and pump logs.'
  },
  {
    id: 'fastag',
    title: 'FASTag Toll Wallet',
    category: 'Finance',
    tabSource: 'FASTag Manager',
    icon: '💳',
    defaultSize: 'small',
    description: 'ICICI FASTag balances, daily toll burn, and low balance warnings.'
  },
  {
    id: 'tyres',
    title: 'Tyres & Maintenance Health',
    category: 'Fleet',
    tabSource: 'Tyres & Maintenance',
    icon: '🔧',
    defaultSize: 'small',
    description: 'Tyres due for rotation, open workshop job cards, and spare parts.'
  },
  {
    id: 'attendance',
    title: 'Staff & Driver Attendance',
    category: 'HR',
    tabSource: 'Employees Hub',
    icon: '👨‍✈️',
    defaultSize: 'small',
    description: 'On-duty drivers, leave status, and available relief staff.'
  }
];

export default function CustomDashboardBuilder({ summaryData = {}, onNavigate }) {
  const [selectedPreset, setSelectedPreset] = useState(() => {
    try {
      return localStorage.getItem('jbc_dashboard_active_preset') || 'owner';
    } catch {
      return 'owner';
    }
  });

  const [activeWidgets, setActiveWidgets] = useState(() => {
    try {
      const saved = localStorage.getItem('jbc_custom_dashboard_widgets');
      if (saved) return JSON.parse(saved);
    } catch {}
    return PRESET_LAYOUTS.owner.widgets;
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCategoryFilter, setAddCategoryFilter] = useState('All');

  // Sync to local storage
  const saveWidgets = (newWidgets) => {
    setActiveWidgets(newWidgets);
    try {
      localStorage.setItem('jbc_custom_dashboard_widgets', JSON.stringify(newWidgets));
    } catch (e) {
      console.error('Failed to save custom dashboard layout', e);
    }
  };

  const handleApplyPreset = (presetKey) => {
    setSelectedPreset(presetKey);
    try {
      localStorage.setItem('jbc_dashboard_active_preset', presetKey);
    } catch {}
    const preset = PRESET_LAYOUTS[presetKey];
    if (preset) {
      saveWidgets(preset.widgets);
    }
  };

  const handleResizeWidget = (widgetId, newSize) => {
    const updated = activeWidgets.map(w => w.id === widgetId ? { ...w, size: newSize } : w);
    saveWidgets(updated);
  };

  const handleRemoveWidget = (widgetId) => {
    const updated = activeWidgets.filter(w => w.id !== widgetId);
    saveWidgets(updated);
  };

  const handleMoveWidget = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= activeWidgets.length) return;
    const copy = [...activeWidgets];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);
    saveWidgets(copy);
  };

  const handleAddWidget = (widgetDef) => {
    if (activeWidgets.some(w => w.id === widgetDef.id)) return;
    const updated = [...activeWidgets, { id: widgetDef.id, size: widgetDef.defaultSize || 'small' }];
    saveWidgets(updated);
    setIsAddModalOpen(false);
  };

  const handleResetLayout = () => {
    const preset = PRESET_LAYOUTS[selectedPreset] || PRESET_LAYOUTS.owner;
    saveWidgets(preset.widgets);
    setIsEditMode(false);
  };

  // Render individual widget card based on type and size
  const renderWidgetContent = (widgetConfig, index) => {
    const meta = WIDGET_CATALOG.find(w => w.id === widgetConfig.id);
    if (!meta) return null;

    const size = widgetConfig.size || 'small';
    const isSmall = size === 'small';
    const isMedium = size === 'medium';
    const isLarge = size === 'large';

    // Tailwind grid column spans
    const colSpanClass = isLarge 
      ? 'col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4' 
      : isMedium 
        ? 'col-span-1 sm:col-span-2' 
        : 'col-span-1';

    return (
      <div 
        key={widgetConfig.id}
        className={`${colSpanClass} group relative bg-slate-900/90 hover:bg-slate-900 backdrop-blur-xl border ${
          isEditMode 
            ? 'border-amber-400 ring-2 ring-amber-400/20 animate-pulse' 
            : 'border-slate-800 hover:border-slate-700'
        } rounded-3xl p-4 sm:p-5 shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden`}
      >
        {/* Mobile-Style Edit Controls Bar */}
        {isEditMode && (
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-slate-950/95 border border-slate-700 rounded-xl p-1 shadow-2xl">
            {/* Move Left / Up */}
            <button
              type="button"
              onClick={() => handleMoveWidget(index, -1)}
              disabled={index === 0}
              className="w-6 h-6 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 flex items-center justify-center text-xs"
              title="Move backward"
            >
              ←
            </button>
            {/* Move Right / Down */}
            <button
              type="button"
              onClick={() => handleMoveWidget(index, 1)}
              disabled={index === activeWidgets.length - 1}
              className="w-6 h-6 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 flex items-center justify-center text-xs"
              title="Move forward"
            >
              →
            </button>

            <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

            {/* Size toggles: S, M, L */}
            <button
              type="button"
              onClick={() => handleResizeWidget(widgetConfig.id, 'small')}
              className={`px-1.5 h-6 rounded text-[10px] font-bold ${
                isSmall ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Small 1x1 tile"
            >
              S
            </button>
            <button
              type="button"
              onClick={() => handleResizeWidget(widgetConfig.id, 'medium')}
              className={`px-1.5 h-6 rounded text-[10px] font-bold ${
                isMedium ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Medium 2x1 banner"
            >
              M
            </button>
            <button
              type="button"
              onClick={() => handleResizeWidget(widgetConfig.id, 'large')}
              className={`px-1.5 h-6 rounded text-[10px] font-bold ${
                isLarge ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Large full width"
            >
              L
            </button>

            <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

            {/* Delete button */}
            <button
              type="button"
              onClick={() => handleRemoveWidget(widgetConfig.id)}
              className="w-6 h-6 rounded-lg text-rose-400 hover:text-white hover:bg-rose-600 flex items-center justify-center text-xs font-black transition-colors"
              title="Remove widget"
            >
              ✕
            </button>
          </div>
        )}

        {/* Widget Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0 pr-14">
            <span className="text-lg p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0">
              {meta.icon}
            </span>
            <div className="min-w-0">
              <h4 className="font-extrabold text-xs sm:text-sm text-white truncate tracking-tight">
                {meta.title}
              </h4>
              <span className="text-[10px] font-mono text-slate-400 block truncate">
                {meta.tabSource}
              </span>
            </div>
          </div>
          {!isEditMode && onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate(meta.tabSource)}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 shrink-0 opacity-80 hover:opacity-100 flex items-center gap-0.5"
            >
              View →
            </button>
          )}
        </div>

        {/* Dynamic Body Rendering based on Widget ID */}
        <div className="flex-1 py-1">
          {widgetConfig.id === 'revenue' && (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  ₹2,84,000
                </span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                <span>Net Profit: <strong className="text-emerald-400 font-mono">₹1,32,000</strong></span>
                <span>Margin: <strong className="text-white font-mono">46.5%</strong></span>
              </div>
              {!isSmall && (
                <div className="mt-3 p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Trip Freight</span>
                    <span className="font-mono font-bold text-white">₹2.45L</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Variable Cost</span>
                    <span className="font-mono font-bold text-rose-400">₹1.52L</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Daily Run</span>
                    <span className="font-mono font-bold text-cyan-400">₹9,460</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {widgetConfig.id === 'active_trips' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">8</span>
                  <span className="text-xs text-slate-400 font-medium">Trucks En-Route</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
                  94% On-Time
                </Badge>
              </div>

              {!isSmall && (
                <div className="space-y-1.5 pt-1">
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400">TG12U2637</span>
                      <span className="text-slate-400 text-[11px]">Hyderabad → Warangal</span>
                    </div>
                    <span className="text-emerald-400 font-mono text-[11px] font-bold">In-Transit (28km left)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400">TS29AB1999</span>
                      <span className="text-slate-400 text-[11px]">Nizamabad → Medchal</span>
                    </div>
                    <span className="text-cyan-400 font-mono text-[11px] font-bold">Unloading Dock</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {widgetConfig.id === 'contribution' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Benchmark #1</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">Truck A: ₹1.3L</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Lagging #2</span>
                  <span className="text-lg font-black text-rose-400 font-mono">Truck B: ₹50K</span>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Variance Gap:</span>
                <span className="font-mono font-bold text-amber-400">-₹80,000 (Diesel & Deadhead)</span>
              </div>
            </div>
          )}

          {widgetConfig.id === 'receivables' && (
            <div className="space-y-1.5">
              <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono block">
                ₹1,98,800
              </span>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Pending Invoices: <strong>3 Clients</strong></span>
                <span className="text-amber-400 font-bold">1 Overdue</span>
              </div>
            </div>
          )}

          {widgetConfig.id === 'fleet_status' && (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">8 / 8</span>
                <span className="text-xs text-emerald-400 font-bold">100% Road Ready</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center text-[10px] pt-1 font-mono">
                <span className="p-1 rounded bg-slate-950 text-emerald-400">6 Available</span>
                <span className="p-1 rounded bg-slate-950 text-cyan-400">2 In Workshop</span>
                <span className="p-1 rounded bg-slate-950 text-slate-400">0 Idle</span>
              </div>
            </div>
          )}

          {widgetConfig.id === 'alerts' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> 2 Expiring in 90 Days
                </span>
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px]">
                  Urgent
                </Badge>
              </div>
              <div className="text-xs space-y-1 pt-1">
                <div className="flex justify-between text-slate-300">
                  <span>TG12U2637 Road Tax</span>
                  <span className="font-mono text-amber-400 font-bold">31-Dec-2026</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>TG12U2637 Insurance</span>
                  <span className="font-mono text-cyan-400 font-bold">09-Dec-2026</span>
                </div>
              </div>
            </div>
          )}

          {widgetConfig.id === 'calendar' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', weekday: 'short' })}
                </span>
                <span className="text-[10px] text-amber-400 font-mono">3 Scheduled Pickups</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                📦 <strong>Hyderabad Hub</strong>: 14:00 Warangal Line Haul Dispatch
              </div>
            </div>
          )}

          {widgetConfig.id === 'tasks' && (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-slate-300 font-medium">Pending Approvals</span>
                <span className="font-mono font-bold text-amber-400">3 Tasks</span>
              </div>
              <p className="text-slate-400 text-[11px] truncate">
                • Approve Warangal fuel reimbursement (₹3,114)
              </p>
              <p className="text-slate-400 text-[11px] truncate">
                • Verify tyre rotation log for TG12U2637
              </p>
            </div>
          )}

          {widgetConfig.id === 'fuel' && (
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-white font-mono">4.7 km/L</span>
                <span className="text-xs text-emerald-400 font-bold">Optimal</span>
              </div>
              <span className="text-[11px] text-slate-400 block">
                Total Burn: <strong>₹94,500</strong> this month
              </span>
            </div>
          )}

          {widgetConfig.id === 'fastag' && (
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-cyan-400 font-mono">₹1,558</span>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-[10px]">
                  ICICI Bank
                </Badge>
              </div>
              <span className="text-[11px] text-slate-400 block">
                Last recharge: <strong>₹10,000</strong> on 22-Sep
              </span>
            </div>
          )}

          {widgetConfig.id === 'tyres' && (
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-white font-mono">2 Due</span>
                <span className="text-xs text-amber-400 font-bold">Rotation Window</span>
              </div>
              <span className="text-[11px] text-slate-400 block">
                Axle 2 Right Duals reached 80,000 km threshold
              </span>
            </div>
          )}

          {widgetConfig.id === 'attendance' && (
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-400 font-mono">92%</span>
                <span className="text-xs text-slate-400 font-medium">11/12 Present</span>
              </div>
              <span className="text-[11px] text-slate-400 block">
                1 driver on leave • 2 relief staff active
              </span>
            </div>
          )}
        </div>

        {/* Footer info & resize hint */}
        <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <span>{meta.category}</span>
          <span className="uppercase font-mono font-bold text-slate-400">{size} Tile</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Custom Builder Toolbar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧩</span>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                33. Custom Dashboard Builder
              </h3>
              <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 font-mono text-[10px]">
                Modular Layouts
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Customize your operations dashboard with live widgets from any tab. Resize, reorder, or switch presets like mobile.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isEditMode ? (
              <>
                <Button
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                  className="h-9 px-3.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Customize Dashboard
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  className="h-9 px-3.5 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Widget
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  className="h-9 px-3.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  Add Widget
                </Button>
                <Button
                  size="sm"
                  onClick={handleResetLayout}
                  className="h-9 px-3 text-xs font-bold rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  title="Reset to preset default"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsEditMode(false)}
                  className="h-9 px-4 text-xs font-black rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Done & Save
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Layout Preset Switcher Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <LayoutGrid className="w-3.5 h-3.5" /> Presets:
            </span>
            {Object.keys(PRESET_LAYOUTS).map(key => {
              const p = PRESET_LAYOUTS[key];
              const isActive = (selectedPreset === key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleApplyPreset(key)}
                  className={`h-8 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 shadow-md scale-105' 
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{p.icon}</span>
                  {p.name}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {activeWidgets.length} Active Widgets • Auto-Saved in Browser
          </div>
        </div>
      </div>

      {/* Edit Mode Notice Banner */}
      {isEditMode && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Edit Mode Active:</strong> Tap <strong>S</strong>, <strong>M</strong>, or <strong>L</strong> to resize widgets. Use arrows <strong>←</strong> / <strong>→</strong> to rearrange, or <strong>✕</strong> to remove.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditMode(false)}
            className="text-xs font-bold text-white bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1 rounded-xl"
          >
            Exit Edit Mode
          </button>
        </div>
      )}

      {/* Dynamic Grid of Custom Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeWidgets.map((w, idx) => renderWidgetContent(w, idx))}

        {/* Add Widget Quick Placeholder */}
        {isEditMode && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="col-span-1 min-h-[160px] rounded-3xl border-2 border-dashed border-slate-800 hover:border-amber-400/80 bg-slate-900/40 hover:bg-slate-900/80 p-5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-amber-400 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-slate-800 group-hover:bg-amber-500/10 flex items-center justify-center text-lg transition-transform group-hover:scale-110">
              <Plus className="w-5 h-5 text-amber-400" />
            </div>
            <span className="font-bold text-xs text-white">Add Another Widget</span>
            <span className="text-[10px] text-slate-500">Pick from 12+ tabs</span>
          </button>
        )}
      </div>

      {/* Add Widget Catalog Dialog */}
      {isAddModalOpen && (
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto bg-slate-950 text-white border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
            <DialogHeader className="border-b border-slate-800 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
                    <span>➕</span> Add Widgets to Dashboard
                  </DialogTitle>
                  <p className="text-xs text-slate-400 mt-1">
                    Choose small widgets from all operational and financial tabs across the platform.
                  </p>
                </div>
              </div>
            </DialogHeader>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3">
              {['All', 'Finance', 'Operations', 'Fleet', 'Schedule', 'Compliance', 'HR'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setAddCategoryFilter(cat)}
                  className={`h-7 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    addCategoryFilter === cat 
                      ? 'bg-amber-500 text-slate-950 font-black' 
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              {WIDGET_CATALOG
                .filter(w => addCategoryFilter === 'All' || w.category === addCategoryFilter)
                .map(item => {
                  const isAlreadyAdded = activeWidgets.some(w => w.id === item.id);

                  return (
                    <div 
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isAlreadyAdded 
                          ? 'bg-slate-900/40 border-slate-800/60 opacity-60' 
                          : 'bg-slate-900 border-slate-800 hover:border-amber-400/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl p-1.5 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                            {item.icon}
                          </span>
                          <div>
                            <span className="font-bold text-xs text-white block truncate">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-amber-400 font-mono">
                              {item.tabSource}
                            </span>
                          </div>
                        </div>

                        {isAlreadyAdded ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                            ✓ Added
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAddWidget(item)}
                            className="h-7 px-2.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shrink-0 cursor-pointer"
                          >
                            + Add
                          </Button>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 text-xs font-bold rounded-xl border-slate-700 text-slate-300"
              >
                Close Catalog
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
