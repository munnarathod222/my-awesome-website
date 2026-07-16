/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("driver_ledger");
  
  collection.listRule = "@request.auth.id != ''";
  collection.viewRule = "@request.auth.id != ''";
  
  const allowedRolesRule = "@request.auth.role = 'super_admin' || @request.auth.role = 'admin' || @request.auth.role = 'manager' || @request.auth.role = 'dispatcher'";
  collection.createRule = allowedRolesRule;
  collection.updateRule = allowedRolesRule;
  collection.deleteRule = allowedRolesRule;
  
  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("driver_ledger");
    collection.listRule = null;
    collection.viewRule = null;
    collection.createRule = null;
    collection.updateRule = null;
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
