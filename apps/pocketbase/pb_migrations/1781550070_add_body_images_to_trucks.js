/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trucks");

  const existing = collection.fields.getByName("body_images");
  if (existing) {
    if (existing.type === "file") {
      return;
    }
    collection.fields.removeByName("body_images");
  }

  collection.fields.add(new FileField({
    name: "body_images",
    maxSelect: 10,
    maxSize: 20971520
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trucks");
    collection.fields.removeByName("body_images");
    return app.save(collection);
  } catch (e) {
    throw e;
  }
})
