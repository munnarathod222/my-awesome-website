/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  try {
    const record = e.record;
    
    let addedBy = "";
    try {
      if (e.auth && e.auth.id) {
        addedBy = e.auth.id;
      }
    } catch (_) {}
    
    if (!addedBy) {
      addedBy = record.get("created_by") || "vomu7tmaa889wv8";
    }

    const cashbookCollection = $app.findCollectionByNameOrId("cashbook");
    
    // Check if cashbook entry already exists for this expense
    const filter = 'reference_id = "' + record.id + '"';
    const existing = $app.findRecordsByFilter("cashbook", filter, "-created", 1, 0);
    if (existing && existing.length > 0) {
      console.log("Cashbook entry already exists for expense: " + record.id);
      e.next();
      return;
    }

    const cashbookRecord = new Record(cashbookCollection);
    
    cashbookRecord.set("date", record.get("date"));
    cashbookRecord.set("description", record.get("description") || "Expense");
    cashbookRecord.set("amount", record.get("amount"));
    cashbookRecord.set("transaction_type", "Expense");
    cashbookRecord.set("category", record.get("category"));
    cashbookRecord.set("reference_id", record.id);
    cashbookRecord.set("reference_type", "expense");
    cashbookRecord.set("status", "Completed");
    cashbookRecord.set("added_by", addedBy);
    
    $app.save(cashbookRecord);
  } catch (err) {
    console.log("Error syncing expense to cashbook:", err);
  }
  
  e.next();
}, "expenses");