/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const pbc_7168669140Collection = app.findCollectionByNameOrId("pbc_7168669140");
  const collection = app.findCollectionByNameOrId("payroll");

  const existing = collection.fields.getByName("advance_ids");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("advance_ids"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "advance_ids",
    required: false,
    collectionId: pbc_7168669140Collection.id,
    maxSelect: 999
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("payroll");
    collection.fields.removeByName("advance_ids");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})