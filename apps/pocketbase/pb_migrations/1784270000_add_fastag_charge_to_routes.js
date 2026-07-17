/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("routes");
  const existing = collection.fields.getByName("fastag_charge");
  if (!existing) {
    collection.fields.add(new NumberField({
      name: "fastag_charge",
      required: false,
      min: 0
    }));
    return app.save(collection);
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("routes");
    collection.fields.removeByName("fastag_charge");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
