/// <reference path="../pb_data/types.d.ts" />

// ──────────────────────────────────────────────────────────────────
// Immediate File Backup Hook
// Triggers an instant Supabase upload whenever any file-containing
// record is created or updated in ANY collection in PocketBase.
// Dynamically inspects record fields at runtime to detect and back up
// uploads, eliminating static collection lists.
// ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://bwyashgnriarmuhosqov.supabase.co';
const SUPABASE_KEY = 'sb_secret_Oay759_VoPC2O_ifxAfcSA_09LkApAM';

// Upload a single file to Supabase storage backup bucket
globalThis.uploadFileToSupabase = function(localPath, remoteRelPath) {
  try {
    const fileBytes = $os.readFile(localPath);
    if (!fileBytes || fileBytes.length === 0) return;

    const res = $http.send({
      method: 'POST',
      url: `${SUPABASE_URL}/storage/v1/object/backups/${remoteRelPath}`,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'x-upsert': 'true',
        'Content-Type': 'application/octet-stream'
      },
      body: fileBytes
    });

    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`⚡ [FileBackup] Uploaded: ${remoteRelPath}`);
    } else {
      console.log(`❌ [FileBackup] Failed ${remoteRelPath}: HTTP ${res.statusCode}`);
    }
  } catch (err) {
    console.log(`❌ [FileBackup] Error uploading ${remoteRelPath}: ${err}`);
  }
};

// Build the local path for a PocketBase file
globalThis.buildLocalPath = function(collectionId, recordId, filename) {
  // PocketBase stores files at: pb_data/storage/{collectionId}/{recordId}/{filename}
  const isLinux = $os.getenv('HOME') !== '';
  const baseDir = isLinux && $os.exists('/data') ? '/data' : '';
  if (baseDir) {
    return `${baseDir}/storage/${collectionId}/{recordId}/${filename}`;
  }
  // Fallback: relative to cwd
  return `./pb_data/storage/${collectionId}/{recordId}/${filename}`;
};

// Register global after-create and after-update hooks for all collections
onRecordAfterCreateSuccess((e) => {
  try {
    const record = e.record;
    const collection = record.collection();
    const collectionId = collection.id;
    const recordId = record.id;

    // Dynamically iterate over all fields to check for file type fields
    collection.fields.forEach(field => {
      if (field.type !== 'file') return;
      const files = record.get(field.name);
      if (!files) return;
      const fileList = Array.isArray(files) ? files : [files];
      fileList.forEach(filename => {
        if (!filename) return;
        if (typeof globalThis.buildLocalPath === 'function' && typeof globalThis.uploadFileToSupabase === 'function') {
          const localPath = globalThis.buildLocalPath(collectionId, recordId, filename);
          const remotePath = `storage/${collectionId}/${recordId}/${filename}`;
          globalThis.uploadFileToSupabase(localPath, remotePath);
        }
      });
    });
  } catch (err) {
    const colName = e.record.collection().name;
    console.log(`❌ [FileBackup] Error in global after-create hook for ${colName}: ${err}`);
  }
});

onRecordAfterUpdateSuccess((e) => {
  try {
    const record = e.record;
    const collection = record.collection();
    const collectionId = collection.id;
    const recordId = record.id;

    // Dynamically iterate over all fields to check for file type fields
    collection.fields.forEach(field => {
      if (field.type !== 'file') return;
      const files = record.get(field.name);
      if (!files) return;
      const fileList = Array.isArray(files) ? files : [files];
      fileList.forEach(filename => {
        if (!filename) return;
        if (typeof globalThis.buildLocalPath === 'function' && typeof globalThis.uploadFileToSupabase === 'function') {
          const localPath = globalThis.buildLocalPath(collectionId, recordId, filename);
          const remotePath = `storage/${collectionId}/${recordId}/${filename}`;
          globalThis.uploadFileToSupabase(localPath, remotePath);
        }
      });
    });
  } catch (err) {
    const colName = e.record.collection().name;
    console.log(`❌ [FileBackup] Error in global after-update hook for ${colName}: ${err}`);
  }
});

console.log('✅ [FileBackup] Registered real-time file backup hooks globally for all collections.');
