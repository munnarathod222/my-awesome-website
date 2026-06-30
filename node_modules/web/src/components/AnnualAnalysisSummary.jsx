import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const AnnualAnalysisSummary = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.slice(-3).map((y) => (
        <Card key={y.year} className="shadow-sm border-border hover:shadow-md transition-all bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-extrabold tracking-tight">{y.year}</h3>
              <div className={`flex items-center text-sm font-medium px-2.5 py-1 rounded-full ${
                y.yoyGrowth > 0 ? 'bg-success/10 text-success' : 
                y.yoyGrowth < 0 ? 'bg-destructive/10 text-destructive' : 
                'bg-muted text-muted-foreground'
              }`}>
                {y.yoyGrowth > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : 
                 y.yoyGrowth < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : 
                 <Minus className="w-4 h-4 mr-1" />}
                {Math.abs(y.yoyGrowth).toFixed(1)}% YoY
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-xl font-semibold tabular-nums">₹{y.revenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                <p className="text-xl font-semibold tabular-nums">₹{y.expenses.toLocaleString()}</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                <p className={`text-2xl font-bold tabular-nums ${y.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ₹{y.profit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnnualAnalysisSummary;