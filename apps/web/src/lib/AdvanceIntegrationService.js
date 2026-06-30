import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';

export const AdvanceIntegrationService = {
  createAdvanceFromExpense: async (expenseData) => {
    try {
      if (!expenseData.employee_id) {
        throw new Error("Employee ID is required to create an advance");
      }

      const advanceRecord = await pb.collection('advances').create({
        employee_id: expenseData.employee_id,
        amount: expenseData.amount,
        date: expenseData.date,
        reason: expenseData.description || 'Employee Advance from Expense Ledger',
        status: 'Pending',
        expense_id: expenseData.expense_id || expenseData.id
      }, { $autoCancel: false });

      return advanceRecord;
    } catch (error) {
      console.error("Failed to create advance from expense:", error);
      throw error;
    }
  },

  updateAdvanceStatus: async (advanceId, status, notes = '') => {
    try {
      const response = await apiServerClient.fetch(`/payroll/advances/${advanceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          notes,
          settledDate: status === 'Settled' ? new Date().toISOString() : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to update advance status");
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to update advance status:", error);
      throw error;
    }
  },

  getEmployeeAdvances: async (employeeId, params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = `/payroll/employee/${employeeId}/advances${query ? `?${query}` : ''}`;
      
      const response = await apiServerClient.fetch(endpoint);
      if (!response.ok) {
        throw new Error("Failed to fetch employee advances");
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get employee advances:", error);
      throw error;
    }
  },

  calculateTotalAdvances: async (employeeId) => {
    try {
      const data = await AdvanceIntegrationService.getEmployeeAdvances(employeeId, { status: 'Pending' });
      return data.totalAmount || 0;
    } catch (error) {
      console.error("Failed to calculate total advances:", error);
      return 0;
    }
  }
};

export default AdvanceIntegrationService;