import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, ShieldCheck, Truck, Package, Users, UserCheck, 
  Building2, Wrench, BrainCircuit, CreditCard, LayoutDashboard, 
  Bell, Search, QrCode, Sun, Moon, ChevronRight, CheckCircle2,
  ArrowUpRight, SlidersHorizontal, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const MARKETPLACE_ROLES = [
  { id: 'customer', label: 'Customer / Shipper', icon: Package, badge: 'Book Cargo', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { id: 'transporter', label: 'Transporter / Fleet Owner', icon: Truck, badge: 'Bid & Assign', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'driver', label: 'Driver / Operator', icon: UserCheck, badge: 'On Duty', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'warehouse', label: 'Warehouse Owner', icon: Building2, badge: 'Storage Host', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { id: 'vendor', label: 'Vendor Partner', icon: Wrench, badge: 'On-Highway Services', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { id: 'admin', label: 'Admin (Marketplace OS)', icon: ShieldCheck, badge: 'Super Control', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
];

export const MARKETPLACE_TABS = [
  { id: 'loads', label: 'Load Marketplace', icon: Package, path: '/marketplace/loads', count: '142 Active' },
  { id: 'vehicles', label: 'Vehicle Marketplace', icon: Truck, path: '/marketplace/vehicles', count: '89 Trucks' },
  { id: 'transporters', label: 'Transport Directory', icon: Users, path: '/marketplace/transporters', count: '54 Verified' },
  { id: 'drivers', label: 'Driver Directory', icon: UserCheck, path: '/marketplace/drivers', count: '120 Active' },
  { id: 'warehouses', label: 'Warehouse Hub', icon: Building2, path: '/marketplace/warehouses', count: '32 Locations' },
  { id: 'vendors', label: 'Vendor Network', icon: Wrench, path: '/marketplace/vendors', count: '210 Services' },
  { id: 'ai-ops', label: 'AI Operations Engine', icon: BrainCircuit, path: '/marketplace/ai-ops', count: '99.4% Match' },
  { id: 'payments', label: 'Payments & Escrow', icon: CreditCard, path: '/marketplace/payments', count: 'Instant Payout' },
  { id: 'customer', label: 'Shipper Dashboard', icon: LayoutDashboard, path: '/marketplace/customer', count: 'Live Tracks' },
  { id: 'admin', label: 'Marketplace OS', icon: ShieldCheck, path: '/marketplace/admin', count: 'System Live' },
];

export default function MarketplaceNav({ activeRole, setActiveRole, notificationsCount = 3, onOpenScanner }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showRoleToast, setShowRoleToast] = useState(false);

  const currentRoleObj = MARKETPLACE_ROLES.find(r => r.id === activeRole) || MARKETPLACE_ROLES[0];
  const CurrentRoleIcon = currentRoleObj.icon;

  const handleRoleChange = (roleId) => {
    setActiveRole(roleId);
    setShowRoleToast(true);
    setTimeout(() => setShowRoleToast(false), 3000);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow backdrop decorative effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          
          {/* Title & Brand */}
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-primary/30 to-amber-500/20 border border-primary/40 rounded-2xl text-primary shadow-lg shadow-primary/20">
              <Sparkles className="w-7 h-7 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                  ENTERPRISE SAAS MARKETPLACE
                </span>
                <Badge variant="outline" className="text-[10px] font-bold text-emerald-400 border-emerald-500/30 font-mono">
                  LIVE ECOSYSTEM
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-heading mt-1 flex items-center gap-2">
                Jai Bhavani Freight Exchange
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                AI Load Matching, Vehicle Marketplace, Warehouses & On-Highway Vendor Network
              </p>
            </div>
          </div>

          {/* Role Switcher & Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
            
            {/* Multi-Role Switcher Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={`h-11 px-4 rounded-2xl border font-bold text-xs gap-2.5 shadow-md ${currentRoleObj.color}`}>
                  <CurrentRoleIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Active Role:</span>
                  <span className="font-extrabold text-white">{currentRoleObj.label}</span>
                  <Badge className="ml-1 text-[9px] bg-slate-900 border border-slate-700 text-slate-200">
                    {currentRoleObj.badge}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-slate-900 border-slate-800 rounded-2xl text-slate-100 p-2 shadow-2xl">
                <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1.5">
                  Select User Perspective (RBAC)
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                {MARKETPLACE_ROLES.map((r) => {
                  const IconComp = r.icon;
                  const isSelected = r.id === activeRole;
                  return (
                    <DropdownMenuItem
                      key={r.id}
                      onClick={() => handleRoleChange(r.id)}
                      className={`cursor-pointer rounded-xl p-2.5 flex items-center justify-between text-xs font-semibold ${isSelected ? 'bg-primary/20 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComp className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                        <span>{r.label}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Action Scanner & Notifications */}
            {onOpenScanner && (
              <Button onClick={onOpenScanner} variant="outline" className="h-11 px-3 bg-slate-900/80 border-slate-800 rounded-2xl text-slate-300 hover:text-white hover:border-slate-700">
                <QrCode className="w-4 h-4 text-amber-400" />
              </Button>
            )}

            <Button onClick={() => navigate('/marketplace/ai-ops')} className="h-11 px-4 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600 rounded-2xl text-primary-foreground font-bold text-xs gap-2 shadow-lg shadow-primary/25">
              <BrainCircuit className="w-4 h-4" /> AI Operations
            </Button>

          </div>
        </div>

        {/* Role Toast Alert */}
        {showRoleToast && (
          <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Marketplace view updated to: <strong>{currentRoleObj.label}</strong>
            </span>
            <span className="text-[10px] font-mono opacity-80">RBAC Active</span>
          </div>
        )}
      </div>

      {/* Marketplace Horizontal Module Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {MARKETPLACE_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = location.pathname === tab.path || (location.pathname === '/marketplace' && tab.id === 'loads');
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                isActive 
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'bg-slate-900/70 hover:bg-slate-800/90 text-slate-300 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <TabIcon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isActive ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
