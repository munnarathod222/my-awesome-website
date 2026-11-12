/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const tripCollection = app.findCollectionByNameOrId("trip_logs");
    if (tripCollection && tripCollection.fields) {
      let changed = false;
      try {
        if (!tripCollection.fields.getByName("gps_tracking_link")) {
          tripCollection.fields.add(new TextField({ name: "gps_tracking_link", required: false }));
          changed = true;
        }
      } catch (_) {}

      try {
        if (!tripCollection.fields.getByName("gps_validity_days")) {
          tripCollection.fields.add(new NumberField({ name: "gps_validity_days", required: false, noDecimal: true }));
          changed = true;
        }
      } catch (_) {}

      try {
        if (!tripCollection.fields.getByName("gps_link_expiry")) {
          tripCollection.fields.add(new TextField({ name: "gps_link_expiry", required: false }));
          changed = true;
        }
      } catch (_) {}

      if (changed) {
        try {
          app.save(tripCollection);
        } catch (_) {}
      }
    }
  } catch (e) {
    console.log("Migration notice for trip_logs gps tracking fields:", e.message);
  }
}, (app) => {});
