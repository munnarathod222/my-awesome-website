/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Add google_maps_url field to contacts.
 *
 * NOTE: This field is already present in the database.
 * Making this migration a no-op to prevent duplicate column error on startup.
 */
migrate((app) => {
  return;
}, (app) => {
  return;
});
