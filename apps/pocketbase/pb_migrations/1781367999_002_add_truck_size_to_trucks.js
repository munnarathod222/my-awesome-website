/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trucks");

  const existing = collection.fields.getByName("truck_size");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("truck_size"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "truck_size",
    required: true,
    values: ["24 FT", "32 FT"]
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trucks");
    collection.fields.removeByName("truck_size");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})