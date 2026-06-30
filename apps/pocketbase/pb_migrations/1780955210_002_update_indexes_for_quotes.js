/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("quotes");
  collection.indexes.push("CREATE UNIQUE INDEX idx_quotes_quote_number ON quotes (quote_number)");
  collection.indexes.push("CREATE INDEX idx_quotes_created_by ON quotes (created_by)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("quotes");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_quotes_quote_number"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_quotes_created_by"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})