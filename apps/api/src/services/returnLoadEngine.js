import logger from '../utils/logger.js';
import { calculateFleetForecastMatrix, queryCollection } from './predictiveMovementEngine.js';

/**
 * Return-Load Opportunity Engine
 * Connects trucks finishing trips in outer industrial zones with real inbound loads to prevent empty running.
 */
export async function identifyReturnLoadOpportunities(targetHorizonDays = 7) {
  try {
    const fleetMatrix = await calculateFleetForecastMatrix();
    const routes = await queryCollection('routes');
    const quotes = await queryCollection('quotes');
    const reservations = await queryCollection('truck_reservations');

    const pendingRequests = reservations.filter(r => 
      r.status === 'Pending' || r.status === 'Booking Request'
    );

    const openQuotes = quotes.filter(q => 
      q.status !== 'Rejected' && q.status !== 'Cancelled'
    );

    const opportunities = [];

    for (const truck of fleetMatrix) {
      const dest = (truck.expected_destination || truck.predicted_location || '').toLowerCase();
      if (dest && !dest.includes('hyderabad') && !dest.includes('depot')) {
        const matchingRequests = pendingRequests.filter(r => 
          (r.origin || '').toLowerCase().includes(dest.slice(0, 4))
        );

        const matchingRoutes = routes.filter(r => 
          (r.start_location || '').toLowerCase().includes(dest.slice(0, 4)) &&
          (r.end_location || '').toLowerCase().includes('hyderabad')
        );

        for (const req of matchingRequests) {
          opportunities.push({
            id: `opp_res_${req.id}_${truck.truck_number}`,
            truck_number: truck.truck_number,
            truck_category: truck.vehicle_category,
            current_terminal: truck.expected_destination || truck.predicted_location,
            available_date: truck.expected_unloading_completed || truck.earliest_next_departure,
            opportunity_type: 'Customer Booking Request',
            customer_name: req.customer_name,
            origin: req.origin,
            destination: req.destination,
            deadhead_km: 18,
            cargo_weight: req.cargo_weight_tons || 14,
            indicative_revenue: req.indicative_freight || 28000,
            estimated_operating_cost: 13500,
            net_margin: (req.indicative_freight || 28000) - 13500,
            action_payload: {
              reservation_id: req.id,
              truck_number: truck.truck_number
            }
          });
        }

        for (const route of matchingRoutes) {
          opportunities.push({
            id: `opp_route_${route.id}_${truck.truck_number}`,
            truck_number: truck.truck_number,
            truck_category: truck.vehicle_category,
            current_terminal: truck.expected_destination || truck.predicted_location,
            available_date: truck.expected_unloading_completed || truck.earliest_next_departure,
            opportunity_type: 'Contract Route Backhaul',
            corridor_name: route.route_name || `${route.start_location} → ${route.end_location}`,
            origin: route.start_location,
            destination: route.end_location,
            deadhead_km: 12,
            cargo_weight: 14.5,
            indicative_revenue: route.amount_per_trip || 26000,
            estimated_operating_cost: 12000,
            net_margin: (route.amount_per_trip || 26000) - 12000,
            action_payload: {
              route_id: route.id,
              truck_number: truck.truck_number
            }
          });
        }
      }
    }

    return opportunities;
  } catch (err) {
    logger.error('Error identifying return-load opportunities:', err.message);
    throw err;
  }
}
