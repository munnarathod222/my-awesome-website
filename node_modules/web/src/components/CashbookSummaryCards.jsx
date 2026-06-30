import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, ArrowDownRight, ArrowUpRight, TrendingUp, RefreshCcw } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const CATEGORY_COLORS = {
  'Regular Expense': '#3b82f6', // blue
  'Expense': '#3b82f6',         // blue
  'Payroll': '#a855f7',         // purple
  'Employee Salary': '#22c55e', // green
  'Driver Advance': '#f97316',  // orange
  'Driver Advances': '#f97316', // orange
  'Fuel': '#ef4444',            // red
  'Other': '#94a3b8'            // slate
};

export default function CashbookSummaryCards({ transactions, metrics, loading }) {
  
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const { categoryData, trendData } = useMemo(() => {
    if (!transactions || transactions.length === 0) return { categoryData: [], trendData: [] };

    // Process Category Breakdown
    const catMap = {};
    const dateMap = {};

    transactions.forEach(tx => {
      // Category Mapping
      if (tx.transaction_type === 'debit') {
        const cat = tx.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + (tx.amount || 0);
      }

      // Trend Mapping (Group by Date)
      const dateStr = tx.date ? format(parseISO(tx.date), 'MMM dd') : 'Unknown';
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { date: dateStr, income: 0, expense: 0 };
      }
      
      if (tx.transaction_type === 'credit') {
        dateMap[dateStr].income += (tx.amount || 0);
      } else {
        dateMap[dateStr].expense += (tx.amount || 0);
      }
    });

    const formattedCategoryData = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Sort dates properly by creating actual dates, or assume transactions are chronologically sorted
    // Reversing because transactions are passed descending
    const formattedTrendData = Object.values(dateMap).reverse();

    return { categoryData: formattedCategoryData, trendData: formattedTrendData };
  }, [transactions]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-32 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Current Balance */}
        <Card className="border-border shadow-sm bg-card relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5">
            <Wallet className="w-16 h-16" />
          </div>
          <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Current Balance</p>
              <h3 className="text-3xl font-bold text-foreground mt-2 tabular-nums tracking-tight">
                {formatCurrency(metrics.net_balance)}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1">
                <RefreshCcw className="w-3 h-3" /> Updated
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Outflow */}
        <Card className="border-border shadow-sm bg-card">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Outflow</p>
                <h3 className="text-3xl font-bold text-destructive mt-2 tabular-nums tracking-tight">
                  {formatCurrency(metrics.total_outflow)}
                </h3>
              </div>
              <div className="p-2 bg-destructive/10 rounded-xl">
                <ArrowUpRight className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Total debits recorded</p>
          </CardContent>
        </Card>

        {/* Total Inflow */}
        <Card className="border-border shadow-sm bg-card">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Inflow</p>
                <h3 className="text-3xl font-bold text-success mt-2 tabular-nums tracking-tight">
                  {formatCurrency(metrics.total_income)}
                </h3>
              </div>
              <div className="p-2 bg-success/10 rounded-xl">
                <ArrowDownRight className="w-5 h-5 text-success" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Total credits recorded</p>
          </CardContent>
        </Card>

        {/* Breakdown Summary */}
        <Card className="border-border shadow-sm bg-muted/20">
          <CardContent className="p-6 h-full flex flex-col justify-center">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Top Expenses</p>
            <div className="space-y-3">
              {categoryData.slice(0, 3).map((cat, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.name] || CATEGORY_COLORS['Other'] }} />
                    <span className="text-foreground truncate max-w-[100px]">{cat.name}</span>
                  </div>
                  <span className="font-semibold tabular-nums">{formatCurrency(cat.value)}</span>
                </div>
              ))}
              {categoryData.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No expenses recorded</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Line Chart */}
        <Card className="border-border shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Cashflow Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-4">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      minTickGap={20}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(val) => `₹${val/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                      formatter={(value) => [formatCurrency(value), '']}
                    />
                    <Line type="monotone" dataKey="income" name="Income" stroke="hsl(var(--success))" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="expense" name="Expense" stroke="hsl(var(--destructive))" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-xl">
                  No trend data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Pie Chart */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-4">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS['Other']} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-xl">
                  No category data
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}