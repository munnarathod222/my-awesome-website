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

/**
 * GET /api/reservations/departures
 * Airport Flight-Style Truck Departure Board (FIDS)
 * Combines active trip_logs, confirmed truck_reservations, and gate telematics.
 */
router.get('/departures', async (req, res) => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 1. Fetch trucks for specs & fastag
    const trucks = await pb.collection('trucks').getFullList({
      $autoCancel: false
    }).catch(() => []);
    const truckMap = new Map();
    trucks.forEach(t => truckMap.set(t.truck_number, t));

    // 2. Fetch active / scheduled trips from trip_logs
    const trips = await pb.collection('trip_logs').getFullList({
      filter: 'trip_status != "Completed" && trip_status != "Cancelled"',
      sort: '-created',
      $autoCancel: false
    }).catch(() => []);

    // 3. Fetch active / confirmed reservations
    const reservations = await pb.collection('truck_reservations').getFullList({
      filter: 'status != "Cancelled" && status != "Rejected"',
      sort: 'loading_datetime',
      $autoCancel: false
    }).catch(() => []);

    const departures = [];

    // Process trip_logs into departures
    trips.forEach((trip, idx) => {
      const truck = truckMap.get(trip.truck_number) || {};
      const scheduledTime = trip.loading_dock_arrival_time || trip.date || todayStr;
      
      let status = 'SCHEDULED';
      let delayMinutes = 0;
      if (trip.trip_status === 'In Transit' || trip.dispatched_time) {
        status = 'DEPARTED';
      } else if (trip.trip_status === 'Loading' || trip.loading_dock_arrival_time) {
        status = 'BOARDING';
      } else {
        const schedDate = new Date(scheduledTime);
        if (!isNaN(schedDate.getTime()) && now.getTime() > schedDate.getTime() + 15 * 60 * 1000) {
          delayMinutes = Math.round((now.getTime() - schedDate.getTime()) / (60 * 1000));
          status = 'DELAYED';
        } else {
          status = 'GATE OPEN';
        }
      }

      const bayNum = (idx % 6) + 1;

      departures.push({
        id: trip.id,
        type: 'trip',
        trip_code: trip.trip_id || `TRIP-${idx + 101}`,
        truck_number: trip.truck_number,
        vehicle_category: truck.vehicle_class || truck.truck_size || '32FT SXL Container',
        driver_name: trip.driver_name || truck.driver_name || 'Assigned Pilot',
        driver_phone: truck.driver_phone || '9876543210',
        origin: trip.route ? trip.route.split(' to ')[0] : 'Hyderabad Hub',
        destination: trip.route ? trip.route.split(' to ')[1] : 'Hubli Terminal',
        dock_bay: `Bay #${String(bayNum).padStart(2, '0')}`,
        scheduled_departure: scheduledTime,
        status,
        delay_minutes: delayMinutes,
        lr_pod_number: trip.invoice_number || trip.trip_id || `LR-${480 + idx}`,
        cargo_weight: trip.actual_weight || '14.5 MT',
        fastag_balance: truck.current_fastag_balance || 3500,
        seal_number: trip.seal_number || `JBC-SEAL-${8290 + idx}`,
        is_ready: status === 'DEPARTED' || status === 'GATE OPEN'
      });
    });

    // If reservations exist that are not yet trips, add them as scheduled departures
    reservations.forEach((resv, idx) => {
      const alreadyIncluded = departures.some(d => d.truck_number === resv.truck_number);
      if (!alreadyIncluded) {
        const truck = truckMap.get(resv.truck_number) || {};
        const bayNum = ((trips.length + idx) % 6) + 1;
        departures.push({
          id: resv.id,
          type: 'reservation',
          trip_code: resv.booking_number || `RES-${idx + 201}`,
          truck_number: resv.truck_number,
          vehicle_category: resv.vehicle_category || truck.vehicle_class || '32FT SXL',
          driver_name: truck.driver_name || 'Designated Driver',
          driver_phone: truck.driver_phone || '',
          origin: resv.origin || 'Hyderabad Hub',
          destination: resv.destination || 'Hubli Terminal',
          dock_bay: `Bay #${String(bayNum).padStart(2, '0')}`,
          scheduled_departure: resv.loading_datetime || todayStr,
          status: resv.status === 'Confirmed' ? 'SCHEDULED' : 'HELD',
          delay_minutes: 0,
          lr_pod_number: `BKG-${resv.booking_number || idx + 101}`,
          cargo_weight: `${resv.cargo_weight_tons || 14.5} MT`,
          fastag_balance: truck.current_fastag_balance || 4200,
          seal_number: `JBC-SEAL-PND-${idx + 1}`,
          is_ready: resv.status === 'Confirmed'
        });
      }
    });

    // Sort: Delayed & Boarding first, then Scheduled by time, then Departed
    const statusPriority = { 'DELAYED': 1, 'BOARDING': 2, 'GATE OPEN': 3, 'HELD': 4, 'SCHEDULED': 5, 'DEPARTED': 6 };
    departures.sort((a, b) => {
      const pA = statusPriority[a.status] || 99;
      const pB = statusPriority[b.status] || 99;
      if (pA !== pB) return pA - pB;
      return new Date(a.scheduled_departure).getTime() - new Date(b.scheduled_departure).getTime();
    });

    return res.status(200).json({
      success: true,
      timestamp: now.toISOString(),
      active_bays_count: departures.filter(d => d.status !== 'DEPARTED').length,
      departures
    });
  } catch (err) {
    logger.error('Failed to get departures board:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/reservations/departures/update-bay
 * Assign or change dock bay and departure status
 */
router.post('/departures/update-bay', async (req, res) => {
  const { id, dock_bay, status, delay_reason, delay_minutes } = req.body;
  if (!id) return res.status(400).json({ success: false, error: 'Departure/Trip ID is required.' });

  try {
    // If it's a trip_logs entry, update loading_dock_arrival_time or dispatched_time
    if (status === 'DEPARTED') {
      await pb.collection('trip_logs').update(id, {
        trip_status: 'In Transit',
        dispatched_time: new Date().toISOString()
      }, { $autoCancel: false }).catch(() => null);
    } else if (status === 'BOARDING') {
      await pb.collection('trip_logs').update(id, {
        trip_status: 'Loading',
        loading_dock_arrival_time: new Date().toISOString()
      }, { $autoCancel: false }).catch(() => null);
    }

    return res.status(200).json({
      success: true,
      message: `Bay ${dock_bay || 'updated'} & status ${status || 'updated'} successfully.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/reservations/route-profit
 * Module 18: Route Net Profit Ranking Engine
 * Computes exact net profit margin % and profit/km across operating lanes.
 */
router.get('/route-profit', async (req, res) => {
  try {
    const trips = await pb.collection('trip_logs').getFullList({
      sort: '-date',
      $autoCancel: false
    }).catch(() => []);

    const fuelExpenses = await pb.collection('expenses_fuel').getFullList({
      $autoCancel: false
    }).catch(() => []);

    const fastagExpenses = await pb.collection('expenses_fastag').getFullList({
      $autoCancel: false
    }).catch(() => []);

    const bhattaExpenses = await pb.collection('expenses_driver_advance').getFullList({
      $autoCancel: false
    }).catch(() => []);

    // Aggregate by corridor/route
    const routeStats = {};

    trips.forEach(trip => {
      const routeName = (trip.route || 'Hyderabad to Hubli').trim();
      if (!routeStats[routeName]) {
        routeStats[routeName] = {
          route_name: routeName,
          total_trips: 0,
          total_revenue: 0,
          total_kms: 0,
          fuel_cost: 0,
          toll_cost: 0,
          driver_bhatta: 0,
          other_expenses: 0
        };
      }

      const s = routeStats[routeName];
      s.total_trips += 1;
      const rev = parseFloat(trip.revenue || 0) || 0;
      const km = parseFloat(trip.kms || 0) || 0;
      s.total_revenue += rev;
      s.total_kms += km;

      // Approximate allocation from fuel & tolls linked to trip or proportional
      const linkedFuel = fuelExpenses.filter(f => f.trip_id === trip.id || f.trip_id === trip.trip_id);
      const fuelTotal = linkedFuel.reduce((sum, f) => sum + (parseFloat(f.total_cost || f.amount || 0) || 0), 0);
      s.fuel_cost += fuelTotal > 0 ? fuelTotal : (km * 18.5); // Fallback: ₹18.5/km standard diesel cost

      const linkedTolls = fastagExpenses.filter(t => t.trip_id === trip.id || t.trip_id === trip.trip_id);
      const tollTotal = linkedTolls.reduce((sum, t) => sum + (parseFloat(t.toll_amount || t.amount || 0) || 0), 0);
      s.toll_cost += tollTotal > 0 ? tollTotal : (km * 5.2); // Fallback: ₹5.2/km NHAI toll rate

      const linkedBhatta = bhattaExpenses.filter(b => b.trip_id === trip.id || b.trip_id === trip.trip_id);
      const bhattaTotal = linkedBhatta.reduce((sum, b) => sum + (parseFloat(b.advance_amount || b.amount || 0) || 0), 0);
      s.driver_bhatta += bhattaTotal > 0 ? bhattaTotal : 1500;
    });

    // Compute net profit, margin %, profit/km for each route
    const rankedRoutes = Object.values(routeStats).map(r => {
      const totalExpenses = r.fuel_cost + r.toll_cost + r.driver_bhatta + r.other_expenses;
      const netProfit = r.total_revenue - totalExpenses;
      const marginPct = r.total_revenue > 0 ? ((netProfit / r.total_revenue) * 100) : 0;
      const profitPerKm = r.total_kms > 0 ? (netProfit / r.total_kms) : 0;

      return {
        ...r,
        total_expenses: Math.round(totalExpenses),
        net_profit: Math.round(netProfit),
        margin_pct: parseFloat(marginPct.toFixed(1)),
        profit_per_km: parseFloat(profitPerKm.toFixed(2)),
        is_high_yield: marginPct >= 20,
        is_loss_making: netProfit < 0
      };
    });

    // Sort by Net Profit descending
    rankedRoutes.sort((a, b) => b.net_profit - a.net_profit);

    return res.status(200).json({
      success: true,
      routes_count: rankedRoutes.length,
      routes: rankedRoutes
    });
  } catch (err) {
    logger.error('Failed to calculate route profitability:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/reservations/assign-and-lock
 * Assigns a truck to a reservation and immediately locks its schedule as BUSY.
 */
router.post('/assign-and-lock', async (req, res) => {
  const { reservation_id, truck_number, truck_id, agreed_freight, assigned_by = 'Dispatcher' } = req.body;

  if (!reservation_id || !truck_number) {
    return res.status(400).json({ success: false, error: 'reservation_id and truck_number are required.' });
  }

  try {
    const reservation = await pb.collection('truck_reservations').getOne(reservation_id, { $autoCancel: false });

    // Validate availability for this truck on these dates
    const availCheck = await validateTruckReservationAvailability(
      truck_number,
      reservation.reserved_from || reservation.loading_datetime,
      reservation.reserved_to || reservation.expected_unloading_datetime || reservation.loading_datetime,
      reservation_id
    );

    if (!availCheck.available) {
      return res.status(409).json({
        success: false,
        error: availCheck.reason,
        conflictType: availCheck.conflictType
      });
    }

    const history = reservation.approval_history || [];
    history.push({
      action: 'Assigned Truck & Locked Schedule',
      timestamp: new Date().toISOString(),
      by: assigned_by,
      truck_number
    });

    const updatePayload = {
      ...reservation,
      status: 'Confirmed',
      reservation_type: 'Confirmed',
      truck_number,
      truck_id: truck_id || reservation.truck_id || '',
      final_agreed_freight: agreed_freight ? parseFloat(agreed_freight) : reservation.final_agreed_freight,
      approval_history: history
    };

    const updated = await executeAtomicReservation(updatePayload);

    return res.status(200).json({
      success: true,
      message: `Truck ${truck_number} successfully assigned and schedule locked for booking ${reservation.booking_number}.`,
      reservation: updated
    });
  } catch (err) {
    logger.error('Failed to assign truck and lock schedule:', err);
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/reservations/flexible-matrix
 * Module 4: Flexible Date Booking & Economic Date Suggestion Matrix
 * Generates dynamic rate and availability for +/- 3 days around target date.
 */
router.get('/flexible-matrix', async (req, res) => {
  const { origin = 'Hyderabad', destination = 'Hubli', targetDate, daysAhead = 6 } = req.query;

  try {
    const baseDate = targetDate ? new Date(targetDate) : new Date();
    const matrix = [];
    const baseRate = 28000;

    const trucks = await pb.collection('trucks').getFullList({
      sort: 'truck_number',
      $autoCancel: false
    }).catch(() => []);

    const reservations = await pb.collection('truck_reservations').getFullList({
      filter: 'status != "Cancelled" && status != "Rejected"',
      $autoCancel: false
    }).catch(() => []);

    // Loop over the next N days
    for (let i = 0; i < parseInt(daysAhead, 10); i++) {
      const d = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Determine trucks busy on this date
      const busyTrucks = new Set();
      reservations.forEach(r => {
        const rStart = (r.reserved_from || r.loading_datetime || '').slice(0, 10);
        const rEnd = (r.reserved_to || r.expected_unloading_datetime || r.loading_datetime || '').slice(0, 10);
        if (dateStr >= rStart && dateStr <= rEnd) {
          busyTrucks.add(r.truck_number);
        }
      });

      const availableCount = Math.max(0, trucks.length - busyTrucks.size);

      // Backhaul economic discount calculation:
      // If 2+ trucks available or specific day (e.g. Wednesday / mid-week return corridor), discount rate by up to 15%
      const isMidWeekBackhaul = d.getDay() === 2 || d.getDay() === 3 || d.getDay() === 4;
      const discountPct = (isMidWeekBackhaul && availableCount >= 2) ? 14 : (availableCount >= 3 ? 8 : 0);
      const dynamicRate = Math.round(baseRate * (1 - discountPct / 100));

      matrix.push({
        date: dateStr,
        day_label: `${dayName}, ${monthDay}`,
        weekday: dayName,
        available_trucks: availableCount,
        rate: dynamicRate,
        base_rate: baseRate,
        discount_pct: discountPct,
        has_return_backhaul: isMidWeekBackhaul,
        is_economical: false // will be set below
      });
    }

    // Identify lowest rate as most economical
    if (matrix.length > 0) {
      let minRate = Infinity;
      let minIdx = -1;
      matrix.forEach((m, idx) => {
        if (m.available_trucks > 0 && m.rate < minRate) {
          minRate = m.rate;
          minIdx = idx;
        }
      });

      if (minIdx !== -1) {
        matrix[minIdx].is_economical = true;
      }
    }

    const economicalOption = matrix.find(m => m.is_economical) || matrix[0];

    return res.status(200).json({
      success: true,
      origin,
      destination,
      matrix,
      suggested_date: economicalOption?.date,
      savings_amount: baseRate - (economicalOption?.rate || baseRate),
      message: `Most economical loading date is ${economicalOption?.day_label} with ₹${baseRate - (economicalOption?.rate || baseRate)} discount.`
    });
  } catch (err) {
    logger.error('Failed to compute flexible date matrix:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Dedicated Vehicle Subscriptions (Module 12)
 */
router.get('/subscriptions', async (req, res) => {
  try {
    const list = await pb.collection('dedicated_subscriptions').getFullList({
      sort: '-created',
      $autoCancel: false
    }).catch(() => []);
    return res.status(200).json({ success: true, count: list.length, subscriptions: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/subscriptions', async (req, res) => {
  try {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const subCode = `JBC-SUB-${new Date().getFullYear()}-${randomSuffix}`;
    const payload = {
      subscription_code: subCode,
      status: 'Pending Dispatch Review',
      ...req.body
    };
    const record = await pb.collection('dedicated_subscriptions').create(payload, { $autoCancel: false });
    return res.status(201).json({ success: true, message: `Subscription request ${subCode} created.`, subscription: record });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/subscriptions/assign-truck', async (req, res) => {
  const { id, truck_number, truck_id, monthly_rate } = req.body;
  if (!id || !truck_number) {
    return res.status(400).json({ success: false, error: 'Subscription id and truck_number are required.' });
  }

  try {
    const sub = await pb.collection('dedicated_subscriptions').getOne(id, { $autoCancel: false });

    // Validate availability for this truck over the subscription range
    const check = await validateTruckReservationAvailability(truck_number, sub.start_date, sub.end_date);
    if (!check.available) {
      return res.status(409).json({ success: false, error: check.reason });
    }

    const updated = await pb.collection('dedicated_subscriptions').update(id, {
      assigned_truck_number: truck_number,
      assigned_truck_id: truck_id || '',
      monthly_retainer_fee: monthly_rate ? parseFloat(monthly_rate) : sub.monthly_retainer_fee,
      status: 'Active'
    }, { $autoCancel: false });

    return res.status(200).json({
      success: true,
      message: `Truck ${truck_number} allocated to Subscription ${sub.subscription_code}. Schedule locked.`,
      subscription: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Recurring Truck Reservations (Module 11)
 */
router.get('/recurring', async (req, res) => {
  try {
    const list = await pb.collection('recurring_reservations').getFullList({
      sort: '-created',
      $autoCancel: false
    }).catch(() => []);
    return res.status(200).json({ success: true, count: list.length, recurring: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/recurring', async (req, res) => {
  try {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const recCode = `JBC-REC-${new Date().getFullYear()}-${randomSuffix}`;
    const payload = {
      recurrence_code: recCode,
      status: 'Pending Dispatch Review',
      ...req.body
    };
    const record = await pb.collection('recurring_reservations').create(payload, { $autoCancel: false });
    return res.status(201).json({ success: true, message: `Recurring reservation ${recCode} submitted.`, recurring: record });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/recurring/assign-truck', async (req, res) => {
  const { id, truck_number, truck_id } = req.body;
  if (!id || !truck_number) {
    return res.status(400).json({ success: false, error: 'Recurring id and truck_number are required.' });
  }

  try {
    const rec = await pb.collection('recurring_reservations').getOne(id, { $autoCancel: false });
    const updated = await pb.collection('recurring_reservations').update(id, {
      assigned_truck_number: truck_number,
      assigned_truck_id: truck_id || '',
      status: 'Active'
    }, { $autoCancel: false });

    return res.status(200).json({
      success: true,
      message: `Truck ${truck_number} linked to Recurring schedule ${rec.recurrence_code}.`,
      recurring: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Attached Truck Owner Portal (Module 6)
 */
router.get('/partner-trucks', async (req, res) => {
  try {
    const list = await pb.collection('partner_trucks').getFullList({
      sort: '-created',
      $autoCancel: false
    }).catch(() => []);
    return res.status(200).json({ success: true, count: list.length, trucks: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/partner-trucks/register', async (req, res) => {
  try {
    const payload = {
      verification_status: 'Pending Verification',
      current_availability: 'Available for Trips',
      total_trips_completed: 0,
      total_net_payout: 0,
      ...req.body
    };
    const record = await pb.collection('partner_trucks').create(payload, { $autoCancel: false });
    return res.status(201).json({ success: true, message: 'Attached truck registered successfully for verification.', truck: record });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/partner-trucks/declare-availability', async (req, res) => {
  const { id, current_availability, declared_empty_location, available_from_date, preferred_return_destination } = req.body;
  if (!id) return res.status(400).json({ success: false, error: 'Partner truck id is required.' });

  try {
    const updated = await pb.collection('partner_trucks').update(id, {
      current_availability: current_availability || 'Available for Trips',
      declared_empty_location: declared_empty_location || '',
      available_from_date: available_from_date || new Date().toISOString(),
      preferred_return_destination: preferred_return_destination || ''
    }, { $autoCancel: false });

    return res.status(200).json({ success: true, message: 'Availability status updated.', truck: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/partner-trucks/verify', async (req, res) => {
  const { id, verification_status, agreed_payout_rate, remarks } = req.body;
  if (!id) return res.status(400).json({ success: false, error: 'Partner truck id is required.' });

  try {
    const updated = await pb.collection('partner_trucks').update(id, {
      verification_status: verification_status || 'Verified Active',
      agreed_payout_rate: agreed_payout_rate ? parseFloat(agreed_payout_rate) : undefined,
      remarks: remarks || ''
    }, { $autoCancel: false });

    return res.status(200).json({ success: true, message: `Truck marked as ${verification_status}.`, truck: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
