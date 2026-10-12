/// <reference path="../pb_data/types.d.ts" />

// Trigger when a trip log is created with status "Delivered"
onRecordAfterCreateSuccess((e) => {
  try {
    const trip = e.record;
    const status = trip.getString("trip_status");
    if (status === "Delivered") {
      const truckNumber = trip.getString("truck_number");
      const kms = trip.getFloat("kms") || 0;
      if (truckNumber && kms > 0) {
        let truck;
        try {
          const cleanTargetNo = (truckNumber || '').replace(/\s+/g, '').toUpperCase();
        try {
          const allTrucks = $app.findAllRecords('trucks');
          for (const t of allTrucks) {
            const num = (t.getString('truck_number') || '').replace(/\s+/g, '').toUpperCase();
            if (num === cleanTargetNo || t.id === truckNumber) { truck = t; break; }
          }
        } catch (_) {}
        } catch (err) {
          console.log("[tyre-mileage-sync] Truck not found for number:", truckNumber);
        }
        if (!truck) {
          return;
        }

        const tyres = $app.findRecordsByFilter(
          "tyres", 
          "truck_id = {:truckId} && status = 'active' && tyre_position != 'stepney'", 
          "", 
          50, 
          0, 
          { truckId: truck.id }
        );

        tyres.forEach(tyre => {
          const currentKms = tyre.getFloat("current_lifecycle_kms") || 0;
          tyre.set("current_lifecycle_kms", currentKms + kms);
          $app.save(tyre);
        });
        console.log(`[tyre-mileage-sync] Auto-added ${kms} KMs to ${tyres.length} tyres on truck ${truckNumber}`);
      }
    }
  } catch (err) {
    console.error("[tyre-mileage-sync] Error on trip log create:", err);
  }
  e.next();
}, "trip_logs");

// Trigger when a trip log status transitions to "Delivered"
onRecordAfterUpdateSuccess((e) => {
  try {
    const newTrip = e.record;
    const oldTrip = typeof e.record.original === 'function' ? e.record.original() : null;
    const oldStatus = oldTrip ? oldTrip.getString("trip_status") : "";
    const newStatus = newTrip.getString("trip_status");

    if (oldStatus !== "Delivered" && newStatus === "Delivered") {
      const truckNumber = newTrip.getString("truck_number");
      const kms = newTrip.getFloat("kms") || 0;
      if (truckNumber && kms > 0) {
        let truck;
        try {
          const cleanTargetNo = (truckNumber || '').replace(/\s+/g, '').toUpperCase();
        try {
          const allTrucks = $app.findAllRecords('trucks');
          for (const t of allTrucks) {
            const num = (t.getString('truck_number') || '').replace(/\s+/g, '').toUpperCase();
            if (num === cleanTargetNo || t.id === truckNumber) { truck = t; break; }
          }
        } catch (_) {}
        } catch (err) {
          console.log("[tyre-mileage-sync] Truck not found for number:", truckNumber);
        }
        if (!truck) {
          return;
        }

        const tyres = $app.findRecordsByFilter(
          "tyres", 
          "truck_id = {:truckId} && status = 'active' && tyre_position != 'stepney'", 
          "", 
          50, 
          0, 
          { truckId: truck.id }
        );

        tyres.forEach(tyre => {
          const currentKms = tyre.getFloat("current_lifecycle_kms") || 0;
          tyre.set("current_lifecycle_kms", currentKms + kms);
          $app.save(tyre);
        });
        console.log(`[tyre-mileage-sync] Auto-added ${kms} KMs to ${tyres.length} tyres on truck ${truckNumber} on transition to Delivered`);
      }
    }
  } catch (err) {
    console.error("[tyre-mileage-sync] Error on trip log update check:", err);
  }
  e.next();
}, "trip_logs");
