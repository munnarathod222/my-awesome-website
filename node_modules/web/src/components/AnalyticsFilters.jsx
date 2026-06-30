import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, RefreshCcw } from 'lucide-react';

const AnalyticsFilters = ({ filters, setFilters, onApply, onReset }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm mb-8 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Start Date</label>
          <Input 
            type="date" 
            value={filters.startDate} 
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">End Date</label>
          <Input 
            type="date" 
            value={filters.endDate} 
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Time Period</label>
          <Select 
            value={filters.period} 
            onValueChange={(val) => setFilters({ ...filters, period: val })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button variant="outline" onClick={onReset} className="flex-1 sm:flex-none">
          <RefreshCcw className="w-4 h-4 mr-2" /> Reset
        </Button>
        <Button onClick={onApply} className="flex-1 sm:flex-none">
          <Filter className="w-4 h-4 mr-2" /> Apply
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsFilters;