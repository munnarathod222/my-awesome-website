import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/trips/bulk-create
 * Create multiple trip records sequentially on the server.
 */
router.post('/bulk-create', async (req, res) => {
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

  const createdTrips = [];

  for (let i = 0; i < trips.length; i++) {
    const trip = trips[i];
    trip.trip_id = `TRIP-${(startNum + i).toString().padStart(3, '0')}`;
    
    // Safely parse metrics to numbers to satisfy database constraints
    if (trip.kms !== undefined) trip.kms = Number(trip.kms) || 0;
    if (trip.revenue !== undefined) trip.revenue = Number(trip.revenue) || 0;
    if (trip.mileage !== undefined) trip.mileage = Number(trip.mileage) || 0;

    try {
      const record = await pb.collection('trip_logs').create(trip, { $autoCancel: false });
      createdTrips.push(record);
    } catch (err) {
      logger.error(`Failed to create bulk trip at index ${i}:`, err);
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
        details: err.data
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
  if (updateData.kms !== undefined) {
    updateData.kms = Number(updateData.kms) || 0;
  }
  if (updateData.revenue !== undefined) {
    updateData.revenue = Number(updateData.revenue) || 0;
  }
  if (updateData.mileage !== undefined) {
    updateData.mileage = Number(updateData.mileage) || 0;
  }

  try {
    const updatedTrip = await pb.collection('trip_logs').update(id, updateData);
    logger.info(`Trip ${id} updated successfully:`, updatedTrip);
    return res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      trip: updatedTrip
    });
  } catch (err) {
    // Explicitly log SQLite database rejection messages to help debug constraint violations
    logger.error(`Database rejection error updating trip ${id}:`, err);
    console.error("PocketBase/SQLite database constraints violation error details:", err.message, err.data);
    
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

  if (updateData.kms !== undefined) {
    updateData.kms = Number(updateData.kms) || 0;
  }
  if (updateData.revenue !== undefined) {
    updateData.revenue = Number(updateData.revenue) || 0;
  }
  if (updateData.mileage !== undefined) {
    updateData.mileage = Number(updateData.mileage) || 0;
  }

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
    console.error("PocketBase/SQLite database constraints violation error details:", err.message, err.data);
    
    return res.status(400).json({
      success: false,
      error: err.message || 'Database validation/constraint failed',
      details: err.data
    });
  }
});

export default router;
