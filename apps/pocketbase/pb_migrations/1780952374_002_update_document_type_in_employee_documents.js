/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("employee_documents");
  const field = collection.fields.getByName("document_type");
  field.values = ["License", "Certification", "ID Proof", "Passport", "Bank Details", "Employment Contract", "Medical Certificate", "Insurance", "Other"];
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("employee_documents");
  const field = collection.fields.getByName("document_type");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.values = ["Aadhar", "PAN", "Driving License", "Passport", "Bank Details", "Employment Contract", "Medical Certificate", "Insurance", "Other"];
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})