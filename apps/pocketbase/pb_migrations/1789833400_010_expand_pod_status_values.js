/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    if (!collection) return;
    const field = collection.fields.getByName("pod_status");
    if (field && Array.isArray(field.values)) {
      const requiredStatuses = [
        "Pending",
        "Uploaded",
        "Verified",
        "Received",
        "Approved"
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
    console.log("Migration notice for trip_logs pod_status expansion:", e.message);
  }
}, (app) => {});
