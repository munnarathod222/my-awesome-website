/// <reference path="../pb_data/types.d.ts" />

onRecordUpdate((e) => {
  try {
    const oldRecord = $app.findRecordById("trip_logs", e.record.id);
    const oldStatus = oldRecord.getString("trip_status");
    const newStatus = e.record.getString("trip_status");

    if (oldStatus !== "Delivered" && newStatus === "Delivered") {
      const routeId = e.record.getString("route_id");
      if (routeId) {
        const route = $app.findRecordById("routes", routeId);
        const toll = Number(route.get("fastag_charge")) || 0;
        if (toll > 0) {
          const truckNo = e.record.getString("truck_number");
          if (truckNo) {
            const truck = $app.findFirstRecordByFilter("trucks", "truck_number = {:truckNo}", { truckNo });
            if (truck) {
              const currentBal = Number(truck.get("current_fastag_balance")) || 0;
              truck.set("current_fastag_balance", currentBal - toll);
              $app.save(truck);
              console.log("Deducted " + toll + " FASTag balance for truck " + truckNo + " for completed trip " + e.record.id);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Error in sync-trip-fastag-deduction update hook:", err);
  }
  e.next();
}, "trip_logs");

onRecordAfterCreateSuccess((e) => {
  try {
    const trip = e.record;
    const status = trip.getString("trip_status");
    if (status === "Delivered") {
      const routeId = trip.getString("route_id");
      if (routeId) {
        const route = $app.findRecordById("routes", routeId);
        const toll = Number(route.get("fastag_charge")) || 0;
        if (toll > 0) {
          const truckNo = trip.getString("truck_number");
          if (trip.getString("truck_number")) {
            const truck = $app.findFirstRecordByFilter("trucks", "truck_number = {:truckNo}", { truckNo });
            if (truck) {
              const currentBal = Number(truck.get("current_fastag_balance")) || 0;
              truck.set("current_fastag_balance", currentBal - toll);
              $app.save(truck);
              console.log("Deducted " + toll + " FASTag balance for truck " + truckNo + " for newly created delivered trip " + trip.id);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Error in sync-trip-fastag-deduction create hook:", err);
  }
  e.next();
}, "trip_logs");
