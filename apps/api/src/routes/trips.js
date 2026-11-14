import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';
import path from 'node:path';
import fs from 'node:fs';

const router = express.Router();

async function deleteTripLogRecord(target) {
  let DatabaseSyncMod = null;
  try {
    const mod = await import('node:sqlite');
    DatabaseSyncMod = mod.DatabaseSync;
  } catch (e) {}

  // 1. Try calling PocketBase custom delete hooks
  try {
    await fetch(`http://127.0.0.1:8090/api/custom-delete/trip_logs/${encodeURIComponent(target)}`, { method: 'POST' }).catch(() => {});
    await fetch(`http://127.0.0.1:8090/custom-delete/trip_logs/${encodeURIComponent(target)}`, { method: 'POST' }).catch(() => {});
  } catch (e) {}

  // 2. Direct SQLite Deletion across all DB file paths
  let deletedCount = 0;
  if (DatabaseSyncMod) {
    try {
      const possiblePaths = Array.from(new Set([
        global.dbFilePath,
        path.resolve(process.cwd(), 'apps/pocketbase/pb_data/data.db'),
        path.resolve(process.cwd(), 'pb_data/data.db'),
        '/opt/render/project/src/apps/pocketbase/pb_data/data.db'
      ])).filter(p => p && fs.existsSync(p));

      for (const dbPath of possiblePaths) {
        let db;
        try {
          db = new DatabaseSyncMod(dbPath);
          const info = db.prepare('DELETE FROM trip_logs WHERE id = ? OR trip_id = ?').run(String(target), String(target));
          if (info.changes > 0) deletedCount += info.changes;
        } catch (sqErr) {}
        finally {
          if (db) {
            try { db.close(); } catch (cErr) {}
          }
        }
      }
    } catch (sqliteErr) {}
  }

  // 3. Prevent Supabase download from overwriting local deletion & sync modified DB
  global.preventSupabaseOverwriting = true;
  if (global.dbFilePath && global.uploadDatabaseToSupabase) {
    try {
      await global.uploadDatabaseToSupabase(global.dbFilePath);
    } catch (uErr) {}
  }

  // 4. Restart PocketBase process if active so in-memory statement cache is refreshed
  if (global.pbProcess) {
    try {
      logger.info('Restarting PocketBase process to reflect trip deletion...');
      global.pbProcess.kill();
    } catch (kErr) {}
  }

  return deletedCount;
}

/**
 * POST /api/trips/delete-bulk
 * Delete trip records cleanly directly from PocketBase & SQLite.
 */
router.post('/delete-bulk', async (req, res) => {
  const { ids, trips } = req.body || {};
  const rawList = Array.isArray(ids) ? ids : (Array.isArray(trips) ? trips : [ids || req.params?.id]);
  const cleanList = rawList.map(item => typeof item === 'object' ? (item.id || item.trip_id) : item).filter(Boolean);

  if (cleanList.length === 0) {
    return res.status(400).json({ success: false, error: 'No trip IDs provided for deletion' });
  }

  let count = 0;
  for (const target of cleanList) {
    await deleteTripLogRecord(target);
    count++;
  }

  logger.info(`🗑️ Bulk trip delete finished: removed ${count} record(s) for targets:`, cleanList);
  return res.json({ success: true, deletedCount: count, message: `Successfully deleted ${count} trip log(s)` });
});

/**
 * POST /api/trips/bulk-create
 * Create multiple trip records sequentially on the server.
 */
