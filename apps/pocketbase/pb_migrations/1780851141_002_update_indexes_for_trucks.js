/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trucks");
  collection.indexes.push("CREATE UNIQUE INDEX idx_trucks_truck_number ON trucks (truck_number)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("trucks");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_trucks_truck_number"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})