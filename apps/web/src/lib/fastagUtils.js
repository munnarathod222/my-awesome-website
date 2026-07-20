import pb from '@/lib/pocketbaseClient.js';

export function normalizeTruckNumber(str) {
  if (!str) return '';
  return str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/**
 * Deducts FASTag toll balance for a delivered or completed trip.
 * Uses normalized string comparison so 'MH 04 JK 1234', 'MH-04-JK-1234', and 'MH04JK1234' match 100%.
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

    // 3. Determine toll charge
    let toll = Number(tripLog.fastag_charge) || Number(tripLog.toll_charge) || Number(tripLog.fastag_amount) || 0;
    
    if (!toll && (tripLog.route || tripLog.route_id)) {
      try {
        const routes = await pb.collection('routes').getFullList({ $autoCancel: false }).catch(() => []);
        const matchedRoute = routes.find(r => r.id === tripLog.route_id || r.route_name === tripLog.route);
        if (matchedRoute) {
          toll = Number(matchedRoute.fastag_charge) || Number(matchedRoute.amount_per_trip) || 0;
        }
      } catch (rErr) {
        console.warn('[FASTagUtils] Route charge lookup error:', rErr);
      }
    }

    // Standard default fallback toll charge if omitted or 0
    if (toll <= 0) {
      toll = 450;
    }

    // 4. Deduct balance on truck
    const currentBal = Number(matchingTruck.current_fastag_balance) || 0;
    const newBal = currentBal - toll;

    await pb.collection('trucks').update(matchingTruck.id, {
      current_fastag_balance: newBal
    }, { $autoCancel: false });

    console.log(`[FASTagUtils] Successfully deducted ₹${toll} from truck ${matchingTruck.truck_number}. Old: ₹${currentBal}, New: ₹${newBal}`);

    // 5. Record Debit transaction log
    try {
      await pb.collection('fastag_transactions').create({
        truck_number: matchingTruck.truck_number || rawTruckNo,
        transaction_type: 'Debit',
        amount: toll,
        trip_code: tripLog.trip_id || tripLog.id,
        date: new Date().toISOString(),
        notes: `FASTag toll deduction for Delivered trip ${tripLog.trip_id || tripLog.id} (${tripLog.route || ''})`
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
