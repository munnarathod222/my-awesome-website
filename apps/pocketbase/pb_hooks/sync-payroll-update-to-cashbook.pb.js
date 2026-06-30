/// <reference path="../pb_data/types.d.ts" />
onRecordAfterUpdateSuccess((e) => {
  const record = e.record;
  
  try {
    const filter = 'reference_id = "' + record.id + '" && reference_type = "salary"';
    const cashbookRecords = $app.findRecordsByFilter("cashbook", filter, "-created", 1, 0);
    
    if (cashbookRecords && cashbookRecords.length > 0) {
      const cashbookRecord = cashbookRecords[0];
      const employeeName = record.get("employee_name") || "Unknown";
      
      cashbookRecord.set("date", record.get("created_date"));
      cashbookRecord.set("description", "Salary Payment - " + employeeName);
      cashbookRecord.set("amount", record.get("net_salary"));
      
      $app.save(cashbookRecord);
    }
  } catch (err) {
    console.log("Error updating payroll in cashbook:", err);
  }
  
  e.next();
}, "payroll");