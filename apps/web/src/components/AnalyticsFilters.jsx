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
    <div className="bg-slate-900/65 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2.5 px-4 shadow-md mb-5 flex flex-wrap items-center gap-4 text-xs font-sans">
      <div className="flex flex-wrap items-center gap-3.5 flex-1 min-w-[280px]">
        {/* Start Date */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0">Start</span>
          <Input 
            type="date" 
            value={filters.startDate} 
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="bg-slate-950/60 border-slate-800 rounded-xl h-8 text-[11px] font-medium w-[125px] px-2.5 py-0 text-white"
          />
        </div>

        {/* End Date */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0">End</span>
          <Input 
            type="date" 
            value={filters.endDate} 
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="bg-slate-950/60 border-slate-800 rounded-xl h-8 text-[11px] font-medium w-[125px] px-2.5 py-0 text-white"
          />
        </div>

        {/* Aggregation */}
        <div className="flex items-center gap-2 min-w-[130px] shrink-0">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0">View</span>
          <Select 
            value={filters.period} 
            onValueChange={(val) => setFilters({ ...filters, period: val })}
          >
            <SelectTrigger className="bg-slate-950/60 border-slate-800 rounded-xl h-8 text-[11px] font-bold py-0 text-slate-200">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
              <SelectItem value="monthly">Monthly View</SelectItem>
              <SelectItem value="quarterly">Quarterly Breakdown</SelectItem>
              <SelectItem value="annual">Annual Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        {/* Quick Presets Dropdown */}
        <div className="flex items-center gap-2 min-w-[140px] shrink-0">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Range
          </span>
          <Select 
            onValueChange={handlePreset}
          >
            <SelectTrigger className="bg-slate-950/60 border-slate-800 rounded-xl h-8 text-[11px] font-black py-0 text-amber-300">
              <SelectValue placeholder="Quick Range" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="fy_25_26">FY 2025-26</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button 
            variant="outline" 
            onClick={onReset} 
            className="rounded-xl h-8 text-[11px] font-bold border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 px-3"
          >
            <RefreshCcw className="w-3 h-3 mr-1 text-slate-400" /> Reset
          </Button>
          <Button 
            onClick={onApply} 
            className="rounded-xl h-8 text-[11px] font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-sm gap-1 px-3.5"
          >
            <Filter className="w-3 h-3" /> Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;