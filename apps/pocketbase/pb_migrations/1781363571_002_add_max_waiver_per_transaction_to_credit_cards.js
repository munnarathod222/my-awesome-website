/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("credit_cards");

  const existing = collection.fields.getByName("max_waiver_per_transaction");
  if (existing) {
    if (existing.type === "number") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("max_waiver_per_transaction"); // exists with wrong type, remove first
  }

  collection.fields.add(new NumberField({
    name: "max_waiver_per_transaction",
    required: true,
    min: 4000,
    max: 5000
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("credit_cards");
    collection.fields.removeByName("max_waiver_per_transaction");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})