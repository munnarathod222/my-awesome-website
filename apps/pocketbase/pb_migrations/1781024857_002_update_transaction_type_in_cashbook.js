/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("cashbook");
  const field = collection.fields.getByName("transaction_type");
  field.values = ["Income", "Expense", "Advance"];
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("cashbook");
  const field = collection.fields.getByName("transaction_type");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.values = ["Income", "Expense"];
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})