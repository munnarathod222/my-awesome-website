import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const BASE_TRIPS_THRESHOLD = 15;
const BASE_PAY = 35_000;
const EXTRA_TRIP_BONUS = 1_000;
const EFFICIENCY_GRAND_PRIZE = 10_000;
const PRIZE_BADGE_PREFIX = 'FUEL_CHAMP';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Return YYYY-MM-DD bounds for a given month/year */
function monthBounds(month, year) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

/** Compute payroll breakdown for a single driver given their stats */
function buildPayrollObject(driverName, totalTrips, avgKmpl, isWinner = false) {
  const extraTrips = Math.max(0, totalTrips - BASE_TRIPS_THRESHOLD);
  const basePay = totalTrips >= BASE_TRIPS_THRESHOLD ? BASE_PAY : 0;
  const extraTripsPay = extraTrips * EXTRA_TRIP_BONUS;
  const efficiencyGrandPrize = isWinner ? EFFICIENCY_GRAND_PRIZE : 0;
  const grossMonthlyPayout = basePay + extraTripsPay + efficiencyGrandPrize;

  return {
    driver_name: driverName,
    total_trips: totalTrips,
    avg_kmpl: avgKmpl,
    is_eligible: totalTrips >= BASE_TRIPS_THRESHOLD,
    is_winner: isWinner,
    base_pay: basePay,
    extra_trips: extraTrips,
    extra_trips_pay: extraTripsPay,
    efficiency_grand_prize: efficiencyGrandPrize,
    gross_monthly_payout: grossMonthlyPayout,
  };
}

/**
 * Core aggregation: fetch trips + fuel for a month, group by driver, compute
 * eligibility and KMPL-based ranking. Returns an array of driver stats objects
 * sorted by avgKmpl descending (eligible drivers first, then ineligible).
 */
