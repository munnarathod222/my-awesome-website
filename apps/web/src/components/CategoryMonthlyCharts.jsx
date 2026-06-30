import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const CHART_COLORS = [
  'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(200, 70%, 50%)', 
  'hsl(250, 70%, 60%)', 'hsl(330, 70%, 50%)'
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
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ bottom: 0, paddingTop: '20px' }} />
            {categories.map((cat, index) => (
              <Line 
                key={cat}
                type="monotone" 
                dataKey={cat} 
                name={cat} 
                stroke={CHART_COLORS[index % CHART_COLORS.length]} 
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 6 }}
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