/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const trucksCollection = app.findCollectionByNameOrId("trucks");
  const routesCollection = app.findCollectionByNameOrId("routes");
  const collection = app.findCollectionByNameOrId("employees");

  // 1. Add assigned_truck relation pointing to trucks
  const existingTruck = collection.fields.getByName("assigned_truck");
  if (existingTruck) {
    if (existingTruck.type !== "relation") {
      collection.fields.removeByName("assigned_truck");
      collection.fields.add(new RelationField({
        name: "assigned_truck",
        required: false,
        collectionId: trucksCollection.id,
        maxSelect: 1
      }));
    }
  } else {
    collection.fields.add(new RelationField({
      name: "assigned_truck",
      required: false,
      collectionId: trucksCollection.id,
      maxSelect: 1
    }));
  }

  // 2. Change assigned_routes text field to relation pointing to routes
  const existingRoute = collection.fields.getByName("assigned_routes");
  if (existingRoute) {
    if (existingRoute.type !== "relation") {
      collection.fields.removeByName("assigned_routes");
      collection.fields.add(new RelationField({
        name: "assigned_routes",
        required: false,
        collectionId: routesCollection.id,
        maxSelect: 1
      }));
    }
  } else {
    collection.fields.add(new RelationField({
      name: "assigned_routes",
      required: false,
      collectionId: routesCollection.id,
      maxSelect: 1
    }));
  }

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("employees");
    collection.fields.removeByName("assigned_truck");
    
    // Revert assigned_routes to text field
    collection.fields.removeByName("assigned_routes");
    collection.fields.add(new TextField({
      name: "assigned_routes",
      required: false
    }));
    
    return app.save(collection);
  } catch (e) {
    throw e;
  }
})
