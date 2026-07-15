/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("contacts");
  
  collection.updateRule = "@request.auth.id != ''";
  collection.deleteRule = "@request.auth.id != ''";

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("contacts");
  
  collection.updateRule = "created_by = @request.auth.id";
  collection.deleteRule = "created_by = @request.auth.id";

  return app.save(collection);
})
