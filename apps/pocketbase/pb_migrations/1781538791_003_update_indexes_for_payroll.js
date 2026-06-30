/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("payroll");
  collection.indexes.push("CREATE INDEX idx_payroll_employee_month ON payroll (employee_id_relation, payroll_month, payroll_year)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("payroll");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_payroll_employee_month"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})