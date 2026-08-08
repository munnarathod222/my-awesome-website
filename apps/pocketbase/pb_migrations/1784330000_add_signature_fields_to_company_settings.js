/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("company_settings");

  if (!collection.fields.getByName("e_signature")) {
    collection.fields.add(new FileField({
      name: "e_signature",
      maxSelect: 1,
      maxSize: 5242880,
      mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"]
    }));
  }

  if (!collection.fields.getByName("signatory_name")) {
    collection.fields.add(new TextField({
      name: "signatory_name",
      required: false
    }));
  }

  if (!collection.fields.getByName("signatory_title")) {
    collection.fields.add(new TextField({
      name: "signatory_title",
      required: false
    }));
  }

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("company_settings");
    collection.fields.removeByName("e_signature");
    collection.fields.removeByName("signatory_name");
    collection.fields.removeByName("signatory_title");
    return app.save(collection);
  } catch (e) {
    throw e;
  }
});
