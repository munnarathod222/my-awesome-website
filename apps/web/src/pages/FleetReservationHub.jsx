import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, Compass, Search, ClipboardCheck, Repeat, 
  Truck, ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react';
import FleetCalendarPage from './FleetCalendarPage.jsx';
import MovementPredictionPage from './MovementPredictionPage.jsx';
import AvailabilitySearchPage from './AvailabilitySearchPage.jsx';
import BookingManagementPage from './BookingManagementPage.jsx';
import ReturnLoadPage from './ReturnLoadPage.jsx';

const SUBMODULES = [
  { id: 'calendar', label: 'Fleet Calendar', icon: CalendarDays, description: 'Gantt timeline & truck scheduling' },
  { id: 'prediction', label: 'Movement Prediction', icon: Compass, description: 'SLA forecasts & India map distribution' },
  { id: 'search', label: 'Availability Search', icon: Search, description: 'Intelligent truck matching & booking' },
  { id: 'manage', label: 'Booking Management', icon: ClipboardCheck, description: 'Confirmed, provisional & requests' },
  { id: 'return-loads', label: 'Return-Load Opportunities', icon: Repeat, description: 'Backhaul revenue maximizer' },
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
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs">
              <Truck className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white hidden sm:inline">
              Fleet Reservation
            </span>
          </div>

          {/* Submodule Tab Pills */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {SUBMODULES.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
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
        {activeTab === 'prediction' && <MovementPredictionPage />}
        {activeTab === 'search' && <AvailabilitySearchPage />}
        {activeTab === 'manage' && <BookingManagementPage />}
        {activeTab === 'return-loads' && <ReturnLoadPage />}
      </div>
    </div>
  );
}
