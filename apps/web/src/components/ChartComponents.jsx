import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const COLORS = [
  '#6366f1', // Indigo Blue
  '#10b981', // Emerald Green
  '#f59e0b', // Amber Gold
  '#f43f5e', // Rose Red
  '#3b82f6'  // Bright Blue
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
        <p className="font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-semibold tabular-nums">
              ₹{entry.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const MonthlyTrendChart = ({ data }) => {
  return (
    <div className="analytics-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={11} 
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis 
            yAxisId="left"
            stroke="hsl(var(--muted-foreground))" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            dx={-5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '15px' }} iconType="circle" iconSize={8} />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="revenue" 
            name="Revenue" 
            stroke="#6366f1" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 1.5, fill: '#0a0f1e', stroke: '#6366f1' }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
            connectNulls={true}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="expenses" 
            name="Expenses" 
            stroke="#f43f5e" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 1.5, fill: '#0a0f1e', stroke: '#f43f5e' }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }}
            connectNulls={true}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="profit" 
            name="Profit" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 1.5, fill: '#0a0f1e', stroke: '#10b981' }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryPieChart = ({ data }) => {
  return (
    <div className="analytics-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const QuarterlyComparisonChart = ({ data }) => {
  return (
    <div className="analytics-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="quarter" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={8}
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
          <Legend wrapperStyle={{ paddingTop: '15px' }} iconType="circle" iconSize={8} />
          <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};