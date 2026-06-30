/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("trip_logs");
  const field = collection.fields.getByName("trip_status");
  field.values = ["Upcoming", "Dispatched", "In Transit", "Delivered"];
  app.save(collection);

  // Migrate existing statuses
  app.db().newQuery("UPDATE trip_logs SET trip_status = 'Upcoming' WHERE trip_status IN ('Pending', 'Cancelled', 'upcoming')").execute();
  app.db().newQuery("UPDATE trip_logs SET trip_status = 'In Transit' WHERE trip_status IN ('In Progress', 'in_progress', 'in transit', 'IN-TRANSIT')").execute();
  app.db().newQuery("UPDATE trip_logs SET trip_status = 'Delivered' WHERE trip_status IN ('Completed', 'completed', 'delivered')").execute();

  return null;
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("trip_logs");
    const field = collection.fields.getByName("trip_status");
    if (!field) { console.log("Field not found, skipping revert"); return; }
    field.values = ["Pending", "Upcoming", "In Progress", "Completed", "Cancelled"];
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
