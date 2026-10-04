/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("clients");
    if (!collection) return;
    const field = collection.fields.getByName("client_type");
    if (field && Array.isArray(field.values)) {
      const requiredTypes = [
        "Broker",
        "3PL Broker",
        "Direct Client",
        "E-Commerce",
        "Pharma",
        "FMCG",
        "Retail",
        "Company",
        "Individual",
        "Distributor",
        "Retailer"
      ];
      let changed = false;
      requiredTypes.forEach(t => {
        if (!field.values.includes(t)) {
          field.values.push(t);
          changed = true;
        }
      });
      if (changed) {
        return app.save(collection);
      }
    }
  } catch (e) {
    console.log("Migration notice for clients client_type:", e.message);
  }
}, (app) => {});
