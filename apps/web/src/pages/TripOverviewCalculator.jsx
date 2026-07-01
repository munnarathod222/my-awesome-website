import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp, Truck, DollarSign, Activity, Calculator, PieChart, Save, RefreshCw, Loader2, Trash2, Play, Calendar, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '@/lib/utils.js';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TripOverviewCalculator() {
  // Left Panel - Parameters
  const [distance, setDistance] = useState([1477]);
  const [fuelPrice, setFuelPrice] = useState([103.8]);
  const [mileage, setMileage] = useState([11.5]);
  const [tolls, setTolls] = useState([1860]);
  const [driverExpenses, setDriverExpenses] = useState([1200]);
  const [tyreDepreciation, setTyreDepreciation] = useState([3]); // defaulting to ₹3 per KM

  // Right Panel - Costs & Revenue
  const [vehicleEmi, setVehicleEmi] = useState(0);
  const [insurance, setInsurance] = useState(0);
  const [quarterlyTax, setQuarterlyTax] = useState(0);
  const [freightRevenue, setFreightRevenue] = useState(15000);

  // Save Dialog State
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [metaData, setMetaData] = useState({
    routeName: '',
    vehicleNumber: ''
  });

  const [routesList, setRoutesList] = useState([]);
  const [trucksList, setTrucksList] = useState([]);

  // Saved reports state
  const [savedReports, setSavedReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');
  const [viewingReport, setViewingReport] = useState(null);

  const fetchSavedReports = async () => {
    setReportsLoading(true);
    try {
      const response = await fetch('/hcgi/api/trip-calculations/list');
      const data = await response.json();
      if (data.success) {
        setSavedReports(data.calculations || []);
      } else {
        toast.error(data.error || 'Failed to fetch saved calculations');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load saved calculations');
    } finally {
      setReportsLoading(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this saved calculation report?')) return;
    try {
      const response = await fetch(`/hcgi/api/trip-calculations/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('Report deleted successfully');
        fetchSavedReports();
      } else {
        toast.error(data.error || 'Failed to delete report');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete report. Connection error.');
    }
  };

  const handleLoadReport = (report) => {
    setDistance([report.distance || 1477]);
    setFuelPrice([report.fuel_price || 103.8]);
    setMileage([report.mileage || 11.5]);
    setTolls([report.tolls || 1860]);
    setDriverExpenses([report.driver_expenses || 1200]);
    setTyreDepreciation([report.tyre_depreciation_rate || 3]);
    setVehicleEmi(report.vehicle_emi || 0);
    setInsurance(report.insurance || 0);
    setQuarterlyTax(report.quarterly_tax || 0);
    setFreightRevenue(report.freight_revenue || 15000);
    
    setActiveTab('calculator');
    toast.success(`Loaded parameters for Route: ${report.route_name}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesData, trucksData] = await Promise.all([
          pb.collection('routes').getFullList({ sort: 'route_name', $autoCancel: false }),
          pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false })
        ]);
        setRoutesList(routesData);
        setTrucksList(trucksData);
      } catch (err) {
        console.error('Failed to load routes/trucks data:', err);
      }
    };
    fetchData();
    fetchSavedReports();
  }, []);

  // Calculations
  const { fuelCost, tyreExpense, totalExpenses, netProfit, profitMargin, chartData } = useMemo(() => {
    const d = distance[0] || 0;
    const fp = fuelPrice[0] || 0;
    const m = mileage[0] || 1; // avoid div by zero
    const t = tolls[0] || 0;
    const de = driverExpenses[0] || 0;
    const td = tyreDepreciation[0] || 0;

    const vEmi = parseFloat(vehicleEmi) || 0;
    const ins = parseFloat(insurance) || 0;
    const tax = parseFloat(quarterlyTax) || 0;
    const rev = parseFloat(freightRevenue) || 0;

    const fCost = (d / m) * fp;
    const tyrExp = d * td;
    const tExpenses = fCost + tyrExp + t + de + vEmi + ins + tax;
    const nProfit = rev - tExpenses;
    const pMargin = rev > 0 ? (nProfit / rev) * 100 : 0;

    const data = [
      { name: 'Total Expenses', value: tExpenses, color: 'hsl(var(--primary))' },
      { name: 'Net Profit', value: Math.max(nProfit, 0), color: 'hsl(var(--success))' }
    ];

    return { 
      fuelCost: fCost, 
      tyreExpense: tyrExp,
      totalExpenses: tExpenses, 
      netProfit: nProfit, 
      profitMargin: pMargin, 
      chartData: data 
    };
  }, [distance, fuelPrice, mileage, tolls, driverExpenses, tyreDepreciation, vehicleEmi, insurance, quarterlyTax, freightRevenue]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handleSaveCalculation = async (e) => {
    e.preventDefault();
    if (!metaData.routeName) {
      toast.error('Route Name is required to save calculation.');
      return;
    }

    setSaveLoading(true);
    try {
      const payload = {
        route_name: metaData.routeName,
        vehicle_number: metaData.vehicleNumber === 'none' ? '' : metaData.vehicleNumber,
        distance: distance[0],
        fuel_price: fuelPrice[0],
        mileage: mileage[0],
        tolls: tolls[0],
        driver_expenses: driverExpenses[0],
        tyre_depreciation_rate: tyreDepreciation[0],
        tyre_expense: tyreExpense,
        fuel_cost: fuelCost,
        vehicle_emi: parseFloat(vehicleEmi) || 0,
        insurance: parseFloat(insurance) || 0,
        quarterly_tax: parseFloat(quarterlyTax) || 0,
        freight_revenue: parseFloat(freightRevenue) || 0,
        total_expenses: totalExpenses,
        net_profit: netProfit,
        profit_margin: profitMargin
      };

      const response = await fetch('/hcgi/api/trip-calculations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await response.json();

      if (resData.success) {
        toast.success('Trip calculation report saved successfully!');
        setIsSaveDialogOpen(false);
        setMetaData({ routeName: '', vehicleNumber: '' });
        fetchSavedReports();
      } else {
        toast.error(resData.error || 'Failed to save calculation.');
      }
    } catch (err) {
      console.error('Save trip calculation error:', err);
      toast.error('Failed to save calculation. Connection error.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Helmet>
        <title>Trip Overview | Logistics Hub</title>
        <meta name="description" content="Calculate trip profitability, expenses, and margins" />
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-5 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-primary" />
            Trip Overview Calculator
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Simulate profitability based on variable constraints, tyre depreciation, and vehicle fixed costs.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeTab === 'calculator' && (
            <Button onClick={() => setIsSaveDialogOpen(true)} className="rounded-xl font-bold shadow-sm w-full md:w-auto">
              <Save className="w-4 h-4 mr-2" /> Save Calculation
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => {
        setActiveTab(val);
        if (val === 'reports') fetchSavedReports();
      }} className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-6 flex h-auto rounded-xl max-w-xs">
          <TabsTrigger value="calculator" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm w-1/2">
            Calculator
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm w-1/2">
            Saved Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4 m-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Panel - Sliders */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-border shadow-sm bg-card h-full">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="w-5 h-5 text-primary" />
                    Trip Parameters
                  </CardTitle>
                  <CardDescription>Adjust dynamic variables for your journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold text-foreground">Distance (KM)</Label>
                      <span className="font-mono text-primary font-bold">{distance[0]} km</span>
                    </div>
                    <Slider 
                      value={distance} 
                      onValueChange={setDistance} 
                      max={2000} 
                      step={1}
                      className="py-2"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold text-foreground">Fuel Price (INR/L)</Label>
                      <span className="font-mono text-primary font-bold">₹{fuelPrice[0]}</span>
                    </div>
                    <Slider 
                      value={fuelPrice} 
                      onValueChange={setFuelPrice} 
                      max={200} 
                      step={0.1}
                      className="py-2"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold text-foreground">Mileage (KM/L)</Label>
                      <span className="font-mono text-primary font-bold">{mileage[0]} km/l</span>
                    </div>
                    <Slider 
                      value={mileage} 
                      onValueChange={setMileage} 
                      max={30} 
                      step={0.1}
                      className="py-2"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold text-foreground">Tolls (INR)</Label>
                      <span className="font-mono text-primary font-bold">₹{tolls[0]}</span>
                    </div>
                    <Slider 
                      value={tolls} 
                      onValueChange={setTolls} 
                      max={5000} 
                      step={10}
                      className="py-2"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold text-foreground">Driver Expenses (INR)</Label>
                      <span className="font-mono text-primary font-bold">₹{driverExpenses[0]}</span>
                    </div>
                    <Slider 
                      value={driverExpenses} 
                      onValueChange={setDriverExpenses} 
                      max={5000} 
                      step={10}
                      className="py-2"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold text-foreground">Tyre Depreciation (₹/KM)</Label>
                      <span className="font-mono text-primary font-bold">₹{tyreDepreciation[0]}/km</span>
                    </div>
                    <Slider 
                      value={tyreDepreciation} 
                      onValueChange={setTyreDepreciation} 
                      max={10} 
                      step={0.5}
                      className="py-2"
                    />
                  </div>

                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Inputs & Results */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-border shadow-sm bg-card">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="w-5 h-5 text-accent" />
                    Revenue & Fixed Costs
                  </CardTitle>
                  <CardDescription>Enter freight details and overheads</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="freight" className="text-accent font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Freight Revenue (INR)
                    </Label>
                    <Input 
                      id="freight"
                      type="number"
                      value={freightRevenue}
                      onChange={(e) => setFreightRevenue(e.target.value)}
                      className="input-highlight text-lg font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emi">Vehicle EMI (INR)</Label>
                    <Input 
                      id="emi"
                      type="number"
                      value={vehicleEmi}
                      onChange={(e) => setVehicleEmi(e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insurance">Insurance (INR)</Label>
                    <Input 
                      id="insurance"
                      type="number"
                      value={insurance}
                      onChange={(e) => setInsurance(e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax">Quarterly Tax (INR)</Label>
                    <Input 
                      id="tax"
                      type="number"
                      value={quarterlyTax}
                      onChange={(e) => setQuarterlyTax(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Operational Summary */}
              <Card className="border-border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/10 border-b border-border pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Operational Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
                    <div className="p-5 flex flex-col justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Revenue</span>
                      <span className="text-xl font-bold tabular-nums text-foreground">{formatCurrency(freightRevenue)}</span>
                    </div>
                    <div className="p-5 flex flex-col justify-between bg-muted/5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Total Expenses</span>
                      <span className="text-xl font-bold tabular-nums text-primary">{formatCurrency(totalExpenses)}</span>
                    </div>
                    <div className="p-5 flex flex-col justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Net Profit</span>
                      <span className={cn(
                        "text-xl font-bold tabular-nums",
                        netProfit >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {formatCurrency(netProfit)}
                      </span>
                    </div>
                    <div className="p-5 flex flex-col justify-between bg-muted/5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Profit Margin</span>
                      <span className={cn(
                        "text-xl font-bold tabular-nums",
                        profitMargin >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {profitMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chart */}
              <div className="chart-container h-64 mt-6">
                <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-foreground">
                  <PieChart className="w-4 h-4 text-muted-foreground" />
                  Expense vs Profit Comparison
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis hide />
                    <RechartsTooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                      formatter={(value) => [formatCurrency(value), '']}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 m-0 animate-in fade-in duration-300">
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="w-5 h-5 text-primary" />
                Saved Simulation Reports
              </CardTitle>
              <CardDescription>View, load parameters, or delete previously saved simulation records.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {reportsLoading ? (
                <div className="py-12 flex justify-center items-center text-muted-foreground gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span>Loading reports...</span>
                </div>
              ) : savedReports.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground space-y-3">
                  <Calculator className="w-12 h-12 mx-auto opacity-20" />
                  <p className="text-base font-semibold">No saved calculations found</p>
                  <p className="text-sm">Run a simulation and click "Save Calculation" to record a report.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedReports.map((report) => {
                    const isProfit = Number(report.net_profit) >= 0;
                    return (
                      <Card key={report.id} className="border-border/60 bg-card hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden flex flex-col justify-between">
                        <div className="p-5 space-y-4">
                          {/* Card Header: Route & Truck */}
                          <div className="flex justify-between items-start gap-2 border-b border-border/40 pb-3">
                            <div className="overflow-hidden mr-2">
                              <h4 className="font-heading font-bold text-base text-foreground tracking-tight truncate" title={report.route_name}>
                                {report.route_name}
                              </h4>
                              <p className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider font-mono">
                                {report.vehicle_number ? `Truck: ${report.vehicle_number}` : 'No Truck Assigned'}
                              </p>
                            </div>
                            <div className={cn(
                              "text-[10px] font-bold py-0.5 px-2 rounded-md border border-transparent shrink-0",
                              isProfit ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
                            )}>
                              {report.profit_margin?.toFixed(1)}% Margin
                            </div>
                          </div>

                          {/* Parameters list */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Distance:</span>
                              <span className="font-medium text-foreground">{report.distance} km</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Mileage:</span>
                              <span className="font-medium text-foreground">{report.mileage} km/l</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fuel Price:</span>
                              <span className="font-medium text-foreground">₹{report.fuel_price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tolls:</span>
                              <span className="font-medium text-foreground">₹{report.tolls}</span>
                            </div>
                          </div>

                          {/* Profit summary */}
                          <div className="bg-muted/30 border border-border/50 rounded-xl p-3.5 flex justify-between items-center text-sm mt-1 shadow-inner">
                            <div>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Net Profit</span>
                              <span className={cn("font-bold text-base tabular-nums", isProfit ? "text-emerald-500" : "text-destructive")}>
                                {formatCurrency(report.net_profit)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Revenue</span>
                              <span className="font-bold text-foreground tabular-nums">
                                {formatCurrency(report.freight_revenue)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions footer */}
                        <div className="bg-muted/10 border-t border-border/50 px-5 py-3.5 flex justify-between items-center gap-2">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(report.created).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewingReport(report)}
                              className="rounded-lg h-8 text-[11px] font-semibold border-border bg-background hover:bg-muted text-foreground flex items-center gap-1 shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5 text-primary" /> View Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLoadReport(report)}
                              className="rounded-lg h-8 text-[11px] font-semibold border-border bg-background hover:bg-muted text-foreground flex items-center gap-1 shadow-sm"
                            >
                              <Play className="w-3 h-3 fill-current text-primary" /> Load
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteReport(report.id)}
                              className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Calculation Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={(open) => !open && setIsSaveDialogOpen(false)}>
        <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-6 sm:p-8 shadow-2xl bg-card border-border/50">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-2xl text-primary">
                <Save className="w-5 h-5" />
              </div>
              Save Profitability Report
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1.5">
              Record this simulation log to help track profitability trends across routes and trucks.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCalculation} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground ml-1">Route Name *</Label>
              <Select 
                value={metaData.routeName} 
                onValueChange={(val) => setMetaData({...metaData, routeName: val})}
                required
              >
                <SelectTrigger className="bg-muted/40 border-muted-foreground/20 focus:ring-primary/30 rounded-xl h-12 text-base px-4 w-full">
                  <SelectValue placeholder="Select Route Name" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {routesList.map((route) => (
                    <SelectItem key={route.id} value={route.route_name}>
                      {route.route_name} {route.route_code ? `(${route.route_code})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground ml-1">Vehicle Registration Number</Label>
              <Select 
                value={metaData.vehicleNumber || 'none'} 
                onValueChange={(val) => setMetaData({...metaData, vehicleNumber: val})}
              >
                <SelectTrigger className="bg-muted/40 border-muted-foreground/20 focus:ring-primary/30 rounded-xl h-12 text-base px-4 w-full">
                  <SelectValue placeholder="Select Vehicle Number" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none">None / Select later</SelectItem>
                  {trucksList.map((truck) => (
                    <SelectItem key={truck.id} value={truck.truck_number}>
                      {truck.truck_number} {truck.truck_name ? `(${truck.truck_name})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="outline" onClick={() => setIsSaveDialogOpen(false)} disabled={saveLoading} className="rounded-xl h-12 px-6">
                Cancel
              </Button>
              <Button type="submit" disabled={saveLoading} className="rounded-xl font-bold bg-primary hover:bg-primary/95 text-primary-foreground h-12 px-6 shadow-sm">
                {saveLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Viewing Saved Simulation Report Details Dialog */}
      <Dialog open={!!viewingReport} onOpenChange={(open) => !open && setViewingReport(null)}>
        <DialogContent className="sm:max-w-[550px] bg-card text-card-foreground border-border/50 rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="border-b border-border/50 pb-4">
            <DialogTitle className="text-xl font-heading font-bold flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Trip Calculation Details
            </DialogTitle>
            <div className="text-xs text-muted-foreground mt-1 flex gap-3">
              <span>Saved: {viewingReport && new Date(viewingReport.created).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </DialogHeader>

          {viewingReport && (
            <div className="space-y-6 py-4 overflow-y-auto max-h-[60vh] pr-1">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Route</span>
                  <span className="text-sm font-semibold text-foreground block truncate" title={viewingReport.route_name}>{viewingReport.route_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Vehicle</span>
                  <span className="text-sm font-semibold text-foreground block">{viewingReport.vehicle_number || 'No Vehicle Assigned'}</span>
                </div>
              </div>

              {/* Simulation Parameters */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Simulation Parameters</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-muted/10 border border-border/40 p-2.5 rounded-xl text-center">
                    <span className="text-[9px] text-muted-foreground block">Distance</span>
                    <span className="text-xs font-bold text-foreground">{viewingReport.distance} km</span>
                  </div>
                  <div className="bg-muted/10 border border-border/40 p-2.5 rounded-xl text-center">
                    <span className="text-[9px] text-muted-foreground block">Mileage</span>
                    <span className="text-xs font-bold text-foreground">{viewingReport.mileage} km/l</span>
                  </div>
                  <div className="bg-muted/10 border border-border/40 p-2.5 rounded-xl text-center">
                    <span className="text-[9px] text-muted-foreground block">Fuel Price</span>
                    <span className="text-xs font-bold text-foreground">₹{viewingReport.fuel_price}</span>
                  </div>
                  <div className="bg-muted/10 border border-border/40 p-2.5 rounded-xl text-center">
                    <span className="text-[9px] text-muted-foreground block">Tolls</span>
                    <span className="text-xs font-bold text-foreground">₹{viewingReport.tolls}</span>
                  </div>
                </div>
              </div>

              {/* Cost & Profit Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Financial Breakdown</h4>
                
                <div className="border border-border/50 rounded-2xl overflow-hidden text-xs">
                  {/* Revenue Row */}
                  <div className="flex justify-between items-center p-3 bg-muted/20 border-b border-border/50">
                    <span className="font-semibold text-foreground">Gross Freight Revenue</span>
                    <span className="font-bold text-foreground text-sm">{formatCurrency(viewingReport.freight_revenue)}</span>
                  </div>

                  {/* Expenses Rows */}
                  <div className="p-3 space-y-2 bg-card">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Fuel Cost:</span>
                      <span className="font-medium text-foreground">{formatCurrency(viewingReport.fuel_cost || (viewingReport.distance / viewingReport.mileage * viewingReport.fuel_price))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Toll Charges:</span>
                      <span className="font-medium text-foreground">{formatCurrency(viewingReport.tolls)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Driver Expenses / Batta:</span>
                      <span className="font-medium text-foreground">{formatCurrency(viewingReport.driver_expenses)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tyre Wear & Tear (₹{viewingReport.tyre_depreciation_rate || 3}/km):</span>
                      <span className="font-medium text-foreground">{formatCurrency(viewingReport.tyre_expense || (viewingReport.distance * (viewingReport.tyre_depreciation_rate || 3)))}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border/40 pt-2 mt-1">
                      <span className="text-muted-foreground">Fixed Overheads (EMI, Tax, Insurance):</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(
                          Number(viewingReport.vehicle_emi || 0) + 
                          Number(viewingReport.insurance || 0) + 
                          Number(viewingReport.quarterly_tax || 0)
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Total Expenses Row */}
                  <div className="flex justify-between items-center p-3 bg-muted/10 border-t border-border/50">
                    <span className="font-semibold text-foreground">Total Operating Expenses</span>
                    <span className="font-bold text-foreground">{formatCurrency(viewingReport.total_expenses)}</span>
                  </div>

                  {/* Net Profit Row */}
                  <div className={cn(
                    "flex justify-between items-center p-3.5 border-t border-border/50",
                    Number(viewingReport.net_profit) >= 0 ? "bg-emerald-500/5 text-emerald-600" : "bg-destructive/5 text-destructive"
                  )}>
                    <div className="space-y-0.5">
                      <span className="font-bold text-sm block">Net Profit / Earnings</span>
                      <span className="text-[10px] opacity-80 block">{viewingReport.profit_margin?.toFixed(1)}% Margin on revenue</span>
                    </div>
                    <span className="font-extrabold text-base tabular-nums">{formatCurrency(viewingReport.net_profit)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border/50">
            <Button variant="outline" className="rounded-xl h-11" onClick={() => setViewingReport(null)}>Close Details</Button>
            {viewingReport && (
              <Button className="rounded-xl h-11 gap-1.5" onClick={() => {
                handleLoadReport(viewingReport);
                setViewingReport(null);
              }}>
                <Play className="w-3.5 h-3.5 fill-current" /> Load Simulator
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}