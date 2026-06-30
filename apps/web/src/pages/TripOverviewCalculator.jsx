import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp, Truck, DollarSign, Activity, Calculator, PieChart, Save, RefreshCw, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '@/lib/utils.js';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-5 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-primary" />
            Trip Overview Calculator
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Simulate profitability based on variable constraints, tyre depreciation, and vehicle fixed costs.
          </p>
        </div>
        <Button onClick={() => setIsSaveDialogOpen(true)} className="rounded-xl font-bold shadow-sm">
          <Save className="w-4 h-4 mr-2" /> Save Calculation
        </Button>
      </div>

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

      {/* Save Calculation Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={(open) => !open && setIsSaveDialogOpen(false)}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Profitability Calculation</DialogTitle>
            <DialogDescription>Attach metadata to record this calculation log.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCalculation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="routeName">Route Name *</Label>
              <Select 
                value={metaData.routeName} 
                onValueChange={(val) => setMetaData({...metaData, routeName: val})}
                required
              >
                <SelectTrigger className="bg-background rounded-xl border-border w-full">
                  <SelectValue placeholder="Select Route Name" />
                </SelectTrigger>
                <SelectContent>
                  {routesList.map((route) => (
                    <SelectItem key={route.id} value={route.route_name}>
                      {route.route_name} {route.route_code ? `(${route.route_code})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Registration Number</Label>
              <Select 
                value={metaData.vehicleNumber || 'none'} 
                onValueChange={(val) => setMetaData({...metaData, vehicleNumber: val})}
              >
                <SelectTrigger className="bg-background rounded-xl border-border w-full">
                  <SelectValue placeholder="Select Vehicle Number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / Select later</SelectItem>
                  {trucksList.map((truck) => (
                    <SelectItem key={truck.id} value={truck.truck_number}>
                      {truck.truck_number} {truck.truck_name ? `(${truck.truck_name})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsSaveDialogOpen(false)} disabled={saveLoading} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={saveLoading} className="rounded-xl font-bold">
                {saveLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}