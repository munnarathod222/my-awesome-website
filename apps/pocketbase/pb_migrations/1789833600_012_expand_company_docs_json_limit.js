/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("company_settings");
    if (!collection) return;

    let field = null;
    try {
      field = collection.fields.getByName("company_docs_json");
    } catch (_) {}

    if (field) {
      field.max = 5000000; // 5 MB text capacity for document vault compilations & vehicle RCs
      return app.save(collection);
    }
  } catch (err) {
    console.error("[migration 1789833600_012] Error expanding company_docs_json limit:", err);
  }
}, (app) => {
  // Rollback (no-op)
});
