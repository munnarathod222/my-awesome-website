/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("employees");
  collection.indexes.push("CREATE INDEX idx_employees_employment_type ON employees (employment_type)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("employees");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_employees_employment_type"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})