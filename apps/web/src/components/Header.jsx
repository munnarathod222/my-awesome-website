import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Truck, BarChart3, Globe, Bell, ChevronRight, Home } from 'lucide-react';
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
  const label = ROUTE_LABELS[pathname] || ROUTE_LABELS[Object.keys(ROUTE_LABELS).find(k => pathname.startsWith(k))] || '';
  return label;
}

// ── Desktop NavLink ───────────────────────────────────────────────────────────
const NavLink = ({ to, children, location }) => {
  const isActive = to === '/dashboard'
    ? location.pathname === '/dashboard'
    : location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={cn(
        'px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200 rounded-xl',
        isActive
          ? 'bg-primary/12 text-primary border border-primary/25 shadow-[0_0_12px_rgba(99,102,241,0.12)]'
          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
      )}
    >
      {children}
    </Link>
  );
};

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

  // Fetch pending signup requests for bell badge (admins only)
  useEffect(() => {
    if (!isAdmin && !isSuperAdmin) return;
    pb.collection('signup_requests').getList(1, 1, {
      filter: 'status = "Pending"',
      $autoCancel: false,
    }).then(r => setPendingCount(r.totalItems)).catch(() => {});
  }, [isAdmin, isSuperAdmin]);

  const LangSelector = ({ compact }) => (
    <div className={cn('flex items-center rounded-xl border border-white/7 bg-white/4', compact ? 'px-1.5 py-0.5' : 'px-2 py-1')}>
      <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0 mr-0.5" />
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className={cn('bg-transparent border-none shadow-none focus:ring-0 font-semibold text-foreground', compact ? 'h-6 w-[46px] px-0.5 text-[10px]' : 'h-7 w-20 px-1 text-xs')}>
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

  return (
    <>
      {/* ── Desktop header (hidden when authenticated – sidebar + top-bar layout) ── */}
      <header className={cn(
        'sticky top-0 z-50 w-full border-b border-white/5 bg-background/55 backdrop-blur-md supports-[backdrop-filter]:bg-background/45 shadow-lg transition-all duration-300',
        isAuthenticated ? 'hidden md:block' : 'block'
      )}>
        <div className="container max-w-7xl mx-auto flex h-14 items-center px-4 sm:px-6 lg:px-8 gap-4">

          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group shrink-0">
            <img src="/logo.png" className="h-8 w-auto object-contain rounded-lg group-hover:scale-105 transition-transform" alt="Jai Bhavani Logo" />
          </Link>

          {/* Breadcrumb — authenticated only */}
          {isAuthenticated && pageLabel && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Home className="w-3.5 h-3.5" />
              <ChevronRight className="w-3 h-3 opacity-40" />
              <span className="text-foreground font-semibold">{pageLabel}</span>
            </div>
          )}

          {/* Desktop nav — non-authenticated */}
          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1 flex-1 px-4">
              <NavLink to="/dashboard" location={location}>Dashboard</NavLink>
              <NavLink to="/truck-manager" location={location}>Trucks</NavLink>
              <NavLink to="/trip-logs" location={location}>Trips</NavLink>
              <NavLink to="/cashbook" location={location}>Cashbook</NavLink>
              {(isAdmin || isManager || isDispatcher) && (
                <NavLink to="/analytics" location={location}>Analytics</NavLink>
              )}
            </nav>
          )}

          <div className="flex items-center gap-2.5 ml-auto shrink-0">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block">
                  Login
                </Link>
                <Button asChild size="sm" className="rounded-xl shadow-sm">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2.5">
                <LangSelector compact={false} />

                {/* Notification Bell */}
                {(isAdmin || isSuperAdmin) && (
                  <button
                    onClick={() => navigate('/dashboard/users?tab=signup-requests')}
                    className="relative p-2 rounded-xl bg-white/4 border border-white/7 text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all"
                    aria-label="Pending requests"
                  >
                    <Bell className="w-4 h-4" />
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-lg animate-pulse">
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </span>
                    )}
                  </button>
                )}

                {/* User chip */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/40 border border-border/50 text-sm font-medium">
                  <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-[10px] font-black shrink-0">
                    {userInitials}
                  </div>
                  <span className="text-foreground text-[13px] max-w-[120px] truncate">
                    {currentUser?.full_name || currentUser?.name || 'User'}
                  </span>
                </div>

                <Button
                  variant="ghost" size="icon"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Mobile Sheet (non-authenticated) */}
            {!isAuthenticated && (
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 font-heading">
                      <img src="/logo.png" className="h-8 w-auto object-contain rounded-lg" alt="Jai Bhavani Logo" />
                    </SheetTitle>
                    <SheetDescription className="sr-only">Navigation</SheetDescription>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1 mt-6">
                    {[
                      { to: '/dashboard',    label: 'Dashboard' },
                      { to: '/truck-manager',label: 'Trucks' },
                      { to: '/trip-logs',    label: 'Trips' },
                      { to: '/cashbook',     label: 'Cashbook' },
                    ].map(({ to, label }) => (
                      <Link key={to} to={to} className="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary/60 hover:text-foreground transition-colors text-muted-foreground">
                        {label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button asChild className="w-full rounded-xl">
                      <Link to="/login">Login</Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>

      {/* ── Authenticated Mobile Top Bar ─────────────────────────────────────────── */}
      {isAuthenticated && (
        <header className="md:hidden sticky top-0 z-50 w-full border-b border-white/5 bg-[#070a13]/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" className="h-8 w-auto object-contain rounded-lg" alt="Jai Bhavani Logo" />
            {pageLabel && (
              <span className="text-[10px] text-muted-foreground font-semibold leading-none border-l border-white/10 pl-2.5 ml-0.5">{pageLabel}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <LangSelector compact={true} />

            {/* Mobile Notification Bell */}
            {(isAdmin || isSuperAdmin) && pendingCount > 0 && (
              <button
                onClick={() => navigate('/dashboard/users?tab=signup-requests')}
                className="relative p-1.5 rounded-lg bg-white/5 border border-white/8 text-muted-foreground"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow">
                  {pendingCount}
                </span>
              </button>
            )}

            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-[10px] font-black">
              {userInitials}
            </div>

            <Button
              variant="ghost" size="icon"
              onClick={handleLogout}
              className="w-8 h-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>
      )}
    </>
  );
}