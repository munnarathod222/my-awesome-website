/// <reference path="../pb_data/types.d.ts" />

function syncTripPaymentToCashbook(trip) {
  try {
    const paymentStatus = trip.get("client_payment_status");
    const tripId = trip.id;
    const tripCode = trip.getString("trip_id") || "N/A";
    const userId = trip.get("user_id") || trip.get("created_by") || "";

    const revenue = Number(trip.get("revenue")) || 0;
    const advanceReceived = Number(trip.get("advance_received_from_client")) || 0;
    const finalAmount = revenue - advanceReceived;

    if (paymentStatus === "received") {
      try {
        // Use findFirstRecordByFilter to check if the cashbook record already exists
        const existingTx = $app.findFirstRecordByFilter(
          "cashbook",
          "reference_id = {:tripId} && reference_type = 'trip_payment'",
          { tripId }
        );
        
        if (existingTx) {
          if (finalAmount > 0) {
            existingTx.set("amount", finalAmount);
            existingTx.set("description", "Final Payment Received - Trip ID: " + tripCode);
            $app.save(existingTx);
            console.log(`Updated final payment cashbook entry for Trip ID: ${tripCode}`);
          } else {
            $app.delete(existingTx);
            console.log(`Deleted 0-value final payment cashbook entry for Trip ID: ${tripCode}`);
          }
        } else if (finalAmount > 0) {
          const cashbookCol = $app.findCollectionByNameOrId("cashbook");
          const txn = new Record(cashbookCol);
          txn.set("date", new Date().toISOString().split('T')[0]);
          txn.set("description", "Final Payment Received - Trip ID: " + tripCode);
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
        // If findFirstRecordByFilter throws an error because of no row found, create the record
        if (finalAmount > 0) {
          const cashbookCol = $app.findCollectionByNameOrId("cashbook");
          const txn = new Record(cashbookCol);
          txn.set("date", new Date().toISOString().split('T')[0]);
          txn.set("description", "Final Payment Received - Trip ID: " + tripCode);
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
          "reference_id = {:tripId} && reference_type = 'trip_payment'",
          { tripId }
        );
        if (existingTx) {
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
  syncTripPaymentToCashbook(e.record);
  e.next();
}, "trip_logs");

onRecordAfterUpdateSuccess((e) => {
  syncTripPaymentToCashbook(e.record);
  e.next();
}, "trip_logs");
