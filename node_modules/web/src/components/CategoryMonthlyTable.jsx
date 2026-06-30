import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCcw, ArrowUpDown } from 'lucide-react';
import { formatCurrency } from '@/lib/analyticsUtils.js';

const CategoryMonthlyTable = ({ data }) => {
  const [filters, setFilters] = useState({
    category: 'All',
    startMonth: '',
    endMonth: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'monthKey', direction: 'desc' });

  const categories = useMemo(() => Array.from(new Set(data.map(d => d.category))).sort(), [data]);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filters
    if (filters.category !== 'All') {
      result = result.filter(d => d.category === filters.category);
    }
    if (filters.startMonth) {
      result = result.filter(d => d.monthKey >= filters.startMonth);
    }
    if (filters.endMonth) {
      result = result.filter(d => d.monthKey <= filters.endMonth);
    }

    // Sort
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [data, filters, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const resetFilters = () => {
    setFilters({ category: 'All', startMonth: '', endMonth: '' });
    setSortConfig({ key: 'monthKey', direction: 'desc' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-end sm:items-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Select 
              value={filters.category} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, category: val }))}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Start Month (YYYY-MM)</label>
            <Input 
              type="month" 
              value={filters.startMonth} 
              onChange={(e) => setFilters(prev => ({ ...prev, startMonth: e.target.value }))}
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">End Month (YYYY-MM)</label>
            <Input 
              type="month" 
              value={filters.endMonth} 
              onChange={(e) => setFilters(prev => ({ ...prev, endMonth: e.target.value }))}
              className="bg-background"
            />
          </div>
        </div>
        <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto">
          <RefreshCcw className="w-4 h-4 mr-2" /> Reset
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead onClick={() => handleSort('monthKey')} className="cursor-pointer hover:bg-muted/80 transition-colors font-semibold">
                  <div className="flex items-center gap-1">Month <ArrowUpDown className="w-3 h-3" /></div>
                </TableHead>
                <TableHead onClick={() => handleSort('category')} className="cursor-pointer hover:bg-muted/80 transition-colors font-semibold">
                  <div className="flex items-center gap-1">Category <ArrowUpDown className="w-3 h-3" /></div>
                </TableHead>
                <TableHead onClick={() => handleSort('revenue')} className="cursor-pointer hover:bg-muted/80 transition-colors text-right font-semibold">
                  <div className="flex items-center justify-end gap-1"><ArrowUpDown className="w-3 h-3" /> Revenue</div>
                </TableHead>
                <TableHead onClick={() => handleSort('expenses')} className="cursor-pointer hover:bg-muted/80 transition-colors text-right font-semibold">
                  <div className="flex items-center justify-end gap-1"><ArrowUpDown className="w-3 h-3" /> Expenses</div>
                </TableHead>
                <TableHead onClick={() => handleSort('profit')} className="cursor-pointer hover:bg-muted/80 transition-colors text-right font-semibold">
                  <div className="flex items-center justify-end gap-1"><ArrowUpDown className="w-3 h-3" /> Profit</div>
                </TableHead>
                <TableHead onClick={() => handleSort('margin')} className="cursor-pointer hover:bg-muted/80 transition-colors text-right font-semibold">
                  <div className="flex items-center justify-end gap-1"><ArrowUpDown className="w-3 h-3" /> Margin</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No data matches the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedData.map((row, i) => (
                  <TableRow key={`${row.monthKey}-${row.category}`} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium whitespace-nowrap">{row.month}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(row.revenue)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(row.expenses)}</TableCell>
                    <TableCell className={`text-right tabular-nums font-medium ${row.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(row.profit)}
                    </TableCell>
                    <TableCell className={`text-right tabular-nums ${row.margin >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {row.margin.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default CategoryMonthlyTable;