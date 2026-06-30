/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const clientsCol = app.findCollectionByNameOrId("clients");
  const collection = app.findCollectionByNameOrId("billing_cycles");

  const addFieldIfMissing = (name, fieldInstance) => {
    const existing = collection.fields.getByName(name);
    if (!existing) {
      collection.fields.add(fieldInstance);
    }
  };

  addFieldIfMissing("client_id", new RelationField({
    name: "client_id",
    collectionId: clientsCol.id,
    maxSelect: 1,
    required: true
  }));

  addFieldIfMissing("start_date", new DateField({
    name: "start_date",
    required: true
  }));

  addFieldIfMissing("end_date", new DateField({
    name: "end_date",
    required: true
  }));

  addFieldIfMissing("expected_payout_date", new DateField({
    name: "expected_payout_date",
    required: true
  }));

  addFieldIfMissing("status", new SelectField({
    name: "status",
    values: ["Draft", "Invoiced", "Settled"],
    maxSelect: 1,
    required: true
  }));

  addFieldIfMissing("invoiced_amount", new NumberField({
    name: "invoiced_amount",
    required: false
  }));

  addFieldIfMissing("collected_amount", new NumberField({
    name: "collected_amount",
    required: false
  }));

  addFieldIfMissing("is_manually_overridden", new BoolField({
    name: "is_manually_overridden",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("billing_cycles");
    collection.fields.removeByName("client_id");
    collection.fields.removeByName("start_date");
    collection.fields.removeByName("end_date");
    collection.fields.removeByName("expected_payout_date");
    collection.fields.removeByName("status");
    collection.fields.removeByName("invoiced_amount");
    collection.fields.removeByName("collected_amount");
    collection.fields.removeByName("is_manually_overridden");
    return app.save(collection);
  } catch (e) {
    throw e;
  }
});
