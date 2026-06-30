/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("employee_documents");
  const field = collection.fields.getByName("document_name");
  field.name = "document_number";
  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("employee_documents");
    const field = collection.fields.getByName("document_number");
    if (!field) { console.log("Field not found, skipping revert"); return; }
    field.name = "document_name";
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})