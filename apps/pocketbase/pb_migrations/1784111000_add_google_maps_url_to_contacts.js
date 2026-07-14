/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Add google_maps_url field to contacts.
 *
 * NOTE: This field may already be present in the database from an earlier
 * schema update. This migration is idempotent — it skips the save if the
 * field already exists, preventing a duplicate-column error on table rebuild.
 */
migrate((app) => {
  const collection = app.findCollectionByNameOrId("contacts");

  // Skip if already present
  if (collection.fields.getByName("google_maps_url")) {
    return;
  }

  collection.fields.add(new TextField({
    name: "google_maps_url",
    required: false,
    presentable: false,
    system: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("contacts");
    if (collection.fields.getByName("google_maps_url")) {
      collection.fields.removeByName("google_maps_url");
      return app.save(collection);
    }
  } catch (e) {
    if (e.message && e.message.includes("no rows in result set")) return;
    throw e;
  }
});
