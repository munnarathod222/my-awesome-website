import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, Compass, Search, ClipboardCheck, Repeat, 
  Truck, ArrowRight, ShieldCheck, Sparkles, Clock, TrendingUp,
  UserCheck, ArrowLeftRight
} from 'lucide-react';
import FleetCalendarPage from './FleetCalendarPage.jsx';
import MovementPredictionPage from './MovementPredictionPage.jsx';
import AvailabilitySearchPage from './AvailabilitySearchPage.jsx';
import BookingManagementPage from './BookingManagementPage.jsx';
import ReturnLoadPage from './ReturnLoadPage.jsx';
import DepartureBoardPage from './DepartureBoardPage.jsx';
import RouteProfitPage from './RouteProfitPage.jsx';
import SubscriptionsPage from './SubscriptionsPage.jsx';
import RecurringBookingsPage from './RecurringBookingsPage.jsx';
import PartnerOwnerPortal from './PartnerOwnerPortal.jsx';

const SUBMODULES = [
  { id: 'calendar', label: 'Fleet Calendar', icon: CalendarDays, description: 'Gantt timeline & truck scheduling' },
  { id: 'departures', label: 'Departure Board', icon: Clock, description: 'Airport flight-style truck departures' },
  { id: 'search', label: 'Flexible Date Search', icon: Search, description: 'Multi-date availability & economic rates' },
  { id: 'manage', label: 'Booking Management', icon: ClipboardCheck, description: 'Client requests & instant truck assignment' },
  { id: 'subscriptions', label: 'Dedicated Retainers', icon: ShieldCheck, description: 'Monthly dedicated vehicle subscriptions' },
  { id: 'recurring', label: 'Recurring Bookings', icon: Repeat, description: 'Repeat scheduled dispatches' },
  { id: 'route-profit', label: 'Route Profit Ranking', icon: TrendingUp, description: 'P&L net margin corridor leaderboard' },
  { id: 'partner-portal', label: 'Attached Owner Portal', icon: UserCheck, description: 'External vehicle onboarding & ledger' },
  { id: 'return-loads', label: 'Return-Loads', icon: ArrowLeftRight, description: 'Backhaul revenue maximizer' },
  { id: 'prediction', label: 'Movement Prediction', icon: Compass, description: 'SLA forecasts & location telemetry' },
];

function getUrlTab() {
  try {
    if (typeof window === 'undefined') return 'calendar';
    const sp = new URLSearchParams(window.location.search);
    return sp.get('tab') || 'calendar';
  } catch (e) {
    return 'calendar';
  }
}

export default function FleetReservationHub({ initialTab = 'calendar' }) {
  const [activeTab, setActiveTab] = useState(getUrlTab);

  useEffect(() => {
    const onPop = () => setActiveTab(getUrlTab());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    try {
      const sp = new URLSearchParams(window.location.search);
      sp.set('tab', tabId);
      const newUrl = `${window.location.pathname}?${sp.toString()}`;
      window.history.pushState(null, '', newUrl);
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* ── Submodule Quick Navigation Bar ──────────────────────────── */}
      <div className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md px-4 md:px-6 py-2.5 shadow-md">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs">
              <Truck className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white hidden sm:inline">
              Fleet Reservation Hub
            </span>
          </div>

          {/* Submodule Tab Pills */}
          <div className="flex items-center gap-1 shrink-0 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
            {SUBMODULES.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  title={tab.description}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Active Submodule View ───────────────────────────────────── */}
      <div className="py-2">
        {activeTab === 'calendar' && <FleetCalendarPage />}
        {activeTab === 'departures' && <DepartureBoardPage />}
        {activeTab === 'search' && <AvailabilitySearchPage />}
        {activeTab === 'manage' && <BookingManagementPage />}
        {activeTab === 'subscriptions' && <SubscriptionsPage />}
        {activeTab === 'recurring' && <RecurringBookingsPage />}
        {activeTab === 'route-profit' && <RouteProfitPage />}
        {activeTab === 'partner-portal' && <PartnerOwnerPortal />}
        {activeTab === 'return-loads' && <ReturnLoadPage />}
        {activeTab === 'prediction' && <MovementPredictionPage />}
      </div>
    </div>
  );
}
