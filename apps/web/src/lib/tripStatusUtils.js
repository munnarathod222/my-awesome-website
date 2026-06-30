export const TRIP_STATUS_OPTIONS = [
  'Upcoming',
  'Dispatched',
  'In Transit',
  'Delivered'
];

export const getEffectiveStatus = (status) => {
  const normStatus = (status || '').trim().toUpperCase();
  if (normStatus === 'IN PROGRESS' || normStatus === 'IN-TRANSIT' || normStatus === 'IN TRANSIT') {
    return 'IN TRANSIT';
  }
  if (normStatus === 'COMPLETED' || normStatus === 'DELIVERED') {
    return 'DELIVERED';
  }
  if (normStatus === 'PENDING' || normStatus === 'UPCOMING') {
    return 'UPCOMING';
  }
  return normStatus || 'UPCOMING';
};

export const getTripStatusLabel = (status) => {
  const effective = getEffectiveStatus(status);
  switch (effective) {
    case 'UPCOMING':
      return 'UPCOMING';
    case 'DISPATCHED':
      return 'DISPATCHED';
    case 'IN TRANSIT':
      return 'IN TRANSIT';
    case 'DELIVERED':
      return 'DELIVERED';
    default:
      return effective;
  }
};

export const getTripStatusColor = (status) => {
  const effective = getEffectiveStatus(status);
  switch (effective) {
    case 'DISPATCHED':
      return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30';
    case 'IN TRANSIT':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
    case 'DELIVERED':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
    case 'UPCOMING':
    default:
      return 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30';
  }
};