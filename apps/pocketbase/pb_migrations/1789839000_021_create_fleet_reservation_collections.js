/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    // 1. Create truck_reservations collection
    let existingReservations = null;
    try {
      existingReservations = app.findCollectionByNameOrId("truck_reservations");
    } catch (_) {}

    if (!existingReservations) {
      const reservations = new Collection({
        name: "truck_reservations",
        type: "base",
        system: false,
        fields: [
          new TextField({ name: "booking_number", required: true }),
          new SelectField({
            name: "reservation_type",
            values: ["Confirmed", "Provisional", "Booking Request"],
            required: true
          }),
          new SelectField({
            name: "status",
            values: [
              "Pending",
              "Approved",
              "Confirmed",
              "Allocated",
              "In Transit",
              "Completed",
              "Cancelled",
              "Rejected"
            ],
            required: true
          }),
          new TextField({ name: "customer_id", required: false }),
          new TextField({ name: "customer_name", required: true }),
          new TextField({ name: "customer_phone", required: true }),
          new TextField({ name: "customer_email", required: false }),
          new TextField({ name: "truck_id", required: false }),
          new TextField({ name: "truck_number", required: false }),
          new TextField({ name: "vehicle_category", required: false }),
          new TextField({ name: "origin", required: true }),
          new TextField({ name: "destination", required: true }),
          new TextField({ name: "loading_datetime", required: true }),
          new TextField({ name: "expected_unloading_datetime", required: false }),
          new TextField({ name: "reserved_from", required: false }),
          new TextField({ name: "reserved_to", required: false }),
          new NumberField({ name: "cargo_weight_tons", required: false }),
          new TextField({ name: "cargo_description", required: false }),
          new TextField({ name: "special_requirements", required: false }),
          new NumberField({ name: "indicative_freight", required: false }),
          new NumberField({ name: "final_agreed_freight", required: false }),
          new SelectField({
            name: "payment_status",
            values: ["Pending", "Partial Advance", "Confirmed", "Paid", "Credit Billed"],
            required: false
          }),
          new NumberField({ name: "advance_amount", required: false }),
          new TextField({ name: "linked_trip_id", required: false }),
          new TextField({ name: "upstream_trip_id", required: false }),
          new NumberField({ name: "match_score", required: false }),
          new JSONField({ name: "match_reasons", required: false }),
          new JSONField({ name: "approval_history", required: false }),
          new TextField({ name: "rejection_reason", required: false }),
          new TextField({ name: "cancellation_reason", required: false }),
          new TextField({ name: "created_by", required: false })
        ],
        indexes: [
          "CREATE UNIQUE INDEX idx_res_booking_num ON truck_reservations (booking_number)",
          "CREATE INDEX idx_res_truck ON truck_reservations (truck_number)",
          "CREATE INDEX idx_res_dates ON truck_reservations (reserved_from, reserved_to)",
          "CREATE INDEX idx_res_status ON truck_reservations (status)"
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: ""
      });
      app.save(reservations);
      console.log("Migration: Created truck_reservations collection.");
    }

    // 2. Create truck_availability_blocks collection
    let existingBlocks = null;
    try {
      existingBlocks = app.findCollectionByNameOrId("truck_availability_blocks");
    } catch (_) {}

    if (!existingBlocks) {
      const blocks = new Collection({
        name: "truck_availability_blocks",
        type: "base",
        system: false,
        fields: [
          new TextField({ name: "truck_id", required: false }),
          new TextField({ name: "truck_number", required: true }),
          new SelectField({
            name: "block_type",
            values: [
              "Maintenance",
              "Breakdown",
              "Document Expired",
              "Personal Use",
              "Operational Hold",
              "RTO Inspection",
              "Other"
            ],
            required: true
          }),
          new TextField({ name: "reason", required: true }),
          new TextField({ name: "start_time", required: true }),
          new TextField({ name: "end_time", required: true }),
          new TextField({ name: "created_by", required: false }),
          new TextField({ name: "notes", required: false })
        ],
        indexes: [
          "CREATE INDEX idx_block_truck ON truck_availability_blocks (truck_number)",
          "CREATE INDEX idx_block_times ON truck_availability_blocks (start_time, end_time)"
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: ""
      });
      app.save(blocks);
      console.log("Migration: Created truck_availability_blocks collection.");
    }

    // 3. Create truck_availability_forecasts collection
    let existingForecasts = null;
    try {
      existingForecasts = app.findCollectionByNameOrId("truck_availability_forecasts");
    } catch (_) {}

    if (!existingForecasts) {
      const forecasts = new Collection({
        name: "truck_availability_forecasts",
        type: "base",
        system: false,
        fields: [
          new TextField({ name: "truck_id", required: false }),
          new TextField({ name: "truck_number", required: true }),
          new TextField({ name: "vehicle_category", required: false }),
          new TextField({ name: "current_location", required: false }),
          new TextField({ name: "predicted_location", required: false }),
          new TextField({ name: "current_trip_id", required: false }),
          new TextField({ name: "expected_destination", required: false }),
          new TextField({ name: "estimated_arrival", required: false }),
          new TextField({ name: "expected_unloading_completed", required: false }),
          new TextField({ name: "earliest_next_departure", required: false }),
          new NumberField({ name: "prediction_confidence", required: false }),
          new SelectField({
            name: "prediction_status",
            values: [
              "Available",
              "Booked",
              "Booking Requested",
              "In Transit",
              "Loading",
              "Unloading",
              "Waiting",
              "Expected Available",
              "Maintenance",
              "Breakdown",
              "Documents Expired",
              "Schedule Conflict"
            ],
            required: false
          }),
          new JSONField({ name: "data_sources", required: false }),
          new TextField({ name: "last_recalculated_at", required: false })
        ],
        indexes: [
          "CREATE INDEX idx_forecast_truck ON truck_availability_forecasts (truck_number)"
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: ""
      });
      app.save(forecasts);
      console.log("Migration: Created truck_availability_forecasts collection.");
    }

    // 4. Create prediction_logs collection
    let existingLogs = null;
    try {
      existingLogs = app.findCollectionByNameOrId("prediction_logs");
    } catch (_) {}

    if (!existingLogs) {
      const logs = new Collection({
        name: "prediction_logs",
        type: "base",
        system: false,
        fields: [
          new TextField({ name: "truck_id", required: false }),
          new TextField({ name: "truck_number", required: true }),
          new TextField({ name: "trip_id", required: false }),
          new TextField({ name: "predicted_arrival", required: true }),
          new TextField({ name: "actual_arrival", required: false }),
          new NumberField({ name: "variance_minutes", required: false }),
          new NumberField({ name: "accuracy_rate", required: false }),
          new TextField({ name: "logged_at", required: false })
        ],
        indexes: [
          "CREATE INDEX idx_pred_log_truck ON prediction_logs (truck_number)",
          "CREATE INDEX idx_pred_log_trip ON prediction_logs (trip_id)"
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: ""
      });
      app.save(logs);
      console.log("Migration: Created prediction_logs collection.");
    }
  } catch (e) {
    console.log("Migration notice for fleet reservation collections:", e.message);
  }
}, (app) => {});
