/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("truck_documents");
  const field = collection.fields.getByName("document_type");
  field.values = ["RC", "Insurance", "Permit", "License", "Fitness Certificate", "Pollution Certificate", "Other"];
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("truck_documents");
  const field = collection.fields.getByName("document_type");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.values = ["RC", "Insurance", "Pollution Certificate", "Fitness Certificate", "Permit", "Other"];
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})