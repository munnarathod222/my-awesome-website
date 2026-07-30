import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import {
  LayoutDashboard, Users, Truck, CalendarDays, FileText, Settings,
  ChevronLeft, ChevronRight, LogOut, MapPin, ClipboardList, CreditCard,
  Droplet, Wrench, BarChart3, Bell, CheckSquare, FileBox,
  MessageSquare as MessageSquareWarning, Contact2, PieChart, Calculator,
  TrendingUp, Mail, Trophy, Package, ShieldCheck, ShieldAlert, Building2, UserPlus, Sparkles,
  Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils.js';
import pb from '@/lib/pocketbaseClient.js';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const GROUP_ICON = {
  Overview:       LayoutDashboard,
  Operations:     ClipboardList,
  Finance:        FileText,
  'Fleet & Staff': Truck,
  Communication:  Mail,
  Directory:      Contact2,
  Administration: Settings,
};

const GROUP_COLOR = {
  Overview:        'text-blue-400',
  Operations:      'text-emerald-400',
  Finance:         'text-amber-400',
  'Fleet & Staff': 'text-violet-400',
  Communication:   'text-cyan-400',
  Directory:       'text-rose-400',
  Administration:  'text-slate-400',
};

export default function Sidebar({ isExpanded, setIsExpanded }) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const role = currentUser?.role || 'user';
  const [showPodManagement, setShowPodManagement] = useState(false);

  const userInitials = ((currentUser?.full_name || currentUser?.name || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2));
  const userName = currentUser?.full_name || currentUser?.name || 'User';
  const roleLabel = (currentUser?.role || '').replace('_', ' ');

  useEffect(() => {
    pb.collection('clients').getList(1, 1, { filter: 'requires_pod = true', $autoCancel: false })
      .then(r => { if (r.items?.length > 0) setShowPodManagement(true); })
      .catch(() => {});
  }, []);

  const operationsItems = [
    { icon: Navigation,    label: 'Track Shipment',       path: '/tracking',          roles: ['super_admin','admin','dispatcher','manager','user'] },
    { icon: ClipboardList, label: 'Trip Logs',           path: '/trip-logs',        roles: ['super_admin','admin','manager','dispatcher'] },
    { icon: MapPin,        label: 'Route Master',         path: '/routes-master',    roles: ['super_admin','admin','dispatcher'] },
    { icon: FileText,      label: 'Quotes',               path: '/quotes-manager',   roles: ['super_admin','admin','manager'] },
    { icon: Droplet,       label: 'Fuel Tracker',         path: '/fuel-tracker',     roles: ['super_admin','admin','manager','dispatcher'] },
    { icon: Wrench,        label: 'Fleet Maintenance',    path: '/fleet-maintenance',roles: ['super_admin','admin','dispatcher'] },
    { icon: Package,       label: 'Inventory Management', path: '/inventory',        roles: ['super_admin','admin','manager','dispatcher'] },
  ];
  if (showPodManagement) {
    operationsItems.push({ icon: FileBox, label: 'POD Management', path: '/pod-management', roles: ['super_admin','admin','manager','dispatcher'] });
  }
  operationsItems.push({ icon: CheckSquare, label: 'Exit Audit', path: '/exit-audit', roles: ['super_admin','admin','manager','dispatcher'] });

  const menuGroups = [
    {
      title: 'Overview',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard',             path: '/dashboard',               roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { icon: Sparkles,        label: 'AI Freight Marketplace',path: '/marketplace',     roles: ['super_admin','admin','manager','dispatcher','supervisor','user'] },
        { icon: BarChart3,       label: 'Analytics',             path: '/analytics',               roles: ['super_admin','admin','manager'] },
        { icon: Calculator,      label: 'Vehicle TCO & ROI',     path: '/vehicle-tco',             roles: ['super_admin','admin','manager'] },
        { icon: CalendarDays,    label: 'Calendar',              path: '/calendar',                roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { icon: Trophy,          label: 'Leaderboard',           path: '/leaderboard',             roles: ['super_admin','admin','manager'] },
        { icon: PieChart,        label: 'Client Analysis',       path: '/client-analysis',         roles: ['super_admin','admin','manager'] },
        { icon: TrendingUp,      label: 'Trip Overview',         path: '/dashboard/trip-overview', roles: ['super_admin','admin','manager'] },
        { icon: Bell,            label: 'Reminders',             path: '/reminders',               roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { icon: CheckSquare,     label: 'To-Do List',            path: '/todo',                    roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
      ]
    },
    { title: 'Operations', items: operationsItems },
    {
      title: 'Finance',
      items: [
        { icon: ShieldAlert,          label: 'Insurance Manager', path: '/insurance-manager', roles: ['super_admin','admin','manager','dispatcher'] },
        { icon: ShieldCheck,          label: 'Company Vault',     path: '/company-vault',    roles: ['super_admin','admin','manager'] },
        { icon: FileText,             label: 'Cashbook',          path: '/cashbook',         roles: ['super_admin','admin','manager'] },
        { icon: FileText,             label: 'Expenses',          path: '/expenses',         roles: ['super_admin','admin','manager'] },
        { icon: CreditCard,           label: 'FASTag Management',  path: '/fastag',           roles: ['super_admin','admin','manager'] },
        { icon: MessageSquareWarning, label: 'Payment Requests',  path: '/payment-requests', roles: ['super_admin','admin','manager'] },
        { icon: CreditCard,           label: 'Credit Cards',      path: '/credit-cards',     roles: ['super_admin','admin'] },
        { icon: FileText,             label: 'Payroll',           path: '/payroll',          roles: ['super_admin','admin'] },
        { icon: Calculator,           label: 'EMI Calculator',    path: '/emi-calculator',   roles: ['super_admin','admin','manager'] },
      ]
    },
    {
      title: 'Fleet & Staff',
      items: [
        { icon: Truck,        label: 'Truck Manager',     path: '/truck-manager',        roles: ['super_admin','admin','dispatcher','supervisor'] },
        { icon: FileBox,      label: 'Vehicle Docs',      path: '/truck-docs',           roles: ['super_admin','admin','dispatcher','supervisor'] },
        { icon: Users,        label: 'Employees',         path: '/employees',            roles: ['super_admin','admin','manager','supervisor'] },
        { icon: FileBox,      label: 'Employee Docs',     path: '/employee-docs',        roles: ['super_admin','admin','supervisor'] },
        { icon: CalendarDays, label: 'Attendance',        path: '/dashboard/attendance', roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { icon: UserPlus,     label: 'Recruitment Portal',path: '/recruitment',          roles: ['super_admin','admin','manager'] },
      ]
    },
    {
      title: 'Communication',
      items: [
        { icon: Mail, label: 'Business Mail', path: '/business-mail', roles: ['super_admin','admin','manager','dispatcher'] },
      ]
    },
    {
      title: 'Directory',
      items: [
        { icon: Building2, label: 'Transport CRM',     path: '/transport-crm', roles: ['super_admin','admin','manager','dispatcher'] },
        { icon: Contact2,  label: 'Contacts Directory',path: '/contacts',      roles: ['super_admin','admin','manager','dispatcher'] },
        { icon: Users,     label: 'Clients List',      path: '/clients',       roles: ['super_admin','admin','manager'] },
      ]
    },
    {
      title: 'Administration',
      items: [
        { icon: Users,       label: 'User Management',     path: '/dashboard/users',      roles: ['superuser', 'super_admin', 'admin'] },
        { icon: ShieldCheck, label: 'Audit & Security Logs', path: '/dashboard/audit-logs', roles: ['superuser', 'super_admin'] },
        { icon: FileText,    label: 'Reports Center',      path: '/reports',              roles: ['super_admin','admin'] },
        { icon: Settings,    label: 'Settings',            path: '/dashboard/profile',    roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
      ]
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden md:flex flex-col z-20 h-full relative font-sans',
          'bg-[hsl(var(--sidebar-bg))] border-r border-white/[0.04]',
          'transition-[width] duration-300 ease-in-out',
          isExpanded ? 'w-[230px]' : 'w-[60px]'
        )}
        style={{ boxShadow: '2px 0 16px rgba(0,0,0,0.35)' }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between h-14 px-3 border-b border-white/[0.04]">
          {isExpanded ? (
            <Link to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-blue-600 flex items-center justify-center text-primary-foreground font-black text-xs shrink-0 shadow-md shadow-primary/20">
                JB
              </div>
              <div className="leading-none">
                <span className="font-extrabold text-sm tracking-tight text-white block">
                  Jai Bhavani
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase block mt-0.5">
                  Cargo Portal
                </span>
              </div>
            </Link>
          ) : (
            <Link to="/dashboard" className="mx-auto">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-blue-600 flex items-center justify-center text-primary-foreground font-black text-xs shadow-md shadow-primary/20">
                JB
              </div>
            </Link>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
              'text-muted-foreground/60 hover:text-foreground',
              'bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.04]',
              'transition-all duration-150',
              !isExpanded && 'mx-auto'
            )}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded
              ? <ChevronLeft className="w-3.5 h-3.5" />
              : <ChevronRight className="w-3.5 h-3.5" />
            }
          </button>
        </div>

        {/* ── Nav Items ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-none">
          <nav className="px-2 space-y-3.5">
            {menuGroups.map((group, idx) => {
              const isMasterSuperuser = currentUser?.email?.toLowerCase() === 'munnarathod222@gmail.com' || role === 'superuser' || role === 'super_admin';
              const visibleItems = group.items.filter(item => {
                if (isMasterSuperuser) return true;
                return (item?.roles || []).includes(role);
              });
              if (visibleItems.length === 0) return null;
              const GroupIcon = GROUP_ICON[group.title] || FileText;
              const groupColor = GROUP_COLOR[group.title] || 'text-muted-foreground';

              return (
                <div key={idx}>
                  {/* Group header */}
                  {isExpanded ? (
                    <div className="flex items-center gap-1.5 px-2 mb-1.5">
                      <GroupIcon className={cn('w-2.5 h-2.5 shrink-0', groupColor)} />
                      <span className={cn('text-[9.5px] font-extrabold tracking-[0.12em] uppercase', groupColor, 'opacity-70')}>
                        {group.title}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-center mb-1.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={cn('w-4 h-4 opacity-40', groupColor)}>
                            <GroupIcon className="w-full h-full" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs font-bold capitalize">
                          {group.title}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}

                  {/* Items List */}
                  <ul className="space-y-0.5">
                    {visibleItems.map((item, itemIdx) => {
                      const isActive =
                        location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                      return (
                        <li key={itemIdx}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                to={item.path}
                                className={cn(
                                  'flex items-center gap-2.5 rounded-lg transition-all duration-150 relative font-medium',
                                  isExpanded ? 'px-2.5 py-[7px]' : 'justify-center py-[7px] px-0',
                                  isActive
                                    ? 'bg-primary/10 text-primary border border-primary/20 font-bold'
                                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-white border border-transparent'
                                )}
                              >
                                {isActive && (
                                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-primary rounded-r-full shadow-sm shadow-primary/50" />
                                )}
                                <item.icon
                                  className={cn(
                                    'shrink-0 w-[15px] h-[15px] transition-colors duration-150',
                                    isActive ? 'text-primary' : 'text-slate-400 group-hover:text-white'
                                  )}
                                />
                                {isExpanded && (
                                  <span className={cn(
                                    'truncate text-[12px] leading-none',
                                    isActive ? 'text-primary font-bold' : ''
                                  )}>
                                    {item.label}
                                  </span>
                                )}
                              </Link>
                            </TooltipTrigger>
                            {!isExpanded && (
                              <TooltipContent side="right" className="text-xs font-bold">
                                {item.label}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </div>

        {/* ── Footer / User Profile ──────────────────────────────── */}
        <div className="p-2 border-t border-white/[0.04] shrink-0">
          {isExpanded ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.03]">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/30">
                  {userInitials}
                </div>
                <div className="truncate leading-tight">
                  <span className="text-xs font-bold text-white block truncate">
                    {userName}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono capitalize">
                    {roleLabel}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}