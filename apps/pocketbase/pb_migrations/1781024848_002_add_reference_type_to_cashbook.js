/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("cashbook");

  const existing = collection.fields.getByName("reference_type");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("reference_type"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "reference_type",
    required: false,
    values: ["expense", "advance", "salary"]
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("cashbook");
    collection.fields.removeByName("reference_type");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})