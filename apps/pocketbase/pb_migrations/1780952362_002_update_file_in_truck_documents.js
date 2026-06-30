/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("truck_documents");
  const field = collection.fields.getByName("file");
  field.mimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"];
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("truck_documents");
  const field = collection.fields.getByName("file");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.mimeTypes = [];
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})