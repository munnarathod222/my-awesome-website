import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Users, Building2, TrendingUp, DollarSign, Wallet, Activity, PlusCircle, ArrowRight, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { format, subMonths, isAfter } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';

export default function ClientDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0,
    totalRevenue: 0,
    outstandingBalance: 0,
    totalShipments: 0
  });
  const [charts, setCharts] = useState({
    typeDistribution: [],
    statusDistribution: [],
    revenueTrend: [],
    topClients: [],
    paymentStatus: []
  });
  const [recent, setRecent] = useState({
    clients: [],
    invoices: [],
    payments: []
  });

  const COLORS = ['hsl(var(--client-primary))', 'hsl(var(--client-accent))', 'hsl(var(--muted-foreground))', 'hsl(var(--warning))', 'hsl(var(--success))'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [clientsRes, invoicesRes, paymentsRes, shipmentsRes] = await Promise.all([
          pb.collection('clients').getFullList({ sort: '-created', $autoCancel: false }),
          pb.collection('client_invoices').getFullList({ expand: 'client_id', sort: '-created', $autoCancel: false }),
          pb.collection('client_payments').getFullList({ expand: 'client_id', sort: '-created', $autoCancel: false }),
          pb.collection('client_shipments').getFullList({ $autoCancel: false })
        ]);

        const clients = clientsRes || [];
        const invoices = invoicesRes || [];
        const payments = paymentsRes || [];
        const shipments = shipmentsRes || [];

        // Stats
        let totalRev = 0;
        let outBal = 0;
        invoices.forEach(inv => {
          totalRev += (inv.amount || 0);
          outBal += (inv.balance || 0);
        });

        setStats({
          totalClients: clients.length,
          activeClients: clients.filter(c => c.status === 'Active').length,
          inactiveClients: clients.filter(c => c.status === 'Inactive').length,
          totalRevenue: totalRev,
          outstandingBalance: outBal,
          totalShipments: shipments.length
        });

        // Charts: Client Types
        const typesCount = {};
        clients.forEach(c => { typesCount[c.client_type || 'Unknown'] = (typesCount[c.client_type || 'Unknown'] || 0) + 1; });
        const typeData = Object.keys(typesCount).map(k => ({ name: k, value: typesCount[k] }));

        // Charts: Status
        const statusesCount = { Active: 0, Inactive: 0, Suspended: 0 };
        clients.forEach(c => { statusesCount[c.status || 'Inactive'] = (statusesCount[c.status || 'Inactive'] || 0) + 1; });
        const statusData = Object.keys(statusesCount).map(k => ({ name: k, value: statusesCount[k] })).filter(d => d.value > 0);

        // Charts: Revenue Trend (Last 6 months)
        const monthsMap = {};
        for (let i = 5; i >= 0; i--) {
          monthsMap[format(subMonths(new Date(), i), 'MMM yyyy')] = 0;
        }
        const sixMonthsAgo = subMonths(new Date(), 6);
        invoices.forEach(inv => {
          const d = new Date(inv.invoice_date || inv.created);
          if (isAfter(d, sixMonthsAgo)) {
            const m = format(d, 'MMM yyyy');
            if (monthsMap[m] !== undefined) monthsMap[m] += (inv.amount || 0);
          }
        });
        const revenueTrendData = Object.keys(monthsMap).map(k => ({ month: k, revenue: monthsMap[k] }));

        // Charts: Top Clients
        const clientRev = {};
        invoices.forEach(inv => {
          const cName = inv.expand?.client_id?.client_name || 'Unknown';
          clientRev[cName] = (clientRev[cName] || 0) + (inv.amount || 0);
        });
        const topClientsData = Object.keys(clientRev)
          .map(k => ({ name: k, revenue: clientRev[k] }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Charts: Payment Status
        const pStatusCount = {};
        invoices.forEach(i => { pStatusCount[i.payment_status || 'Unknown'] = (pStatusCount[i.payment_status || 'Unknown'] || 0) + 1; });
        const pStatusData = Object.keys(pStatusCount).map(k => ({ name: k, value: pStatusCount[k] }));

        setCharts({
          typeDistribution: typeData,
          statusDistribution: statusData,
          revenueTrend: revenueTrendData,
          topClients: topClientsData,
          paymentStatus: pStatusData
        });

        // Recent
        setRecent({
          clients: clients.slice(0, 5),
          invoices: invoices.slice(0, 5),
          payments: payments.slice(0, 5)
        });

      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-lg text-sm">
          <p className="font-medium mb-1">{label || payload[0].name}</p>
          <p className="text-muted-foreground">
            Value: <span className="font-semibold text-foreground">
              {typeof payload[0].value === 'number' && payload[0].value > 1000 
                ? `₹${payload[0].value.toLocaleString()}` 
                : payload[0].value}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <Helmet>
        <title>Client Dashboard | Logistics Management</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground" style={{letterSpacing: '-0.02em'}}>Client Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your client relationships and financials.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/clients">View All Clients</Link>
            </Button>
            <Button className="bg-client-primary text-client-primary-foreground hover:bg-client-primary/90" asChild>
              <Link to="/clients/new"><PlusCircle className="w-4 h-4 mr-2" /> Add Client</Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Clients</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalClients}</p>
                  </div>
                  <div className="p-3 bg-client-primary/10 rounded-xl">
                    <Users className="w-5 h-5 text-client-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20 font-normal">
                    {stats.activeClients} Active
                  </Badge>
                  <span className="ml-2 text-muted-foreground">{stats.inactiveClients} Inactive</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-foreground">₹{(stats.totalRevenue/1000).toFixed(1)}k</p>
                  </div>
                  <div className="p-3 bg-success/10 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">From all client invoices</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Outstanding Balance</p>
                    <p className="text-3xl font-bold text-destructive">₹{(stats.outstandingBalance/1000).toFixed(1)}k</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-xl">
                    <Wallet className="w-5 h-5 text-destructive" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Pending to be collected</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Shipments</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalShipments}</p>
                  </div>
                  <div className="p-3 bg-client-accent/10 rounded-xl">
                    <Building2 className="w-5 h-5 text-client-accent" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Managed across all clients</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-[300px] w-full" /> : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => `₹${val/1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--client-primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--client-primary))" }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Client Types</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-[250px] w-full" /> : (
                <div className="h-[250px] w-full flex items-center justify-center relative">
                  {charts.typeDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={charts.typeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                          {charts.typeDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground">No data available</p>}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-foreground">{stats.totalClients}</span>
                    <span className="text-xs text-muted-foreground">Clients</span>
                  </div>
                </div>
              )}
              {!loading && (
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {charts.typeDistribution.map((d, i) => (
                    <div key={d.name} className="flex items-center text-xs">
                      <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest client additions and financial movements.</CardDescription>
              </div>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? <Skeleton className="h-[200px] w-full" /> : (
                <div className="space-y-6">
                  {recent.clients.length === 0 && recent.invoices.length === 0 && <p className="text-sm text-muted-foreground">No recent activity found.</p>}
                  
                  {recent.invoices.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-foreground">Recent Invoices</h3>
                      {recent.invoices.slice(0, 3).map(inv => (
                        <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-client-secondary flex items-center justify-center text-client-secondary-foreground shrink-0">
                              <Receipt className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{inv.invoice_number}</p>
                              <p className="text-xs text-muted-foreground">{inv.expand?.client_id?.client_name || 'Unknown'} • {format(new Date(inv.created), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold tabular-nums text-foreground">₹{inv.amount?.toLocaleString()}</p>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 mt-1 font-normal ${inv.payment_status === 'Paid' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                              {inv.payment_status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {recent.clients.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-foreground">New Clients</h3>
                      {recent.clients.slice(0, 3).map(client => (
                        <div key={client.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-client-primary/10 flex items-center justify-center text-client-primary shrink-0">
                              {client.client_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{client.client_name}</p>
                              <p className="text-xs text-muted-foreground">{client.client_type} • Added {format(new Date(client.created), 'MMM dd')}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild className="h-8">
                            <Link to={`/clients/${client.id}`}>View</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Top Clients by Revenue</CardTitle>
              <CardDescription>Highest generating accounts.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-[250px] w-full" /> : (
                <div className="h-[250px] w-full -ml-4">
                  {charts.topClients.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={charts.topClients} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} width={80} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.4)' }} />
                        <Bar dataKey="revenue" fill="hsl(var(--client-accent))" radius={[0, 4, 4, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-center py-10">No revenue data</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}