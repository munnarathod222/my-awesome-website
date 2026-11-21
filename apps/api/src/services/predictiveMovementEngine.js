import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import path from 'path';
import fs from 'fs';

/**
 * Standard Indian highway speed benchmark for 32FT SXL / heavy freight.
 * Average speed: ~40-45 km/h factoring checkpoints, tolls, and ghats.
 */
const AVERAGE_SPEED_KMH = 42;

/**
 * Standard SLA duration buffers (in hours).
 */
const DEFAULT_LOADING_HOURS = 3.5;
const DEFAULT_UNLOADING_HOURS = 4.0;
const MANDATORY_DRIVER_REST_INTERVAL_HOURS = 6.0;

function toEpoch(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.getTime();
}

/**
 * Robust database reader: Tries PocketBase HTTP first; falls back to dynamic sqlite if available.
 */
export async function queryCollection(collectionName, filter = null, sort = null) {
  try {
    const list = await pb.collection(collectionName).getFullList({
      filter: filter || undefined,
      sort: sort || undefined,
      $autoCancel: false
    });
    return list;
  } catch (err) {
    try {
      const dbPaths = [
        path.resolve(process.cwd(), 'apps/pocketbase/pb_data/data.db'),
        path.resolve(process.cwd(), 'pocketbase/pb_data/data.db')
      ];
      const foundPath = dbPaths.find(p => fs.existsSync(p));
      if (foundPath) {
        let sqliteMod = null;
        try {
          sqliteMod = await import('node:sqlite');
        } catch (_) {}
        if (sqliteMod && sqliteMod.DatabaseSync) {
          const db = new sqliteMod.DatabaseSync(foundPath);
          return db.prepare(`SELECT * FROM ${collectionName}`).all();
        }
      }
    } catch (_) {}
    return [];
  }
}

/**
 * Predictive Truck Movement Engine
 * Analyzes real truck records, active trip logs, route distances, maintenance blocks,
 * and compliance documents to forecast truck locations and availability without synthetic GPS.
 */
