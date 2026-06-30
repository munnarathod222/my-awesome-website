/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("attendance");
  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'supervisor'";
  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'supervisor'";
  collection.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'supervisor'";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("attendance");
  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'super_admin'";
  collection.createRule = "@request.auth.id != ''";
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