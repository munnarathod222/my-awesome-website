/// <reference path="../pb_data/types.d.ts" />

const handleAttendanceEvent = (e) => {
  const recalculatePayroll = (employeeId, month, year) => {
    try {
      console.log("[sync-payroll] Recalculating payroll for employee: " + employeeId + ", month: " + month + ", year: " + year);
      
      let employee;
      try {
        employee = $app.findRecordById("employees", employeeId);
      } catch (err) {
        console.log("[sync-payroll] Employee not found: " + employeeId);
        return;
      }
      
      const baseSalary = employee.getFloat("salary_amount") || employee.getFloat("base_salary") || 0;
      
      let payrollRecord;
      try {
        payrollRecord = $app.findFirstRecordByFilter(
          "payroll",
          "employee_id_relation = {:employeeId} && payroll_month = {:month} && payroll_year = {:year}",
          { employeeId: employeeId, month: month, year: year }
        );
      } catch (err) {
        console.log("[sync-payroll] No payroll record found to update for employee: " + employeeId + ", period: " + month + "/" + year);
        return;
      }
      
      if (payrollRecord.getString("payment_status") === "paid") {
        console.log("[sync-payroll] Payroll is already paid. Skipping sync.");
        return;
      }

      const totalWorkingDays = new Date(year, month, 0).getDate();
      const startDateISO = year + "-" + String(month).padStart(2, '0') + "-01";
      const endDateISO = year + "-" + String(month).padStart(2, '0') + "-" + String(totalWorkingDays).padStart(2, '0');
      
      const attendanceRecords = $app.findRecordsByFilter(
        "attendance",
        "staff_member = {:employeeId} && date >= {:startDate} && date <= {:endDate}",
        "",
        100,
        0,
        { employeeId: employeeId, startDate: startDateISO + " 00:00:00", endDate: endDateISO + " 23:59:59" }
      );
      
      let presentDays = 0;
      let absentDays = 0;
      let leaveDays = 0;
      
      attendanceRecords.forEach(r => {
        const status = (r.getString("status") || "").toLowerCase();
        if (status === 'present' || status === 'work from home') {
          presentDays += 1;
        } else if (status === 'absent') {
          absentDays += 1;
        } else if (status === 'leave') {
          leaveDays += 1;
        } else if (status === 'half day') {
          presentDays += 0.5;
          absentDays += 0.5;
        }
      });

      const dailyRate = baseSalary / totalWorkingDays;
      const attendanceDeduction = absentDays * dailyRate;

      const advances = $app.findRecordsByFilter(
        "advances",
        "employee_id = {:employeeId}",
        "",
        100,
        0,
        { employeeId: employeeId }
      );

      const linkedAdvanceIds = {};
      try {
        const prevDetails = JSON.parse(payrollRecord.getString("advance_deductions_details") || "[]");
        prevDetails.forEach(d => {
          if (d.advance_id) {
            linkedAdvanceIds[d.advance_id] = true;
          }
        });
      } catch (ex) {
        console.log("[sync-payroll] Error parsing prev advance details: " + ex.message);
      }

      let totalAdvances = 0;
      const newDetails = [];

      advances.forEach(adv => {
        const isPending = adv.getString("status") === 'Pending';
        const isLinked = linkedAdvanceIds[adv.id] === true;

        if (isPending || isLinked) {
          const amt = adv.getFloat("remaining_balance") || adv.getFloat("amount") || 0;
          totalAdvances += amt;
          newDetails.push({
            advance_id: adv.id,
            amount: amt,
            status: isPending ? 'Pending' : 'Deducted',
            deducted_date: adv.getString("settled_date") || new Date().toISOString()
          });
        }
      });

      const grossSalary = baseSalary - attendanceDeduction;
      const netSalary = (baseSalary * (totalWorkingDays > 0 ? presentDays / totalWorkingDays : 0)) - totalAdvances;

      payrollRecord.set("base_salary", baseSalary);
      payrollRecord.set("attendance_days", totalWorkingDays);
      payrollRecord.set("present_days", presentDays);
      payrollRecord.set("absent_days", absentDays);
      payrollRecord.set("leave_days", leaveDays);
      payrollRecord.set("attendance_deduction", parseFloat(attendanceDeduction.toFixed(2)));
      payrollRecord.set("driver_advances", parseFloat(totalAdvances.toFixed(2)));
      payrollRecord.set("advance_deductions_details", JSON.stringify(newDetails));
      payrollRecord.set("gross_salary", parseFloat(grossSalary.toFixed(2)));
      payrollRecord.set("net_salary", parseFloat(netSalary.toFixed(2)));
      payrollRecord.set("total_salary", parseFloat(netSalary.toFixed(2)));

      $app.save(payrollRecord);
      console.log("[sync-payroll] Successfully updated payroll record: " + payrollRecord.id + " (Net: " + netSalary + ")");
    } catch (err) {
      console.error("[sync-payroll] Error recalculating payroll: " + err.message);
    }
  };

  try {
    const record = e.record;
    const employeeId = record.getString("staff_member");
    const dateStr = record.getString("date");
    if (employeeId && dateStr) {
      const dateParts = dateStr.split(" ")[0].split("-");
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10);
      recalculatePayroll(employeeId, month, year);
    }
  } catch (err) {
    console.error("[sync-payroll-hook] attendance event error: " + err.message);
  }
  e.next();
};

