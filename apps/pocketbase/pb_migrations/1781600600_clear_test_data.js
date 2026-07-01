migrate((app) => {
  const tablesToClear = [
    'trip_logs',
    'expenses_fuel',
    'expenses_fastag',
    'expenses_driver_advance',
    'expenses_maintenance',
    'expenses_miscellaneous',
    'fastag_transactions',
    'attendance',
    'payroll',
    'truck_documents',
    'todos',
    'employee_documents',
    'fuel_payments',
    'payment_due_dates',
    'payment_records',
    'fastag_recharges',
    'expenses',
    'bulk_upload_history',
    'delivery_proofs',
    'cashbook',
    'invitations',
    'user_sessions',
    'audit_logs',
    'reminders',
    'bills',
    'quotes',
    'invoices',
    'advances',
    'salary_payments',
    'client_shipments',
    'client_invoices',
    'client_payments',
    'signup_requests',
    'payment_requests',
    'maintenance_schedules',
    'maintenance_records',
    'cashbooks',
    'cashbook_transactions',
    'fuel_tracker',
    'planned_surcharge_payments',
    'tyres',
    'maintenance_logs',
    'maintenance_reminders',
    'parts_installed',
    'maintenance_problems',
    'attendance_records',
    'inventory_items',
    'restock_history',
    'stock_deductions',
    'inventory_value_snapshots',
    'loan_profiles',
    'exit_audits',
    'driver_accident_reports',
    'trip_calculations',
    'tyre_rotations',
    'billing_cycles',
    'service_intervals',
    'monthly_inspections',
    'service_logs',
    'driver_ledger'
  ];

  for (const table of tablesToClear) {
    try {
      app.db().newQuery(`DELETE FROM "${table}"`).execute();
      console.log(`Successfully cleared table: ${table}`);
    } catch (e) {
      console.log(`Failed to clear table ${table}: ${e.message}`);
    }
  }
}, (app) => {
  // rollback (no-op)
})
