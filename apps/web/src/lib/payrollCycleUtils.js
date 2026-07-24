import { format, addDays, differenceInDays, startOfMonth, endOfMonth, isAfter, isBefore, parseISO } from 'date-fns';

/**
 * Calculates the exact payroll cycle, processing date, and active working period for an employee.
 * 
 * Rules based on business requirement:
 * 1. Cycle Start Day (1st Date): Default 1 (1st of month)
 * 2. Cycle End Day (Last Date): Default 30 / End of Month
 * 3. Salary Disbursement Day: Processed 10 days after cycle completion (e.g., 10th of following month)
 * 4. Mid-month joiners: Pro-rated base salary calculated from joining_date to cycle_end.
 */
export function getEmployeeCurrentCycle(emp, refDate = new Date()) {
  const now = new Date(refDate);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Parse employee custom cycle settings or fallbacks
  const startDay = Math.max(1, Math.min(31, parseInt(emp?.payroll_cycle_start_day || 1, 10)));
  const endDaySetting = parseInt(emp?.payroll_cycle_end_day || 30, 10);
  const disbursementLagDays = parseInt(emp?.salary_disbursement_day || 10, 10);

  // Joining Date parsing
  let joinDate = null;
  if (emp?.joining_date) {
    try {
      const parsed = typeof emp.joining_date === 'string' ? parseISO(emp.joining_date) : new Date(emp.joining_date);
      if (!isNaN(parsed.getTime())) {
        joinDate = parsed;
      }
    } catch (e) {
      console.warn('Invalid joining date:', emp.joining_date);
    }
  }

  // Calculate cycle period for the reference month/previous cycle
  // Default: Previous closed cycle if today is before disbursement, or current cycle
  let cycleStart = new Date(currentYear, currentMonth, startDay);
  let lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let cycleEndDay = endDaySetting > lastDayOfMonth ? lastDayOfMonth : endDaySetting;
  let cycleEnd = new Date(currentYear, currentMonth, cycleEndDay, 23, 59, 59);

  // If today is within the first 10 days of current month, the salary being processed is for PREVIOUS month!
  const todayDay = now.getDate();
  if (todayDay <= disbursementLagDays && currentMonth > 0) {
    // Show previous month's completed cycle
    cycleStart = new Date(currentYear, currentMonth - 1, startDay);
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    cycleEndDay = endDaySetting > prevMonthLastDay ? prevMonthLastDay : endDaySetting;
    cycleEnd = new Date(currentYear, currentMonth - 1, cycleEndDay, 23, 59, 59);
  }

  // Calculate exact Salary Processing / Disbursement Date (Cycle End + 10 Days)
  const salaryDisbursementDate = addDays(cycleEnd, disbursementLagDays);

  // Total calendar days in this cycle
  const totalCycleDays = Math.max(1, differenceInDays(cycleEnd, cycleStart) + 1);

  // If employee joined after cycleStart, calculate pro-rated start date
  let effectiveStartDate = cycleStart;
  if (joinDate && isAfter(joinDate, cycleStart) && isBefore(joinDate, cycleEnd)) {
    effectiveStartDate = joinDate;
  }

  // Days active in this cycle
  let activeDays = totalCycleDays;
  if (joinDate && isAfter(joinDate, cycleStart)) {
    if (isAfter(joinDate, cycleEnd)) {
      activeDays = 0; // Joined after cycle ended
    } else {
      activeDays = Math.max(0, differenceInDays(cycleEnd, joinDate) + 1);
    }
  }

  // Cycle status calculation
  let status = 'active';
  let statusLabel = `Processing Due on ${format(salaryDisbursementDate, 'dd MMM yyyy')} (${disbursementLagDays} days post-cycle)`;
  
  if (isAfter(now, salaryDisbursementDate)) {
    status = 'overdue';
    statusLabel = `Disbursement Overdue (Due was ${format(salaryDisbursementDate, 'dd MMM yyyy')})`;
  } else if (isAfter(now, cycleEnd) && isBefore(now, salaryDisbursementDate)) {
    status = 'due_soon';
    statusLabel = `Payable on ${format(salaryDisbursementDate, 'dd MMM yyyy')}`;
  }

  return {
    cycleStart,
    cycleEnd,
    salaryDisbursementDate,
    totalCycleDays,
    activeDays,
    effectiveStartDate,
    startDay,
    endDay: cycleEndDay,
    disbursementLagDays,
    status,
    statusLabel,
    formattedCycleRange: `${format(cycleStart, 'dd MMM')} - ${format(cycleEnd, 'dd MMM yyyy')}`,
    formattedPayDate: format(salaryDisbursementDate, 'dd MMM yyyy')
  };
}

