/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("employees");

  const record0 = new Record(collection);
    record0.set("name", "Rajesh Kumar");
    record0.set("employee_type", "driver");
    record0.set("position", "Senior Driver");
    record0.set("base_salary", 35000);
    record0.set("salary_billing_cycle", "Monthly");
    record0.set("hire_date", "2023-01-15");
    record0.set("active_status", "active");
    record0.set("contact", "9876543210");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("name", "Priya Singh");
    record1.set("employee_type", "supervisor");
    record1.set("position", "Supervisor");
    record1.set("base_salary", 45000);
    record1.set("salary_billing_cycle", "Monthly");
    record1.set("hire_date", "2022-06-01");
    record1.set("active_status", "active");
    record1.set("contact", "9876543211");
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("name", "Amit Patel");
    record2.set("employee_type", "driver");
    record2.set("position", "Driver");
    record2.set("base_salary", 25000);
    record2.set("salary_billing_cycle", "Weekly");
    record2.set("hire_date", "2023-09-10");
    record2.set("active_status", "active");
    record2.set("contact", "9876543212");
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    record3.set("name", "Deepak Sharma");
    record3.set("employee_type", "driver");
    record3.set("position", "Driver");
    record3.set("base_salary", 28000);
    record3.set("salary_billing_cycle", "Bi-weekly");
    record3.set("hire_date", "2023-03-20");
    record3.set("active_status", "active");
    record3.set("contact", "9876543213");
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    record4.set("name", "Neha Verma");
    record4.set("employee_type", "manager");
    record4.set("position", "Manager");
    record4.set("base_salary", 50000);
    record4.set("salary_billing_cycle", "Monthly");
    record4.set("hire_date", "2021-11-05");
    record4.set("active_status", "active");
    record4.set("contact", "9876543214");
  try {
    app.save(record4);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})