export async function calculateTruckForecast(truck, targetDateTime = null, options = {}) {
  const truckNumber = truck.truck_number;
  const now = targetDateTime ? new Date(targetDateTime).getTime() : Date.now();

  try {
    // 1. Fetch trips for this truck
    const allTrips = await queryCollection('trip_logs');
    const trips = allTrips
      .filter(t => t.truck_number === truckNumber && t.trip_status !== 'Cancelled')
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // 2. Fetch active maintenance blocks or operational holds
    const allBlocks = await queryCollection('truck_availability_blocks');
    const blocks = allBlocks.filter(b => b.truck_number === truckNumber);

    // 3. Fetch compliance documents for document expiry check
    const allDocs = await queryCollection('truck_documents');
    const docs = allDocs.filter(d => d.truck_id === truck.id || d.truck_number === truckNumber);

    let hasExpiredDocs = false;
    let expiredDocName = '';
    const todayStr = new Date().toISOString().slice(0, 10);
    for (const doc of docs) {
      if (doc.expiry_date && doc.expiry_date < todayStr) {
        hasExpiredDocs = true;
        expiredDocName = doc.document_type || doc.document_name || 'Document';
        break;
      }
    }

    // 4. Check active maintenance block
    let activeBlock = null;
    for (const b of blocks) {
      const bStart = toEpoch(b.start_time);
      const bEnd = toEpoch(b.end_time);
      if (bStart && bEnd && now >= bStart && now <= bEnd) {
        activeBlock = b;
        break;
      }
    }

    // 5. Evaluate active trip
    const activeTrip = trips.find(t => 
      t.trip_status === 'In Transit' ||
      t.trip_status === 'Dispatched' ||
      t.trip_status === 'Loading' ||
      t.trip_status === 'Arrived at Dock' ||
      (t.trip_status === 'Created' && !t.delivered_time)
    ) || trips[0];

    let status = 'Available';
    let currentLocation = 'Hyderabad Hub (Primary Depot)';
    let predictedLocation = 'Hyderabad Hub (Primary Depot)';
    let expectedDestination = null;
    let estimatedArrival = null;
    let expectedUnloadingCompleted = null;
    let earliestNextDeparture = null;
    let confidence = 85;
    const dataSources = ['fleet_registry'];

    if (activeBlock) {
      status = activeBlock.block_type === 'Breakdown' ? 'Breakdown' : 'Maintenance';
      currentLocation = `Workshop (${activeBlock.reason || activeBlock.block_type})`;
      predictedLocation = currentLocation;
      confidence = 95;
      dataSources.push('truck_availability_blocks');
      expectedUnloadingCompleted = activeBlock.end_time;
      earliestNextDeparture = activeBlock.end_time;
    } else if (hasExpiredDocs) {
      status = 'Documents Expired';
      currentLocation = `Yard (Expired: ${expiredDocName})`;
      predictedLocation = currentLocation;
      confidence = 90;
      dataSources.push('truck_documents');
    } else if (activeTrip && activeTrip.trip_status !== 'Completed') {
      dataSources.push('trip_logs');
      const origin = activeTrip.route ? activeTrip.route.split(' to ')[0] : (activeTrip.origin || 'Hyderabad');
      const destination = activeTrip.route ? activeTrip.route.split(' to ')[1] : (activeTrip.destination || 'Hubli');
      expectedDestination = destination;

      const kms = parseFloat(activeTrip.kms) || 450;
      const transitHours = kms / AVERAGE_SPEED_KMH;
      const tripStartTime = toEpoch(activeTrip.dispatched_time || activeTrip.date) || now;

      const arrivalEpoch = tripStartTime + (transitHours * 3600 * 1000);
      const unloadingEpoch = arrivalEpoch + (DEFAULT_UNLOADING_HOURS * 3600 * 1000);
      const nextDepartureEpoch = unloadingEpoch + (MANDATORY_DRIVER_REST_INTERVAL_HOURS * 3600 * 1000);

      estimatedArrival = new Date(arrivalEpoch).toISOString();
      expectedUnloadingCompleted = new Date(unloadingEpoch).toISOString();
      earliestNextDeparture = new Date(nextDepartureEpoch).toISOString();

      if (now < tripStartTime) {
        status = 'Loading';
        currentLocation = origin;
        predictedLocation = origin;
        confidence = 88;
      } else if (now < arrivalEpoch) {
        status = 'In Transit';
        currentLocation = `En route (${origin} → ${destination})`;
        predictedLocation = destination;
        confidence = 82;
      } else if (now < unloadingEpoch) {
        status = 'Unloading';
        currentLocation = `${destination} (Dock Unloading)`;
        predictedLocation = destination;
        confidence = 85;
      } else {
        status = 'Expected Available';
        currentLocation = destination;
        predictedLocation = destination;
        confidence = 80;
      }

      if (activeTrip.gps_tracking_link) {
        dataSources.push('telematics_gps_link');
        confidence = Math.min(98, confidence + 10);
      }
    } else {
      status = 'Available';
      currentLocation = activeTrip && activeTrip.destination ? activeTrip.destination : 'Hyderabad Hub';
      predictedLocation = currentLocation;
      earliestNextDeparture = new Date(now).toISOString();
      confidence = 90;
    }

    return {
      truck_id: truck.id,
      truck_number: truckNumber,
      vehicle_category: truck.vehicle_class || truck.truck_size || '32FT SXL',
      capacity_tons: truck.truck_size === '32FT MXL' ? 18.5 : 14.5,
      ownership_type: truck.ownership_type || 'OWNED',
      current_location: currentLocation,
      predicted_location: predictedLocation,
      current_trip_id: activeTrip ? activeTrip.id : null,
      expected_destination: expectedDestination,
      estimated_arrival: estimatedArrival,
      expected_unloading_completed: expectedUnloadingCompleted,
      earliest_next_departure: earliestNextDeparture,
      prediction_confidence: confidence,
      prediction_status: status,
      data_sources: dataSources,
      last_recalculated_at: new Date().toISOString()
    };
  } catch (err) {
    logger.error(`Error calculating forecast for truck ${truckNumber}:`, err.message);
    return {
      truck_id: truck.id,
      truck_number: truckNumber,
      vehicle_category: truck.vehicle_class || '32FT SXL',
      current_location: 'Hyderabad Hub',
      predicted_location: 'Hyderabad Hub',
      prediction_confidence: 60,
      prediction_status: 'Available',
      data_sources: ['fallback'],
      last_recalculated_at: new Date().toISOString(),
      error: err.message
    };
  }
}

/**
 * Compute forecasts for all registered trucks across the fleet.
 */
export async function calculateFleetForecastMatrix(targetDateTime = null) {
  try {
    const trucks = await queryCollection('trucks', null, 'truck_number');
    const matrix = [];
    for (const truck of trucks) {
      const forecast = await calculateTruckForecast(truck, targetDateTime);
      matrix.push(forecast);
    }
    return matrix;
  } catch (err) {
    logger.error('Error calculating fleet forecast matrix:', err.message);
    throw err;
  }
}
