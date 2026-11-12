/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const existing = app.findCollectionByNameOrId("customer_vehicle_eligibility");
    if (!existing) {
      const collection = new Collection({
        name: "customer_vehicle_eligibility",
        type: "base",
        system: false,
        schema: [
          new TextField({ name: "truck_id", required: false }),
          new TextField({ name: "truck_number", required: false }),
          new TextField({ name: "client_id", required: false }),
          new TextField({ name: "customer_name", required: false }),
          new SelectField({ name: "eligibility_status", values: ["Approved", "Pending Approval", "Under Inspection", "Rejected", "Not Registered"] }),
          new TextField({ name: "customer_vehicle_code", required: false }),
          new NumberField({ name: "gps_integrated", required: false }),
          new TextField({ name: "inspection_date", required: false }),
          new TextField({ name: "valid_until", required: false }),
          new TextField({ name: "approval_doc", required: false }),
          new TextField({ name: "rejection_reason", required: false }),
          new TextField({ name: "remarks", required: false })
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: ""
      });
      app.save(collection);
      console.log("Migration: Created customer_vehicle_eligibility collection.");
    }
  } catch (e) {
    console.log("Migration notice for customer_vehicle_eligibility:", e.message);
  }
});
