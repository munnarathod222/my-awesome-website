import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  Package, Truck, Users, UserCheck, Building2, Wrench, BrainCircuit, 
  CreditCard, LayoutDashboard, ShieldCheck, Plus, Search, Filter, Sparkles, 
  MapPin, Calendar, IndianRupee, ArrowRight, CheckCircle2, AlertTriangle, 
  Clock, Download, ExternalLink, RefreshCw, Star, Shield, Phone, Eye, DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import MarketplaceNav, { MARKETPLACE_ROLES } from '@/components/MarketplaceNav.jsx';
import pb from '@/lib/pocketbaseClient.js';

// Sub-modules
import LoadMarketplace from './LoadMarketplace.jsx';
import VehicleMarketplace from './VehicleMarketplace.jsx';
import TransporterDirectory from './TransporterDirectory.jsx';
import DriverMarketplace from './DriverMarketplace.jsx';
import WarehouseMarketplace from './WarehouseMarketplace.jsx';
import VendorServicesMarketplace from './VendorServicesMarketplace.jsx';
import AIOperationsEngine from './AIOperationsEngine.jsx';
import PaymentsEscrowHub from './PaymentsEscrowHub.jsx';
import AdminMarketplaceOS from './AdminMarketplaceOS.jsx';

export default function MarketplaceHub() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState('customer');
  const [scannerOpen, setScannerOpen] = useState(false);

  // Determine active tab from URL path
  const currentPath = location.pathname;
  let activeTab = 'loads';
  if (currentPath.includes('/vehicles')) activeTab = 'vehicles';
  else if (currentPath.includes('/transporters')) activeTab = 'transporters';
  else if (currentPath.includes('/drivers')) activeTab = 'drivers';
  else if (currentPath.includes('/warehouses')) activeTab = 'warehouses';
  else if (currentPath.includes('/vendors')) activeTab = 'vendors';
  else if (currentPath.includes('/ai-ops')) activeTab = 'ai-ops';
  else if (currentPath.includes('/payments')) activeTab = 'payments';
  else if (currentPath.includes('/customer')) activeTab = 'customer';
  else if (currentPath.includes('/admin')) activeTab = 'admin';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <Helmet>
        <title>AI Freight Marketplace | Jai Bhavani Cargo</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Marketplace Navigation Bar & Role Switcher */}
        <MarketplaceNav 
          activeRole={activeRole} 
          setActiveRole={setActiveRole} 
          onOpenScanner={() => setScannerOpen(true)} 
        />

        {/* Dynamic Module Content Rendering */}
        {activeTab === 'loads' && <LoadMarketplace activeRole={activeRole} />}
        {activeTab === 'vehicles' && <VehicleMarketplace activeRole={activeRole} />}
        {activeTab === 'transporters' && <TransporterDirectory activeRole={activeRole} />}
        {activeTab === 'drivers' && <DriverMarketplace activeRole={activeRole} />}
        {activeTab === 'warehouses' && <WarehouseMarketplace activeRole={activeRole} />}
        {activeTab === 'vendors' && <VendorServicesMarketplace activeRole={activeRole} />}
        {activeTab === 'ai-ops' && <AIOperationsEngine activeRole={activeRole} />}
        {activeTab === 'payments' && <PaymentsEscrowHub activeRole={activeRole} />}
        {activeTab === 'customer' && <LoadMarketplace activeRole={activeRole} isShipperView={true} />}
        {activeTab === 'admin' && <AdminMarketplaceOS activeRole={activeRole} />}

      </div>

      {/* Quick QR Code / Pass Scanner Dialog */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-3xl p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Marketplace QR Scanner
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Scan load passes, vehicle verification stickers, or warehouse receipt QR codes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-center">
            <div className="w-48 h-48 mx-auto border-2 border-dashed border-primary/50 rounded-2xl flex flex-col items-center justify-center p-4 bg-slate-950/60">
              <Package className="w-12 h-12 text-primary animate-bounce mb-2" />
              <span className="text-xs text-slate-400 font-mono">Camera Ready • Scan QR</span>
            </div>
            
            <div className="space-y-2">
              <Input 
                placeholder="Or enter Pass / Load Token ID (e.g. LOAD-8921)" 
                className="bg-slate-950 border-slate-800 text-xs rounded-xl text-center font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    navigate(`/v/${e.target.value.trim()}`);
                    setScannerOpen(false);
                  }
                }}
              />
              <p className="text-[10px] text-slate-500">Press Enter to lookup instant verification pass</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setScannerOpen(false)} className="w-full rounded-xl text-xs">
              Close Scanner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
