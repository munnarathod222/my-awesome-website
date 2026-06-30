/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("payment_requests");
  collection.indexes.push("CREATE INDEX idx_payment_requests_trip_id ON payment_requests (trip_id)");
  collection.indexes.push("CREATE INDEX idx_payment_requests_client_id ON payment_requests (client_id)");
  collection.indexes.push("CREATE INDEX idx_payment_requests_status ON payment_requests (status)");
  collection.indexes.push("CREATE INDEX idx_payment_requests_due_date ON payment_requests (due_date)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("payment_requests");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_payment_requests_trip_id"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_payment_requests_client_id"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_payment_requests_status"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_payment_requests_due_date"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})