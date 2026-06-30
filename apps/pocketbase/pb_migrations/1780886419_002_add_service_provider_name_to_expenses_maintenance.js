/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("expenses_maintenance");

  const existing = collection.fields.getByName("service_provider_name");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("service_provider_name"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "service_provider_name",
    required: true
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("expenses_maintenance");
    collection.fields.removeByName("service_provider_name");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})