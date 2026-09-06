/// <reference path="../pb_data/types.d.ts" />

// ──────────────────────────────────────────────────────────────────
// Immediate File Backup Hook
// Triggers an instant Supabase upload whenever any file-containing
// record is created or updated in PocketBase.
// This closes the gap where Render kills the process before the
// 3-second background sync can fire.
// ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = $os.getenv('SUPABASE_URL') || 'https://bwyashgnriarmuhosqov.supabase.co';
const SUPABASE_KEY = $os.getenv('SUPABASE_KEY') || $os.getenv('SUPABASE_SECRET') || $os.getenv('SUPABASE_SERVICE_ROLE_KEY') || 'sb_secret_Oay759_VoPC2O_ifxAfcSA_09LkApAM';
// Reference for verify_backup: uploadSingleFileToSupabase

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
    } else {
      baseDir = './pb_data';
    }
  }
  return `${baseDir}/storage/${collectionId}/${recordId}/${filename}`;
};

// Collections that store files (documents, images, bills, etc.)
const FILE_COLLECTIONS = [
  "users",
  "employees",
  "trucks",
  "trip_logs",
  "expenses_fuel",
  "expenses_fastag",
  "expenses_driver_advance",
  "expenses_maintenance",
  "expenses_miscellaneous",
  "truck_documents",
  "employee_documents",
  "expenses",
  "delivery_proofs",
  "bills",
  "invoices",
  "maintenance_records",
  "_integratedAiImages",
  "tyres",
  "parts_installed",
  "maintenance_problems",
  "inventory_items",
  "loan_profiles",
  "exit_audits",
  "driver_accident_reports",
  "company_settings",
  "service_logs"
];

// Register after-create and after-update hooks for file-containing collections
FILE_COLLECTIONS.forEach(collectionName => {
  onRecordAfterCreateSuccess((e) => {
    try {
      const record = e.record;
      const collectionId = record.collection().id;
      const recordId = record.id;

      // Get all file fields
      const collection = record.collection();
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
      console.log(`❌ [FileBackup] Error in after-create hook for ${colName}: ${err}`);
    }
  }, collectionName);

  onRecordAfterUpdateSuccess((e) => {
    try {
      const record = e.record;
      const collectionId = record.collection().id;
      const recordId = record.id;

      const collection = record.collection();
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
      console.log(`❌ [FileBackup] Error in after-update hook for ${colName}: ${err}`);
    }
  }, collectionName);
});

console.log('✅ [FileBackup] Immediate file backup hooks registered for all file-containing collections.');
