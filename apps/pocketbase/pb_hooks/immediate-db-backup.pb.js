/// <reference path="../pb_data/types.d.ts" />

// ──────────────────────────────────────────────────────────────────
// Real-Time Database Sync Hook
// Triggers an instant Supabase upload of the SQLite database (data.db)
// whenever ANY write operation (create, update, delete) is successfully
// committed on the primary collections.
// This guarantees that all user data changes — including truck documents,
// tyre documents, loan profiles, accident records, routes, etc. — are
// saved to Supabase in real-time, preventing data loss on redeploys.
// ──────────────────────────────────────────────────────────────────

const BACKUP_URL = 'http://127.0.0.1:3001/api/backup/trigger?async=true';
const BACKUP_TOKEN = 'sb_secret_Oay759_VoPC2O_ifxAfcSA_09LkApAM';

function triggerRealtimeDbBackup(collectionName, actionType) {
  try {
    const res = $http.send({
      method: 'POST',
      url: BACKUP_URL,
      headers: {
        'x-backup-token': BACKUP_TOKEN
      }
    });

    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`⚡ [DBBackup] Triggered real-time backup after ${actionType} on ${collectionName}`);
    } else {
      console.log(`❌ [DBBackup] Failed to trigger backup: HTTP ${res.statusCode}`);
    }
  } catch (err) {
    console.log(`❌ [DBBackup] Error calling backup API: ${err}`);
  }
}

// Dynamically load all user collections from the database catalog
const result = arrayOf(new DynamicModel({ name: "" }));
$app.db()
  .select("name")
  .from("_collections")
  .all(result);

const TRACKED_COLLECTIONS = result
  .map(r => r.name)
  .filter(name => !name.startsWith('_') || name === '_superusers');

TRACKED_COLLECTIONS.forEach(collectionName => {
  onRecordAfterCreateSuccess((e) => {
    const colName = e.record.collection().name;
    triggerRealtimeDbBackup(colName, 'create');
  }, collectionName);

  onRecordAfterUpdateSuccess((e) => {
    const colName = e.record.collection().name;
    triggerRealtimeDbBackup(colName, 'update');
  }, collectionName);

  onRecordAfterDeleteSuccess((e) => {
    const colName = e.record.collection().name;
    triggerRealtimeDbBackup(colName, 'delete');
  }, collectionName);
});

console.log(`✅ [DBBackup] Registered real-time database sync hooks for ${TRACKED_COLLECTIONS.length} collections.`);
