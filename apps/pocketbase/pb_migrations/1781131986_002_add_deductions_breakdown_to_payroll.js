/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("payroll");

  const existing = collection.fields.getByName("deductions_breakdown");
  if (existing) {
    if (existing.type === "json") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("deductions_breakdown"); // exists with wrong type, remove first
  }

  collection.fields.add(new JSONField({
    name: "deductions_breakdown"
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("payroll");
    collection.fields.removeByName("deductions_breakdown");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})