import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { 
  LogOut, Menu, Globe, Bell, ChevronRight, Home, Building2, UserPlus, Truck, Users, ChevronDown,
  LayoutDashboard, Sparkles, BarChart3, Calculator, CalendarDays, Trophy, PieChart, TrendingUp,
  CheckSquare, ClipboardList, MapPin, FileText, Droplet, Wrench, Package, FileBox, ShieldAlert,
  ShieldCheck, CreditCard, MessageSquare as MessageSquareWarning, Mail, Contact2, Settings,
  QrCode, Navigation, HardDrive, RefreshCw, Receipt
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess.js';
import { cn } from '@/lib/utils.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient.js';
import { playDispatchChime, triggerBrowserNotification, requestNotificationPermission } from '@/lib/notificationSound.js';
import ExpenseModal from '@/components/ExpenseModal.jsx';
import AddTripModal from '@/components/AddTripModal.jsx';
import AdvanceEditModal from '@/components/AdvanceEditModal.jsx';
import MaintenanceFormModal from '@/components/MaintenanceFormModal.jsx';
import LogFuelModal from '@/components/LogFuelModal.jsx';

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
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isTripOpen, setIsTripOpen] = useState(false);
  const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isFuelOpen, setIsFuelOpen] = useState(false);

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

  const [pendingQuotes, setPendingQuotes] = useState([]);
  const [pendingSignups, setPendingSignups] = useState([]);
  const lastKnownQuoteIdsRef = React.useRef(new Set());

  const handleLogout = () => { logout(); navigate('/'); };

  const userInitials = ((currentUser?.full_name || currentUser?.name || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2));

  // Request browser notification permission once user interacts
  useEffect(() => {
    if (isAuthenticated) {
      requestNotificationPermission();
    }
  }, [isAuthenticated]);

  const fetchPendingNotifications = React.useCallback(async (isInitial = false) => {
    if (!isAuthenticated) return;

    // 1. Fetch Signup Requests (Admin only)
    if (isAdmin || isSuperAdmin) {
      try {
        const r = await pb.collection('signup_requests').getList(1, 10, {
          filter: 'status = "Pending"',
          sort: '-created',
          $autoCancel: false,
        });
        setPendingCount(r.totalItems || 0);
        setPendingSignups(r.items || []);
      } catch (err) {}
    }

    // 2. Fetch Pending Quotes
    try {
      const quotesMap = new Map();

      // Try server API first
      try {
        const endpoints = ['/hcgi/api/driver/get-quotes', '/api/driver/get-quotes'];
        for (const ep of endpoints) {
          try {
            const res = await window.fetch(ep);
            if (res.ok) {
              const data = await res.json();
              if (data.success && Array.isArray(data.quotes)) {
                data.quotes.forEach(q => {
                  if (q.status === 'Pending' || q.status === 'Draft' || !q.status) {
                    quotesMap.set(q.quote_number || q.id, q);
                  }
                });
                break;
              }
            }
          } catch (e) {}
        }
      } catch (e) {}

      // Try PocketBase SDK
      try {
        const pbQuotes = await pb.collection('quotes').getList(1, 15, {
          filter: 'status = "Pending" || status = "Draft" || status = ""',
          sort: '-created',
          $autoCancel: false
        });
        (pbQuotes?.items || []).forEach(q => {
          quotesMap.set(q.quote_number || q.id, q);
        });
      } catch (e) {}

      // Try localStorage cache
      try {
        const local = JSON.parse(localStorage.getItem('jbc_public_quotes') || '[]');
        (local || []).forEach(q => {
          if (q.status === 'Pending' || q.status === 'Draft' || !q.status) {
            quotesMap.set(q.quote_number || q.id, q);
          }
        });
      } catch (e) {}

      const list = Array.from(quotesMap.values()).sort((a, b) => {
        const tA = new Date(a.created || a.updated || 0).getTime();
        const tB = new Date(b.created || b.updated || 0).getTime();
        return tB - tA;
      });

      // Detect newly arrived quotes that weren't known before
      if (!isInitial && list.length > 0) {
        const newest = list[0];
        const key = newest.quote_number || newest.id;
        if (key && !lastKnownQuoteIdsRef.current.has(key)) {
          // Play Dispatch Chime & Trigger Desktop / Toast Notification
          playDispatchChime();
          triggerBrowserNotification(`🚛 New Quote #${newest.quote_number}`, {
            body: `${newest.customer_name} • ${newest.origin} ➡️ ${newest.destination}\nTruck: ${newest.truck_size || newest.container_type || '32 FT SXL'}`,
            onClick: () => navigate(`/quotes-manager?quoteNumber=${newest.quote_number}`)
          });
          toast.info(`🚛 New Freight Quote Request: #${newest.quote_number}`, {
            description: `${newest.customer_name} (${newest.origin} ➡️ ${newest.destination}) • ${newest.truck_size || newest.container_type || '32 FT SXL'}`,
            action: {
              label: 'Open in Hub',
              onClick: () => navigate(`/quotes-manager?quoteNumber=${newest.quote_number}`)
            },
            duration: 9000
          });
        }
      }

      // Update known quote IDs
      list.forEach(q => {
        const k = q.quote_number || q.id;
        if (k) lastKnownQuoteIdsRef.current.add(k);
      });

      setPendingQuotes(list);
    } catch (e) {}
  }, [isAdmin, isSuperAdmin, isAuthenticated, navigate]);

  useEffect(() => {
    fetchPendingNotifications(true);

    const handleNewQuoteEvent = (e) => {
      const q = e?.detail;
      if (q) {
        const k = q.quote_number || q.id;
        if (k && !lastKnownQuoteIdsRef.current.has(k)) {
          lastKnownQuoteIdsRef.current.add(k);
          playDispatchChime();
          triggerBrowserNotification(`🚛 New Quote #${q.quote_number}`, {
            body: `${q.customer_name} • ${q.origin} ➡️ ${q.destination}\nTruck: ${q.truck_size || q.container_type || '32 FT SXL'}`,
            onClick: () => navigate(`/quotes-manager?quoteNumber=${q.quote_number}`)
          });
          toast.info(`🚛 New Freight Quote Request: #${q.quote_number}`, {
            description: `${q.customer_name} (${q.origin} ➡️ ${q.destination}) • ${q.truck_size || q.container_type || '32 FT SXL'}`,
            action: {
              label: 'Open in Hub',
              onClick: () => navigate(`/quotes-manager?quoteNumber=${q.quote_number}`)
            },
            duration: 9000
          });
        }
      }
      fetchPendingNotifications(false);
    };

    window.addEventListener('jbc_new_quote_submitted', handleNewQuoteEvent);
    window.addEventListener('storage', () => fetchPendingNotifications(false));

    // Multi-tab BroadcastChannel
    let bc;
    if (typeof window.BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('jbc_quotes_channel');
        bc.onmessage = (msg) => {
          if (msg?.data?.quote) {
            handleNewQuoteEvent({ detail: msg.data.quote });
          } else {
            fetchPendingNotifications(false);
          }
        };
      } catch (e) {}
    }

    // Realtime PocketBase subscription
    pb.collection('quotes').subscribe('*', () => {
      fetchPendingNotifications(false);
    }).catch(() => {});

    pb.collection('signup_requests').subscribe('*', () => {
      fetchPendingNotifications(false);
    }).catch(() => {});

    // Bandwidth Guard: Only poll when tab is visible, and use 60s fallback interval
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPendingNotifications(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchPendingNotifications(false);
      }
    }, 60000);

    return () => {
      window.removeEventListener('jbc_new_quote_submitted', handleNewQuoteEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      try { pb.collection('quotes').unsubscribe('*'); } catch (e) {}
      try { pb.collection('signup_requests').unsubscribe('*'); } catch (e) {}
      if (bc) { bc.close(); }
      clearInterval(interval);
    };
  }, [fetchPendingNotifications, navigate]);

  const [unreadEmails, setUnreadEmails] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await apiServerClient.fetch('/zoho/unread-count');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUnreadEmails(Number(data.unreadCount) || 0);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch Zoho unread count:', err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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
                {/* Desktop Quick Access Header Shortcuts (Tan styled) */}
                <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl mr-2.5 no-print">
                  <TooltipProvider delayDuration={0}>
                    {/* Dashboard */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to="/dashboard"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#d2b48c] hover:bg-[#d2b48c]/10 hover:border-[#d2b48c]/25 border border-transparent transition-all duration-150"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold font-sans">
                        Dashboard
                      </TooltipContent>
                    </Tooltip>

                    {/* QR Pass Scanner */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to="/qr-scanner"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#d2b48c] hover:bg-[#d2b48c]/10 hover:border-[#d2b48c]/25 border border-transparent transition-all duration-150"
                        >
                          <QrCode className="w-4 h-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold font-sans">
                        QR Pass Scanner
                      </TooltipContent>
                    </Tooltip>

                    {/* Add Expense */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setIsExpenseOpen(true)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#d2b48c] hover:bg-[#d2b48c]/10 hover:border-[#d2b48c]/25 border border-transparent transition-all duration-150 focus:outline-none"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold font-sans">
                        Add Expense
                      </TooltipContent>
                    </Tooltip>

                    {/* Dispatch Trip */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setIsTripOpen(true)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#d2b48c] hover:bg-[#d2b48c]/10 hover:border-[#d2b48c]/25 border border-transparent transition-all duration-150 focus:outline-none"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold font-sans">
                        Dispatch Trip
                      </TooltipContent>
                    </Tooltip>

                    {/* Record Advance */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setIsAdvanceOpen(true)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#d2b48c] hover:bg-[#d2b48c]/10 hover:border-[#d2b48c]/25 border border-transparent transition-all duration-150 focus:outline-none"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold font-sans">
                        Record Advance
                      </TooltipContent>
                    </Tooltip>

                    {/* Log Maintenance */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setIsMaintenanceOpen(true)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#d2b48c] hover:bg-[#d2b48c]/10 hover:border-[#d2b48c]/25 border border-transparent transition-all duration-150 focus:outline-none"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold font-sans">
                        Log Maintenance
                      </TooltipContent>
                    </Tooltip>

                    {/* Log Fuel */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setIsFuelOpen(true)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#d2b48c] hover:bg-[#d2b48c]/10 hover:border-[#d2b48c]/25 border border-transparent transition-all duration-150 focus:outline-none"
                        >
                          <Droplet className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold font-sans">
                        Log Fuel
                      </TooltipContent>
                    </Tooltip>

                    {/* Backup Data (Admins only) */}
                    {(isAdmin || isSuperAdmin) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleBackup}
                            disabled={backingUp}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#d2b48c] hover:bg-[#d2b48c]/10 hover:border-[#d2b48c]/25 border border-transparent transition-all duration-150 focus:outline-none disabled:opacity-50"
                          >
                            {backingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold font-sans">
                          Backup Data
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                </div>

                {(isAdmin || isSuperAdmin) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/[0.06] text-muted-foreground hover:text-foreground transition-all duration-150"
                        title="Notifications"
                      >
                        <Bell className={cn("w-3.5 h-3.5", (pendingQuotes.length + pendingSignups.length) > 0 ? "text-amber-400 animate-pulse" : "text-muted-foreground")} />
                        {(pendingQuotes.length + pendingSignups.length) > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-md">
                            {(pendingQuotes.length + pendingSignups.length) > 9 ? '9+' : (pendingQuotes.length + pendingSignups.length)}
                          </span>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 bg-slate-900 border border-slate-800 text-slate-100 p-0 shadow-2xl rounded-2xl overflow-hidden font-sans z-50">
                      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">Dispatch Notifications</span>
                        </div>
                        {(pendingQuotes.length + pendingSignups.length) > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {(pendingQuotes.length + pendingSignups.length)} New
                          </span>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                        {/* Section 1: Pending Quotes */}
                        {pendingQuotes.length > 0 && (
                          <div className="p-2 space-y-1">
                            <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-emerald-400">
                                <Truck className="w-3.5 h-3.5" /> Quote Requests ({pendingQuotes.length})
                              </span>
                            </div>
                            {pendingQuotes.slice(0, 5).map(q => (
                              <DropdownMenuItem
                                key={q.id || q.quote_number}
                                onClick={() => navigate(`/quotes-manager?quoteNumber=${q.quote_number}`)}
                                className="cursor-pointer rounded-xl p-2.5 hover:bg-slate-800/80 transition-colors flex flex-col items-start gap-1 focus:bg-slate-800"
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-mono font-bold text-xs text-primary">{q.quote_number}</span>
                                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                    {q.truck_size || q.container_type || '32 FT SXL'}
                                  </span>
                                </div>
                                <div className="text-xs font-bold text-slate-200 truncate max-w-full">
                                  {q.customer_name}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <span>{q.origin}</span>
                                  <span>➡️</span>
                                  <span>{q.destination}</span>
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        )}

                        {/* Section 2: Pending Signup Requests */}
                        {pendingSignups.length > 0 && (
                          <div className="p-2 space-y-1">
                            <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-blue-400">
                                <Users className="w-3.5 h-3.5" /> Access Requests ({pendingSignups.length})
                              </span>
                            </div>
                            {pendingSignups.slice(0, 4).map(req => (
                              <DropdownMenuItem
                                key={req.id}
                                onClick={() => navigate('/dashboard/users?tab=signup-requests')}
                                className="cursor-pointer rounded-xl p-2.5 hover:bg-slate-800/80 transition-colors flex flex-col items-start gap-1 focus:bg-slate-800"
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-bold text-xs text-slate-200">{req.name || req.email}</span>
                                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                                    {req.requested_role || 'Staff'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400">{req.email || req.phone}</div>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        )}

                        {(pendingQuotes.length + pendingSignups.length) === 0 && (
                          <div className="py-8 text-center text-xs text-slate-500">
                            No pending quote inquiries or requests.
                          </div>
                        )}
                      </div>

                      <div className="p-2 bg-slate-950/90 border-t border-slate-800 text-center">
                        <Link
                          to="/quotes-manager"
                          className="block w-full py-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                          Open Quotes & Invoicing Hub ➡️
                        </Link>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {isAuthenticated && (
                  <button
                    onClick={() => navigate('/business-mail')}
                    className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/[0.06] text-muted-foreground hover:text-foreground"
                    title="Business Mail"
                  >
                    <Mail className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    {unreadEmails > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                        {unreadEmails > 9 ? '9+' : unreadEmails}
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
              {/* Mobile Quick Access Shortcuts (Tan styled, scrollable) */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-950/80 border border-slate-800/80 rounded-xl max-w-[130px] xs:max-w-[170px] sm:max-w-xs overflow-x-auto scrollbar-none no-print shrink-0">
                {/* Dashboard */}
                <Link
                  to="/dashboard"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 active:text-[#d2b48c] active:bg-[#d2b48c]/10 shrink-0"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                </Link>

                {/* QR Pass Scanner */}
                <Link
                  to="/qr-scanner"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 active:text-[#d2b48c] active:bg-[#d2b48c]/10 shrink-0"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </Link>

                {/* Add Expense */}
                <button
                  onClick={() => setIsExpenseOpen(true)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 active:text-[#d2b48c] active:bg-[#d2b48c]/10 shrink-0 focus:outline-none"
                >
                  <Receipt className="w-3.5 h-3.5" />
                </button>

                {/* Dispatch Trip */}
                <button
                  onClick={() => setIsTripOpen(true)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 active:text-[#d2b48c] active:bg-[#d2b48c]/10 shrink-0 focus:outline-none"
                >
                  <Truck className="w-3.5 h-3.5" />
                </button>

                {/* Record Advance */}
                <button
                  onClick={() => setIsAdvanceOpen(true)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 active:text-[#d2b48c] active:bg-[#d2b48c]/10 shrink-0 focus:outline-none"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                </button>

                {/* Log Maintenance */}
                <button
                  onClick={() => setIsMaintenanceOpen(true)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 active:text-[#d2b48c] active:bg-[#d2b48c]/10 shrink-0 focus:outline-none"
                >
                  <Wrench className="w-3.5 h-3.5" />
                </button>

                {/* Log Fuel */}
                <button
                  onClick={() => setIsFuelOpen(true)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 active:text-[#d2b48c] active:bg-[#d2b48c]/10 shrink-0 focus:outline-none"
                >
                  <Droplet className="w-3.5 h-3.5" />
                </button>

                {/* Backup (Admins only) */}
                {(isAdmin || isSuperAdmin) && (
                  <button
                    onClick={handleBackup}
                    disabled={backingUp}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 active:text-[#d2b48c] active:bg-[#d2b48c]/10 shrink-0"
                  >
                    {backingUp ? <RefreshCw className="w-3 h-3 animate-spin" /> : <HardDrive className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

          {isAuthenticated && (isAdmin || isSuperAdmin) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="relative w-7 h-7 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-400 hover:text-foreground"
                  title="Notifications"
                >
                  <Bell className={cn("w-3.5 h-3.5", (pendingQuotes.length + pendingSignups.length) > 0 ? "text-amber-400 animate-pulse" : "text-slate-400")} />
                  {(pendingQuotes.length + pendingSignups.length) > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center">
                      {(pendingQuotes.length + pendingSignups.length) > 9 ? '9+' : (pendingQuotes.length + pendingSignups.length)}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 bg-slate-900 border border-slate-800 text-slate-100 p-0 shadow-2xl rounded-2xl overflow-hidden font-sans z-50">
                <div className="p-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">Notifications</span>
                  {(pendingQuotes.length + pendingSignups.length) > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {(pendingQuotes.length + pendingSignups.length)} New
                    </span>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 p-1">
                  {pendingQuotes.slice(0, 4).map(q => (
                    <DropdownMenuItem
                      key={q.id || q.quote_number}
                      onClick={() => navigate(`/quotes-manager?quoteNumber=${q.quote_number}`)}
                      className="p-2 flex flex-col items-start gap-0.5 cursor-pointer rounded-lg hover:bg-slate-800"
                    >
                      <span className="font-mono font-bold text-xs text-primary">{q.quote_number}</span>
                      <span className="text-xs font-bold text-slate-200 truncate w-full">{q.customer_name}</span>
                      <span className="text-[10px] text-slate-400">{q.origin} ➡️ {q.destination}</span>
                    </DropdownMenuItem>
                  ))}
                  {pendingQuotes.length === 0 && (
                    <div className="py-4 text-center text-xs text-slate-500">No new quote requests.</div>
                  )}
                </div>
                <div className="p-1.5 bg-slate-950/90 border-t border-slate-800 text-center">
                  <Link to="/quotes-manager" className="text-xs font-bold text-primary block py-1">
                    Open Quotes Hub ➡️
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
            <button
              onClick={() => navigate('/business-mail')}
              className="relative w-7 h-7 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-400 hover:text-foreground"
              title="Business Mail"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {unreadEmails > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center">
                  {unreadEmails > 9 ? '9+' : unreadEmails}
                </span>
              )}
            </button>
          )}
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
      {isExpenseOpen && (
        <ExpenseModal
          isOpen={isExpenseOpen}
          onClose={() => setIsExpenseOpen(false)}
          onSuccess={() => { setIsExpenseOpen(false); toast.success("Expense logged successfully!"); }}
        />
      )}
      {isTripOpen && (
        <AddTripModal
          isOpen={isTripOpen}
          onClose={() => setIsTripOpen(false)}
          onSuccess={() => { setIsTripOpen(false); toast.success("Trip dispatched successfully!"); }}
        />
      )}
      {isAdvanceOpen && (
        <AdvanceEditModal
          isOpen={isAdvanceOpen}
          onClose={() => setIsAdvanceOpen(false)}
          onSuccess={() => { setIsAdvanceOpen(false); toast.success("Advance recorded successfully!"); }}
        />
      )}
      {isMaintenanceOpen && (
        <MaintenanceFormModal
          isOpen={isMaintenanceOpen}
          onClose={() => setIsMaintenanceOpen(false)}
          onSuccess={() => { setIsMaintenanceOpen(false); toast.success("Maintenance request logged successfully!"); }}
        />
      )}
      {isFuelOpen && (
        <LogFuelModal
          isOpen={isFuelOpen}
          onClose={() => setIsFuelOpen(false)}
          onSuccess={() => { setIsFuelOpen(false); toast.success("Fuel log recorded successfully!"); }}
        />
      )}
    </>
  );
}