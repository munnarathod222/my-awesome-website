import { format, addDays, parseISO, differenceInMinutes } from 'date-fns';

/**
 * Combine a date string (YYYY-MM-DD) and a time string (HH:mm) with day offset into an ISO Date String.
 */
export function combineDateTimeISO(baseDateStr, timeStr = '00:00', dayOffset = 0) {
  if (!baseDateStr) return null;
  try {
    const d = new Date(baseDateStr);
    if (isNaN(d.getTime())) return null;

    if (dayOffset > 0) {
      d.setDate(d.getDate() + dayOffset);
    }

    const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
    d.setHours(hours || 0, minutes || 0, 0, 0);
    return d.toISOString();
  } catch (e) {
    console.error('Failed to combine date time:', e);
    return null;
  }
}

/**
 * Instantiate full schedule timestamps for a specific trip date from dynamic stop templates.
 */
export function instantiateTripMilestones(tripDateStr, stopsTemplate = []) {
  if (!tripDateStr || !Array.isArray(stopsTemplate) || stopsTemplate.length === 0) {
    return {
      milestones_schedule: [],
      total_docks_count: 1,
      total_drops_count: 1
    };
  }

  const docks = stopsTemplate.filter(s => s.type === 'dock');
  const drops = stopsTemplate.filter(s => s.type === 'drop');

  const instantiatedStops = stopsTemplate.map((s, idx) => {
    const arrivalISO = combineDateTimeISO(tripDateStr, s.sched_arrival_time, s.day_offset || 0);
    const dispatchISO = combineDateTimeISO(tripDateStr, s.sched_dispatch_time, s.day_offset || 0);

    return {
      ...s,
      stop_number: idx + 1,
      sched_arrival_iso: arrivalISO,
      sched_dispatch_iso: dispatchISO,
      actual_arrival_iso: null,
      actual_dispatch_iso: null,
      arrival_delay_mins: 0,
      dispatch_delay_mins: 0,
      status: 'Scheduled'
    };
  });

  // Extract common top-level fields for fast DB queries
  const dock1 = docks[0];
  const dock2 = docks[1];
  const drop1 = drops[0];
  const drop2 = drops[1];

  const firstDockArrivalISO = dock1 ? combineDateTimeISO(tripDateStr, dock1.sched_arrival_time, dock1.day_offset || 0) : null;
  const firstDockDispatchISO = dock1 ? combineDateTimeISO(tripDateStr, dock1.sched_dispatch_time, dock1.day_offset || 0) : null;
  
  const lastDrop = drops[drops.length - 1] || drop1;
  const finalDeliveryETA = lastDrop ? combineDateTimeISO(tripDateStr, lastDrop.sched_arrival_time, lastDrop.day_offset || 0) : null;

  return {
    milestones_schedule: instantiatedStops,
    total_docks_count: docks.length || 1,
    total_drops_count: drops.length || 1,
    
    // Top-level mapped fields for trip_logs
    dock_sched_arrival_time: firstDockArrivalISO,
    dock_sched_dispatch_time: firstDockDispatchISO,
    dock2_sched_arrival_time: dock2 ? combineDateTimeISO(tripDateStr, dock2.sched_arrival_time, dock2.day_offset || 0) : null,
    dock2_sched_dispatch_time: dock2 ? combineDateTimeISO(tripDateStr, dock2.sched_dispatch_time, dock2.day_offset || 0) : null,
    
    drop1_sched_arrival_time: drop1 ? combineDateTimeISO(tripDateStr, drop1.sched_arrival_time, drop1.day_offset || 0) : null,
    drop1_sched_dispatch_time: drop1 ? combineDateTimeISO(tripDateStr, drop1.sched_dispatch_time, drop1.day_offset || 0) : null,
    
    drop2_sched_arrival_time: drop2 ? combineDateTimeISO(tripDateStr, drop2.sched_arrival_time, drop2.day_offset || 0) : null,
    drop2_sched_dispatch_time: drop2 ? combineDateTimeISO(tripDateStr, drop2.sched_dispatch_time, drop2.day_offset || 0) : null,
    
    pickup_time: firstDockDispatchISO,
    delivery_eta: finalDeliveryETA
  };
}

/**
 * Calculate delay across all stops given actual logged timestamps
 */
export function calculateTripMilestoneDelays(milestonesSchedule = [], tripLog = {}) {
  if (!Array.isArray(milestonesSchedule) || milestonesSchedule.length === 0) {
    return {
      overall_delay_minutes: 0,
      is_late: false,
      evaluated_milestones: []
    };
  }

  let maxDelayMins = 0;
  let isLate = false;

  const evaluated = milestonesSchedule.map(stop => {
    let actualArrival = stop.actual_arrival_iso;
    let actualDispatch = stop.actual_dispatch_iso;

    // Fallback checks from tripLog root fields if not nested
    if (!actualArrival && stop.id === 'dock_1') actualArrival = tripLog.loading_dock_arrival_time;
    if (!actualDispatch && stop.id === 'dock_1') actualDispatch = tripLog.dispatched_time;
    if (!actualArrival && stop.id === 'drop_1') actualArrival = tripLog.drop1_actual_arrival_time || tripLog.delivered_time;
    if (!actualDispatch && stop.id === 'drop_1') actualDispatch = tripLog.drop1_actual_dispatch_time;

    let arrivalDelay = 0;
    let dispatchDelay = 0;

    if (actualArrival && stop.sched_arrival_iso) {
      const actualD = new Date(actualArrival);
      const schedD = new Date(stop.sched_arrival_iso);
      if (!isNaN(actualD.getTime()) && !isNaN(schedD.getTime())) {
        arrivalDelay = differenceInMinutes(actualD, schedD);
        if (arrivalDelay > 15) isLate = true;
        if (arrivalDelay > maxDelayMins) maxDelayMins = arrivalDelay;
      }
    }

    if (actualDispatch && stop.sched_dispatch_iso) {
      const actualD = new Date(actualDispatch);
      const schedD = new Date(stop.sched_dispatch_iso);
      if (!isNaN(actualD.getTime()) && !isNaN(schedD.getTime())) {
        dispatchDelay = differenceInMinutes(actualD, schedD);
        if (dispatchDelay > 15) isLate = true;
        if (dispatchDelay > maxDelayMins) maxDelayMins = dispatchDelay;
      }
    }

    return {
      ...stop,
      actual_arrival_iso: actualArrival,
      actual_dispatch_iso: actualDispatch,
      arrival_delay_mins: arrivalDelay,
      dispatch_delay_mins: dispatchDelay
    };
  });

  return {
    overall_delay_minutes: Math.max(0, maxDelayMins),
    is_late: isLate,
    evaluated_milestones: evaluated
  };
}

/**
 * Human-readable delay formatting badge
 */
export function formatDelayText(delayMins = 0) {
  if (delayMins <= 0) {
    return { text: 'On-Time', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  }
  if (delayMins < 15) {
    return { text: `+${delayMins}m (Minor)`, badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
  }

  const hrs = Math.floor(delayMins / 60);
  const mins = delayMins % 60;
  const timeStr = hrs > 0 ? `${hrs}h ${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;

  return { 
    text: `Late by ${timeStr}`, 
    badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-bold' 
  };
}
