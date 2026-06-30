/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trucks");

  const existing = collection.fields.getByName("fastag_notes");
  if (existing) {
    if (existing.type === "editor") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("fastag_notes"); // exists with wrong type, remove first
  }

  collection.fields.add(new EditorField({
    name: "fastag_notes",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trucks");
    collection.fields.removeByName("fastag_notes");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})