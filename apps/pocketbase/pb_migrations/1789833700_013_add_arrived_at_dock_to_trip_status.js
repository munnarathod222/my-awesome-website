/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    if (!collection) return;
    const field = collection.fields.getByName("trip_status");
    if (field && Array.isArray(field.values)) {
      const requiredStatuses = [
        "Upcoming",
        "Arrived at Dock",
        "Dispatched",
        "In Transit",
        "Delivered",
        "Completed",
        "Cancelled"
      ];
      let changed = false;
      requiredStatuses.forEach(st => {
        if (!field.values.includes(st)) {
          field.values.push(st);
          changed = true;
        }
      });
      if (changed) {
        return app.save(collection);
      }
    }
  } catch (e) {
    console.log("Migration notice for trip_logs trip_status expansion:", e.message);
  }
}, (app) => {});
