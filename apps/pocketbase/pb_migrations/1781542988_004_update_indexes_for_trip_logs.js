/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trip_logs");
  collection.indexes.push("CREATE INDEX idx_trip_logs_trip_id ON trip_logs (trip_id)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("trip_logs");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_trip_logs_trip_id"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})