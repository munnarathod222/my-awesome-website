import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import {
  LayoutDashboard, Users, Truck, CalendarDays, FileText, Settings,
  ChevronLeft, ChevronRight, LogOut, MapPin, ClipboardList, CreditCard,
  Droplet, Wrench, BarChart3, Bell, CheckSquare, FileBox,
  MessageSquare as MessageSquareWarning, Contact2, PieChart, Calculator,
  TrendingUp, Mail, Trophy, Package, ShieldCheck, ShieldAlert, Building2, UserPlus, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils.js';
import pb from '@/lib/pocketbaseClient.js';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const key = (label) => {
  if (label === 'To-Do List') return 'todo_list';
  if (label === 'Inventory Management') return 'inventory';
  if (label === 'Fleet & Staff') return 'fleet_staff';
  return label.toLowerCase().replace(/[\s&]+/g, '_').trim();
};

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

const GROUP_BG = {
  Overview:        'bg-blue-500/10',
  Operations:      'bg-emerald-500/10',
  Finance:         'bg-amber-500/10',
  'Fleet & Staff': 'bg-violet-500/10',
  Communication:   'bg-cyan-500/10',
  Directory:       'bg-rose-500/10',
  Administration:  'bg-slate-500/10',
};

export default function Sidebar({ isExpanded, setIsExpanded }) {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
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
    { icon: ClipboardList, label: 'Trip Logs',           path: '/trip-logs',        roles: ['super_admin','admin','manager','dispatcher'] },
    { icon: MapPin,        label: 'Route Master',         path: '/routes-master',    roles: ['super_admin','admin','dispatcher'] },
    { icon: FileText,      label: 'Quotes',               path: '/quotes-manager',   roles: ['super_admin','admin','manager'] },
    { icon: Droplet,       label: 'Fuel Tracker',         path: '/fuel-tracker',     roles: ['super_admin','admin','manager','dispatcher'] },
    { icon: Wrench,        label: 'Fleet Maintenance',    path: '/fleet-maintenance',roles: ['super_admin','admin','dispatcher'] },
    { icon: Package,       label: 'Inventory',            path: '/inventory',        roles: ['super_admin','admin','manager','dispatcher'] },
  ];
  if (showPodManagement) {
    operationsItems.push({ icon: FileBox, label: 'POD', path: '/pod-management', roles: ['super_admin','admin','manager','dispatcher'] });
  }
  operationsItems.push({ icon: CheckSquare, label: 'Exit Audit', path: '/exit-audit', roles: ['super_admin','admin','manager','dispatcher'] });

  const menuGroups = [
    {
      title: 'Overview',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard',      path: '/dashboard',               roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { icon: Sparkles,        label: 'AI Freight Marketplace', path: '/marketplace',     roles: ['super_admin','admin','manager','dispatcher','supervisor','user'] },
        { icon: BarChart3,       label: 'Analytics',      path: '/analytics',               roles: ['super_admin','admin','manager'] },
        { icon: Calculator,      label: 'Vehicle TCO & ROI',path: '/vehicle-tco',             roles: ['super_admin','admin','manager'] },
        { icon: CalendarDays,    label: 'Calendar',       path: '/calendar',                roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { icon: Trophy,          label: 'Leaderboard',    path: '/leaderboard',             roles: ['super_admin','admin','manager'] },
        { icon: PieChart,        label: 'Client Analysis',path: '/client-analysis',         roles: ['super_admin','admin','manager'] },
        { icon: TrendingUp,      label: 'Trip Overview',  path: '/dashboard/trip-overview', roles: ['super_admin','admin','manager'] },
        { icon: Bell,            label: 'Reminders',      path: '/reminders',               roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { icon: CheckSquare,     label: 'To-Do List',     path: '/todo',                    roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
      ]
    },
    { title: 'Operations', items: operationsItems },
    {
      title: 'Finance',
      items: [
        { icon: ShieldAlert,          label: 'Insurance Manager',path: '/insurance-manager', roles: ['super_admin','admin','manager','dispatcher'] },
        { icon: ShieldCheck,          label: 'Company Vault',    path: '/company-vault',    roles: ['super_admin','admin','manager'] },
        { icon: FileText,             label: 'Cashbook',         path: '/cashbook',         roles: ['super_admin','admin','manager'] },
        { icon: FileText,             label: 'Expenses',         path: '/expenses',         roles: ['super_admin','admin','manager'] },
        { icon: CreditCard,           label: 'FASTag Management', path: '/fastag',           roles: ['super_admin','admin','manager'] },
        { icon: MessageSquareWarning, label: 'Payment Requests', path: '/payment-requests', roles: ['super_admin','admin','manager'] },
        { icon: CreditCard,           label: 'Credit Cards',     path: '/credit-cards',     roles: ['super_admin','admin'] },
        { icon: FileText,             label: 'Payroll',          path: '/payroll',          roles: ['super_admin','admin'] },
        { icon: Calculator,           label: 'EMI Calculator',   path: '/emi-calculator',   roles: ['super_admin','admin','manager'] },
      ]
    },
    {
      title: 'Fleet & Staff',
      items: [
        { icon: Truck,        label: 'Truck Manager', path: '/truck-manager',        roles: ['super_admin','admin','dispatcher','supervisor'] },
        { icon: FileBox,      label: 'Vehicle Docs',  path: '/truck-docs',           roles: ['super_admin','admin','dispatcher','supervisor'] },
        { icon: Users,        label: 'Employees',     path: '/employees',            roles: ['super_admin','admin','manager','supervisor'] },
        { icon: FileBox,      label: 'Employee Docs', path: '/employee-docs',        roles: ['super_admin','admin','supervisor'] },
        { icon: CalendarDays, label: 'Attendance',    path: '/dashboard/attendance', roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { icon: UserPlus,     label: 'Recruitment',   path: '/recruitment',          roles: ['super_admin','admin','manager'] },
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
        { icon: Building2, label: 'Transport CRM', path: '/transport-crm', roles: ['super_admin','admin','manager','dispatcher'] },
        { icon: Contact2, label: 'Contacts', path: '/contacts', roles: ['super_admin','admin','manager','dispatcher'] },
        { icon: Users,    label: 'Clients',  path: '/clients',  roles: ['super_admin','admin','manager'] },
      ]
    },
    {
      title: 'Administration',
      items: [
        { icon: Users,       label: 'User Management',     path: '/dashboard/users',      roles: ['superuser', 'super_admin', 'admin'] },
        { icon: ShieldCheck, label: 'Audit & Security Logs', path: '/dashboard/audit-logs', roles: ['superuser', 'super_admin'] },
        { icon: FileText,    label: 'Reports',             path: '/reports',              roles: ['super_admin','admin'] },
        { icon: Settings,    label: 'Settings',            path: '/dashboard/profile',    roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
      ]
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden md:flex flex-col z-20 h-full relative',
          'bg-[hsl(var(--sidebar-bg))] border-r border-white/[0.04]',
          'transition-[width] duration-300 ease-in-out',
          isExpanded ? 'w-[220px]' : 'w-[60px]'
        )}
        style={{ boxShadow: '2px 0 16px rgba(0,0,0,0.35)' }}
      >

        {/* ── Brand + toggle ──────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 border-b border-white/[0.04] h-[57px] shrink-0">
          {isExpanded && (
            <div className="flex items-center gap-2.5 ml-0.5 overflow-hidden">
              {/* Coloured monogram */}
              <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/25 flex items-center justify-center shrink-0">
                <span className="text-primary text-[11px] font-black">JB</span>
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-foreground tracking-tight leading-none truncate">Jai Bhavani</p>
                <p className="text-[9px] text-muted-foreground/70 leading-none mt-0.5 truncate">Cargo</p>
              </div>
            </div>
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

        {/* ── Nav ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 hide-scrollbar">
          <nav className="px-2 space-y-3.5">
            {menuGroups.map((group, idx) => {
              const isMasterSuperuser = currentUser?.email?.toLowerCase() === 'munnarathod222@gmail.com' || role === 'superuser' || role === 'super_admin';
              const visibleItems = group.items.filter(item => {
                if (isMasterSuperuser) return true;
                return item.roles.includes(role);
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
                      <span className={cn('text-[9.5px] font-bold tracking-[0.12em] uppercase', groupColor, 'opacity-60')}>
                        {t(key(group.title))}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-center mb-1.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={cn('w-4 h-4 opacity-35', groupColor)}>
                            <GroupIcon className="w-full h-full" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs font-semibold capitalize">
                          {group.title}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}

                  {/* Items */}
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
                                  'flex items-center gap-2.5 rounded-lg transition-all duration-150 relative',
                                  isExpanded ? 'px-2.5 py-[7px]' : 'justify-center py-[7px] px-0',
                                  isActive
                                    ? 'bg-primary/10 text-primary border border-primary/15'
                                    : 'text-[hsl(var(--sidebar-text-muted))] hover:bg-white/[0.04] hover:text-foreground border border-transparent'
                                )}
                              >
                                {/* Active indicator */}
                                {isActive && (
                                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-3.5 bg-primary rounded-r-full" />
                                )}
                                <item.icon
                                  className={cn(
                                    'shrink-0 w-[15px] h-[15px] transition-colors duration-150',
                                    isActive ? 'text-primary' : 'text-[hsl(var(--sidebar-text-muted))] group-hover:text-foreground'
                                  )}
                                />
                                {isExpanded && (
                                  <span className={cn(
                                    'truncate text-[12px] font-medium leading-none',
                                    isActive ? 'text-primary font-semibold' : ''
                                  )}>
                                    {t(key(item.label))}
                                  </span>
                                )}
                              </Link>
                            </TooltipTrigger>
                            {!isExpanded && (
                              <TooltipContent side="right" className="text-xs font-semibold">
                                {item.label}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Separator between groups */}
                  {idx < menuGroups.length - 1 && isExpanded && (
                    <div className="mx-2 mt-3 border-t border-white/[0.04]" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* ── User footer ─────────────────────────────────────── */}
        <div className="border-t border-white/[0.04] p-2 shrink-0 space-y-1">
          {/* User pill */}
          {isExpanded && (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04] mb-1">
              <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-primary text-[10px] font-black shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-semibold text-foreground truncate leading-none">{userName}</p>
                <p className="text-[9px] text-muted-foreground/70 capitalize mt-0.5 leading-none">{roleLabel}</p>
              </div>
            </div>
          )}

          {/* Logout */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className={cn(
                  'flex items-center gap-2.5 w-full rounded-lg transition-all duration-150',
                  'text-muted-foreground/50 hover:text-rose-400 hover:bg-rose-500/[0.07]',
                  'border border-transparent hover:border-rose-500/15',
                  isExpanded ? 'px-2.5 py-[7px]' : 'justify-center py-[7px] px-0'
                )}
              >
                <LogOut className="w-[15px] h-[15px] shrink-0" />
                {isExpanded && <span className="text-[12px] font-medium">{t('logout')}</span>}
              </button>
            </TooltipTrigger>
            {!isExpanded && (
              <TooltipContent side="right" className="text-xs font-semibold">Logout</TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}