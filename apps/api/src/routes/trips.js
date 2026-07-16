import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';

const router = express.Router();

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

  try {
    const updatedTrip = await pb.collection('trip_logs').update(id, updateData);
    logger.info(`Trip ${id} updated successfully:`, updatedTrip);
    return res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      trip: updatedTrip
    });
  } catch (err) {
    logger.error(`Database rejection error updating trip ${id}:`, err);
    console.error('PocketBase/SQLite database constraints violation error details:', err.message, err.data);

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

  try {
    const updatedTrip = await pb.collection('trip_logs').update(id, updateData);
    logger.info(`Trip ${id} patched successfully:`, updatedTrip);
    return res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      trip: updatedTrip
    });
  } catch (err) {
    logger.error(`Database rejection error patching trip ${id}:`, err);
    console.error('PocketBase/SQLite database constraints violation error details:', err.message, err.data);

    return res.status(400).json({
      success: false,
      error: err.message || 'Database validation/constraint failed',
      details: err.data
    });
  }
});

export default router;
