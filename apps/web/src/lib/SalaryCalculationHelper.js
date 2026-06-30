/**
 * Utility functions for advanced attendance-based salary calculations
 */

export const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

export const calculateDailyRate = (monthlySalary, workingDaysInMonth = 30) => {
  const salary = Number(monthlySalary) || 0;
  const days = Number(workingDaysInMonth) || 30;
  const rate = days > 0 ? salary / days : 0;
  
  return {
    dailyRate: rate,
    monthlySalary: salary,
    workingDaysInMonth: days
  };
};

export const calculateAttendanceSummary = (attendanceRecords, workingDaysInMonth) => {
  if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
    return { present: 0, absent: 0, leave: 0, halfDay: 0, wfh: 0, totalWorkedDays: 0, attendancePercentage: 0 };
  }

  let present = 0;
  let absent = 0;
  let leave = 0;
  let halfDay = 0;
  let wfh = 0;

  attendanceRecords.forEach(record => {
    switch (record.status) {
      case 'Present': present += 1; break;
      case 'Absent': absent += 1; break;
      case 'Leave': leave += 1; break;
      case 'Half Day': halfDay += 1; break;
      case 'Work From Home': wfh += 1; break;
      default: break;
    }
  });

  const totalWorkedDays = present + wfh + (halfDay * 0.5);
  const attendancePercentage = workingDaysInMonth > 0 ? (totalWorkedDays / workingDaysInMonth) * 100 : 0;

  return {
    present,
    absent,
    leave,
    halfDay,
    wfh,
    totalWorkedDays,
    attendancePercentage: Math.round(attendancePercentage * 100) / 100
  };
};

export const calculateTotalSalary = (dailyRate, attendanceDays) => {
  const rate = Number(dailyRate) || 0;
  const days = Number(attendanceDays) || 0;
  const total = rate * days;
  
  return {
    totalSalary: Math.round(total * 100) / 100,
    dailyRate: rate,
    attendanceDays: days
  };
};

export const calculateDeductions = (breakdown = {}) => {
  const absentDeduction = Number(breakdown.absent_deduction) || 0;
  const lateDeduction = Number(breakdown.late_arrival_deduction) || 0;
  const advanceDeduction = Number(breakdown.advance_deduction) || 0;
  const otherDeductions = Number(breakdown.other_deductions) || 0;

  const totalDeductions = absentDeduction + lateDeduction + advanceDeduction + otherDeductions;

  return {
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    breakdown: {
      absent_deduction: absentDeduction,
      late_arrival_deduction: lateDeduction,
      advance_deduction: advanceDeduction,
      other_deductions: otherDeductions
    }
  };
};

export const calculateAllowances = (breakdown = {}) => {
  const hra = Number(breakdown.hra) || 0;
  const ta = Number(breakdown.ta) || 0;
  const bonus = Number(breakdown.bonus) || 0;
  const incentive = Number(breakdown.incentive) || 0;
  const otherAllowances = Number(breakdown.other_allowances) || 0;

  const totalAllowances = hra + ta + bonus + incentive + otherAllowances;

  return {
    totalAllowances: Math.round(totalAllowances * 100) / 100,
    breakdown: {
      hra,
      ta,
      bonus,
      incentive,
      other_allowances: otherAllowances
    }
  };
};

export const calculateGrossSalary = (totalSalary, totalAllowances) => {
  const salary = Number(totalSalary) || 0;
  const allowances = Number(totalAllowances) || 0;
  const gross = salary + allowances;

  return {
    grossSalary: Math.round(gross * 100) / 100,
    totalSalary: salary,
    totalAllowances: allowances
  };
};

export const calculateNetSalary = (grossSalary, totalDeductions, taxes = 0) => {
  const gross = Number(grossSalary) || 0;
  const deductions = Number(totalDeductions) || 0;
  const taxAmount = Number(taxes) || 0;
  
  const net = gross - deductions - taxAmount;

  return {
    netSalary: Math.max(0, Math.round(net * 100) / 100),
    grossSalary: gross,
    totalDeductions: deductions,
    taxes: taxAmount
  };
};

