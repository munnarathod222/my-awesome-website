/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "id": "pbc_driver_apps_01",
    "name": "driver_applications",
    "type": "base",
    "system": false,
    "createRule": "", // Allow anonymous public submissions
    "deleteRule": "@request.auth.id != \"\"",
    "listRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "id": "text_id_driver_apps",
        "name": "id",
        "type": "text",
        "primaryKey": true,
        "required": true,
        "system": true,
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false
      },
      {
        "id": "text_role_driver_apps",
        "name": "applicant_role",
        "type": "text",
        "required": false
      },
      {
        "id": "text_name_driver_apps",
        "name": "full_name",
        "type": "text",
        "required": true
      },
      {
        "id": "text_phone_driver_apps",
        "name": "phone",
        "type": "text",
        "required": true
      },
      {
        "id": "text_email_driver_apps",
        "name": "email",
        "type": "text",
        "required": false
      },
      {
        "id": "text_dob_driver_apps",
        "name": "dob",
        "type": "text",
        "required": false
      },
      {
        "id": "text_address_driver_apps",
        "name": "address",
        "type": "text",
        "required": false
      },
      {
        "id": "text_city_driver_apps",
        "name": "city",
        "type": "text",
        "required": true
      },
      {
        "id": "text_state_driver_apps",
        "name": "state",
        "type": "text",
        "required": true
      },
      {
        "id": "text_pan_driver_apps",
        "name": "pan_number",
        "type": "text",
        "required": false
      },
      {
        "id": "text_qual_driver_apps",
        "name": "qualification",
        "type": "text",
        "required": false
      },
      {
        "id": "text_lic_num_driver_apps",
        "name": "license_number",
        "type": "text",
        "required": false
      },
      {
        "id": "text_lic_type_driver_apps",
        "name": "license_type",
        "type": "text",
        "required": false
      },
      {
        "id": "text_lic_exp_driver_apps",
        "name": "license_expiry",
        "type": "text",
        "required": false
      },
      {
        "id": "number_exp_driver_apps",
        "name": "experience_years",
        "type": "number",
        "required": false,
        "min": 0
      },
      {
        "id": "text_prev_emp_driver_apps",
        "name": "previous_employer",
        "type": "text",
        "required": false
      },
      {
        "id": "text_prev_des_driver_apps",
        "name": "previous_designation",
        "type": "text",
        "required": false
      },
      {
        "id": "text_ref1_name_driver_apps",
        "name": "reference1_name",
        "type": "text",
        "required": false
      },
      {
        "id": "text_ref1_phone_driver_apps",
        "name": "reference1_phone",
        "type": "text",
        "required": false
      },
      {
        "id": "text_ref1_rel_driver_apps",
        "name": "reference1_relation",
        "type": "text",
        "required": false
      },
      {
        "id": "text_ref2_name_driver_apps",
        "name": "reference2_name",
        "type": "text",
        "required": false
      },
      {
        "id": "text_ref2_phone_driver_apps",
        "name": "reference2_phone",
        "type": "text",
        "required": false
      },
      {
        "id": "text_ref2_rel_driver_apps",
        "name": "reference2_relation",
        "type": "text",
        "required": false
      },
      {
        "id": "text_vehicles_driver_apps",
        "name": "vehicle_types",
        "type": "text",
        "required": false
      },
      {
        "id": "text_status_driver_apps",
        "name": "status",
        "type": "text",
        "required": false
      },
      {
        "id": "text_notes_driver_apps",
        "name": "notes",
        "type": "text",
        "required": false
      },
      {
        "id": "text_applied_date_driver_apps",
        "name": "applied_date",
        "type": "text",
        "required": false
      },
      {
        "id": "file_lic_driver_apps",
        "name": "license_file",
        "type": "file",
        "maxSelect": 1,
        "maxSize": 10485760
      },
      {
        "id": "file_photo_driver_apps",
        "name": "photo_file",
        "type": "file",
        "maxSelect": 1,
        "maxSize": 10485760
      },
      {
        "id": "file_pan_driver_apps",
        "name": "pan_file",
        "type": "file",
        "maxSelect": 1,
        "maxSize": 10485760
      },
      {
        "id": "autodate_created_driver_apps",
        "name": "created",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": false
      },
      {
        "id": "autodate_updated_driver_apps",
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
    const collection = app.findCollectionByNameOrId("pbc_driver_apps_01");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
});
