/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    // 1. Create dedicated_subscriptions collection
    let existingSubs = null;
    try {
      existingSubs = app.findCollectionByNameOrId("dedicated_subscriptions");
    } catch (_) {}

    if (!existingSubs) {
      const subs = new Collection({
        name: "dedicated_subscriptions",
        type: "base",
        system: false,
        fields: [
          new TextField({ name: "subscription_code", required: true }),
          new TextField({ name: "customer_id", required: false }),
          new TextField({ name: "customer_name", required: true }),
          new TextField({ name: "company_name", required: true }),
          new TextField({ name: "customer_phone", required: true }),
          new TextField({ name: "customer_email", required: false }),
          new TextField({ name: "vehicle_category", required: true }),
          new TextField({ name: "assigned_truck_number", required: false }),
          new TextField({ name: "assigned_truck_id", required: false }),
          new TextField({ name: "start_date", required: true }),
          new TextField({ name: "end_date", required: true }),
          new NumberField({ name: "monthly_retainer_fee", required: true }),
          new NumberField({ name: "included_km_or_trips", required: false }),
          new NumberField({ name: "overage_rate_per_km", required: false }),
          new SelectField({
            name: "billing_cycle",
            values: ["Monthly Advance", "Bi-Weekly", "Per Trip Drawdown"],
            required: false
          }),
          new SelectField({
            name: "status",
            values: ["Pending Dispatch Review", "Active", "Suspended", "Completed", "Cancelled"],
            required: true
          }),
          new TextField({ name: "primary_operating_corridor", required: false }),
          new TextField({ name: "special_sla_notes", required: false }),
          new JSONField({ name: "assigned_drivers", required: false }),
          new TextField({ name: "created_by", required: false })
        ],
        indexes: [
          "CREATE UNIQUE INDEX idx_sub_code ON dedicated_subscriptions (subscription_code)",
          "CREATE INDEX idx_sub_truck ON dedicated_subscriptions (assigned_truck_number)",
          "CREATE INDEX idx_sub_status ON dedicated_subscriptions (status)"
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: ""
      });
      app.save(subs);
      console.log("Migration: Created dedicated_subscriptions collection.");
    }

    // 2. Create recurring_reservations collection
    let existingRec = null;
    try {
      existingRec = app.findCollectionByNameOrId("recurring_reservations");
    } catch (_) {}

    if (!existingRec) {
      const rec = new Collection({
        name: "recurring_reservations",
        type: "base",
        system: false,
        fields: [
          new TextField({ name: "recurrence_code", required: true }),
          new TextField({ name: "customer_name", required: true }),
          new TextField({ name: "customer_phone", required: true }),
          new TextField({ name: "customer_email", required: false }),
          new TextField({ name: "origin", required: true }),
          new TextField({ name: "destination", required: true }),
          new TextField({ name: "vehicle_category", required: true }),
          new TextField({ name: "assigned_truck_number", required: false }),
          new TextField({ name: "assigned_truck_id", required: false }),
          new JSONField({ name: "recurring_days", required: true }), // e.g. ["Monday", "Wednesday", "Friday"]
          new TextField({ name: "preferred_time", required: false }), // e.g. "18:00"
          new TextField({ name: "start_date", required: true }),
          new TextField({ name: "end_date", required: true }),
          new NumberField({ name: "rate_per_trip", required: true }),
          new SelectField({
            name: "status",
            values: ["Pending Dispatch Review", "Active", "Paused", "Completed", "Cancelled"],
            required: true
          }),
          new NumberField({ name: "trips_generated_count", required: false }),
          new TextField({ name: "special_instructions", required: false }),
          new TextField({ name: "created_by", required: false })
        ],
        indexes: [
          "CREATE UNIQUE INDEX idx_rec_code ON recurring_reservations (recurrence_code)",
          "CREATE INDEX idx_rec_truck ON recurring_reservations (assigned_truck_number)",
          "CREATE INDEX idx_rec_status ON recurring_reservations (status)"
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: ""
      });
      app.save(rec);
      console.log("Migration: Created recurring_reservations collection.");
    }

    // 3. Create partner_trucks collection (Attached Truck Owner Portal)
    let existingPartners = null;
    try {
      existingPartners = app.findCollectionByNameOrId("partner_trucks");
    } catch (_) {}

    if (!existingPartners) {
      const partners = new Collection({
        name: "partner_trucks",
        type: "base",
        system: false,
        fields: [
          new TextField({ name: "owner_name", required: true }),
          new TextField({ name: "owner_phone", required: true }),
          new TextField({ name: "owner_email", required: false }),
          new TextField({ name: "owner_pan", required: false }),
          new TextField({ name: "bank_account_number", required: false }),
          new TextField({ name: "bank_ifsc", required: false }),
          new TextField({ name: "truck_number", required: true }),
          new TextField({ name: "truck_type", required: true }),
          new NumberField({ name: "capacity_tons", required: true }),
          new TextField({ name: "rc_number", required: false }),
          new TextField({ name: "fitness_expiry", required: false }),
          new TextField({ name: "insurance_expiry", required: false }),
          new SelectField({
            name: "verification_status",
            values: ["Verified Active", "Pending Verification", "Inactive", "Blacklisted"],
            required: true
          }),
          new SelectField({
            name: "current_availability",
            values: ["Available for Trips", "On Assigned Trip", "Maintenance", "Not Available"],
            required: true
          }),
          new TextField({ name: "declared_empty_location", required: false }),
          new TextField({ name: "available_from_date", required: false }),
          new TextField({ name: "preferred_return_destination", required: false }),
          new NumberField({ name: "agreed_payout_rate", required: false }),
          new NumberField({ name: "total_trips_completed", required: false }),
          new NumberField({ name: "total_net_payout", required: false }),
          new TextField({ name: "remarks", required: false })
        ],
        indexes: [
          "CREATE UNIQUE INDEX idx_partner_truck ON partner_trucks (truck_number)",
          "CREATE INDEX idx_partner_phone ON partner_trucks (owner_phone)",
          "CREATE INDEX idx_partner_status ON partner_trucks (verification_status)"
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: ""
      });
      app.save(partners);
      console.log("Migration: Created partner_trucks collection.");
    }
  } catch (e) {
    console.log("Migration notice for fleet expansion modules:", e.message);
  }
}, (app) => {});
