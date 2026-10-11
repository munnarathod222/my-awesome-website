/// <reference path="../pb_data/types.d.ts" />

globalThis.syncTripPaymentToCashbook = function(trip) {
  try {
    const paymentStatus = trip.get("client_payment_status");
    const tripId = trip.id;
    const tripCode = trip.getString("trip_id") || "N/A";
    const userId = trip.get("user_id") || trip.get("created_by") || "";

    const revenue = Number(trip.get("revenue")) || 0;
    const advanceReceived = Number(trip.get("advance_received_from_client")) || 0;
    const tdsDeducted = Number(trip.get("tds_deducted_receivable")) || 0;
    // Calculate net final amount (minus TDS and client advances)
    const finalAmount = revenue - advanceReceived - tdsDeducted;

    if (paymentStatus === "received") {
      try {
        // Use ~ (contains) to check if this trip is linked to any cashbook transaction (single or bulk)
        const existingTx = $app.findFirstRecordByFilter(
          "cashbook",
          "reference_id ~ {:tripId}",
          { tripId }
        );
        
        if (existingTx) {
          // If it's a single trip payment transaction, update the amount.
          // For bulk payments, we don't update since the amount is aggregated.
          if (existingTx.getString("reference_type") === "trip_payment") {
            if (finalAmount > 0) {
              existingTx.set("amount", finalAmount);
              existingTx.set("description", "Final Payment Received - Trip ID: " + tripCode + " (Net after TDS)");
              $app.save(existingTx);
              console.log(`Updated final payment cashbook entry for Trip ID: ${tripCode}`);
            } else {
              $app.delete(existingTx);
              console.log(`Deleted 0-value final payment cashbook entry for Trip ID: ${tripCode}`);
            }
          }
        } else if (finalAmount > 0) {
          const cashbookCol = $app.findCollectionByNameOrId("cashbook");
          const txn = new Record(cashbookCol);
          txn.set("date", new Date().toISOString().split('T')[0]);
          txn.set("description", "Final Payment Received - Trip ID: " + tripCode + " (Net after TDS)");
          txn.set("amount", finalAmount);
          txn.set("transaction_type", "Income");
          txn.set("category", "Trip Revenue");
          txn.set("added_by", userId);
          txn.set("reference_id", tripId);
          txn.set("reference_type", "trip_payment");
          txn.set("status", "Completed");
          $app.save(txn);
          console.log(`Created final payment cashbook entry for Trip ID: ${tripCode}`);
        }
      } catch (errSearch) {
        // If no cashbook record is found, create it
        if (finalAmount > 0) {
          const cashbookCol = $app.findCollectionByNameOrId("cashbook");
          const txn = new Record(cashbookCol);
          txn.set("date", new Date().toISOString().split('T')[0]);
          txn.set("description", "Final Payment Received - Trip ID: " + tripCode + " (Net after TDS)");
          txn.set("amount", finalAmount);
          txn.set("transaction_type", "Income");
          txn.set("category", "Trip Revenue");
          txn.set("added_by", userId);
          txn.set("reference_id", tripId);
          txn.set("reference_type", "trip_payment");
          txn.set("status", "Completed");
          $app.save(txn);
          console.log(`Created final payment cashbook entry for Trip ID: ${tripCode} (catch block)`);
        }
      }
    } else {
      // If status is NOT received, delete any existing final payment cashbook entry
      try {
        const existingTx = $app.findFirstRecordByFilter(
          "cashbook",
          "reference_id ~ {:tripId}",
          { tripId }
        );
        // Only delete if it's an individual trip payment
        if (existingTx && existingTx.getString("reference_type") === "trip_payment") {
          $app.delete(existingTx);
          console.log(`Deleted final payment cashbook entry because status changed from received for Trip ID: ${tripCode}`);
        }
      } catch (errDel) {
        // Safe to ignore if not found
      }
    }
  } catch (error) {
    console.error("Error in syncTripPaymentToCashbook function:", error);
  }
}

onRecordAfterCreateSuccess((e) => {
  if (typeof globalThis.syncTripPaymentToCashbook === "function") {
    globalThis.syncTripPaymentToCashbook(e.record);
  }
  e.next();
}, "trip_logs");

onRecordAfterUpdateSuccess((e) => {
  if (typeof globalThis.syncTripPaymentToCashbook === "function") {
    globalThis.syncTripPaymentToCashbook(e.record);
  }
  e.next();
}, "trip_logs");
