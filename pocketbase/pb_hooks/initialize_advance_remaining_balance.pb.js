/// <reference path="../pb_data/types.d.ts" />
onRecordCreate((e) => {
  // Initialize remaining_balance with the advance amount when created
  const amount = e.record.get("amount");
  if (amount && amount > 0) {
    e.record.set("remaining_balance", amount);
  }
  e.next();
}, "advances");