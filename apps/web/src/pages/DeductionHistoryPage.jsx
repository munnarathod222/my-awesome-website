import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const DeductionHistoryPage = () => {
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [truckFilter, setTruckFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchDeductions = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('stock_deductions').getFullList({
        expand: 'inventory_item_id',
        sort: '-deduction_date',
        $autoCancel: false
      });
      setDeductions(records);
    } catch (err) {
      toast.error('Failed to load deduction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeductions();
  }, []);

  const handleExport = () => {
    const csvData = [
      ['Date', 'Item Name', 'Category', 'Qty', 'Truck ID', 'Reason', 'Notes'],
      ...filtered.map(d => [
        format(new Date(d.deduction_date), 'yyyy-MM-dd'),
        d.expand?.inventory_item_id?.item_name || 'Unknown',
        d.expand?.inventory_item_id?.category || '',
        d.quantity_deducted,
        d.truck_id,
        d.reason,
        d.notes || ''
      ])
    ].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `inventory-usage-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    a.click();
  };

  const filtered = deductions.filter(d => {
    const matchesSearch = (d.expand?.inventory_item_id?.item_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesTruck = truckFilter === 'all' || d.truck_id === truckFilter;
    return matchesSearch && matchesTruck;
  });

  const uniqueTrucks = [...new Set(deductions.map(d => d.truck_id))];

  return (
    <div className="h-full w-full flex flex-col">
      <Helmet><title>Inventory Usage History</title></Helmet>
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Usage History</h1>
            <p className="text-muted-foreground mt-1">Track where and why inventory items were used.</p>
          </div>
          <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
        </div>

        <Card className="border-border shadow-sm">
          <div className="p-4 border-b flex flex-wrap gap-4 bg-muted/20">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input placeholder="Search item..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={truckFilter} onValueChange={setTruckFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by Truck" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trucks</SelectItem>
                {uniqueTrucks.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Qty Used</TableHead>
                  <TableHead>Truck</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No usage history found.</TableCell></TableRow>
                ) : (
                  filtered.map(row => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium whitespace-nowrap">{format(new Date(row.deduction_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{row.expand?.inventory_item_id?.item_name || 'Unknown'}</TableCell>
                      <TableCell><Badge variant="secondary" className="font-normal">{row.expand?.inventory_item_id?.category}</Badge></TableCell>
                      <TableCell className="text-right font-bold text-destructive">-{row.quantity_deducted}</TableCell>
                      <TableCell className="font-medium">{row.truck_id}</TableCell>
                      <TableCell className="capitalize">{row.reason}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{row.notes || '-'}</TableCell>
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

export default DeductionHistoryPage;