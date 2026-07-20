import pb from '@/lib/pocketbaseClient.js';

export function normalizeTruckNumber(str) {
  if (!str) return '';
  return str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/**
 * Deducts FASTag toll balance for a delivered or completed trip.
 * Resolves the exact FASTag toll amount (fastag_charge) configured for the route in Route Manager.
 * Never uses trip revenue or freight rate.
 */
export async function deductFastagForTrip(tripLog) {
  if (!tripLog) return null;

  const rawTruckNo = tripLog.truck_number || tripLog.truck_id;
  if (!rawTruckNo) {
    console.warn('[FASTagUtils] No truck_number on trip log, skipping deduction.');
    return null;
  }

  const cleanTargetNo = normalizeTruckNumber(rawTruckNo);

  try {
    // 1. Fetch all trucks
    const trucks = await pb.collection('trucks').getFullList({ $autoCancel: false }).catch(() => []);
    
    // 2. Find matching truck by normalized registration / truck number
    const matchingTruck = trucks.find(t => {
      const tNo1 = normalizeTruckNumber(t.truck_number);
      const tNo2 = normalizeTruckNumber(t.registration_number);
      return tNo1 === cleanTargetNo || tNo2 === cleanTargetNo || t.id === rawTruckNo;
    });

    if (!matchingTruck) {
      console.warn(`[FASTagUtils] Truck '${rawTruckNo}' (normalized: '${cleanTargetNo}') not found in trucks collection.`);
      return null;
    }

    // 3. Resolve Route and Toll Charge from Route Manager
    let toll = 0;

    // Check if trip explicitly specifies fastag_charge (must NOT be revenue/amount_per_trip)
    if (tripLog.fastag_charge !== undefined && tripLog.fastag_charge !== null && Number(tripLog.fastag_charge) > 0) {
      toll = Number(tripLog.fastag_charge);
    }

    // Lookup assigned route in 'routes' collection to get route's fastag_charge
    if (!toll) {
      const routes = await pb.collection('routes').getFullList({ $autoCancel: false }).catch(() => []);
      const matchedRoute = routes.find(r => {
        if (tripLog.route_id && r.id === tripLog.route_id) return true;
        if (tripLog.route && (
          r.route_name?.trim().toLowerCase() === tripLog.route.trim().toLowerCase() ||
          r.route_code?.trim().toLowerCase() === tripLog.route.trim().toLowerCase()
        )) return true;
        return false;
      });

      if (matchedRoute && matchedRoute.fastag_charge) {
        toll = Number(matchedRoute.fastag_charge) || 0;
      }
    }

    // Fallback standard FASTag toll if route has no fastag_charge specified (default ₹450 toll)
    if (toll <= 0) {
      toll = 450;
    }

    // 4. Deduct balance on truck
    const currentBal = Number(matchingTruck.current_fastag_balance) || 0;
    const newBal = currentBal - toll;

    await pb.collection('trucks').update(matchingTruck.id, {
      current_fastag_balance: newBal
    }, { $autoCancel: false });

    console.log(`[FASTagUtils] Successfully deducted ₹${toll} FASTag toll for truck ${matchingTruck.truck_number}. Old: ₹${currentBal}, New: ₹${newBal}`);

    // 5. Record Debit transaction log
    try {
      await pb.collection('fastag_transactions').create({
        truck_number: matchingTruck.truck_number || rawTruckNo,
        transaction_type: 'Debit',
        amount: toll,
        trip_code: tripLog.trip_id || tripLog.id,
        date: new Date().toISOString(),
        notes: `FASTag toll deduction (₹${toll}) for Delivered trip ${tripLog.trip_id || tripLog.id} (Route: ${tripLog.route || ''})`
      }, { $autoCancel: false });
    } catch (txErr) {
      console.warn('[FASTagUtils] Transaction log creation warning:', txErr);
    }

    return { truck: matchingTruck, tollDeducted: toll, newBalance: newBal };

  } catch (err) {
    console.error('[FASTagUtils] Error in deductFastagForTrip:', err);
    return null;
  }
}
