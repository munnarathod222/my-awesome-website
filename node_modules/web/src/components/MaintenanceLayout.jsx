import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Bell, Wrench, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/maintenance', icon: LayoutDashboard },
  { name: 'Logs', path: '/maintenance/logs', icon: ClipboardList },
  { name: 'Reminders', path: '/maintenance/reminders', icon: Bell },
  { name: 'Parts', path: '/maintenance/parts', icon: Wrench },
  { name: 'Problems', path: '/maintenance/problems', icon: AlertTriangle },
];

export default function MaintenanceLayout({ children }) {
  const location = useLocation();

  return (
    <div className="flex flex-col md:flex-row min-h-full w-full bg-background">
      {/* Sub-sidebar for Maintenance */}
      <aside className="w-full md:w-64 border-r border-border/50 bg-card/50 shrink-0">
        <div className="p-6">
          <h2 className="text-lg font-heading font-bold tracking-tight">Maintenance Hub</h2>
          <p className="text-sm text-muted-foreground">Manage fleet health</p>
        </div>
        <nav className="px-4 pb-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}