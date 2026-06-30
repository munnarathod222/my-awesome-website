/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const advancesCollection = app.findCollectionByNameOrId("advances");
  const collection = app.findCollectionByNameOrId("expenses");

  const existing = collection.fields.getByName("advance_id");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("advance_id"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "advance_id",
    required: false,
    collectionId: advancesCollection.id,
    maxSelect: 1,
    cascadeDelete: true
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("expenses");
    collection.fields.removeByName("advance_id");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})