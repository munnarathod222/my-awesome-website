/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("clients");
  collection.indexes.push("CREATE INDEX idx_clients_billing_type ON clients (billing_type)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("clients");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_clients_billing_type"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})