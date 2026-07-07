/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("routes");

  // Add google_map_link text field
  if (!collection.fields.getByName("google_map_link")) {
    collection.fields.add(new TextField({
      name: "google_map_link",
      required: false
    }));
  }

  // Add stops json field
  if (!collection.fields.getByName("stops")) {
    collection.fields.add(new JSONField({
      name: "stops",
      required: false
    }));
  }

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("routes");
    collection.fields.removeByName("google_map_link");
    collection.fields.removeByName("stops");
    return app.save(collection);
  } catch (e) {
    throw e;
  }
})
