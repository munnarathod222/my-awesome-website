/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const tyresCollection = app.findCollectionByNameOrId("tyres");
  const trucksCollection = app.findCollectionByNameOrId("trucks");

  const collection = new Collection({
    "id": "pbc_tyre_rotations_001",
    "name": "tyre_rotations",
    "type": "base",
    "system": false,
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "listRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "id": "text_id_tyre_rotations",
        "name": "id",
        "type": "text",
        "primaryKey": true,
        "required": true,
        "system": true,
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false
      },
      {
        "id": "relation_truck_tyre_rotations",
        "name": "truck_id",
        "type": "relation",
        "required": true,
        "collectionId": trucksCollection.id,
        "maxSelect": 1
      },
      {
        "id": "relation_tyre1_tyre_rotations",
        "name": "tyre1_id",
        "type": "relation",
        "required": true,
        "collectionId": tyresCollection.id,
        "maxSelect": 1
      },
      {
        "id": "relation_tyre2_tyre_rotations",
        "name": "tyre2_id",
        "type": "relation",
        "required": false, // Optional if we are moving a tyre to an empty position
        "collectionId": tyresCollection.id,
        "maxSelect": 1
      },
      {
        "id": "text_pos1_from_tyre_rotations",
        "name": "from_position1",
        "type": "text",
        "required": true
      },
      {
        "id": "text_pos1_to_tyre_rotations",
        "name": "to_position1",
        "type": "text",
        "required": true
      },
      {
        "id": "text_pos2_from_tyre_rotations",
        "name": "from_position2",
        "type": "text",
        "required": false
      },
      {
        "id": "text_pos2_to_tyre_rotations",
        "name": "to_position2",
        "type": "text",
        "required": false
      },
      {
        "id": "num_odo_tyre_rotations",
        "name": "swap_odometer_reading",
        "type": "number",
        "required": true
      },
      {
        "id": "date_swap_tyre_rotations",
        "name": "swap_date",
        "type": "date",
        "required": true
      },
      {
        "id": "autodate_created_tyre_rotations",
        "name": "created",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": false
      },
      {
        "id": "autodate_updated_tyre_rotations",
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
    const collection = app.findCollectionByNameOrId("pbc_tyre_rotations_001");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
