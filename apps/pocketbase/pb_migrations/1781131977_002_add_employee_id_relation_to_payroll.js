/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const employeesCollection = app.findCollectionByNameOrId("employees");
  const collection = app.findCollectionByNameOrId("payroll");

  const existing = collection.fields.getByName("employee_id_relation");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("employee_id_relation"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "employee_id_relation",
    required: true,
    collectionId: employeesCollection.id,
    maxSelect: 1
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("payroll");
    collection.fields.removeByName("employee_id_relation");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})