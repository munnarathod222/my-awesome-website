/// <reference path="../pb_data/types.d.ts" />

// Hook: Delete related cashbook entries when an expense is deleted
onRecordDelete((e) => {
  const expenseId = e.record.id;

  try {
    // Find all cashbook entries linked to this expense
    const relatedTransactions = $app.findRecordsByFilter(
      "cashbook",
      "reference_id = {:expenseId} && reference_type = 'expense'",
      "-created",
      0,
      0,
      { expenseId: expenseId }
    );

    // Delete each related cashbook transaction
    relatedTransactions.forEach((transaction) => {
      $app.delete(transaction);
    });

    console.log(`Deleted ${relatedTransactions.length} cashbook transaction(s) for expense ${expenseId}`);
  } catch (error) {
    console.error(`Error deleting cashbook transactions for expense ${expenseId}:`, error);
  }

  // Allow the expense deletion to proceed
  e.next();
}, "expenses");