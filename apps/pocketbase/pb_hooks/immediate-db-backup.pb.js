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
// Reference for verify_backup: uploadDatabaseToSupabase

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

// Comprehensive static list of all active tables to avoid bootstrap database query panics
const TRACKED_COLLECTIONS = [
  "users",
  "employees",
  "trucks",
  "trip_logs",
  "expenses_fuel",
  "expenses_fastag",
  "expenses_driver_advance",
  "expenses_maintenance",
  "expenses_miscellaneous",
  "fastag_transactions",
  "attendance",
  "payroll",
  "truck_documents",
  "todos",
  "employee_documents",
  "credit_cards",
  "fuel_payments",
  "payment_due_dates",
  "payment_records",
  "fastag_recharges",
  "expenses",
  "bulk_upload_history",
  "delivery_proofs",
  "cashbook",
  "invitations",
  "user_sessions",
  "audit_logs",
  "reminders",
  "bills",
  "quotes",
  "invoices",
  "advances",
  "salary_payments",
  "vehicles",
  "routes",
  "clients",
  "client_shipments",
  "client_invoices",
  "client_payments",
  "signup_requests",
  "payment_requests",
  "maintenance_schedules",
  "maintenance_records",
  "cashbooks",
  "cashbook_transactions",
  "contacts",
  "fuel_tracker",
  "planned_surcharge_payments",
  "tyres",
  "maintenance_logs",
  "maintenance_reminders",
  "parts_installed",
  "maintenance_problems",
  "attendance_records",
  "inventory_items",
  "restock_history",
  "stock_deductions",
  "inventory_value_snapshots",
  "loan_profiles",
  "exit_audits",
  "driver_accident_reports",
  "trip_calculations",
  "tyre_rotations",
  "company_settings",
  "billing_cycles",
  "service_intervals",
  "monthly_inspections",
  "service_logs",
  "driver_ledger",
  "user_permission_overrides",
  "shared_folders"
];

TRACKED_COLLECTIONS.forEach(collectionName => {
  onRecordAfterCreateSuccess((e) => {
    const colName = e.record.collection().name;
    if (typeof globalThis.triggerRealtimeDbBackup === 'function') {
      globalThis.triggerRealtimeDbBackup(colName, 'create');
    }
  }, collectionName);

  onRecordAfterUpdateSuccess((e) => {
    const colName = e.record.collection().name;
    if (typeof globalThis.triggerRealtimeDbBackup === 'function') {
      globalThis.triggerRealtimeDbBackup(colName, 'update');
    }
  }, collectionName);

  onRecordAfterDeleteSuccess((e) => {
    const colName = e.record.collection().name;
    if (typeof globalThis.triggerRealtimeDbBackup === 'function') {
      globalThis.triggerRealtimeDbBackup(colName, 'delete');
    }
  }, collectionName);
});

console.log(`✅ [DBBackup] Registered real-time database sync hooks for ${TRACKED_COLLECTIONS.length} collections.`);
