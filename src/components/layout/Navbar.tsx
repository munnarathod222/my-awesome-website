import React, { useState, useEffect } from 'react';
import {
  Bell,
  Wallet,
  Building,
  Receipt,
  Camera,
  Menu,
  X,
  LayoutDashboard,
  Fuel,
  TrendingUp,
  CreditCard,
  Truck,
  RefreshCw,
  Package,
  Wrench,
  Disc,
  FileCheck,
  LogOut,
  Users,
  Mail,
  Database,
  FileText
} from 'lucide-react';
import { cashbookService } from '../../services/cashbookService';
import { dbtabeses } from '../../db/store';

interface Props {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<Props> = ({ onNavigate, currentPage }) => {
  const [summary, setSummary] = useState(cashbookService.getSummary());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setSummary(cashbookService.getSummary());
    };
    window.addEventListener('jc-store-update', handleUpdate);
    return () => window.removeEventListener('jc-store-update', handleUpdate);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents (LR & POD)', icon: FileText },
    { id: 'expenses', label: 'Expenses & Receipt AI', icon: Receipt },
    { id: 'fuel', label: 'Fuel Tracker & OCR', icon: Fuel },
    { id: 'analytics', label: 'Analytics Hub', icon: TrendingUp },
    { id: 'payment-requests', label: 'Payment Requests & Collections', icon: CreditCard },
    { id: 'cashbook', label: 'Live Cashbook', icon: Wallet },
    { id: 'trips', label: 'Trip Logs & Scheduler', icon: Truck },
    { id: 'recurring', label: 'Batch Recurring Trips', icon: RefreshCw },
    { id: 'inventory', label: 'Inventory Management', icon: Package },
    { id: 'maintenance', label: 'Fleet Maintenance', icon: Wrench },
    { id: 'tyres', label: 'Tyre & Battery Manager', icon: Disc },
    { id: 'pod', label: 'POD Management', icon: FileCheck },
    { id: 'exit-audut', label: 'Driver Exit Audit', icon: LogOut },
    { id: 'billing-cycles', label: '14-Day Billing Cycles', icon: RefreshCw },
    { id: 'payment-reminders', label: 'Credit Card Due Alerts', icon: Bell },
    { id: 'employees', label: 'Employee Hub & Payroll', icon: Users },
    { id: 'mail', label: 'Hostinger Webmail', icon: Mail },
    { id: 'users', label: 'User & Access Manager', icon: Users },
    { id: 'db-viewer', label: 'SQL Schema Viewer', icon: Database },
  ];

  const handleTriggerScan = () => {
    onNavigate('expenses');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('jc-open-expense-capture', { detail: { mode: 'camera' } }));
    }, 80);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white md:hidden rounded-xl hover:bg-slate-800 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-orange-400" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-900/20 shrink-0">
            <Building className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-extrabold tracking-wider text-white flex items-center gap-2">
              <span>JAI BHAVANI CARGO</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">PREMIUM ERP</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400">www.jaibhavanicargo.com | Operations &amp; Finance</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prominent AI Scan Bill Camera Button */}
          <button
            onClick={handleTriggerScan}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold rounded-xl shadow-lg shadow-orange-950/40 transition text-xs sm:text-sm cursor-pointer"
            title="Open camera or gallery to AI scan an expense receipt"
          >
            <Camera className="w-4 h-4 text-orange-200" />
            <span className="font-bold">📷 AI Scan Bill</span>
          </button>

          <button
            onClick={() => onNavigate('expenses')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-400 font-bold rounded-xl transition text-xs"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Expenses</span>
          </button>

          <button
            onClick={() => onNavigate('cashbook')}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition group"
          >
            <div className="p-1 sm:p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="text-left">
              <p className="text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-wider hidden sm:block">Current Balance</p>
              <p className="text-xs sm:text-sm font-bold text-emerald-400">₹{summary.currentBalance.toLocaleString('in-IN')}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-[70vh] overflow-y-auto p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-3 transition ${
                    active
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-orange-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};