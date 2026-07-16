/// <reference path="../pb_data/types.d.ts" />
// Sync maintenance expenses to cashbook_transactions
onRecordAfterCreateSuccess((e) => {
  try {
    const userId = e.record.get("created_by");
    if (!userId) {
      console.log("No created_by found, skipping cashbook sync");
      e.next();
      return;
    }

    // Find or create active cashbook for user
    let cashbook = $app.findFirstRecordByData("cashbooks", "user_id", userId);
    if (!cashbook) {
      const cashbooksCol = $app.findCollectionByNameOrId("cashbooks");
      const newCashbook = new Record(cashbooksCol);
      newCashbook.set("user_id", userId);
      newCashbook.set("opening_balance", 0);
      newCashbook.set("status", "active");
      $app.save(newCashbook);
      cashbook = newCashbook;
    }

    // Create cashbook transaction
    const transactionCol = $app.findCollectionByNameOrId("cashbook_transactions");
    const transaction = new Record(transactionCol);
    transaction.set("cashbook_id", cashbook.id);
    transaction.set("date", e.record.get("date"));
    transaction.set("description", `Maintenance - ${e.record.get("service")}`);
    transaction.set("category", "Expenses");
    transaction.set("amount", e.record.get("amount"));
    transaction.set("transaction_type", "debit");
    transaction.set("source_module", "expenses_maintenance");
    transaction.set("source_record_id", e.record.id);
    $app.save(transaction);
  } catch (err) {
    console.error("Error syncing maintenance expense to cashbook:", err);
  }
  e.next();
}, "expenses_maintenance");

onRecordAfterUpdateSuccess((e) => {
  try {
    const transaction = $app.findFirstRecordByData("cashbook_transactions", "source_record_id", e.record.id);
    if (transaction) {
      transaction.set("date", e.record.get("date"));
      transaction.set("description", `Maintenance - ${e.record.get("service")}`);
      transaction.set("amount", e.record.get("amount"));
      $app.save(transaction);
    }
  } catch (err) {
    console.error("Error updating maintenance expense in cashbook:", err);
  }
  e.next();
}, "expenses_maintenance");

onRecordAfterDeleteSuccess((e) => {
  try {
    const transaction = $app.findFirstRecordByData("cashbook_transactions", "source_record_id", e.record.id);
    if (transaction) {
      $app.delete(transaction);
    }
  } catch (err) {
    console.error("Error deleting maintenance expense from cashbook:", err);
  }
  e.next();
}, "expenses_maintenance");