import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import {
  LayoutDashboard, Users, Truck, CalendarDays, FileText, Settings,
  ChevronLeft, ChevronRight, LogOut, MapPin, ClipboardList, CreditCard,
  Droplet, Wrench, BarChart3, Bell, CheckSquare, FileBox,
  MessageSquare as MessageSquareWarning, Contact2, PieChart, Calculator,
  TrendingUp, Mail, Trophy, Package
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

// Icon for each group title (shown when collapsed)
const GROUP_ICON = {
  Overview:       LayoutDashboard,
  Operations:     ClipboardList,
  Finance:        FileText,
  'Fleet & Staff': Truck,
  Communication:  Mail,
  Directory:      Contact2,
  Administration: Settings,
};

// Colour accent per group
const GROUP_COLOR = {
  Overview:       'text-blue-400',
  Operations:     'text-emerald-400',
  Finance:        'text-amber-400',
  'Fleet & Staff':'text-violet-400',
  Communication:  'text-cyan-400',
  Directory:      'text-rose-400',
  Administration: 'text-slate-400',
};

export default function Sidebar({ isExpanded, setIsExpanded }) {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const role = currentUser?.role || 'user';
  const [showPodManagement, setShowPodManagement] = useState(false);

  const userInitials = ((currentUser?.full_name || currentUser?.name || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2));
  const roleLabel = (currentUser?.role || '').replace('_', ' ');

  useEffect(() => {
    pb.collection('clients').getList(1, 1, { filter: 'requires_pod = true', $autoCancel: false })
      .then(r => { if (r.items?.length > 0) setShowPodManagement(true); })
      .catch(() => {});
  }, []);

  const operationsItems = [
    { icon: ClipboardList, label: 'Trip Logs',           path: '/trip-logs',           roles: ['super_admin','admin','manager','dispatcher'] },
    { icon: MapPin,        label: 'Route Master',         path: '/routes-master',        roles: ['super_admin','admin','dispatcher'] },
    { icon: FileText,      label: 'Quotes',               path: '/quotes-manager',       roles: ['super_admin','admin','manager'] },
    { icon: Droplet,       label: 'Fuel Tracker',         path: '/fuel-tracker',         roles: ['super_admin','admin','manager','dispatcher'] },
    { icon: Wrench,        label: 'Fleet Maintenance',    path: '/fleet-maintenance',    roles: ['super_admin','admin','dispatcher'] },
    { icon: Package,       label: 'Inventory Management', path: '/inventory',            roles: ['super_admin','admin','manager','dispatcher'] },
  ];
  if (showPodManagement) {
    operationsItems.push({ icon: FileBox, label: 'POD', path: '/pod-management', roles: ['super_admin','admin','manager','dispatcher'] });
  }
  operationsItems.push({ icon: CheckSquare, label: 'Exit Audit', path: '/exit-audit', roles: ['super_admin','admin','manager','dispatcher'] });

  const menuGroups = [
    {
      title: 'Overview',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard',    path: '/dashboard',               roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { icon: BarChart3,       label: 'Analytics',    path: '/analytics',               roles: ['super_admin','admin','manager','dispatcher'] },
        { icon: CalendarDays,    label: 'Calendar',     path: '/calendar',                roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { icon: Trophy,          label: 'Leaderboard',  path: '/leaderboard',             roles: ['super_admin','admin','manager','dispatcher'] },
        { icon: PieChart,        label: 'Client Analysis', path: '/client-analysis',      roles: ['super_admin','admin','manager','dispatcher'] },
        { icon: TrendingUp,      label: 'Trip Overview',path: '/dashboard/trip-overview', roles: ['super_admin','admin','manager','dispatcher'] },
        { icon: Bell,            label: 'Reminders',    path: '/reminders',               roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { icon: CheckSquare,     label: 'To-Do List',   path: '/todo',                    roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
      ]
    },
    { title: 'Operations', items: operationsItems },
    {
      title: 'Finance',
      items: [
        { icon: FileText,              label: 'Cashbook',         path: '/cashbook',          roles: ['super_admin','admin','manager','dispatcher'] },
        { icon: FileText,              label: 'Expenses',         path: '/expenses',           roles: ['super_admin','admin','manager','dispatcher'] },
        { icon: MessageSquareWarning,  label: 'Payment Requests', path: '/payment-requests',  roles: ['super_admin','admin','manager','dispatcher'] },
        { icon: CreditCard,            label: 'Credit Cards',     path: '/credit-cards',       roles: ['super_admin','admin'] },
        { icon: FileText,              label: 'Payroll',          path: '/payroll',            roles: ['super_admin','admin'] },
        { icon: Calculator,            label: 'EMI Calculator',   path: '/emi-calculator',     roles: ['super_admin','admin','manager','dispatcher'] },
      ]
    },
    {
      title: 'Fleet & Staff',
      items: [
        { icon: Truck,       label: 'Truck Manager', path: '/truck-manager',       roles: ['super_admin','admin','dispatcher','supervisor'] },
        { icon: FileBox,     label: 'Vehicle Docs',  path: '/truck-docs',          roles: ['super_admin','admin','dispatcher','supervisor'] },
        { icon: Users,       label: 'Employees',     path: '/employees',           roles: ['super_admin','admin','manager','supervisor'] },
        { icon: FileBox,     label: 'Employee Docs', path: '/employee-docs',       roles: ['super_admin','admin','supervisor'] },
        { icon: CalendarDays,label: 'Attendance',    path: '/dashboard/attendance',roles: ['super_admin','admin','manager','supervisor'] },
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
        { icon: Contact2, label: 'Contacts', path: '/contacts', roles: ['super_admin','admin','manager','dispatcher'] },
        { icon: Users,    label: 'Clients',  path: '/clients',  roles: ['super_admin','admin','manager','dispatcher'] },
      ]
    },
    {
      title: 'Administration',
      items: [
        { icon: Users,    label: 'User Management', path: '/dashboard/users',   roles: ['super_admin','admin'] },
        { icon: FileText, label: 'Reports',          path: '/reports',           roles: ['super_admin','admin'] },
        { icon: Settings, label: 'Settings',         path: '/dashboard/profile', roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
      ]
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden md:flex bg-[hsl(var(--sidebar-bg))]/90 backdrop-blur-md border-r border-white/5 transition-all duration-300 flex-col z-20 h-full relative shadow-2xl',
          isExpanded ? 'w-[230px]' : 'w-[68px]'
        )}
      >
        {/* Top toggle */}
        <div className="flex items-center justify-between px-3 border-b border-white/5 h-14 shrink-0">
          {isExpanded && (
            <div className="flex items-center gap-2 ml-1 overflow-hidden">
              <img src="/logo.png" className="h-8 w-auto object-contain rounded-lg" alt="Jai Bhavani Logo" />
            </div>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'p-1.5 rounded-lg bg-white/5 text-[hsl(var(--sidebar-text-muted))] hover:bg-primary/20 hover:text-primary transition-all duration-200 shrink-0',
              !isExpanded && 'mx-auto'
            )}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
          <nav className="space-y-5 px-2">
            {menuGroups.map((group, idx) => {
              const visibleItems = group.items.filter(item => item.roles.includes(role));
              if (visibleItems.length === 0) return null;
              const GroupIcon = GROUP_ICON[group.title] || FileText;
              const groupColor = GROUP_COLOR[group.title] || 'text-muted-foreground';

              return (
                <div key={idx}>
                  {isExpanded ? (
                    <h3 className={cn('px-2 mb-1.5 text-[9px] font-extrabold tracking-[0.15em] uppercase flex items-center gap-2', groupColor, 'opacity-70')}>
                      <GroupIcon className="w-3 h-3 shrink-0" />
                      {t(key(group.title))}
                    </h3>
                  ) : (
                    <div className="flex justify-center mb-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={cn('w-5 h-5 shrink-0 opacity-40', groupColor)}>
                            <GroupIcon className="w-full h-full" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs font-semibold capitalize">
                          {group.title}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}

                  <ul className="space-y-0.5">
                    {visibleItems.map((item, itemIdx) => {
                      const isActive = location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                      return (
                        <li key={itemIdx}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                to={item.path}
                                className={cn(
                                  'flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-200 relative group border border-transparent',
                                  isActive
                                    ? 'bg-primary/12 text-primary font-semibold border-primary/20 shadow-[0_0_12px_rgba(99,102,241,0.1)]'
                                    : 'text-[hsl(var(--sidebar-text))] hover:bg-white/5 hover:text-primary',
                                  !isExpanded && 'justify-center px-0'
                                )}
                              >
                                {isActive && (
                                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-primary rounded-r-full shadow-[0_0_8px_hsl(var(--primary))]" />
                                )}
                                <item.icon className={cn(
                                  'shrink-0 transition-all duration-200',
                                  isActive ? 'w-[18px] h-[18px] text-primary' : 'w-[18px] h-[18px] text-[hsl(var(--sidebar-text-muted))] group-hover:text-primary group-hover:scale-110'
                                )} />
                                {isExpanded && (
                                  <span className="truncate text-[12.5px]">{t(key(item.label))}</span>
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
                </div>
              );
            })}
          </nav>
        </div>

        {/* User footer */}
        <div className={cn('border-t border-white/5 p-3 shrink-0 space-y-2')}>
          {isExpanded && (
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-white/4 border border-white/5">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-[11px] font-black shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-foreground truncate">
                  {currentUser?.full_name || currentUser?.name || 'User'}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">{roleLabel}</p>
              </div>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className={cn(
                  'flex items-center gap-3 w-full px-2.5 py-2 text-[hsl(var(--sidebar-text-muted))] hover:bg-destructive/10 hover:text-rose-400 rounded-xl border border-transparent hover:border-destructive/20 transition-all duration-200 text-[12.5px] font-medium',
                  !isExpanded && 'justify-center px-0'
                )}
              >
                <LogOut className="w-[18px] h-[18px] shrink-0" />
                {isExpanded && <span>{t('logout')}</span>}
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