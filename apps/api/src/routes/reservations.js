import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { calculateFleetForecastMatrix, calculateTruckForecast } from '../services/predictiveMovementEngine.js';
import { validateTruckReservationAvailability, executeAtomicReservation } from '../services/reservationConflictEngine.js';
import { matchTrucksForBooking } from '../services/availabilityMatchingEngine.js';
import { identifyReturnLoadOpportunities } from '../services/returnLoadEngine.js';

const router = express.Router();

/**
 * GET /api/reservations/calendar
 * Returns timeline and scheduling matrix for every registered truck across daily, weekly, monthly views.
 */
router.get('/calendar', async (req, res) => {
  const { startDate, endDate, view = 'weekly' } = req.query;

  try {
    const trucks = await pb.collection('trucks').getFullList({
      sort: 'truck_number',
      $autoCancel: false
    });

    const forecasts = await calculateFleetForecastMatrix();

    // Fetch confirmed & active reservations in range
    const reservations = await pb.collection('truck_reservations').getFullList({
      filter: 'status != "Cancelled" && status != "Rejected"',
      sort: '-loading_datetime',
      $autoCancel: false
    }).catch(() => []);

    // Fetch manual availability blocks
    const blocks = await pb.collection('truck_availability_blocks').getFullList({
      sort: '-start_time',
      $autoCancel: false
    }).catch(() => []);

    // Build timeline matrix per truck
    const timeline = trucks.map(truck => {
      const forecast = forecasts.find(f => f.truck_number === truck.truck_number) || {};
      const truckReservations = reservations.filter(r => r.truck_number === truck.truck_number);
      const truckBlocks = blocks.filter(b => b.truck_number === truck.truck_number);

      return {
        truck_id: truck.id,
        truck_number: truck.truck_number,
        vehicle_category: truck.vehicle_class || truck.truck_size || '32FT SXL',
        capacity_tons: truck.truck_size === '32FT MXL' ? 18.5 : 14.5,
        current_status: forecast.prediction_status || 'Available',
        current_location: forecast.current_location || 'Hyderabad Hub',
        predicted_location: forecast.predicted_location || 'Hyderabad Hub',
        expected_destination: forecast.expected_destination,
        estimated_arrival: forecast.estimated_arrival,
        expected_unloading_completed: forecast.expected_unloading_completed,
        earliest_next_departure: forecast.earliest_next_departure,
        prediction_confidence: forecast.prediction_confidence || 85,
        reservations: truckReservations,
        blocks: truckBlocks
      };
    });

    return res.status(200).json({
      success: true,
      view,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || null,
      total_fleet: trucks.length,
      timeline
    });
  } catch (err) {
    logger.error('Error fetching fleet calendar:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate fleet calendar'
    });
  }
});

/**
 * GET /api/reservations/forecasts
 * Returns live predictive movement forecasts for all trucks.
 */
router.get('/forecasts', async (req, res) => {
  const { targetDate } = req.query;
  try {
    const matrix = await calculateFleetForecastMatrix(targetDate);
    return res.status(200).json({
      success: true,
      targetDate: targetDate || new Date().toISOString(),
      trucksCount: matrix.length,
      forecasts: matrix
    });
  } catch (err) {
    logger.error('Error fetching forecasts:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch forecasts'
    });
  }
});

/**
 * POST /api/reservations/search
 * Intelligent availability search for dispatchers and customers.
 */
router.post('/search', async (req, res) => {
  const {
    origin,
    destination,
    loadingDatetime,
    vehicleCategory,
    cargoWeightTons,
    maxDeadheadKm
  } = req.body;

  if (!origin || !destination || !loadingDatetime) {
    return res.status(400).json({
      success: false,
      error: 'origin, destination, and loadingDatetime are required fields.'
    });
  }

  try {
    const matches = await matchTrucksForBooking({
      origin,
      destination,
      loadingDatetime,
      vehicleCategory,
      cargoWeightTons: parseFloat(cargoWeightTons) || 14.0,
      maxDeadheadKm: parseInt(maxDeadheadKm, 10) || 250
    });

    return res.status(200).json({
      success: true,
      query: { origin, destination, loadingDatetime, vehicleCategory },
      total_matches: matches.length,
      available_count: matches.filter(m => m.is_feasible).length,
      results: matches
    });
  } catch (err) {
    logger.error('Error in availability search:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Search execution failed'
    });
  }
});

