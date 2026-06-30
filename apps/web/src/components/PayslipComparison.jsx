import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function PayslipComparison({ currentPayroll, employeeId }) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [compareId, setCompareId] = useState('');

  useEffect(() => {
    if (employeeId) fetchHistory();
  }, [employeeId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('payroll').getFullList({
        filter: `employee_id = '${employeeId}' && id != '${currentPayroll?.id}'`,
        sort: '-created',
        $autoCancel: false
      });
      setHistory(records);
      if (records.length > 0) {
        setCompareId(records[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Skeleton className="w-full h-64" />;
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-muted/20 rounded-xl border border-border">
        <AlertCircle className="w-10 h-10 text-muted-foreground opacity-50 mb-3" />
        <p className="text-muted-foreground font-medium">No previous payslips found to compare.</p>
      </div>
    );
  }

  const prevPayroll = history.find(r => r.id === compareId);

  const getDiff = (curr, prev) => {
    const diff = (curr || 0) - (prev || 0);
    if (diff > 0) return <span className="text-success flex items-center justify-end text-xs"><TrendingUp className="w-3 h-3 mr-1" /> +{diff.toLocaleString()}</span>;
    if (diff < 0) return <span className="text-destructive flex items-center justify-end text-xs"><TrendingDown className="w-3 h-3 mr-1" /> {diff.toLocaleString()}</span>;
    return <span className="text-muted-foreground flex items-center justify-end text-xs"><Minus className="w-3 h-3" /></span>;
  };

  const chartData = [
    { name: 'Gross', Current: currentPayroll?.gross_salary || 0, Previous: prevPayroll?.gross_salary || 0 },
    { name: 'Net', Current: currentPayroll?.net_salary || 0, Previous: prevPayroll?.net_salary || 0 },
    { name: 'Base', Current: currentPayroll?.base_salary || 0, Previous: prevPayroll?.base_salary || 0 },
    { name: 'Advances', Current: currentPayroll?.driver_advances || 0, Previous: prevPayroll?.driver_advances || 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border">
        <div>
          <h3 className="font-semibold text-foreground">Comparison Mode</h3>
          <p className="text-xs text-muted-foreground">Select a past period to compare against current.</p>
        </div>
        <Select value={compareId} onValueChange={setCompareId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {history.map(h => (
              <SelectItem key={h.id} value={h.id}>
                {format(new Date(h.payroll_year, h.payroll_month - 1), 'MMM yyyy')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-4 bg-muted/50 p-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
            <div className="col-span-2">Metric</div>
            <div className="text-right">Current</div>
            <div className="text-right">Previous</div>
          </div>
          <div className="divide-y divide-border text-sm">
            <div className="grid grid-cols-4 p-3 hover:bg-muted/30">
              <div className="col-span-2 font-medium">Base Salary</div>
              <div className="text-right">₹{currentPayroll?.base_salary?.toLocaleString() || 0}</div>
              <div className="text-right">{getDiff(currentPayroll?.base_salary, prevPayroll?.base_salary)}</div>
            </div>
            <div className="grid grid-cols-4 p-3 hover:bg-muted/30">
              <div className="col-span-2 font-medium">Trip Bonus</div>
              <div className="text-right">₹{currentPayroll?.trip_bonus?.toLocaleString() || 0}</div>
              <div className="text-right">{getDiff(currentPayroll?.trip_bonus, prevPayroll?.trip_bonus)}</div>
            </div>
            <div className="grid grid-cols-4 p-3 hover:bg-muted/30">
              <div className="col-span-2 font-medium">Gross Salary</div>
              <div className="text-right">₹{currentPayroll?.gross_salary?.toLocaleString() || 0}</div>
              <div className="text-right">{getDiff(currentPayroll?.gross_salary, prevPayroll?.gross_salary)}</div>
            </div>
            <div className="grid grid-cols-4 p-3 hover:bg-muted/30">
              <div className="col-span-2 font-medium">Advance Deductions</div>
              <div className="text-right">₹{currentPayroll?.driver_advances?.toLocaleString() || 0}</div>
              <div className="text-right">{getDiff(currentPayroll?.driver_advances, prevPayroll?.driver_advances)}</div>
            </div>
            <div className="grid grid-cols-4 p-3 hover:bg-muted/30 bg-primary/5">
              <div className="col-span-2 font-bold text-primary">Net Salary</div>
              <div className="text-right font-bold">₹{currentPayroll?.net_salary?.toLocaleString() || 0}</div>
              <div className="text-right font-bold">{getDiff(currentPayroll?.net_salary, prevPayroll?.net_salary)}</div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Current" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Previous" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}