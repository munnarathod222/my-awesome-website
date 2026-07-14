/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("contacts");
  
  // Add google_maps_url field
  collection.fields.add(new SchemaField({
    name: "google_maps_url",
    type: "text",
    required: false,
    presentable: false,
    system: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("contacts");
  collection.fields.removeByName("google_maps_url");
  return app.save(collection);
})
