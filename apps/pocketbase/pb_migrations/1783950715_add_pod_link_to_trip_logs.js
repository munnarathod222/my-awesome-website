/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trip_logs");

  const existing = collection.fields.getByName("pod_link");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists, skip
    }
    collection.fields.removeByName("pod_link");
  }

  collection.fields.add(new TextField({
    name: "pod_link"
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    collection.fields.removeByName("pod_link");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
