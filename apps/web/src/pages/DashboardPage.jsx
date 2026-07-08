import React, { useEffect, useState, useRef } from 'react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import {
  ShieldCheck, Truck, Users, Activity, FileCheck,
  AlertCircle, Clock, TrendingUp, BarChart3, Receipt, ArrowRight,
  Zap, IndianRupee, Package, RefreshCw, Sparkles, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
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
          <p className="text-[10px] text-muted-foreground">{format(new Date(trip.date), 'dd MMM')}</p>
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

  const [stats, setStats] = useState({
    users: 0, trips: 0, trucks: 0, pods: 0,
    revenue: 0, grossRevenue: 0, expenses: 0,
    fleetProfit: 0, brokerageProfit: 0, retainedEarnings: 0
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
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

      const [usersRes, deliveredTripsRes, allTripsCount, trucksRes, podsRes, expensesRes, recentTripsRes] = await Promise.all([
        pb.collection('users').getList(1, 1, { $autoCancel: false }),
        // Revenue query — Delivered trips only
        pb.collection('trip_logs').getList(1, 500, {
          filter: REVENUE_FILTER,
          sort: '-date',
          fields: 'id,revenue,ownership_type,brokerage_margin,tds_deducted_receivable',
          $autoCancel: false,
        }),
        // Total shipment count — all statuses (for the KPI card)
        pb.collection('trip_logs').getList(1, 1, { $autoCancel: false }),
        pb.collection('trucks').getList(1, 1, { $autoCancel: false }),
        pb.collection('delivery_proofs').getList(1, 1, { filter: 'status = "Active"', $autoCancel: false }),
        pb.collection('expenses').getList(1, 500, { fields: 'id,amount', $autoCancel: false }),
        // Recent trips — all statuses so dispatcher sees the full picture
        pb.collection('trip_logs').getList(1, 8, {
          sort: '-date',
          fields: 'id,route,truck_number,driver_name,revenue,date,trip_status',
          $autoCancel: false,
        }),
      ]);

      let fleetRevenue = 0, brokerageProfit = 0, totalTds = 0;
      // Only Delivered trips count towards revenue
      deliveredTripsRes.items.forEach(trip => {
        totalTds += Number(trip.tds_deducted_receivable) || 0;
        if (trip.ownership_type === 'Attached') {
          brokerageProfit += Number(trip.brokerage_margin) || 0;
        } else {
          fleetRevenue += Number(trip.revenue) || 0;
        }
      });
      const netFleetRevenue = fleetRevenue - totalTds;
      const fleetExpenses = expensesRes.items.reduce((s, e) => s + (e.amount || 0), 0);
      const fleetProfit = netFleetRevenue - fleetExpenses;

      setStats({
        users: usersRes.totalItems,
        trips: allTripsCount.totalItems,         // all trips (any status)
        deliveredTrips: deliveredTripsRes.totalItems, // completed only
        trucks: trucksRes.totalItems,
        pods: podsRes.totalItems,
        revenue: netFleetRevenue + brokerageProfit,
        grossRevenue: deliveredTripsRes.items.reduce((s, t) => s + (Number(t.revenue) || 0), 0),
        expenses: fleetExpenses, fleetProfit, brokerageProfit,
        retainedEarnings: fleetProfit + brokerageProfit,
      });
      setRecentTrips(recentTripsRes.items);
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
            {currentUser?.full_name || currentUser?.name || 'Fleet Manager'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening across your fleet.</p>
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

      {/* Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-4 gap-3">
        <QuickAction icon={Receipt}     label={t('add_expense')}    onClick={() => setIsExpenseModalOpen(true)}    accentColor="#6366f1" />
        <QuickAction icon={Truck}       label={t('dispatch_trip')}  onClick={() => setIsTripModalOpen(true)}       accentColor="#10b981" />
        <QuickAction icon={IndianRupee} label={t('record_advance')} onClick={() => setIsAdvanceModalOpen(true)}    accentColor="#f59e0b" />
        <QuickAction icon={Zap}         label={t('log_maintenance')} onClick={() => setIsMaintenanceModalOpen(true)} accentColor="#f43f5e" />
      </motion.div>

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

          {/* Idle Vehicles */}
          <motion.div variants={item}>
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
          </motion.div>
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