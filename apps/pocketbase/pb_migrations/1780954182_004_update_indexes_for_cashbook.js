/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("cashbook");
  collection.indexes.push("CREATE INDEX idx_cashbook_date ON cashbook (date)");
  collection.indexes.push("CREATE INDEX idx_cashbook_transaction_type ON cashbook (transaction_type)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("cashbook");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_cashbook_date"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_cashbook_transaction_type"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})