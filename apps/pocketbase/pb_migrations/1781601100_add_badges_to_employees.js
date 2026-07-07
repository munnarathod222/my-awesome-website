/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("employees");

  if (!collection.fields.getByName("badges")) {
    collection.fields.add(new JSONField({
      name: "badges",
      required: false
    }));
  }

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("employees");
    collection.fields.removeByName("badges");
    return app.save(collection);
  } catch (e) {
    throw e;
  }
})
