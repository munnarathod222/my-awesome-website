export const TRIP_STATUS_OPTIONS = [
  'Upcoming',
  'Vehicle Assigned',
  'Arrived at Dock',
  'Loading in Progress',
  'Dispatched',
  'In Transit',
  'Reached Delivery Docket',
  'Unloading in Progress',
  'Delivered',
  'Completed',
  'Delayed / Breakdown',
  'Cancelled'
];

export const getEffectiveStatus = (status) => {
  const normStatus = (status || '').trim().toUpperCase();
  if (normStatus === 'REACHED DELIVERY DOCKET' || normStatus === 'AT DELIVERY DOCKET' || normStatus === 'DELIVERY DOCK' || normStatus === 'AT DESTINATION DOCK' || normStatus === 'REACHED DOCKET') {
    return 'REACHED DELIVERY DOCKET';
  }
  if (normStatus === 'UNLOADING' || normStatus === 'UNLOADING IN PROGRESS') {
    return 'UNLOADING IN PROGRESS';
  }
  if (normStatus === 'VEHICLE ASSIGNED' || normStatus === 'TRUCK ASSIGNED') {
    return 'VEHICLE ASSIGNED';
  }
  if (normStatus === 'LOADING' || normStatus === 'LOADING IN PROGRESS') {
    return 'LOADING IN PROGRESS';
  }
  if (normStatus === 'DELAYED' || normStatus === 'BREAKDOWN' || normStatus === 'DELAYED / BREAKDOWN') {
    return 'DELAYED / BREAKDOWN';
  }
  if (normStatus === 'CANCELLED' || normStatus === 'CANCELED') {
    return 'CANCELLED';
  }
  if (normStatus === 'ARRIVED AT DOCK' || normStatus === 'ARRIVED_AT_DOCK' || normStatus === 'LOADING DOCK' || normStatus === 'LOADING_DOCK') {
    return 'ARRIVED AT DOCK';
  }
  if (normStatus === 'IN PROGRESS' || normStatus === 'IN-TRANSIT' || normStatus === 'IN TRANSIT') {
    return 'IN TRANSIT';
  }
  if (normStatus === 'COMPLETED') {
    return 'COMPLETED';
  }
  if (normStatus === 'DELIVERED') {
    return 'DELIVERED';
  }
  if (normStatus === 'PENDING' || normStatus === 'UPCOMING' || normStatus === 'SCHEDULED' || normStatus === 'TRIP SCHEDULED') {
    return 'UPCOMING';
  }
  return normStatus || 'UPCOMING';
};

export const getTripStatusLabel = (status) => {
  const effective = getEffectiveStatus(status);
  switch (effective) {
    case 'UPCOMING':
      return 'UPCOMING';
    case 'VEHICLE ASSIGNED':
      return 'VEHICLE ASSIGNED';
    case 'ARRIVED AT DOCK':
      return 'ARRIVED AT DOCK';
    case 'LOADING IN PROGRESS':
      return 'LOADING';
    case 'DISPATCHED':
      return 'DISPATCHED';
    case 'IN TRANSIT':
      return 'IN TRANSIT';
    case 'REACHED DELIVERY DOCKET':
      return 'AT DELIVERY DOCKET';
    case 'UNLOADING IN PROGRESS':
      return 'UNLOADING';
    case 'DELIVERED':
      return 'DELIVERED';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'DELAYED / BREAKDOWN':
      return 'DELAYED / HOLD';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return effective;
  }
};

export const getTripStatusColor = (status) => {
  const effective = getEffectiveStatus(status);
  switch (effective) {
    case 'VEHICLE ASSIGNED':
      return 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30';
    case 'ARRIVED AT DOCK':
      return 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30';
    case 'LOADING IN PROGRESS':
      return 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30';
    case 'DISPATCHED':
      return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30';
    case 'IN TRANSIT':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
    case 'REACHED DELIVERY DOCKET':
      return 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 font-bold animate-pulse';
    case 'UNLOADING IN PROGRESS':
      return 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-500/30 font-bold';
    case 'DELIVERED':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold';
    case 'COMPLETED':
      return 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30 font-bold';
    case 'DELAYED / BREAKDOWN':
      return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold';
    case 'CANCELLED':
      return 'bg-destructive/15 text-destructive border-destructive/30 line-through';
    case 'UPCOMING':
    default:
      return 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30';
  }
};

export const isAtDeliveryDock = (status) => {
  const eff = getEffectiveStatus(status);
  return eff === 'REACHED DELIVERY DOCKET' || eff === 'UNLOADING IN PROGRESS';
};

export const calculateTripDetention = (trip) => {
  if (!trip) return null;
  const arrivalStr = trip.delivery_dock_arrival_time;
  if (!arrivalStr) return null;

  const arrival = new Date(arrivalStr).getTime();
  if (isNaN(arrival) || arrival <= 0) return null;

  const effStatus = getEffectiveStatus(trip.trip_status || trip.status);
  const isDelivered = Boolean(trip.delivered_time || effStatus === 'DELIVERED' || effStatus === 'COMPLETED');
  const endTime = isDelivered && trip.delivered_time ? new Date(trip.delivered_time).getTime() : Date.now();
  const totalMs = Math.max(0, endTime - arrival);
  const totalHours = totalMs / (1000 * 60 * 60);

  const freeHours = Number(trip.free_detention_hours !== undefined && trip.free_detention_hours !== '' ? trip.free_detention_hours : 4);
  const hourlyRate = Number(trip.detention_rate_per_hour !== undefined && trip.detention_rate_per_hour !== '' ? trip.detention_rate_per_hour : 500);

  const isOverdue = totalHours > freeHours;
  const billableHours = isOverdue ? Number((totalHours - freeHours).toFixed(1)) : 0;
  const billableAmount = Math.round(billableHours * hourlyRate);

  const formatHours = (h) => {
    const totalMinutes = Math.round(h * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs > 0) return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
    return `${mins}m`;
  };

  return {
    arrivalDate: new Date(arrival),
    isFrozen: isDelivered,
    totalHours: Number(totalHours.toFixed(1)),
    totalDurationFormatted: formatHours(totalHours),
    freeHours,
    isOverdue,
    remainingGraceFormatted: isOverdue ? 'Expired' : formatHours(Math.max(0, freeHours - totalHours)),
    billableHours,
    hourlyRate,
    billableAmount
  };
};
