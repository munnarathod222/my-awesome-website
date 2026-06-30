/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("routes");
  collection.indexes.push("CREATE INDEX idx_routes_route_name ON routes (route_name)");
  collection.indexes.push("CREATE INDEX idx_routes_status ON routes (status)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("routes");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_routes_route_name"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_routes_status"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})