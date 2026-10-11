/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  try {
    const record = e.record;
    const employeeName = record.get("employee_name") || "Unknown";
    
    let addedBy = "";
    try {
      if (e.auth && e.auth.id) {
        addedBy = e.auth.id;
      }
    } catch (_) {}
    
    if (!addedBy) {
      addedBy = "system";
    }

    const cashbookCollection = $app.findCollectionByNameOrId("cashbook");
    const cashbookRecord = new Record(cashbookCollection);
    
    cashbookRecord.set("date", record.get("created_date"));
    cashbookRecord.set("description", "Salary Payment - " + employeeName);
    cashbookRecord.set("amount", record.get("net_salary"));
    cashbookRecord.set("transaction_type", "Expense");
    cashbookRecord.set("category", "Payroll");
    cashbookRecord.set("reference_id", record.id);
    cashbookRecord.set("reference_type", "salary");
    cashbookRecord.set("status", "Completed");
    cashbookRecord.set("added_by", addedBy);
    
    $app.save(cashbookRecord);
  } catch (err) {
    console.log("Error syncing payroll to cashbook:", err);
  }
  
  e.next();
}, "payroll");