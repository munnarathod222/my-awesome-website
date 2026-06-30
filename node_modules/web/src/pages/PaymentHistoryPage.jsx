import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/pocketbaseClient';
import { generatePayrollCSV, downloadCSV } from '@/lib/SalaryCalculationHelper';
import { Download, Search } from 'lucide-react';
import { format } from 'date-fns';

const PaymentHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('payroll').getFullList({
        sort: '-payroll_year,-payroll_month,-created',
        $autoCancel: false
      });
      setHistory(records);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (history.length === 0) return;
    const csvStr = generatePayrollCSV(history);
    downloadCSV(csvStr, `payroll_history_${format(new Date(), 'yyyyMMdd')}.csv`);
  };

  const filteredHistory = history.filter(h => 
    h.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Payment History - Payroll</title>
      </Helmet>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
            <p className="text-muted-foreground mt-1">View all historical payroll records</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employee..."
                className="pl-9 bg-card"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        <Card className="shadow-sm border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center">Loading history...</TableCell></TableRow>
                ) : filteredHistory.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No records found.</TableCell></TableRow>
                ) : (
                  filteredHistory.map(record => (
                    <TableRow key={record.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium whitespace-nowrap">
                        {format(new Date(record.payroll_year, record.payroll_month - 1), 'MMM yyyy')}
                      </TableCell>
                      <TableCell>{record.employee_name}</TableCell>
                      <TableCell className="font-bold">₹{record.net_salary.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={record.payment_status === 'paid' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
                          {record.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{record.payment_mode || '-'}</TableCell>
                      <TableCell>
                        {record.payment_date ? format(new Date(record.payment_date), 'dd MMM yyyy') : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default PaymentHistoryPage;