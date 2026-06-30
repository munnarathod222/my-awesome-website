import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SurchargeAnalytics({ data, loading }) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  // Identify the card with maximum surcharge to highlight it
  const maxSurchargeCard = data.byCard.length > 0 ? data.byCard[0].name : '';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart: Surcharge by Card */}
        <Card className="border-border shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Surcharge by Credit Card</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-6">
            <div className="h-[250px] w-full mt-4">
              {data.byCard.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byCard} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                      width={100}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Surcharge']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                      {data.byCard.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === maxSurchargeCard ? 'hsl(var(--destructive))' : 'hsl(var(--primary)/0.6)'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  No data to display.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table: Analytics Breakdown */}
        <Card className="border-border shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Card Statistics Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="overflow-auto max-h-[280px]">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 backdrop-blur-sm">
                  <TableRow>
                    <TableHead>Card Name</TableHead>
                    <TableHead className="text-right">Total Surcharge</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.byCard.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No data available.</TableCell>
                    </TableRow>
                  ) : (
                    data.byCard.map((card, i) => {
                      const percentage = data.totalSurcharge > 0 ? (card.value / data.totalSurcharge) * 100 : 0;
                      return (
                        <TableRow key={i} className="hover:bg-muted/20">
                          <TableCell className="font-medium">{card.name}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold text-destructive">
                            ₹{card.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}