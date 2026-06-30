import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

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
