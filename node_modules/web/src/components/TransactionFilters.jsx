import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

const TransactionFilters = ({ filters, setFilters }) => {
  const handleClear = () => {
    setFilters({
      search: '',
      category: 'all',
      source_module: 'all',
      date_from: '',
      date_to: ''
    });
  };

  return (
    <div className="flex flex-col gap-4 mb-6 bg-card p-4 rounded-xl border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Filter Transactions</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search description..." 
            className="pl-9 bg-background"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        
        <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Expenses">Expenses</SelectItem>
            <SelectItem value="Driver Advances">Advances</SelectItem>
            <SelectItem value="Payroll">Payroll</SelectItem>
            <SelectItem value="Fuel">Fuel</SelectItem>
            <SelectItem value="Manual">Manual</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input 
            type="date" 
            className="bg-background text-sm"
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            title="From Date"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Input 
            type="date" 
            className="bg-background text-sm"
            value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            title="To Date"
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-2">
        <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4 mr-2" /> Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default TransactionFilters;