/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collections = ["maintenance_problems", "parts_installed", "inventory_items", "expenses"];

  for (const name of collections) {
    try {
      const collection = app.findCollectionByNameOrId(name);
      
      const existing = collection.fields.getByName("image_urls");
      if (existing) {
        if (existing.type === "file") {
          continue;
        }
        collection.fields.removeByName("image_urls");
      }

      collection.fields.add(new FileField({
        name: "image_urls",
        maxSelect: 10,
        maxSize: 5242880, // 5MB limit
        mimeTypes: ["image/jpeg", "image/png", "image/jpg"]
      }));

      app.save(collection);
      console.log(`Successfully added image_urls FileField to ${name}`);
    } catch (e) {
      console.error(`Failed to update collection ${name}:`, e);
    }
  }
}, (app) => {
  const collections = ["maintenance_problems", "parts_installed", "inventory_items", "expenses"];
  for (const name of collections) {
    try {
      const collection = app.findCollectionByNameOrId(name);
      collection.fields.removeByName("image_urls");
      app.save(collection);
    } catch (e) {}
  }
})
