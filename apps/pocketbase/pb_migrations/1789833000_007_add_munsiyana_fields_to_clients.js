/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("clients");
    if (!collection) return;

    let changed = false;

    // 1. munsiyana_applicable (BoolField)
    let applicableField = null;
    try {
      applicableField = collection.fields.getByName("munsiyana_applicable");
    } catch (_) {}

    if (!applicableField) {
      collection.fields.add(new BoolField({
        name: "munsiyana_applicable",
        required: false,
        system: false,
        presentable: false
      }));
      changed = true;
    }

    // 2. munsiyana_type (TextField: 'slab' | 'flat' | 'percentage')
    let typeField = null;
    try {
      typeField = collection.fields.getByName("munsiyana_type");
    } catch (_) {}

    if (!typeField) {
      collection.fields.add(new TextField({
        name: "munsiyana_type",
        required: false,
        system: false,
        presentable: false
      }));
      changed = true;
    }

    // 3. munsiyana_category (TextField: 'Corporate' | 'Agri_Commodity')
    let catField = null;
    try {
      catField = collection.fields.getByName("munsiyana_category");
    } catch (_) {}

    if (!catField) {
      collection.fields.add(new TextField({
        name: "munsiyana_category",
        required: false,
        system: false,
        presentable: false
      }));
      changed = true;
    }

    // 4. munsiyana_flat_amount (NumberField)
    let amtField = null;
    try {
      amtField = collection.fields.getByName("munsiyana_flat_amount");
    } catch (_) {}

    if (!amtField) {
      collection.fields.add(new NumberField({
        name: "munsiyana_flat_amount",
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
    console.error("Migration error in 1789833000_007_add_munsiyana_fields_to_clients:", err);
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("clients");
    if (collection) {
      try { collection.fields.removeByName("munsiyana_applicable"); } catch (_) {}
      try { collection.fields.removeByName("munsiyana_type"); } catch (_) {}
      try { collection.fields.removeByName("munsiyana_category"); } catch (_) {}
      try { collection.fields.removeByName("munsiyana_flat_amount"); } catch (_) {}
      return app.save(collection);
    }
  } catch (_) {}
});
