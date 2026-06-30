import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';
import { toast } from 'sonner';

import Header from '@/components/Header.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { ArrowLeft, Mail, Phone, MapPin, Building2, Save } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { calculateClientMetrics } from '@/lib/clientPaymentUtils.js';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import { cn } from '@/lib/utils.js';

const ClientDetailsPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [client, setClient] = useState(null);
  const [trips, setTrips] = useState([]);
  
  const [billingType, setBillingType] = useState('');

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        const [clientRes, tripsRes] = await Promise.all([
          pb.collection('clients').getOne(clientId, { $autoCancel: false }),
          pb.collection('trip_logs').getFullList({ filter: `client_id = "${clientId}"`, sort: '-date', $autoCancel: false })
        ]);
        
        setClient(clientRes);
        setBillingType(clientRes.billing_type || 'Spot');
        setTrips(tripsRes);
      } catch (err) {
        console.error('Failed to load client details:', err);
        toast.error('Could not load client profile');
        navigate('/client-analysis');
      } finally {
        setLoading(false);
      }
    };
    
    if (clientId) {
      fetchClientData();
    }
  }, [clientId, navigate]);

  const handleUpdateBillingType = async () => {
    if (!billingType) return;
    setIsSaving(true);
    try {
      await pb.collection('clients').update(clientId, { billing_type: billingType }, { $autoCancel: false });
      setClient({ ...client, billing_type: billingType });
      toast.success('Billing type updated successfully');
    } catch (err) {
      console.error('Failed to update billing type', err);
      toast.error('Failed to update billing type');
    } finally {
      setIsSaving(false);
    }
  };

  const metrics = useMemo(() => calculateClientMetrics(clientId, trips), [clientId, trips]);

  const chartData = useMemo(() => {
    // Reverse trips so oldest is first for cumulative chart
    const chronologicalTrips = [...trips].sort((a,b) => new Date(a.date) - new Date(b.date));
    
    let cumulativeInvoiced = 0;
    let cumulativeReceived = 0;
    
    const timeSeries = chronologicalTrips.map(t => {
      const amt = t.revenue || 0;
      cumulativeInvoiced += amt;
      if (t.client_payment_status === 'received') {
        cumulativeReceived += amt;
      }
      return {
        date: format(new Date(t.date), 'dd MMM'),
        invoiced: cumulativeInvoiced,
        received: cumulativeReceived,
        tripAmount: amt
      };
    });

    const statusData = [
      { name: 'Received', value: metrics.totalReceived, color: 'hsl(var(--success))' },
      { name: 'Pending', value: metrics.totalPending, color: 'hsl(var(--destructive))' }
    ].filter(d => d.value > 0);

    return { timeSeries, statusData };
  }, [trips, metrics]);

  if (loading) return <LoadingSpinner text="Loading client profile..." />;
  if (!client) return null;

  return (
    <>
      <Helmet><title>{client.client_name} - Details</title></Helmet>
      <Header />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/clients')} className="rounded-full border shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{client.client_name}</h1>
              <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                <Building2 className="w-4 h-4" /> {client.company_name || 'Independent Client'}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(`/clients/${client.id}/edit`)}>Edit Full Profile</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-client-secondary bg-client-secondary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground break-all">{client.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">{client.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground">
                    {[client.address, client.city, client.state].filter(Boolean).join(', ') || 'Not provided'}
                  </p>
                </div>
              </div>
              
              <div className="pt-3 mt-3 border-t border-border">
                <p className="text-sm font-medium mb-2">Billing Configuration</p>
                <div className="flex items-center gap-2">
                  <Select value={billingType} onValueChange={setBillingType}>
                    <SelectTrigger className="w-[140px] h-8 bg-background">
                      <SelectValue placeholder="Billing Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spot">Spot</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                  {billingType !== client.billing_type && (
                    <Button size="sm" onClick={handleUpdateBillingType} disabled={isSaving} className="h-8">
                      {isSaving ? '...' : <Save className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 shadow-sm border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Invoiced</p>
                  <p className="text-2xl font-bold amount-display">{formatCurrency(metrics.totalInvoiced)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-success uppercase tracking-wider">Received</p>
                  <p className="text-2xl font-bold amount-display text-success">{formatCurrency(metrics.totalReceived)}</p>
                  <p className="text-xs font-medium text-success/80">{metrics.receivedPct}% of total</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive uppercase tracking-wider">Outstanding</p>
                  <p className="text-2xl font-bold amount-display text-destructive">{formatCurrency(metrics.outstandingBalance)}</p>
                  <p className="text-xs font-medium text-destructive/80">{metrics.pendingPct}% of total</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Trips Logged</p>
                  <p className="text-2xl font-bold amount-display">{metrics.totalTrips}</p>
                  <p className="text-xs font-medium text-muted-foreground">
                    <span className="text-destructive">{metrics.pendingTrips} pending</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader><CardTitle>Cumulative Balance Over Time</CardTitle></CardHeader>
            <CardContent className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.timeSeries} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis tickFormatter={v => `₹${v/1000}k`} />
                  <Tooltip formatter={v => formatCurrency(v)} />
                  <Legend />
                  <Line type="stepAfter" dataKey="invoiced" name="Total Invoiced" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} />
                  <Line type="stepAfter" dataKey="received" name="Total Received" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Payment Status Breakdown</CardTitle></CardHeader>
            <CardContent className="chart-container flex items-center justify-center min-h-[300px]">
              {chartData.statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={chartData.statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {chartData.statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={v => formatCurrency(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No data to display</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Trip History</CardTitle>
            <CardDescription>Detailed breakdown of all trips for this client.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="pl-4">Date</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Vehicle & Driver</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center pr-4">Payment Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No trips found for this client.</TableCell>
                    </TableRow>
                  ) : (
                    trips.map(trip => (
                      <TableRow key={trip.id} className="hover:bg-muted/30">
                        <TableCell className="pl-4 whitespace-nowrap">{format(new Date(trip.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{trip.route}</p>
                          {trip.cycle && <p className="text-xs text-muted-foreground truncate max-w-[250px]">{trip.cycle}</p>}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{trip.truck_number}</p>
                          <p className="text-xs text-muted-foreground">{trip.driver_name}</p>
                        </TableCell>
                        <TableCell className="text-right amount-display font-medium">
                          {formatCurrency(trip.revenue)}
                        </TableCell>
                        <TableCell className="text-center pr-4">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border uppercase tracking-wider",
                            trip.client_payment_status === 'received' ? 'bg-success/10 text-success border-success/20' :
                            trip.client_payment_status === 'pending' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                            'bg-muted text-muted-foreground border-border'
                          )}>
                            {trip.client_payment_status || 'Blank'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      </div>
    </>
  );
};

export default ClientDetailsPage;