/**
 * GET /api/reservations/list
 * Returns existing reservations.
 */
router.get('/list', async (req, res) => {
  const { status, truckNumber, customerId } = req.query;

  try {
    const filters = [];
    if (status) filters.push(`status = "${status}"`);
    if (truckNumber) filters.push(`truck_number = "${truckNumber}"`);
    if (customerId) filters.push(`customer_id = "${customerId}"`);

    const filterStr = filters.join(' && ');

    const reservations = await pb.collection('truck_reservations').getFullList({
      filter: filterStr || undefined,
      sort: '-created',
      $autoCancel: false
    });

    return res.status(200).json({
      success: true,
      count: reservations.length,
      reservations
    });
  } catch (err) {
    logger.error('Error listing reservations:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to list reservations'
    });
  }
});

/**
 * POST /api/reservations/book
 * Submits a new reservation (Confirmed, Provisional, or Booking Request) with atomic conflict protection.
 */
router.post('/book', async (req, res) => {
  const payload = req.body;

  if (!payload.customer_name || !payload.customer_phone || !payload.origin || !payload.destination || !payload.loading_datetime) {
    return res.status(400).json({
      success: false,
      error: 'Missing mandatory reservation parameters (customer_name, customer_phone, origin, destination, loading_datetime).'
    });
  }

  try {
    // Generate unique booking number: JBC-RES-YYYY-XXXXX
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingNumber = `JBC-RES-${year}-${randomSuffix}`;

    const reservationType = payload.reservation_type || (payload.truck_number ? 'Confirmed' : 'Booking Request');
    const status = payload.status || (reservationType === 'Confirmed' ? 'Confirmed' : 'Pending');

    const reservationData = {
      booking_number: bookingNumber,
      reservation_type: reservationType,
      status: status,
      customer_id: payload.customer_id || '',
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      customer_email: payload.customer_email || '',
      truck_id: payload.truck_id || '',
      truck_number: payload.truck_number || '',
      vehicle_category: payload.vehicle_category || '32FT SXL',
      origin: payload.origin,
      destination: payload.destination,
      loading_datetime: payload.loading_datetime,
      expected_unloading_datetime: payload.expected_unloading_datetime || '',
      reserved_from: payload.reserved_from || payload.loading_datetime,
      reserved_to: payload.reserved_to || payload.expected_unloading_datetime || payload.loading_datetime,
      cargo_weight_tons: parseFloat(payload.cargo_weight_tons) || 14.0,
      cargo_description: payload.cargo_description || 'General Commercial Cargo',
      special_requirements: payload.special_requirements || '',
      indicative_freight: parseFloat(payload.indicative_freight) || 0.0,
      final_agreed_freight: parseFloat(payload.final_agreed_freight) || parseFloat(payload.indicative_freight) || 0.0,
      payment_status: payload.payment_status || 'Pending',
      advance_amount: parseFloat(payload.advance_amount) || 0.0,
      linked_trip_id: payload.linked_trip_id || '',
      upstream_trip_id: payload.upstream_trip_id || '',
      match_score: payload.match_score || 90,
      approval_history: [{
        action: 'Created',
        timestamp: new Date().toISOString(),
        by: payload.created_by || 'Customer'
      }],
      created_by: payload.created_by || 'Customer'
    };

    let savedReservation;
    if (reservationData.truck_number && reservationData.status === 'Confirmed') {
      // Execute with atomic concurrency mutex lock
      savedReservation = await executeAtomicReservation(reservationData);
    } else {
      savedReservation = await pb.collection('truck_reservations').create(reservationData, { $autoCancel: false });
    }

    return res.status(201).json({
      success: true,
      message: `Reservation ${bookingNumber} recorded successfully.`,
      reservation: savedReservation
    });
  } catch (err) {
    logger.error('Error creating reservation:', err.message);
    const statusCode = err.status || 500;
    return res.status(statusCode).json({
      success: false,
      conflictType: err.conflictType || null,
      error: err.message || 'Reservation booking failed.'
    });
  }
});

