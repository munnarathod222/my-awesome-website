/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    let existing = null;
    try {
      existing = app.findCollectionByNameOrId("fuel_theft_reports");
    } catch (_) {}

    if (!existing) {
      const collection = new Collection({
        name: "fuel_theft_reports",
        type: "base",
        system: false,
        fields: [
          new TextField({ name: "incident_date", required: false }),
          new TextField({ name: "fuel_tracker_id", required: false }),
          new TextField({ name: "expense_id", required: false }),
          new TextField({ name: "driver_id", required: false }),
          new TextField({ name: "driver_name", required: false }),
          new TextField({ name: "truck_id", required: false }),
          new TextField({ name: "truck_number", required: false }),
          new TextField({ name: "petrol_pump_name", required: false }),
          new NumberField({ name: "billed_liters", required: false }),
          new NumberField({ name: "sensor_liters", required: false }),
          new NumberField({ name: "stolen_liters", required: false }),
          new NumberField({ name: "fuel_rate", required: false }),
          new NumberField({ name: "bleeding_amount", required: false }),
          new SelectField({ 
            name: "theft_type", 
            values: [
              "Pump Collusion / Short Fill",
              "Fuel Tank Siphoning",
              "Fake / Inflated Slip",
              "Sensor Drop en-route",
              "Other"
            ] 
          }),
          new SelectField({ 
            name: "status", 
            values: [
              "Reported",
              "Under Investigation",
              "Driver Confessed",
              "Deducted from Salary / Advance",
              "Forgiven / Closed",
              "Disputed"
            ] 
          }),
          new TextField({ name: "advance_deduction_id", required: false }),
          new FileField({ 
            name: "sensor_proof_file", 
            maxSelect: 5, 
            maxSize: 20971520,
            mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"] 
          }),
          new FileField({ 
            name: "fuel_bill_file", 
            maxSelect: 5, 
            maxSize: 20971520,
            mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"] 
          }),
          new TextField({ name: "notes", required: false }),
          new TextField({ name: "reported_by", required: false })
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: ""
      });
      app.save(collection);
      console.log("Migration: Created fuel_theft_reports collection.");
    }
  } catch (e) {
    console.log("Migration notice for fuel_theft_reports:", e.message);
  }
}, (app) => {});