/**
 * Calculates complete payroll details for an employee including attendance, advances, and pro-rata salary.
 */
export function calculateCyclePayroll(emp, attendanceRecords = [], advances = [], refDate = new Date()) {
  const cycleInfo = getEmployeeCurrentCycle(emp, refDate);
  const baseSalary = Number(emp.salary_amount || emp.salary || emp.base_salary) || 0;

  const startStr = format(cycleInfo.cycleStart, 'yyyy-MM-dd');
  const endStr = format(cycleInfo.cycleEnd, 'yyyy-MM-dd');

  // Filter attendance within cycle
  const empAtts = (attendanceRecords || []).filter(r => {
    if (r.staff_member !== emp.id && r.employee_id !== emp.id) return false;
    const dStr = (r.date || '').split(' ')[0];
    return dStr >= startStr && dStr <= endStr;
  });

  const fullDays = empAtts.filter(r => {
    const st = (r.status || '').toLowerCase();
    return st === 'present' || st === 'work from home';
  }).length;

  const halfDays = empAtts.filter(r => (r.status || '').toLowerCase() === 'half day').length;
  const presentDays = fullDays + (halfDays * 0.5);

  // Pro-rata factor for mid-month joining
  const proRataFactor = cycleInfo.totalCycleDays > 0 ? (cycleInfo.activeDays / cycleInfo.totalCycleDays) : 1;
  const adjustedBaseSalary = baseSalary * proRataFactor;

  // Gross Salary based on attendance
  const grossSalary = cycleInfo.totalCycleDays > 0 
    ? (adjustedBaseSalary * (presentDays / Math.max(1, cycleInfo.activeDays))) 
    : 0;

  // Deductions
  const empAdvances = (advances || []).filter(a => (a.employee_id === emp.id || a.staff_member === emp.id) && a.status === 'Pending');
  const totalAdvances = empAdvances.reduce((sum, a) => sum + (Number(a.remaining_balance ?? a.amount) || 0), 0);
  const taxDeductions = grossSalary * 0.05; // 5% TDS / statutory reserve

  const netPayout = Math.max(0, grossSalary - taxDeductions - totalAdvances);

  return {
    employeeId: emp.id,
    employeeName: emp.name,
    empCode: emp.employee_number || emp.emp_number || 'EMP-001',
    role: emp.employee_type || emp.role || 'Staff',
    joiningDate: emp.joining_date || 'N/A',
    cycleInfo,
    baseSalary,
    adjustedBaseSalary: Number(adjustedBaseSalary.toFixed(2)),
    presentDays,
    totalWorkingDays: cycleInfo.totalCycleDays,
    activeDays: cycleInfo.activeDays,
    grossSalary: Number(grossSalary.toFixed(2)),
    totalAdvances: Number(totalAdvances.toFixed(2)),
    taxDeductions: Number(taxDeductions.toFixed(2)),
    netPayout: Number(netPayout.toFixed(2)),
    payDate: cycleInfo.formattedPayDate,
    status: cycleInfo.status,
    statusLabel: cycleInfo.statusLabel
  };
}
