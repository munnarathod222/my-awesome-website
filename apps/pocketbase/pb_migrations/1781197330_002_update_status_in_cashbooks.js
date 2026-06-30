/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("cashbooks");
  const field = collection.fields.getByName("status");
  field.values = ["active", "archived"];
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("cashbooks");
  const field = collection.fields.getByName("status");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.values = ["active", "inactive"];
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})