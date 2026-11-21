import logger from '../utils/logger.js';
import { calculateTruckForecast, queryCollection } from './predictiveMovementEngine.js';
import { validateTruckReservationAvailability } from './reservationConflictEngine.js';

function toEpoch(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.getTime();
}

/**
 * Evaluates candidate trucks against a booking request.
 * Returns sorted matches with match scores (0-100%) and reasons.
 */
export async function matchTrucksForBooking(bookingCriteria) {
  const {
    origin,
    destination,
    loadingDatetime,
    vehicleCategory = '32FT SXL',
    cargoWeightTons = 14.0,
    maxDeadheadKm = 250
  } = bookingCriteria;

  const reqStart = toEpoch(loadingDatetime) || Date.now();
  const reqEnd = reqStart + (24 * 3600 * 1000);

  try {
    const trucks = await queryCollection('trucks', null, 'truck_number');
    const results = [];

    for (const truck of trucks) {
      let score = 100;
      const reasons = [];
      const disqualifications = [];

      // 1. Vehicle category matching
      const truckCategory = truck.vehicle_class || truck.truck_size || '32FT SXL';
      if (vehicleCategory && !truckCategory.toLowerCase().includes(vehicleCategory.toLowerCase().slice(0, 4))) {
        score -= 25;
        reasons.push(`Vehicle category is ${truckCategory} (requested ${vehicleCategory}).`);
      } else {
        reasons.push(`Vehicle category matched: ${truckCategory}.`);
      }

      // 2. Capacity check
      const capacity = truck.truck_size === '32FT MXL' ? 18.5 : 14.5;
      if (cargoWeightTons > capacity) {
        disqualifications.push(`Cargo weight (${cargoWeightTons} MT) exceeds registered capacity (${capacity} MT).`);
        score -= 50;
      }

      // 3. Document compliance check
      const allDocs = await queryCollection('truck_documents');
      const docs = allDocs.filter(d => d.truck_id === truck.id || d.truck_number === truck.truck_number);

      const todayStr = new Date().toISOString().slice(0, 10);
      let expiredDoc = null;
      for (const d of docs) {
        if (d.expiry_date && d.expiry_date < todayStr) {
          expiredDoc = d.document_type || d.document_name || 'Document';
          break;
        }
      }

      if (expiredDoc) {
        disqualifications.push(`Mandatory compliance document expired: ${expiredDoc}.`);
        score -= 40;
      } else {
        reasons.push('All compliance documents and permits are valid.');
      }

      // 4. Overlap & Double-booking check
      const availabilityCheck = await validateTruckReservationAvailability(
        truck.truck_number,
        new Date(reqStart).toISOString(),
        new Date(reqEnd).toISOString()
      );

      if (!availabilityCheck.available) {
        disqualifications.push(availabilityCheck.reason);
        score = 0;
      } else {
        reasons.push('Zero overlapping bookings or maintenance blocks detected.');
      }

      // 5. Predictive location & deadhead estimation
      const forecast = await calculateTruckForecast(truck, new Date(reqStart).toISOString());
      
      let deadheadKm = 0;
      const truckLocation = (forecast.predicted_location || forecast.current_location || '').toLowerCase();
      const originLocation = (origin || '').toLowerCase();

      if (truckLocation.includes(originLocation) || originLocation.includes(truckLocation.slice(0, 5))) {
        deadheadKm = 10;
        reasons.push(`Truck is stationed near ${origin} (Deadhead: ~10 km).`);
      } else {
        deadheadKm = 115;
        score -= 15;
        reasons.push(`Truck is expected near ${forecast.predicted_location} (Estimated deadhead: ~115 km).`);
      }

      if (deadheadKm > maxDeadheadKm) {
        disqualifications.push(`Deadhead distance (${deadheadKm} km) exceeds limit (${maxDeadheadKm} km).`);
        score -= 30;
      }

      const finalScore = Math.max(0, Math.min(100, score));
      const isFeasible = disqualifications.length === 0 && finalScore >= 50;

      results.push({
        truck_id: truck.id,
        truck_number: truck.truck_number,
        vehicle_category: truckCategory,
        capacity_tons: capacity,
        predicted_location: forecast.predicted_location,
        estimated_arrival: forecast.estimated_arrival,
        earliest_next_departure: forecast.earliest_next_departure,
        prediction_confidence: forecast.prediction_confidence,
        deadhead_km: deadheadKm,
        match_score: finalScore,
        is_feasible: isFeasible,
        match_reasons: reasons,
        disqualifications: disqualifications,
        booking_mode: forecast.prediction_status === 'Available' ? 'Instant Confirmed' : 'Provisional Request'
      });
    }

    results.sort((a, b) => b.match_score - a.match_score || a.deadhead_km - b.deadhead_km);
    return results;
  } catch (err) {
    logger.error('Error matching trucks for booking:', err.message);
    throw err;
  }
}
