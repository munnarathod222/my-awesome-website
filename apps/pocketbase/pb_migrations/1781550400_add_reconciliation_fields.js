/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Update Clients collection
  const clientsCol = app.findCollectionByNameOrId("clients");
  if (!clientsCol.fields.getByName("client_balance_due")) {
    clientsCol.fields.add(new NumberField({ name: "client_balance_due", required: false }));
  }
  if (!clientsCol.fields.getByName("unbilled_cycle_bucket")) {
    clientsCol.fields.add(new NumberField({ name: "unbilled_cycle_bucket", required: false }));
  }
  app.save(clientsCol);

  // 2. Create Driver Ledger collection
  let driverLedgerCol;
  try {
    driverLedgerCol = app.findCollectionByNameOrId("driver_ledger");
  } catch (err) {
    driverLedgerCol = new Collection({
      name: "driver_ledger",
      type: "base",
      fields: [
        new RelationField({ name: "driver_id", collectionId: "employees", maxSelect: 1, required: true }),
        new RelationField({ name: "trip_id", collectionId: "trip_logs", maxSelect: 1, required: true }),
        new NumberField({ name: "route_rate", required: true }),
        new NumberField({ name: "advance_paid", required: true }),
        new NumberField({ name: "balance_due", required: true }),
        new TextField({ name: "status", required: true })
      ]
    });
    app.save(driverLedgerCol);
  }

  return null;
}, (app) => {
  try {
    const clientsCol = app.findCollectionByNameOrId("clients");
    clientsCol.fields.removeByName("client_balance_due");
    clientsCol.fields.removeByName("unbilled_cycle_bucket");
    app.save(clientsCol);

    const driverLedger = app.findCollectionByNameOrId("driver_ledger");
    return app.delete(driverLedger);
  } catch (e) {
    throw e;
  }
});
