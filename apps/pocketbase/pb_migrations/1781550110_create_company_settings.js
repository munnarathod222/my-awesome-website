/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "id": "pbc_company_settings",
    "name": "company_settings",
    "type": "base",
    "system": false,
    "createRule": "@request.auth.role = 'super_admin' || @request.auth.role = 'admin'",
    "deleteRule": "@request.auth.role = 'super_admin' || @request.auth.role = 'admin'",
    "listRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.role = 'super_admin' || @request.auth.role = 'admin'",
    "viewRule": "@request.auth.id != ''",
    "fields": [
      {
        "id": "company_settings_id",
        "name": "id",
        "type": "text",
        "primaryKey": true,
        "required": true,
        "system": true,
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false
      },
      {
        "id": "company_settings_name",
        "name": "company_name",
        "type": "text",
        "required": true
      },
      {
        "id": "company_settings_logo",
        "name": "company_logo",
        "type": "file",
        "maxSelect": 1,
        "maxSize": 5242880,
        "mimeTypes": ["image/jpeg", "image/png", "image/gif", "image/webp"]
      },
      {
        "id": "company_settings_address",
        "name": "company_address",
        "type": "text",
        "required": false
      },
      {
        "id": "company_settings_phone",
        "name": "company_phone",
        "type": "text",
        "required": false
      },
      {
        "id": "company_settings_email",
        "name": "company_email",
        "type": "text",
        "required": false
      },
      {
        "id": "company_settings_website",
        "name": "company_website",
        "type": "text",
        "required": false
      },
      {
        "id": "company_settings_gstin",
        "name": "company_gstin",
        "type": "text",
        "required": false
      },
      {
        "id": "company_settings_created",
        "name": "created",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": false
      },
      {
        "id": "company_settings_updated",
        "name": "updated",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": true
      }
    ]
  });

  app.save(collection);

  // Seed default record
  const record = new Record(collection);
  record.id = "companysettings";
  record.set("company_name", "Jai Bhavani Cargo");
  record.set("company_address", "Plot No. 12, Transport Nagar, Secunderabad");
  record.set("company_phone", "+91 98765 43210");
  record.set("company_email", "billing@jbcargo.com");
  record.set("company_website", "www.jaibhavanicargo.com");
  record.set("company_gstin", "");

  try {
    return app.save(record);
  } catch (e) {
    console.log("Failed to seed default settings record:", e.message);
    return;
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("company_settings");
    return app.delete(collection);
  } catch (e) {
    return;
  }
});
