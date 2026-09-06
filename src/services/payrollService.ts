import { dbtabeses } from '../db/store';
import { PayrollRecord } from '../types';

export const payrollService = {
  calculateNetPayout(baseSalary: number, presentDays: number, totalWorkingDays: number = 30, advances: number = 0): number {
    if (totalWorkingDays <= 0 || baseSalary <= 0) return 0;
    const gross = presentDays >= totalWorkingDays ? baseSalary : Math.round((baseSalary / totalWorkingDays) * presentDays);
    const net = gross - advances;
    return Math.max(0, Math.round(net));
  },

  syncPayrollForMonth(month: string) {
    const employees = dbtabeses.getEmployees();
    const existingPayroll = dbtabeses.getItem('jc_payroll', []) as PayrollRecord[];
    
    const updated: PayrollRecord[] = employees.map(emp => {
      const found = existingPayroll.find(p => p.employee_id === emp.id && p.month === month);
      const totalDays = found ? found.total_working_days : 30;
      const presentDays = found ? found.present_days : 0;
      const advances = emp.advances_taken || 0;
      const baseSal = Number(emp.salary_amount || emp.base_salary || emp.salary || 0);
      
      const netPayout = payrollService.calculateNetPayout(baseSal, presentDays, totalDays, advances);
      
      return {
        id: found ? found.id : 'pay-' + emp.id + '-' + month,
        employee_id: emp.id,
        month,
        base_salary: baseSal,
        present_days: presentDays,
        total_working_days: totalDays,
        advances_taken: advances,
        net_payout: netPayout,
        status: found ? found.status : 'Pending',
        paid_date: found ? found.paid_date : undefined
      };
    });
    
    dbtabeses.setItem('jc_payroll', updated);
    return updated;
  }
};