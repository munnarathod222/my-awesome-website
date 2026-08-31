import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, MapPin, Clock, Plus, Trash2, Calendar, 
  ArrowRight, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, ChevronDown 
} from 'lucide-react';
import { cn } from '@/lib/utils.js';

// Predefined timing presets for quick setup
export const PREDEFINED_TIMINGS = {
  dock: [
    { arrival: '08:00', dispatch: '10:30', offset: 0 },
    { arrival: '11:00', dispatch: '12:30', offset: 0 },
    { arrival: '13:00', dispatch: '14:30', offset: 0 },
    { arrival: '15:00', dispatch: '16:30', offset: 0 },
    { arrival: '18:00', dispatch: '19:30', offset: 0 },
  ],
  drop: [
    { arrival: '15:00', dispatch: '16:30', offset: 0 },
    { arrival: '19:00', dispatch: '20:30', offset: 0 },
    { arrival: '08:00', dispatch: '09:30', offset: 1 },
    { arrival: '12:00', dispatch: '13:30', offset: 1 },
    { arrival: '16:00', dispatch: '17:30', offset: 1 },
    { arrival: '20:00', dispatch: '21:30', offset: 1 },
    { arrival: '09:00', dispatch: '10:30', offset: 2 },
    { arrival: '14:00', dispatch: '15:30', offset: 2 },
    { arrival: '18:00', dispatch: '19:30', offset: 2 },
    { arrival: '22:00', dispatch: '23:30', offset: 2 },
  ]
};

/**
 * Generate default stop list given dock and drop counts
 */
export function generateDefaultStops(docksCount = 1, dropsCount = 1, origin = '', destination = '') {
  const stops = [];
  
  // 1. Docks (Pickups)
  for (let i = 0; i < docksCount; i++) {
    const defaultTiming = PREDEFINED_TIMINGS.dock[i] || { arrival: '08:00', dispatch: '10:00', offset: 0 };
    stops.push({
      id: `dock_${i + 1}`,
      stop_number: i + 1,
      type: 'dock',
      label: `Dock ${i + 1} (Pickup)`,
      name: i === 0 ? (origin || 'Primary Loading Dock') : `Secondary Dock ${i + 1}`,
      sched_arrival_time: defaultTiming.arrival,
      sched_dispatch_time: defaultTiming.dispatch,
      day_offset: defaultTiming.offset
    });
  }

  // 2. Drops (Deliveries)
  for (let j = 0; j < dropsCount; j++) {
    const defaultTiming = PREDEFINED_TIMINGS.drop[j] || { arrival: '16:00', dispatch: '17:30', offset: 0 };
    const stopNum = docksCount + j + 1;
    stops.push({
      id: `drop_${j + 1}`,
      stop_number: stopNum,
      type: 'drop',
      label: `Drop ${j + 1} (Delivery)`,
      name: j === dropsCount - 1 && destination ? destination : `Delivery Drop ${j + 1}`,
      sched_arrival_time: defaultTiming.arrival,
      sched_dispatch_time: defaultTiming.dispatch,
      day_offset: defaultTiming.offset
    });
  }

  return stops;
}

