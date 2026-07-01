import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { LayoutDashboard, ClipboardList, FileText, User, Grid } from 'lucide-react';
import { cn } from '@/lib/utils.js';

export default function BottomNavigation() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const role = currentUser?.role || 'user';

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] },
    { icon: ClipboardList, label: 'Trip Logs', path: '/trip-logs', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
    { icon: FileText, label: 'Cashbook', path: '/cashbook', roles: ['super_admin', 'admin', 'manager', 'dispatcher'] },
    { icon: Grid, label: 'Hub', path: '/launchpad', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] },
    { icon: User, label: 'Profile', path: '/dashboard/profile', roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor'] }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-white/5 px-4 py-2 flex items-center justify-around shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
      {visibleItems.map((item, idx) => {
        const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
        return (
          <Link
            key={idx}
            to={item.path}
            className="flex flex-col items-center justify-center py-1 px-3 relative transition-all duration-300"
          >
            {isActive && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-primary rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
            )}
            <item.icon
              className={cn(
                "w-5 h-5 transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
              )}
            />
            <span
              className={cn(
                "text-[9px] mt-1 font-semibold transition-all duration-300",
                isActive ? "text-primary font-bold" : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
