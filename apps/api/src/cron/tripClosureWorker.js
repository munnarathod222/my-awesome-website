/**
 * tripClosureWorker.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Trip Closure Automation Worker with 10-Minute Verification Buffer.
 *
 * Rules:
 *   - Only trips whose client requires POD have a blocker.
 *   - For those trips, the ONLY blocker is whether POD is uploaded: "Pending POD Upload".
 *   - Once POD is uploaded (pod_file or pod_link present, or pod_status is uploaded/verified),
 *     there are ZERO blockers.
 *   - For clients who do not require POD, there are ZERO blockers.
 *   - Once all blockers are cleared:
 *       1. Sets closure_verified_at = now().
 *       2. After 10-minute buffer, automatically completes the trip (trip_status = "Completed",
 *          auto_closed_at = now()).
 */

import logger from '../utils/logger.js';
import pb from '../utils/pocketbaseClient.js';
import * as auditService from '../services/auditService.js';

let cron = null;
async function loadCron() {
  try {
    const mod = await import('node-cron');
    cron = mod.default ?? mod;
    return true;
  } catch (err) {
    logger.warn('[TripClosure Cron] node-cron not available; will use setInterval fallback.');
    return false;
  }
}

export async function processTripClosures() {
  try {
    // 1. Fetch delivered trips
    const trips = await pb.collection('trip_logs').getFullList({
      filter: 'trip_status = "Delivered"',
      sort: '-date',
      $autoCancel: false,
    }).catch(() => []);

    if (trips.length === 0) return;

    // 2. Fetch clients to identify who requires POD
    const clients = await pb.collection('clients').getFullList({
      $autoCancel: false,
    }).catch(() => []);

    const podRequiredClientIds = new Set();
    const podRequiredClientNames = new Set();
    for (const c of clients) {
      if (c.requires_pod === true || c.requires_pod === 'true' || c.requires_pod === 1) {
        if (c.id) podRequiredClientIds.add(c.id);
        const name = (c.company_name || c.name || '').trim().toLowerCase();
        if (name) podRequiredClientNames.add(name);
      }
    }

    const nowMs = Date.now();
    const TEN_MINUTES_MS = 10 * 60 * 1000;

    for (const trip of trips) {
      const blockers = [];

      // Check if this trip's client requires POD
      const tripClientId = trip.client_id || '';
      const tripClientName = (trip.client_name || '').trim().toLowerCase();
      const clientRequiresPod = podRequiredClientIds.has(tripClientId) || podRequiredClientNames.has(tripClientName);

      if (clientRequiresPod) {
        // Just POD upload is enough: check for file, link, or status
        const hasPodFile = (trip.pod_file && String(trip.pod_file).trim().length > 2) || 
                           (trip.pod_link && String(trip.pod_link).trim().length > 2);
        const hasPodStatus = ['uploaded', 'verified', 'received', 'approved'].includes(String(trip.pod_status || '').toLowerCase());
        
        if (!hasPodFile && !hasPodStatus) {
          blockers.push('Pending POD Upload');
        }
      }

      // No other blockers exist (LR, driver advance, and subcontractor checks removed per requirements)

      // Evaluation
      if (blockers.length === 0) {
        // Zero blockers!
        if (!trip.closure_verified_at) {
          // Initiate the 10-minute buffer
          const verifiedAt = new Date().toISOString();
          await pb.collection('trip_logs').update(trip.id, {
            closure_verified_at: verifiedAt,
            closure_blockers: '[]',
          }, { $autoCancel: false }).catch(() => {});
          logger.info(`[TripClosure] Trip ${trip.trip_id || trip.id} passed POD gate. 10-min closure buffer started at ${verifiedAt}.`);
        } else {
          // Check if 10-minute buffer has elapsed
          const verifiedMs = new Date(trip.closure_verified_at).getTime();
          if (!isNaN(verifiedMs) && (nowMs - verifiedMs >= TEN_MINUTES_MS)) {
            // Buffer elapsed -> Automatically close trip!
            const closedAt = new Date().toISOString();
            await pb.collection('trip_logs').update(trip.id, {
              trip_status: 'Completed',
              auto_closed_at: closedAt,
              closure_blockers: '[]',
              subcontractor_settlement_status: trip.ownership_type === 'Attached' ? 'Settled' : (trip.subcontractor_settlement_status || 'Settled')
            }, { $autoCancel: false });

            logger.info(`[TripClosure] 🎉 Auto-closed trip ${trip.trip_id || trip.id} after 10-minute buffer.`);

            // Create completion record in operations_tasks
            try {
              const taskNumber = `CLS-${Date.now().toString(36).toUpperCase()}`;
              await pb.collection('operations_tasks').create({
                task_number: taskNumber,
                title: `Trip Auto-Closed: ${trip.route || 'Shipment'} (${trip.truck_number || ''})`,
                description: `Trip automatically closed after 10-minute buffer with verified POD status.`,
                category: 'Dispatch & Trips',
                department: 'Operations',
                priority: 'Low',
                status: 'Completed',
                completion_date: closedAt,
                related_entity_type: 'trip_logs',
                related_entity_id: trip.id,
                created_by_name: 'Trip Closure Automation Engine',
                assigned_to_name: trip.driver_name || 'Fleet Dispatcher',
              }, { $autoCancel: false });
            } catch (taskErr) {
              logger.warn(`[TripClosure] Notice creating task record: ${taskErr.message}`);
            }
          }
        }
      } else {
        // Blocker exists (Pending POD Upload): store blocker and reset verification buffer
        const blockersJson = JSON.stringify(blockers);
        if (trip.closure_blockers !== blockersJson || trip.closure_verified_at) {
          await pb.collection('trip_logs').update(trip.id, {
            closure_verified_at: '',
            closure_blockers: blockersJson,
          }, { $autoCancel: false }).catch(() => {});
        }
      }
    }
  } catch (err) {
    logger.error(`[TripClosure Worker Error] ${err.message}`);
  }
}

export function startTripClosureCron() {
  loadCron().then(hasCron => {
    if (hasCron && cron) {
      // Runs every 2 minutes
      cron.schedule('*/2 * * * *', () => {
        processTripClosures().catch(err => logger.error(`[TripClosure Cron] ${err.message}`));
      });
      logger.info('🚀 Trip Closure Automation Cron scheduled (every 2 minutes with 10-min buffer).');
    } else {
      setInterval(() => {
        processTripClosures().catch(err => logger.error(`[TripClosure Interval] ${err.message}`));
      }, 120000);
      logger.info('🚀 Trip Closure Automation Interval active (every 2 minutes with 10-min buffer).');
    }
  });
}
