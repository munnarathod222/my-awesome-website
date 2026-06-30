/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Add fields to "clients"
  const clientsCol = app.findCollectionByNameOrId("clients");
  
  if (!clientsCol.fields.getByName("isTdsApplicable")) {
    clientsCol.fields.add(new BoolField({
      name: "isTdsApplicable",
      required: false
    }));
  }
  
  if (!clientsCol.fields.getByName("tdsRate")) {
    clientsCol.fields.add(new NumberField({
      name: "tdsRate",
      required: false
    }));
  }
  
  app.save(clientsCol);

  // 2. Add fields to "trip_logs"
  const tripsCol = app.findCollectionByNameOrId("trip_logs");
  
  if (!tripsCol.fields.getByName("tds_deducted_receivable")) {
    tripsCol.fields.add(new NumberField({
      name: "tds_deducted_receivable",
      required: false
    }));
  }
  
  return app.save(tripsCol);
}, (app) => {
  try {
    const clientsCol = app.findCollectionByNameOrId("clients");
    clientsCol.fields.removeByName("isTdsApplicable");
    clientsCol.fields.removeByName("tdsRate");
    app.save(clientsCol);

    const tripsCol = app.findCollectionByNameOrId("trip_logs");
    tripsCol.fields.removeByName("tds_deducted_receivable");
    return app.save(tripsCol);
  } catch (e) {
    throw e;
  }
});
