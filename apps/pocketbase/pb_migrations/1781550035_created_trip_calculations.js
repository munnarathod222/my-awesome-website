/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const usersCollection = app.findCollectionByNameOrId("users");

  const collection = new Collection({
    "id": "pbc_trip_calculations_01",
    "name": "trip_calculations",
    "type": "base",
    "system": false,
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "listRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "id": "text_id_trip_calcs",
        "name": "id",
        "type": "text",
        "primaryKey": true,
        "required": true,
        "system": true,
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false
      },
      {
        "id": "text_route_trip_calcs",
        "name": "route_name",
        "type": "text",
        "required": true
      },
      {
        "id": "text_vehicle_trip_calcs",
        "name": "vehicle_number",
        "type": "text",
        "required": false
      },
      {
        "id": "number_dist_trip_calcs",
        "name": "distance",
        "type": "number",
        "required": false
      },
      {
        "id": "number_fuel_p_trip_calcs",
        "name": "fuel_price",
        "type": "number",
        "required": false
      },
      {
        "id": "number_mileage_trip_calcs",
        "name": "mileage",
        "type": "number",
        "required": false
      },
      {
        "id": "number_tolls_trip_calcs",
        "name": "tolls",
        "type": "number",
        "required": false
      },
      {
        "id": "number_driver_exp_trip_calcs",
        "name": "driver_expenses",
        "type": "number",
        "required": false
      },
      {
        "id": "number_tyre_dep_trip_calcs",
        "name": "tyre_depreciation_rate",
        "type": "number",
        "required": false
      },
      {
        "id": "number_tyre_exp_trip_calcs",
        "name": "tyre_expense",
        "type": "number",
        "required": false
      },
      {
        "id": "number_fuel_c_trip_calcs",
        "name": "fuel_cost",
        "type": "number",
        "required": false
      },
      {
        "id": "number_emi_trip_calcs",
        "name": "vehicle_emi",
        "type": "number",
        "required": false
      },
      {
        "id": "number_ins_trip_calcs",
        "name": "insurance",
        "type": "number",
        "required": false
      },
      {
        "id": "number_tax_trip_calcs",
        "name": "quarterly_tax",
        "type": "number",
        "required": false
      },
      {
        "id": "number_revenue_trip_calcs",
        "name": "freight_revenue",
        "type": "number",
        "required": false
      },
      {
        "id": "number_tot_exp_trip_calcs",
        "name": "total_expenses",
        "type": "number",
        "required": false
      },
      {
        "id": "number_profit_trip_calcs",
        "name": "net_profit",
        "type": "number",
        "required": false
      },
      {
        "id": "number_margin_trip_calcs",
        "name": "profit_margin",
        "type": "number",
        "required": false
      },
      {
        "id": "relation_user_trip_calcs",
        "name": "user_id",
        "type": "relation",
        "required": false,
        "collectionId": usersCollection.id,
        "maxSelect": 1
      },
      {
        "id": "autodate_created_trip_calcs",
        "name": "created",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": false
      },
      {
        "id": "autodate_updated_trip_calcs",
        "name": "updated",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": true
      }
    ]
  });

  try {
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("Collection name must be unique")) {
      console.log("Collection already exists, skipping");
      return;
    }
    throw e;
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_trip_calculations_01");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
