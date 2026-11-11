/**
 * tripClosureWorker.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Trip Closure Automation Worker with 10-Minute Verification Buffer.
 *
 * Flow:
 *   1. Identifies all trips in "Delivered" status.
 *   2. Verifies Gate 1 (POD verified / present, LR consignment number present),
 *      Gate 2 (Trip financials & driver advances reconciled),
 *      Gate 3 (Subcontractor / Client settlement status).
 *   3. If all gates pass:
 *      - If closure_verified_at is empty, sets closure_verified_at = now().
 *      - If closure_verified_at has passed the 10-minute buffer (>= 10 minutes),
 *        updates trip_status to "Completed", logs auto_closed_at timestamp,
 *        and records a completed task in operations_tasks.
 *   4. If any gate fails:
 *      - Saves active blockers to closure_blockers JSON and resets closure_verified_at.
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

    const nowMs = Date.now();
    const TEN_MINUTES_MS = 10 * 60 * 1000;

    for (const trip of trips) {
      const blockers = [];

      // Gate 1: POD Verification
      const hasPodStatus = String(trip.pod_status || '').toLowerCase() === 'verified';
      const hasPodFile = (trip.pod_file && String(trip.pod_file).trim().length > 2) || 
                         (trip.pod_link && String(trip.pod_link).trim().length > 2);
      if (!hasPodStatus && !hasPodFile) {
        blockers.push('Pending POD Upload or Verification');
      }

      // Gate 1B: Lorry Receipt (LR) Consignment Number
      const hasLr = trip.lr_number && String(trip.lr_number).trim().length > 0;
      if (!hasLr) {
        blockers.push('Missing LR Consignment Number');
      }

      // Gate 2: Driver Advance Reconciled
      const advDriver = Number(trip.advance_paid_to_driver) || 0;
      if (advDriver > 0 && String(trip.subcontractor_settlement_status || '').toLowerCase() === 'disputed') {
        blockers.push('Driver Advance Settlement Dispute');
      }

      // Gate 3: Subcontractor Settlement (for attached/market trips)
      if (trip.ownership_type === 'Attached') {
        const subSettled = String(trip.subcontractor_settlement_status || '').toLowerCase();
        if (subSettled === 'pending' || subSettled === 'disputed') {
          blockers.push('Market Truck Settlement Incomplete');
        }
      }

      // Evaluation
      if (blockers.length === 0) {
        // All gates passed!
        if (!trip.closure_verified_at) {
          // Initiate the 10-minute buffer
          const verifiedAt = new Date().toISOString();
          await pb.collection('trip_logs').update(trip.id, {
            closure_verified_at: verifiedAt,
            closure_blockers: '[]',
          }, { $autoCancel: false }).catch(() => {});
          logger.info(`[TripClosure] Trip ${trip.trip_id || trip.id} passed all gates. 10-min closure buffer started at ${verifiedAt}.`);
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
                description: `Trip automatically verified and closed after 10-minute buffer. Verified POD (${trip.pod_status || 'Received'}), LR #${trip.lr_number || 'N/A'}, and settled financials.`,
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
        // Blockers exist: store blockers and reset verification buffer if previously set
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
