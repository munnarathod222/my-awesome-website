/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Add base_odometer to trucks
  const trucksCollection = app.findCollectionByNameOrId("trucks");
  if (!trucksCollection.fields.getByName("base_odometer")) {
    trucksCollection.fields.add(new NumberField({
      name: "base_odometer",
      required: false,
      min: 0
    }));
    app.save(trucksCollection);
  }

  // 2. Create service_intervals collection
  const collection1 = new Collection({
    "id": "pbc_service_intervals_001",
    "name": "service_intervals",
    "type": "base",
    "system": false,
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "listRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "id": "text_id_service_intervals",
        "name": "id",
        "type": "text",
        "primaryKey": true,
        "required": true,
        "system": true,
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false
      },
      {
        "id": "relation_truck_service_intervals",
        "name": "truck_id",
        "type": "relation",
        "required": true,
        "collectionId": trucksCollection.id,
        "maxSelect": 1
      },
      {
        "id": "text_comp_service_intervals",
        "name": "component_name",
        "type": "text",
        "required": true
      },
      {
        "id": "num_target_service_intervals",
        "name": "target_interval_kms",
        "type": "number",
        "required": true
      },
      {
        "id": "num_last_serviced_service_intervals",
        "name": "last_serviced_odometer",
        "type": "number",
        "required": true
      },
      {
        "id": "autodate_created_service_intervals",
        "name": "created",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": false
      },
      {
        "id": "autodate_updated_service_intervals",
        "name": "updated",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": true
      }
    ]
  });

  try {
    app.save(collection1);
  } catch (e) {
    if (!e.message.includes("Collection name must be unique")) {
      throw e;
    }
  }

  // 3. Create monthly_inspections collection
  const collection2 = new Collection({
    "id": "pbc_monthly_inspections_001",
    "name": "monthly_inspections",
    "type": "base",
    "system": false,
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "listRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "id": "text_id_monthly_inspections",
        "name": "id",
        "type": "text",
        "primaryKey": true,
        "required": true,
        "system": true,
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false
      },
      {
        "id": "relation_truck_monthly_inspections",
        "name": "truck_id",
        "type": "relation",
        "required": true,
        "collectionId": trucksCollection.id,
        "maxSelect": 1
      },
      {
        "id": "date_insp_monthly_inspections",
        "name": "inspection_date",
        "type": "date",
        "required": true
      },
      {
        "id": "text_name_monthly_inspections",
        "name": "inspector_name",
        "type": "text",
        "required": true
      },
      {
        "id": "json_toggles_monthly_inspections",
        "name": "pass_fail_toggles",
        "type": "json",
        "required": true
      },
      {
        "id": "text_notes_monthly_inspections",
        "name": "inspector_notes",
        "type": "text",
        "required": false
      },
      {
        "id": "autodate_created_monthly_inspections",
        "name": "created",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": false
      },
      {
        "id": "autodate_updated_monthly_inspections",
        "name": "updated",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": true
      }
    ]
  });

  try {
    app.save(collection2);
  } catch (e) {
    if (!e.message.includes("Collection name must be unique")) {
      throw e;
    }
  }

  // 4. Create service_logs collection
  const collection3 = new Collection({
    "id": "pbc_service_logs_001",
    "name": "service_logs",
    "type": "base",
    "system": false,
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "listRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "id": "text_id_service_logs",
        "name": "id",
        "type": "text",
        "primaryKey": true,
        "required": true,
        "system": true,
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false
      },
      {
        "id": "relation_truck_service_logs",
        "name": "truck_id",
        "type": "relation",
        "required": true,
        "collectionId": trucksCollection.id,
        "maxSelect": 1
      },
      {
        "id": "date_maint_service_logs",
        "name": "maintenance_date",
        "type": "date",
        "required": true
      },
      {
        "id": "num_odo_service_logs",
        "name": "odometer_at_service",
        "type": "number",
        "required": true
      },
      {
        "id": "text_desc_service_logs",
        "name": "work_description_text",
        "type": "text",
        "required": true
      },
      {
        "id": "json_parts_service_logs",
        "name": "parts_replaced_array",
        "type": "json",
        "required": false
      },
      {
        "id": "num_cost_service_logs",
        "name": "cost_amount",
        "type": "number",
        "required": true
      },
      {
        "id": "file_invoice_service_logs",
        "name": "invoice_file",
        "type": "file",
        "maxSelect": 1,
        "maxSize": 20971520, // 20MB
        "required": false
      },
      {
        "id": "autodate_created_service_logs",
        "name": "created",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": false
      },
      {
        "id": "autodate_updated_service_logs",
        "name": "updated",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": true
      }
    ]
  });

  try {
    app.save(collection3);
  } catch (e) {
    if (!e.message.includes("Collection name must be unique")) {
      throw e;
    }
  }

}, (app) => {
  // Revert all
  try {
    const col3 = app.findCollectionByNameOrId("pbc_service_logs_001");
    app.delete(col3);
  } catch (e) {}

  try {
    const col2 = app.findCollectionByNameOrId("pbc_monthly_inspections_001");
    app.delete(col2);
  } catch (e) {}

  try {
    const col1 = app.findCollectionByNameOrId("pbc_service_intervals_001");
    app.delete(col1);
  } catch (e) {}

  try {
    const trucks = app.findCollectionByNameOrId("trucks");
    trucks.fields.removeByName("base_odometer");
    app.save(trucks);
  } catch (e) {}
});
