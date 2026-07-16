/// <reference path="../pb_data/types.d.ts" />

// ──────────────────────────────────────────────────────────────────
// Real-Time Database Sync Hook
// Triggers an instant Supabase upload of the SQLite database (data.db)
// whenever ANY write operation (create, update, delete) is successfully
// committed on ANY collection in the database.
// This guarantees that all user and admin data changes — including
// system collections like _superusers, company settings, etc. —
// are saved to Supabase in real-time.
// ──────────────────────────────────────────────────────────────────

const BACKUP_URL = 'http://127.0.0.1:3001/api/backup/trigger?async=true';
const BACKUP_TOKEN = 'sb_secret_Oay759_VoPC2O_ifxAfcSA_09LkApAM';

globalThis.triggerRealtimeDbBackup = function(collectionName, actionType) {
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
};

// Register hooks globally for ALL collections in the database
onRecordAfterCreateSuccess((e) => {
  const colName = e.record.collection().name;
  if (typeof globalThis.triggerRealtimeDbBackup === 'function') {
    globalThis.triggerRealtimeDbBackup(colName, 'create');
  }
});

onRecordAfterUpdateSuccess((e) => {
  const colName = e.record.collection().name;
  if (typeof globalThis.triggerRealtimeDbBackup === 'function') {
    globalThis.triggerRealtimeDbBackup(colName, 'update');
  }
});

onRecordAfterDeleteSuccess((e) => {
  const colName = e.record.collection().name;
  if (typeof globalThis.triggerRealtimeDbBackup === 'function') {
    globalThis.triggerRealtimeDbBackup(colName, 'delete');
  }
});

console.log(`✅ [DBBackup] Registered real-time database sync hooks globally for all collections.`);
