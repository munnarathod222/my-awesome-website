import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MonthlyAnalyticsTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-muted-foreground border border-border rounded-2xl bg-card">No monthly data available.</div>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-semibold">Month</TableHead>
            <TableHead className="text-right font-semibold">Revenue</TableHead>
            <TableHead className="text-right font-semibold">Expenses</TableHead>
            <TableHead className="text-right font-semibold">Profit</TableHead>
            <TableHead className="text-right font-semibold">Margin</TableHead>
            <TableHead className="text-right font-semibold">MoM Growth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={row.sortKey} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">{row.month}</TableCell>
              <TableCell className="text-right tabular-nums">₹{row.revenue.toLocaleString()}</TableCell>
              <TableCell className="text-right tabular-nums">₹{row.expenses.toLocaleString()}</TableCell>
              <TableCell className={`text-right tabular-nums font-medium ${row.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                ₹{row.profit.toLocaleString()}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.margin.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <div className="flex items-center justify-end gap-1">
                  {row.momGrowth > 0 ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : row.momGrowth < 0 ? (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  ) : (
                    <Minus className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={row.momGrowth > 0 ? 'text-success' : row.momGrowth < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                    {Math.abs(row.momGrowth).toFixed(1)}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MonthlyAnalyticsTable;