import React, { useEffect, useState, useRef } from 'react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import {
  ShieldCheck, Truck, Users, Activity, FileCheck,
  AlertCircle, Clock, TrendingUp, BarChart3, Receipt, ArrowRight,
  Zap, IndianRupee, Package, RefreshCw, Sparkles, ChevronRight,
  ShieldAlert, Wrench, AlertTriangle, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import IdleVehiclesComponent from '@/components/IdleVehiclesComponent.jsx';
import { motion } from 'framer-motion';
import ExpenseModal from '@/components/ExpenseModal.jsx';
import AddTripModal from '@/components/AddTripModal.jsx';
import AdvanceEditModal from '@/components/AdvanceEditModal.jsx';
import MaintenanceFormModal from '@/components/MaintenanceFormModal.jsx';
import { Badge } from '@/components/ui/badge';

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCountUp(target, duration = 900) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return display;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, rawValue, displayValue, icon: Icon, description, accentColor, onClick, loading }) => {
  const animated = useCountUp(typeof rawValue === 'number' ? rawValue : 0);
  return (
    <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Card
        onClick={onClick}
        className={`relative overflow-hidden border border-white/5 bg-card/60 backdrop-blur-sm rounded-2xl shadow-lg transition-shadow duration-300 ${onClick ? 'cursor-pointer hover:shadow-xl hover:border-white/15' : ''}`}
      >
        <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl" style={{ background: accentColor || 'hsl(var(--primary))' }} />
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <p className="text-[10px] font-extrabold tracking-widest uppercase text-muted-foreground">{title}</p>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-9 w-28 rounded-lg" />
          ) : (
            <div className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
              {displayValue !== undefined ? displayValue : (typeof rawValue === 'number' ? animated.toLocaleString() : rawValue)}
            </div>
          )}
          {description && <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{description}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ── Quick Action Button ────────────────────────────────────────────────────────
const QuickAction = ({ icon: Icon, label, onClick, accentColor }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.96 }}
    className="flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border border-white/5 bg-card/50 backdrop-blur-sm hover:border-white/15 hover:bg-white/5 transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: accentColor + '18' }}>
      <Icon className="w-5 h-5" style={{ color: accentColor }} />
    </div>
    <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors leading-tight text-center">{label}</span>
  </motion.button>
);

// ── Trip Row ──────────────────────────────────────────────────────────────────
const TripRow = ({ trip }) => {
  const statusMap = {
    Dispatched: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Delivered:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Upcoming:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Cancelled:  'bg-red-500/15 text-red-400 border-red-500/30',
  };
  const statusCls = statusMap[trip.trip_status] || 'bg-secondary text-muted-foreground border-border/40';
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/30 bg-secondary/10 hover:bg-secondary/25 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
          <Truck className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground truncate max-w-[170px]">{trip.route || '—'}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{trip.truck_number} · {trip.driver_name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusCls} hidden sm:inline-flex`}>
          {trip.trip_status}
        </span>
        <div className="text-right">
          <p className="font-bold text-sm text-foreground">₹{(trip.revenue || 0).toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">
            {(() => {
              if (!trip.date) return 'Today';
              try {
                const parsed = new Date(trip.date);
                return isNaN(parsed.getTime()) ? 'Today' : format(parsed, 'dd MMM');
              } catch (e) {
                return 'Today';
              }
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { isSuperAdmin, isAdmin } = useRoleBasedAccess();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.role === 'Client' || currentUser?.role === 'client') {
      navigate('/client-portal', { replace: true });
    }
  }, [currentUser, navigate]);

  const [stats, setStats] = useState({
    users: 0, trips: 0, trucks: 0, pods: 0,
    revenue: 0, grossRevenue: 0, expenses: 0,
    fleetProfit: 0, brokerageProfit: 0, retainedEarnings: 0
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [openProblems, setOpenProblems] = useState([]);
  const [fastagList, setFastagList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      // Revenue calculation: ONLY Delivered trips (Upcoming/Dispatched/In Transit excluded)
      const REVENUE_FILTER = 'trip_status = "Delivered"';

      const [
        usersRes, 
        deliveredTripsRes, 
        allTripsCount, 
        trucksRes, 
        podsRes, 
        expensesRes, 
        recentTripsRes, 
        docsRes,
        upcomingTripsCount,
        dispatchedTripsCount,
        inTransitTripsCount,
        maintenanceProblemsRes
      ] = await Promise.all([
        pb.collection('users').getList(1, 1, { $autoCancel: false }).catch(() => ({ totalItems: 0, items: [] })),
        // Revenue query — Delivered trips only
        pb.collection('trip_logs').getList(1, 500, {
          filter: REVENUE_FILTER,
          sort: '-date',
          fields: 'id,revenue,ownership_type,brokerage_margin,tds_deducted_receivable',
          $autoCancel: false,
        }).catch(() => ({ totalItems: 0, items: [] })),
        // Total shipment count — all statuses (for the KPI card)
        pb.collection('trip_logs').getList(1, 1, { $autoCancel: false }).catch(() => ({ totalItems: 0, items: [] })),
        pb.collection('trucks').getFullList({ fields: 'id,truck_number,current_fastag_balance', $autoCancel: false }).catch(() => []),
        pb.collection('delivery_proofs').getList(1, 1, { filter: 'status = "Active"', $autoCancel: false }).catch(() => ({ totalItems: 0, items: [] })),
        pb.collection('expenses').getList(1, 500, { fields: 'id,amount', $autoCancel: false }).catch(() => ({ totalItems: 0, items: [] })),
        // Recent trips — all statuses so dispatcher sees the full picture
        pb.collection('trip_logs').getList(1, 8, {
          sort: '-date',
          fields: 'id,route,truck_number,driver_name,revenue,date,trip_status',
          $autoCancel: false,
        }).catch(() => ({ totalItems: 0, items: [] })),
        pb.collection('truck_documents').getFullList({ filter: 'status = "Active"', fields: 'id,expiry_date,truck_id', $autoCancel: false }).catch(() => []),
        
        // Status Counts
        pb.collection('trip_logs').getList(1, 1, { filter: 'trip_status = "Upcoming"', $autoCancel: false }).catch(() => ({ totalItems: 0, items: [] })),
        pb.collection('trip_logs').getList(1, 1, { filter: 'trip_status = "Dispatched"', $autoCancel: false }).catch(() => ({ totalItems: 0, items: [] })),
        pb.collection('trip_logs').getList(1, 1, { filter: 'trip_status = "In Transit"', $autoCancel: false }).catch(() => ({ totalItems: 0, items: [] })),
        
        // Open Maintenance Problems
        pb.collection('maintenance_problems').getList(1, 5, { filter: 'status = "Open"', sort: '-date_reported', $autoCancel: false }).catch(() => ({ totalItems: 0, items: [] }))
      ]);

      let fleetRevenue = 0, brokerageProfit = 0, totalTds = 0;
      const deliveredItems = deliveredTripsRes?.items || [];
      const expenseItems = expensesRes?.items || [];
      const safeTrucks = Array.isArray(trucksRes) ? trucksRes : (trucksRes?.items || []);
      const safeDocs = Array.isArray(docsRes) ? docsRes : (docsRes?.items || []);

      // Only Delivered trips count towards revenue
      deliveredItems.forEach(trip => {
        totalTds += Number(trip.tds_deducted_receivable) || 0;
        if (trip.ownership_type === 'Attached') {
          brokerageProfit += Number(trip.brokerage_margin) || 0;
        } else {
          fleetRevenue += Number(trip.revenue) || 0;
        }
      });
      const netFleetRevenue = fleetRevenue - totalTds;
      const fleetExpenses = expenseItems.reduce((s, e) => s + (e.amount || 0), 0);
      const fleetProfit = netFleetRevenue - fleetExpenses;

      // Low Fastag count
      const lowFastagCount = safeTrucks.filter(t => t && t.current_fastag_balance !== undefined && t.current_fastag_balance !== null && t.current_fastag_balance < 2000).length;

      // Expiring docs count
      let expiringDocsCount = 0;
      const todayDate = new Date();
      safeDocs.forEach(doc => {
        if (!doc || !doc.expiry_date) return;
        const expDate = new Date(doc.expiry_date);
        const daysLeft = differenceInDays(expDate, todayDate);
        if (daysLeft <= 30) {
          expiringDocsCount++;
        }
      });

      // Sorted FASTag balance list (lowest first)
      const sortedFastag = [...safeTrucks]
        .filter(t => t && t.current_fastag_balance !== undefined && t.current_fastag_balance !== null)
        .sort((a, b) => (a.current_fastag_balance || 0) - (b.current_fastag_balance || 0))
        .slice(0, 5);

      setStats({
        users: usersRes?.totalItems || 0,
        trips: allTripsCount?.totalItems || 0,         // all trips (any status)
        deliveredTrips: deliveredTripsRes?.totalItems || 0, // completed only
        upcomingTrips: upcomingTripsCount?.totalItems || 0,
        dispatchedTrips: dispatchedTripsCount?.totalItems || 0,
        inTransitTrips: inTransitTripsCount?.totalItems || 0,
        trucks: safeTrucks.length,
        pods: podsRes?.totalItems || 0,
        revenue: netFleetRevenue + brokerageProfit,
        grossRevenue: deliveredItems.reduce((s, t) => s + (Number(t.revenue) || 0), 0),
        expenses: fleetExpenses, fleetProfit, brokerageProfit,
        retainedEarnings: fleetProfit + brokerageProfit,
        lowFastagCount,
        expiringDocsCount,
        totalAlertsCount: lowFastagCount + expiringDocsCount
      });
      setRecentTrips(recentTripsRes?.items || []);
      setOpenProblems(maintenanceProblemsRes?.items || []);
      setFastagList(sortedFastag);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('[Dashboard] fetch error:', err);
      setError('Failed to load dashboard statistics. Please check your connection.');
      toast.error('Dashboard load failed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPendingRequests = async () => {
    if (!isAdmin && !isSuperAdmin) return;
    setLoadingRequests(true);
    try {
      const res = await pb.collection('signup_requests').getList(1, 1, {
        filter: 'status = "Pending"',
        $autoCancel: false,
      });
      setPendingRequestsCount(res.totalItems);
    } catch (err) {
      console.error('[Dashboard] signup_requests error:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchPendingRequests();
  }, []);

  if (loading) return <LoadingSpinner text="Compiling fleet data…" />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Error</h2>
        <p className="text-muted-foreground mb-6 max-w-sm text-sm">{error}</p>
        <Button onClick={() => fetchDashboardData()} className="rounded-xl gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </Button>
      </div>
    );
  }

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } };
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.div
      className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-10 pt-5 space-y-5"
      initial="hidden" animate="visible" variants={container}
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-primary">{greeting}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-foreground">
            {currentUser?.full_name || currentUser?.name || (currentUser?.role === 'super_admin' || currentUser?.id === 'usr_munna_superadmin' ? 'Vinod kumar Rathod' : 'Fleet Manager')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {currentUser?.role === 'super_admin' ? 'Super Admin Fleet Controller — Here\'s what\'s happening across your fleet.' : 'Here\'s what\'s happening across your fleet.'}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-border/50 bg-secondary/30 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span className="capitalize">{currentUser?.role?.replace('_', ' ')}</span>
          </div>
          <Button
            variant="outline" size="sm"
            className="rounded-xl gap-2 text-xs border-border/50 hover:border-primary/40"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing…' : `${format(lastRefreshed, 'HH:mm')}`}
          </Button>
        </div>
      </motion.div>

      {/* Critical Fleet Alerts Banner */}
      {(isAdmin || isSuperAdmin) && stats.totalAlertsCount > 0 && (
        <motion.div variants={item}>
          <motion.div
            whileHover={{ scale: 1.002 }}
            onClick={() => {
              const fleetEl = document.getElementById('fleet-status-hub');
              if (fleetEl) {
                fleetEl.scrollIntoView({ behavior: 'smooth' });
                const alertsTabBtn = document.querySelector('[value="alerts"]');
                if (alertsTabBtn) alertsTabBtn.click();
              }
            }}
            className="cursor-pointer flex items-center justify-between p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-rose-500/15 rounded-xl text-rose-500">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-rose-500 text-sm">Critical Fleet Compliance Warnings</p>
                <p className="text-xs text-rose-500/70 mt-0.5">
                  You have <strong>{stats.totalAlertsCount}</strong> unresolved alerts: 
                  {stats.expiringDocsCount > 0 ? ` ${stats.expiringDocsCount} document expiries` : ''}
                  {stats.lowFastagCount > 0 ? `${stats.expiringDocsCount > 0 ? ' and' : ''} ${stats.lowFastagCount} low FASTag balances` : ''}. 
                  Action required to keep operations running smoothly.
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="rounded-xl gap-1 hover:bg-rose-500/15 text-rose-500 hover:text-rose-400 text-xs">
              Resolve Alerts <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Pending Requests Alert */}
      {(isAdmin || isSuperAdmin) && (
        <motion.div variants={item}>
          {loadingRequests ? (
            <Skeleton className="h-[68px] w-full rounded-2xl" />
          ) : pendingRequestsCount > 0 ? (
            <motion.div
              whileHover={{ scale: 1.005 }}
              onClick={() => navigate('/dashboard/users?tab=signup-requests')}
              className="cursor-pointer flex items-center justify-between p-4 rounded-2xl border border-destructive/25 bg-destructive/5 hover:bg-destructive/10 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-destructive/15 rounded-xl text-destructive">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-destructive text-sm">Pending Signup Requests</p>
                  <p className="text-xs text-destructive/70 mt-0.5">
                    <strong>{pendingRequestsCount}</strong> new account{pendingRequestsCount > 1 ? 's' : ''} awaiting approval.
                  </p>
                </div>
              </div>
              <Button size="sm" variant="destructive" className="rounded-xl gap-1.5 hidden sm:flex text-xs">
                Review <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          ) : null}
        </motion.div>
      )}


      {(isSuperAdmin || isAdmin) ? (
        <>
          {/* KPI Grid */}
          <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard loading={loading} title="Net Revenue"
              rawValue={Math.round(stats.revenue)}
              displayValue={`₹${Math.round(stats.revenue).toLocaleString()}`}
              icon={Activity} accentColor="#6366f1"
              description={`Delivered trips only · Gross ₹${Math.round(stats.grossRevenue).toLocaleString()}`}
              onClick={() => navigate('/analytics?tab=revenue')}
            />
            <StatCard loading={loading} title="Retained Earnings"
              rawValue={Math.round(stats.retainedEarnings)}
              displayValue={`₹${Math.round(stats.retainedEarnings).toLocaleString()}`}
              icon={TrendingUp}
              accentColor={stats.retainedEarnings >= 0 ? '#10b981' : '#f43f5e'}
              description={`Fleet ₹${Math.round(stats.fleetProfit).toLocaleString()} · Brokerage ₹${Math.round(stats.brokerageProfit).toLocaleString()}`}
              onClick={() => navigate('/analytics')}
            />
            <StatCard loading={loading} title="Total Shipments"
              rawValue={stats.trips} icon={Package} accentColor="#8b5cf6"
              description={`${stats.deliveredTrips ?? 0} delivered · ${(stats.trips || 0) - (stats.deliveredTrips || 0)} in progress`}
              onClick={() => navigate('/analytics?tab=shipments')}
            />
            <StatCard loading={loading} title="Fleet Size"
              rawValue={stats.trucks} icon={Truck} accentColor="#f59e0b"
              description="Registered vehicles"
            />
          </motion.div>



          {/* Active Operations Pipeline Status */}
          <motion.div variants={item}>
            <Card className="border border-border/40 bg-card/45 backdrop-blur-sm rounded-2xl shadow-md p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/30 pb-3 mb-4">
                <div>
                  <CardTitle className="text-sm font-heading flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> Active Shipment Pipeline
                  </CardTitle>
                  <CardDescription className="text-xs">Real-time status of active logistical jobs</CardDescription>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                {/* Upcoming Node */}
                <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border/20 rounded-xl">
                  <div className="p-2 bg-slate-500/10 rounded-lg text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Upcoming</span>
                    <p className="text-lg font-extrabold text-foreground mt-0.5">{stats.upcomingTrips || 0}</p>
                  </div>
                </div>
                {/* Dispatched Node */}
                <div className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-400/80 uppercase font-bold tracking-wider">Dispatched</span>
                    <p className="text-lg font-extrabold text-blue-400 mt-0.5">{stats.dispatchedTrips || 0}</p>
                  </div>
                </div>
                {/* In Transit Node */}
                <div className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400/80 uppercase font-bold tracking-wider">In Transit</span>
                    <p className="text-lg font-extrabold text-amber-400 mt-0.5">{stats.inTransitTrips || 0}</p>
                  </div>
                </div>
                {/* Delivered Node */}
                <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400/80 uppercase font-bold tracking-wider">Delivered</span>
                    <p className="text-lg font-extrabold text-emerald-400 mt-0.5">{stats.deliveredTrips || 0}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Fleet Status Hub */}
          <motion.div variants={item} id="fleet-status-hub">
            <IdleVehiclesComponent />
          </motion.div>

          {/* Recent Trips + System Health */}
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/30 px-5 pt-5">
                <div>
                  <CardTitle className="text-base font-heading">{t('recent_shipments')}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Latest 8 trips in the system</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="rounded-xl text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10">
                  <Link to="/trip-logs">All trips <ChevronRight className="w-3.5 h-3.5" /></Link>
                </Button>
              </CardHeader>
              <CardContent className="p-3 space-y-1.5">
                {recentTrips.length === 0 ? (
                  <div className="text-center py-10">
                    <Truck className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No shipments yet.</p>
                    <Button size="sm" className="mt-3 rounded-xl" onClick={() => setIsTripModalOpen(true)}>
                      Dispatch First Trip
                    </Button>
                  </div>
                ) : (
                  recentTrips.map(trip => <TripRow key={trip.id} trip={trip} />)
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl shadow-md">
                <CardHeader className="pb-3 border-b border-border/30 px-5 pt-5">
                  <CardTitle className="text-base font-heading">{t('system_health')}</CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-4 space-y-5">
                  {[
                    { label: 'PODs Pending', value: stats.pods, pct: stats.trips ? Math.min(Math.round((stats.pods / stats.trips) * 100), 100) : 0, color: '#f59e0b' },
                    { label: 'Registered Users', value: stats.users, pct: Math.min(stats.users * 10, 100), color: '#10b981' },
                    { label: 'Fleet Utilisation', value: null, pct: 78, color: '#6366f1' },
                  ].map(({ label, value, pct, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-foreground">{label}</span>
                        <span className="text-muted-foreground font-bold">{value !== null ? value : `${pct}%`}</span>
                      </div>
                      <div className="w-full bg-secondary/60 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.9, ease: 'easeOut' }}
                          className="h-1.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-border/30 space-y-2">
                    <Button className="w-full rounded-xl text-xs gap-2" variant="outline" onClick={() => navigate('/analytics')}>
                      <BarChart3 className="w-3.5 h-3.5" /> Full Analytics
                    </Button>
                    <Button className="w-full rounded-xl text-xs gap-2" variant="outline" onClick={() => navigate('/reports')}>
                      <FileCheck className="w-3.5 h-3.5" /> View Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance & Operations Action Center */}
              <Card className="border border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/30 px-5 pt-5 bg-muted/5">
                  <div>
                    <CardTitle className="text-base font-heading flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" /> Compliance Action Center
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">High-priority operational checklists</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-3.5">
                  {/* 1. Low FASTag Alerts */}
                  {stats.lowFastagCount > 0 && (
                    <div 
                      onClick={() => {
                        const fleetEl = document.getElementById('fleet-status-hub');
                        if (fleetEl) {
                          fleetEl.scrollIntoView({ behavior: 'smooth' });
                          const alertsTabBtn = document.querySelector('[value="alerts"]');
                          if (alertsTabBtn) alertsTabBtn.click();
                        }
                      }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/15 hover:bg-amber-500/15 transition-all cursor-pointer group"
                    >
                      <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-500 mt-0.5">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors">Recharge FASTags</p>
                        <p className="text-[10px] text-amber-400/80 mt-0.5"><strong>{stats.lowFastagCount}</strong> trucks have balances under ₹2,000</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-500/50 self-center group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}

                  {/* 2. Expiring Document Alerts */}
                  {stats.expiringDocsCount > 0 && (
                    <div 
                      onClick={() => {
                        const fleetEl = document.getElementById('fleet-status-hub');
                        if (fleetEl) {
                          fleetEl.scrollIntoView({ behavior: 'smooth' });
                          const alertsTabBtn = document.querySelector('[value="alerts"]');
                          if (alertsTabBtn) alertsTabBtn.click();
                        }
                      }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/15 hover:bg-rose-500/15 transition-all cursor-pointer group"
                    >
                      <div className="p-1.5 bg-rose-500/20 rounded-lg text-rose-500 mt-0.5">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-rose-400 group-hover:text-rose-300 transition-colors">Renew Fleet Permits</p>
                        <p className="text-[10px] text-rose-400/80 mt-0.5"><strong>{stats.expiringDocsCount}</strong> credentials expiring within 30 days</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-500/50 self-center group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}

                  {/* 3. Pending User Approvals */}
                  {pendingRequestsCount > 0 && (
                    <div 
                      onClick={() => navigate('/dashboard/users?tab=signup-requests')}
                      className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/15 hover:bg-blue-500/15 transition-all cursor-pointer group"
                    >
                      <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-500 mt-0.5">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-blue-400 group-hover:text-blue-300 transition-colors">Approve User Access</p>
                        <p className="text-[10px] text-blue-400/80 mt-0.5"><strong>{pendingRequestsCount}</strong> signup requests awaiting review</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-blue-500/50 self-center group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}

                  {/* 4. Pending POD Verification */}
                  {stats.pods > 0 && (
                    <div 
                      onClick={() => navigate('/pod-management')}
                      className="flex items-start gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/15 hover:bg-violet-500/15 transition-all cursor-pointer group"
                    >
                      <div className="p-1.5 bg-violet-500/20 rounded-lg text-violet-500 mt-0.5">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-violet-400 group-hover:text-violet-300 transition-colors">Verify Delivery Proofs</p>
                        <p className="text-[10px] text-violet-400/80 mt-0.5"><strong>{stats.pods}</strong> PODs require validation & archival</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-violet-500/50 self-center group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}

                  {/* If all compliance is resolved */}
                  {stats.lowFastagCount === 0 && stats.expiringDocsCount === 0 && pendingRequestsCount === 0 && stats.pods === 0 && (
                    <div className="py-6 text-center text-muted-foreground flex flex-col items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-emerald-500 mb-2 opacity-75" />
                      <p className="text-xs font-bold text-foreground">Fleet is fully compliant</p>
                      <p className="text-[10px] mt-0.5">All certifications, fastags, and signups are resolved.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Breakdowns & FASTag Wallets */}
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/30 px-5 pt-5">
                <div>
                  <CardTitle className="text-base font-heading flex items-center gap-2">
                    <Wrench className="w-4.5 h-4.5 text-primary" /> Active Breakdowns & Maintenance
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">Unresolved vehicle maintenance issues filed by drivers</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsMaintenanceModalOpen(true)}
                  className="rounded-xl text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Issue
                </Button>
              </CardHeader>
              <CardContent className="p-5">
                {openProblems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-emerald-500 mb-2 opacity-75" />
                    <p className="text-xs font-bold text-foreground">No active breakdown tickets</p>
                    <p className="text-[10px] mt-0.5">All fleet vehicle maintenance requests are resolved.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {openProblems.map(prob => {
                      const isHigh = prob.severity === 'High';
                      return (
                        <div key={prob.id} className="flex justify-between items-start gap-4 p-3 rounded-xl bg-muted/10 border border-border/30 hover:bg-muted/20 transition-all">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground font-mono">{prob.truck_id ? prob.truck_id : 'Unknown Truck'}</span>
                              <span className="text-[10px] text-muted-foreground font-medium">({prob.category})</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-normal">{prob.description}</p>
                            <p className="text-[9px] text-muted-foreground/60">{prob.date_reported ? new Date(prob.date_reported).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-'}</p>
                          </div>
                          <Badge 
                            variant={isHigh ? 'destructive' : 'warning'}
                            className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border-0"
                          >
                            {prob.severity}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/30 px-5 pt-5">
                <div>
                  <CardTitle className="text-base font-heading flex items-center gap-2">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-500" /> FASTag Balance Monitor
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">Top 5 lowest FASTag account balances</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {fastagList.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-xs">
                    No FASTag balance data available.
                  </div>
                ) : (
                  fastagList.map(truck => {
                    const balance = truck.current_fastag_balance || 0;
                    const isLow = balance < 2000;
                    const pct = Math.min(100, Math.max(0, (balance / 5000) * 100)); // cap at 5000 as visual baseline
                    
                    return (
                      <div key={truck.id} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-foreground font-mono">{truck.truck_number}</span>
                          <span className={`font-bold tabular-nums ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                            ₹{balance.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-secondary/60 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${isLow ? 'bg-rose-500' : 'bg-primary'}`} 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>
          {/* Network metrics removed */}
        </>
      ) : (
        <motion.div variants={item} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title={t('assigned_shipments')} rawValue={stats.trips} icon={Truck} accentColor="#6366f1" onClick={() => navigate('/analytics?tab=shipments')} />
            <StatCard title={t('pending_pods')} rawValue={stats.pods} icon={FileCheck} accentColor="#f59e0b" />
            <StatCard title={t('active_tasks')} rawValue={12} icon={Clock} accentColor="#8b5cf6" />
          </div>
          <IdleVehiclesComponent />
        </motion.div>
      )}

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={() => { setIsExpenseModalOpen(false); fetchDashboardData(true); }}
      />
      <AddTripModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        onSuccess={() => { setIsTripModalOpen(false); fetchDashboardData(true); }}
      />
      <AdvanceEditModal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        onSuccess={() => { setIsAdvanceModalOpen(false); fetchDashboardData(true); }}
      />
      <MaintenanceFormModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        onSuccess={() => { setIsMaintenanceModalOpen(false); fetchDashboardData(true); }}
      />
    </motion.div>
  );
};

export default DashboardPage;