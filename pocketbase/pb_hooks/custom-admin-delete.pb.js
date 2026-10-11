/// <reference path="../pb_data/types.d.ts" />

/**
 * Custom PocketBase Admin Endpoint for Unrestricted Record Deletion
 * Route: POST /api/custom-delete/:collection/:id
 */
routerAdd("POST", "/api/custom-delete/:collection/:id", (c) => {
  const collectionName = c.pathParam("collection") || "";
  const targetId = c.pathParam("id") || "";

  if (!collectionName || !targetId) {
    return c.json(400, { success: false, error: "Both 'collection' and 'id' parameters are required." });
  }

  let deletedCount = 0;

  try {
    // 1. Try finding and deleting by primary key ID directly
    try {
      const record = $app.findRecordById(collectionName, targetId);
      if (record) {
        $app.delete(record);
        deletedCount++;
      }
    } catch (e1) {}

    // 2. Fallback: filter search by custom code fields (trip_id, employee_number, contact)
    if (deletedCount === 0) {
      try {
        let filterStr = `id = "${targetId}"`;
        if (collectionName === 'trip_logs') {
          filterStr += ` || trip_id = "${targetId}"`;
        } else if (collectionName === 'employees') {
          filterStr += ` || contact = "${targetId}" || name = "${targetId}"`;
        }

        const foundRecords = $app.findRecordsByFilter(collectionName, filterStr, "-created", 50, 0);
        for (const rec of foundRecords) {
          try {
            $app.delete(rec);
            deletedCount++;
          } catch (delErr) {
            console.error(`Failed to delete record ${rec.id}:`, delErr);
          }
        }
      } catch (e2) {}
    }

    console.log(`[CustomDeleteHook] Successfully deleted ${deletedCount} record(s) from collection '${collectionName}' for target '${targetId}'`);
    return c.json(200, { success: true, deletedCount, message: `Successfully deleted ${deletedCount} record(s)` });
  } catch (err) {
    console.error(`[CustomDeleteHook] Error deleting record from ${collectionName}:`, err);
    return c.json(500, { success: false, error: err.message });
  }
});
