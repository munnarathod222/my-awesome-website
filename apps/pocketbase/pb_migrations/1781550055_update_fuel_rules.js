/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    // 1. Update expenses rules
    const expenses = app.findCollectionByNameOrId("expenses");
    if (expenses) {
      const expensesRule = "@request.auth.role = 'super_admin' || @request.auth.role = 'admin' || @request.auth.role = 'manager' || @request.auth.role = 'dispatcher'";
      expenses.listRule = expensesRule;
      expenses.viewRule = expensesRule;
      expenses.createRule = expensesRule;
      expenses.updateRule = expensesRule;
      expenses.deleteRule = expensesRule;
      app.save(expenses);
      console.log("Successfully updated expenses API rules to include super_admin role.");
    }
  } catch (e) {
    console.error("Failed to update expenses rules:", e.message);
  }

  try {
    // 2. Update fuel_tracker rules
    const fuel = app.findCollectionByNameOrId("fuel_tracker");
    if (fuel) {
      const fuelRule = "@request.auth.role = 'super_admin' || @request.auth.role = 'admin' || @request.auth.role = 'manager' || @request.auth.role = 'dispatcher'";
      fuel.listRule = "@request.auth.id != ''";
      fuel.viewRule = "@request.auth.id != ''";
      fuel.createRule = fuelRule;
      fuel.updateRule = fuelRule;
      fuel.deleteRule = fuelRule;
      app.save(fuel);
      console.log("Successfully updated fuel_tracker API rules to include super_admin and manager roles.");
    }
  } catch (e) {
    console.error("Failed to update fuel_tracker rules:", e.message);
  }

  try {
    // 3. Update cashbook rules
    const cashbook = app.findCollectionByNameOrId("cashbook");
    if (cashbook) {
      const cashbookRule = "added_by = @request.auth.id || @request.auth.role = 'super_admin' || @request.auth.role = 'admin' || @request.auth.role = 'manager'";
      cashbook.listRule = cashbookRule;
      cashbook.viewRule = cashbookRule;
      cashbook.createRule = "@request.auth.id != ''";
      cashbook.updateRule = cashbookRule;
      cashbook.deleteRule = cashbookRule;
      app.save(cashbook);
      console.log("Successfully updated cashbook API rules to include super_admin and manager roles.");
    }
  } catch (e) {
    console.error("Failed to update cashbook rules:", e.message);
  }
}, (app) => {
  // Revert logic (no-op or reset to original rules)
})
