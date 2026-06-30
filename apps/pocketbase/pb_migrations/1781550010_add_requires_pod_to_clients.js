/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("clients");

  const existing = collection.fields.getByName("requires_pod");
  if (existing) {
    if (existing.type === "bool") {
      return;
    }
    collection.fields.removeByName("requires_pod");
  }

  collection.fields.add(new BoolField({
    name: "requires_pod",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("clients");
    collection.fields.removeByName("requires_pod");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
