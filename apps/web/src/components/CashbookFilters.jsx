import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';

export default function CashbookFilters({ filters, setFilters }) {
  
  const handleClear = () => {
    setFilters({
      search: '',
      date_from: '',
      date_to: '',
      category: 'all',
      status: 'all'
    });
  };

  const hasActiveFilters = filters.search || filters.date_from || filters.date_to || filters.category !== 'all' || filters.status !== 'all';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Advanced Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        
        {/* Date Range */}
        <div className="xl:col-span-2 flex items-center gap-2">
          <div className="flex-1 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider ml-1">From Date</span>
            <Input 
              type="date" 
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="bg-background"
            />
          </div>
          <span className="text-muted-foreground mt-5">-</span>
          <div className="flex-1 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider ml-1">To Date</span>
            <Input 
              type="date" 
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="bg-background"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider ml-1">Category</span>
          <Select value={filters.category} onValueChange={(val) => setFilters({ ...filters, category: val })}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Expense">Regular Expense</SelectItem>
              <SelectItem value="Payroll">Payroll</SelectItem>
              <SelectItem value="Employee Salary">Employee Salary</SelectItem>
              <SelectItem value="Driver Advance">Driver Advance</SelectItem>
              <SelectItem value="Fuel">Fuel</SelectItem>
              <SelectItem value="EMI">EMI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider ml-1">Status</span>
          <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Paid">Paid / Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search & Clear */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider ml-1">Search</span>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Description or ref..." 
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9 bg-background"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={handleClear} className="shrink-0 text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}