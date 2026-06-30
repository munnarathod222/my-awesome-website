/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("tyres");

  const fieldsToAdd = [
    { name: "assignment_start_kms", type: "number" },
    { name: "current_lifecycle_kms", type: "number" }
  ];

  fieldsToAdd.forEach(field => {
    const existing = collection.fields.getByName(field.name);
    if (existing) {
      if (existing.type === field.type) {
        return;
      }
      collection.fields.removeByName(field.name);
    }
    collection.fields.add(new NumberField({ name: field.name, required: false }));
  });

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("tyres");
    collection.fields.removeByName("assignment_start_kms");
    collection.fields.removeByName("current_lifecycle_kms");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
