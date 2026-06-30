/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("parts_installed");

  if (!collection.fields.getByName("part_number")) {
    collection.fields.add(new TextField({
      name: "part_number",
      required: false
    }));
  }

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("parts_installed");
    collection.fields.removeByName("part_number");
    return app.save(collection);
  } catch (e) {
    throw e;
  }
});
