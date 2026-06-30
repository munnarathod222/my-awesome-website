/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("expenses_fastag");
  const field = collection.fields.getByName("created_by");
  field.required = true;
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("expenses_fastag");
  const field = collection.fields.getByName("created_by");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.required = false;
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})