/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Add tds_rate and tds_amount to trip_calculations.
 *
 * NOTE: These fields were already present in the database via an earlier
 * schema update. This migration is a no-op to keep the migration history
 * consistent without triggering a duplicate-column error on table rebuild.
 */
migrate((app) => {
  // Fields already exist — nothing to do.
  return;
}, (app) => {
  // Rollback: remove fields if present
  try {
    const collection = app.findCollectionByNameOrId("trip_calculations");
    let changed = false;
    if (collection.fields.getByName("tds_rate")) {
      collection.fields.removeByName("tds_rate");
      changed = true;
    }
    if (collection.fields.getByName("tds_amount")) {
      collection.fields.removeByName("tds_amount");
      changed = true;
    }
    if (changed) return app.save(collection);
  } catch (e) {
    // Ignore if collection not found
  }
});
