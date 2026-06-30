/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const trucksCollection = app.findCollectionByNameOrId("trucks");
  const employeesCollection = app.findCollectionByNameOrId("employees");

  const collection = new Collection({
    "id": "pbc_exit_audits_001",
    "name": "exit_audits",
    "type": "base",
    "system": false,
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "listRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "id": "text_id_exit_audits",
        "name": "id",
        "type": "text",
        "primaryKey": true,
        "required": true,
        "system": true,
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false
      },
      {
        "id": "relation_truck_exit_audits",
        "name": "truck_id",
        "type": "relation",
        "required": true,
        "collectionId": trucksCollection.id,
        "maxSelect": 1
      },
      {
        "id": "relation_driver_exit_audits",
        "name": "driver_id",
        "type": "relation",
        "required": true,
        "collectionId": employeesCollection.id,
        "maxSelect": 1
      },
      {
        "id": "date_audit_exit_audits",
        "name": "audit_date",
        "type": "date",
        "required": true
      },
      {
        "id": "text_damages_exit_audits",
        "name": "body_damages_notes",
        "type": "text",
        "required": false
      },
      {
        "id": "file_damages_exit_audits",
        "name": "body_damages_images",
        "type": "file",
        "maxSelect": 10,
        "maxSize": 5242880 // 5MB
      },
      {
        "id": "bool_battery_exit_audits",
        "name": "battery_serial_verified",
        "type": "bool",
        "required": false
      },
      {
        "id": "file_battery_exit_audits",
        "name": "battery_image_snapshot",
        "type": "file",
        "maxSelect": 1,
        "maxSize": 5242880
      },
      {
        "id": "json_tyres_exit_audits",
        "name": "tyre_axle_layout_verified",
        "type": "json",
        "required": false
      },
      {
        "id": "select_status_exit_audits",
        "name": "status",
        "type": "select",
        "required": true,
        "values": ["Cleared", "Flagged"]
      },
      {
        "id": "autodate_created_exit_audits",
        "name": "created",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": false
      },
      {
        "id": "autodate_updated_exit_audits",
        "name": "updated",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": true
      }
    ]
  });

  try {
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("Collection name must be unique")) {
      console.log("Collection already exists, skipping");
      return;
    }
    throw e;
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_exit_audits_001");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
