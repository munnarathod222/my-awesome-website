import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { 
  LayoutDashboard, Users, Truck, CalendarDays, FileText, Settings, 
  MapPin, ClipboardList, CreditCard, Droplet, Wrench, BarChart3, 
  Bell, CheckSquare, FileBox, MessageSquare as MessageSquareWarning, 
  Contact2, PieChart, Calculator, TrendingUp, Mail, Search, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getTranslationKey = (label) => {
  if (label === 'To-Do List') return 'todo_list';
  if (label === 'Inventory Management') return 'inventory';
  if (label === 'Fleet & Staff') return 'fleet_staff';
  return label.toLowerCase().replace(/[\s&]+/g, '_').trim();
};

export default function LaunchpadPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const role = currentUser?.role || 'user';
  const [searchQuery, setSearchQuery] = useState('');

  const menuGroups = [
    {
      title: "Overview",
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/25",
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', desc: 'Real-time overview of fleet operations', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] },
        { icon: BarChart3, label: 'Analytics', path: '/analytics', desc: 'P&L reporting & financial matrices', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: PieChart, label: 'Client Analysis', path: '/client-analysis', desc: 'Revenue split and payment margins', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: TrendingUp, label: 'Trip Overview', path: '/dashboard/trip-overview', desc: 'Global route metrics & calculations', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: Bell, label: 'Reminders', path: '/reminders', desc: 'Stay updated on deadlines & actions', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] },
        { icon: CheckSquare, label: 'To-Do List', path: '/todo', desc: 'Personal task checklist manager', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] },
      ]
    },
    {
      title: "Operations",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/25",
      items: [
        { icon: ClipboardList, label: 'Trip Logs', path: '/trip-logs', desc: 'Manage & dispatch trip schedules', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: MapPin, label: 'Route Master', path: '/routes-master', desc: 'Route rate configurations & origins', roles: ['super_admin', 'admin', 'dispatcher'] },
        { icon: FileText, label: 'Quotes', path: '/quotes-manager', desc: 'Customer quote calculator & generator', roles: ['super_admin', 'admin', 'manager'] },
        { icon: Droplet, label: 'Fuel Tracker', path: '/fuel-tracker', desc: 'Fuel purchases & efficiency KMPL', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: Wrench, label: 'Fleet Maintenance', path: '/fleet-maintenance', desc: 'Servicing logs, problems & inventory', roles: ['super_admin', 'admin', 'dispatcher'] },
        { icon: FileBox, label: 'Inventory Management', path: '/inventory', desc: 'Manage spare parts stock levels', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: ClipboardList, label: 'POD Management', path: '/pod-management', desc: 'Proof of Delivery photo validation', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: CheckSquare, label: 'Exit Audit', path: '/exit-audit', desc: 'Vehicle inspections before releases', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] }
      ]
    },
    {
      title: "Finance",
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/25",
      items: [
        { icon: FileText, label: 'Cashbook', path: '/cashbook', desc: 'Petty cash balances & double entry', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: FileText, label: 'Expenses', path: '/expenses', desc: 'Track fleet and operational overheads', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: MessageSquareWarning, label: 'Payment Requests', path: '/payment-requests', desc: 'Submit and approve vendor requests', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: CreditCard, label: 'Credit Cards', path: '/credit-cards', desc: 'Manage company cards & payments', roles: ['super_admin', 'admin'] },
        { icon: FileText, label: 'Payroll', path: '/payroll', desc: 'Staff salaries, advances & payouts', roles: ['super_admin', 'admin'] },
        { icon: Calculator, label: 'EMI Calculator', path: '/emi-calculator', desc: 'Calculate vehicle loan profiles', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
      ]
    },
    {
      title: "Fleet & Staff",
      color: "from-purple-500/20 to-pink-500/10 border-purple-500/25",
      items: [
        { icon: Truck, label: 'Truck Manager', path: '/truck-manager', desc: 'Track physical trucks & managers', roles: ['super_admin', 'admin', 'dispatcher', 'supervisor'] },
        { icon: FileBox, label: 'Vehicle Docs', path: '/truck-docs', desc: 'RC, Insurance & permit renewals', roles: ['super_admin', 'admin', 'dispatcher', 'supervisor'] },
        { icon: Users, label: 'Employees', path: '/employees', roles: ['super_admin', 'admin', 'manager', 'supervisor'] },
        { icon: FileBox, label: 'Employee Docs', path: '/employee-docs', desc: 'ID proofs, photos & driver documents', roles: ['super_admin', 'admin', 'supervisor'] },
        { icon: CalendarDays, label: 'Attendance', path: '/dashboard/attendance', desc: 'Daily attendance logs & cycles', roles: ['super_admin', 'admin', 'manager', 'supervisor'] },
      ]
    },
    {
      title: "Administration",
      color: "from-slate-500/20 to-zinc-500/10 border-slate-500/25",
      items: [
        { icon: Users, label: 'User Management', path: '/dashboard/users', desc: 'Portal system users & permissions', roles: ['super_admin', 'admin'] },
        { icon: FileText, label: 'Reports', path: '/reports', desc: 'Export full PDF & CSV fleet sheets', roles: ['super_admin', 'admin'] },
        { icon: Settings, label: 'Settings', path: '/dashboard/profile', desc: 'Personal profile & server options', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] },
        { icon: Mail, label: 'Business Mail', path: '/business-mail', desc: 'Communication portal inbox', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: Contact2, label: 'Contacts', path: '/contacts', desc: 'Vendors, drivers & staff listings', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: Users, label: 'Clients', path: '/clients', desc: 'Client account relations', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#070A13] text-white px-4 pt-4 pb-24 md:hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] tracking-widest font-black uppercase text-primary/80">Jai Bhavani Cargo</span>
          <h1 className="text-2xl font-black tracking-tight mt-0.5 flex items-center gap-1.5">
            App Hub <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-primary">
          {(currentUser?.full_name || 'U').charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search all functional modules..."
          className="w-full bg-slate-900/80 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      </div>

      {/* Module Hub Grid */}
      <div className="space-y-6">
        {menuGroups.map((group) => {
          // Filter items by role and search query
          const visibleItems = group.items.filter(item => 
            item.roles.includes(role) && 
            (searchQuery === '' || 
              item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
              item.desc.toLowerCase().includes(searchQuery.toLowerCase()))
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-3">
              <h2 className="text-xs font-black tracking-wider uppercase text-slate-500 px-1">
                {t(getTranslationKey(group.title))}
              </h2>

              <div className="grid grid-cols-1 gap-2.5">
                {visibleItems.map((item) => (
                  <div
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={`
                      flex items-center gap-3.5 p-3.5 rounded-2xl border bg-gradient-to-r
                      ${group.color} transition-all duration-300
                      active:scale-[0.98] active:translate-y-[1px]
                    `}
                  >
                    {/* Icon Box */}
                    <div className="w-10 h-10 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate leading-snug">
                        {t(getTranslationKey(item.label))}
                      </h3>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
