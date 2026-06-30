/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("truck_documents");
  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'dispatcher' || @request.auth.role = 'supervisor'";
  collection.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'dispatcher' || @request.auth.role = 'supervisor'";
  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'dispatcher'";
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'dispatcher'";
  collection.deleteRule = "@request.auth.role = 'admin'";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("truck_documents");
  collection.listRule = "@request.auth.id != ''";
  collection.viewRule = "@request.auth.id != ''";
  collection.createRule = "@request.auth.id != ''";
  collection.updateRule = "@request.auth.id != ''";
  collection.deleteRule = "@request.auth.id != ''";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})