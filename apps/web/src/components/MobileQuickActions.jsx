import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess.js';
import { 
  Plus, Droplet, Receipt, ClipboardPlus, CalendarCheck, Bell, X, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileQuickActions() {
  const { isAuthenticated, currentUser } = useAuth();
  const { isAdmin, isManager, isDispatcher } = useRoleBasedAccess();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // If not signed in, do not render floating actions
  if (!isAuthenticated) return null;

  const actions = [
    {
      icon: Droplet,
      label: 'Log Fuel',
      color: 'bg-amber-500 text-amber-950 shadow-amber-500/20',
      path: '/fuel-tracker',
      roles: ['super_admin', 'admin', 'manager', 'dispatcher']
    },
    {
      icon: Receipt,
      label: 'Add Expense',
      color: 'bg-rose-500 text-rose-950 shadow-rose-500/20',
      path: '/expenses',
      roles: ['super_admin', 'admin', 'manager', 'dispatcher']
    },
    {
      icon: ClipboardPlus,
      label: 'New Trip Log',
      color: 'bg-blue-500 text-blue-950 shadow-blue-500/20',
      path: '/trip-logs',
      roles: ['super_admin', 'admin', 'manager', 'dispatcher']
    },
    {
      icon: CalendarCheck,
      label: 'Attendance',
      color: 'bg-emerald-500 text-emerald-950 shadow-emerald-500/20',
      path: '/dashboard/attendance',
      roles: ['super_admin', 'admin', 'manager', 'supervisor']
    },
    {
      icon: Bell,
      label: 'Reminders',
      color: 'bg-purple-500 text-purple-950 shadow-purple-500/20',
      path: '/reminders',
      roles: ['super_admin', 'admin', 'manager', 'dispatcher', 'supervisor']
    }
  ];

  // Filter actions based on role access
  const role = currentUser?.role || 'user';
  const visibleActions = actions.filter(action => action.roles.includes(role));

  const handleActionClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="md:hidden">
      {/* Floating Action Button (FAB) */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.9 }}
        className={`
          fixed bottom-24 right-5 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg
          transition-colors duration-200 focus:outline-none border border-white/10
          ${isOpen 
            ? 'bg-slate-800 text-rose-400 shadow-slate-900/40 rotate-45' 
            : 'bg-primary text-primary-foreground shadow-primary/30'
          }
        `}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-6 h-6" />}
      </motion.button>

      {/* Backdrop & Drawer Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark glassmorphic backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-[#070a13]/80 backdrop-blur-sm"
            />

            {/* Quick Actions Drawer Container */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              className="fixed bottom-40 right-5 left-5 z-40 bg-[#101424] border border-white/5 rounded-3xl p-5 shadow-elevated"
            >
              <div className="flex items-center gap-1.5 mb-4">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Quick Actions Hub</span>
              </div>

              {/* Grid of Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {visibleActions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    type="button"
                    onClick={() => handleActionClick(action.path)}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/60 border border-white/5 transition-all hover:bg-slate-900"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md mb-2 ${action.color}`}>
                      <action.icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 text-center leading-tight">
                      {action.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
