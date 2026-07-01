/**
 * monthEndProcessor.js
 * ─────────────────────────────────────────────────────────────────────────────
 * End-of-Month Cron Job — fires at 23:59 on the last calendar day of each month.
 *
 * Schedule: "59 23 28-31 * *" with a JS check that today == last day of month.
 * (Native "L" last-day is not supported in all cron libraries — we guard in code.)
 *
 * Flow:
 *   1. Verify today is the last day of the month.
 *   2. POST to /leaderboard/finalize via internal HTTP call (reuses auth token).
 *   3. Log the outcome.
 *
 * Note: node-cron is used. If it's not installed, add it:
 *   npm install node-cron --save --prefix apps/api
 */

import logger from '../utils/logger.js';

// Dynamically import node-cron so server starts even if the package is missing
let cron = null;
async function loadCron() {
  try {
    const mod = await import('node-cron');
    cron = mod.default ?? mod;
    return true;
  } catch (err) {
    logger.warn('[MonthEnd Cron] node-cron not installed — skipping cron job setup. Run: npm install node-cron --save --prefix apps/api');
    return false;
  }
}

/** Returns true if today is the last day of the current month */
function isLastDayOfMonth() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow.getDate() === 1;
}

/**
 * Internal self-call to the leaderboard finalize endpoint.
 * We call it via a direct import of the logic rather than HTTP to avoid auth complexity.
 */
