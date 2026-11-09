/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("expenses");
  const field = collection.fields.getByName("subcategory");
  if (!field) return;

  const currentValues = field.values || [];
  const requiredValues = [
    "Fuel", "Maintenance", "Toll", "Insurance", "Salary", "Rent", "Utilities", 
    "Rapido", "Miscellaneous", "Other", "Employee Advance", 
    "Vehicle Loan EMI", "Equipment EMI", "Other EMI", "Truck Finance EMI"
  ];

  requiredValues.forEach((v) => {
    if (!currentValues.includes(v)) {
      currentValues.push(v);
    }
  });

  field.values = currentValues;
  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("expenses");
    const field = collection.fields.getByName("subcategory");
    if (!field) return;
    field.values = ["Fuel", "Maintenance", "Toll", "Insurance", "Salary", "Rent", "Utilities", "Rapido", "Miscellaneous", "Other", "Employee Advance"];
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) return;
    throw e;
  }
});
