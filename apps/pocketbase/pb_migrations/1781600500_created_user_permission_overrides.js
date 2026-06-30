/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "id": "pbc_overrides01",
    "name": "user_permission_overrides",
    "type": "base",
    "system": false,
    "listRule": "@request.auth.role = 'admin' || @request.auth.role = 'super_admin' || @request.auth.id = user_id",
    "viewRule": "@request.auth.role = 'admin' || @request.auth.role = 'super_admin' || @request.auth.id = user_id",
    "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'super_admin'",
    "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'super_admin'",
    "deleteRule": "@request.auth.role = 'admin' || @request.auth.role = 'super_admin'",
    "indexes": [
      "CREATE UNIQUE INDEX idx_user_resource ON user_permission_overrides (user_id, resource)"
    ],
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text_id_overrides",
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
        "id": "text_user_id_overrides",
        "name": "user_id",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text",
        "autogeneratePattern": "",
        "max": 50,
        "min": 0,
        "pattern": ""
      },
      {
        "hidden": false,
        "id": "text_resource_overrides",
        "name": "resource",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text",
        "autogeneratePattern": "",
        "max": 50,
        "min": 0,
        "pattern": ""
      },
      {
        "hidden": false,
        "id": "bool_is_allowed_overrides",
        "name": "is_allowed",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "text_granted_by_overrides",
        "name": "granted_by",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text",
        "autogeneratePattern": "",
        "max": 50,
        "min": 0,
        "pattern": ""
      },
      {
        "hidden": false,
        "id": "autodate_created_overrides",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate_updated_overrides",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ]
  });

  try {
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("Collection name must be unique")) {
      console.log("Collection user_permission_overrides already exists, skipping");
      return;
    }
    throw e;
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_overrides01");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection user_permission_overrides not found, skipping revert");
      return;
    }
    throw e;
  }
});
