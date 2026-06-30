/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("signup_requests");
  collection.indexes.push("CREATE UNIQUE INDEX idx_signup_requests_email ON signup_requests (email)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("signup_requests");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_signup_requests_email"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})