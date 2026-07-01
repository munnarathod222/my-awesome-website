/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trucks");

  const existingImage = collection.fields.getByName("battery_image");
  if (existingImage) {
    collection.fields.removeByName("battery_image");
  }
  collection.fields.add(new FileField({
    name: "battery_image",
    maxSelect: 10,
    maxSize: 20971520 // 20MB
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trucks");
    collection.fields.removeByName("battery_image");
    collection.fields.add(new FileField({
      name: "battery_image",
      maxSelect: 1,
      maxSize: 20971520
    }));
    return app.save(collection);
  } catch (e) {
    console.log("Revert failed:", e.message);
    return null;
  }
})
