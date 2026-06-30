/// <reference path="../pb_data/types.d.ts" />
onRecordAfterUpdateSuccess((e) => {
  const record = e.record;
  
  try {
    const filter = 'reference_id = "' + record.id + '" && reference_type = "advance"';
    const cashbookRecords = $app.findRecordsByFilter("cashbook", filter, "-created", 1, 0);
    
    if (cashbookRecords && cashbookRecords.length > 0) {
      const cashbookRecord = cashbookRecords[0];
      const employeeName = record.get("employee_id") ? record.expand("employee_id").get("name") : "Unknown";
      
      cashbookRecord.set("date", record.get("date"));
      cashbookRecord.set("description", "Advance to " + employeeName);
      cashbookRecord.set("amount", record.get("amount"));
      
      $app.save(cashbookRecord);
    }
  } catch (err) {
    console.log("Error updating advance in cashbook:", err);
  }
  
  e.next();
}, "advances");