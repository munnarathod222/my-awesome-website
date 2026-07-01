/// <reference path="../pb_data/types.d.ts" />

onRecordDelete((e) => {
  const tripId = e.record.id;
  const tripCode = e.record.getString("trip_id") || "N/A";
  
  // 1. Delete related cashbook transactions
  try {
    const cashbookRecords = $app.findRecordsByFilter("cashbook", "reference_id ~ {:tripId}", "-created", 100, 0, { tripId });
    for (const record of cashbookRecords) {
      try {
        $app.delete(record);
        console.log(`Deleted cashbook record ${record.id} referencing trip ${tripCode}`);
      } catch (errDel) {
        console.error(`Failed to delete cashbook record ${record.id}:`, errDel);
      }
    }
  } catch (err) {
    console.log(`No cashbook records found for trip ${tripCode} or error: ${err.message}`);
  }

  // 2. Delete related driver ledger entries
  try {
    const ledgerRecords = $app.findRecordsByFilter("driver_ledger", "trip_id = {:tripId}", "-created", 100, 0, { tripId });
    for (const record of ledgerRecords) {
      try {
        $app.delete(record);
        console.log(`Deleted driver ledger entry ${record.id} referencing trip ${tripCode}`);
      } catch (errDel) {
        console.error(`Failed to delete driver ledger entry ${record.id}:`, errDel);
      }
    }
  } catch (err) {
    console.log(`No driver ledger entries found for trip ${tripCode} or error: ${err.message}`);
  }

  // 3. Revert client balance due
  try {
    const clientId = e.record.getString("client_id");
    const totalFreight = Number(e.record.get("revenue")) || 0;
    const advanceReceived = Number(e.record.get("advance_received_from_client")) || 0;
    if (clientId) {
      const client = $app.findRecordById("clients", clientId);
      if (client) {
        const billingType = client.getString("billing_type") || "Spot";
        if (billingType === "Spot") {
          const remainingDue = totalFreight - advanceReceived;
          const currentDue = Number(client.get("client_balance_due")) || 0;
          client.set("client_balance_due", Math.max(0, currentDue - remainingDue));
          $app.save(client);
          console.log(`Reverted spot client balance due for client ${clientId}`);
        } else if (billingType === "Contract") {
          const currentBucket = Number(client.get("unbilled_cycle_bucket")) || 0;
          client.set("unbilled_cycle_bucket", Math.max(0, currentBucket - totalFreight));
          $app.save(client);
          console.log(`Reverted contract client bucket for client ${clientId}`);
        }
      }
    }
  } catch (err) {
    console.error("Failed to revert client balance during trip delete:", err);
  }

  // 4. Delete related delivery proofs (PODs)
  try {
    const podRecords = $app.findRecordsByFilter("delivery_proofs", "trip_id = {:tripId}", "-created", 100, 0, { tripId });
    for (const record of podRecords) {
      try {
        $app.delete(record);
        console.log(`Deleted delivery proof record ${record.id} referencing trip ${tripCode}`);
      } catch (errDel) {
        console.error(`Failed to delete delivery proof record ${record.id}:`, errDel);
      }
    }
  } catch (err) {
    console.log(`No POD records found for trip ${tripCode} or error: ${err.message}`);
  }

  // 5. Delete or clean up related payment requests
  try {
    const payRecords = $app.findRecordsByFilter("payment_requests", "trip_id = {:tripId}", "-created", 100, 0, { tripId });
    for (const record of payRecords) {
      try {
        $app.delete(record);
        console.log(`Deleted payment request record ${record.id} referencing trip ${tripCode}`);
      } catch (errDel) {
        console.error(`Failed to delete payment request record ${record.id}:`, errDel);
      }
    }
  } catch (err) {
    console.log(`No payment requests found for trip ${tripCode} or error: ${err.message}`);
  }

  e.next();
}, "trip_logs");
