import React, { useState, useEffect } from 'react';
import { ShieldCheck, BarChart3, Users, Truck, Package, IndianRupee, Sparkles, CheckCircle2, AlertTriangle, FileText, Download, Eye, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function AdminMarketplaceOS() {
  const [stats, setStats] = useState({
    gmv: 0,
    commission: 0,
    activeLoads: 0,
    trucksCount: 0,
    driversCount: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchRealAdminStats = async () => {
    setLoading(true);
    try {
      const [trucks, drivers, trips, cashbook] = await Promise.all([
        pb.collection('trucks').getFullList({ $autoCancel: false }).catch(() => []),
        pb.collection('employees').getFullList({ filter: 'employee_type="driver"', $autoCancel: false }).catch(() => []),
        pb.collection('trip_logs').getFullList({ $autoCancel: false }).catch(() => []),
        pb.collection('cashbook').getFullList({ $autoCancel: false }).catch(() => [])
      ]);

      let totalInflow = 0;
      cashbook.forEach(c => {
        if (c.transaction_type === 'Income' || c.transaction_type === 'Credit') {
          totalInflow += Number(c.amount) || 0;
        }
      });

      setStats({
        gmv: totalInflow,
        commission: Math.round(totalInflow * 0.035),
        activeLoads: trips.length,
        trucksCount: trucks.length,
        driversCount: drivers.length
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealAdminStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-400" /> Marketplace Operating System & Super Control Desk
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real system metrics computed from database fleet, cashbook, drivers, and trip logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={fetchRealAdminStats} variant="outline" className="border-slate-800 rounded-2xl h-11 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh Metrics
          </Button>
          <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 text-xs font-mono font-bold px-3 py-1">
            🟢 Real Database Active
          </Badge>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl">
          <div className="text-[10px] text-slate-400 font-mono">REAL CASHBOOK INFLOW (GMV)</div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            ₹{stats.gmv.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">✓ Recorded Database Income</div>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl">
          <div className="text-[10px] text-slate-400 font-mono">PLATFORM COMMISSION (3.5%)</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">
            ₹{stats.commission.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-amber-400 mt-1">3.5% Marketplace Fee Margin</div>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl">
          <div className="text-[10px] text-slate-400 font-mono">RECORDED TRIP LOADS</div>
          <div className="text-2xl sm:text-3xl font-black text-primary font-mono mt-1">{stats.activeLoads}</div>
          <div className="text-[10px] text-slate-400 mt-1">Database Trip Logs</div>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl">
          <div className="text-[10px] text-slate-400 font-mono">REGISTERED FLEET & DRIVERS</div>
          <div className="text-2xl sm:text-3xl font-black text-teal-400 font-mono mt-1">
            {stats.trucksCount} Trucks / {stats.driversCount} Drivers
          </div>
          <div className="text-[10px] text-teal-400 mt-1">Active Database Records</div>
        </Card>
      </div>
    </div>
  );
}
