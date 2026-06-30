// This hook has been deprecated and its functionality moved directly into inline
// PocketBase calls within the respective components (ExpenseModal, etc.)
// to improve reliability and remove external API dependencies.

export const useExpenseCashbookSync = () => {
  return {
    syncExpense: async () => ({ success: true }),
    updateExpense: async () => ({ success: true })
  };
};