/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const routesCollection = app.findCollectionByNameOrId("routes");
  const collection = app.findCollectionByNameOrId("trip_logs");

  const existing = collection.fields.getByName("route_id");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists, skip
    }
    collection.fields.removeByName("route_id");
  }

  collection.fields.add(new RelationField({
    name: "route_id",
    required: false,
    collectionId: routesCollection.id,
    maxSelect: 1
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    collection.fields.removeByName("route_id");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
