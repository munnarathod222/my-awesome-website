/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trip_logs");

  const existing = collection.fields.getByName("advance_paid_to_driver");
  if (existing) {
    if (existing.type === "number") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("advance_paid_to_driver"); // exists with wrong type, remove first
  }

  collection.fields.add(new NumberField({
    name: "advance_paid_to_driver",
    required: false,
    min: 0
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    collection.fields.removeByName("advance_paid_to_driver");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})