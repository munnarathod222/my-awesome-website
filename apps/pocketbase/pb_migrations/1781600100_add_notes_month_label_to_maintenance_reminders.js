/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Add `notes` and `month_label` fields to maintenance_reminders.
 *
 * - notes      : Free-text guidance for the mechanic (what to do / check).
 * - month_label: YYYY-MM string, used for duplicate-detection queries and
 *                quick month-based filtering in the frontend.
 */
migrate((app) => {
  const collection = app.findCollectionByNameOrId('maintenance_reminders');

  // ── notes field ────────────────────────────────────────────────────────────
  const existingNotes = collection.fields.getByName('notes');
  if (!existingNotes) {
    collection.fields.add(new TextField({ name: 'notes' }));
    console.log('[migration] Added field: notes');
  }

  // ── month_label field ──────────────────────────────────────────────────────
  const existingLabel = collection.fields.getByName('month_label');
  if (!existingLabel) {
    collection.fields.add(new TextField({ name: 'month_label' }));
    console.log('[migration] Added field: month_label');
  }

  return app.save(collection);

}, (app) => {
  // ── Rollback ────────────────────────────────────────────────────────────────
  try {
    const collection = app.findCollectionByNameOrId('maintenance_reminders');
    collection.fields.removeByName('notes');
    collection.fields.removeByName('month_label');
    return app.save(collection);
  } catch (e) {
    if (e.message.includes('no rows in result set')) {
      console.log('[migration rollback] Collection not found, skipping');
      return;
    }
    throw e;
  }
});
