/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Add battery_bill file field to trucks collection.
 * Stores the purchase bill / invoice for the battery (PDF or image, max 10 MB).
 */
migrate((app) => {
  const collection = app.findCollectionByNameOrId('trucks');

  const existing = collection.fields.getByName('battery_bill');
  if (existing) {
    console.log('[migration] battery_bill field already exists, skipping.');
    return;
  }

  collection.fields.add(new FileField({
    name: 'battery_bill',
    maxSelect: 1,
    maxSize: 10485760, // 10 MB
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    protected: false
  }));

  return app.save(collection);

}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId('trucks');
    collection.fields.removeByName('battery_bill');
    return app.save(collection);
  } catch (e) {
    if (e.message.includes('no rows in result set')) {
      console.log('[migration rollback] Collection not found, skipping');
      return;
    }
    throw e;
  }
});
