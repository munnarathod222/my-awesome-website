import { format, parseISO, isAfter, isBefore } from 'date-fns';

/**
 * Calculates the exact payroll cycle, processing date, and active working period for an employee.
 * 
 * Rules:
 * 1. Cycle Start Day: 1 to 31 (default 1)
 * 2. Cycle End Day: 1 to 31 (default 30)
 * 3. When Start Day <= End Day: same-calendar-month cycle (e.g. 1st to 30th/31st)
 * 4. When Start Day > End Day: cross-month cycle (e.g. 16th to 15th, 3rd to 2nd, 4th to 3rd)
 *    Starts on Start Day of previous month and ends on End Day of target month.
 */
export function getEmployeeCurrentCycle(emp, refDate = new Date()) {
  const now = new Date(refDate);
  const curY = now.getFullYear();
  const curM = now.getMonth(); // 0-indexed
  const curD = now.getDate();

  const startDay = Math.max(1, Math.min(31, parseInt(emp?.payroll_cycle_start_day || 1, 10)));
  const endDaySetting = Math.max(1, Math.min(31, parseInt(emp?.payroll_cycle_end_day || 30, 10)));
  const disbursementDay = Math.max(1, Math.min(31, parseInt(emp?.salary_disbursement_day || 10, 10)));

  // Build cycle period for a given end-month (m) and end-year (y)
  function buildPeriod(y, m) {
    let cycleStart, cycleEnd, salaryDisbursementDate;

    if (startDay <= endDaySetting) {
      // Same month cycle (e.g. 1st to 30th)
      const maxDaysInEnd = new Date(y, m + 1, 0).getDate();
      const actualEnd = Math.min(endDaySetting, maxDaysInEnd);
      const actualStart = Math.min(startDay, maxDaysInEnd);
      cycleStart = new Date(y, m, actualStart, 0, 0, 0);
      cycleEnd = new Date(y, m, actualEnd, 23, 59, 59);

      const nextM = m === 11 ? 0 : m + 1;
      const nextY = m === 11 ? y + 1 : y;
      const daysInNext = new Date(nextY, nextM + 1, 0).getDate();
      salaryDisbursementDate = new Date(nextY, nextM, Math.min(disbursementDay, daysInNext), 0, 0, 0);
    } else {
      // Cross-month cycle (e.g. 16th to 15th, 3rd to 2nd, 4th to 3rd)
      const prevM = m === 0 ? 11 : m - 1;
      const prevY = m === 0 ? y - 1 : y;
      const maxDaysInPrev = new Date(prevY, prevM + 1, 0).getDate();
      const actualStart = Math.min(startDay, maxDaysInPrev);

      const maxDaysInEnd = new Date(y, m + 1, 0).getDate();
      const actualEnd = Math.min(endDaySetting, maxDaysInEnd);

      cycleStart = new Date(prevY, prevM, actualStart, 0, 0, 0);
      cycleEnd = new Date(y, m, actualEnd, 23, 59, 59);

      if (disbursementDay > actualEnd && disbursementDay <= maxDaysInEnd) {
        salaryDisbursementDate = new Date(y, m, disbursementDay, 0, 0, 0);
      } else {
        const nextM = m === 11 ? 0 : m + 1;
        const nextY = m === 11 ? y + 1 : y;
        const daysInNext = new Date(nextY, nextM + 1, 0).getDate();
        salaryDisbursementDate = new Date(nextY, nextM, Math.min(disbursementDay, daysInNext), 0, 0, 0);
      }
    }

    const totalCycleDays = Math.max(1, Math.round((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)));
    return { cycleStart, cycleEnd, salaryDisbursementDate, totalCycleDays };
  }

  // Determine current candidate cycle period:
  // If current date > disbursementDay, candidate period ends in current month curM.
  // If current date <= disbursementDay, candidate period ends in previous month curM - 1.
  const isPastDisburse = curD > disbursementDay;
  let targetM = isPastDisburse ? curM : (curM === 0 ? 11 : curM - 1);
  let targetY = isPastDisburse ? curY : (curM === 0 ? curY - 1 : curY);

  let period = buildPeriod(targetY, targetM);

  const { cycleStart, cycleEnd, salaryDisbursementDate, totalCycleDays } = period;

  // Status calculation
  let status = 'active';
  let statusLabel = `Processing Due on ${format(salaryDisbursementDate, 'dd MMM yyyy')}`;

  if (now > salaryDisbursementDate) {
    status = 'overdue';
    statusLabel = `Disbursement Overdue (Due was ${format(salaryDisbursementDate, 'dd MMM yyyy')})`;
  } else if (now >= cycleEnd && now <= salaryDisbursementDate) {
    status = 'due_soon';
    statusLabel = `Payable on ${format(salaryDisbursementDate, 'dd MMM yyyy')}`;
  }

  return {
    cycleStart,
    cycleEnd,
    salaryDisbursementDate,
    totalCycleDays,
    activeDays: totalCycleDays,
    effectiveStartDate: cycleStart,
    startDay,
    endDay: endDaySetting,
    disbursementLagDays: disbursementDay,
    status,
    statusLabel,
    formattedCycleRange: `${format(cycleStart, 'dd MMM')} - ${format(cycleEnd, 'dd MMM yyyy')}`,
    formattedPayDate: format(salaryDisbursementDate, 'dd MMM yyyy')
  };
}

