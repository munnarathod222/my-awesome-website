/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Create bids collection if not exists
  try {
    let bidsCol;
    try {
      bidsCol = app.findCollectionByNameOrId("bids");
    } catch (_) {
      bidsCol = new Collection({
        name: "bids",
        type: "base",
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: "",
        fields: [
          new TextField({ name: "date", required: false }),
          new TextField({ name: "bid_date", required: false }),
          new TextField({ name: "client_name", required: false }),
          new TextField({ name: "counterparty", required: false }),
          new TextField({ name: "role", required: false }),
          new TextField({ name: "underlying_client", required: false }),
          new TextField({ name: "bidding_type", required: false }),
          new TextField({ name: "bid_type", required: false }),
          new TextField({ name: "vehicle_type", required: false }),
          new TextField({ name: "truck_type", required: false }),
          new NumberField({ name: "bidding_amount", required: false }),
          new NumberField({ name: "quoted_amount", required: false }),
          new NumberField({ name: "quoted_rate", required: false }),
          new NumberField({ name: "bidding_lost_at", required: false }),
          new NumberField({ name: "actual_winning_rate", required: false }),
          new TextField({ name: "trip_detail", required: false }),
          new TextField({ name: "starting_point", required: false }),
          new TextField({ name: "origin", required: false }),
          new TextField({ name: "ending_point", required: false }),
          new TextField({ name: "destination", required: false }),
          new NumberField({ name: "no_of_stops", required: false }),
          new TextField({ name: "route_map", required: false }),
          new TextField({ name: "status", required: false }),
          new TextField({ name: "result", required: false }),
          new NumberField({ name: "distance_km", required: false }),
          new NumberField({ name: "payload_tons", required: false }),
          new NumberField({ name: "trips_count", required: false }),
          new NumberField({ name: "monthly_trips", required: false }),
          new TextField({ name: "contract_ref", required: false }),
          new TextField({ name: "contract_date", required: false }),
          new NumberField({ name: "contract_months", required: false }),
          new NumberField({ name: "dedicated_trucks", required: false }),
          new TextField({ name: "load_type", required: false }),
          new TextField({ name: "notes", required: false }),
          new TextField({ name: "created_by", required: false })
        ]
      });
      app.save(bidsCol);
    }

    if (bidsCol) {
      bidsCol.listRule = "";
      bidsCol.viewRule = "";
      bidsCol.createRule = "";
      bidsCol.updateRule = "";
      bidsCol.deleteRule = "";
      app.save(bidsCol);
    }
  } catch (e) {
    console.warn("bids collection migration notice:", e);
  }

  // 2. Create contracts collection if not exists
  try {
    let contractsCol;
    try {
      contractsCol = app.findCollectionByNameOrId("contracts");
    } catch (_) {
      contractsCol = new Collection({
        name: "contracts",
        type: "base",
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: "",
        fields: [
          new TextField({ name: "contract_ref", required: false }),
          new TextField({ name: "counterparty", required: false }),
          new TextField({ name: "client_name", required: false }),
          new TextField({ name: "role", required: false }),
          new TextField({ name: "underlying_client", required: false }),
          new TextField({ name: "origin", required: false }),
          new TextField({ name: "destination", required: false }),
          new TextField({ name: "truck_type", required: false }),
          new NumberField({ name: "rate", required: false }),
          new NumberField({ name: "monthly_trips", required: false }),
          new NumberField({ name: "dedicated_trucks", required: false }),
          new TextField({ name: "contract_start", required: false }),
          new TextField({ name: "contract_end", required: false }),
          new TextField({ name: "status", required: false }),
          new TextField({ name: "notes", required: false }),
          new TextField({ name: "created_by", required: false })
        ]
      });
      app.save(contractsCol);
    }

    if (contractsCol) {
      contractsCol.listRule = "";
      contractsCol.viewRule = "";
      contractsCol.createRule = "";
      contractsCol.updateRule = "";
      contractsCol.deleteRule = "";
      app.save(contractsCol);
    }
  } catch (e) {
    console.warn("contracts collection migration notice:", e);
  }
}, (app) => {
  // no-op down migration
});
