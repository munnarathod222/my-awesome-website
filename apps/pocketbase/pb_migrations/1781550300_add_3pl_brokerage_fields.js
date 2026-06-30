/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Add fields to "trucks"
  const trucksCol = app.findCollectionByNameOrId("trucks");
  
  if (!trucksCol.fields.getByName("ownership_type")) {
    trucksCol.fields.add(new TextField({
      name: "ownership_type",
      required: false
    }));
  }
  
  app.save(trucksCol);

  // 2. Add fields to "trip_logs"
  const tripsCol = app.findCollectionByNameOrId("trip_logs");
  
  if (!tripsCol.fields.getByName("ownership_type")) {
    tripsCol.fields.add(new TextField({
      name: "ownership_type",
      required: false
    }));
  }

  if (!tripsCol.fields.getByName("payment_model")) {
    tripsCol.fields.add(new TextField({
      name: "payment_model",
      required: false
    }));
  }

  if (!tripsCol.fields.getByName("vendor_payout")) {
    tripsCol.fields.add(new NumberField({
      name: "vendor_payout",
      required: false
    }));
  }

  if (!tripsCol.fields.getByName("brokerage_margin")) {
    tripsCol.fields.add(new NumberField({
      name: "brokerage_margin",
      required: false
    }));
  }
  
  return app.save(tripsCol);
}, (app) => {
  try {
    const trucksCol = app.findCollectionByNameOrId("trucks");
    trucksCol.fields.removeByName("ownership_type");
    app.save(trucksCol);

    const tripsCol = app.findCollectionByNameOrId("trip_logs");
    tripsCol.fields.removeByName("ownership_type");
    tripsCol.fields.removeByName("payment_model");
    tripsCol.fields.removeByName("vendor_payout");
    tripsCol.fields.removeByName("brokerage_margin");
    return app.save(tripsCol);
  } catch (e) {
    throw e;
  }
});
