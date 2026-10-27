/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("truck_documents");
    let modified = false;

    if (!collection.fields.getByName("back_file")) {
      collection.fields.add(new FileField({
        name: "back_file",
        maxSelect: 1,
        maxSize: 20971520,
        mimeTypes: [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp"
        ]
      }));
      modified = true;
    }

    if (!collection.fields.getByName("files")) {
      collection.fields.add(new FileField({
        name: "files",
        maxSelect: 10,
        maxSize: 20971520,
        mimeTypes: [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp"
        ]
      }));
      modified = true;
    }

    const fileField = collection.fields.getByName("file");
    if (fileField && fileField.maxSelect < 10) {
      fileField.maxSelect = 10;
      modified = true;
    }

    if (modified) {
      return app.save(collection);
    }
  } catch (e) {
    console.log("Migration notice for truck_documents back_file/files:", e.message);
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("truck_documents");
    collection.fields.removeByName("back_file");
    collection.fields.removeByName("files");
    return app.save(collection);
  } catch (e) {}
});
