/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trucks");

  // Add manager_id relation pointing to users (_pb_users_auth_)
  if (!collection.fields.getByName("manager_id")) {
    collection.fields.add(new RelationField({
      name: "manager_id",
      required: false,
      collectionId: "_pb_users_auth_",
      maxSelect: 1
    }));
  }

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trucks");
    collection.fields.removeByName("manager_id");
    return app.save(collection);
  } catch (e) {
    throw e;
  }
})
