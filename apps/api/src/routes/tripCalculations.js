import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/trip-calculations/save
 * Save simulated trip calculation.
 */
router.post('/save', async (req, res) => {
  const calculationData = { ...req.body };

  // Parse numeric fields to prevent database schema validation failures
  const numericFields = [
    'distance', 'fuel_price', 'mileage', 'tolls', 'driver_expenses',
    'tyre_depreciation_rate', 'tyre_expense', 'fuel_cost', 'vehicle_emi',
    'insurance', 'quarterly_tax', 'freight_revenue', 'total_expenses',
    'net_profit', 'profit_margin'
  ];

  numericFields.forEach(field => {
    if (calculationData[field] !== undefined) {
      calculationData[field] = Number(calculationData[field]) || 0;
    }
  });

  try {
    // If request has auth context, associate with user_id
    if (req.auth && req.auth.id) {
      calculationData.user_id = req.auth.id;
    }

    const newCalculation = await pb.collection('trip_calculations').create(calculationData);
    logger.info(`Trip calculation saved:`, newCalculation.id);

    return res.status(201).json({
      success: true,
      message: 'Trip calculation saved successfully',
      calculation: newCalculation
    });
  } catch (err) {
    logger.error('Error saving trip calculation:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to save trip calculation',
      details: err.data
    });
  }
});

/**
 * GET /api/trip-calculations/list
 * Retrieve all saved trip calculations.
 */
router.get('/list', async (req, res) => {
  try {
    const list = await pb.collection('trip_calculations').getFullList({
      sort: '-created',
      $autoCancel: false
    });
    return res.status(200).json({
      success: true,
      calculations: list
    });
  } catch (err) {
    logger.error('Error fetching trip calculations:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to retrieve calculations'
    });
  }
});

/**
 * DELETE /api/trip-calculations/:id
 * Delete a saved calculation.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pb.collection('trip_calculations').delete(id, { $autoCancel: false });
    return res.status(200).json({
      success: true,
      message: 'Trip calculation deleted successfully'
    });
  } catch (err) {
    logger.error('Error deleting trip calculation:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to delete calculation'
    });
  }
});

export default router;