async function computeLeaderboard(month, year) {
  const { start, end } = monthBounds(month, year);

  // 1. Fetch trip_logs for the window
  let trips = [];
  try {
    trips = await pb.collection('trip_logs').getFullList({
      filter: pb.filter('date >= {:start} && date <= {:end}', { start: `${start} 00:00:00`, end: `${end} 23:59:59` }),
      $autoCancel: false,
    });
  } catch (err) {
    logger.error('Leaderboard: failed to fetch trip_logs:', err.message);
  }

  // 2. Fetch fuel_tracker for the window (for cross-checking KMPL)
  let fuelLogs = [];
  try {
    fuelLogs = await pb.collection('fuel_tracker').getFullList({
      filter: pb.filter('date >= {:start} && date <= {:end}', { start: `${start} 00:00:00`, end: `${end} 23:59:59` }),
      $autoCancel: false,
    });
  } catch (err) {
    logger.warn('Leaderboard: failed to fetch fuel_tracker (non-fatal):', err.message);
  }

  // 3. Group trips by driver name
  const driverMap = {};
  for (const trip of trips) {
    const name = (trip.driver_name || '').trim();
    if (!name) continue;

    const status = (trip.trip_status || '').toLowerCase();
    // Count completed trips only; if no status field, count all
    const isCompleted = !status || status === 'completed';
    if (!isCompleted) continue;

    if (!driverMap[name]) {
      driverMap[name] = { name, tripCount: 0, kmplValues: [], truckNumbers: new Set() };
    }
    driverMap[name].tripCount += 1;
    const mileage = Number(trip.mileage) || 0;
    if (mileage > 0) driverMap[name].kmplValues.push(mileage);
    if (trip.truck_number) driverMap[name].truckNumbers.add(trip.truck_number);
  }

  // 4. Supplement KMPL from fuel_tracker (distance_driven / liters) per truck
  //    Map truck_number → avg fuel KMPL from fuel logs
  const fuelKmplByTruck = {};
  for (const log of fuelLogs) {
    const truckNum = (log.truck_number || '').trim().replace(/\s+/g, '').toUpperCase();
    if (!truckNum) continue;
    const dist = Number(log.distance_driven) || 0;
    const liters = Number(log.liters) || 0;
    if (dist > 0 && liters > 0) {
      if (!fuelKmplByTruck[truckNum]) fuelKmplByTruck[truckNum] = [];
      fuelKmplByTruck[truckNum].push(dist / liters);
    }
  }

  // 5. Compute average KMPL per driver
  const driverStats = Object.values(driverMap).map(d => {
    let kmplValues = [...d.kmplValues];

    // Supplement from fuel logs if trip mileage field was empty
    if (kmplValues.length === 0) {
      for (const tn of d.truckNumbers) {
        const normTn = tn.replace(/\s+/g, '').toUpperCase();
        const fuelKmpls = fuelKmplByTruck[normTn] || [];
        kmplValues = kmplValues.concat(fuelKmpls);
      }
    }

    const avgKmpl = kmplValues.length > 0
      ? parseFloat((kmplValues.reduce((a, b) => a + b, 0) / kmplValues.length).toFixed(2))
      : 0;

    return {
      name: d.name,
      total_trips: d.tripCount,
      avg_kmpl: avgKmpl,
      is_eligible: d.tripCount >= BASE_TRIPS_THRESHOLD,
    };
  });

  // 6. Sort: eligible first by KMPL desc, then ineligible by KMPL desc
  driverStats.sort((a, b) => {
    if (a.is_eligible && !b.is_eligible) return -1;
    if (!a.is_eligible && b.is_eligible) return 1;
    return b.avg_kmpl - a.avg_kmpl;
  });

  return driverStats;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /leaderboard?month=6&year=2025
// Returns live computed standings (top 3 for display, all for payroll preview)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', pocketbaseAuth, async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    if (month < 1 || month > 12) {
      return res.status(400).json({ error: 'month must be 1–12' });
    }

    // Check if a finalized snapshot exists for this month/year
    let snapshot = null;
    try {
      const snaps = await pb.collection('leaderboard_snapshots').getFullList({
        filter: pb.filter('month = {:month} && year = {:year}', { month, year }),
        sort: 'rank',
        $autoCancel: false,
      });
      if (snaps.length > 0) snapshot = snaps;
    } catch (_) { /* collection may not exist yet */ }

    if (snapshot && snapshot.length > 0) {
      // Return locked historical data
      return res.json({
        success: true,
        source: 'snapshot',
        month,
        year,
        is_finalized: true,
        top3: snapshot.slice(0, 3),
        prize: EFFICIENCY_GRAND_PRIZE,
      });
    }

    // Live computation
    const driverStats = await computeLeaderboard(month, year);
    const eligible = driverStats.filter(d => d.is_eligible);
    const top3 = eligible.slice(0, 3).map((d, idx) => ({
      rank: idx + 1,
      driver_name: d.name,
      total_trips: d.total_trips,
      avg_kmpl: d.avg_kmpl,
      is_winner: idx === 0,
      prize_amount: idx === 0 ? EFFICIENCY_GRAND_PRIZE : 0,
    }));

    return res.json({
      success: true,
      source: 'live',
      month,
      year,
      is_finalized: false,
      top3,
      total_eligible: eligible.length,
      total_drivers: driverStats.length,
      prize: EFFICIENCY_GRAND_PRIZE,
    });
  } catch (err) {
    logger.error('GET /leaderboard error:', err);
    res.status(500).json({ error: err.message || 'Failed to compute leaderboard' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /leaderboard/payroll-preview?month=6&year=2025
// Returns payroll breakdown for ALL eligible drivers (for admin preview)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/payroll-preview', pocketbaseAuth, async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const driverStats = await computeLeaderboard(month, year);
    const eligible = driverStats.filter(d => d.is_eligible);
    const winner = eligible[0];

    const payrollObjects = driverStats.map((d, idx) => {
      const isWinner = d.is_eligible && idx === 0 && eligible.length > 0;
      return buildPayrollObject(d.name, d.total_trips, d.avg_kmpl, isWinner);
    });

    return res.json({
      success: true,
      month,
      year,
      winner: winner
        ? buildPayrollObject(winner.name, winner.total_trips, winner.avg_kmpl, true)
        : null,
      all_drivers: payrollObjects,
      constants: {
        base_trips_threshold: BASE_TRIPS_THRESHOLD,
        base_pay: BASE_PAY,
        extra_trip_bonus: EXTRA_TRIP_BONUS,
        efficiency_grand_prize: EFFICIENCY_GRAND_PRIZE,
      },
    });
  } catch (err) {
    logger.error('GET /leaderboard/payroll-preview error:', err);
    res.status(500).json({ error: err.message || 'Failed to compute payroll preview' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /leaderboard/finalize
// End-of-month: locks standings, injects payroll record, awards badge
// Body: { month, year } — called by cron job or manually by admin
// ─────────────────────────────────────────────────────────────────────────────
router.post('/finalize', pocketbaseAuth, async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.body.month) || now.getMonth() + 1;
    const year = parseInt(req.body.year) || now.getFullYear();

    logger.info(`[Leaderboard] Finalizing standings for ${month}/${year}...`);

    // 1. Check not already finalized
    try {
      const existing = await pb.collection('leaderboard_snapshots').getFullList({
        filter: pb.filter('month = {:month} && year = {:year}', { month, year }),
        $autoCancel: false,
      });
      if (existing.length > 0) {
        return res.status(409).json({ error: `Leaderboard for ${month}/${year} is already finalized.` });
      }
    } catch (_) { /* collection may not exist — first run */ }

    // 2. Compute final standings
    const driverStats = await computeLeaderboard(month, year);
    const eligible = driverStats.filter(d => d.is_eligible);

    if (eligible.length === 0) {
      return res.status(422).json({
        error: `No eligible drivers found for ${month}/${year}. Minimum ${BASE_TRIPS_THRESHOLD} trips required.`,
      });
    }

    const winner = eligible[0];
    const badgeId = `${PRIZE_BADGE_PREFIX}_${year}_${String(month).padStart(2, '0')}`;

    // 3. Write leaderboard_snapshots (top 3)
    const top3 = eligible.slice(0, 3);
    const snapshotResults = [];
    for (let i = 0; i < top3.length; i++) {
      const d = top3[i];
      const isFirst = i === 0;
      try {
        const snap = await pb.collection('leaderboard_snapshots').create({
          month,
          year,
          rank: i + 1,
          employee_name: d.name,
          avg_kmpl: d.avg_kmpl,
          total_trips: d.total_trips,
          badge_awarded: isFirst ? badgeId : '',
          prize_amount: isFirst ? EFFICIENCY_GRAND_PRIZE : 0,
        }, { $autoCancel: false });
        snapshotResults.push(snap);
      } catch (snapErr) {
        logger.error(`Failed to write leaderboard snapshot for rank ${i + 1}:`, snapErr.message);
      }
    }

    // 4. Inject payroll record for winner (₹10,000 bonus)
    let payrollRecord = null;
    try {
      // Find employee record for winner
      let employeeId = null;
      let employeeRecord = null;
      try {
        const employees = await pb.collection('employees').getFullList({
          filter: `name = "${winner.name}"`,
          $autoCancel: false,
        });
        if (employees.length > 0) {
          employeeRecord = employees[0];
          employeeId = employeeRecord.id;
        }
      } catch (empErr) {
        logger.warn(`Could not find employee record for "${winner.name}":`, empErr.message);
      }

      const lastDayISO = new Date(year, month, 0).toISOString().split('T')[0];
      payrollRecord = await pb.collection('payroll').create({
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
        description: `FUEL_LEADERBOARD_SUPER_BONUS - ${winner.name} won Fuel Efficiency Leaderboard for ${month}/${year} with ${winner.avg_kmpl} KMPL`,
        remarks: `Fuel Champion Badge: ${badgeId}. Avg KMPL: ${winner.avg_kmpl}. Trips: ${winner.total_trips}.`,
        date: lastDayISO,
        status: 'Approved',
      }, { $autoCancel: false });

      logger.info(`[Leaderboard] Payroll record created: ${payrollRecord.id} for ${winner.name}`);
    } catch (payrollErr) {
      logger.error(`Failed to inject payroll for winner "${winner.name}":`, payrollErr.message);
    }

    // 5. Award badge on employee profile
    let badgeResult = null;
    try {
      const employees = await pb.collection('employees').getFullList({
        filter: `name = "${winner.name}"`,
        $autoCancel: false,
      });
      if (employees.length > 0) {
        const emp = employees[0];
        let badges = [];
        try {
          badges = JSON.parse(emp.badges || '[]');
        } catch (_) { badges = []; }
        if (!badges.includes(badgeId)) badges.push(badgeId);
        badgeResult = await pb.collection('employees').update(emp.id, {
          badges: JSON.stringify(badges),
        }, { $autoCancel: false });
        logger.info(`[Leaderboard] Badge ${badgeId} awarded to ${winner.name}`);
      }
    } catch (badgeErr) {
      logger.warn(`Badge award failed for "${winner.name}" (non-fatal):`, badgeErr.message);
    }

    // 6. Write monthly_payroll_snapshots for ALL eligible drivers
    for (const d of eligible) {
      const isWinnerDriver = d.name === winner.name;
      const payrollObj = buildPayrollObject(d.name, d.total_trips, d.avg_kmpl, isWinnerDriver);
      try {
        await pb.collection('monthly_payroll_snapshots').create({
          payroll_month: month,
          payroll_year: year,
          employee_name: d.name,
          total_trips: payrollObj.total_trips,
          extra_trips: payrollObj.extra_trips,
          base_pay: payrollObj.base_pay,
          extra_trips_pay: payrollObj.extra_trips_pay,
          efficiency_grand_prize: payrollObj.efficiency_grand_prize,
          gross_monthly_payout: payrollObj.gross_monthly_payout,
          avg_kmpl: payrollObj.avg_kmpl,
          is_leaderboard_winner: isWinnerDriver,
          is_eligible: true,
          status: 'finalized',
        }, { $autoCancel: false });
      } catch (snapErr) {
        logger.warn(`Failed to write monthly_payroll_snapshot for ${d.name}:`, snapErr.message);
      }
    }

    logger.info(`[Leaderboard] Month-end finalization complete for ${month}/${year}. Winner: ${winner.name}`);

    return res.json({
      success: true,
      message: `Leaderboard finalized for ${month}/${year}`,
      winner: {
        name: winner.name,
        avg_kmpl: winner.avg_kmpl,
        total_trips: winner.total_trips,
        badge_id: badgeId,
        prize_amount: EFFICIENCY_GRAND_PRIZE,
        payroll_object: buildPayrollObject(winner.name, winner.total_trips, winner.avg_kmpl, true),
      },
      top3: snapshotResults,
      payroll_record_id: payrollRecord?.id || null,
      badge_awarded: !!badgeResult,
    });
  } catch (err) {
    logger.error('POST /leaderboard/finalize error:', err);
    res.status(500).json({ error: err.message || 'Finalization failed' });
  }
});

export default router;
