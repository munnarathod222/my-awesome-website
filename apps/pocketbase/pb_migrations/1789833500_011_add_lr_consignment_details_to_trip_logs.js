/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    if (!collection) return;

    let changed = false;

    const fieldsToAdd = [
      { name: "consignee_name", type: "text" },
      { name: "consignee_address", type: "text" },
      { name: "consignee_gstin", type: "text" },
      { name: "consignee_phone", type: "text" },
      { name: "packages_count", type: "number" },
      { name: "package_type", type: "text" },
      { name: "actual_weight", type: "number" },
      { name: "charged_weight", type: "number" },
      { name: "goods_description", type: "text" },
      { name: "invoice_number", type: "text" },
      { name: "hamali_charges", type: "number" }
    ];

    fieldsToAdd.forEach(f => {
      let existing = null;
      try { existing = collection.fields.getByName(f.name); } catch (_) {}
      if (!existing) {
        if (f.type === "number") {
          collection.fields.add(new NumberField({
            name: f.name,
            required: false,
            min: 0,
            system: false,
            presentable: false
          }));
        } else {
          collection.fields.add(new TextField({
            name: f.name,
            required: false,
            system: false,
            presentable: false
          }));
        }
        changed = true;
      }
    });

    if (changed) {
      return app.save(collection);
    }
  } catch (e) {
    console.log("Migration notice for trip_logs LR consignment details:", e.message);
  }
}, (app) => {});
