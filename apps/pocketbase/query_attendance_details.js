import { DatabaseSync } from 'node:sqlite';

const dbPath = "C:/Users/Munna'/.gemini/antigravity/scratch/www.jaibhavanicargo.com/apps/pocketbase/pb_data/data.db";

try {
  const db = new DatabaseSync(dbPath);
  
  const attendanceQuery = db.prepare("SELECT * FROM attendance WHERE staff_member = 'k7jaz5lqellbxtb'");
  const attendance = attendanceQuery.all();
  console.log("Attendance Records for Dayanand:");
  console.log(attendance);

} catch (err) {
  console.error("Error reading database:", err);
}
