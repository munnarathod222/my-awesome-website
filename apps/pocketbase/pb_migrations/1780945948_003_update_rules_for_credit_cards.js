/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("credit_cards");
  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'super_admin'";
  collection.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'super_admin'";
  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'super_admin'";
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'super_admin'";
  collection.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'super_admin'";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("credit_cards");
  collection.listRule = "user_id = @request.auth.id";
  collection.viewRule = "user_id = @request.auth.id";
  collection.createRule = "@request.auth.id != ''";
  collection.updateRule = "user_id = @request.auth.id";
  collection.deleteRule = "user_id = @request.auth.id";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})