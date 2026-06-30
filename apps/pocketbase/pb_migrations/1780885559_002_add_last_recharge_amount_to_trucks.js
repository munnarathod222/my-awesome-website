/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trucks");

  const existing = collection.fields.getByName("last_recharge_amount");
  if (existing) {
    if (existing.type === "number") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("last_recharge_amount"); // exists with wrong type, remove first
  }

  collection.fields.add(new NumberField({
    name: "last_recharge_amount",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trucks");
    collection.fields.removeByName("last_recharge_amount");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})