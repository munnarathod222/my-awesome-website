/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Create or update munnarathod222@gmail.com
  try {
    const collection = app.findCollectionByNameOrId("users");
    let record;
    try {
      record = app.findFirstRecordByData("users", "email", "munnarathod222@gmail.com");
      console.log("[migration] User munnarathod222@gmail.com already exists, updating password.");
    } catch (_) {
      record = new Record(collection);
      record.set("email", "munnarathod222@gmail.com");
      console.log("[migration] Creating new user munnarathod222@gmail.com.");
    }
    
    record.setPassword("Munnarathod@25");
    record.set("role", "admin");
    record.set("status", "active");
    record.set("verified", true);
    record.set("full_name", "Munna Rathod");
    record.set("phone_number", "9999999999");
    app.save(record);
    console.log("[migration] Successfully set up munnarathod222@gmail.com.");
  } catch (err) {
    console.error("[migration] Failed to setup munnarathod222@gmail.com:", err.message);
  }

  // 2. Update admin@jbcargo.com
  try {
    let record = app.findFirstRecordByData("users", "email", "admin@jbcargo.com");
    record.setPassword("Munnarathod@25");
    record.set("role", "admin");
    record.set("status", "active");
    record.set("verified", true);
    if (!record.get("full_name")) {
      record.set("full_name", "Admin User");
    }
    if (!record.get("phone_number")) {
      record.set("phone_number", "9999999999");
    }
    app.save(record);
    console.log("[migration] Updated admin@jbcargo.com password to Munnarathod@25.");
  } catch (err) {
    console.error("[migration] Failed to update admin@jbcargo.com password:", err.message);
  }
}, (app) => {
  // Rollback (no-op)
})
