/// <reference path="../pb_data/types.d.ts" />
// Sync FASTag expenses to cashbook_transactions
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
      const newCashbook = new Record("cashbooks", {
        user_id: userId,
        opening_balance: 0,
        status: "active"
      });
      $app.save(newCashbook);
      cashbook = newCashbook;
    }

    // Create cashbook transaction
    const transaction = new Record("cashbook_transactions", {
      cashbook_id: cashbook.id,
      date: e.record.get("date"),
      description: `FASTag Recharge - ${e.record.get("truck_number")}`,
      category: "Expenses",
      amount: e.record.get("amount"),
      transaction_type: "debit",
      source_module: "expenses_fastag",
      source_record_id: e.record.id
    });
    $app.save(transaction);
  } catch (err) {
    console.error("Error syncing FASTag expense to cashbook:", err);
  }
  e.next();
}, "expenses_fastag");

onRecordAfterUpdateSuccess((e) => {
  try {
    const transaction = $app.findFirstRecordByData("cashbook_transactions", "source_record_id", e.record.id);
    if (transaction) {
      transaction.set("date", e.record.get("date"));
      transaction.set("description", `FASTag Recharge - ${e.record.get("truck_number")}`);
      transaction.set("amount", e.record.get("amount"));
      $app.save(transaction);
    }
  } catch (err) {
    console.error("Error updating FASTag expense in cashbook:", err);
  }
  e.next();
}, "expenses_fastag");

onRecordAfterDeleteSuccess((e) => {
  try {
    const transaction = $app.findFirstRecordByData("cashbook_transactions", "source_record_id", e.record.id);
    if (transaction) {
      $app.delete(transaction);
    }
  } catch (err) {
    console.error("Error deleting FASTag expense from cashbook:", err);
  }
  e.next();
}, "expenses_fastag");