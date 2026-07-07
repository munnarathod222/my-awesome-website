/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("routes");

  // Add start_location_map_link text field
  if (!collection.fields.getByName("start_location_map_link")) {
    collection.fields.add(new TextField({
      name: "start_location_map_link",
      required: false
    }));
  }

  // Add end_location_map_link text field
  if (!collection.fields.getByName("end_location_map_link")) {
    collection.fields.add(new TextField({
      name: "end_location_map_link",
      required: false
    }));
  }

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("routes");
    collection.fields.removeByName("start_location_map_link");
    collection.fields.removeByName("end_location_map_link");
    return app.save(collection);
  } catch (e) {
    throw e;
  }
})