const handleAdvanceEvent = (e) => {
  const recalculatePayroll = (employeeId, month, year) => {
    try {
      console.log("[sync-payroll] Recalculating payroll for employee: " + employeeId + ", month: " + month + ", year: " + year);
      
      let employee;
      try {
        employee = $app.findRecordById("employees", employeeId);
      } catch (err) {
        console.log("[sync-payroll] Employee not found: " + employeeId);
        return;
      }
      
      const baseSalary = employee.getFloat("salary_amount") || employee.getFloat("base_salary") || 0;
      
      let payrollRecord;
      try {
        payrollRecord = $app.findFirstRecordByFilter(
          "payroll",
          "employee_id_relation = {:employeeId} && payroll_month = {:month} && payroll_year = {:year}",
          { employeeId: employeeId, month: month, year: year }
        );
      } catch (err) {
        console.log("[sync-payroll] No payroll record found to update for employee: " + employeeId + ", period: " + month + "/" + year);
        return;
      }
      
      if (payrollRecord.getString("payment_status") === "paid") {
        console.log("[sync-payroll] Payroll is already paid. Skipping sync.");
        return;
      }

      const totalWorkingDays = new Date(year, month, 0).getDate();
      const startDateISO = year + "-" + String(month).padStart(2, '0') + "-01";
      const endDateISO = year + "-" + String(month).padStart(2, '0') + "-" + String(totalWorkingDays).padStart(2, '0');
      
      const attendanceRecords = $app.findRecordsByFilter(
        "attendance",
        "staff_member = {:employeeId} && date >= {:startDate} && date <= {:endDate}",
        "",
        100,
        0,
        { employeeId: employeeId, startDate: startDateISO + " 00:00:00", endDate: endDateISO + " 23:59:59" }
      );
      
      let presentDays = 0;
      let absentDays = 0;
      let leaveDays = 0;
      
      attendanceRecords.forEach(r => {
        const status = (r.getString("status") || "").toLowerCase();
        if (status === 'present' || status === 'work from home') {
          presentDays += 1;
        } else if (status === 'absent') {
          absentDays += 1;
        } else if (status === 'leave') {
          leaveDays += 1;
        } else if (status === 'half day') {
          presentDays += 0.5;
          absentDays += 0.5;
        }
      });

      const dailyRate = baseSalary / totalWorkingDays;
      const attendanceDeduction = absentDays * dailyRate;

      const advances = $app.findRecordsByFilter(
        "advances",
        "employee_id = {:employeeId}",
        "",
        100,
        0,
        { employeeId: employeeId }
      );

      const linkedAdvanceIds = {};
      try {
        const prevDetails = JSON.parse(payrollRecord.getString("advance_deductions_details") || "[]");
        prevDetails.forEach(d => {
          if (d.advance_id) {
            linkedAdvanceIds[d.advance_id] = true;
          }
        });
      } catch (ex) {
        console.log("[sync-payroll] Error parsing prev advance details: " + ex.message);
      }

      let totalAdvances = 0;
      const newDetails = [];

      advances.forEach(adv => {
        const isPending = adv.getString("status") === 'Pending';
        const isLinked = linkedAdvanceIds[adv.id] === true;

        if (isPending || isLinked) {
          const amt = adv.getFloat("remaining_balance") || adv.getFloat("amount") || 0;
          totalAdvances += amt;
          newDetails.push({
            advance_id: adv.id,
            amount: amt,
            status: isPending ? 'Pending' : 'Deducted',
            deducted_date: adv.getString("settled_date") || new Date().toISOString()
          });
        }
      });

      const grossSalary = baseSalary - attendanceDeduction;
      const netSalary = (baseSalary * (totalWorkingDays > 0 ? presentDays / totalWorkingDays : 0)) - totalAdvances;

      payrollRecord.set("base_salary", baseSalary);
      payrollRecord.set("attendance_days", totalWorkingDays);
      payrollRecord.set("present_days", presentDays);
      payrollRecord.set("absent_days", absentDays);
      payrollRecord.set("leave_days", leaveDays);
      payrollRecord.set("attendance_deduction", parseFloat(attendanceDeduction.toFixed(2)));
      payrollRecord.set("driver_advances", parseFloat(totalAdvances.toFixed(2)));
      payrollRecord.set("advance_deductions_details", JSON.stringify(newDetails));
      payrollRecord.set("gross_salary", parseFloat(grossSalary.toFixed(2)));
      payrollRecord.set("net_salary", parseFloat(netSalary.toFixed(2)));
      payrollRecord.set("total_salary", parseFloat(netSalary.toFixed(2)));

      $app.save(payrollRecord);
      console.log("[sync-payroll] Successfully updated payroll record: " + payrollRecord.id + " (Net: " + netSalary + ")");
    } catch (err) {
      console.error("[sync-payroll] Error recalculating payroll: " + err.message);
    }
  };

  try {
    const record = e.record;
    const employeeId = record.getString("employee_id");
    const dateStr = record.getString("date") || record.getString("created") || new Date().toISOString();
    if (employeeId && dateStr) {
      const dateParts = dateStr.split(" ")[0].split("-");
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10);
      recalculatePayroll(employeeId, month, year);
    }
  } catch (err) {
    console.error("[sync-payroll-hook] advances event error: " + err.message);
  }
  e.next();
};

// Register triggers for attendance
onRecordAfterCreateSuccess(handleAttendanceEvent, "attendance");
onRecordAfterUpdateSuccess(handleAttendanceEvent, "attendance");
onRecordAfterDeleteSuccess(handleAttendanceEvent, "attendance");

// Register triggers for advances
onRecordAfterCreateSuccess(handleAdvanceEvent, "advances");
onRecordAfterUpdateSuccess(handleAdvanceEvent, "advances");
onRecordAfterDeleteSuccess(handleAdvanceEvent, "advances");
