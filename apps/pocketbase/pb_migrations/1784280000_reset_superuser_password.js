/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const email = $os.getenv("PB_SUPERUSER_EMAIL") || "munnarathod222@gmail.com";
  const password = $os.getenv("PB_SUPERUSER_PASSWORD") || "Munnarathod@25";

  // Reset superuser password to correct value
  try {
    const record = app.findAuthRecordByEmail("_superusers", email);
    record.setPassword(password);
    app.save(record);
    console.log("[migration] Reset superuser password for:", email);
  } catch (err) {
    // Superuser not found — create it
    try {
      const superusers = app.findCollectionByNameOrId("_superusers");
      const record = new Record(superusers);
      record.set("email", email);
      record.setPassword(password);
      app.save(record);
      console.log("[migration] Created superuser:", email);
    } catch (e2) {
      console.error("[migration] Failed to set superuser password:", e2.message);
    }
  }
}, (app) => {
  // Rollback (no-op)
});
