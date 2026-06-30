/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("routes");

  const existing = collection.fields.getByName("amount_per_trip");
  if (existing) {
    if (existing.type === "number") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("amount_per_trip"); // exists with wrong type, remove first
  }

  collection.fields.add(new NumberField({
    name: "amount_per_trip",
    required: true
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("routes");
    collection.fields.removeByName("amount_per_trip");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})