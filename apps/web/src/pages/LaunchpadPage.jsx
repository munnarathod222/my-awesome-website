import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { 
  LayoutDashboard, Users, Truck, CalendarDays, FileText, Settings, 
  MapPin, ClipboardList, CreditCard, Droplet, Wrench, BarChart3, 
  Bell, CheckSquare, FileBox, MessageSquare as MessageSquareWarning, 
  Contact2, PieChart, Calculator, TrendingUp, Mail, Search, Sparkles,
  ArrowRight, X
} from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [activeCategory, setActiveCategory] = useState('All');

  const menuGroups = useMemo(() => [
    {
      title: "Overview",
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/20 text-blue-400",
      iconColor: "text-blue-400 bg-blue-500/10",
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', desc: 'Real-time overview of fleet operations', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] },
        { icon: BarChart3, label: 'Analytics', path: '/analytics', desc: 'P&L reporting & financial matrices', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: CalendarDays, label: 'Calendar', path: '/calendar', desc: 'Monthly dispatch & compliance view', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] },
        { icon: PieChart, label: 'Client Analysis', path: '/client-analysis', desc: 'Revenue split and payment margins', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: TrendingUp, label: 'Trip Overview', path: '/dashboard/trip-overview', desc: 'Global route metrics & calculations', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: Bell, label: 'Reminders', path: '/reminders', desc: 'Stay updated on deadlines & actions', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] },
        { icon: CheckSquare, label: 'To-Do List', path: '/todo', desc: 'Personal task checklist manager', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] },
      ]
    },
    {
      title: "Operations",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-400",
      iconColor: "text-emerald-400 bg-emerald-500/10",
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
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-400",
      iconColor: "text-amber-400 bg-amber-500/10",
      items: [
        { icon: FileText, label: 'Cashbook', path: '/cashbook', desc: 'Petty cash balances & double entry', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: FileText, label: 'Expenses', path: '/expenses', desc: 'Track fleet and operational overheads', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: CreditCard, label: 'FASTag Management', path: '/fastag', desc: 'Truck balances, tolls & recharge history', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: MessageSquareWarning, label: 'Payment Requests', path: '/payment-requests', desc: 'Submit and approve vendor requests', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: CreditCard, label: 'Credit Cards', path: '/credit-cards', desc: 'Manage company cards & payments', roles: ['super_admin', 'admin'] },
        { icon: FileText, label: 'Payroll', path: '/payroll', desc: 'Staff salaries, advances & payouts', roles: ['super_admin', 'admin'] },
        { icon: Calculator, label: 'EMI Calculator', path: '/emi-calculator', desc: 'Calculate vehicle loan profiles', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
      ]
    },
    {
      title: "Fleet & Staff",
      color: "from-purple-500/20 to-pink-500/10 border-purple-500/20 text-purple-400",
      iconColor: "text-purple-400 bg-purple-500/10",
      items: [
        { icon: Truck, label: 'Truck Manager', path: '/truck-manager', desc: 'Track physical trucks & managers', roles: ['super_admin', 'admin', 'dispatcher', 'supervisor'] },
        { icon: FileBox, label: 'Vehicle Docs', path: '/truck-docs', desc: 'RC, Insurance & permit renewals', roles: ['super_admin', 'admin', 'dispatcher', 'supervisor'] },
        { icon: Users, label: 'Employees', path: '/employees', desc: 'Driver profiles and active staff directory', roles: ['super_admin', 'admin', 'manager', 'supervisor'] },
        { icon: FileBox, label: 'Employee Docs', path: '/employee-docs', desc: 'ID proofs, photos & driver documents', roles: ['super_admin', 'admin', 'supervisor'] },
        { icon: CalendarDays, label: 'Attendance', path: '/dashboard/attendance', desc: 'Daily attendance logs & cycles', roles: ['super_admin', 'admin', 'manager', 'supervisor'] },
      ]
    },
    {
      title: "Administration",
      color: "from-slate-500/20 to-zinc-500/10 border-slate-500/20 text-slate-400",
      iconColor: "text-slate-400 bg-slate-500/10",
      items: [
        { icon: Users, label: 'User Management', path: '/dashboard/users', desc: 'Portal system users & permissions', roles: ['super_admin', 'admin'] },
        { icon: FileText, label: 'Reports', path: '/reports', desc: 'Export full PDF & CSV fleet sheets', roles: ['super_admin', 'admin'] },
        { icon: Settings, label: 'Settings', path: '/dashboard/profile', desc: 'Personal profile & server options', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] },
        { icon: Mail, label: 'Business Mail', path: '/business-mail', desc: 'Communication portal inbox', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: Contact2, label: 'Contacts', path: '/contacts', desc: 'Vendors, drivers & staff listings', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: Users, label: 'Clients', path: '/clients', desc: 'Client account relations', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
      ]
    }
  ], []);

  const categories = ['All', 'Overview', 'Operations', 'Finance', 'Fleet & Staff', 'Administration'];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 350, damping: 25 } }
  };

  return (
    <div className="min-h-screen bg-[#070A13] text-white px-4 pt-4 pb-24 md:hidden">
      {/* Brand Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-[10px] tracking-widest font-black uppercase text-primary/80">Jai Bhavani Cargo</span>
          <h1 className="text-2xl font-black tracking-tight mt-0.5 flex items-center gap-1.5 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-primary">
            App Hub <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </h1>
        </div>
        <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center font-extrabold text-xs text-primary shadow-[0_0_15px_rgba(99,102,241,0.15)]">
          {(currentUser?.full_name || 'U').charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Modern App Search */}
      <div className="relative mb-5">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search modules (e.g. cashbook, tyre)..."
          className="w-full bg-slate-900/60 border border-white/5 rounded-2xl py-3 pl-11 pr-10 text-xs placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        {searchQuery && (
          <button 
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-slate-400"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setActiveCategory(cat);
              setSearchQuery('');
            }}
            className={`
              px-4 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all snap-align-start
              ${activeCategory === cat 
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105' 
                : 'bg-slate-900/80 border border-white/5 text-slate-400 hover:text-white'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* App grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {menuGroups.map((group) => {
          if (activeCategory !== 'All' && group.title !== activeCategory) return null;

          const visibleItems = group.items.filter(item => 
            item.roles.includes(role) && 
            (searchQuery === '' || 
              item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
              item.desc.toLowerCase().includes(searchQuery.toLowerCase()))
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-2.5">
              <h2 className="text-[10px] font-black tracking-widest uppercase text-slate-500 px-1">
                {t(getTranslationKey(group.title))}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {visibleItems.map((item) => (
                  <motion.div
                    key={item.label}
                    variants={itemVariants}
                    onClick={() => navigate(item.path)}
                    whileTap={{ scale: 0.96 }}
                    className={`
                      flex flex-col items-start p-3.5 rounded-2xl border bg-gradient-to-br
                      ${group.color} transition-all cursor-pointer relative overflow-hidden group/item
                      shadow-[0_4px_12px_rgba(0,0,0,0.1)]
                    `}
                  >
                    <div className="absolute right-0 bottom-0 w-16 h-16 rounded-full bg-white/5 blur-xl group-hover/item:bg-white/10 transition-colors" />

                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mb-3 border border-white/5 ${group.iconColor}`}>
                      <item.icon className="w-4.5 h-4.5" />
                    </div>

                    <div className="w-full mt-auto">
                      <h3 className="text-xs font-bold text-white leading-snug flex items-center justify-between">
                        {t(getTranslationKey(item.label))}
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 -translate-x-1 group-hover/item:translate-x-0 transition-all text-slate-400 shrink-0 ml-1" />
                      </h3>
                      <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5 font-medium leading-none">
                        {item.desc || 'Open module dashboard'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
