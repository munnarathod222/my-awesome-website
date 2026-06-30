/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("expenses_miscellaneous");
  const field = collection.fields.getByName("expense_type");
  field.name = "expense_description";
  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("expenses_miscellaneous");
    const field = collection.fields.getByName("expense_description");
    if (!field) { console.log("Field not found, skipping revert"); return; }
    field.name = "expense_type";
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})