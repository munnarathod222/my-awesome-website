import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PayslipHistory({ employeeId }) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (employeeId) fetchHistory();
  }, [employeeId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('payroll').getFullList({
        filter: `employee_id = '${employeeId}'`,
        sort: 'payroll_year,payroll_month', // Ascending for chart
        $autoCancel: false
      });
      setHistory(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Skeleton className="w-full h-64" />;

  const chartData = history.map(h => ({
    name: `${h.payroll_month}/${h.payroll_year.toString().slice(-2)}`,
    Net: h.net_salary,
    Gross: h.gross_salary
  }));

  // Reverse for table
  const tableHistory = [...history].reverse();

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-[250px]">
        <h3 className="font-semibold text-sm mb-4 text-muted-foreground">Salary Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
            <Line type="monotone" dataKey="Net" stroke="hsl(var(--success))" strokeWidth={2} dot={{r: 4}} />
            <Line type="monotone" dataKey="Gross" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Gross</TableHead>
              <TableHead className="text-right">Advances</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableHistory.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No history found</TableCell></TableRow>
            ) : (
              tableHistory.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-sm">
                    {format(new Date(row.payroll_year, row.payroll_month - 1), 'MMM yyyy')}
                  </TableCell>
                  <TableCell className="text-right text-sm">₹{row.gross_salary?.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm text-destructive">{row.driver_advances > 0 ? `-₹${row.driver_advances.toLocaleString()}` : '-'}</TableCell>
                  <TableCell className="text-right font-bold text-sm text-success">₹{row.net_salary?.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={row.payment_status === 'paid' ? 'bg-success/10 text-success border-success/20 text-[10px]' : 'bg-warning/10 text-warning border-warning/20 text-[10px]'}>
                      {row.payment_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}