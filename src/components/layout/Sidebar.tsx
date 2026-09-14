import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, Truck, RefreshCw, Package, Wrench, Disc, FileCheck, Users, Bell, Mail, Database, LogOut, TrendingUp, CreditCard, Receipt, Fuel, FileText } from 'lucide-react';
import { dbtabeses } from '../../db/store';
import { ClientProfile } from '../../types';

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<Props> = ({ currentPage, onNavigate }) => {
  const [clients, setClients] = useState<ClientProfile[]>(dbtabeses.getClients());

  useEffect(() => {
    const handle = () => setClients(dbtabeses.getClients());
    window.addEventListener('jc-store-update', handle);
    return () => window.removeEventListener('jc-store-update', handle);
  }, []);

  const hasPodClient = clients.some(c => c.requires_pod);

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
    ...(hasPodClient ? [{ id: 'pod', label: 'POD Management', icon: FileCheck }] : []),
    { id: 'exit-audut', label: 'Driver Exit Audit', icon: LogOut },
    { id: 'billing-cycles', label: '14-Day Billing Cycles', icon: RefreshCw },
    { id: 'payment-reminders', label: 'Credit Card Due Alerts', icon: Bell },
    { id: 'employees', label: 'Employee Hub & Payroll', icon: Users },
    { id: 'mail', label: 'Hostinger Webmail', icon: Mail },
    { id: 'users', label: 'User & Access Manager', icon: Users },
    { id: 'db-viewer', label: 'SQL Schema Viewer', icon: Database },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between hidden md:flex min-h-screen">
      <div className="space-y-4">
        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Logistics ERP Modules</div>
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full px-3 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-3 transition ${active ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};