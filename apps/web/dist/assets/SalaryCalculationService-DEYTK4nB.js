import{p as F}from"./index-DLxf9dwO.js";

const n = {
  calculateSalaryWithDeductions: async (employeeId, month, year) => {
    try {
      const m = parseInt(month, 10) || (new Date().getMonth() + 1);
      const y = parseInt(year, 10) || new Date().getFullYear();

      // Fetch employee
      const emp = await F.collection("employees").getOne(employeeId, {$autoCancel: false});
      const baseSalary = Number(emp.salary_amount || emp.salary || emp.base_salary) || 0;

      // Calculate days in target month
      const totalDays = new Date(y, m, 0).getDate();
      const mStr = String(m).padStart(2, "0");
      const startStr = `${y}-${mStr}-01`;
      const endStr = `${y}-${mStr}-${String(totalDays).padStart(2, "0")}`;

      // Also custom cycle if configured
      const cStart = parseInt(emp.payroll_cycle_start_day, 10) || 1;
      const cEnd = parseInt(emp.payroll_cycle_end_day, 10) || totalDays;
      let cycleStartStr = startStr;
      let cycleEndStr = endStr;
      if (cStart > 1 && cEnd < cStart) {
        const prevM = m === 1 ? 12 : m - 1;
        const prevY = m === 1 ? y - 1 : y;
        cycleStartStr = `${prevY}-${String(prevM).padStart(2, "0")}-${String(cStart).padStart(2, "0")}`;
        cycleEndStr = `${y}-${mStr}-${String(cEnd).padStart(2, "0")}`;
      }

      // Fetch attendance
      const attList = await F.collection("attendance").getFullList({
        filter: `staff_member = "${employeeId}" || employee_id = "${employeeId}"`,
        $autoCancel: false
      }).catch(() => []);

      const inCal = attList.filter(a => {
        const d = (a.date || "").split(" ")[0];
        return d >= startStr && d <= endStr;
      });

      const inCycle = attList.filter(a => {
        const d = (a.date || "").split(" ")[0];
        return d >= cycleStartStr && d <= cycleEndStr;
      });

      const matchedAtt = inCycle.length >= inCal.length ? inCycle : inCal;

      let presentDays = 0;
      let halfDays = 0;
      let leaveDays = 0;
      let absentDays = 0;

      matchedAtt.forEach(a => {
        const st = (a.status || "").toLowerCase().trim();
        if (st === "present" || st === "work from home" || st === "p") presentDays += 1;
        else if (st === "half day" || st === "half-day" || st === "hd") halfDays += 1;
        else if (st === "leave" || st === "paid leave" || st === "holiday" || st === "off") leaveDays += 1;
        else if (st === "absent") absentDays += 1;
        else presentDays += 1;
      });

      const effectivePresent = presentDays + (halfDays * 0.5) + leaveDays;
      const totalWorkingDays = Math.max(1, totalDays);
      const dailyRate = baseSalary > 0 ? (baseSalary / totalWorkingDays) : 0;

      let grossSalary = 0;
      if (baseSalary > 0) {
        if (effectivePresent >= totalWorkingDays) {
          grossSalary = baseSalary;
        } else {
          grossSalary = Math.round(dailyRate * effectivePresent);
        }
      }

      const attendanceDeduction = Math.max(0, baseSalary - grossSalary);

      // Fetch pending advances
      const advList = await F.collection("advances").getFullList({
        filter: `(employee_id = "${employeeId}" || staff_member = "${employeeId}") && status = "Pending"`,
        $autoCancel: false
      }).catch(() => []);

      const advancesTotal = advList.reduce((sum, a) => sum + (Number(a.remaining_balance ?? a.amount) || 0), 0);
      const netSalary = Math.max(0, grossSalary - advancesTotal);

      return {
        baseSalary,
        grossSalary,
        netSalary,
        taxes: 0,
        attendanceDeduction,
        breakdown: {
          baseSalary,
          additions: 0,
          deductions: {
            attendance: attendanceDeduction,
            advances: advancesTotal,
            taxes: 0,
            total: attendanceDeduction + advancesTotal
          },
          attendanceMetrics: {
            totalDays: totalWorkingDays,
            presentDays: effectivePresent,
            absentDays: Math.max(0, totalWorkingDays - effectivePresent),
            leaveDays,
            halfDays,
            attendancePercentage: totalWorkingDays > 0 ? Math.round((effectivePresent / totalWorkingDays) * 100) : 0
          }
        }
      };
    } catch(err) {
      console.error("Failed to calculate salary with deductions:", err);
      throw err;
    }
  },

  getAttendanceSummary: async (employeeId, month, year) => {
    try {
      const res = await n.calculateSalaryWithDeductions(employeeId, month, year);
      return res.breakdown.attendanceMetrics;
    } catch(err) {
      console.error("Failed to get attendance summary:", err);
      throw err;
    }
  },

  calculateAttendanceImpact: async (employeeId, month, year) => {
    try {
      const res = await n.calculateSalaryWithDeductions(employeeId, month, year);
      return {
        deductionAmount: res.attendanceDeduction,
        metrics: res.breakdown.attendanceMetrics
      };
    } catch(err) {
      console.error("Failed to calculate attendance impact:", err);
      throw err;
    }
  }
};

export { n as S };
