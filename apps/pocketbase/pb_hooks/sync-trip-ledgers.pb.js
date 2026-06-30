/// <reference path="../pb_data/types.d.ts" />

onRecordAfterCreateSuccess((e) => {
  try {
    const trip = e.record;
    const userId = trip.get("user_id") || trip.get("created_by") || "";
    
    const advanceReceived = Number(trip.get("advance_received_from_client")) || 0;
    const advancePaid = Number(trip.get("advance_paid_to_driver")) || 0;
    const totalFreight = Number(trip.get("revenue")) || 0;

    // 1. Action A: Cashbook CREDIT for client advance
    if (advanceReceived > 0) {
      try {
        const cashbookCol = $app.findCollectionByNameOrId("cashbook");
        const txn = new Record(cashbookCol);
        txn.set("date", trip.getString("date"));
        txn.set("description", "Client Advance Received - Trip ID: " + trip.getString("trip_id"));
        txn.set("amount", advanceReceived);
        txn.set("transaction_type", "Income");
        txn.set("category", "Client Advances");
        txn.set("added_by", userId);
        txn.set("reference_id", trip.id);
        txn.set("reference_type", "advance");
        txn.set("status", "Completed");
        $app.save(txn);
      } catch (errTx) {
        console.error("Action A failed:", errTx);
        throw errTx;
      }
    }

    // 2. Action B: Cashbook DEBIT for driver advance
    if (advancePaid > 0) {
      try {
        const cashbookCol = $app.findCollectionByNameOrId("cashbook");
        const txn = new Record(cashbookCol);
        txn.set("date", trip.getString("date"));
        txn.set("description", "Driver Trip Advance Disbursed - Trip ID: " + trip.getString("trip_id"));
        txn.set("amount", advancePaid);
        txn.set("transaction_type", "Expense");
        txn.set("category", "Driver Advances");
        txn.set("added_by", userId);
        txn.set("reference_id", trip.id);
        txn.set("reference_type", "advance");
        txn.set("status", "Completed");
        $app.save(txn);
      } catch (errTx) {
        console.error("Action B failed:", errTx);
        throw errTx;
      }
    }

    // 3. Action C: Client Account Branching Updates
    const clientId = trip.getString("client_id");
    if (clientId) {
      try {
        const client = $app.findRecordById("clients", clientId);
        if (client) {
          const billingType = client.getString("billing_type") || "Spot";
          
          if (billingType === "Spot") {
            const remainingDue = totalFreight - advanceReceived;
            const currentDue = Number(client.get("client_balance_due")) || 0;
            client.set("client_balance_due", currentDue + remainingDue);
            $app.save(client);
          } else if (billingType === "Contract") {
            const currentBucket = Number(client.get("unbilled_cycle_bucket")) || 0;
            client.set("unbilled_cycle_bucket", currentBucket + totalFreight);
            $app.save(client);
          }
        }
      } catch (errTx) {
        console.error("Action C failed:", errTx);
        throw errTx;
      }
    }

    // 4. Driver Type Logic Engine
    const driverName = trip.getString("driver_name");
    if (driverName) {
      try {
        const driver = $app.findFirstRecordByFilter("employees", `name = {:driverName}`, { driverName });
        if (driver && driver.getString("employment_type") === "Market / Leased") {
          const routeId = trip.getString("route_id");
          let routeRate = totalFreight * 0.9; // Fallback to 90% of revenue
          if (routeId) {
            try {
              const route = $app.findRecordById("routes", routeId);
              routeRate = Number(route.get("amount_per_trip")) || routeRate;
            } catch (rErr) {}
          }

          const balanceDue = routeRate - advancePaid;
          const driverLedgerCol = $app.findCollectionByNameOrId("driver_ledger");
          const ledgerEntry = new Record(driverLedgerCol);
          
          ledgerEntry.set("driver_id", driver.id);
          ledgerEntry.set("trip_id", trip.id);
          ledgerEntry.set("route_rate", routeRate);
          ledgerEntry.set("advance_paid", advancePaid);
          ledgerEntry.set("balance_due", balanceDue);
          ledgerEntry.set("status", "Pending POD");
          
          $app.save(ledgerEntry);
        }
      } catch (errTx) {
        console.error("Driver Logic Engine failed:", errTx);
        throw errTx;
      }
    }

  } catch (error) {
    console.error("Error in sync-trip-ledgers.pb.js hook:", error);
    throw new Error("Ledger reconciliation transaction failed: " + error.message);
  }
  
  e.next();
}, "trip_logs");
