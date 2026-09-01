/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("quotes");
    if (!collection) return;

    // 1. Open API rules so public can submit quote requests and admins can manage them
    collection.createRule = "";
    collection.listRule = "";
    collection.viewRule = "";
    collection.updateRule = "";
    collection.deleteRule = "";

    // 2. Relax field constraints
    const fields = collection.fields || [];

    // Helper to find or add field
    const getField = (name) => fields.find(f => f.name === name);

    // Make customer_email optional
    const emailField = getField("customer_email");
    if (emailField) {
      emailField.required = false;
    }

    // Make destination_zone optional
    const zoneField = getField("destination_zone");
    if (zoneField) {
      zoneField.required = false;
    }

    // Make created_by optional
    const createdByField = getField("created_by");
    if (createdByField) {
      createdByField.required = false;
    }

    // Convert container_type to text so any truck size string works
    const containerField = getField("container_type");
    if (containerField) {
      containerField.type = "text";
      containerField.required = false;
      delete containerField.values;
      delete containerField.maxSelect;
    }

    // Allow all statuses
    const statusField = getField("status");
    if (statusField) {
      statusField.type = "text";
      statusField.required = false;
      delete statusField.values;
      delete statusField.maxSelect;
    }

    // Add truck_size text field if not present
    if (!getField("truck_size")) {
      collection.fields.push(new Field({
        name: "truck_size",
        type: "text",
        required: false,
        system: false,
        hidden: false
      }));
    }

    // Add custom_vehicle_requirement text field if not present
    if (!getField("custom_vehicle_requirement")) {
      collection.fields.push(new Field({
        name: "custom_vehicle_requirement",
        type: "text",
        required: false,
        system: false,
        hidden: false
      }));
    }

    // Add service_type text field if not present
    if (!getField("service_type")) {
      collection.fields.push(new Field({
        name: "service_type",
        type: "text",
        required: false,
        system: false,
        hidden: false
      }));
    }

    // Add material_type text field if not present
    if (!getField("material_type")) {
      collection.fields.push(new Field({
        name: "material_type",
        type: "text",
        required: false,
        system: false,
        hidden: false
      }));
    }

    // Add expected_dispatch_date text field if not present
    if (!getField("expected_dispatch_date")) {
      collection.fields.push(new Field({
        name: "expected_dispatch_date",
        type: "text",
        required: false,
        system: false,
        hidden: false
      }));
    }

    // Add details text field if not present
    if (!getField("details")) {
      collection.fields.push(new Field({
        name: "details",
        type: "text",
        required: false,
        system: false,
        hidden: false
      }));
    }

    // Add company_name text field if not present
    if (!getField("company_name")) {
      collection.fields.push(new Field({
        name: "company_name",
        type: "text",
        required: false,
        system: false,
        hidden: false
      }));
    }

    return app.save(collection);
  } catch (e) {
    console.error("Migration fix_quotes_schema_and_rules error:", e);
  }
}, (app) => {
  // Revert not required
});
