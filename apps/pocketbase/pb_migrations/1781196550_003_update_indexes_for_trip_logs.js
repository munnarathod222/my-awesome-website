/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trip_logs");
  collection.indexes.push("CREATE INDEX idx_trip_logs_route ON trip_logs (route)");
  collection.indexes.push("CREATE INDEX idx_trip_logs_advance_received_from_client ON trip_logs (advance_received_from_client)");
  collection.indexes.push("CREATE INDEX idx_trip_logs_advance_paid_to_driver ON trip_logs (advance_paid_to_driver)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("trip_logs");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_trip_logs_route"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_trip_logs_advance_received_from_client"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_trip_logs_advance_paid_to_driver"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})