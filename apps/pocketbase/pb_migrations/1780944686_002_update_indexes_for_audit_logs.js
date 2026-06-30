/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("audit_logs");
  collection.indexes.push("CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id)");
  collection.indexes.push("CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at)");
  collection.indexes.push("CREATE INDEX idx_audit_logs_resource_type ON audit_logs (resource_type)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("audit_logs");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_audit_logs_user_id"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_audit_logs_created_at"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_audit_logs_resource_type"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})