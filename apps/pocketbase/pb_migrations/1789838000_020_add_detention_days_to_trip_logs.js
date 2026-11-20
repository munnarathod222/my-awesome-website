/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    if (!collection) return;

    let changed = false;

    // 1. detention_days
    let ddField = null;
    try { ddField = collection.fields.getByName("detention_days"); } catch (_) {}
    if (!ddField) {
      collection.fields.add(new NumberField({
        name: "detention_days",
        required: false,
        min: 0,
        system: false,
        presentable: false
      }));
      changed = true;
    }

    // 2. detention_rate_per_day
    let drpdField = null;
    try { drpdField = collection.fields.getByName("detention_rate_per_day"); } catch (_) {}
    if (!drpdField) {
      collection.fields.add(new NumberField({
        name: "detention_rate_per_day",
        required: false,
        min: 0,
        system: false,
        presentable: false
      }));
      changed = true;
    }

    // 3. detention_reason
    let drField = null;
    try { drField = collection.fields.getByName("detention_reason"); } catch (_) {}
    if (!drField) {
      collection.fields.add(new TextField({
        name: "detention_reason",
        required: false,
        system: false,
        presentable: false
      }));
      changed = true;
    }

    if (changed) {
      return app.save(collection);
    }
  } catch (err) {
    console.error("Migration error in 1789838000_020_add_detention_days_to_trip_logs:", err);
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    if (collection) {
      try { collection.fields.removeByName("detention_days"); } catch (_) {}
      try { collection.fields.removeByName("detention_rate_per_day"); } catch (_) {}
      try { collection.fields.removeByName("detention_reason"); } catch (_) {}
      return app.save(collection);
    }
  } catch (_) {}
});
