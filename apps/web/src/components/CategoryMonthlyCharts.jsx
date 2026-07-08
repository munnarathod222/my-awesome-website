import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const CHART_COLORS = [
  '#6366f1', // Indigo Blue
  '#10b981', // Emerald Green
  '#f59e0b', // Amber Gold
  '#f43f5e', // Rose Red
  '#3b82f6', // Bright Blue
  '#a78bfa', // Purple / Violet
  '#06b6d4', // Cyan / Teal
  '#f97316'  // Orange
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-lg min-w-[200px]">
        <p className="font-medium text-foreground mb-2 pb-2 border-b border-border">{label}</p>
        <div className="space-y-1">
          {payload
            .slice()
            .sort((a, b) => b.value - a.value)
            .map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
                <span className="font-semibold tabular-nums text-foreground">
                  ₹{entry.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const MultiLineChart = ({ data, categories, title, formatterLabel }) => (
  <Card className="shadow-sm border-border">
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ bottom: -10, paddingTop: '15px' }} 
              iconType="circle"
              iconSize={8}
            />
            {categories.map((cat, index) => (
              <Line 
                key={cat}
                type="monotone" 
                dataKey={cat} 
                name={cat} 
                stroke={CHART_COLORS[index % CHART_COLORS.length]} 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 1.5, fill: '#0a0f1e', stroke: CHART_COLORS[index % CHART_COLORS.length] }}
                activeDot={{ r: 6, strokeWidth: 0, fill: CHART_COLORS[index % CHART_COLORS.length] }}
                connectNulls={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

const CategoryMonthlyCharts = ({ chartData }) => {
  if (!chartData || chartData.categories.length === 0) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <MultiLineChart 
        data={chartData.revenueData} 
        categories={chartData.categories} 
        title="Revenue Trend by Category" 
      />
      <MultiLineChart 
        data={chartData.expensesData} 
        categories={chartData.categories} 
        title="Expense Trend by Category" 
      />
      <div className="xl:col-span-2">
        <MultiLineChart 
          data={chartData.profitData} 
          categories={chartData.categories} 
          title="Profit Trend by Category" 
        />
      </div>
    </div>
  );
};

export default CategoryMonthlyCharts;