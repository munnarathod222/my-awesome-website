/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("cashbook_transactions");
  collection.listRule = "cashbook_id.user_id = @request.auth.id";
  collection.viewRule = "cashbook_id.user_id = @request.auth.id";
  collection.createRule = "cashbook_id.user_id = @request.auth.id";
  collection.updateRule = "cashbook_id.user_id = @request.auth.id";
  collection.deleteRule = "cashbook_id.user_id = @request.auth.id";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("cashbook_transactions");
  collection.listRule = "@request.auth.id != ''";
  collection.viewRule = "@request.auth.id != ''";
  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'dispatcher'";
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'dispatcher'";
  collection.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'dispatcher'";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})