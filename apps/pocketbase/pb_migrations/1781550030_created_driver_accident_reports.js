/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const trucksCollection = app.findCollectionByNameOrId("trucks");
  const employeesCollection = app.findCollectionByNameOrId("employees");

  const collection = new Collection({
    "id": "pbc_accident_reports_01",
    "name": "driver_accident_reports",
    "type": "base",
    "system": false,
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "listRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "id": "text_id_accident_reports",
        "name": "id",
        "type": "text",
        "primaryKey": true,
        "required": true,
        "system": true,
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false
      },
      {
        "id": "relation_employee_accident_reports",
        "name": "employee_id",
        "type": "relation",
        "required": true,
        "collectionId": employeesCollection.id,
        "maxSelect": 1
      },
      {
        "id": "relation_truck_accident_reports",
        "name": "truck_id",
        "type": "relation",
        "required": true,
        "collectionId": trucksCollection.id,
        "maxSelect": 1
      },
      {
        "id": "text_trip_accident_reports",
        "name": "trip_id",
        "type": "text",
        "required": false
      },
      {
        "id": "date_accident_reports",
        "name": "accident_date",
        "type": "date",
        "required": true
      },
      {
        "id": "text_desc_accident_reports",
        "name": "description",
        "type": "text",
        "required": true
      },
      {
        "id": "number_cost_accident_reports",
        "name": "damage_cost",
        "type": "number",
        "required": true,
        "min": 0
      },
      {
        "id": "file_images_accident_reports",
        "name": "image_urls",
        "type": "file",
        "maxSelect": 10,
        "maxSize": 5242880 // 5MB
      },
      {
        "id": "autodate_created_accident_reports",
        "name": "created",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": false
      },
      {
        "id": "autodate_updated_accident_reports",
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
    const collection = app.findCollectionByNameOrId("pbc_accident_reports_01");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
