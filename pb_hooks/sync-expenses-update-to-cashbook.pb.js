/// <reference path="../pb_data/types.d.ts" />
onRecordAfterUpdateSuccess((e) => {
  const record = e.record;
  
  try {
    const filter = 'reference_id = "' + record.id + '" && reference_type = "expense"';
    const cashbookRecords = $app.findRecordsByFilter("cashbook", filter, "-created", 1, 0);
    
    if (cashbookRecords && cashbookRecords.length > 0) {
      const cashbookRecord = cashbookRecords[0];
      cashbookRecord.set("date", record.get("date"));
      cashbookRecord.set("description", record.get("description") || "Expense");
      cashbookRecord.set("amount", record.get("amount"));
      let category = record.get("category") || "Expenses";
      const subcategory = record.get("subcategory");
      if (category === "Regular" && subcategory) {
        category = "Regular - " + subcategory;
      }
      cashbookRecord.set("category", category);
      
      $app.save(cashbookRecord);
    }
  } catch (err) {
    console.log("Error updating expense in cashbook:", err);
  }
  
  e.next();
}, "expenses");