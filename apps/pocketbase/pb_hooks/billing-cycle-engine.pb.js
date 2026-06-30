/// <reference path="../pb_data/types.d.ts" />

function clusterTripsAndRecalculate() {
  try {
    console.log("[billing-cycle-engine] Starting billing cycle clustering and recalculation...");

    // 1. Fetch all completed, unassigned trip logs
    // Completed status, client_id is not empty, billing_cycle_id is empty/null, client_payment_status != 'received'
    const trips = $app.findRecordsByFilter(
      "trip_logs",
      "trip_status = 'Completed' && client_id != '' && (billing_cycle_id = '' || billing_cycle_id = null) && client_payment_status != 'received'",
      "-date",
      2000,
      0
    );

    console.log(`[billing-cycle-engine] Found ${trips.length} unassigned Completed trips to process.`);

    for (const trip of trips) {
      const clientId = trip.getString("client_id");
      const tripDateStr = trip.getString("date");
      if (!tripDateStr) continue;

      // Parse date
      const tripDate = new Date(tripDateStr);
      if (isNaN(tripDate.getTime())) {
        console.log(`[billing-cycle-engine] Invalid date for trip: ${trip.id}, skipping.`);
        continue;
      }

      // Calculate 14-day cohort boundaries based on Jan 1st of the trip's UTC year.
      const year = tripDate.getUTCFullYear();
      const startOfYear = new Date(Date.UTC(year, 0, 1));
      
      const diffMs = tripDate.getTime() - startOfYear.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      const cycleIndex = Math.floor(diffDays / 14);
      
      const cycleStartDate = new Date(startOfYear.getTime() + cycleIndex * 14 * 24 * 60 * 60 * 1000);
      const cycleEndDate = new Date(cycleStartDate.getTime() + 13 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000 + 59 * 60 * 60 * 1000 + 999 * 1000);
      
      const cycleStartStr = cycleStartDate.toISOString().replace('T', ' ').replace('Z', '');
      const cycleEndStr = cycleEndDate.toISOString().replace('T', ' ').replace('Z', '');

      // Look up if a billing cycle record already exists for this client & dates
      let billingCycle;
      try {
        billingCycle = $app.findFirstRecordByFilter(
          "billing_cycles",
          "client_id = {:clientId} && start_date = {:startDate} && end_date = {:endDate}",
          { clientId, startDate: cycleStartStr, endDate: cycleEndStr }
        );
      } catch (err) {
        // Not found, let's fetch client's default configurations (payment terms) to calculate the expected payout date.
        let days = 30; // default to Net 30
        try {
          const client = $app.findRecordById("clients", clientId);
          const terms = client.getString("payment_terms") || "Net 30";
          const match = terms.match(/\d+/);
          if (match) {
            days = parseInt(match[0], 10);
          }
        } catch (clientErr) {
          console.log(`[billing-cycle-engine] Failed to load client ${clientId}:`, clientErr);
        }

        const payoutDate = new Date(cycleEndDate.getTime() + days * 24 * 60 * 60 * 1000);
        const payoutStr = payoutDate.toISOString().replace('T', ' ').replace('Z', '');

        const collection = $app.findCollectionByNameOrId("billing_cycles");
        billingCycle = new Record(collection);
        billingCycle.set("client_id", clientId);
        billingCycle.set("start_date", cycleStartStr);
        billingCycle.set("end_date", cycleEndStr);
        billingCycle.set("expected_payout_date", payoutStr);
        billingCycle.set("status", "Draft");
        billingCycle.set("invoiced_amount", 0);
        billingCycle.set("collected_amount", 0);
        billingCycle.set("is_manually_overridden", false);
        
        $app.save(billingCycle);
        console.log(`[billing-cycle-engine] Auto-created cycle cohort [${cycleStartStr} to ${cycleEndStr}] for client ${clientId} with expected payout in ${days} days.`);
      }

      // Assign the trip log to the resolved billing cycle record
      trip.set("billing_cycle_id", billingCycle.id);
      $app.save(trip);
    }

    // 2. Recalculate invoiced totals for all cycles that are NOT Settled
    const activeCycles = $app.findRecordsByFilter(
      "billing_cycles",
      "status != 'Settled'",
      "-start_date",
      500,
      0
    );

    for (const cycle of activeCycles) {
      // If manually overridden, skip auto-recalculation to preserve manual dates and values
      if (cycle.getBool("is_manually_overridden")) {
        console.log(`[billing-cycle-engine] Recalculation skipped for overridden cycle: ${cycle.id}`);
        continue;
      }

      // Fetch all trips currently assigned to this cycle
      const cycleTrips = $app.findRecordsByFilter(
        "trip_logs",
        "billing_cycle_id = {:cycleId}",
        "",
        2000,
        0,
        { cycleId: cycle.id }
      );

      let totalRevenue = 0;
      for (const t of cycleTrips) {
        totalRevenue += t.getFloat("revenue") || 0;
      }

      cycle.set("invoiced_amount", totalRevenue);
      $app.save(cycle);
    }

    console.log("[billing-cycle-engine] Recalculation and clustering completed successfully.");
  } catch (globalErr) {
    console.error("[billing-cycle-engine] Error in clusterTripsAndRecalculate:", globalErr);
  }
}

// 1. Register background daily cron job
cronAdd("billing_cycles_cohort", "0 0 * * *", () => {
  clusterTripsAndRecalculate();
});

// 2. Register manual/on-demand recalculation route
routerAdd("POST", "/api/custom/billing/recalculate", (e) => {
  clusterTripsAndRecalculate();
  return e.json(200, { success: true, message: "Recalculation and clustering completed." });
});