export const calculatePaymentStats = (payrollRecords = []) => {
  let totalAmount = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let paidCount = 0;

  let totalPaymentsMade = 0;
  let totalPendingPayments = 0;
  let totalApprovedPayments = 0;
  let paymentCountByStatus = { pending: 0, paid: 0, processing: 0, approved: 0 };
  let totalPaymentCount = payrollRecords.length;

  payrollRecords.forEach(record => {
    const net = Number(record.net_salary) || 0;
    totalAmount += net;

    const status = (record.payment_status || record.status || 'pending').toLowerCase();
    paymentCountByStatus[status] = (paymentCountByStatus[status] || 0) + 1;

    if (status === 'paid') {
      totalPaid += net;
      paidCount++;
      totalPaymentsMade += net;
    } else if (status === 'pending' || status === 'draft') {
      totalPending += net;
      totalPendingPayments += net;
    } else if (status === 'approved') {
      totalApprovedPayments += net;
      totalPending += net; // Approved is still pending payment
    } else {
      totalPending += net;
    }
  });

  const averagePaymentAmount = totalPaymentCount > 0 ? totalAmount / totalPaymentCount : 0;
  const completionPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

  return {
    // Stats returned for dashboard components
    totalEmployees: totalPaymentCount,
    totalAmount,
    totalPaid,
    totalPending,
    paidCount,
    completionPercentage,
    
    // Requested breakdown
    totalPaymentsMade,
    totalPendingPayments,
    totalApprovedPayments,
    averagePaymentAmount,
    paymentCountByStatus,
    totalPaymentCount
  };
};

export const calculateSalaryBreakdown = (employeeData, payrollOrAttendance, tripCount = 0, advancesTotal = 0) => {
  // Support both (employee, payroll) and (employee, attendanceRecords, tripCount, advancesTotal) signatures
  const attendanceRecords = Array.isArray(payrollOrAttendance) ? payrollOrAttendance : [];
  
  const baseSalary = Number(employeeData?.salary_amount || employeeData?.base_salary || 0);
  const tripBonus = Number(tripCount) * 500; // Simulated trip bonus rate
  const driverAdvances = Number(advancesTotal) || 0;
  
  const absentDays = attendanceRecords.filter(a => a.status && a.status.toLowerCase() === 'absent').length;
  const dailyRate = baseSalary / 30;
  const attendanceDeduction = absentDays * dailyRate;

  const finalSalary = baseSalary + tripBonus - attendanceDeduction - driverAdvances;

  const grossSalary = baseSalary + tripBonus;
  const netSalary = Math.max(0, finalSalary);
  const taxAmount = 0;

  const deductions = [
    { name: 'Attendance Deduction', amount: attendanceDeduction },
    { name: 'Advances', amount: driverAdvances }
  ].filter(d => d.amount > 0);

  const allowances = [
    { name: 'Trip Bonus', amount: tripBonus }
  ].filter(a => a.amount > 0);

  return {
    // Expected structure for specific dashboard widgets
    grossSalary,
    deductions,
    allowances,
    netSalary,
    taxAmount,
    breakdownDetails: {
      baseSalary,
      tripBonus,
      attendanceDeduction,
      driverAdvances
    },
    
    // Legacy support attributes
    baseSalary,
    tripBonus,
    attendanceDeduction,
    driverAdvances,
    finalSalary: netSalary
  };
};

export const generatePayrollCSV = (payrollData) => {
  if (!payrollData || payrollData.length === 0) return '';
  const headers = ['Employee Name', 'Month', 'Year', 'Net Salary', 'Status'];
  const rows = payrollData.map(r => [
    `"${r.employee_name || ''}"`,
    r.payroll_month,
    r.payroll_year,
    r.net_salary || 0,
    `"${r.payment_status || r.status || 'Draft'}"`
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
};

export const downloadCSV = (csvData, filename = 'export.csv') => {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};