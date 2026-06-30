import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const QuarterlyAnalysisSummary = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.slice(-4).map((q) => (
        <Card key={q.quarter} className="shadow-sm border-border hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{q.quarter}</h3>
              <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                q.qoqGrowth > 0 ? 'bg-success/10 text-success' : 
                q.qoqGrowth < 0 ? 'bg-destructive/10 text-destructive' : 
                'bg-muted text-muted-foreground'
              }`}>
                {q.qoqGrowth > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : 
                 q.qoqGrowth < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : 
                 <Minus className="w-3 h-3 mr-1" />}
                {Math.abs(q.qoqGrowth).toFixed(1)}% QoQ
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium tabular-nums">₹{q.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Expenses</span>
                <span className="font-medium tabular-nums">₹{q.expenses.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between items-center">
                <span className="font-medium">Profit</span>
                <span className={`font-bold tabular-nums ${q.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ₹{q.profit.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuarterlyAnalysisSummary;