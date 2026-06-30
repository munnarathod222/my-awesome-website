/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("routes");
  collection.listRule = "@request.auth.role = 'super_admin' || @request.auth.role = 'admin' || @request.auth.role = 'manager' || @request.auth.role = 'dispatcher'";
  collection.viewRule = "@request.auth.role = 'super_admin' || @request.auth.role = 'admin' || @request.auth.role = 'manager' || @request.auth.role = 'dispatcher'";
  collection.createRule = "@request.auth.role = 'super_admin' || @request.auth.role = 'admin'";
  collection.updateRule = "@request.auth.role = 'super_admin' || @request.auth.role = 'admin'";
  collection.deleteRule = "@request.auth.role = 'super_admin' || @request.auth.role = 'admin'";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("routes");
  collection.listRule = "@request.auth.id != ''";
  collection.viewRule = "@request.auth.id != ''";
  collection.createRule = "@request.auth.role = 'admin'";
  collection.updateRule = "@request.auth.role = 'admin'";
  collection.deleteRule = "@request.auth.role = 'admin'";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})