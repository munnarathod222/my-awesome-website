/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("contacts");

  if (!collection.fields.getByName("truck_brand")) {
    collection.fields.add(new TextField({
      name: "truck_brand",
      required: false
    }));
  }

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("contacts");
    collection.fields.removeByName("truck_brand");
    return app.save(collection);
  } catch (e) {
    throw e;
  }
})
