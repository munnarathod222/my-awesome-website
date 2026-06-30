/// <reference path="../pb_data/types.d.ts" />

// Sync advances to cashbook transactions
onRecordAfterCreateSuccess((e) => {
  try {
    // Get the advance record
    const advance = e.record;
    
    // Get employee details
    const employee = $app.findRecordById("employees", advance.getString("employee_id"));
    
    // Get user's cashbook (or create if doesn't exist)
    let cashbook;
    try {
      cashbook = $app.findFirstRecordByFilter("cashbooks", `user_id = {:userId}`, {
        userId: advance.getString("created_by") || ""
      });
    } catch (err) {
      // Create cashbook if it doesn't exist
      const cashbookCollection = $app.findCollectionByNameOrId("cashbooks");
      cashbook = new Record(cashbookCollection);
      cashbook.set("user_id", advance.getString("created_by") || "");
      cashbook.set("opening_balance", 0);
      cashbook.set("status", "active");
      $app.save(cashbook);
    }
    
    // Create cashbook transaction
    const transactionCollection = $app.findCollectionByNameOrId("cashbook_transactions");
    const transaction = new Record(transactionCollection);
    
    transaction.set("cashbook_id", cashbook.id);
    transaction.set("date", advance.getString("date"));
    transaction.set("description", `Advance to ${employee.getString("name")} - ${advance.getString("reason") || "Employee advance"}`);
    transaction.set("category", "Driver Advances");
    transaction.set("amount", advance.getFloat("amount"));
    transaction.set("transaction_type", "debit");
    transaction.set("source_module", "advances");
    transaction.set("source_record_id", advance.id);
    
    $app.save(transaction);
    
  } catch (error) {
    console.error("Error syncing advance to cashbook:", error);
  }
  
  e.next();
}, "advances");

// Update cashbook when advance is updated
onRecordAfterUpdateSuccess((e) => {
  try {
    const advance = e.record;
    
    // Find existing cashbook transaction
    const transaction = $app.findFirstRecordByFilter(
      "cashbook_transactions",
      `source_module = "advances" && source_record_id = {:advanceId}`,
      { advanceId: advance.id }
    );
    
    if (transaction) {
      // Get employee details
      const employee = $app.findRecordById("employees", advance.getString("employee_id"));
      
      // Update transaction
      transaction.set("date", advance.getString("date"));
      transaction.set("description", `Advance to ${employee.getString("name")} - ${advance.getString("reason") || "Employee advance"}`);
      transaction.set("amount", advance.getFloat("amount"));
      
      $app.save(transaction);
    }
    
  } catch (error) {
    console.error("Error updating cashbook transaction:", error);
  }
  
  e.next();
}, "advances");

// Delete cashbook transaction when advance is deleted
onRecordAfterDeleteSuccess((e) => {
  try {
    const advance = e.record;
    
    // Find and delete cashbook transaction
    const transaction = $app.findFirstRecordByFilter(
      "cashbook_transactions",
      `source_module = "advances" && source_record_id = {:advanceId}`,
      { advanceId: advance.id }
    );
    
    if (transaction) {
      $app.delete(transaction);
    }
    
  } catch (error) {
    console.error("Error deleting cashbook transaction:", error);
  }
  
  e.next();
}, "advances");