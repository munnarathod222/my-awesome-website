/// <reference path="../pb_data/types.d.ts" />

function deductFastagForTrip(record, eventType) {
  try {
    const tripId = record.getString("trip_id") || record.id;
    const truckNo = record.getString("truck_number");
    if (!truckNo) {
      console.log(`[FastagDeduction] No truck_number on trip ${tripId}. Skipping.`);
      return;
    }

    // 1. Resolve Route and Toll Charge
    let toll = 0;
    const routeId = record.getString("route_id");
    const routeStr = record.getString("route");

    let route = null;
    if (routeId) {
      try { route = $app.findRecordById("routes", routeId); } catch (e) {}
    }
    if (!route && routeStr) {
      try {
        route = $app.findFirstRecordByFilter("routes", "id = {:r} || route_name = {:r}", { r: routeStr });
      } catch (e) {}
    }

    if (route) {
      toll = Number(route.get("fastag_charge")) || Number(route.get("amount_per_trip")) || 0;
    }

    if (toll <= 0) {
      console.log(`[FastagDeduction] FASTag toll charge is 0 for route of trip ${tripId}. Skipping deduction.`);
      return;
    }

    // 2. Resolve Truck and Deduct FASTag Balance
    let truck = null;
    try {
      truck = $app.findFirstRecordByFilter("trucks", "truck_number = {:t} || id = {:t}", { t: truckNo });
    } catch (e) {}

    if (!truck) {
      console.log(`[FastagDeduction] Could not find truck for truck_number '${truckNo}' in trip ${tripId}. Skipping.`);
      return;
    }

    const currentBal = Number(truck.get("current_fastag_balance")) || 0;
    const newBal = currentBal - toll;
    truck.set("current_fastag_balance", newBal);
    $app.save(truck);

    console.log(`⚡ [FastagDeduction] Deducted ₹${toll} FASTag toll for truck ${truckNo} on completed trip ${tripId} (${eventType}). New balance: ₹${newBal}`);

    // 3. Log transaction to fastag_transactions collection
    try {
      const txCol = $app.findCollectionByNameOrId("fastag_transactions");
      if (txCol) {
        const txRecord = new Record(txCol, {
          truck_number: truckNo,
          transaction_type: "Debit",
          amount: toll,
          trip_code: tripId,
          date: new Date().toISOString(),
          notes: `Automated FASTag toll deduction for Delivered trip ${tripId} (Route: ${routeStr || (route ? route.get("route_name") : "")})`
        });
        $app.save(txRecord);
      }
    } catch (txErr) {
      console.log(`[FastagDeduction] Log to fastag_transactions skipped: ${txErr.message}`);
    }

  } catch (err) {
    console.error(`❌ [FastagDeduction] Error processing FASTag deduction for trip ${record.id}:`, err);
  }
}

// Trigger on record update when trip_status transitions to "Delivered"
onRecordUpdate((e) => {
  try {
    const oldRecord = e.record.originalCopy();
    const oldStatus = oldRecord ? oldRecord.getString("trip_status") : "";
    const newStatus = e.record.getString("trip_status");

    if (oldStatus !== "Delivered" && newStatus === "Delivered") {
      deductFastagForTrip(e.record, "status transition to Delivered");
    }
  } catch (err) {
    console.error("Error in sync-trip-fastag-deduction update hook:", err);
  }
  e.next();
}, "trip_logs");

// Trigger on record create if trip_status is set to "Delivered" directly on creation
onRecordAfterCreateSuccess((e) => {
  try {
    const status = e.record.getString("trip_status");
    if (status === "Delivered") {
      deductFastagForTrip(e.record, "created as Delivered");
    }
  } catch (err) {
    console.error("Error in sync-trip-fastag-deduction create hook:", err);
  }
  e.next();
}, "trip_logs");
