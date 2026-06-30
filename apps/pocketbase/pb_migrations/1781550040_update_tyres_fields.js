/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("tyres");

  // Modify tyre_image to support multiple selections (maxSelect: 10)
  const existingImage = collection.fields.getByName("tyre_image");
  if (existingImage) {
    collection.fields.removeByName("tyre_image");
  }
  collection.fields.add(new FileField({
    name: "tyre_image",
    maxSelect: 10,
    maxSize: 20971520 // 20MB
  }));

  // Add bill_invoice field (maxSelect: 1, maxSize: 20MB)
  const existingBill = collection.fields.getByName("bill_invoice");
  if (existingBill) {
    collection.fields.removeByName("bill_invoice");
  }
  collection.fields.add(new FileField({
    name: "bill_invoice",
    maxSelect: 1,
    maxSize: 20971520 // 20MB
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("tyres");
    // Revert tyre_image to maxSelect: 1
    collection.fields.removeByName("tyre_image");
    collection.fields.add(new FileField({
      name: "tyre_image",
      maxSelect: 1,
      maxSize: 20971520
    }));
    // Remove bill_invoice
    collection.fields.removeByName("bill_invoice");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
