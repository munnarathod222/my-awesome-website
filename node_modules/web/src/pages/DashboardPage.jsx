import React, { useEffect, useState } from 'react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Truck, Users, Activity, FileCheck, CheckCircle, AlertCircle, Clock, TrendingUp, BarChart3, Receipt, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import IdleVehiclesComponent from '@/components/IdleVehiclesComponent.jsx';
import { motion } from 'framer-motion';
import ExpenseModal from '@/components/ExpenseModal.jsx';
import AddTripModal from '@/components/AddTripModal.jsx';
import AdvanceEditModal from '@/components/AdvanceEditModal.jsx';
import MaintenanceFormModal from '@/components/MaintenanceFormModal.jsx';

const StatCard = ({ title, value, icon: Icon, trend, textClass, description, onClick }) => (
  <Card 
    className={`bg-card shadow-soft border-border/50 rounded-2xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-elevated hover:border-primary/50' : 'hover:shadow-md'}`}
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="tracking-tight text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2.5 bg-secondary/50 rounded-xl">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="flex flex-col mt-3">
        <div className={`text-4xl font-heading font-extrabold tracking-tight ${textClass || 'text-foreground'}`}>{value}</div>
        {trend && (
          <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1.5 font-medium">
            <span className="flex items-center text-success bg-success/10 px-1.5 py-0.5 rounded-md text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </span>
            <span>from last month</span>
          </p>
        )}
        {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
      </div>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { isSuperAdmin, isAdmin, isManager, isDispatcher } = useRoleBasedAccess();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ 
    users: 0, 
    trips: 0, 
    trucks: 0, 
    pods: 0, 
    revenue: 0, 
    grossRevenue: 0, 
    expenses: 0,
    fleetProfit: 0,
    brokerageProfit: 0,
    retainedEarnings: 0
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const promises = [
        pb.collection('users').getList(1, 1, { $autoCancel: false }),
        pb.collection('trip_logs').getList(1, 500, { sort: '-created', $autoCancel: false }),
        pb.collection('trucks').getList(1, 1, { $autoCancel: false }),
        pb.collection('delivery_proofs').getList(1, 1, { filter: 'status = "Active"', $autoCancel: false }),
        pb.collection('expenses').getList(1, 500, { $autoCancel: false }),
        pb.collection('trip_logs').getList(1, 5, { sort: '-created', expand: 'user_id', $autoCancel: false })
      ];

      const results = await Promise.all(promises);
      const [usersRes, tripsRes, trucksRes, podsRes, expensesRes, recentTripsRes] = results;

      const totalRevenue = tripsRes.items.reduce((sum, trip) => sum + (trip.revenue || 0), 0);
      const totalTds = tripsRes.items.reduce((sum, trip) => sum + (Number(trip.tds_deducted_receivable) || 0), 0);
      
      let fleetRevenue = 0;
      let brokerageProfit = 0;
      
      tripsRes.items.forEach(trip => {
        const rev = Number(trip.revenue) || 0;
        if (trip.ownership_type === 'Attached') {
          brokerageProfit += Number(trip.brokerage_margin) || 0;
        } else {
          fleetRevenue += rev;
        }
      });
      
      const netFleetRevenue = fleetRevenue - totalTds;
      const fleetExpenses = expensesRes.items.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const fleetProfit = netFleetRevenue - fleetExpenses;
      const totalRetainedEarnings = fleetProfit + brokerageProfit;

      setStats({
        users: usersRes.totalItems,
        trips: tripsRes.totalItems,
        trucks: trucksRes.totalItems,
        pods: podsRes.totalItems,
        revenue: netFleetRevenue + brokerageProfit,
        grossRevenue: totalRevenue,
        expenses: fleetExpenses,
        fleetProfit: fleetProfit,
        brokerageProfit: brokerageProfit,
        retainedEarnings: totalRetainedEarnings
      });
      
      setRecentTrips(recentTripsRes.items);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard statistics. Please try again.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    if (!isAdmin && !isSuperAdmin) return;
    setLoadingRequests(true);
    try {
      const res = await pb.collection('signup_requests').getList(1, 1, { 
        filter: 'status="Pending"', 
        $autoCancel: false 
      });
      setPendingRequestsCount(res.totalItems);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchPendingRequests();
  }, []);

  if (loading) return <LoadingSpinner text="Compiling your dashboard..." />;

  if (error) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-16 h-16 text-destructive mb-4 opacity-80" />
        <h2 className="text-2xl font-bold mb-2">Dashboard Error</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={fetchDashboardData} size="lg" className="rounded-full shadow-soft">Retry Loading</Button>
      </div>
    );
  }

  const netProfit = stats.retainedEarnings;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full space-y-4 pt-4 pb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-foreground">{t('dashboard')}</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-2xl text-balance">
            {t('welcome')}, <span className="font-semibold text-foreground">{currentUser?.full_name || currentUser?.name || 'User'}</span>. Here's what's happening across the fleet today.
          </p>
        </div>
        <div className="inline-flex items-center rounded-xl border border-border/50 bg-secondary/30 px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
          <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> 
          <span className="capitalize">{currentUser?.role?.replace('_', ' ')}</span> Access
        </div>
      </motion.div>

      {(isAdmin || isSuperAdmin) && (
        <motion.div variants={itemVariants} className="w-full">
          {loadingRequests ? (
            <Skeleton className="h-24 w-full rounded-2xl" />
          ) : pendingRequestsCount > 0 ? (
            <Card 
              className="bg-destructive/5 border-destructive/20 shadow-soft hover:bg-destructive/10 transition-colors cursor-pointer rounded-2xl"
              onClick={() => navigate('/dashboard/users?tab=signup-requests')}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-3.5 bg-destructive/10 rounded-xl text-destructive">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-destructive">Pending Signup Requests</h2>
                    <p className="text-sm text-destructive/80 mt-1">
                      You have <span className="font-bold">{pendingRequestsCount}</span> new account request{pendingRequestsCount > 1 ? 's' : ''} awaiting approval.
                    </p>
                  </div>
                </div>
                <Button variant="destructive" className="hidden sm:flex rounded-xl shadow-sm">
                  Review Requests <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </motion.div>
      )}
      
      {/* High-frequency operational actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-soft">
        <button 
          onClick={() => setIsExpenseModalOpen(true)}
          className="flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 hover:text-white hover:border-indigo-500/80 hover:bg-slate-900 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-sm"
        >
          <span>➕ {t('add_expense')}</span>
        </button>
        <button 
          onClick={() => setIsTripModalOpen(true)}
          className="flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 hover:text-white hover:border-emerald-500/80 hover:bg-slate-900 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold text-sm"
        >
          <span>🚚 {t('dispatch_trip')}</span>
        </button>
        <button 
          onClick={() => setIsAdvanceModalOpen(true)}
          className="flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 hover:text-white hover:border-amber-500/80 hover:bg-slate-900 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-semibold text-sm"
        >
          <span>💵 {t('record_advance')}</span>
        </button>
        <button 
          onClick={() => setIsMaintenanceModalOpen(true)}
          className="flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 hover:text-white hover:border-red-500/80 hover:bg-slate-900 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-semibold text-sm"
        >
          <span>🛠️ {t('log_maintenance')}</span>
        </button>
      </motion.div>

      {(isSuperAdmin || isAdmin) ? (
        <div className="space-y-4">
          {/* Primary Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title={t('net_revenue')} 
              value={`₹${stats.revenue.toLocaleString()}`} 
              icon={Activity} 
              textClass="text-foreground" 
              description={`Gross Booking: ₹${(stats.grossRevenue || 0).toLocaleString()}`} 
              onClick={() => navigate('/analytics?tab=revenue')} 
            />
            <StatCard 
              title={t('retained_earnings')} 
              value={`₹${stats.retainedEarnings.toLocaleString()}`} 
              icon={BarChart3} 
              textClass={stats.retainedEarnings >= 0 ? "text-success" : "text-destructive"} 
              description={`Fleet: ₹${Math.round(stats.fleetProfit).toLocaleString()} | Brokerage: ₹${Math.round(stats.brokerageProfit).toLocaleString()}`} 
              onClick={() => navigate('/analytics')} 
            />
            <StatCard title={t('total_shipments')} value={stats.trips} icon={Truck} trend="4.2%" onClick={() => navigate('/analytics?tab=shipments')} />
            <StatCard title={t('active_fleet')} value={stats.trucks} icon={CheckCircle} description="Vehicles currently registered" />
          </motion.div>
          
          {/* Live Idle Vehicles Dashboard */}
          <motion.div variants={itemVariants} className="w-full">
            <IdleVehiclesComponent />
          </motion.div>
          
          {/* Secondary Layout */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 shadow-soft border-border/50 bg-card rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50 mb-2">
                <div className="space-y-0.5">
                  <CardTitle className="font-heading text-lg">{t('recent_shipments')}</CardTitle>
                  <CardDescription className="text-xs">Latest 5 trips recorded in the system.</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="rounded-xl shadow-sm">
                  <Link to="/trip-logs">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mt-3">
                  {recentTrips.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-6">No recent shipments.</p>
                  ) : (
                    recentTrips.map(trip => (
                      <div key={trip.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-secondary/20 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground">{trip.route}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{trip.truck_number} • {trip.driver_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-foreground">₹{trip.revenue?.toLocaleString() || 0}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-medium">{format(new Date(trip.date), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft border-primary/20 bg-primary/[0.02] rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-lg">{t('system_health')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-foreground">Storage Quota</span>
                    <span className="text-muted-foreground font-semibold">45%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5 shadow-inner">
                    <div className="bg-primary h-2.5 rounded-full w-[45%] shadow-sm"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-foreground">Active Users</span>
                    <span className="text-muted-foreground font-semibold">{stats.users} online</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5 shadow-inner">
                    <div className="bg-success h-2.5 rounded-full w-[80%] shadow-sm"></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border/50">
                  <Button className="w-full rounded-xl shadow-sm text-sm" variant="outline" onClick={() => navigate('/analytics')}>
                    <BarChart3 className="w-4 h-4 mr-2 text-muted-foreground" />
                    View Full Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title={t('assigned_shipments')} value={stats.trips} icon={Truck} onClick={() => navigate('/analytics?tab=shipments')} />
            <StatCard title={t('pending_pods')} value={stats.pods} icon={FileCheck} textClass="text-warning" />
            <StatCard title={t('active_tasks')} value="12" icon={Clock} />
          </div>
          <IdleVehiclesComponent />
        </motion.div>
      )}

      {/* Mounted Action Modals */}
      <ExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
        onSuccess={() => {
          setIsExpenseModalOpen(false);
          fetchDashboardData();
        }} 
      />

      <AddTripModal 
        isOpen={isTripModalOpen} 
        onClose={() => setIsTripModalOpen(false)} 
        onSuccess={() => {
          setIsTripModalOpen(false);
          fetchDashboardData();
        }} 
      />

      <AdvanceEditModal 
        isOpen={isAdvanceModalOpen} 
        onClose={() => setIsAdvanceModalOpen(false)} 
        onSuccess={() => {
          setIsAdvanceModalOpen(false);
          fetchDashboardData();
        }} 
      />

      <MaintenanceFormModal 
        isOpen={isMaintenanceModalOpen} 
        onClose={() => setIsMaintenanceModalOpen(false)} 
        onSuccess={() => {
          setIsMaintenanceModalOpen(false);
          fetchDashboardData();
        }} 
      />
    </motion.div>
  );
};

export default DashboardPage;