import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { LayoutDashboard, ClipboardList, FileText, User, Grid } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import { motion } from 'framer-motion';

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

  const visibleItems = navItems.filter(item => (item?.roles || []).includes(role));

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-[#0d1224]/85 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2.5 flex items-center justify-around shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
      {visibleItems.map((item, idx) => {
        const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
        return (
          <Link
            key={idx}
            to={item.path}
            className="flex flex-col items-center justify-center py-0.5 px-2.5 relative transition-all duration-200"
          >
            {isActive && (
              <motion.span 
                layoutId="activeTabIndicator"
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <item.icon
              className={cn(
                "w-5 h-5 transition-transform duration-200",
                isActive ? "text-primary scale-110" : "text-slate-400 hover:text-primary"
              )}
            />
            <span
              className={cn(
                "text-[9px] mt-1 font-bold tracking-wide transition-colors duration-200",
                isActive ? "text-primary" : "text-slate-400"
              )}
            >
              {item.label === 'Hub' ? t('hub') : item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
