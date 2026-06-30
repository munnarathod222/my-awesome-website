/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("credit_cards");

  const existing = collection.fields.getByName("current_month_waiver_used");
  if (existing) {
    if (existing.type === "number") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("current_month_waiver_used"); // exists with wrong type, remove first
  }

  collection.fields.add(new NumberField({
    name: "current_month_waiver_used",
    required: true,
    min: 0
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("credit_cards");
    collection.fields.removeByName("current_month_waiver_used");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})