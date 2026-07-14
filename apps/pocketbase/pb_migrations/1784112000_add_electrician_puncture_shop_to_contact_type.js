/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("contacts");
  const field = collection.fields.getByName("contact_type");
  
  // Add Electrician and Puncture Shop to allowed values
  field.values = [
    "Client",
    "Driver",
    "Employee",
    "Mechanic",
    "Showroom",
    "Spare Parts",
    "Vendor",
    "Electrician",
    "Puncture Shop"
  ];

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("contacts");
  const field = collection.fields.getByName("contact_type");
  
  field.values = [
    "Client",
    "Driver",
    "Employee",
    "Mechanic",
    "Showroom",
    "Spare Parts",
    "Vendor"
  ];

  return app.save(collection);
})
