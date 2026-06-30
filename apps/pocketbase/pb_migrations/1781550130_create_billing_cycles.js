/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const clientsCol = app.findCollectionByNameOrId("clients");

  // 1. Create billing_cycles collection
  const billingCycles = new Collection({
    id: "pbc_billing_cycles",
    name: "billing_cycles",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    fields: [
      new RelationField({
        name: "client_id",
        collectionId: clientsCol.id,
        maxSelect: 1,
        required: true
      }),
      new DateField({
        name: "start_date",
        required: true
      }),
      new DateField({
        name: "end_date",
        required: true
      }),
      new DateField({
        name: "expected_payout_date",
        required: true
      }),
      new SelectField({
        name: "status",
        values: ["Draft", "Invoiced", "Settled"],
        maxSelect: 1,
        required: true
      }),
      new NumberField({
        name: "invoiced_amount",
        required: false
      }),
      new NumberField({
        name: "collected_amount",
        required: false
      }),
      new BoolField({
        name: "is_manually_overridden",
        required: false
      })
    ]
  });
  
  app.save(billingCycles);
  console.log("Successfully created billing_cycles collection");

  // 2. Add relation fields to trip_logs
  const tripLogs = app.findCollectionByNameOrId("trip_logs");
  
  const existingCycleId = tripLogs.fields.getByName("billing_cycle_id");
  if (!existingCycleId) {
    tripLogs.fields.add(new RelationField({
      name: "billing_cycle_id",
      collectionId: billingCycles.id,
      maxSelect: 1,
      required: false
    }));
  }

  const existingOverride = tripLogs.fields.getByName("is_manually_overridden");
  if (!existingOverride) {
    tripLogs.fields.add(new BoolField({
      name: "is_manually_overridden",
      required: false
    }));
  }

  app.save(tripLogs);
  console.log("Successfully added billing_cycle_id and is_manually_overridden fields to trip_logs");

}, (app) => {
  try {
    const tripLogs = app.findCollectionByNameOrId("trip_logs");
    tripLogs.fields.removeByName("billing_cycle_id");
    tripLogs.fields.removeByName("is_manually_overridden");
    app.save(tripLogs);

    const billingCycles = app.findCollectionByNameOrId("billing_cycles");
    app.delete(billingCycles);
    console.log("Successfully rolled back billing_cycles migration");
  } catch (e) {
    console.error("Rollback failed:", e);
  }
});
