/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trip_calculations");
  
  let changed = false;

  if (!collection.fields.getByName("tds_rate")) {
    collection.fields.add(new NumberField({
      name: "tds_rate",
      required: false
    }));
    changed = true;
  }

  if (!collection.fields.getByName("tds_amount")) {
    collection.fields.add(new NumberField({
      name: "tds_amount",
      required: false
    }));
    changed = true;
  }

  // Only save if we actually added fields — avoids "duplicate column" error
  // when both fields already exist in the database.
  if (changed) {
    return app.save(collection);
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_calculations");
    collection.fields.removeByName("tds_rate");
    collection.fields.removeByName("tds_amount");
    return app.save(collection);
  } catch (e) {
    throw e;
  }
});
