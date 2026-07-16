import pb from './utils/pocketbaseClient.js';

async function main() {
  try {
    const employees = await pb.collection('employees').getFullList();
    console.log("--- EMPLOYEES ---");
    employees.forEach(emp => {
      console.log(`ID: ${emp.id}, Name: ${emp.name}, Salary Amount: ${emp.salary_amount}, Base Salary: ${emp.base_salary}, Position: ${emp.position}, Type: ${emp.employee_type}`);
    });

    const advances = await pb.collection('advances').getFullList();
    console.log("\n--- ADVANCES ---");
    advances.forEach(adv => {
      console.log(`ID: ${adv.id}, Employee: ${adv.employee_id}, Amount: ${adv.amount}, Remaining: ${adv.remaining_balance}, Status: ${adv.status}`);
    });

    const payroll = await pb.collection('payroll').getFullList();
    console.log("\n--- PAYROLL ---");
    payroll.forEach(p => {
      console.log(`ID: ${p.id}, Employee: ${p.employee_id}, Month: ${p.payroll_month}/${p.payroll_year}, Net: ${p.net_salary}, Status: ${p.payment_status}`);
    });

    const attendance = await pb.collection('attendance').getFullList();
    console.log("\n--- ATTENDANCE RECORDS COUNT ---", attendance.length);
  } catch (err) {
    console.error("Error inspecting DB:", err.message);
  }
}

main();
