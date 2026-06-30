/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("reminders");

  const existing = collection.fields.getByName("reminder_type");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("reminder_type"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "reminder_type",
    required: true,
    values: ["Manual", "Truck Doc Expiry", "Credit Card Payment"]
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("reminders");
    collection.fields.removeByName("reminder_type");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})