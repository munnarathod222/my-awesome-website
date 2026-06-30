import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { IndianRupee, TrendingUp, ShieldCheck, Activity, SplitSquareHorizontal } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis } from 'recharts';
import WaiverTrackingPanel from './WaiverTrackingPanel.jsx';
import PaymentSplitterCalculator from './PaymentSplitterCalculator.jsx';

export default function SurchargeDashboard({ data, loading }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl w-full" />)}
        <Skeleton className="h-64 rounded-xl w-full md:col-span-2 lg:col-span-4" />
      </div>
    );
  }

  let trendPercent = 0;
  let isTrendUp = true;
  if (data.byMonth.length >= 2) {
    const current = data.byMonth[data.byMonth.length - 1].value;
    const previous = data.byMonth[data.byMonth.length - 2].value;
    if (previous > 0) {
      trendPercent = ((current - previous) / previous) * 100;
      isTrendUp = trendPercent > 0;
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center bg-muted/20 p-2 rounded-xl border border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent h-auto p-0">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2">
              Dashboard Overview
            </TabsTrigger>
            <TabsTrigger value="splitter" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 flex gap-2">
              <SplitSquareHorizontal className="w-4 h-4" /> Payment Splitter
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="fin-card">
              <CardContent className="p-0 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="bg-destructive/10 p-3 rounded-xl">
                    <IndianRupee className="w-5 h-5 text-destructive" />
                  </div>
                  {data.byMonth.length >= 2 && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${isTrendUp ? 'text-destructive' : 'text-success'}`}>
                      {isTrendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                      {Math.abs(trendPercent).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <p className="fin-stat-label">Total Surcharge Incurred</p>
                  <h3 className="fin-stat-value text-foreground">
                    ₹{data.totalSurcharge.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="fin-card">
              <CardContent className="p-0 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="bg-success/10 p-3 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-success" />
                  </div>
                </div>
                <div className="mt-6">
                  <p className="fin-stat-label">Total Waived / Saved</p>
                  <h3 className="fin-stat-value text-foreground">
                    ₹{data.savedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="fin-card">
              <CardContent className="p-0 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="mt-6">
                  <p className="fin-stat-label">Transactions with Surcharge</p>
                  <h3 className="fin-stat-value text-foreground">
                    {data.transactionCount}
                  </h3>
                </div>
              </CardContent>
            </Card>
            
            <Card className="fin-card">
              <CardContent className="p-0 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="bg-secondary p-3 rounded-xl">
                    <IndianRupee className="w-5 h-5 text-secondary-foreground" />
                  </div>
                </div>
                <div className="mt-6">
                  <p className="fin-stat-label">Average Surcharge per Tx</p>
                  <h3 className="fin-stat-value text-foreground">
                    ₹{data.averageSurcharge.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-border shadow-sm h-full">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Monthly Surcharge Trend</h3>
                    <p className="text-sm text-muted-foreground">Historical view of surcharges incurred over time.</p>
                  </div>
                  <div className="flex-1 min-h-[300px] w-full">
                    {data.byMonth.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.byMonth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            tickFormatter={(val) => `₹${val}`}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Surcharge']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--destructive))" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: "hsl(var(--card))", strokeWidth: 2 }}
                            activeDot={{ r: 6, stroke: "hsl(var(--destructive))", strokeWidth: 2, fill: "hsl(var(--card))" }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                        No trend data available.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <WaiverTrackingPanel />
            </div>
          </div>
        </>
      )}

      {activeTab === 'splitter' && (
        <PaymentSplitterCalculator onSuccess={() => setActiveTab('overview')} />
      )}
    </div>
  );
}