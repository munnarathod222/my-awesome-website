/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. trip_logs fields
  try {
    const tripCollection = app.findCollectionByNameOrId("trip_logs");
    if (tripCollection) {
      let changed = false;
      if (!tripCollection.fields.getByName("closure_verified_at")) {
        tripCollection.fields.add(new TextField({
          name: "closure_verified_at",
          required: false,
        }));
        changed = true;
      }
      if (!tripCollection.fields.getByName("auto_closed_at")) {
        tripCollection.fields.add(new TextField({
          name: "auto_closed_at",
          required: false,
        }));
        changed = true;
      }
      if (!tripCollection.fields.getByName("closure_blockers")) {
        tripCollection.fields.add(new TextField({
          name: "closure_blockers",
          required: false,
        }));
        changed = true;
      }
      if (changed) {
        app.save(tripCollection);
      }
    }
  } catch (e) {
    console.log("Migration notice for trip_logs closure fields:", e.message);
  }

  // 2. employees fields
  try {
    const empCollection = app.findCollectionByNameOrId("employees");
    if (empCollection) {
      if (!empCollection.fields.getByName("approval_limits")) {
        empCollection.fields.add(new TextField({
          name: "approval_limits",
          required: false,
        }));
        app.save(empCollection);
      }
    }
  } catch (e) {
    console.log("Migration notice for employees approval_limits:", e.message);
  }
}, (app) => {});
