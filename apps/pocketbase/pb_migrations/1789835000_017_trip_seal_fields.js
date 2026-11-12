/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = db.findCollectionByNameOrId("trip_logs");

  if (!collection.schema.hasField("is_sealed")) {
    collection.schema.addField(new SchemaField({
      name: "is_sealed",
      type: "bool",
      required: false,
      presentable: false,
      unique: false,
      options: {}
    }));
  }

  if (!collection.schema.hasField("seal_number")) {
    collection.schema.addField(new SchemaField({
      name: "seal_number",
      type: "text",
      required: false,
      presentable: false,
      unique: false,
      options: { min: null, max: null, pattern: "" }
    }));
  }

  if (!collection.schema.hasField("seal_numbers")) {
    collection.schema.addField(new SchemaField({
      name: "seal_numbers",
      type: "json",
      required: false,
      presentable: false,
      unique: false,
      options: { maxSize: 2000000 }
    }));
  }

  if (!collection.schema.hasField("seal_photo_url")) {
    collection.schema.addField(new SchemaField({
      name: "seal_photo_url",
      type: "text",
      required: false,
      presentable: false,
      unique: false,
      options: { min: null, max: null, pattern: "" }
    }));
  }

  return db.saveCollection(collection);
}, (db) => {
  const collection = db.findCollectionByNameOrId("trip_logs");
  collection.schema.removeField("is_sealed");
  collection.schema.removeField("seal_number");
  collection.schema.removeField("seal_numbers");
  collection.schema.removeField("seal_photo_url");
  return db.saveCollection(collection);
});
