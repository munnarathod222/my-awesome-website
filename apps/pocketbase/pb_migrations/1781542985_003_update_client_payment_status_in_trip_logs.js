/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trip_logs");
  const field = collection.fields.getByName("client_payment_status");
  field.values = ["pending", "received", "blank", "delayed"];
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("trip_logs");
  const field = collection.fields.getByName("client_payment_status");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.values = ["pending", "received", "blank"];
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})