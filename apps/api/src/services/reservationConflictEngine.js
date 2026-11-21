import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

/**
 * In-memory mutex locks to serialize concurrent booking requests on the same truck.
 */
const truckLocks = new Map();

async function acquireLock(truckNumber, timeoutMs = 8000) {
  const start = Date.now();
  while (truckLocks.has(truckNumber)) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timeout waiting for concurrency lock on truck ${truckNumber}`);
    }
    await new Promise(r => setTimeout(r, 100));
  }
  truckLocks.set(truckNumber, Date.now());
}

function releaseLock(truckNumber) {
  truckLocks.delete(truckNumber);
}

function toEpoch(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.getTime();
}

/**
 * Checks whether a proposed time window overlaps with an existing time window.
 */
function intervalsOverlap(startA, endA, startB, endB) {
  const a0 = toEpoch(startA);
  const a1 = toEpoch(endA);
  const b0 = toEpoch(startB);
  const b1 = toEpoch(endB);
  if (!a0 || !a1 || !b0 || !b1) return false;
  return a0 < b1 && a1 > b0;
}

/**
 * Validates whether a truck is free and available for a proposed reservation window.
 * Checks:
 * 1. Confirmed reservations in `truck_reservations`
 * 2. Active maintenance blocks in `truck_availability_blocks`
 * 3. Active assigned trips in `trip_logs`
 */
export async function validateTruckReservationAvailability(truckNumber, startTime, endTime, excludeReservationId = null) {
  const requestedStart = toEpoch(startTime);
  const requestedEnd = toEpoch(endTime);

  if (!requestedStart || !requestedEnd || requestedEnd <= requestedStart) {
    return {
      available: false,
      reason: 'Invalid reservation time interval (end time must be after start time).'
    };
  }

  try {
    // 1. Check for overlapping confirmed reservations
    let resFilter = `truck_number = "${truckNumber}" && status = "Confirmed"`;
    if (excludeReservationId) {
      resFilter += ` && id != "${excludeReservationId}"`;
    }

    const confirmedReservations = await pb.collection('truck_reservations').getFullList({
      filter: resFilter,
      $autoCancel: false
    }).catch(() => []);

    for (const res of confirmedReservations) {
      const resFrom = res.reserved_from || res.loading_datetime;
      const resTo = res.reserved_to || res.expected_unloading_datetime;
      if (intervalsOverlap(requestedStart, requestedEnd, resFrom, resTo)) {
        return {
          available: false,
          conflictType: 'CONFIRMED_RESERVATION',
          conflictingBooking: res.booking_number,
          reason: `Truck ${truckNumber} is already confirmed for booking ${res.booking_number} from ${resFrom} to ${resTo}.`
        };
      }
    }

    // 2. Check for maintenance blocks or operational holds
    const blocks = await pb.collection('truck_availability_blocks').getFullList({
      filter: `truck_number = "${truckNumber}"`,
      $autoCancel: false
    }).catch(() => []);

    for (const b of blocks) {
      if (intervalsOverlap(requestedStart, requestedEnd, b.start_time, b.end_time)) {
        return {
          available: false,
          conflictType: 'MAINTENANCE_BLOCK',
          reason: `Truck ${truckNumber} is blocked for ${b.block_type} (${b.reason}) from ${b.start_time} to ${b.end_time}.`
        };
      }
    }

    // 3. Check for overlapping active trips
    const trips = await pb.collection('trip_logs').getFullList({
      filter: `truck_number = "${truckNumber}" && trip_status != "Cancelled"`,
      sort: '-date',
      $autoCancel: false
    }).catch(() => []);

    for (const trip of trips) {
      if (trip.trip_status === 'Completed') continue;
      const tripDate = trip.date;
      const tripEnd = trip.delivered_time || trip.delivery_eta || trip.date;
      if (intervalsOverlap(requestedStart, requestedEnd, tripDate, tripEnd)) {
        return {
          available: false,
          conflictType: 'ACTIVE_TRIP',
          conflictingTrip: trip.trip_id || trip.id,
          reason: `Truck ${truckNumber} is currently assigned to trip ${trip.trip_id || trip.id} (${trip.route || 'In Transit'}).`
        };
      }
    }

    return {
      available: true,
      truckNumber
    };
  } catch (err) {
    logger.error(`Error validating availability for truck ${truckNumber}:`, err.message);
    throw err;
  }
}

/**
 * Atomically reserves a truck with concurrency lock protection.
 */
export async function executeAtomicReservation(reservationPayload) {
  const truckNumber = reservationPayload.truck_number;
  if (!truckNumber) {
    throw new Error('Truck number is required for reservation allocation.');
  }

  await acquireLock(truckNumber);
  try {
    // Re-check immediately before creating or confirming
    const check = await validateTruckReservationAvailability(
      truckNumber,
      reservationPayload.reserved_from || reservationPayload.loading_datetime,
      reservationPayload.reserved_to || reservationPayload.expected_unloading_datetime,
      reservationPayload.id || null
    );

    if (!check.available) {
      const err = new Error(check.reason);
      err.conflictType = check.conflictType;
      err.status = 409;
      throw err;
    }

    // Perform database insertion / update
    let record;
    if (reservationPayload.id) {
      record = await pb.collection('truck_reservations').update(
        reservationPayload.id,
        reservationPayload,
        { $autoCancel: false }
      );
    } else {
      record = await pb.collection('truck_reservations').create(
        reservationPayload,
        { $autoCancel: false }
      );
    }

    return record;
  } finally {
    releaseLock(truckNumber);
  }
}
