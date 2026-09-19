/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("truck_documents");
    const field = collection.fields.getByName("document_type");
    if (field && !field.values.includes("Road Tax")) {
      field.values.push("Road Tax");
      return app.save(collection);
    }
  } catch (e) {
    console.log("Migration notice for truck_documents Road Tax:", e.message);
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("truck_documents");
    const field = collection.fields.getByName("document_type");
    if (field && field.values.includes("Road Tax")) {
      field.values = field.values.filter(v => v !== "Road Tax");
      return app.save(collection);
    }
  } catch (e) {}
});
