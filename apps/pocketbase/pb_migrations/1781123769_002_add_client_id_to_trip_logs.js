/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const clientsCollection = app.findCollectionByNameOrId("clients");
  const collection = app.findCollectionByNameOrId("trip_logs");

  const existing = collection.fields.getByName("client_id");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("client_id"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "client_id",
    required: false,
    collectionId: clientsCollection.id,
    maxSelect: 1
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    collection.fields.removeByName("client_id");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})