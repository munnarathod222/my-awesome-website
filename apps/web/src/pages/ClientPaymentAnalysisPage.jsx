import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { Search, Download, FileText, BarChart3, AlertCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { aggregateClientAnalysis } from '@/lib/clientPaymentUtils.js';
import { exportClientAnalysisToCSV, exportClientAnalysisToPDF, formatCurrency } from '@/lib/analyticsUtils.js';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

const ClientPaymentAnalysisPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [clients, setClients] = useState([]);
  const [trips, setTrips] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'totalPending', direction: 'desc' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsRes, tripsRes] = await Promise.all([
        pb.collection('clients').getFullList({ sort: 'client_name', $autoCancel: false }),
        pb.collection('trip_logs').getFullList({ $autoCancel: false })
      ]);
      setClients(clientsRes);
      setTrips(tripsRes);
    } catch (err) {
      console.error('Error fetching analysis data:', err);
      setError('Failed to load client payment data.');
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const analysisData = useMemo(() => {
    let data = aggregateClientAnalysis(clients, trips);

    // Filters
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(d => d.client_name.toLowerCase().includes(term));
    }
    
    if (statusFilter === 'pending') {
      data = data.filter(d => d.totalPending > 0);
    } else if (statusFilter === 'clear') {
      data = data.filter(d => d.totalPending === 0 && d.totalReceived > 0);
    }

    // Sort
    data.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [clients, trips, searchTerm, statusFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Chart Data preparation
  const chartData = useMemo(() => {
    const topByPending = [...analysisData].sort((a,b) => b.totalPending - a.totalPending).slice(0, 10);
    
    let totalReceived = 0;
    let totalPending = 0;
    analysisData.forEach(d => {
      totalReceived += d.totalReceived;
      totalPending += d.totalPending;
    });

    return { topByPending, totalReceived, totalPending };
  }, [analysisData]);

  if (loading) return <LoadingSpinner text="Compiling client payment analytics..." />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Analysis</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchData}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Client Payment Analysis - Jai Bhavani Cargo</title></Helmet>
      <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full space-y-8 animate-in fade-in">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Client Payment Analysis</h1>
            <p className="text-muted-foreground mt-1 text-sm">Monitor outstanding balances and payment history across all clients.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportClientAnalysisToCSV(analysisData)}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button variant="outline" onClick={() => exportClientAnalysisToPDF(analysisData)}>
              <FileText className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30 px-5 pt-5">
              <CardTitle className="text-base font-heading">Pending vs Received (Top Clients)</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.topByPending} margin={{ top: 15, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="client_name" tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} tickFormatter={(val) => val.length > 12 ? val.substring(0, 12) + '...' : val} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(val) => `₹${val/1000}k`} tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: 'rgba(10,15,30,0.85)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="totalReceived" name="Received" stackId="a" fill="#10b981" radius={[0,0,4,4]} />
                    <Bar dataKey="totalPending" name="Pending" stackId="a" fill="#f43f5e" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden flex flex-col">
            <CardHeader className="pb-3 border-b border-border/30 px-5 pt-5">
              <CardTitle className="text-base font-heading">Overall Portfolio Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col items-center justify-center">
              <div className="h-[210px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Received', value: chartData.totalReceived },
                        { name: 'Pending', value: chartData.totalPending }
                      ]}
                      cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f43f5e" />
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: 'rgba(10,15,30,0.85)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-3 pt-3 border-t border-border/30 w-full">
                <p className="text-2xl font-bold tracking-tight text-foreground font-heading">{formatCurrency(chartData.totalPending + chartData.totalReceived)}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-extrabold mt-1">Total Network Invoiced</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
            <CardTitle>Client Ledger</CardTitle>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search clients..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="pending">Has Pending</SelectItem>
                  <SelectItem value="clear">Fully Cleared</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {analysisData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border">
                No clients match the current filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {analysisData.map((row) => {
                  const isPending = row.totalPending > 0;
                  return (
                    <div 
                      key={row.client_id} 
                      className={`group bg-card border border-border/60 hover:border-primary/30 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 ${
                        isPending && row.totalPending > 100000 
                          ? 'border-l-4 border-l-destructive shadow-[0_0_15px_rgba(239,68,68,0.05)]' 
                          : isPending 
                          ? 'border-l-4 border-l-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                          : 'border-l-4 border-l-emerald-500/50'
                      }`}
                    >
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          {/* Client Header */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-heading font-bold text-base text-foreground truncate group-hover:text-primary transition-colors duration-200" title={row.client_name}>
                              {row.client_name}
                            </h3>
                            {row.totalPending > 0 ? (
                              <Badge variant="outline" className="border-0 px-2 py-0.5 text-[9px] font-bold rounded bg-destructive/10 text-destructive shrink-0">
                                {row.pendingPct}% Unpaid
                              </Badge>
                            ) : row.totalReceived > 0 ? (
                              <Badge variant="outline" className="border-0 px-2 py-0.5 text-[9px] font-bold rounded bg-success/10 text-success shrink-0">
                                Cleared
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-0 px-2 py-0.5 text-[9px] font-bold rounded bg-muted text-muted-foreground shrink-0">
                                No Trips
                              </Badge>
                            )}
                          </div>

                          {/* Stats info */}
                          <div className="space-y-2 mt-4 pt-3 border-t border-border/40 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Invoiced</span>
                              <span className="font-extrabold text-foreground tabular-nums">{formatCurrency(row.totalInvoiced)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Received</span>
                              <span className="font-extrabold text-emerald-400 tabular-nums">{formatCurrency(row.totalReceived)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Outstanding</span>
                              <span className="font-extrabold text-rose-400 tabular-nums">{formatCurrency(row.totalPending)}</span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          {row.totalInvoiced > 0 && (
                            <div className="mt-4 space-y-1.5">
                              <Progress value={100 - row.pendingPct} className="h-1 bg-rose-500/10" style={{'--progress-background': '#10b981'}} />
                              <div className="flex justify-between text-[9px] text-muted-foreground/50 font-bold uppercase tracking-wider">
                                <span>{100 - row.pendingPct}% Paid</span>
                                <span>{row.pendingPct}% Unpaid</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer stats & actions */}
                        <div className="border-t border-border/40 pt-4 mt-2 flex items-center justify-between gap-2">
                          <div className="text-[10px] text-muted-foreground truncate">
                            Trips: <span className="text-destructive font-bold">{row.pendingTrips}</span> pending / <span className="text-success font-bold">{row.receivedTrips}</span> cleared
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs font-bold rounded-lg border-border hover:bg-primary hover:text-primary-foreground transition-all duration-200 shrink-0"
                            onClick={() => navigate(`/client/${row.client_id}`)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ClientPaymentAnalysisPage;