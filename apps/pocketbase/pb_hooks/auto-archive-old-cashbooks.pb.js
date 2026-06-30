/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const userId = e.record.get("user_id");
  
  // Find all other active cashbooks for this user
  const otherCashbooks = $app.findAllRecords("cashbooks", {
    filter: "user_id = '" + userId + "' && status = 'active' && id != '" + e.record.id + "'"
  });
  
  // Archive all other active cashbooks
  otherCashbooks.forEach((cashbook) => {
    cashbook.set("status", "archived");
    $app.save(cashbook);
  });
  
  e.next();
}, "cashbooks");