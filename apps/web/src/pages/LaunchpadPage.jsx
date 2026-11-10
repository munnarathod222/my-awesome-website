import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import {
  Truck, CircleDashed, FileBox, QrCode, Wrench, Droplet,
  ClipboardList, Navigation, MapPin, Package, CheckSquare,
  Building2, LayoutDashboard, Sparkles, BarChart3, TrendingUp,
  Calculator, PieChart, Trophy, IdCard, Receipt, FileText,
  AlertTriangle, CreditCard, ShieldAlert, ShieldCheck, Users,
  CalendarDays, UserPlus, Target, Contact2, Briefcase, Mail,
  Bell, Database, Settings, Search, X, ArrowRight
} from 'lucide-react';

export default function LaunchpadPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const tabsScrollRef = useRef(null);

  const goTo = (path) => {
    try {
      if (typeof navigate === 'function') {
        navigate(path);
        return;
      }
    } catch (e) {
      console.warn('Navigation error, fallback to location:', e);
    }
    window.location.href = path;
  };

  // 7 Complete Sidebar Sections matching all sidebar tabs with rich descriptions & colors
  const menuGroups = useMemo(() => [
    {
      id: 'main_analytics',
      title: 'Main & Analytics',
      shortTitle: 'Main',
      subtitle: 'Executive intelligence & fleet KPIs',
      icon: LayoutDashboard,
      accentColor: 'text-cyan-400',
      activeBg: 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25 border-cyan-400',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/30',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', desc: 'Real-time overview of fleet operations' },
        { icon: Sparkles, label: 'AI Freight Marketplace', path: '/marketplace', desc: 'AI load matching, corridor rates & shipper loads' },
        { icon: Target, label: 'Bidding Intelligence', path: '/bidding-intelligence', desc: 'Freight lane bids, benchmark rates & bidding logs' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics', desc: 'P&L reporting & financial matrices' },
        { icon: TrendingUp, label: 'Trip Overview', path: '/dashboard/trip-overview', desc: 'Global route metrics & calculations' },
        { icon: Calculator, label: 'Vehicle TCO & ROI', path: '/vehicle-tco', desc: 'Calculate vehicle loan profiles & TCO' },
        { icon: PieChart, label: 'Client Analysis', path: '/client-analysis', desc: 'Revenue split and payment margins' },
        { icon: Trophy, label: 'Leaderboard', path: '/leaderboard', desc: 'Top performing drivers leaderboard' },
        { icon: IdCard, label: 'Driver Scorecard', path: '/driver-scorecard', desc: 'Driver safety, fuel and performance metrics' }
      ]
    },
    {
      id: 'fleet_operations',
      title: 'Fleet & Operations',
      shortTitle: 'Fleet',
      subtitle: 'Vehicle logistics, trips, fuel & tracking',
      icon: Truck,
      accentColor: 'text-emerald-400',
      activeBg: 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/25 border-emerald-400',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
      items: [
        { icon: Truck, label: 'Truck Manager', path: '/truck-manager', desc: 'Track physical trucks & managers' },
        { icon: MapPin, label: 'GPS Tracking', path: '/gps', desc: 'Live vehicle telematics & geo-fencing' },
        { icon: CircleDashed, label: 'Tyres & Battery', path: '/tyres', desc: 'Track tyre serial numbers & replacement lifecycles' },
        { icon: FileBox, label: 'Vehicle Docs', path: '/truck-docs', desc: 'RC, Insurance & permit renewals' },
        { icon: QrCode, label: 'Vehicle QR Pass Hub', path: '/truck-docs?view=qr_pass', desc: 'Instant QR gate passes for security checkpoints' },
        { icon: Wrench, label: 'Fleet Maintenance', path: '/fleet-maintenance', desc: 'Servicing logs, problems & inventory' },
        { icon: Droplet, label: 'Fuel Tracker & AI Scanner', path: '/fuel-tracker', desc: 'Fuel purchases, efficiency KMPL & receipts' },
        { icon: ClipboardList, label: 'Trip Logs', path: '/trip-logs', desc: 'Manage & dispatch trip schedules' },
        { icon: Navigation, label: 'Track Shipment', path: '/tracking', desc: 'Live consignment tracking & ETA status' },
        { icon: MapPin, label: 'Route Master', path: '/routes-master', desc: 'Route rate configurations & origins' },
        { icon: Package, label: 'Inventory', path: '/inventory', desc: 'Manage spare parts stock levels' },
        { icon: FileBox, label: 'Lorry Receipts & POD', path: '/pod-management', desc: 'Official LR / Bilty generation & POD verification' },
        { icon: CheckSquare, label: 'Exit Audit', path: '/exit-audit', desc: 'Vehicle inspections before releases' }
      ]
    },
    {
      id: 'finance_accounts',
      title: 'Finance & Accounts',
      shortTitle: 'Finance',
      subtitle: 'Cashflow, expenses, tax, cards & payroll',
      icon: CreditCard,
      accentColor: 'text-amber-400',
      activeBg: 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 border-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
      items: [
        { icon: Receipt, label: 'Cashbook', path: '/cashbook', desc: 'Petty cash balances & double entry ledger' },
        { icon: FileText, label: 'Expenses', path: '/expenses', desc: 'Track fleet and operational overheads' },
        { icon: AlertTriangle, label: 'Payment Requests', path: '/payment-requests', desc: 'Submit and approve vendor requests' },
        { icon: CreditCard, label: 'FASTag Management', path: '/fastag', desc: 'Truck balances, tolls & recharge history' },
        { icon: CreditCard, label: 'Credit Cards', path: '/credit-cards', desc: 'Manage company cards & payments' },
        { icon: Receipt, label: 'GST ITC Tax', path: '/gst-itc', desc: 'Tax liabilities, credits and GST filings' },
        { icon: ShieldAlert, label: 'Insurance Manager', path: '/insurance-manager', desc: 'Fleet policy renewals, claims & broker rates' },
        { icon: ShieldCheck, label: 'Company Vault', path: '/company-vault', desc: 'Secure encrypted document & certificate storage' },
        { icon: Calculator, label: 'EMI Calculator', path: '/emi-calculator', desc: 'Calculate vehicle loan profiles & amortization' },
        { icon: FileText, label: 'Payroll', path: '/payroll', desc: 'Staff salaries, advances & monthly disbursements' },
        { icon: FileText, label: 'Quotes & B2B Contracts', path: '/quotes-manager', desc: 'B2B rate cards, proposals & quotation PDFs' }
      ]
    },
    {
      id: 'staff_hr',
      title: 'Staff & HR',
      shortTitle: 'HR',
      subtitle: 'Employees, drivers, attendance & recruitment',
      icon: Users,
      accentColor: 'text-violet-400',
      activeBg: 'bg-violet-500 text-slate-950 font-black shadow-lg shadow-violet-500/25 border-violet-400',
      badgeColor: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
      gradient: 'from-violet-500/20 via-purple-500/10 to-transparent border-violet-500/30',
      iconBg: 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
      items: [
        { icon: Users, label: 'Employees', path: '/employees', desc: 'Manage company workforce & designations' },
        { icon: FileBox, label: 'Employee Docs', path: '/employee-docs', desc: 'KYC records, Aadhaar, PAN & licences' },
        { icon: CalendarDays, label: 'Attendance Hub', path: '/dashboard/attendance', desc: 'Daily roll call, duty shifts & leaves' },
        { icon: UserPlus, label: 'Recruitment Portal', path: '/recruitment', desc: 'Driver hiring, interviews & test drives' }
      ]
    },
    {
      id: 'crm_partners',
      title: 'CRM & Partners',
      shortTitle: 'CRM',
      subtitle: 'Clients, vendors, brokers & directory',
      icon: Building2,
      accentColor: 'text-rose-400',
      activeBg: 'bg-rose-500 text-slate-950 font-black shadow-lg shadow-rose-500/25 border-rose-400',
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      gradient: 'from-rose-500/20 via-pink-500/10 to-transparent border-rose-500/30',
      iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
      items: [
        { icon: Users, label: 'Clients List', path: '/clients', desc: 'Corporate shippers, billing GST & addresses' },
        { icon: Building2, label: 'Vendor Registration Tracker', path: '/vendor-tracker', desc: 'New vendor onboarding & document status' },
        { icon: Building2, label: 'Transport CRM', path: '/transport-crm', desc: 'Broker accounts, rate contracts & deals' },
        { icon: Contact2, label: 'Contacts Directory', path: '/contacts', desc: 'Unified directory of clients, drivers & mechanics' }
      ]
    },
    {
      id: 'studio_tools',
      title: 'Studio & Tools',
      shortTitle: 'Tools',
      subtitle: 'Mail, calendar, tasks & backup',
      icon: Briefcase,
      accentColor: 'text-indigo-400',
      activeBg: 'bg-indigo-500 text-slate-950 font-black shadow-lg shadow-indigo-500/25 border-indigo-400',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      gradient: 'from-indigo-500/20 via-blue-500/10 to-transparent border-indigo-500/30',
      iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25',
      items: [
        { icon: Briefcase, label: 'Branding Hub', path: '/branding-hub', desc: 'Official letterheads, badges & company assets' },
        { icon: Mail, label: 'Business Mail', path: '/business-mail', desc: 'Communication portal & corporate mailboxes' },
        { icon: CalendarDays, label: 'Calendar', path: '/calendar', desc: 'Monthly dispatch schedules & compliance reminders' },
        { icon: Bell, label: 'Reminders', path: '/reminders', desc: 'Stay updated on vehicle & regulatory deadlines' },
        { icon: CheckSquare, label: 'To-Do List', path: '/todo', desc: 'Daily operational task checklist manager' },
        { icon: Database, label: 'Data Backup & Export', path: '/data-backup', desc: 'Export full PDF, Excel & CSV database dumps' }
      ]
    },
    {
      id: 'administration',
      title: 'Administration',
      shortTitle: 'Admin',
      subtitle: 'User access, audit logs & system config',
      icon: Settings,
      accentColor: 'text-slate-300',
      activeBg: 'bg-slate-200 text-slate-950 font-black shadow-lg shadow-white/10 border-white',
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
      gradient: 'from-slate-500/20 via-zinc-500/10 to-transparent border-slate-500/30',
      iconBg: 'bg-slate-800 text-slate-200 border border-slate-700',
      items: [
        { icon: Users, label: 'User Management', path: '/dashboard/users', desc: 'Portal system users, invitations & roles' },
        { icon: ShieldCheck, label: 'Audit & Security Logs', path: '/dashboard/audit-logs', desc: 'System event audits, logins & security tracking' },
        { icon: FileText, label: 'Reports Center', path: '/reports', desc: 'Comprehensive business reports & summaries' },
        { icon: Settings, label: 'Settings', path: '/dashboard/profile', desc: 'Personal profile, security & system options' }
      ]
    }
  ], []);

  // Display all groups and items unconditionally
  const allGroups = useMemo(() => {
    return menuGroups.map(group => ({
      ...group,
      count: group.items.length
    }));
  }, [menuGroups]);

  // Total modules count (51 full modules)
  const totalModulesCount = useMemo(() => {
    return allGroups.reduce((acc, g) => acc + g.count, 0);
  }, [allGroups]);

  // Filter groups & items by search query and active category tab
  const displayedGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allGroups
      .filter(group => {
        if (activeCategory === 'All') return true;
        return group.title === activeCategory || group.id === activeCategory;
      })
      .map(group => {
        if (!q) return group;
        const matchingItems = group.items.filter(item =>
          item.label.toLowerCase().includes(q) ||
          (item.desc && item.desc.toLowerCase().includes(q)) ||
          item.path.toLowerCase().includes(q)
        );
        return {
          ...group,
          items: matchingItems
        };
      })
      .filter(group => group.items.length > 0);
  }, [allGroups, searchQuery, activeCategory]);

  return (
    <div className="md:hidden min-h-screen bg-slate-950 text-slate-100 p-4 pb-28 font-sans select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            <span>Jai Bhavani Cargo</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">Operations Portal</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-0.5">
            App Hub <Sparkles className="w-4 h-4 text-amber-400 inline" />
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-mono font-bold text-cyan-400">
            {totalModulesCount} Modules
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-cyan-900/30">
            {((currentUser?.full_name || currentUser?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2))}
          </div>
        </div>
      </div>

      {/* Instant Search Bar */}
      <div className="relative mb-3.5">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search all modules (e.g. cashbook, tyres, bilty, lr)..."
          className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Tabs Bar: All 7 Sidebar Sections */}
      <div
        ref={tabsScrollRef}
        className="flex items-center gap-2 overflow-x-auto pb-2.5 pt-0.5 scrollbar-none mb-3 -mx-4 px-4 scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* 'All' Tab */}
        <button
          type="button"
          onClick={() => setActiveCategory('All')}
          className={'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ' + (
            activeCategory === 'All'
              ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25 border-cyan-400 scale-[1.02]'
              : 'bg-slate-900/90 text-slate-300 border-slate-800/80 hover:bg-slate-800 hover:text-white'
          )}
        >
          <span>All</span>
          <span className={'px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ' + (
            activeCategory === 'All' ? 'bg-black/20 text-slate-950' : 'bg-slate-800 text-slate-400'
          )}>
            {totalModulesCount}
          </span>
        </button>

        {/* 7 Sidebar Category Tabs */}
        {allGroups.map(cat => {
          const isActive = activeCategory === cat.title;
          const IconComp = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.title)}
              className={'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ' + (
                isActive
                  ? cat.activeBg + ' scale-[1.02]'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800/80 hover:bg-slate-800 hover:text-white'
              )}
            >
              <IconComp className={'w-3.5 h-3.5 ' + (isActive ? 'text-slate-950' : (cat.accentColor || 'text-slate-400'))} />
              <span>{cat.title}</span>
              <span className={'ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ' + (
                isActive ? 'bg-black/20 text-slate-950' : 'bg-slate-800 text-slate-400'
              )}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Banner Header when category selected */}
      {activeCategory !== 'All' && displayedGroups.length > 0 && (() => {
        const currentGroup = displayedGroups[0];
        const GroupIcon = currentGroup.icon;
        return (
          <div className={'p-3.5 mb-4 rounded-2xl border bg-gradient-to-r ' + currentGroup.gradient + ' flex items-center justify-between shadow-lg'}>
            <div className="flex items-center gap-3">
              <div className={'w-10 h-10 rounded-xl flex items-center justify-center ' + currentGroup.iconBg}>
                <GroupIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white leading-tight">
                  {currentGroup.title}
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {currentGroup.subtitle}
                </p>
              </div>
            </div>
            <div className={'px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold ' + currentGroup.badgeColor}>
              {currentGroup.items.length} {currentGroup.items.length === 1 ? 'module' : 'modules'}
            </div>
          </div>
        );
      })()}

      {/* Empty Search State */}
      {displayedGroups.length === 0 && (
        <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/50 border border-slate-800 mt-4">
          <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No modules found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            No matching modules for "{searchQuery}" in {activeCategory}.
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            className="mt-4 px-4 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Module Cards Grid */}
      <div className="space-y-6">
        {displayedGroups.map(group => {
          return (
            <div key={group.id} className="space-y-2.5">
              {/* If viewing All, show group header */}
              {activeCategory === 'All' && (
                <div className="flex items-center justify-between px-1 pt-1">
                  <div className="flex items-center gap-2">
                    <span className={'w-2 h-2 rounded-full ' + (
                      group.id === 'main_analytics' ? 'bg-cyan-400' :
                      group.id === 'fleet_operations' ? 'bg-emerald-400' :
                      group.id === 'finance_accounts' ? 'bg-amber-400' :
                      group.id === 'staff_hr' ? 'bg-violet-400' :
                      group.id === 'crm_partners' ? 'bg-rose-400' :
                      group.id === 'studio_tools' ? 'bg-indigo-400' : 'bg-slate-400'
                    )} />
                    <h2 className="text-[11px] font-black tracking-wider uppercase text-slate-300">
                      {group.title}
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">
                    {group.items.length} {group.items.length === 1 ? 'tab' : 'tabs'}
                  </span>
                </div>
              )}

              {/* 2-Column Responsive Card Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {group.items.map(item => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={item.path + item.label}
                      onClick={() => goTo(item.path)}
                      role="link"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          goTo(item.path);
                        }
                      }}
                      className={'flex flex-col items-start p-3 rounded-2xl border bg-gradient-to-br ' + group.gradient + ' transition-all cursor-pointer relative overflow-hidden group/item active:scale-[0.97] shadow-sm hover:shadow-md hover:border-slate-700'}
                    >
                      {/* Overlay link for guaranteed mobile touch and click navigation */}
                      <a
                        href={item.path}
                        onClick={(e) => {
                          e.preventDefault();
                          goTo(item.path);
                        }}
                        className="absolute inset-0 z-10 block"
                        aria-label={item.label}
                      />

                      {/* Icon & Arrow */}
                      <div className="w-full flex items-center justify-between mb-2 pointer-events-none">
                        <div className={'w-8 h-8 rounded-xl flex items-center justify-center ' + group.iconBg}>
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover/item:text-slate-300 transition-colors" />
                      </div>

                      {/* Title & Desc */}
                      <div className="w-full mt-auto pointer-events-none">
                        <h3 className="text-xs font-bold text-white leading-tight line-clamp-1">
                          {item.label}
                        </h3>
                        <p className="text-[9.5px] text-slate-400 line-clamp-2 mt-1 leading-snug font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