/**
 * Calculates complete payroll details for an employee including attendance, advances, and net payout.
 */
export function calculateCyclePayroll(emp, attendanceRecords = [], advances = [], refDate = new Date()) {
  const cycleInfo = getEmployeeCurrentCycle(emp, refDate);
  const baseSalary = Number(emp.salary_amount || emp.salary || emp.base_salary) || 0;

  const startStr = format(cycleInfo.cycleStart, 'yyyy-MM-dd');
  const endStr = format(cycleInfo.cycleEnd, 'yyyy-MM-dd');

  const getNormDateStr = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val.split(/[T ]/)[0];
    try { return new Date(val).toISOString().split('T')[0]; } catch(e) { return ''; }
  };

  // Filter attendance within cycle with robust matching on ID, employee_code, employee_number
  const empAtts = (attendanceRecords || []).filter(r => {
    const id = typeof r.staff_member === 'object' ? r.staff_member?.id : (r.staff_member || r.employee_id || r.employee || r.user_id);
    const code = r.employee_code || r.employee_number || r.staff_code || (typeof r.staff_member === 'object' ? r.staff_member?.employee_code : null);
    return id === emp.id || (emp.employee_code && (id === emp.employee_code || code === emp.employee_code)) || (emp.employee_number && (id === emp.employee_number || code === emp.employee_number));
  });

  const inCycle = empAtts.filter(r => {
    const dStr = getNormDateStr(r.date);
    return dStr >= startStr && dStr <= endStr;
  });

  const endY = cycleInfo.cycleEnd.getFullYear();
  const endM = cycleInfo.cycleEnd.getMonth();
  const pad = (n) => String(n).padStart(2, '0');
  const calStartStr = `${endY}-${pad(endM + 1)}-01`;
  const calDays = new Date(endY, endM + 1, 0).getDate();
  const calEndStr = `${endY}-${pad(endM + 1)}-${pad(calDays)}`;
  const inCal = empAtts.filter(r => {
    const dStr = getNormDateStr(r.date);
    return dStr >= calStartStr && dStr <= calEndStr;
  });

  // Current calendar month check
  const now = new Date(refDate);
  const curY = now.getFullYear();
  const curM = now.getMonth();
  const curMonthStart = `${curY}-${pad(curM + 1)}-01`;
  const curMonthDays = new Date(curY, curM + 1, 0).getDate();
  const curMonthEnd = `${curY}-${pad(curM + 1)}-${pad(curMonthDays)}`;
  const inCurMonth = empAtts.filter(r => {
    const dStr = getNormDateStr(r.date);
    return dStr >= curMonthStart && dStr <= curMonthEnd;
  });

  let matched = inCycle;
  if (inCal.length > matched.length) matched = inCal;
  if (inCurMonth.length > matched.length) matched = inCurMonth;

  // Deduplicate by date
  const dateMap = new Map();
  matched.forEach(r => {
    const d = getNormDateStr(r.date);
    if (d && !dateMap.has(d)) dateMap.set(d, r);
  });
  const uniqueRecords = Array.from(dateMap.values());

  let absentCount = 0;
  let halfDayCount = 0;
  let presentCount = 0;
  let leaveCount = 0;

  uniqueRecords.forEach(r => {
    const st = (r.status || '').toLowerCase().trim();
    if (st === 'absent' || st === 'a') absentCount += 1;
    else if (st === 'half day' || st === 'half-day' || st === 'hd') halfDayCount += 1;
    else if (st === 'leave' || st === 'paid leave' || st === 'holiday' || st === 'off' || st === 'weekly off' || st === 'weekly-off' || st === 'wo') leaveCount += 1;
    else presentCount += 1;
  });

  const totalDays = Math.max(1, cycleInfo.totalCycleDays);
  const effectivePresent = presentCount + leaveCount + (halfDayCount * 0.5);

  // Pro-rata gross salary
  let grossSalary = 0;
  if (baseSalary > 0) {
    if (effectivePresent >= totalDays) {
      grossSalary = baseSalary;
    } else {
      grossSalary = Math.round((baseSalary / totalDays) * effectivePresent);
    }
  }

  // Pending Advances
  const empAdvances = (advances || []).filter(a => {
    const id = typeof a.staff_member === 'object' ? a.staff_member?.id : (a.employee_id || a.staff_member);
    return (id === emp.id || (emp.employee_code && id === emp.employee_code)) && a.status === 'Pending';
  });
  const totalAdvances = empAdvances.reduce((sum, a) => sum + (Number(a.remaining_balance ?? a.amount) || 0), 0);

  const netPayout = Math.max(0, grossSalary - totalAdvances);

  return {
    employeeId: emp.id,
    employeeName: emp.name,
    empCode: emp.employee_number || emp.emp_number || emp.employee_code || 'EMP-001',
    role: emp.employee_type || emp.role || 'Staff',
    joiningDate: emp.joining_date || 'N/A',
    cycleInfo,
    baseSalary,
    adjustedBaseSalary: grossSalary,
    presentDays: effectivePresent,
    totalWorkingDays: totalDays,
    activeDays: cycleInfo.activeDays,
    grossSalary,
    totalAdvances,
    taxDeductions: 0,
    netPayout,
    payDate: cycleInfo.formattedPayDate,
    status: cycleInfo.status,
    statusLabel: cycleInfo.statusLabel
  };
}

export default {
  getEmployeeCurrentCycle,
  calculateCyclePayroll
};