export default function DynamicTripStopsConfigurator({
  stops = [],
  onChange,
  origin = '',
  destination = '',
  legLabel = 'UP Leg (Forward)',
  className = ''
}) {
  const [docksCount, setDocksCount] = useState(1);
  const [dropsCount, setDropsCount] = useState(1);

  // Initialize or synchronize internal counts with stops prop
  useEffect(() => {
    if (Array.isArray(stops) && stops.length > 0) {
      const docks = stops.filter(s => s.type === 'dock').length || 1;
      const drops = stops.filter(s => s.type === 'drop').length || 1;
      setDocksCount(docks);
      setDropsCount(drops);
    } else {
      // Auto generate defaults if empty
      const initial = generateDefaultStops(1, 1, origin, destination);
      onChange?.(initial);
    }
  }, []);

  // Handle Docks count change
  const handleDocksCountChange = (count) => {
    const num = Number(count);
    setDocksCount(num);
    const existingDrops = stops.filter(s => s.type === 'drop');
    const newStops = [];

    // Rebuild docks
    for (let i = 0; i < num; i++) {
      const existing = stops.find(s => s.id === `dock_${i + 1}`);
      const defTiming = PREDEFINED_TIMINGS.dock[i] || { arrival: '08:00', dispatch: '10:00', offset: 0 };
      newStops.push(existing || {
        id: `dock_${i + 1}`,
        stop_number: i + 1,
        type: 'dock',
        label: `Dock ${i + 1} (Pickup)`,
        name: i === 0 ? (origin || 'Primary Loading Dock') : `Secondary Dock ${i + 1}`,
        sched_arrival_time: defTiming.arrival,
        sched_dispatch_time: defTiming.dispatch,
        day_offset: defTiming.offset
      });
    }

    // Append drops
    const dropsToKeep = existingDrops.length > 0 ? existingDrops : generateDefaultStops(0, dropsCount, origin, destination);
    dropsToKeep.forEach((d, idx) => {
      newStops.push({
        ...d,
        stop_number: num + idx + 1
      });
    });

    onChange?.(newStops);
  };

  // Handle Drops count change
  const handleDropsCountChange = (count) => {
    const num = Number(count);
    setDropsCount(num);
    const existingDocks = stops.filter(s => s.type === 'dock');
    const docksToKeep = existingDocks.length > 0 ? existingDocks : generateDefaultStops(docksCount, 0, origin, destination);
    const newStops = [...docksToKeep];

    for (let j = 0; j < num; j++) {
      const existing = stops.find(s => s.id === `drop_${j + 1}`);
      const defTiming = PREDEFINED_TIMINGS.drop[j] || { arrival: '16:00', dispatch: '17:30', offset: 0 };
      newStops.push(existing || {
        id: `drop_${j + 1}`,
        stop_number: docksToKeep.length + j + 1,
        type: 'drop',
        label: `Drop ${j + 1} (Delivery)`,
        name: j === num - 1 && destination ? destination : `Delivery Drop ${j + 1}`,
        sched_arrival_time: defTiming.arrival,
        sched_dispatch_time: defTiming.dispatch,
        day_offset: defTiming.offset
      });
    }

    onChange?.(newStops);
  };

  // Add one extra drop
  const handleAddExtraDrop = () => {
    const nextDropCount = dropsCount + 1;
    handleDropsCountChange(nextDropCount);
  };

  // Remove specific drop
  const handleRemoveDrop = (dropId) => {
    if (dropsCount <= 1) {
      return;
    }
    const filtered = stops.filter(s => s.id !== dropId);
    // Renumber stops
    const renumbered = filtered.map((s, idx) => ({ ...s, stop_number: idx + 1 }));
    setDropsCount(prev => Math.max(1, prev - 1));
    onChange?.(renumbered);
  };

  // Update specific stop field
  const handleUpdateStopField = (stopId, field, value) => {
    const updated = stops.map(s => {
      if (s.id === stopId) {
        return { ...s, [field]: value };
      }
      return s;
    });
    onChange?.(updated);
  };

  // Apply Quick Preset
  const handleApplyPreset = (docks, drops) => {
    setDocksCount(docks);
    setDropsCount(drops);
    const generated = generateDefaultStops(docks, drops, origin, destination);
    onChange?.(generated);
  };

  return (
    <div className={cn("space-y-4 p-4 rounded-2xl bg-muted/30 border border-border", className)}>
      {/* Header & Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-extrabold">
              {legLabel}
            </Badge>
            <h4 className="text-sm font-extrabold text-foreground">
              Dynamic Stop & Schedule Timing Configurator
            </h4>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Configure scheduled target times for each dock and drop to track SLA delays accurately
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Presets:</span>
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            className="h-7 text-[11px] px-2 rounded-lg font-bold"
            onClick={() => handleApplyPreset(1, 1)}
          >
            1 Dock + 1 Drop
          </Button>
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            className="h-7 text-[11px] px-2 rounded-lg font-bold text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
            onClick={() => handleApplyPreset(1, 2)}
          >
            1 Dock + 2 Drops
          </Button>
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            className="h-7 text-[11px] px-2 rounded-lg font-bold text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
            onClick={() => handleApplyPreset(2, 1)}
          >
            2 Docks + 1 Drop
          </Button>
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            className="h-7 text-[11px] px-2 rounded-lg font-bold text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
            onClick={() => handleApplyPreset(1, 3)}
          >
            1 Dock + 3 Drops
          </Button>
        </div>
      </div>

      {/* Selectors Bar: Docks Count & Drops Count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-card border border-border">
        <div className="space-y-1">
          <Label className="text-xs font-bold flex items-center gap-1.5 text-blue-400">
            <Building2 className="w-3.5 h-3.5" /> Number of Pickup Docks (1–5)
          </Label>
          <Select value={String(docksCount)} onValueChange={handleDocksCountChange}>
            <SelectTrigger className="rounded-xl h-9 text-xs font-bold">
              <SelectValue placeholder="Select Docks Count" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map(n => (
                <SelectItem key={n} value={String(n)}>
                  {n} Pickup Dock{n > 1 ? 's' : ''} {n === 1 ? '(Standard)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-bold flex items-center gap-1.5 text-emerald-400">
            <MapPin className="w-3.5 h-3.5" /> Number of Delivery Drops (1–10+)
          </Label>
          <Select value={String(dropsCount)} onValueChange={handleDropsCountChange}>
            <SelectTrigger className="rounded-xl h-9 text-xs font-bold">
              <SelectValue placeholder="Select Drops Count" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <SelectItem key={n} value={String(n)}>
                  {n} Delivery Drop{n > 1 ? 's' : ''} {n === 1 ? '(Single Drop)' : n === 2 ? '(2-Drop Route)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Render Dynamic Stop Cards */}
      <div className="space-y-2.5">
        {stops.map((stop, index) => {
          const isDock = stop.type === 'dock';
          const badgeColor = isDock ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
          
          return (
            <div 
              key={stop.id || index}
              className={cn(
                "p-3 rounded-xl border transition-all space-y-2.5 bg-card/60 hover:bg-card/90",
                isDock ? "border-blue-500/20" : "border-emerald-500/20"
              )}
            >
              {/* Card Top Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider flex items-center gap-1", badgeColor)}>
                    {isDock ? <Building2 className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                    Stop #{stop.stop_number}: {stop.label || (isDock ? 'Dock' : 'Drop')}
                  </span>

                  <span className="text-[11px] font-bold text-muted-foreground">
                    {isDock ? 'Loading Point' : 'Unloading Destination'}
                  </span>
                </div>

                {!isDock && dropsCount > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-[11px] text-destructive hover:bg-destructive/10 px-2"
                    onClick={() => handleRemoveDrop(stop.id)}
                    title="Remove this drop"
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                  </Button>
                )}
              </div>

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                {/* Stop Location Name */}
                <div className="sm:col-span-4 space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                    {isDock ? 'Dock / Warehouse Name' : 'Drop Location / Hub Name'}
                  </Label>
                  <Input 
                    className="h-8 text-xs rounded-lg"
                    placeholder={isDock ? "e.g. Bhiwandi Central Dock" : "e.g. Pune Chakan Hub"}
                    value={stop.name || ''}
                    onChange={e => handleUpdateStopField(stop.id, 'name', e.target.value)}
                  />
                </div>

                {/* Day Offset */}
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" /> Day Offset
                  </Label>
                  <Select 
                    value={String(stop.day_offset ?? 0)} 
                    onValueChange={v => handleUpdateStopField(stop.id, 'day_offset', Number(v))}
                  >
                    <SelectTrigger className="h-8 text-xs rounded-lg font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Day 0 (Same Day)</SelectItem>
                      <SelectItem value="1">Day +1 (Next Day)</SelectItem>
                      <SelectItem value="2">Day +2 (2nd Day)</SelectItem>
                      <SelectItem value="3">Day +3 (3rd Day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Scheduled Arrival Time */}
                <div className="sm:col-span-3 space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-amber-400" /> Sched. Arrival (SLA)
                  </Label>
                  <Input 
                    type="time"
                    className="h-8 text-xs rounded-lg font-mono font-bold"
                    value={stop.sched_arrival_time || '08:00'}
                    onChange={e => handleUpdateStopField(stop.id, 'sched_arrival_time', e.target.value)}
                  />
                </div>

                {/* Scheduled Dispatch Time */}
                <div className="sm:col-span-3 space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-emerald-400" /> Sched. Dispatch / Dep.
                  </Label>
                  <Input 
                    type="time"
                    className="h-8 text-xs rounded-lg font-mono font-bold"
                    value={stop.sched_dispatch_time || '10:00'}
                    onChange={e => handleUpdateStopField(stop.id, 'sched_dispatch_time', e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action: + Add Drop Location */}
      <div className="flex items-center justify-between pt-1">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="h-8 text-xs rounded-xl font-bold border-dashed border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
          onClick={handleAddExtraDrop}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> + Add Another Drop Location (Drop {dropsCount + 1})
        </Button>

        <span className="text-[11px] text-muted-foreground font-semibold">
          Total Stops: <strong className="text-foreground">{docksCount + dropsCount}</strong> ({docksCount} Dock{docksCount > 1 ? 's' : ''}, {dropsCount} Drop{dropsCount > 1 ? 's' : ''})
        </span>
      </div>
    </div>
  );
}
