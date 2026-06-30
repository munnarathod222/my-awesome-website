/// <reference path="../pb_data/types.d.ts" />
// Sync salary payments to cashbook_transactions
onRecordAfterCreateSuccess((e) => {
  try {
    // Get employee ID from relation
    const employeeId = e.record.get("employee_id");
    if (!employeeId) {
      console.log("No employee_id found, skipping cashbook sync");
      e.next();
      return;
    }

    // Get employee record to find name
    const employee = $app.findRecordById("employees", employeeId);
    if (!employee) {
      console.log("Employee not found, skipping cashbook sync");
      e.next();
      return;
    }

    // For salary payments, use a default system user or admin
    const userId = e.record.get("created_by") || "system";
    
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
      date: e.record.get("payment_date"),
      description: `Salary Payment - ${employee.get("name")}`,
      category: "Payroll",
      amount: e.record.get("amount"),
      transaction_type: "debit",
      source_module: "salary_payments",
      source_record_id: e.record.id
    });
    $app.save(transaction);
  } catch (err) {
    console.error("Error syncing salary payment to cashbook:", err);
  }
  e.next();
}, "salary_payments");

onRecordAfterUpdateSuccess((e) => {
  try {
    const transaction = $app.findFirstRecordByData("cashbook_transactions", "source_record_id", e.record.id);
    if (transaction) {
      const employeeId = e.record.get("employee_id");
      const employee = $app.findRecordById("employees", employeeId);
      transaction.set("date", e.record.get("payment_date"));
      transaction.set("description", `Salary Payment - ${employee ? employee.get("name") : "Unknown"}`);
      transaction.set("amount", e.record.get("amount"));
      $app.save(transaction);
    }
  } catch (err) {
    console.error("Error updating salary payment in cashbook:", err);
  }
  e.next();
}, "salary_payments");

onRecordAfterDeleteSuccess((e) => {
  try {
    const transaction = $app.findFirstRecordByData("cashbook_transactions", "source_record_id", e.record.id);
    if (transaction) {
      $app.delete(transaction);
    }
  } catch (err) {
    console.error("Error deleting salary payment from cashbook:", err);
  }
  e.next();
}, "salary_payments");