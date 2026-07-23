import pb from './pocketbaseClient.js';
import { format, addDays, differenceInDays, parseISO, isAfter } from 'date-fns';

const PERIODIC_LOGS_STORAGE_KEY = 'jbc_periodic_maintenance_logs';

/**
 * Gets all periodic maintenance logs (Greasing & Air Filter Cleanings)
 */
export function getPeriodicLogs() {
  try {
    const raw = localStorage.getItem(PERIODIC_LOGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse periodic logs', e);
    return [];
  }
}

/**
 * Calculates current periodic maintenance compliance status for a truck
 */
export function getTruckPeriodicStatus(truck, logs = []) {
  const truckId = truck.id;
  const truckNumber = truck.truck_number;

  const truckLogs = logs.filter(l => l.truck_id === truckId || l.truck_number === truckNumber);
  
  // 1. Greasing (Monthly - 30 days)
  const greasingLogs = truckLogs.filter(l => l.task_type === 'greasing').sort((a,b) => new Date(b.date) - new Date(a.date));
  const lastGreasing = greasingLogs[0] || null;
  
  let nextGreasingDue = lastGreasing ? addDays(parseISO(lastGreasing.date), 30) : new Date();
  let daysUntilGreasing = differenceInDays(nextGreasingDue, new Date());
  
  let greasingStatus = 'UP_TO_DATE';
  let greasingBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let greasingText = `Due in ${daysUntilGreasing} days`;

  if (!lastGreasing || daysUntilGreasing < 0) {
    greasingStatus = 'OVERDUE';
    greasingBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    greasingText = lastGreasing ? `Overdue by ${Math.abs(daysUntilGreasing)} days` : 'Greasing Required Immediately';
  } else if (daysUntilGreasing <= 7) {
    greasingStatus = 'DUE_SOON';
    greasingBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    greasingText = `Due in ${daysUntilGreasing} days`;
  }

  // 2. Air Filter Clean (Bi-weekly / Monthly Twice - 15 days)
  const airFilterLogs = truckLogs.filter(l => l.task_type === 'air_filter_clean').sort((a,b) => new Date(b.date) - new Date(a.date));
  const lastAirFilterClean = airFilterLogs[0] || null;

  let nextAirFilterDue = lastAirFilterClean ? addDays(parseISO(lastAirFilterClean.date), 15) : new Date();
  let daysUntilAirFilter = differenceInDays(nextAirFilterDue, new Date());

  let airFilterStatus = 'UP_TO_DATE';
  let airFilterBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let airFilterText = `Due in ${daysUntilAirFilter} days`;

  if (!lastAirFilterClean || daysUntilAirFilter < 0) {
    airFilterStatus = 'OVERDUE';
    airFilterBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    airFilterText = lastAirFilterClean ? `Overdue by ${Math.abs(daysUntilAirFilter)} days` : 'Air Filter Cleaning Overdue';
  } else if (daysUntilAirFilter <= 3) {
    airFilterStatus = 'DUE_SOON';
    airFilterBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    airFilterText = `Due in ${daysUntilAirFilter} days`;
  }

  return {
    truckId,
    truckNumber,
    truckName: truck.truck_name || truckNumber,
    
    // Greasing Metrics
    lastGreasingDate: lastGreasing ? lastGreasing.date : null,
    nextGreasingDue: format(nextGreasingDue, 'yyyy-MM-dd'),
    daysUntilGreasing,
    greasingStatus,
    greasingBadgeClass,
    greasingText,
    
    // Air Filter Metrics
    lastAirFilterDate: lastAirFilterClean ? lastAirFilterClean.date : null,
    nextAirFilterDue: format(nextAirFilterDue, 'yyyy-MM-dd'),
    daysUntilAirFilter,
    airFilterCycle: (lastAirFilterClean && new Date(lastAirFilterClean.date).getDate() <= 15) ? 'Cycle 1 (1st-15th)' : 'Cycle 2 (16th-30th)',
    airFilterStatus,
    airFilterBadgeClass,
    airFilterText
  };
}

/**
 * Records a completed Greasing or Air Filter Clean event
 */
export async function logCompletedPeriodicTask({ truckId, truckNumber, taskType, technicianName, cost = 0, notes = '' }) {
  const nowStr = format(new Date(), 'yyyy-MM-dd');

  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    truck_id: truckId,
    truck_number: truckNumber,
    task_type: taskType, // 'greasing' | 'air_filter_clean'
    task_name: taskType === 'greasing' ? 'Monthly Chassis & Hub Greasing' : 'Bi-Weekly Air Filter Cleaning & Blow-out',
    date: nowStr,
    technician_name: technicianName || 'Fleet Operator',
    cost: Number(cost) || 0,
    notes: notes || (taskType === 'greasing' ? 'Chassis nipples & hub greased thoroughly' : 'Air filter blown out with compressed air'),
    created_at: new Date().toISOString()
  };

  // 1. Save to localStorage
  try {
    const existing = getPeriodicLogs();
    existing.unshift(newLog);
    localStorage.setItem(PERIODIC_LOGS_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }

  // 2. Log into PocketBase maintenance_logs if available
  try {
    await pb.collection('maintenance_logs').create({
      truck_id: truckId,
      truck_number: truckNumber,
      maintenance_date: nowStr,
      service_type: taskType === 'greasing' ? 'Greasing' : 'Air Filter Cleaning',
      work_description_text: `${newLog.task_name} completed by ${newLog.technician_name}. ${notes}`,
      cost_amount: Number(cost) || 0,
      $autoCancel: false
    });
  } catch (err) {
    console.log('[logCompletedPeriodicTask] PocketBase create log fallback:', err?.message);
  }

  return newLog;
}
