import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, PieChart, Pie, Cell } from 'recharts';
import pb from '@/lib/pocketbaseClient.js';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const InventoryReportsPage = () => {
  const [items, setItems] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, deducRes] = await Promise.all([
          pb.collection('inventory_items').getFullList({ $autoCancel: false }),
          pb.collection('stock_deductions').getFullList({ expand: 'inventory_item_id', $autoCancel: false })
        ]);
        setItems(itemsRes);
        setDeductions(deducRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare Chart Data
  const valueByCategory = items.reduce((acc, item) => {
    const val = item.current_stock * (item.unit_cost || 0);
    acc[item.category] = (acc[item.category] || 0) + val;
    return acc;
  }, {});
  const categoryData = Object.keys(valueByCategory).map(k => ({ name: k, value: valueByCategory[k] }));

  const usageByTruck = deductions.reduce((acc, ded) => {
    acc[ded.truck_id] = (acc[ded.truck_id] || 0) + 1; // Count of usage instances
    return acc;
  }, {});
  const truckData = Object.keys(usageByTruck).map(k => ({ name: k, usages: usageByTruck[k] })).sort((a,b) => b.usages - a.usages).slice(0, 10);

  return (
    <div className="h-full w-full flex flex-col">
      <Helmet><title>Inventory Reports</title></Helmet>
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Analytics</h1>
          <p className="text-muted-foreground mt-1">Visualize your stock value and usage trends.</p>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">Loading analytics...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-sm border-border">
              <CardHeader><CardTitle>Inventory Value by Category (₹)</CardTitle></CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label={({name, value}) => `${name} (₹${value.toLocaleString()})`}>
                      {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border">
              <CardHeader><CardTitle>Top Trucks by Part Usage Instances</CardTitle></CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={truckData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--foreground))" />
                    <YAxis dataKey="name" type="category" width={100} stroke="hsl(var(--foreground))" />
                    <RechartsTooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))'}} />
                    <Bar dataKey="usages" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default InventoryReportsPage;