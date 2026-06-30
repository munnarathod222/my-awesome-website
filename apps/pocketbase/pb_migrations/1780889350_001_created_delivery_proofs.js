/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Fetch related collections to get their IDs
  const trip_logsCollection = app.findCollectionByNameOrId("trip_logs");

  const collection = new Collection({
    "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'dispatcher'",
    "deleteRule": "@request.auth.role = 'admin'",
    "fields":     [
          {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text8399550676",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
          },
          {
                "hidden": false,
                "id": "relation2479241240",
                "name": "trip_id",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "relation",
                "cascadeDelete": false,
                "collectionId": trip_logsCollection.id,
                "displayFields": [],
                "maxSelect": 1,
                "minSelect": 0
          },
          {
                "hidden": false,
                "id": "select1209229892",
                "name": "document_type",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                      "Delivery Receipt",
                      "Proof of Delivery",
                      "Shipment Invoice",
                      "Tracking Document",
                      "Other"
                ]
          },
          {
                "hidden": false,
                "id": "text0058028650",
                "name": "reference_number",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "text1836459232",
                "name": "description",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "file7550424007",
                "name": "files",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "file",
                "maxSelect": 5,
                "maxSize": 10485760,
                "mimeTypes": [
                      "application/pdf",
                      "image/jpeg",
                      "image/png",
                      "application/msword",
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ],
                "thumbs": []
          },
          {
                "hidden": false,
                "id": "text2679963142",
                "name": "uploaded_by",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "autodate9243957545",
                "name": "upload_date",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "autodate",
                "onCreate": true,
                "onUpdate": false
          },
          {
                "hidden": false,
                "id": "select1965775636",
                "name": "status",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                      "Active",
                      "Archived"
                ]
          },
          {
                "hidden": false,
                "id": "autodate9607838271",
                "name": "created",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
          },
          {
                "hidden": false,
                "id": "autodate4897826947",
                "name": "updated",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
          }
    ],
    "id": "pbc_7366988480",
    "indexes": [],
    "listRule": "@request.auth.role = 'admin' || @request.auth.role = 'dispatcher'",
    "name": "delivery_proofs",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'dispatcher'",
    "viewRule": "@request.auth.role = 'admin' || @request.auth.role = 'dispatcher'"
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
    const collection = app.findCollectionByNameOrId("pbc_7366988480");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})