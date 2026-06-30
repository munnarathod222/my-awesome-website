import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /trucks/availability
 * Query active trip logs on a given date to find already assigned trucks.
 */
router.get('/availability', async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      error: 'date query parameter is required'
    });
  }

  try {
    // Filter active trip logs on the specific date.
    // Exclude 'Cancelled' trips from the conflict check.
    const filterString = `date >= "${date} 00:00:00" && date <= "${date} 23:59:59" && trip_status != "Cancelled"`;

    logger.info(`Fetching truck availability for date: ${date} using filter: ${filterString}`);

    const trips = await pb.collection('trip_logs').getFullList({
      filter: filterString,
      $autoCancel: false
    });

    const counts = {};
    const assignedTrucks = [];

    trips.forEach(trip => {
      if (trip.truck_number) {
        counts[trip.truck_number] = (counts[trip.truck_number] || 0) + 1;
        if (!assignedTrucks.includes(trip.truck_number)) {
          assignedTrucks.push(trip.truck_number);
        }
      }
    });

    return res.status(200).json({
      success: true,
      date,
      assignedTrucks,
      counts,
      trips
    });
  } catch (err) {
    logger.error(`Error checking truck availability on ${date}:`, err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to check truck availability'
    });
  }
});

export default router;
