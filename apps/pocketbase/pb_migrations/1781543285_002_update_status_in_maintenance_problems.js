/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("maintenance_problems");
  const field = collection.fields.getByName("status");
  field.values = ["Open", "Resolved"];
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("maintenance_problems");
  const field = collection.fields.getByName("status");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.values = ["Open", "In Progress", "Resolved", "Closed"];
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})