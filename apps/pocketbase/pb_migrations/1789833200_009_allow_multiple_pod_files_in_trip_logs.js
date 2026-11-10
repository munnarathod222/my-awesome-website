/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    let modified = false;

    const podField = collection.fields.getByName("pod_file");
    if (podField) {
      if (podField.maxSelect < 10) {
        podField.maxSelect = 10;
        podField.maxSize = 20971520; // 20MB
        modified = true;
      }
    }

    if (modified) {
      return app.save(collection);
    }
  } catch (e) {
    console.log("Migration notice for trip_logs.pod_file maxSelect expansion:", e.message);
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    const podField = collection.fields.getByName("pod_file");
    if (podField) {
      podField.maxSelect = 1;
      return app.save(collection);
    }
  } catch (e) {}
});
