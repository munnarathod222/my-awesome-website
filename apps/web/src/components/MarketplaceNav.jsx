import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, ShieldCheck, Truck, Package, Users, UserCheck, 
  Building2, Wrench, BrainCircuit, CreditCard, LayoutDashboard, 
  ChevronRight, CheckCircle2, QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  { id: 'transporter', label: 'Transporter / Fleet Owner', icon: Truck, badge: 'Bid & Fleet', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'driver', label: 'Driver / Operator', icon: UserCheck, badge: 'On Duty', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'warehouse', label: 'Warehouse Owner', icon: Building2, badge: 'Storage Host', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { id: 'vendor', label: 'Vendor Partner', icon: Wrench, badge: 'Highway Services', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { id: 'admin', label: 'Admin (Marketplace OS)', icon: ShieldCheck, badge: 'Super Control', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
];

export const MARKETPLACE_TABS = [
  { id: 'loads', label: 'Load Marketplace', icon: Package, path: '/marketplace/loads' },
  { id: 'vehicles', label: 'Fleet Vehicles', icon: Truck, path: '/marketplace/vehicles' },
  { id: 'transporters', label: 'Transport Partners', icon: Users, path: '/marketplace/transporters' },
  { id: 'drivers', label: 'Driver Directory', icon: UserCheck, path: '/marketplace/drivers' },
  { id: 'warehouses', label: 'Warehouse Space', icon: Building2, path: '/marketplace/warehouses' },
  { id: 'vendors', label: 'Vendor Network', icon: Wrench, path: '/marketplace/vendors' },
  { id: 'ai-ops', label: 'AI Route & Profit Engine', icon: BrainCircuit, path: '/marketplace/ai-ops' },
  { id: 'payments', label: 'Payments & Escrow', icon: CreditCard, path: '/marketplace/payments' },
  { id: 'admin', label: 'Marketplace Control', icon: ShieldCheck, path: '/marketplace/admin' },
];

export default function MarketplaceNav({ activeRole, setActiveRole, onOpenScanner }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentRoleObj = MARKETPLACE_ROLES.find(r => r.id === activeRole) || MARKETPLACE_ROLES[0];
  const CurrentRoleIcon = currentRoleObj.icon;

  const currentPath = location.pathname;

  return (
    <div className="space-y-4 mb-6">
      
      {/* Clean Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 border border-primary/30 rounded-xl text-primary">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Jai Bhavani Freight Exchange
              </h1>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                LIVE
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              AI Freight Rate Calculator, Vehicle Discovery & On-Highway Vendor Network
            </p>
          </div>
        </div>

        {/* Role Switcher & QR Scanner */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onOpenScanner}
            className="h-9 px-3 border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" /> Pass Scanner
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={`h-9 px-3 rounded-xl border font-bold text-xs gap-2 ${currentRoleObj.color}`}>
                <CurrentRoleIcon className="w-3.5 h-3.5" />
                <span className="text-white">{currentRoleObj.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 rounded-xl text-slate-100 p-1.5 shadow-2xl">
              <DropdownMenuLabel className="text-[10px] font-mono uppercase text-slate-400 px-2 py-1">
                Select Role Perspective
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              {MARKETPLACE_ROLES.map((r) => {
                const IconComp = r.icon;
                const isSelected = r.id === activeRole;
                return (
                  <DropdownMenuItem
                    key={r.id}
                    onClick={() => setActiveRole(r.id)}
                    className={`cursor-pointer rounded-lg p-2 flex items-center justify-between text-xs ${isSelected ? 'bg-primary/20 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                      <span>{r.label}</span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      {/* Clean Tab Pill Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {MARKETPLACE_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = currentPath === tab.path || (tab.id === 'loads' && currentPath === '/marketplace');
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive 
                  ? 'bg-primary text-primary-foreground border-primary font-bold shadow-md' 
                  : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
