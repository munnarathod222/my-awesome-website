/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const tripCollection = app.findCollectionByNameOrId("trip_logs");
    if (tripCollection && tripCollection.fields) {
      let changed = false;
      try {
        if (!tripCollection.fields.getByName("is_sealed")) {
          tripCollection.fields.add(new BoolField({ name: "is_sealed", required: false }));
          changed = true;
        }
      } catch (_) {}

      try {
        if (!tripCollection.fields.getByName("seal_number")) {
          tripCollection.fields.add(new TextField({ name: "seal_number", required: false }));
          changed = true;
        }
      } catch (_) {}

      try {
        if (!tripCollection.fields.getByName("seal_numbers")) {
          tripCollection.fields.add(new JSONField({ name: "seal_numbers", required: false, maxSize: 2000000 }));
          changed = true;
        }
      } catch (_) {}

      try {
        if (!tripCollection.fields.getByName("seal_photo_url")) {
          tripCollection.fields.add(new TextField({ name: "seal_photo_url", required: false }));
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
    console.log("Migration notice for trip_logs seal fields:", e.message);
  }
}, (app) => {});