/**
 * POST /api/reservations/approve/:id
 * Dispatcher approves and allocates a truck to a pending request.
 */
router.post('/approve/:id', async (req, res) => {
  const { id } = req.params;
  const { truck_number, agreed_freight, approved_by = 'Dispatcher' } = req.body;

  if (!truck_number) {
    return res.status(400).json({ success: false, error: 'truck_number is required for allocation.' });
  }

  try {
    const existing = await pb.collection('truck_reservations').getOne(id, { $autoCancel: false });

    // Validate availability for this truck
    const availCheck = await validateTruckReservationAvailability(
      truck_number,
      existing.reserved_from || existing.loading_datetime,
      existing.reserved_to || existing.expected_unloading_datetime || existing.loading_datetime,
      id
    );

    if (!availCheck.available) {
      return res.status(409).json({ success: false, error: availCheck.reason });
    }

    const history = existing.approval_history || [];
    history.push({
      action: 'Approved & Allocated',
      timestamp: new Date().toISOString(),
      by: approved_by,
      truck_number
    });

    const updatePayload = {
      ...existing,
      status: 'Confirmed',
      truck_number,
      final_agreed_freight: agreed_freight ? parseFloat(agreed_freight) : existing.final_agreed_freight,
      approval_history: history
    };

    const updated = await executeAtomicReservation(updatePayload);

    return res.status(200).json({
      success: true,
      message: `Reservation ${existing.booking_number} approved and allocated to truck ${truck_number}.`,
      reservation: updated
    });
  } catch (err) {
    logger.error(`Error approving reservation ${id}:`, err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/reservations/reject/:id
 * Rejects a reservation with a mandatory documented reason.
 */
router.post('/reject/:id', async (req, res) => {
  const { id } = req.params;
  const { reason, rejected_by = 'Dispatcher' } = req.body;

  if (!reason) {
    return res.status(400).json({ success: false, error: 'Rejection reason is required.' });
  }

  try {
    const existing = await pb.collection('truck_reservations').getOne(id, { $autoCancel: false });

    const history = existing.approval_history || [];
    history.push({
      action: 'Rejected',
      timestamp: new Date().toISOString(),
      by: rejected_by,
      reason
    });

    const updated = await pb.collection('truck_reservations').update(id, {
      status: 'Rejected',
      rejection_reason: reason,
      approval_history: history
    }, { $autoCancel: false });

    return res.status(200).json({
      success: true,
      message: `Reservation ${existing.booking_number} rejected.`,
      reservation: updated
    });
  } catch (err) {
    logger.error(`Error rejecting reservation ${id}:`, err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Availability Blocks: CRUD
 */
router.get('/blocks', async (req, res) => {
  try {
    const blocks = await pb.collection('truck_availability_blocks').getFullList({
      sort: '-start_time',
      $autoCancel: false
    });
    return res.status(200).json({ success: true, count: blocks.length, blocks });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/blocks', async (req, res) => {
  const { truck_number, block_type, reason, start_time, end_time, created_by } = req.body;
  if (!truck_number || !block_type || !reason || !start_time || !end_time) {
    return res.status(400).json({
      success: false,
      error: 'truck_number, block_type, reason, start_time, and end_time are required.'
    });
  }

  try {
    const block = await pb.collection('truck_availability_blocks').create({
      truck_number,
      block_type,
      reason,
      start_time,
      end_time,
      created_by: created_by || 'Admin'
    }, { $autoCancel: false });

    return res.status(201).json({
      success: true,
      message: `Truck ${truck_number} blocked for ${block_type}.`,
      block
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/blocks/:id', async (req, res) => {
  try {
    await pb.collection('truck_availability_blocks').delete(req.params.id, { $autoCancel: false });
    return res.status(200).json({ success: true, message: 'Block removed.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/reservations/return-loads
 * Returns high-yield backhaul load opportunities for trucks finishing trips in outer hubs.
 */
router.get('/return-loads', async (req, res) => {
  try {
    const opportunities = await identifyReturnLoadOpportunities();
    return res.status(200).json({
      success: true,
      count: opportunities.length,
      opportunities
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
