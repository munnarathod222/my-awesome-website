/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trip_logs");

  // Handle pod_file
  const existingFile = collection.fields.getByName("pod_file");
  if (existingFile) {
    if (existingFile.type !== "file") {
      collection.fields.removeByName("pod_file");
      collection.fields.add(new FileField({
        name: "pod_file",
        maxSelect: 1,
        maxSize: 20971520 // 20MB
      }));
    }
  } else {
    collection.fields.add(new FileField({
      name: "pod_file",
      maxSelect: 1,
      maxSize: 20971520
    }));
  }

  // Handle pod_status
  const existingStatus = collection.fields.getByName("pod_status");
  if (existingStatus) {
    if (existingStatus.type !== "select") {
      collection.fields.removeByName("pod_status");
      collection.fields.add(new SelectField({
        name: "pod_status",
        required: true,
        values: ["Pending", "Uploaded"]
      }));
    }
  } else {
    collection.fields.add(new SelectField({
      name: "pod_status",
      required: true,
      values: ["Pending", "Uploaded"]
    }));
  }

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    collection.fields.removeByName("pod_file");
    collection.fields.removeByName("pod_status");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
