/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trip_logs");
  collection.listRule = "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'super_admin' || @request.auth.role = 'dispatcher' || @request.auth.role = 'manager')";
  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'super_admin' || @request.auth.role = 'dispatcher' || @request.auth.role = 'manager'";
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'super_admin' || @request.auth.role = 'dispatcher' || @request.auth.role = 'manager'";
  collection.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'super_admin' || @request.auth.role = 'dispatcher' || @request.auth.role = 'manager'";
  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    collection.listRule = "@request.auth.id != '' && (created_by = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'super_admin')";
    collection.createRule = "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'";
    collection.updateRule = "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'";
    collection.deleteRule = "@request.auth.role = 'admin'";
    return app.save(collection);
  } catch (e) {
    console.log("Revert failed:", e.message);
    return null;
  }
})
