import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  const payrollQuery = db.prepare("SELECT * FROM payroll");
  const payrolls = payrollQuery.all();
  console.log("Payroll Records in DB:");
  console.log(payrolls);

  const employeesQuery = db.prepare("SELECT id, name, salary_amount, base_salary FROM employees");
  const employees = employeesQuery.all();
  console.log("\nEmployees in DB:");
  console.log(employees);

  const advancesQuery = db.prepare("SELECT id, employee_id, amount, status, remaining_balance FROM advances");
  const advances = advancesQuery.all();
  console.log("\nAdvances in DB:");
  console.log(advances);

} catch (err) {
  console.error("Error reading database:", err);
}
