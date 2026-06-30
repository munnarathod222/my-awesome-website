/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("tyres");
  const field = collection.fields.getByName("axle_position");
  field.values = ["single_axle", "front_axle", "rear_axle", "multi_axle", "stepney"];
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("tyres");
  const field = collection.fields.getByName("axle_position");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.values = ["single_axle", "front_axle", "rear_axle", "multi_axle"];
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})