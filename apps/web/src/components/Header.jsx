import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { 
  LogOut, Menu, Globe, Bell, ChevronRight, Home, Building2, UserPlus, Truck, Users, ChevronDown,
  LayoutDashboard, Sparkles, BarChart3, Calculator, CalendarDays, Trophy, PieChart, TrendingUp,
  CheckSquare, ClipboardList, MapPin, FileText, Droplet, Wrench, Package, FileBox, ShieldAlert,
  ShieldCheck, CreditCard, MessageSquare as MessageSquareWarning, Mail, Contact2, Settings,
  QrCode, Navigation, HardDrive, RefreshCw
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess.js';
import { cn } from '@/lib/utils.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient.js';

// ── Breadcrumb resolver ───────────────────────────────────────────────────────
const ROUTE_LABELS = {
  '/marketplace':            'AI Freight Marketplace',
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
  '/contacts':               'Contacts Directory',
  '/vendor-tracker':         'Vendor Registration Tracker',
  '/clients':                'Clients List',
  '/transport-crm':          'Transport CRM',
  '/insurance-manager':      'Insurance Manager',
  '/company-vault':          'Company Vault',
  '/fastag':                 'FASTag Management',
  '/business-mail':          'Business Mail',
  '/reports':                'Reports Center',
  '/dashboard/users':        'User Management',
  '/dashboard/profile':      'Settings',
  '/dashboard/attendance':   'Attendance',
  '/dashboard/trip-overview':'Trip Overview',
  '/quotes-manager':         'Quotes',
  '/qr-scanner':             'QR Scanner Pass',
  '/tracking':               'Track Shipment',
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

export default function Header() {
  const { isAuthenticated, logout, currentUser } = useAuth();
  const { isAdmin, isSuperAdmin } = useRoleBasedAccess();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const pageLabel = useBreadcrumbs(location.pathname);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [backingUp, setBackingUp] = useState(false);

  const handleBackup = async () => {
    setBackingUp(true);
    const toastId = toast.loading('Syncing database backup to Supabase Cloud...');
    try {
      const res = await apiServerClient.fetch('/driver/backup-now', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Backup synced successfully!', { id: toastId });
      } else {
        toast.error(data.error || 'Backup failed. Check server logs.', { id: toastId, duration: 6000 });
      }
    } catch (err) {
      toast.error(`Backup failed: ${err.message}`, { id: toastId, duration: 6000 });
    } finally {
      setBackingUp(false);
    }
  };

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

  const userRole = (currentUser?.role || 'user').toLowerCase();
  const hasRoleAccess = (roles) => {
    if (!roles || roles.length === 0) return true;
    if (userRole === 'super_admin' || userRole === 'admin' || userRole === 'superuser') return true;
    return roles.some(r => r.toLowerCase() === userRole);
  };

  const mobileNavGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { label: 'AI Freight Marketplace', path: '/marketplace', icon: Sparkles, roles: ['super_admin','admin','manager','dispatcher','supervisor','user'] },
        { label: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['super_admin','admin','manager'] },
        { label: 'Vehicle TCO & ROI', path: '/vehicle-tco', icon: Calculator, roles: ['super_admin','admin','manager'] },
        { label: 'Calendar', path: '/calendar', icon: CalendarDays, roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { label: 'Leaderboard', path: '/leaderboard', icon: Trophy, roles: ['super_admin','admin','manager'] },
        { label: 'Client Analysis', path: '/client-analysis', icon: PieChart, roles: ['super_admin','admin','manager'] },
        { label: 'Trip Overview', path: '/dashboard/trip-overview', icon: TrendingUp, roles: ['super_admin','admin','manager'] },
        { label: 'Reminders', path: '/reminders', icon: Bell, roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { label: 'To-Do List', path: '/todo', icon: CheckSquare, roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
      ]
    },
    {
      title: 'Operations',
      items: [
        { label: 'QR Scanner Pass', path: '/qr-scanner', icon: QrCode, roles: ['super_admin','admin','manager','dispatcher'] },
        { label: 'Track Shipment', path: '/tracking', icon: Navigation, roles: ['super_admin','admin','dispatcher','manager','user'] },
        { label: 'Trip Logs', path: '/trip-logs', icon: ClipboardList, roles: ['super_admin','admin','manager','dispatcher'] },
        { label: 'Route Master', path: '/routes-master', icon: MapPin, roles: ['super_admin','admin','dispatcher'] },
        { label: 'Quotes', path: '/quotes-manager', icon: FileText, roles: ['super_admin','admin','manager'] },
        { label: 'Fuel Tracker', path: '/fuel-tracker', icon: Droplet, roles: ['super_admin','admin','manager','dispatcher'] },
        { label: 'Fleet Maintenance', path: '/fleet-maintenance', icon: Wrench, roles: ['super_admin','admin','dispatcher'] },
        { label: 'Inventory Management', path: '/inventory', icon: Package, roles: ['super_admin','admin','manager','dispatcher'] },
        { label: 'POD Management', path: '/pod-management', icon: FileBox, roles: ['super_admin','admin','manager','dispatcher'] },
        { label: 'Exit Audit', path: '/exit-audit', icon: CheckSquare, roles: ['super_admin','admin','manager','dispatcher'] },
      ]
    },
    {
      title: 'Finance',
      items: [
        { label: 'Insurance Manager', path: '/insurance-manager', icon: ShieldAlert, roles: ['super_admin','admin','manager','dispatcher'] },
        { label: 'Company Vault', path: '/company-vault', icon: ShieldCheck, roles: ['super_admin','admin','manager'] },
        { label: 'Cashbook', path: '/cashbook', icon: FileText, roles: ['super_admin','admin','manager'] },
        { label: 'Expenses', path: '/expenses', icon: FileText, roles: ['super_admin','admin','manager'] },
        { label: 'FASTag Management', path: '/fastag', icon: CreditCard, roles: ['super_admin','admin','manager'] },
        { label: 'Payment Requests', path: '/payment-requests', icon: MessageSquareWarning, roles: ['super_admin','admin','manager'] },
        { label: 'Credit Cards', path: '/credit-cards', icon: CreditCard, roles: ['super_admin','admin'] },
        { label: 'Payroll', path: '/payroll', icon: FileText, roles: ['super_admin','admin'] },
        { label: 'EMI Calculator', path: '/emi-calculator', icon: Calculator, roles: ['super_admin','admin','manager'] },
      ]
    },
    {
      title: 'Fleet & Staff',
      items: [
        { label: 'Truck Manager', path: '/truck-manager', icon: Truck, roles: ['super_admin','admin','dispatcher','supervisor'] },
        { label: 'Vehicle Docs', path: '/truck-docs', icon: FileBox, roles: ['super_admin','admin','dispatcher','supervisor'] },
        { label: 'Employees', path: '/employees', icon: Users, roles: ['super_admin','admin','manager','supervisor'] },
        { label: 'Employee Docs', path: '/employee-docs', icon: FileBox, roles: ['super_admin','admin','supervisor'] },
        { label: 'Attendance', path: '/dashboard/attendance', icon: CalendarDays, roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { label: 'Recruitment Portal', path: '/recruitment', icon: UserPlus, roles: ['super_admin','admin','manager'] },
      ]
    },
    {
      title: 'Communication',
      items: [
        { label: 'Business Mail', path: '/business-mail', icon: Mail, roles: ['super_admin','admin','manager','dispatcher'] },
      ]
    },
    {
      title: 'Directory',
      items: [
        { label: 'Vendor Registration Tracker', path: '/vendor-tracker', icon: Building2, roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
        { label: 'Transport CRM', path: '/transport-crm', icon: Building2, roles: ['super_admin','admin','manager','dispatcher'] },
        { label: 'Contacts Directory', path: '/contacts', icon: Contact2, roles: ['super_admin','admin','manager','dispatcher'] },
        { label: 'Clients List', path: '/clients', icon: Users, roles: ['super_admin','admin','manager'] },
      ]
    },
    {
      title: 'Administration',
      items: [
        { label: 'User Management', path: '/dashboard/users', icon: Users, roles: ['superuser', 'super_admin', 'admin'] },
        { label: 'Access Requests', path: '/dashboard/signup-requests', icon: UserPlus, roles: ['superuser', 'super_admin', 'admin'] },
        { label: 'Audit & Security Logs', path: '/dashboard/audit-logs', icon: ShieldCheck, roles: ['superuser', 'super_admin'] },
        { label: 'Reports Center', path: '/reports', icon: FileText, roles: ['super_admin','admin'] },
        { label: 'Settings', path: '/dashboard/profile', icon: Settings, roles: ['super_admin','admin','manager','dispatcher','supervisor'] },
      ]
    }
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 z-30 w-full border-b border-white/[0.05] bg-[#070a13]/85 backdrop-blur-xl transition-all duration-200">
        <div className="flex h-14 w-full items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 font-heading font-extrabold text-foreground hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-blue-600 flex items-center justify-center text-primary-foreground font-black text-xs shadow-md shadow-primary/20">
                JB
              </div>
              <span className="text-base tracking-tight hidden lg:inline-block text-white font-extrabold">
                Jai Bhavani Cargo
              </span>
            </Link>

            {pageLabel && (
              <div className="flex items-center gap-2 pl-3 border-l border-white/[0.08]">
                <span className="text-xs font-semibold text-muted-foreground/80">{pageLabel}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            {!isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="rounded-lg text-[12px] h-8 px-3 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 font-bold gap-1.5 shadow-sm">
                      <UserPlus className="w-3.5 h-3.5" /> Apply Now <ChevronDown className="w-3 h-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 rounded-xl text-slate-100 p-1.5 shadow-2xl">
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-2 flex items-center gap-2 text-xs hover:bg-slate-800">
                      <Link to="/apply/driver" className="flex items-center gap-2 w-full text-amber-400 font-bold">
                        <Truck className="w-4 h-4" /> Driver Recruitment Portal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-2 flex items-center gap-2 text-xs hover:bg-slate-800">
                      <Link to="/signup-request" className="flex items-center gap-2 w-full text-blue-400 font-bold">
                        <Users className="w-4 h-4" /> Employee & Staff Portal
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button asChild size="sm" variant="outline" className="rounded-lg text-[12px] h-8 px-3 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-semibold gap-1.5">
                  <Link to="/client-login">
                    <Building2 className="w-3.5 h-3.5" /> Client Login
                  </Link>
                </Button>
                <Link to="/login" className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block ml-1">
                  Admin Login
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  size="sm"
                  className="rounded-xl text-[12px] h-8 px-3.5 bg-gradient-to-r from-indigo-600 via-primary to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold gap-1.5 shadow-lg shadow-indigo-500/25 border border-indigo-400/30 transition-all hover:scale-[1.02]"
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-3.5 h-3.5 text-white" />
                    Dashboard
                  </Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-[12px] h-8 px-3 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-bold gap-1.5 transition-all hover:scale-[1.02]"
                >
                  <Link to="/qr-scanner">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>QR Pass Scanner</span>
                  </Link>
                </Button>

                {(isAdmin || isSuperAdmin) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBackup}
                    disabled={backingUp}
                    className="rounded-xl text-[12px] h-8 px-3 border-sky-500/30 text-sky-400 hover:bg-sky-500/10 font-bold gap-1.5 transition-all hover:scale-[1.02]"
                  >
                    {backingUp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5" />}
                    <span>Backup Data</span>
                  </Button>
                )}

                <LangSelector compact={false} language={language} setLanguage={setLanguage} />

                {(isAdmin || isSuperAdmin) && (
                  <button
                    onClick={() => navigate('/dashboard/users?tab=signup-requests')}
                    className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/[0.06] text-muted-foreground hover:text-foreground"
                    title="Signup Requests"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </span>
                    )}
                  </button>
                )}

                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-primary text-[9px] font-black shrink-0">
                    {userInitials}
                  </div>
                  <span className="text-[12px] font-medium text-foreground max-w-[110px] truncate">
                    {currentUser?.full_name || currentUser?.name || 'User'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/[0.06] text-muted-foreground hover:text-rose-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Authenticated & Mobile Top Bar with Navigation Drawer */}
      <header className="md:hidden sticky top-0 z-50 w-full border-b border-white/[0.05] bg-[#070a13]/90 backdrop-blur-xl px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 rounded-xl border-slate-800 bg-slate-900 text-slate-200 hover:text-white">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-[#090a0f] border-slate-800 text-slate-100 p-0 overflow-y-auto font-sans">
                <SheetHeader className="p-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
                  <SheetTitle className="text-left font-extrabold text-sm text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-blue-600 flex items-center justify-center text-primary-foreground font-black text-xs shadow-md">
                      JB
                    </div>
                    Jai Bhavani Cargo Portal
                  </SheetTitle>
                  <SheetDescription className="sr-only">Mobile Menu</SheetDescription>
                </SheetHeader>

                <div className="p-3 space-y-4">
                  {mobileNavGroups.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-1">
                      <div className="px-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                        {group.title}
                      </div>
                      <div className="space-y-0.5">
                        {group.items.filter(item => hasRoleAccess(item.roles)).map((item, iIdx) => {
                          const isActive = location.pathname === item.path;
                          const ItemIcon = item.icon;
                          return (
                            <Link
                              key={iIdx}
                              to={item.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors',
                                isActive 
                                  ? 'bg-primary/10 text-primary border border-primary/20 font-bold'
                                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                              )}
                            >
                              <ItemIcon className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-slate-400')} />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          )}

          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-blue-600 flex items-center justify-center text-primary-foreground font-black text-xs shadow-sm">
              JB
            </div>
            {pageLabel ? (
              <span className="text-xs font-extrabold text-foreground truncate max-w-[150px]">{pageLabel}</span>
            ) : (
              <span className="text-xs font-extrabold text-foreground">Jai Bhavani</span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          {isAuthenticated && (
            <>
              <Button
                asChild
                size="sm"
                className="h-7 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-extrabold text-[11px] gap-1 shadow-sm"
              >
                <Link to="/qr-scanner">
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">QR Pass</span>
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="h-7 px-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-[11px] gap-1 shadow-sm"
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              </Button>
              {(isAdmin || isSuperAdmin) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBackup}
                  disabled={backingUp}
                  className="h-7 px-2 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 font-extrabold text-[11px] gap-1 shadow-sm"
                >
                  {backingUp ? <RefreshCw className="w-3 h-3 animate-spin" /> : <HardDrive className="w-3 h-3" />}
                  <span>Backup</span>
                </Button>
              )}
            </>
          )}
          <LangSelector compact={true} language={language} setLanguage={setLanguage} />
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="w-7 h-7 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>
    </>
  );
}