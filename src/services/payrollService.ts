import { dbtabeses } from '../db/store';
import { PayrollRecord } from '../types';

export interface PayrollCalcParams {
  baseSalary: number;
  presentDays: number;
  totalWorkingDays?: number;
  advances?: number;
  deductPf?: boolean;
  pfRate?: number;
  incentive?: number;
  bonus?: number;
  otherDeductions?: number;
}

export const payrollService = {
  calculateNetPayout(
    baseSalary: number, 
    presentDays: number, 
    totalWorkingDays: number = 30, 
    advances: number = 0,
    options: {
      deductPf?: boolean;
      pfRate?: number;
      incentive?: number;
      bonus?: number;
      otherDeductions?: number;
    } = {}
  ): number {
    if (totalWorkingDays <= 0 || baseSalary <= 0) return 0;
    const earned = presentDays >= totalWorkingDays ? baseSalary : Math.round((baseSalary / totalWorkingDays) * presentDays);
    const incentive = Math.max(0, options.incentive || 0);
    const bonus = Math.max(0, options.bonus || 0);
    const gross = earned + incentive + bonus;
    
    // PF calculation (only if opted in)
    const pfRate = options.pfRate !== undefined ? options.pfRate : 12;
    const pfDeduction = options.deductPf ? Math.round(baseSalary * (pfRate / 100)) : 0;
    const otherDeductions = Math.max(0, options.otherDeductions || 0);

    const totalDeductions = advances + pfDeduction + otherDeductions;
    const net = gross - totalDeductions;
    return Math.max(0, Math.round(net));
  },

  syncPayrollForMonth(month: string) {
    const employees = dbtabeses.getEmployees();
    const existingPayroll = dbtabeses.getItem('jc_payroll', []) as PayrollRecord[];
    
    const updated: PayrollRecord[] = employees.map(emp => {
      const found = existingPayroll.find(p => p.employee_id === emp.id && p.month === month);
      const totalDays = found ? (found.total_working_days || 30) : 30;
      const presentDays = found ? (found.present_days ?? totalDays) : totalDays;
      const advances = emp.advances_taken || 0;
      const baseSal = Number(emp.salary_amount || emp.base_salary || emp.salary || 0);
      const isPfOpted = emp.is_pf_opted_in ?? false;
      const pfRate = emp.pf_percentage || 12;
      const pfDeduction = isPfOpted ? Math.round(baseSal * (pfRate / 100)) : 0;
      
      const netPayout = payrollService.calculateNetPayout(
        baseSal, 
        presentDays, 
        totalDays, 
        advances,
        {
          deductPf: isPfOpted,
          pfRate,
          incentive: found?.incentive || 0,
          bonus: found?.bonus || 0,
          otherDeductions: found?.other_deductions || 0
        }
      );
      
      return {
        id: found ? found.id : 'pay-' + emp.id + '-' + month,
        employee_id: emp.id,
        month,
        base_salary: baseSal,
        gross_salary: baseSal + (found?.incentive || 0) + (found?.bonus || 0),
        present_days: presentDays,
        total_working_days: totalDays,
        advances_taken: advances,
        pf_deduction: pfDeduction,
        is_pf_deducted: isPfOpted,
        incentive: found?.incentive || 0,
        bonus: found?.bonus || 0,
        other_deductions: found?.other_deductions || 0,
        net_payout: netPayout,
        status: found ? found.status : 'Pending',
        paid_date: found ? found.paid_date : undefined
      };
    });
    
    dbtabeses.setItem('jc_payroll', updated);
    return updated;
  }
};