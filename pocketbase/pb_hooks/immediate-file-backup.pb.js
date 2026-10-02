/// <reference path="../pb_data/types.d.ts" />

// ──────────────────────────────────────────────────────────────────
// Immediate File Backup Hook for PocketBase
// Automatically uploads every newly created or updated file to
// Supabase Cloud Storage instantly upon saving.
// This prevents any uploaded bills from ever being lost on Render
// redeployments, restarts, or ephemeral disk wipes.
// ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = $os.getenv('SUPABASE_URL') || 'https://bwyashgnriarmuhosqov.supabase.co';
const SUPABASE_KEY = $os.getenv('SUPABASE_KEY') || $os.getenv('SUPABASE_SECRET') || $os.getenv('SUPABASE_SERVICE_ROLE_KEY') || '';

// Upload a single file to Supabase storage backup bucket
globalThis.uploadFileToSupabase = function(localPath, remoteRelPath) {
  try {
    if (!SUPABASE_KEY) {
      console.log('⚠️ [FileBackup] Supabase key not set in environment, skipping upload.');
      return;
    }
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
      console.log(`⚡ [FileBackup] Successfully uploaded to Supabase: ${remoteRelPath}`);
    } else {
      console.log(`❌ [FileBackup] Failed to upload ${remoteRelPath}: HTTP ${res.statusCode}`);
    }
  } catch (err) {
    console.log(`❌ [FileBackup] Error uploading ${remoteRelPath}: ${err}`);
  }
};

// Build the local path for a PocketBase file
globalThis.buildLocalPath = function(collectionId, recordId, filename) {
  let baseDir = '';
  try {
    if (typeof $app !== 'undefined' && typeof $app.dataDir === 'function') {
      baseDir = $app.dataDir();
    }
  } catch (e) {}

  if (!baseDir) {
    const isLinux = $os.getenv('HOME') !== '';
    const isRender = $os.getenv('RENDER') !== '' || $os.getenv('PORT') !== '';
    if (isLinux && (isRender || $os.exists('/opt/render/project/src/apps/pocketbase/pb_data'))) {
      baseDir = '/opt/render/project/src/apps/pocketbase/pb_data';
    } else if (isLinux && $os.exists('/data')) {
      baseDir = '/data';
    } else if ($os.exists('./apps/pocketbase/pb_data')) {
      baseDir = './apps/pocketbase/pb_data';
    } else if ($os.exists('./pocketbase/pb_data')) {
      baseDir = './pocketbase/pb_data';
    } else {
      baseDir = './pb_data';
    }
  }
  return `${baseDir}/storage/${collectionId}/${recordId}/${filename}`;
};

// Collections that store files (documents, images, bills, receipts, etc.)
const FILE_COLLECTIONS = [
  "expenses",
  "truck_documents",
  "employee_documents",
  "trip_logs",
  "maintenance_records",
  "bills",
  "invoices",
  "delivery_proofs",
  "tyres",
  "parts_installed",
  "maintenance_problems",
  "inventory_items",
  "users",
  "employees",
  "trucks"
];

function handleRecordFiles(record) {
  try {
    const col = record.collection();
    const collectionId = col.id || col.name;
    const collectionName = col.name;
    const recordId = record.id;

    col.fields.forEach(field => {
      if (field.type !== 'file') return;
      const files = record.get(field.name);
      if (!files) return;
      const fileList = Array.isArray(files) ? files : [files];
      fileList.forEach(filename => {
        if (!filename) return;
        const localPath = globalThis.buildLocalPath(collectionId, recordId, filename);
        const remotePath1 = `storage/${collectionId}/${recordId}/${filename}`;
        globalThis.uploadFileToSupabase(localPath, remotePath1);
        if (collectionName && collectionName !== collectionId) {
          const remotePath2 = `storage/${collectionName}/${recordId}/${filename}`;
          globalThis.uploadFileToSupabase(localPath, remotePath2);
        }
      });
    });
  } catch (err) {
    console.log(`❌ [FileBackup] Error processing record files: ${err}`);
  }
}

FILE_COLLECTIONS.forEach(collectionName => {
  onRecordAfterCreateSuccess((e) => {
    handleRecordFiles(e.record);
  }, collectionName);

  onRecordAfterUpdateSuccess((e) => {
    handleRecordFiles(e.record);
  }, collectionName);
});

console.log('✅ [FileBackup] Immediate file backup hook loaded for all file collections.');
