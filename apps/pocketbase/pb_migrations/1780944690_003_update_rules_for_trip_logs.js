/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trip_logs");
  collection.listRule = "@request.auth.id != '' && (created_by = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'super_admin')";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("trip_logs");
  collection.listRule = "@request.auth.id != ''";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})