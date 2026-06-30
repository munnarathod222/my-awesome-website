/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("cashbooks");

  const record0 = new Record(collection);
    record0.set("name", "Main Cashbook");
    record0.set("description", "Primary cashbook for all financial transactions");
    record0.set("opening_balance", 0.01);
    record0.set("status", "active");
    record0.set("user_id", "system");
  try {
    app.save(record0);
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