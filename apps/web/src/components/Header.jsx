import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Globe, Bell, ChevronRight, Home, Building2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess.js';
import { cn } from '@/lib/utils.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import pb from '@/lib/pocketbaseClient.js';

// ── Breadcrumb resolver ───────────────────────────────────────────────────────
const ROUTE_LABELS = {
  '/dashboard':              'Dashboard',
  '/analytics':              'Analytics',
  '/trip-logs':              'Trip Logs',
  '/truck-manager':          'Truck Manager',
  '/truck-docs':             'Vehicle Docs',
  '/cashbook':               'Cashbook',
  '/expenses':               'Expenses',
  '/employees':              'Employees',
  '/employee-docs':          'Employee Docs',
  '/payroll':                'Payroll',
  '/routes-master':          'Route Master',
  '/fuel-tracker':           'Fuel Tracker',
  '/fleet-maintenance':      'Fleet Maintenance',
  '/inventory':              'Inventory',
  '/pod-management':         'POD Management',
  '/exit-audit':             'Exit Audit',
  '/payment-requests':       'Payment Requests',
  '/credit-cards':           'Credit Cards',
  '/emi-calculator':         'EMI Calculator',
  '/leaderboard':            'Leaderboard',
  '/client-analysis':        'Client Analysis',
  '/reminders':              'Reminders',
  '/todo':                   'To-Do List',
  '/contacts':               'Contacts',
  '/clients':                'Clients',
  '/business-mail':          'Business Mail',
  '/reports':                'Reports',
  '/dashboard/users':        'User Management',
  '/dashboard/profile':      'Settings',
  '/dashboard/attendance':   'Attendance',
  '/dashboard/trip-overview':'Trip Overview',
  '/quotes-manager':         'Quotes',
};

function useBreadcrumbs(pathname) {
  return ROUTE_LABELS[pathname] ||
    ROUTE_LABELS[Object.keys(ROUTE_LABELS).find(k => pathname.startsWith(k))] || '';
}

