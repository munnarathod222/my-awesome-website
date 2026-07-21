import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, RefreshCcw, Calendar, Sparkles } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';

const AnalyticsFilters = ({ filters, setFilters, onApply, onReset }) => {
  const handlePreset = (presetKey) => {
    const now = new Date();
    let start = '';
    let end = '';

    if (presetKey === 'this_month') {
      start = format(startOfMonth(now), 'yyyy-MM-dd');
      end = format(endOfMonth(now), 'yyyy-MM-dd');
    } else if (presetKey === 'last_month') {
      const prevMonth = subMonths(now, 1);
      start = format(startOfMonth(prevMonth), 'yyyy-MM-dd');
      end = format(endOfMonth(prevMonth), 'yyyy-MM-dd');
    } else if (presetKey === 'last_3_months') {
      start = format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd');
      end = format(endOfMonth(now), 'yyyy-MM-dd');
    } else if (presetKey === 'fy_25_26') {
      start = '2025-04-01';
      end = '2026-03-31';
    } else if (presetKey === 'all') {
      start = '';
      end = '';
    }

    const updated = { ...filters, startDate: start, endDate: end };
    setFilters(updated);
    if (onApply) {
      setTimeout(() => onApply(updated), 0);
    }
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 shadow-lg mb-8 space-y-4">
      {/* Top Quick Presets Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-border/30">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> Quick Range:
        </span>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => handlePreset('this_month')}
          className="rounded-xl text-xs h-7 px-3 font-semibold hover:border-primary"
        >
          This Month
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => handlePreset('last_month')}
          className="rounded-xl text-xs h-7 px-3 font-semibold hover:border-primary"
        >
          Last Month
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => handlePreset('last_3_months')}
          className="rounded-xl text-xs h-7 px-3 font-semibold hover:border-primary"
        >
          Last 3 Months
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => handlePreset('fy_25_26')}
          className="rounded-xl text-xs h-7 px-3 font-semibold hover:border-primary"
        >
          FY 2025-26
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => handlePreset('all')}
          className="rounded-xl text-xs h-7 px-3 font-bold text-primary hover:bg-primary/10"
        >
          All Time
        </Button>
      </div>

      {/* Main Filter Inputs Row */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Start Date</label>
            <Input 
              type="date" 
              value={filters.startDate} 
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="bg-background/80 rounded-xl h-10 text-xs font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">End Date</label>
            <Input 
              type="date" 
              value={filters.endDate} 
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="bg-background/80 rounded-xl h-10 text-xs font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Aggregation</label>
            <Select 
              value={filters.period} 
              onValueChange={(val) => setFilters({ ...filters, period: val })}
            >
              <SelectTrigger className="bg-background/80 rounded-xl h-10 text-xs font-bold">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly View</SelectItem>
                <SelectItem value="quarterly">Quarterly Breakdown</SelectItem>
                <SelectItem value="annual">Annual Financial Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <Button 
            variant="outline" 
            onClick={onReset} 
            className="flex-1 md:flex-none rounded-xl h-10 text-xs font-bold border-border/50 hover:bg-muted"
          >
            <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
          </Button>
          <Button 
            onClick={onApply} 
            className="flex-1 md:flex-none rounded-xl h-10 text-xs font-extrabold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" /> Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;