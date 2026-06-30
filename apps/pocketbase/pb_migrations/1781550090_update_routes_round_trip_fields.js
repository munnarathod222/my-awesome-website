/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("routes");

  if (!collection.fields.getByName("is_round_trip")) {
    collection.fields.add(new BoolField({
      name: "is_round_trip",
      required: false
    }));
  }

  if (!collection.fields.getByName("down_route_code")) {
    collection.fields.add(new TextField({
      name: "down_route_code",
      required: false
    }));
  }

  if (!collection.fields.getByName("down_start_location")) {
    collection.fields.add(new TextField({
      name: "down_start_location",
      required: false
    }));
  }

  if (!collection.fields.getByName("down_end_location")) {
    collection.fields.add(new TextField({
      name: "down_end_location",
      required: false
    }));
  }

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("routes");
    collection.fields.removeByName("is_round_trip");
    collection.fields.removeByName("down_route_code");
    collection.fields.removeByName("down_start_location");
    collection.fields.removeByName("down_end_location");
    return app.save(collection);
  } catch (e) {
    throw e;
  }
})
