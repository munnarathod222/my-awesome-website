/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("reminders");
  const trucksCollection = app.findCollectionByNameOrId("trucks");

  const existing = collection.fields.getByName("truck_id");
  if (!existing) {
    collection.fields.add(new RelationField({
      name: "truck_id",
      required: false,
      collectionId: trucksCollection.id,
      maxSelect: 1
    }));
    return app.save(collection);
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("reminders");
    collection.fields.removeByName("truck_id");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
