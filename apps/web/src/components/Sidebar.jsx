import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { LayoutDashboard, Users, Truck, CalendarDays, FileText, Settings, ChevronLeft, ChevronRight, LogOut, MapPin, ClipboardList, CreditCard, Droplet, Wrench, BarChart3, Bell, CheckSquare, FileBox, MessageSquare as MessageSquareWarning, Contact2, PieChart, Calculator, TrendingUp, Mail } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import pb from '@/lib/pocketbaseClient.js';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const getTranslationKey = (label) => {
  if (label === 'To-Do List') return 'todo_list';
  if (label === 'Inventory Management') return 'inventory';
  if (label === 'Fleet & Staff') return 'fleet_staff';
  return label.toLowerCase().replace(/[\s&]+/g, '_').trim();
};

export default function Sidebar({ isExpanded, setIsExpanded }) {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const role = currentUser?.role || 'user';
  const [showPodManagement, setShowPodManagement] = useState(false);

  useEffect(() => {
    const checkPodRequirement = async () => {
      try {
        const result = await pb.collection('clients').getList(1, 1, {
          filter: 'requires_pod = true',
          $autoCancel: false
        });
        if (result.items && result.items.length > 0) {
          setShowPodManagement(true);
        }
      } catch (err) {
        console.warn('Failed to check client POD requirements:', err);
      }
    };
    checkPodRequirement();
  }, []);

  const operationsItems = [
    { icon: ClipboardList, label: 'Trip Logs', path: '/trip-logs', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
    { icon: MapPin, label: 'Route Master', path: '/routes-master', roles: ['super_admin', 'admin', 'dispatcher'] },
    { icon: FileText, label: 'Quotes', path: '/quotes-manager', roles: ['super_admin', 'admin', 'manager'] },
    { icon: Droplet, label: 'Fuel Tracker', path: '/fuel-tracker', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
    { icon: Wrench, label: 'Fleet Maintenance', path: '/fleet-maintenance', roles: ['super_admin', 'admin', 'dispatcher'] },
    { icon: FileBox, label: 'Inventory Management', path: '/inventory', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] }
  ];

  if (showPodManagement) {
    operationsItems.push({
      icon: ClipboardList,
      label: 'POD',
      path: '/pod-management',
      roles: ['super_admin', 'admin', 'manager', 'dispatcher']
    });
  }

  // Add Exit Audit to Operations
  operationsItems.push({
    icon: CheckSquare,
    label: 'Exit Audit',
    path: '/exit-audit',
    roles: ['super_admin', 'admin', 'manager', 'dispatcher']
  });

  const menuGroups = [
    {
      title: "Overview",
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] },
        { icon: BarChart3, label: 'Analytics', path: '/analytics', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: PieChart, label: 'Client Analysis', path: '/client-analysis', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: TrendingUp, label: 'Trip Overview', path: '/dashboard/trip-overview', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: Bell, label: 'Reminders', path: '/reminders', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] },
        { icon: CheckSquare, label: 'To-Do List', path: '/todo', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] },
      ]
    },
    {
      title: "Operations",
      items: operationsItems
    },
    {
      title: "Finance",
      items: [
        { icon: FileText, label: 'Cashbook', path: '/cashbook', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: FileText, label: 'Expenses', path: '/expenses', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: MessageSquareWarning, label: 'Payment Requests', path: '/payment-requests', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: CreditCard, label: 'Credit Cards', path: '/credit-cards', roles: ['super_admin', 'admin'] },
        { icon: FileText, label: 'Payroll', path: '/payroll', roles: ['super_admin', 'admin'] },
        { icon: Calculator, label: 'EMI Calculator', path: '/emi-calculator', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
      ]
    },
    {
      title: "Fleet & Staff",
      items: [
        { icon: Truck, label: 'Truck Manager', path: '/truck-manager', roles: ['super_admin', 'admin', 'dispatcher', 'supervisor'] },
        { icon: FileBox, label: 'Vehicle Docs', path: '/truck-docs', roles: ['super_admin', 'admin', 'dispatcher', 'supervisor'] },
        { icon: Users, label: 'Employees', path: '/employees', roles: ['super_admin', 'admin', 'manager', 'supervisor'] },
        { icon: FileBox, label: 'Employee Docs', path: '/employee-docs', roles: ['super_admin', 'admin', 'supervisor'] },
        { icon: CalendarDays, label: 'Attendance', path: '/dashboard/attendance', roles: ['super_admin', 'admin', 'manager', 'supervisor'] },
      ]
    },
    {
      title: "Communication",
      items: [
        { icon: Mail, label: 'Business Mail', path: '/business-mail', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] }
      ]
    },
    {
      title: "Directory",
      items: [
        { icon: Contact2, label: 'Contacts', path: '/contacts', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
        { icon: Users, label: 'Clients', path: '/clients', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
      ]
    },
    {
      title: "Administration",
      items: [
        { icon: Users, label: 'User Management', path: '/dashboard/users', roles: ['super_admin', 'admin'] },
        { icon: FileText, label: 'Reports', path: '/reports', roles: ['super_admin', 'admin'] },
        { icon: Settings, label: 'Settings', path: '/dashboard/profile', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] },
      ]
    }
  ];

  return (
    <aside 
      className={cn(
        "hidden md:flex bg-[hsl(var(--sidebar-bg))]/80 backdrop-blur-md border-r border-white/5 transition-all duration-300 flex-col z-20 h-full relative shadow-2xl",
        isExpanded ? "w-64" : "w-[72px]"
      )}
    >
      <div className="flex items-center justify-end p-3 border-b border-white/5 h-14 shrink-0">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg bg-secondary/35 text-[hsl(var(--sidebar-text-muted))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-white transition-all duration-300"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
        <nav className="space-y-6 px-3">
          {menuGroups.map((group, idx) => {
            const visibleItems = group.items.filter(item => item.roles.includes(role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                {isExpanded && (
                  <h3 className="px-4 mb-2 text-[10px] font-extrabold tracking-wider uppercase text-[hsl(var(--sidebar-text-muted))] font-heading opacity-80">
                    {t(getTranslationKey(group.title))}
                  </h3>
                )}
                <ul className="space-y-1.5">
                  {visibleItems.map((item, itemIdx) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                      <li key={itemIdx}>
                        <Link 
                          to={item.path}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative group border border-transparent",
                            isActive 
                              ? "bg-[hsl(var(--sidebar-accent)/0.15)] text-[hsl(var(--sidebar-accent))] font-semibold shadow-[0_0_15px_rgba(99,102,241,0.1)] border-[hsl(var(--sidebar-accent)/0.25)]" 
                              : "text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover-bg))]/60 hover:text-[hsl(var(--sidebar-accent))] hover:translate-x-1.5"
                          )}
                          title={!isExpanded ? item.label : undefined}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[hsl(var(--sidebar-accent))] rounded-r-full shadow-[0_0_12px_hsl(var(--sidebar-accent))]" />
                          )}
                          <item.icon className={cn("w-5 h-5 shrink-0 transition-all duration-300", isActive ? "text-[hsl(var(--sidebar-accent))]" : "text-[hsl(var(--sidebar-text-muted))] group-hover:text-[hsl(var(--sidebar-accent))] group-hover:scale-110")} />
                          {isExpanded && <span className="truncate text-[13px]">{t(getTranslationKey(item.label))}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5 shrink-0">
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-[hsl(var(--sidebar-text-muted))] hover:bg-[hsl(var(--destructive)/0.15)] hover:text-white rounded-xl border border-transparent hover:border-destructive/20 transition-all duration-300"
          title={!isExpanded ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isExpanded && <span className="font-semibold text-xs">{t('logout')}</span>}
        </button>
      </div>
    </aside>
  );
}