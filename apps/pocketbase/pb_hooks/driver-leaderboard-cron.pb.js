/// <reference path="../pb_data/types.d.ts" />

function awardLeaderboardBonuses(targetMonth, targetYear) {
  try {
    console.log(`[leaderboard-cron] Awarding driver leaderboard bonuses for period: ${targetMonth}/${targetYear}...`);
    
    const monthStr = targetYear + "-" + String(targetMonth).padStart(2, '0');

    // 1. Fetch completed trip logs for this month
    const trips = $app.findRecordsByFilter(
      "trip_logs",
      "trip_status = 'Completed' && date >= {:monthStart} && date <= {:monthEnd}",
      "-date",
      5000,
      0,
      { 
        monthStart: monthStr + "-01 00:00:00",
        monthEnd: monthStr + "-31 23:59:59"
      }
    );

    // 2. Fetch accidents
    const accidents = $app.findRecordsByFilter(
      "driver_accident_reports",
      "accident_date >= {:monthStart} && accident_date <= {:monthEnd}",
      "",
      500,
      0,
      { 
        monthStart: monthStr + "-01 00:00:00",
        monthEnd: monthStr + "-31 23:59:59"
      }
    );

    // 3. Fetch fuel tracker
    const fuelLogs = $app.findRecordsByFilter(
      "fuel_tracker",
      "date >= {:monthStart} && date <= {:monthEnd}",
      "",
      2000,
      0,
      { 
        monthStart: monthStr + "-01 00:00:00",
        monthEnd: monthStr + "-31 23:59:59"
      }
    );

    const trucks = $app.findAllRecords("trucks");
    const employees = $app.findAllRecords("employees");

    // Perform mileage grouping
    const driverStats = {};
    trips.forEach(trip => {
      const driverName = trip.getString("driver_name");
      const truckNum = trip.getString("truck_number");
      const truckObj = trucks.find(t => t.getString("truck_number") === truckNum);
      const truckSize = truckObj?.getString("truck_size") || "24 FT";
      
      const driverObj = employees.find(e => e.getString("name") === driverName);
      if (!driverObj) return;

      const mileage = Number(trip.get("kms")) || 0;
      const key = `${driverObj.id}_${truckSize}`;

      if (!driverStats[key]) {
        driverStats[key] = {
          driverId: driverObj.id,
          driverName: driverObj.getString("name"),
          truckSize,
          mileage: 0,
          fuelDistance: 0,
          fuelLiters: 0,
          accidents: 0
        };
      }
      driverStats[key].mileage += mileage;
    });

    // Count accidents
    accidents.forEach(acc => {
      const driverId = acc.getString("employee_id");
      Object.keys(driverStats).forEach(key => {
        if (key.startsWith(driverId)) {
          driverStats[key].accidents += 1;
        }
      });
    });

    // Fuel efficiency
    fuelLogs.forEach(f => {
      const fTruckNum = f.getString("truck_number");
      const fDateStr = f.getString("date").substring(0, 10);
      
      const matchingTrip = trips.find(t => t.getString("truck_number") === fTruckNum && t.getString("date").substring(0, 10) === fDateStr);
      if (matchingTrip) {
        const driverName = matchingTrip.getString("driver_name");
        const driverObj = employees.find(e => e.getString("name") === driverName);
        const truckObj = trucks.find(t => t.getString("truck_number") === fTruckNum);
        const truckSize = truckObj?.getString("truck_size") || "24 FT";
        
        if (driverObj) {
          const key = `${driverObj.id}_${truckSize}`;
          if (driverStats[key]) {
            driverStats[key].fuelDistance += Number(f.get("distance_driven")) || 0;
            driverStats[key].fuelLiters += Number(f.get("liters")) || 0;
          }
        }
      }
    });

    // Filter eligibility
    const leaderboards = { '24 FT': [], '32 FT': [] };
    const CATEGORY_INCENTIVES = {
      '32 FT': 10000,
      '24 FT': 5000
    };
    const MIN_FUEL_THRESHOLD = 4.0;

    Object.values(driverStats).forEach(stat => {
      const fuelKml = stat.fuelLiters > 0 ? (stat.fuelDistance / stat.fuelLiters) : 999;
      const isEligible = stat.accidents === 0 && fuelKml >= MIN_FUEL_THRESHOLD;
      
      if (isEligible) {
        leaderboards[stat.truckSize].push({
          ...stat,
          fuelKml
        });
      }
    });

    // Award bonuses
    Object.keys(CATEGORY_INCENTIVES).forEach(size => {
      const list = leaderboards[size].sort((a, b) => b.mileage - a.mileage);
      if (list.length > 0) {
        const winner = list[0];
        const bonusAmount = CATEGORY_INCENTIVES[size];

        console.log(`[leaderboard-cron] Winner selected for Category ${size}: ${winner.driverName} (Mileage: ${winner.mileage} km)`);

        // Find or create payroll record for this driver
        let payrollRecord;
        try {
          payrollRecord = $app.findFirstRecordByFilter(
            "payroll",
            "employee_id_relation = {:employeeId} && payroll_month = {:month} && payroll_year = {:year}",
            { employeeId: winner.driverId, month: targetMonth, year: targetYear }
          );
        } catch (err) {
          // Create a new draft payroll record
          const payrollCol = $app.findCollectionByNameOrId("payroll");
          payrollRecord = new Record(payrollCol);
          payrollRecord.set("employee_id_relation", winner.driverId);
          payrollRecord.set("employee_id", winner.driverId);
          payrollRecord.set("employee_name", winner.driverName);
          payrollRecord.set("payroll_month", targetMonth);
          payrollRecord.set("payroll_year", targetYear);
          payrollRecord.set("payment_status", "pending");
          payrollRecord.set("status", "Draft");
          
          const driverObj = employees.find(e => e.id === winner.driverId);
          payrollRecord.set("base_salary", driverObj.getFloat("salary_amount") || driverObj.getFloat("base_salary") || 0);
        }

        // Write the bonus
        const baseVal = Number(payrollRecord.get("base_salary")) || 0;
        const currentBonus = Number(payrollRecord.get("trip_bonus")) || 0;
        const deduct = Number(payrollRecord.get("attendance_deduction")) || 0;
        const adv = Number(payrollRecord.get("driver_advances")) || 0;

        const newBonus = currentBonus + bonusAmount;
        const gross = baseVal - deduct + newBonus;
        const net = gross - adv;

        payrollRecord.set("trip_bonus", newBonus);
        payrollRecord.set("gross_salary", gross);
        payrollRecord.set("net_salary", net);
        payrollRecord.set("total_salary", net);
        payrollRecord.set("remarks", (payrollRecord.getString("remarks") || "") + ` Leaderboard Winner Category ${size} (+₹${bonusAmount}).`);

        $app.save(payrollRecord);
        console.log(`[leaderboard-cron] Successfully updated payroll record with bonus for ${winner.driverName}`);
      } else {
        console.log(`[leaderboard-cron] No eligible drivers found for Category ${size}`);
      }
    });

  } catch (globalErr) {
    console.error("[leaderboard-cron] Error in awardLeaderboardBonuses:", globalErr);
  }
}

// 1. Cron Job to fire at midnight on the last day of the month
cronAdd("driver_leaderboard_payroll_bonus", "59 23 28,29,30,31 * *", () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  if (tomorrow.getDate() === 1) {
    awardLeaderboardBonuses(today.getMonth() + 1, today.getFullYear());
  }
});

// 2. HTTP POST Trigger Route for manual run/testing
routerAdd("POST", "/api/custom/leaderboard/evaluate", (e) => {
  const today = new Date();
  awardLeaderboardBonuses(today.getMonth() + 1, today.getFullYear());
  return e.json(200, { success: true, message: "Leaderboard evaluation completed and bonuses synced to payroll." });
});
