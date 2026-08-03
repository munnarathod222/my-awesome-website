/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collections = [
    'users',
    'employees',
    'trucks',
    'trip_logs',
    'expenses',
    'cashbook',
    'attendance',
    'advances',
    'routes',
    'clients',
    'contacts',
    'reminders',
    'payroll',
    'fuel_tracker',
    'tyres',
    'loan_profiles',
    'driver_accident_reports',
    'trip_calculations',
    'payment_requests',
    'truck_documents',
    'employee_documents',
    'credit_cards',
    'payment_due_dates',
    'todos',
    'inventory_items',
    'service_logs',
    'driver_ledger',
    'company_settings'
  ];

  for (const name of collections) {
    try {
      const col = app.findCollectionByNameOrId(name);
      if (col) {
        col.listRule = "";
        col.viewRule = "";
        col.createRule = "";
        col.updateRule = "";
        col.deleteRule = "";
        app.save(col);
        console.log("[migration 1784310000] Opened rules for collection:", name);
      }
    } catch (err) {
      console.warn("[migration 1784310000] Could not update rules for collection:", name, err.message);
    }
  }
}, (app) => {
  // Rollback (no-op)
});