// ── Language selector ─────────────────────────────────────────────────────────
const LangSelector = ({ compact, language, setLanguage }) => (
  <div className={cn(
    'flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03]',
    compact ? 'px-1.5 py-0.5' : 'px-2 py-1'
  )}>
    <Globe className="w-3 h-3 text-muted-foreground/60 shrink-0" />
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className={cn(
        'bg-transparent border-none shadow-none focus:ring-0 font-medium text-foreground',
        compact ? 'h-5 w-[40px] px-0.5 text-[10px]' : 'h-6 w-[72px] px-1 text-[11px]'
      )}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{compact ? 'EN' : 'English'}</SelectItem>
        <SelectItem value="hi">{compact ? 'HI' : 'हिन्दी'}</SelectItem>
        <SelectItem value="mr">{compact ? 'MR' : 'मराठी'}</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

// ── Main Header ───────────────────────────────────────────────────────────────
export default function Header() {
  const { isAuthenticated, logout, currentUser } = useAuth();
  const { isAdmin, isManager, isDispatcher, isSuperAdmin } = useRoleBasedAccess();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const pageLabel = useBreadcrumbs(location.pathname);
  const [pendingCount, setPendingCount] = useState(0);

  const handleLogout = () => { logout(); navigate('/'); };

  const userInitials = ((currentUser?.full_name || currentUser?.name || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2));

  useEffect(() => {
    if (!isAdmin && !isSuperAdmin) return;
    pb.collection('signup_requests').getList(1, 1, {
      filter: 'status = "Pending"',
      $autoCancel: false,
    }).then(r => setPendingCount(r.totalItems)).catch(() => {});
  }, [isAdmin, isSuperAdmin]);

  return (
    <>
      {/* ── Desktop header ──────────────────────────────────────────────────── */}
      <header className={cn(
        'sticky top-0 z-50 w-full',
        'bg-[#070a13]/80 backdrop-blur-xl',
        'border-b border-white/[0.05]',
        'transition-all duration-200',
        isAuthenticated ? 'hidden md:block' : 'block'
      )}>
        <div className="max-w-7xl mx-auto flex h-[57px] items-center px-5 gap-4">

          {/* Brand */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-2 group shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
              <span className="text-primary text-[11px] font-black">JB</span>
            </div>
            <span className="font-bold text-[13px] text-foreground/90 tracking-tight group-hover:text-foreground transition-colors">
              Jai Bhavani Cargo
            </span>
          </Link>

          {/* Breadcrumb — authenticated only */}
          {isAuthenticated && pageLabel && (
            <div className="hidden md:flex items-center gap-1 text-[11px] text-muted-foreground/60 font-medium ml-1">
              <Home className="w-3 h-3" />
              <ChevronRight className="w-2.5 h-2.5 opacity-40" />
              <span className="text-foreground/80 font-semibold">{pageLabel}</span>
            </div>
          )}

          {/* Desktop nav — public pages */}
          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-0.5 flex-1 px-4">
              {[
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/truck-manager', label: 'Trucks' },
                { to: '/trip-logs', label: 'Trips' },
                { to: '/cashbook', label: 'Cashbook' },
                ...(isAdmin || isManager || isDispatcher ? [{ to: '/analytics', label: 'Analytics' }] : []),
              ].map(({ to, label }) => {
                const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      'px-3 py-1.5 text-[12.5px] font-medium rounded-lg transition-all duration-150',
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/15'
                        : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right side controls */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {!isAuthenticated ? (
              <>
                <Button asChild size="sm" variant="outline" className="rounded-lg text-[12px] h-8 px-3 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-semibold gap-1.5">
                  <Link to="/client-login">
                    <Building2 className="w-3.5 h-3.5" /> Client Login
                  </Link>
                </Button>
                <Link
                  to="/login"
                  className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block ml-1"
                >
                  Admin Login
                </Link>
                <Button asChild size="sm" className="rounded-lg text-[12.5px] h-8 px-3.5 shadow-sm">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <LangSelector compact={false} language={language} setLanguage={setLanguage} />

                {/* Bell */}
                {(isAdmin || isSuperAdmin) && (
                  <button
                    onClick={() => navigate('/dashboard/users?tab=signup-requests')}
                    className={cn(
                      'relative w-8 h-8 rounded-lg flex items-center justify-center',
                      'bg-white/[0.03] border border-white/[0.06]',
                      'text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.07]',
                      'transition-all duration-150'
                    )}
                    aria-label="Pending requests"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-md">
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </span>
                    )}
                  </button>
                )}

                {/* User chip */}
                <div className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-lg',
                  'bg-white/[0.03] border border-white/[0.06]'
                )}>
                  <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-primary text-[9px] font-black shrink-0">
                    {userInitials}
                  </div>
                  <span className="text-[12px] font-medium text-foreground/85 max-w-[110px] truncate">
                    {currentUser?.full_name || currentUser?.name || 'User'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    'bg-white/[0.03] border border-white/[0.06]',
                    'text-muted-foreground/50 hover:text-rose-400 hover:bg-rose-500/[0.07] hover:border-rose-500/15',
                    'transition-all duration-150'
                  )}
                  aria-label="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Mobile menu — public pages */}
            {!isAuthenticated && (
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="rounded-lg w-8 h-8">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[260px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 font-heading text-sm">
                      <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                        <span className="text-primary text-[11px] font-black">JB</span>
                      </div>
                      Jai Bhavani Cargo
                    </SheetTitle>
                    <SheetDescription className="sr-only">Navigation</SheetDescription>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1 mt-6">
                    {[
                      { to: '/dashboard',     label: 'Dashboard' },
                      { to: '/truck-manager', label: 'Trucks' },
                      { to: '/trip-logs',     label: 'Trips' },
                      { to: '/cashbook',      label: 'Cashbook' },
                    ].map(({ to, label }) => (
                      <Link key={to} to={to} className="flex items-center px-3 py-2.5 rounded-lg text-[13px] font-medium hover:bg-white/[0.05] text-muted-foreground hover:text-foreground transition-colors">
                        {label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <Button asChild className="w-full rounded-lg h-9 text-[13px]">
                      <Link to="/login">Login</Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>

      {/* ── Authenticated Mobile Top Bar ──────────────────────────────────────── */}
      {isAuthenticated && (
        <header className="md:hidden sticky top-0 z-50 w-full border-b border-white/[0.05] bg-[#070a13]/85 backdrop-blur-xl px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/15 border border-primary/20 flex items-center justify-center">
              <span className="text-primary text-[9px] font-black">JB</span>
            </div>
            {pageLabel && (
              <span className="text-[10.5px] text-muted-foreground/70 font-semibold leading-none border-l border-white/[0.08] pl-2 ml-0.5">
                {pageLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <LangSelector compact={true} language={language} setLanguage={setLanguage} />

            {(isAdmin || isSuperAdmin) && pendingCount > 0 && (
              <button
                onClick={() => navigate('/dashboard/users?tab=signup-requests')}
                className="relative w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.06] text-muted-foreground/60"
                aria-label="Notifications"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center">
                  {pendingCount}
                </span>
              </button>
            )}

            <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-primary text-[9px] font-black">
              {userInitials}
            </div>

            <button
              onClick={handleLogout}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-rose-400 hover:bg-rose-500/[0.07] transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>
      )}
    </>
  );
}