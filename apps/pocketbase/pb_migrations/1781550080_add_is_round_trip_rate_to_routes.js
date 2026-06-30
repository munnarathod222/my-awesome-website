/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("routes");

  const existing = collection.fields.getByName("is_round_trip_rate");
  if (existing) {
    if (existing.type === "bool") {
      return;
    }
    collection.fields.removeByName("is_round_trip_rate");
  }

  collection.fields.add(new BoolField({
    name: "is_round_trip_rate",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("routes");
    collection.fields.removeByName("is_round_trip_rate");
    return app.save(collection);
  } catch (e) {
    throw e;
  }
})