async function runMonthEndFinalization() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  logger.info(`[MonthEnd Cron] 🕛 Triggered at ${now.toISOString()} — processing ${month}/${year}...`);

  if (!isLastDayOfMonth()) {
    logger.info('[MonthEnd Cron] Not the last day of the month — skipping finalization.');
    return;
  }

  try {
    // Dynamically import pb and the finalization logic to avoid circular deps
    const { default: pb } = await import('../utils/pocketbaseClient.js');

    // ── Replicate the finalize logic inline (self-contained) ──────────────────
    const BASE_TRIPS_THRESHOLD = 15;
    const BASE_PAY = 35_000;
    const EXTRA_TRIP_BONUS = 1_000;
    const EFFICIENCY_GRAND_PRIZE = 10_000;
    const PRIZE_BADGE_PREFIX = 'FUEL_CHAMP';

    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Check not already finalized
    try {
      const existing = await pb.collection('leaderboard_snapshots').getFullList({
        filter: `month = ${month} && year = ${year}`,
        $autoCancel: false,
      });
      if (existing.length > 0) {
        logger.warn(`[MonthEnd Cron] Leaderboard for ${month}/${year} already finalized — skipping.`);
        return;
      }
    } catch (_) { /* collection may not exist yet */ }

    // Fetch trip_logs
    let trips = [];
    try {
      trips = await pb.collection('trip_logs').getFullList({
        filter: `date >= "${start} 00:00:00" && date <= "${end} 23:59:59"`,
        $autoCancel: false,
      });
    } catch (err) {
      logger.error('[MonthEnd Cron] Failed to fetch trip_logs:', err.message);
      return;
    }

    // Group by driver
    const driverMap = {};
    for (const trip of trips) {
      const name = (trip.driver_name || '').trim();
      if (!name) continue;
      const status = (trip.trip_status || '').toLowerCase();
      if (status && status !== 'completed') continue;
      if (!driverMap[name]) driverMap[name] = { name, tripCount: 0, kmplValues: [] };
      driverMap[name].tripCount += 1;
      const mileage = Number(trip.mileage) || 0;
      if (mileage > 0) driverMap[name].kmplValues.push(mileage);
    }

    const driverStats = Object.values(driverMap).map(d => ({
      name: d.name,
      total_trips: d.tripCount,
      avg_kmpl: d.kmplValues.length > 0
        ? parseFloat((d.kmplValues.reduce((a, b) => a + b, 0) / d.kmplValues.length).toFixed(2))
        : 0,
      is_eligible: d.tripCount >= BASE_TRIPS_THRESHOLD,
    }));

    const eligible = driverStats.filter(d => d.is_eligible).sort((a, b) => b.avg_kmpl - a.avg_kmpl);

    if (eligible.length === 0) {
      logger.warn(`[MonthEnd Cron] No eligible drivers for ${month}/${year} — skipping finalization.`);
      return;
    }

    const winner = eligible[0];
    const badgeId = `${PRIZE_BADGE_PREFIX}_${year}_${String(month).padStart(2, '0')}`;

    // Write leaderboard_snapshots
    for (let i = 0; i < Math.min(eligible.length, 3); i++) {
      const d = eligible[i];
      try {
        await pb.collection('leaderboard_snapshots').create({
          month,
          year,
          rank: i + 1,
          employee_name: d.name,
          avg_kmpl: d.avg_kmpl,
          total_trips: d.total_trips,
          badge_awarded: i === 0 ? badgeId : '',
          prize_amount: i === 0 ? EFFICIENCY_GRAND_PRIZE : 0,
        }, { $autoCancel: false });
      } catch (e) {
        logger.error(`[MonthEnd Cron] snapshot rank ${i + 1} write failed:`, e.message);
      }
    }

    // Inject payroll bonus record for winner
    const lastDayISO = new Date(year, month, 0).toISOString().split('T')[0];
    try {
      let employeeId = null;
      try {
        const emps = await pb.collection('employees').getFullList({
          filter: `name = "${winner.name}"`,
          $autoCancel: false,
        });
        if (emps.length > 0) employeeId = emps[0].id;
      } catch (_) {}

      await pb.collection('payroll').create({
        payroll_month: month,
        payroll_year: year,
        employee_id: employeeId || winner.name,
        employee_name: winner.name,
        employee_id_relation: employeeId || undefined,
        designation: 'Driver',
        base_salary: BASE_PAY,
        trip_bonus: EFFICIENCY_GRAND_PRIZE,
        net_salary: EFFICIENCY_GRAND_PRIZE,
        gross_salary: EFFICIENCY_GRAND_PRIZE,
        payment_status: 'pending',
        remarks: `FUEL_LEADERBOARD_SUPER_BONUS — ${winner.name} | ${month}/${year} | ${winner.avg_kmpl} KMPL | Badge: ${badgeId}`,
        date: lastDayISO,
        status: 'Approved',
      }, { $autoCancel: false });

      logger.info(`[MonthEnd Cron] ✅ Payroll bonus injected for ${winner.name}`);
    } catch (payrollErr) {
      logger.error('[MonthEnd Cron] Payroll injection failed:', payrollErr.message);
    }

    // Award badge on employee profile
    try {
      const emps = await pb.collection('employees').getFullList({
        filter: `name = "${winner.name}"`,
        $autoCancel: false,
      });
      if (emps.length > 0) {
        const emp = emps[0];
        let badges = [];
        try { badges = JSON.parse(emp.badges || '[]'); } catch (_) {}
        if (!badges.includes(badgeId)) badges.push(badgeId);
        await pb.collection('employees').update(emp.id, {
          badges: JSON.stringify(badges),
        }, { $autoCancel: false });
        logger.info(`[MonthEnd Cron] 🏅 Badge ${badgeId} awarded to ${winner.name}`);
      }
    } catch (badgeErr) {
      logger.warn('[MonthEnd Cron] Badge award failed (non-fatal):', badgeErr.message);
    }

    // Write monthly_payroll_snapshots for all eligible
    for (const d of eligible) {
      const isWin = d.name === winner.name;
      const extra = Math.max(0, d.total_trips - BASE_TRIPS_THRESHOLD);
      try {
        await pb.collection('monthly_payroll_snapshots').create({
          payroll_month: month,
          payroll_year: year,
          employee_name: d.name,
          total_trips: d.total_trips,
          extra_trips: extra,
          base_pay: BASE_PAY,
          extra_trips_pay: extra * EXTRA_TRIP_BONUS,
          efficiency_grand_prize: isWin ? EFFICIENCY_GRAND_PRIZE : 0,
          gross_monthly_payout: BASE_PAY + (extra * EXTRA_TRIP_BONUS) + (isWin ? EFFICIENCY_GRAND_PRIZE : 0),
          avg_kmpl: d.avg_kmpl,
          is_leaderboard_winner: isWin,
          is_eligible: true,
          status: 'finalized',
        }, { $autoCancel: false });
      } catch (_) {}
    }

    logger.info(`[MonthEnd Cron] 🎉 COMPLETE — ${month}/${year} finalized. Winner: ${winner.name} (${winner.avg_kmpl} KMPL)`);
  } catch (err) {
    logger.error('[MonthEnd Cron] Unhandled error during finalization:', err);
  }
}

/**
 * Start the month-end cron job.
 * Called once on server startup from main.js.
 */
export async function startMonthEndCron() {
  const loaded = await loadCron();
  if (!loaded) return;

  // Fires at 23:59 on days 28–31 (we guard in the handler for the actual last day)
  const schedule = '59 23 28-31 * *';
  cron.schedule(schedule, runMonthEndFinalization, {
    timezone: 'Asia/Kolkata',
  });

  logger.info(`[MonthEnd Cron] ✅ Scheduled — "${schedule}" (Asia/Kolkata). Will fire on last day of each month at 23:59 IST.`);
}
