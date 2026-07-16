/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const driverLedgerCol = app.findCollectionByNameOrId("driver_ledger");
  
  if (!driverLedgerCol.fields.getByName("driver_id")) {
    driverLedgerCol.fields.add(new RelationField({ name: "driver_id", collectionId: "pbc_9297853740", maxSelect: 1, required: true }));
  }
  if (!driverLedgerCol.fields.getByName("trip_id")) {
    driverLedgerCol.fields.add(new RelationField({ name: "trip_id", collectionId: "pbc_2315080054", maxSelect: 1, required: true }));
  }
  if (!driverLedgerCol.fields.getByName("route_rate")) {
    driverLedgerCol.fields.add(new NumberField({ name: "route_rate", required: true }));
  }
  if (!driverLedgerCol.fields.getByName("advance_paid")) {
    driverLedgerCol.fields.add(new NumberField({ name: "advance_paid", required: true }));
  }
  if (!driverLedgerCol.fields.getByName("balance_due")) {
    driverLedgerCol.fields.add(new NumberField({ name: "balance_due", required: true }));
  }
  if (!driverLedgerCol.fields.getByName("status")) {
    driverLedgerCol.fields.add(new TextField({ name: "status", required: true }));
  }
  
  app.save(driverLedgerCol);
  return null;
}, (app) => {
  // rollback (no-op)
  return null;
});
