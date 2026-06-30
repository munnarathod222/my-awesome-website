import apiServerClient from '@/lib/apiServerClient.js';

export const SalaryCalculationService = {
  calculateSalaryWithDeductions: async (employeeId, month, year) => {
    try {
      const response = await apiServerClient.fetch('/payroll/calculate-salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, month, year })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to calculate salary");
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to calculate salary with deductions:", error);
      throw error;
    }
  },

  getAttendanceSummary: async (employeeId, month, year) => {
    try {
      const response = await apiServerClient.fetch(`/attendance/employee/${employeeId}/summary?month=${month}&year=${year}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to fetch attendance summary");
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get attendance summary:", error);
      throw error;
    }
  },

  calculateAttendanceImpact: async (employeeId, month, year) => {
    try {
      const data = await SalaryCalculationService.calculateSalaryWithDeductions(employeeId, month, year);
      return {
        deductionAmount: data.attendanceDeduction,
        metrics: data.breakdown.attendanceMetrics
      };
    } catch (error) {
      console.error("Failed to calculate attendance impact:", error);
      throw error;
    }
  }
};

export default SalaryCalculationService;