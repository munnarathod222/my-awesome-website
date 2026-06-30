/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("loan_profiles");

  const fieldsToAdd = [
    { name: "disbursal_date", type: "date" },
    { name: "first_emi_date", type: "date" },
    { name: "bank_name", type: "text" }
  ];

  fieldsToAdd.forEach(field => {
    const existing = collection.fields.getByName(field.name);
    if (existing) {
      if (existing.type === field.type) {
        return;
      }
      collection.fields.removeByName(field.name);
    }
    if (field.type === "text") {
      collection.fields.add(new TextField({ name: field.name, required: false }));
    } else if (field.type === "date") {
      collection.fields.add(new DateField({ name: field.name, required: false }));
    }
  });

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("loan_profiles");
    collection.fields.removeByName("disbursal_date");
    collection.fields.removeByName("first_emi_date");
    collection.fields.removeByName("bank_name");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