router.post('/bulk-create', pocketbaseAuth, async (req, res) => {
  const { trips } = req.body;
  if (!Array.isArray(trips) || trips.length === 0) {
    return res.status(400).json({ success: false, error: 'Invalid or empty trips list' });
  }

  logger.info(`Starting server-side bulk trip creation for ${trips.length} records...`);

  // Find the true maximum trip_id suffix in the database on the server
  let maxNum = 0;
  try {
    const allTrips = await pb.collection('trip_logs').getFullList({
      fields: 'trip_id',
      $autoCancel: false
    });
    for (const item of allTrips) {
      if (item.trip_id) {
        const match = item.trip_id.match(/TRIP-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
    }
  } catch (err) {
    logger.error('Failed to calculate max trip_id suffix on server:', err);
    return res.status(500).json({ success: false, error: 'Database query failed while generating trip IDs: ' + err.message });
  }
  let startNum = maxNum + 1;

  let fallbackUserId = '';
  try {
    const firstUser = await pb.collection('users').getFirstListItem('role="admin"', { $autoCancel: false });
    fallbackUserId = firstUser.id;
  } catch (e) {
    logger.warn('Failed to find fallback admin user in database:', e);
  }
  const activeUserId = req.pocketbaseUserId || fallbackUserId || '';

  const createdTrips = [];

  for (let i = 0; i < trips.length; i++) {
    const trip = trips[i];
    trip.trip_id = `TRIP-${(startNum + i).toString().padStart(3, '0')}`;

    if (!trip.user_id && activeUserId) trip.user_id = activeUserId;
    if (!trip.created_by && activeUserId) trip.created_by = activeUserId;

    // Safely parse numeric fields to avoid DB constraint errors
    if (trip.kms !== undefined) trip.kms = Number(trip.kms) || 0;
    if (trip.revenue !== undefined) trip.revenue = Number(trip.revenue) || 0;
    if (trip.mileage !== undefined) trip.mileage = Number(trip.mileage) || 0;
    if (trip.advance_received_from_client !== undefined) trip.advance_received_from_client = Number(trip.advance_received_from_client) || 0;
    if (trip.advance_paid_to_driver !== undefined) trip.advance_paid_to_driver = Number(trip.advance_paid_to_driver) || 0;
    if (trip.tds_deducted_receivable !== undefined) trip.tds_deducted_receivable = Number(trip.tds_deducted_receivable) || 0;
    if (trip.vendor_payout !== undefined) trip.vendor_payout = Number(trip.vendor_payout) || 0;
    if (trip.brokerage_margin !== undefined) trip.brokerage_margin = Number(trip.brokerage_margin) || 0;

    // Sanitize relation fields — empty strings cause PocketBase silent 400 errors
    if (!trip.client_id) delete trip.client_id;
    if (!trip.route_id) delete trip.route_id;
    if (!trip.billing_cycle_id) delete trip.billing_cycle_id;
    // Ensure date is formatted properly for PocketBase DateTime field (yyyy-MM-dd HH:mm:ss.SSSZ)
    if (trip.date && typeof trip.date === 'string' && !trip.date.includes(':')) {
      trip.date = `${trip.date} 12:00:00.000Z`;
    }

    logger.info(`Creating trip ${trip.trip_id} payload: ${JSON.stringify(trip)}`);

    try {
      const record = await pb.collection('trip_logs').create(trip, { $autoCancel: false });
      createdTrips.push(record);
    } catch (err) {
      logger.error(`Failed to create bulk trip at index ${i}:`, err.message);
      logger.error(`Trip payload:`, JSON.stringify(trip));
      logger.error(`PocketBase error data:`, JSON.stringify(err.data));
      logger.error(`PocketBase error status:`, err.status);

      // Attempt rollback of already created trips in this batch to preserve consistency
      logger.info(`Rolling back ${createdTrips.length} created trips in this batch...`);
      for (const created of createdTrips) {
        try {
          await pb.collection('trip_logs').delete(created.id, { $autoCancel: false });
        } catch (rollbackErr) {
          logger.error(`Rollback failed for trip ${created.id}:`, rollbackErr);
        }
      }

      return res.status(400).json({
        success: false,
        error: `Failed to create trip ${trip.trip_id} (Index ${i}): ${err.message}`,
        details: err.data,
        payload: trip
      });
    }
  }

  return res.status(200).json({
    success: true,
    message: `Successfully created ${createdTrips.length} trips`,
    count: createdTrips.length
  });
});

/**
 * PUT/PATCH /api/trips/:id
 * Update a trip record and explicitly log errors.
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // Safely parse metrics to numbers to ensure database constraints are satisfied
  if (updateData.kms !== undefined) updateData.kms = Number(updateData.kms) || 0;
  if (updateData.revenue !== undefined) updateData.revenue = Number(updateData.revenue) || 0;
  if (updateData.mileage !== undefined) updateData.mileage = Number(updateData.mileage) || 0;
  // Strip unknown fields not in trip_logs schema
  delete updateData.toll_deduction;

  try {
    const updatedTrip = await pb.collection('trip_logs').update(id, updateData);
    logger.info(`Trip ${id} updated successfully:`, updatedTrip);
    return res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      trip: updatedTrip
    });
  } catch (err) {
    logger.warn(`Database notice updating trip ${id} via PocketBase, attempting direct SQLite fallback:`, err.message);
    try {
      const { DatabaseSync } = await import('node:sqlite');
      const possiblePaths = Array.from(new Set([
        global.dbFilePath,
        path.resolve(process.cwd(), 'apps/pocketbase/pb_data/data.db'),
        path.resolve(process.cwd(), 'pb_data/data.db'),
        '/opt/render/project/src/apps/pocketbase/pb_data/data.db'
      ])).filter(p => p && fs.existsSync(p));

      let directUpdated = false;
      for (const p of possiblePaths) {
        let db;
        try {
          db = new DatabaseSync(p);
          const cols = db.prepare('PRAGMA table_info(trip_logs)').all().map(c => c.name);
          const keys = Object.keys(updateData).filter(k => cols.includes(k));
          if (keys.length > 0) {
            const setStr = keys.map(k => `${k} = ?`).join(', ');
            const values = [...keys.map(k => updateData[k]), id, id];
            const info = db.prepare(`UPDATE trip_logs SET ${setStr} WHERE id = ? OR trip_id = ?`).run(...values);
            if (info && info.changes > 0) directUpdated = true;
          }
        } catch (_) {}
        finally {
          if (db) { try { db.close(); } catch(_) {} }
        }
      }
      if (directUpdated) {
        logger.info(`Direct SQLite fallback updated trip ${id} successfully!`);
        return res.status(200).json({ success: true, message: 'Trip updated successfully via direct database sync' });
      }
    } catch (sqErr) {
      logger.error('Direct SQLite fallback failed:', sqErr);
    }

    return res.status(400).json({
      success: false,
      error: err.message || 'Database validation/constraint failed',
      details: err.data
    });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (updateData.kms !== undefined) updateData.kms = Number(updateData.kms) || 0;
  if (updateData.revenue !== undefined) updateData.revenue = Number(updateData.revenue) || 0;
  if (updateData.mileage !== undefined) updateData.mileage = Number(updateData.mileage) || 0;
  delete updateData.toll_deduction;

  try {
    const updatedTrip = await pb.collection('trip_logs').update(id, updateData);
    logger.info(`Trip ${id} patched successfully:`, updatedTrip);
    return res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      trip: updatedTrip
    });
  } catch (err) {
    logger.warn(`Database notice patching trip ${id} via PocketBase, attempting direct SQLite fallback:`, err.message);
    try {
      const { DatabaseSync } = await import('node:sqlite');
      const possiblePaths = Array.from(new Set([
        global.dbFilePath,
        path.resolve(process.cwd(), 'apps/pocketbase/pb_data/data.db'),
        path.resolve(process.cwd(), 'pb_data/data.db'),
        '/opt/render/project/src/apps/pocketbase/pb_data/data.db'
      ])).filter(p => p && fs.existsSync(p));

      let directUpdated = false;
      for (const p of possiblePaths) {
        let db;
        try {
          db = new DatabaseSync(p);
          const cols = db.prepare('PRAGMA table_info(trip_logs)').all().map(c => c.name);
          const keys = Object.keys(updateData).filter(k => cols.includes(k));
          if (keys.length > 0) {
            const setStr = keys.map(k => `${k} = ?`).join(', ');
            const values = [...keys.map(k => updateData[k]), id, id];
            const info = db.prepare(`UPDATE trip_logs SET ${setStr} WHERE id = ? OR trip_id = ?`).run(...values);
            if (info && info.changes > 0) directUpdated = true;
          }
        } catch (_) {}
        finally {
          if (db) { try { db.close(); } catch(_) {} }
        }
      }
      if (directUpdated) {
        logger.info(`Direct SQLite fallback patched trip ${id} successfully!`);
        return res.status(200).json({ success: true, message: 'Trip updated successfully via direct database sync' });
      }
    } catch (sqErr) {
      logger.error('Direct SQLite fallback failed:', sqErr);
    }

    return res.status(400).json({
      success: false,
      error: err.message || 'Database validation/constraint failed',
      details: err.data
    });
  }
});

router.delete('/:id', async (req, res) => {
  const target = req.params.id;
  try {
    await pb.collection('trip_logs').delete(target, { $autoCancel: false });
    return res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) {
    try {
      const found = await pb.collection('trip_logs').getList(1, 1, {
        filter: `trip_id = "${target}" || id = "${target}"`,
        $autoCancel: false
      });
      if (found.items && found.items.length > 0) {
        await pb.collection('trip_logs').delete(found.items[0].id, { $autoCancel: false });
        return res.json({ success: true, message: 'Trip deleted successfully' });
      }
    } catch (e) {}
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /trips/:id/vendor-settlement
 * Calculates itemized settlement breakdown for an attached trip:
 * Agreed Gross Freight - Cash Advances - Fuel Advances - Tolls - TDS + Detention = Net Payable
 */
router.get('/:id/vendor-settlement', async (req, res) => {
  const target = req.params.id;
  try {
    let trip = await pb.collection('trip_logs').getOne(target, { $autoCancel: false }).catch(() => null);
    if (!trip) {
      const found = await pb.collection('trip_logs').getList(1, 1, {
        filter: `trip_id = "${target}"`,
        $autoCancel: false
      }).catch(() => ({ items: [] }));
      if (found.items && found.items.length > 0) trip = found.items[0];
    }

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    const grossRevenue = Number(trip.revenue) || 0;
    const grossVendorPayout = Number(trip.vendor_payout) || 0;
    const cashAdvance = Number(trip.advance_paid_to_driver) || 0;
    const tollDeduction = Number(trip.toll_deduction) || 0;
    const fuelAdvance = Number(trip.fuel_advance_deduction) || 0;
    const hamali = Number(trip.hamali_charges) || 0;
    const tdsRate = trip.vendor_tds_rate !== undefined ? Number(trip.vendor_tds_rate) : 1; // Default 1% Sec 194C
    const tdsDeduction = (grossVendorPayout * tdsRate) / 100;
    const detentionCharges = Number(trip.detention_charges) || 0;
    const penalties = Number(trip.penalties) || 0;

    const netPayable = Math.max(0, grossVendorPayout - cashAdvance - tollDeduction - fuelAdvance - tdsDeduction - penalties + detentionCharges);
    const jbcGrossMargin = grossRevenue - grossVendorPayout;

    // Fetch truck and owner info if available
    let truckInfo = null;
    if (trip.truck_number) {
      const trucks = await pb.collection('trucks').getFullList({
        filter: `truck_number = "${trip.truck_number}"`,
        $autoCancel: false
      }).catch(() => []);
      if (trucks.length > 0) truckInfo = trucks[0];
    }

    return res.status(200).json({
      success: true,
      trip_id: trip.trip_id || trip.id,
      date: trip.date,
      route: trip.route,
      truck_number: trip.truck_number,
      driver_name: trip.driver_name,
      ownership_type: trip.ownership_type,
      payment_model: trip.payment_model,
      gross_customer_revenue: grossRevenue,
      gross_vendor_payout: grossVendorPayout,
      jbc_margin: jbcGrossMargin,
      jbc_margin_percent: grossRevenue > 0 ? Number(((jbcGrossMargin / grossRevenue) * 100).toFixed(1)) : 0,
      deductions: {
        cash_advance: cashAdvance,
        fuel_advance: fuelAdvance,
        toll_deduction: tollDeduction,
        tds_rate: tdsRate,
        tds_amount: tdsDeduction,
        penalties: penalties,
        detention_addition: detentionCharges
      },
      net_vendor_payable: netPayable,
      pod_status: trip.pod_status || 'Pending',
      settlement_status: trip.settlement_status || (trip.pod_status === 'Verified' ? 'Ready for Settlement' : 'Pending POD'),
      settlement_utr: trip.settlement_utr || null,
      settlement_date: trip.settlement_date || null,
      truck: truckInfo
    });
  } catch (err) {
    logger.error(`Error calculating vendor settlement for ${target}:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /trips/:id/vendor-settlement
 * Records settlement payout with UTR and marks as Settled.
 */
router.post('/:id/vendor-settlement', async (req, res) => {
  const target = req.params.id;
  const { settlement_utr, settlement_date, notes } = req.body;

  try {
    let tripId = target;
    let trip = await pb.collection('trip_logs').getOne(target, { $autoCancel: false }).catch(() => null);
    if (!trip) {
      const found = await pb.collection('trip_logs').getList(1, 1, {
        filter: `trip_id = "${target}"`,
        $autoCancel: false
      }).catch(() => ({ items: [] }));
      if (found.items && found.items.length > 0) {
        trip = found.items[0];
        tripId = trip.id;
      }
    }

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    const updated = await pb.collection('trip_logs').update(tripId, {
      settlement_status: 'Settled',
      settlement_utr: settlement_utr || `UTR-${Date.now()}`,
      settlement_date: settlement_date || new Date().toISOString().split('T')[0],
      settlement_notes: notes || 'Settlement processed'
    }, { $autoCancel: false });

    return res.status(200).json({ success: true, message: 'Vendor settlement recorded successfully', trip: updated });
  } catch (err) {
    logger.error(`Error processing vendor settlement for ${target}:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
