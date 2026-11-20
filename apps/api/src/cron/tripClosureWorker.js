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
  // Disabled: Auto-closing trips and 10-minute timer removed per user request
  return;
}

export function startTripClosureCron() {
  // Disabled: Auto-closing trips and 10-minute timer removed per user request
  logger.info('[TripClosure] Auto-closure worker disabled per user instruction.');
}
