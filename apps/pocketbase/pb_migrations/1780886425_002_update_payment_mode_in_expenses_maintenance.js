/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("expenses_maintenance");
  const field = collection.fields.getByName("payment_mode");
  field.values = ["Cash", "Card", "UPI", "Bank Transfer", "Cheque"];
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("expenses_maintenance");
  const field = collection.fields.getByName("payment_mode");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.values = [];
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})