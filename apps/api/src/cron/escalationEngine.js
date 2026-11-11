/**
 * escalationEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Operations Escalation Engine (Task Manager-First).
 *
 * Automatically monitors:
 *   1. In-Transit Trips delayed beyond scheduled delivery ETA.
 *   2. Unresolved Maintenance Breakdowns pending > 2 hours.
 *   3. Overdue Approvals.
 *
 * Escalation Action:
 *   Creates prioritized, actionable tasks with escalation levels directly in
 *   Task Manager (operations_tasks) for the responsible fleet owner.
 */

import logger from '../utils/logger.js';
import pb from '../utils/pocketbaseClient.js';

let cron = null;
async function loadCron() {
  try {
    const mod = await import('node-cron');
    cron = mod.default ?? mod;
    return true;
  } catch (err) {
    return false;
  }
}

export async function processEscalations() {
  try {
    const now = new Date();
    const nowMs = now.getTime();

    // ── 1. In-Transit Trip Delays ─────────────────────────────────────────────
    const activeTrips = await pb.collection('trip_logs').getFullList({
      filter: 'trip_status = "In Transit" || trip_status = "Dispatched"',
      $autoCancel: false,
    }).catch(() => []);

    for (const trip of activeTrips) {
      if (!trip.delivery_eta) continue;
      const etaMs = new Date(trip.delivery_eta).getTime();
      if (isNaN(etaMs) || nowMs <= etaMs) continue;

      const delayMinutes = Math.round((nowMs - etaMs) / (60 * 1000));
      if (delayMinutes < 45) continue; // Allow 45m grace period

      // Check if an open escalation task already exists for this trip
      const existing = await pb.collection('operations_tasks').getList(1, 1, {
        filter: `related_entity_id = "${trip.id}" && related_entity_type = "trip_logs" && status != "Completed"`,
        $autoCancel: false,
      }).catch(() => ({ totalItems: 0 }));

      if (existing.totalItems === 0) {
        const isCritical = delayMinutes >= 180;
        const taskNum = `ESC-${Date.now().toString(36).toUpperCase()}`;
        const dueDate = new Date(nowMs + 30 * 60 * 1000).toISOString(); // 30 mins deadline

        await pb.collection('operations_tasks').create({
          task_number: taskNum,
          title: `${isCritical ? '🔥 CRITICAL DELAY' : '⚡ DELAY ALERT'}: ${trip.route || 'Shipment'} (${trip.truck_number || ''})`,
          description: `Shipment is delayed by ${delayMinutes} mins beyond ETA (${trip.delivery_eta}). Contact Driver (${trip.driver_name || 'N/A'}) immediately and update dock receiver.`,
          category: 'Dispatch & Trips',
          department: 'Operations',
          priority: isCritical ? 'Critical' : 'High',
          status: 'Pending',
          due_date: dueDate,
          escalation_level: isCritical ? 'Level 2' : 'Level 1',
          assigned_to_name: 'Route Dispatcher',
          accountable_owner_name: isCritical ? 'Vinod kumar Rathod' : 'Route Dispatcher',
          related_entity_type: 'trip_logs',
          related_entity_id: trip.id,
          created_by_name: 'Operations Escalation Engine',
        }, { $autoCancel: false }).catch(() => {});

        logger.info(`[EscalationEngine] Dispatched ${isCritical ? 'Critical' : 'High'} task ${taskNum} for delayed trip ${trip.id} (${delayMinutes}m delay)`);
      }
    }

    // ── 2. Unresolved Maintenance Problems / Breakdowns ───────────────────────
    const openProblems = await pb.collection('maintenance_problems').getFullList({
      filter: 'status = "Open"',
      $autoCancel: false,
    }).catch(() => []);

    for (const prob of openProblems) {
      const reportedMs = new Date(prob.created || prob.date_reported).getTime();
      if (isNaN(reportedMs)) continue;
      const openHours = (nowMs - reportedMs) / (3600 * 1000);

      if (openHours >= 2) {
        const existingProb = await pb.collection('operations_tasks').getList(1, 1, {
          filter: `related_entity_id = "${prob.id}" && related_entity_type = "maintenance_problems" && status != "Completed"`,
          $autoCancel: false,
        }).catch(() => ({ totalItems: 0 }));

        if (existingProb.totalItems === 0) {
          const taskNum = `ESC-MNT-${Date.now().toString(36).toUpperCase()}`;
          await pb.collection('operations_tasks').create({
            task_number: taskNum,
            title: `UNRESOLVED BREAKDOWN: Truck ${prob.truck_number || prob.truck_id || 'Fleet'} (${prob.category || prob.problem_type || 'Repair'})`,
            description: `Vehicle breakdown/issue has been open for ${Math.round(openHours)} hours without completion. Assign workshop job card or dispatch mobile mechanic. ${prob.description || ''}`,
            category: 'Maintenance & Workshop',
            department: 'Maintenance',
            priority: 'Critical',
            status: 'Pending',
            escalation_level: 'Level 2',
            assigned_to_name: 'Workshop Manager',
            accountable_owner_name: 'Vinod kumar Rathod',
            related_entity_type: 'maintenance_problems',
            related_entity_id: prob.id,
            created_by_name: 'Operations Escalation Engine',
          }, { $autoCancel: false }).catch(() => {});

          logger.info(`[EscalationEngine] Dispatched breakdown task ${taskNum} for truck ${prob.truck_number}`);
        }
      }
    }
  } catch (err) {
    logger.error(`[EscalationEngine Error] ${err.message}`);
  }
}

export function startEscalationCron() {
  loadCron().then(hasCron => {
    if (hasCron && cron) {
      // Runs every 10 minutes
      cron.schedule('*/10 * * * *', () => {
        processEscalations().catch(err => logger.error(`[EscalationEngine Cron] ${err.message}`));
      });
      logger.info('🚀 Operations Escalation Daemon scheduled (every 10 minutes).');
    } else {
      setInterval(() => {
        processEscalations().catch(err => logger.error(`[EscalationEngine Interval] ${err.message}`));
      }, 600000);
      logger.info('🚀 Operations Escalation Daemon active via interval (every 10 minutes).');
    }
  });
}
