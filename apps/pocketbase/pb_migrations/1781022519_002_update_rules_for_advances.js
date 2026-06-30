/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("advances");
  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'dispatcher'";
  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'dispatcher'";
  collection.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'dispatcher'";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("advances");
  collection.listRule = "@request.auth.id != ''";
  collection.createRule = "@request.auth.id != ''";
  collection.deleteRule = null;
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})