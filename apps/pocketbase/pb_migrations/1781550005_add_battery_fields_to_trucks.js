/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trucks");

  const fieldsToAdd = [
    { name: "battery_serial_number", type: "text" },
    { name: "battery_purchase_date", type: "date" },
    { name: "battery_warranty_details", type: "text" }
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

  // Handle battery_image file field
  const existingImg = collection.fields.getByName("battery_image");
  if (existingImg) {
    if (existingImg.type === "file") {
      return app.save(collection);
    }
    collection.fields.removeByName("battery_image");
  }
  collection.fields.add(new FileField({
    name: "battery_image",
    maxSelect: 1,
    maxSize: 5242880 // 5MB
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trucks");
    collection.fields.removeByName("battery_serial_number");
    collection.fields.removeByName("battery_purchase_date");
    collection.fields.removeByName("battery_warranty_details");
    collection.fields.removeByName("battery_image");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
