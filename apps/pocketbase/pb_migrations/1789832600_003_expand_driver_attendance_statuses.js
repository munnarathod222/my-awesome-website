/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("attendance");
    const field = collection.fields.getByName("status");
    if (field && Array.isArray(field.values)) {
      const requiredStatuses = [
        "Present",
        "Absent",
        "Weekly off",
        "Leave",
        "On trip",
        "Available",
        "Driver replacement required"
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
    console.log("Migration notice for driver attendance statuses:", e.message);
  }
}, (app) => {});
