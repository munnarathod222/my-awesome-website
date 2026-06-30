/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("cashbook");
  const field = collection.fields.getByName("reference_type");
  if (field) {
    field.values = ["expense", "advance", "salary", "opening_balance"];
    return app.save(collection);
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("cashbook");
    const field = collection.fields.getByName("reference_type");
    if (field) {
      field.values = ["expense", "advance", "salary"];
      return app.save(collection);
    }
  } catch (e) {
    throw e;
  }
});
