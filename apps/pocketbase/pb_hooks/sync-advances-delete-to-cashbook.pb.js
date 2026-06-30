/// <reference path="../pb_data/types.d.ts" />
onRecordAfterDeleteSuccess((e) => {
  const record = e.record;
  
  try {
    const filter = 'reference_id = "' + record.id + '" && reference_type = "advance"';
    const cashbookRecords = $app.findRecordsByFilter("cashbook", filter, "-created", 1, 0);
    
    if (cashbookRecords && cashbookRecords.length > 0) {
      const cashbookRecord = cashbookRecords[0];
      $app.delete(cashbookRecord);
    }
  } catch (err) {
    console.log("Error deleting advance from cashbook:", err);
  }
  
  e.next();
}, "advances");