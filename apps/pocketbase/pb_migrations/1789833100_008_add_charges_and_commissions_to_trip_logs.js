/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    if (!collection) return;

    let changed = false;

    // 1. loading_charges (NumberField)
    let lcField = null;
    try { lcField = collection.fields.getByName("loading_charges"); } catch (_) {}
    if (!lcField) {
      collection.fields.add(new NumberField({
        name: "loading_charges",
        required: false,
        min: 0,
        system: false,
        presentable: false
      }));
      changed = true;
    }

    // 2. loading_paid_by (TextField: 'client' | 'company')
    let lpbField = null;
    try { lpbField = collection.fields.getByName("loading_paid_by"); } catch (_) {}
    if (!lpbField) {
      collection.fields.add(new TextField({
        name: "loading_paid_by",
        required: false,
        system: false,
        presentable: false
      }));
      changed = true;
    }

    // 3. unloading_charges (NumberField)
    let ucField = null;
    try { ucField = collection.fields.getByName("unloading_charges"); } catch (_) {}
    if (!ucField) {
      collection.fields.add(new NumberField({
        name: "unloading_charges",
        required: false,
        min: 0,
        system: false,
        presentable: false
      }));
      changed = true;
    }

    // 4. unloading_paid_by (TextField: 'client' | 'company')
    let upbField = null;
    try { upbField = collection.fields.getByName("unloading_paid_by"); } catch (_) {}
    if (!upbField) {
      collection.fields.add(new TextField({
        name: "unloading_paid_by",
        required: false,
        system: false,
        presentable: false
      }));
      changed = true;
    }

    // 5. broker_commission (NumberField)
    let bcField = null;
    try { bcField = collection.fields.getByName("broker_commission"); } catch (_) {}
    if (!bcField) {
      collection.fields.add(new NumberField({
        name: "broker_commission",
        required: false,
        min: 0,
        system: false,
        presentable: false
      }));
      changed = true;
    }

    // 6. munsiyana (NumberField)
    let mField = null;
    try { mField = collection.fields.getByName("munsiyana"); } catch (_) {}
    if (!mField) {
      collection.fields.add(new NumberField({
        name: "munsiyana",
        required: false,
        min: 0,
        system: false,
        presentable: false
      }));
      changed = true;
    }

    if (changed) {
      return app.save(collection);
    }
  } catch (err) {
    console.error("Migration error in 1789833100_008_add_charges_and_commissions_to_trip_logs:", err);
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    if (collection) {
      try { collection.fields.removeByName("loading_charges"); } catch (_) {}
      try { collection.fields.removeByName("loading_paid_by"); } catch (_) {}
      try { collection.fields.removeByName("unloading_charges"); } catch (_) {}
      try { collection.fields.removeByName("unloading_paid_by"); } catch (_) {}
      try { collection.fields.removeByName("broker_commission"); } catch (_) {}
      try { collection.fields.removeByName("munsiyana"); } catch (_) {}
      return app.save(collection);
    }
  } catch (_) {}
});
