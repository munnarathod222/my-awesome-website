import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import pb from '@/lib/pocketbaseClient';

const COLORS = ['#2563eb', '#f97316', '#16a34a', '#dc2626']; // Primary, Accent, Success, Destructive matching tailwind tokens

const PayrollReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [paymentModeData, setPaymentModeData] = useState([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState([]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const records = await pb.collection('payroll').getFullList({ $autoCancel: false });
        
        // Payment Modes Pie Chart
        const modeCount = {};
        records.forEach(r => {
          if (r.payment_status === 'paid') {
            const mode = r.payment_mode || 'unknown';
            modeCount[mode] = (modeCount[mode] || 0) + r.net_salary;
          }
        });
        const modeChart = Object.keys(modeCount).map(key => ({
          name: key.toUpperCase(),
          value: modeCount[key]
        }));
        setPaymentModeData(modeChart);

        // Monthly Trend Bar Chart
        const trendMap = {};
        records.forEach(r => {
          const key = `${r.payroll_year}-${String(r.payroll_month).padStart(2, '0')}`;
          if (!trendMap[key]) trendMap[key] = { name: key, Paid: 0, Pending: 0 };
          if (r.payment_status === 'paid') trendMap[key].Paid += r.net_salary;
          else trendMap[key].Pending += r.net_salary;
        });
        // Sort keys chronologically
        const sortedKeys = Object.keys(trendMap).sort();
        setMonthlyTrendData(sortedKeys.map(k => trendMap[k]));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Payroll Reports - Jai Bhavani Cargo</title></Helmet>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Payroll Analytics</h1>
          <p className="text-muted-foreground mt-1">Visual insights into payroll expenditure</p>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading reports...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Disbursement by Payment Mode (Value)</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                {paymentModeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentModeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {paymentModeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Monthly Payroll Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                {monthlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" tickFormatter={(val) => `₹${val/1000}k`} />
                      <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))'}} />
                      <Legend />
                      <Bar dataKey="Paid" stackId="a" fill="hsl(var(--success))" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="Pending" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default PayrollReportsPage;