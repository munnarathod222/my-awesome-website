import React, { useState } from 'react';
import { ShieldCheck, BarChart3, Users, Truck, Package, IndianRupee, Sparkles, CheckCircle2, AlertTriangle, FileText, Download, Eye, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminMarketplaceOS() {
  const [verifications, setVerifications] = useState([
    { id: 'VER-101', entity: 'Gujarat Synthetics Ltd', type: 'Shipper / Corporate', doc: 'GSTIN & PAN', status: 'Pending Review' },
    { id: 'VER-102', entity: 'Dayanand Surwase', type: 'Driver', doc: 'Heavy Vehicle Commercial DL', status: 'Pending Review' },
    { id: 'VER-103', entity: 'FrostLine Cold Chain', type: 'Warehouse & Fleet', doc: 'ISO & FSSAI License', status: 'Verified' }
  ]);

  const handleVerify = (id) => {
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'Verified' } : v));
    toast.success(`Verification ${id} approved successfully!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-400" /> Marketplace Operating System & Super Control Desk
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Master control center for marketplace commissions, platform revenue, user verifications & compliance.
          </p>
        </div>

        <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 text-xs font-mono font-bold px-3 py-1">
          🟢 Marketplace System Operational
        </Badge>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl">
          <div className="text-[10px] text-slate-400 font-mono">GROSS MARKETPLACE GMV</div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">₹42.8 Lakhs</div>
          <div className="text-[10px] text-emerald-400 mt-1">↑ +18.4% this month</div>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl">
          <div className="text-[10px] text-slate-400 font-mono">PLATFORM COMMISSION EARNED</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">₹1,49,800</div>
          <div className="text-[10px] text-amber-400 mt-1">3.5% Avg Marketplace Fee</div>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl">
          <div className="text-[10px] text-slate-400 font-mono">ACTIVE FREIGHT LOADS</div>
          <div className="text-2xl sm:text-3xl font-black text-primary font-mono mt-1">142</div>
          <div className="text-[10px] text-slate-400 mt-1">across 48 National Routes</div>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl">
          <div className="text-[10px] text-slate-400 font-mono">VERIFIED PARTNERS</div>
          <div className="text-2xl sm:text-3xl font-black text-teal-400 font-mono mt-1">54 Transporters</div>
          <div className="text-[10px] text-teal-400 mt-1">89 Commercial Trucks</div>
        </Card>
      </div>

      {/* Document Verification Queue */}
      <Card className="bg-slate-900/80 border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-400" /> Compliance & User Verification Desk
          </h3>
          <Badge variant="outline" className="text-[10px] text-slate-400 font-mono">
            {verifications.filter(v => v.status === 'Pending Review').length} Pending Requests
          </Badge>
        </div>

        <div className="space-y-2.5">
          {verifications.map((v) => (
            <div key={v.id} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400">{v.id}</span>
                  <Badge variant="outline" className="text-[9px] text-slate-300 border-slate-700">
                    {v.type}
                  </Badge>
                </div>
                <div className="text-white font-extrabold mt-0.5">{v.entity}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Document submitted: {v.doc}</div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {v.status === 'Verified' ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-bold px-3 py-1">
                    ✓ Verified & Active
                  </Badge>
                ) : (
                  <Button 
                    size="sm"
                    onClick={() => handleVerify(v.id)}
                    className="h-8 px-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs rounded-xl shadow-md"
                  >
                    Approve Verification
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
