/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("expenses");

  const existing = collection.fields.getByName("subcategory");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("subcategory"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "subcategory",
    required: false,
    values: ["Fuel", "Maintenance", "Toll", "Insurance", "Salary", "Rent", "Utilities", "Rapido", "Miscellaneous", "Other"]
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("expenses");
    collection.fields.removeByName("subcategory");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})