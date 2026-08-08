/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Update _superusers collection email
  try {
    const record = app.findAuthRecordByEmail("_superusers", "munnarathod222@gmail.com");
    record.set("email", "operations@jaibhavanicargo.com");
    app.save(record);
    console.log("[migration] Updated superuser email from munnarathod222@gmail.com to operations@jaibhavanicargo.com");
  } catch (err) {
    console.warn("[migration] Could not find or update superuser email:", err.message);
  }

  // 2. Update users collection email
  try {
    const record = app.findAuthRecordByEmail("users", "munnarathod222@gmail.com");
    record.set("email", "operations@jaibhavanicargo.com");
    app.save(record);
    console.log("[migration] Updated user email from munnarathod222@gmail.com to operations@jaibhavanicargo.com");
  } catch (err) {
    console.warn("[migration] Could not find or update user email:", err.message);
  }
}, (app) => {
  // Rollback (no-op)
});
